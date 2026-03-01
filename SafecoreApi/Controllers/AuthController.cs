using Microsoft.AspNetCore.Mvc;
using SafecoreApi.Data;
using SafecoreApi.Models;
using SafecoreApi.Services;
using System.Linq;

namespace SafecoreApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _email;

        public AuthController(AppDbContext context, EmailService email)
        {
            _context = context;
            _email = email;
        }

        // 🔥 REGISTER + RESEND PASSWORD
        [HttpPost("register")]
        public IActionResult Register(RegisterModel model)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == model.Email);

            // 🔐 new password generate
            var password = Guid.NewGuid().ToString().Substring(0, 8);

            if (user == null)
            {
                // 🆕 new user
                User newUser = new User()
                {
                    Name = model.Name,
                    Email = model.Email,
                    Gst = model.Gst,
                    Mobile = model.Mobile,
                    Password = password
                };

                _context.Users.Add(newUser);
            }
            else
            {
                // 🔁 already exist → password update
                user.Password = password;
                user.Name = model.Name;
                user.Gst = model.Gst;
                user.Mobile = model.Mobile;
                // coomit this my first 
            }

            _context.SaveChanges();

            // 📧 EMAIL SEND (REAL)
            _email.SendEmail(model.Email, password);

            return Ok(new { message = "Password sent to email" });
        }

        // 🔥 LOGIN
        [HttpPost("login")]
        public IActionResult Login(LoginModel model)
        {
            var user = _context.Users
                .FirstOrDefault(x => x.Email == model.Email && x.Password == model.Password);

            if (user == null)
                return Unauthorized("Invalid email or password");

            return Ok(new
            {
                message = "Login success",
                name = user.Name,
                token = "abc123"
            });
        }
    }
}
