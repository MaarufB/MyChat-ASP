using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyChat.Data;
using MyChat.Repositories.IRepository;

namespace MyChat.Repositories
{
    public class UnitOfWork: IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContext;
        public UnitOfWork(ApplicationDbContext context, 
                          IHttpContextAccessor httpContext)
        {
            _context = context;
            _httpContext = httpContext;
        }
        
        public IUserRepository UserRespository => new UserRepository(_context, _httpContext);
        public IContactRepository ContactRepository => new ContactRepository(_context);
        public IMessagingRepository MessagingRepository => new MessagingRepository(_context);
    
        public async Task<bool> Complete()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public bool HasChanges()
        {
            _context.ChangeTracker.DetectChanges();
            var changes = _context.ChangeTracker.HasChanges();

            return changes;
        }
    }
}