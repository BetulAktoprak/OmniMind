using Microsoft.AspNetCore.Authentication.JwtBearer;
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

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("dev", p =>
        p.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod());
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

app.UseSwagger();
app.UseSwaggerUI();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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

app.UseCors("dev");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
