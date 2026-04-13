using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OmniMind.Application;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Features.Journal.Options;
using OmniMind.Infrastructure;
using OmniMind.Infrastructure.Persistence.Context;
using OmniMind.WebApi;
using OmniMind.WebApi.Middlewares;
using OmniMind.WebApi.Services.Auth;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// WebApi csproj UserSecretsId — top-level Program yerine açık assembly işaretçisi kullan.
builder.Configuration.AddUserSecrets<UserSecretsAssemblyMarker>();

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<OmniMindDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<OmniMindDbContext>());

if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5068");
}
else
{
    builder.WebHost.UseUrls("http://0.0.0.0:8080");
}

builder.Services.Configure<JournalAiRateLimitOptions>(
    builder.Configuration.GetSection(JournalAiRateLimitOptions.SectionName));

builder.Services.AddApplication();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Render / ters proxy: gerçek istemci IP ve şema (rate limit + HTTPS yönlendirme için)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var corsOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("omnimind", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            return;
        }

        // Native mobil isteklerde Origin genelde yok → CORS devreye girmez; web istemcileri için köken listesi.
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                    return true;
                return corsOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin." },
            cancellationToken);
    };

    static RateLimitPartition<string> AuthFixedWindow(HttpContext httpContext, string policyKey) =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"{policyKey}:{AuthRatePartitionKey(httpContext)}",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            });

    options.AddPolicy("auth-login", ctx => AuthFixedWindow(ctx, "login"));
    options.AddPolicy("auth-register", ctx => AuthFixedWindow(ctx, "register"));
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var issuer = jwtSection["Issuer"];
var audience = jwtSection["Audience"];
var key = jwtSection["Key"];
if (string.IsNullOrWhiteSpace(key))
{
    throw new InvalidOperationException(
        "Jwt:Key boş. OmniMind.WebApi klasöründe çalıştırın:\n" +
        "  dotnet user-secrets set \"Jwt:Key\" \"<en az ~32 karakter güçlü bir metin>\"\n" +
        "Mevcut sırları görmek için: dotnet user-secrets list");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,

            ValidateAudience = true,
            ValidAudience = audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

var app = builder.Build();

// Üretimde API yüzeyini ve şema sızıntısını önlemek için yalnızca Development.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<OmniMindDbContext>();
    db.Database.Migrate();
}
catch (Exception ex)
{
    Console.WriteLine("Migration error: " + ex.Message);
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseRouting();

app.UseCors("omnimind");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static string AuthRatePartitionKey(HttpContext httpContext)
{
    var ip = httpContext.Connection.RemoteIpAddress?.ToString();
    if (!string.IsNullOrEmpty(ip))
        return ip;

    var xff = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    if (!string.IsNullOrEmpty(xff))
        return xff.Split(',')[0].Trim();

    return "unknown";
}
