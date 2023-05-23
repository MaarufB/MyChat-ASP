using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Models;
using MyChat.Repositories.IRepository;

namespace MyChat.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserRepository(ApplicationDbContext context, IHttpContextAccessor httpContext)
        {
            _context = context;
            _httpContextAccessor = httpContext;
        }

        public async Task<AppIdentityUser> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                         .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<AppIdentityUser> GetUserByIdAsync(string id)
        {
            return await _context.Users
                        .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<AppIdentityUser>> GetUsersAsync()
        {
            return await _context.Users
                        .ToListAsync(); 
        }

        public async Task<AppIdentityUser> GetCurrentUserAsync()
        {
            var userId = _httpContextAccessor.HttpContext?.User
                        .FindFirstValue(ClaimTypes.NameIdentifier);

            return await GetUserByIdAsync(userId);

        }
    }
}