using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Models;
using MyChat.Repositories.IRepository;
using MyChat.ViewModels.Contact;

namespace MyChat.Repositories
{
    public class ContactRepository: IContactRepository
    {
        private readonly ApplicationDbContext _context;
        public ContactRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public void AddContact(Contact contact)
        {
            _context.Contacts.Add(contact);
        }

        public async Task<Contact> GetContact(string ownerId, string contactId)
        {
            return await _context.Contacts
                        .FirstOrDefaultAsync(x => 
                                             x.ContactOwnerId == ownerId && 
                                             x.ContactPersonId == contactId);
        }

        public async Task<IEnumerable<Contact>> GetContacts(string contactOwnerId)
        {
            var contactLists = await _context.Contacts
                                                    .Where(x => 
                                                                x.ContactOwnerId == contactOwnerId && 
                                                                x.ContactPersonId != contactOwnerId)
                                                    .OrderBy(x => x.ContactAddedDate)
                                                    .ToListAsync();

            return contactLists;
        }

        public void UpdateContact(Contact contact)
        {
            throw new NotImplementedException();
        }

        public void RemoveContact(Contact contact)
        {
            _context.Contacts.Remove(contact);
        }
        
    }
}