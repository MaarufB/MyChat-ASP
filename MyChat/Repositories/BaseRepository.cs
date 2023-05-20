using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Interfaces;

namespace MyChat.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly DbContext _db;
        private readonly DbSet<T> _table;
        public BaseRepository(ApplicationDbContext db)
        {
            _db = db;
            _table = db.Set<T>();
        }
        public async Task<int> CreateAsync(T t)
        {
            await _table.AddAsync(t);
            return await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _table.ToListAsync();
        }

        public async Task<T> GetOneAsync(object id)
        {
            return await _table.FindAsync(id);
        }
        public async Task Delete(object id)
        {
            var t = await GetOneAsync(id);

            if (t != null)
            {
                _db.Remove(t);
                await _db.SaveChangesAsync();
            }
        }

        public async Task Update(object id, object model)
        {
            var t = await GetOneAsync(id);

            if (t != null)
            {
                _db.Entry(t).CurrentValues.SetValues(model);
                await _db.SaveChangesAsync();
            
            }
        }
    }
}