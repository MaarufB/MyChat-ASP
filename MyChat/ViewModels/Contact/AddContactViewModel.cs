using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MyChat.ViewModels.Contact
{
    public class AddContactViewModel
    {
        [JsonPropertyName("contactId")]
        public string ContactId { get; set; }
    }
}