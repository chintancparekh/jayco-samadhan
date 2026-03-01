using System.Net;
using System.Net.Mail;

namespace SafecoreApi.Services
{
    public class EmailService
    {
        public void SendEmail(string toEmail, string password)
        {
            var fromEmail = "riy20a032003@gmail.com";   // tamaro email
            var appPassword = "dvqg plld akcj aogs";      // gmail app password

            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, appPassword),
                EnableSsl = true,
            };

            var message = new MailMessage(fromEmail, toEmail)
            {
                Subject = "Your Login Password",
                Body = $"Your new password is: {password}",
                IsBodyHtml = true
            };

            smtp.Send(message);
        }
    }
}
