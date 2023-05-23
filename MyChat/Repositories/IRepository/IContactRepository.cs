using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.Models;
using MyChat.ViewModels.Contact;

namespace MyChat.Repositories.IRepository
{
    public interface IContactRepository
    {
        void AddContact(Contact contact);
        Task<IEnumerable<Contact>> GetContacts(string contactOwnerId);
        Task<Contact> GetContact(string ownerId, string contactId);
        void UpdateContact(Contact contact);
        void RemoveContact(Contact contact);

    }
}