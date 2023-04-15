using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; }
        public AppIdentityUser Sender { get; set; }
        public AppIdentityUser Recipient { get; set; }
        public string MessageBody { get; set; } 
        public DateTime MessageSent { get; set; } = DateTime.UtcNow;
        public DateTime MessageSeen { get; set; }
        public bool IsSeen { get; set; }
        public bool IsDeleted { get; set; }
    }
}