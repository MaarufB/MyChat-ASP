using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyChat.Models;

namespace MyChat.Data
{
    public class ApplicationDbContext: IdentityDbContext<AppIdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options):base(options){}

        public DbSet<DummyMessage> DummyMessages { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        // public override DbSet<AppIdentityUser> Users { get; set; }
    }
}