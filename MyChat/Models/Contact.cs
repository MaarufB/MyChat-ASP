using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Models
{
    public class Contact
    {
        public int Id { get; set; }
        public string ContactOwnerId { get; set; }
        public string ContactOwnerUsername { get; set; }
        public AppIdentityUser ContactOwner { get; set; }
        public string ContactPersonId { get; set; }
        public string ContactPersonUsername { get; set; }
        public AppIdentityUser ContactPerson { get; set; }
        public DateTime ContactAddedDate { get; set; } = DateTime.UtcNow;
    }
}