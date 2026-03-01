using Microsoft.AspNetCore.Mvc;
using SafecoreApi.Data;

namespace SafecoreApi.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDashboard()
        {
            var total = _context.Cases.Count();
            var active = _context.Cases.Count(x => x.Status == "Active");
            var process = _context.Cases.Count(x => x.Status == "In Process");
            var closed = _context.Cases.Count(x => x.Status == "Closed");

            return Ok(new
            {
                totalCases = total,
                activeCases = active,
                inProcess = process,
                closedCases = closed
            });
        }
    }
}
