using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Models
{
    public class Contacts
    {
        public string ContactId { get; set; }
        public string ContactUserName { get; set; }
        public string ContactOwnerId { get; set; }
        public string ContactOwnerUserName { get; set; }
    }
}