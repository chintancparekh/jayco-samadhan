using System.ComponentModel.DataAnnotations;

namespace SafecoreApi.Models
{
    public class User
    {
      
        public int Id { get; set; }

        public string Name { get; set; }
        public string Email { get; set; }
        public string Gst { get; set; }
        public string Mobile { get; set; }
        public string Password { get; set; }
    }
}
