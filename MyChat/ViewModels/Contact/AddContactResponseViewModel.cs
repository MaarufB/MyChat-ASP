using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.ViewModels.Contact
{
    public class AddContactResponseViewModel
    {
        public string AddedContactId { get; set; }
        public bool IsSuccess { get; set; } = false;
    }
}