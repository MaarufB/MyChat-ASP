using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Models
{
    public class Messaging
    {
        public int Id { get; set; }
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