using Microsoft.AspNetCore.Mvc;

namespace MyChat.Controllers
{
    public class AppUserControllers : BaseController
    {
        private readonly ILogger<AppUserControllers> _logger;

        public AppUserControllers(ILogger<AppUserControllers> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }
    }
}