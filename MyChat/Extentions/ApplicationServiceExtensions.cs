using Microsoft.EntityFrameworkCore;
using MyChat.Data;
using MyChat.Repositories;
using MyChat.Repositories.IRepository;

namespace MyChat.Extentions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
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