using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Models
{
    public class Messaging
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString(); 
        public string SenderId { get; set; }
        public string SenderUsername { get; set; }
        public AppIdentityUser Sender { get; set; }
        public string RecipientId { get; set; }
        public string RecipientUsername { get; set; }
        public AppIdentityUser Recipient { get; set; }
        public string Content { get; set; }
        public DateTime MessageSentDate { get; set; } = DateTime.UtcNow;
    }
}