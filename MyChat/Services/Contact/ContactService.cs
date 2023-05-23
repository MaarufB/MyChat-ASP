using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.ViewModels.Contact;

namespace MyChat.Services.Contact
{
    public class ContactService : IContactService
    {
        public Task<ContactViewModel> AddContact()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ContactViewModel>> GetContacts()
        {
            throw new NotImplementedException();
        }
    }
}