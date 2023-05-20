using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels
{
    public class InitialMessagePayload
    {
        public string SenderId { get; set; }
        public string SenderUsername { get; set; }
        public string RecipientId { get; set; }
        public string RecipientUsername { get; set; }
    }
}