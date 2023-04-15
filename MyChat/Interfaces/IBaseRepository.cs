using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyChat.Interfaces
{
    public interface IBaseRepository<T>
    {
        Task<int> CreateAsync(T t);
        Task<T> GetOneAsync(object id);
        Task<IEnumerable<T>> GetAllAsync();
        Task Update(object id, object model);
        Task Delete(object id);
    }
}