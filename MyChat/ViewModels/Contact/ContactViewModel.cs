using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels.Contact
{
    public class ContactViewModel
    {
        public string Id { get; set; }
        [Required]
        public string CurrentUserId { get; set; }
        public string CurrentUsername { get; set; }
        public string ContactId { get; set; }
        [Required]
        public string ContactUsername { get; set; }
        public bool OnContactList { get; set; } = true;
    }
}