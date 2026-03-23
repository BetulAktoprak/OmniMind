using Microsoft.AspNetCore.Mvc;

namespace OmniMind.WebApi.Abstractions;
[Route("api/[controller]/[action]")]
[ApiController]
public abstract class ApiController : ControllerBase
{
}
