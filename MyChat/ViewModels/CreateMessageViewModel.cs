using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.Models;

namespace MyChat.ViewModels
{
    public class CreateMessageViewModel
    {
        public string SenderId { get; set; }
        public string SenderUsername { get; set; }
        public string RecipientId { get; set; }
        public string RecipientUsername { get; set; }
        public string MessageContent { get; set; }
        public List<DummyMessage> MessageThread { get; set; }
    }
}