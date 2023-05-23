using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Repositories.IRepository
{
    public interface IUnitOfWork
    {
        IUserRepository UserRespository { get; }
        IContactRepository ContactRepository { get; }
        IMessageRepository MessageRepository { get; }
        Task<bool> Complete();
        bool HasChanges();
    }
}