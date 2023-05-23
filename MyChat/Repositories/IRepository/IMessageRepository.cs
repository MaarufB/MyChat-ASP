using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.Models;

namespace MyChat.Repositories.IRepository
{
    public interface IMessageRepository
    {
        Task<IEnumerable<Message>> GetMessageThread(AppIdentityUser sender, AppIdentityUser recipient);
        void AddMessage(Message message);
    }
}