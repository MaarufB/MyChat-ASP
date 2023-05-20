using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels.Contact
{
    public class LoadContactVM
    {
        public string Id { get; set; }
        public string CurrentUserId { get; set; }
        public string CurrentUsername { get; set; }
        public string ContactId { get; set; }
        public string ContactUsername { get; set; }
        public bool OnContactList { get; set; } = true;
    }
}