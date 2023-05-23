using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Models;
using MyChat.Repositories.IRepository;

namespace MyChat.Repositories
{
    public class MessagingRepository : IMessagingRepository
    {
        private readonly ApplicationDbContext _context;
        public MessagingRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Message>> GetMessageThread(AppIdentityUser sender, AppIdentityUser recipient)
        {
            var messages = await _context.Messages
                .Where(x => (x.RecipientUsername == recipient.UserName && x.SenderUsername == sender.UserName) 
                         || (x.SenderUsername == recipient.UserName && x.RecipientUsername == sender.UserName))
                .OrderBy(x => x.MessageSentDate).ToListAsync();

            return messages;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }
    }
}