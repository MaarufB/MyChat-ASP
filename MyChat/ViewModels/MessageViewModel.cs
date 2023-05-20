using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels
{
    public class MessageViewModel
    {
        public string SenderId { get; set; }
        [Required]
        public string SenderUsername { get; set; }
        [Required]
        public string RecipientId { get; set; }
        public string RecipientUsername { get; set; }
        public string MessageContent { get; set; }
    }
}