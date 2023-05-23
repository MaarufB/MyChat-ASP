using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.Models;
using MyChat.ViewModels.Account;

namespace MyChat.Repositories.IRepository
{
    public interface IUserRepository
    {
        Task<AppIdentityUser> GetUserByEmailAsync(string email);
        Task<IEnumerable<AppIdentityUser>> GetUsersAsync();
        Task<AppIdentityUser> GetUserByIdAsync(string id);
        Task<AppIdentityUser> GetCurrentUserAsync();
         
    }
}