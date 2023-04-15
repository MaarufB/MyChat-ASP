using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels
{
    public class MessageViewModel
    {
        public int MessageId { get; set; }
        public string MessageSender { get; set; }
        public string MessageReciever { get; set; }
        public string MessageContent { get; set; }
        public DateTime MessageDelivered { get; set; }
    }
}