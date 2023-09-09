using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Repositories;
using MyChat.Repositories.IRepository;
using MyChat.Services.Contact;
using MyChat.Services.Messaging;
using MyChat.Services.User;

namespace MyChat.Extentions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IContactService, ContactService>();
            services.AddScoped<IMessageService, MessageService>();
            
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                var connStr = config.GetConnectionString("DefaultConnection");
                options.UseSqlServer(connStr);
            });
            
            services.AddDatabaseDeveloperPageExceptionFilter();
            services.AddControllersWithViews();
            services.AddSignalR();
            
            return services;
        }
    }
}