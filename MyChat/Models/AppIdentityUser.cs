using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace MyChat.Models
{
    public class AppIdentityUser: IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MobileNumber { get; set; }
    }
}