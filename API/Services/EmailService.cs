using System.Net;
using System.Net.Mail;

namespace API.Services
{
    public interface IEmailService
    {
        Task SendPasswordEmailAsync(string email, string userName, string password);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendPasswordEmailAsync(string email, string userName, string password)
        {
            try
            {
                var smtpServer = _config["Email:SmtpServer"];
                var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
                var senderEmail = _config["Email:SenderEmail"];
                var senderPassword = _config["Email:SenderPassword"];
                var senderName = _config["Email:SenderName"] ?? "HR Management System";
                var testEmailOverride = _config["Email:TestEmailOverride"];

                var recipientEmail = string.IsNullOrEmpty(testEmailOverride) ? email : testEmailOverride;

                using (var client = new SmtpClient(smtpServer, smtpPort))
                {
                    client.EnableSsl = smtpPort != 25;
                    client.Credentials = new NetworkCredential(senderEmail, senderPassword);

                    var subject = "Ο κωδικός σας για το HR Management System";
                    var body = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif;'>
                            <h2>Καλώς ήρθατε στο HR Management System</h2>
                            <p>Γεια σας!</p>
                            <p>Ο λογαριασμός σας έχει δημιουργηθεί με επιτυχία.</p>
                            <p><strong>Στοιχεία σύνδεσης:</strong></p>
                            <ul>
                                <li><strong>Username:</strong> {userName}</li>
                                <li><strong>Password:</strong> {password}</li>
                            </ul>
                            <p>Παρακαλώ αλλάξτε τον κωδικό σας κατά την πρώτη σύνδεση.</p>
                            <p>Με εκτίμηση,<br/>HR Management System</p>
                        </body>
                        </html>
                    ";

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail!, senderName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(recipientEmail);

                    await client.SendMailAsync(mailMessage);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                throw;
            }
        }
    }
}
