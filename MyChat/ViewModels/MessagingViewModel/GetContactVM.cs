using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels.MessagingViewModel
{
    public class GetContactVM
    {
        public string SenderId { get; set; }
        public string SenderUsername { get; set; }
        public string RecipientId { get; set; }
        public string RecipientUsername { get; set; }
        public string RecentMessage { get; set; }
    }
}