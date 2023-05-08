using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyChat.Interfaces;
using MyChat.Models;
using MyChat.ViewModels.Contact;
using MyChat.ViewModels.ContactViewModel;

namespace MyChat.Controllers
{
    [Authorize]
    public class ContactController : BaseController
    {
        private readonly UserManager<AppIdentityUser> _userManager;
        private readonly IBaseRepository<Contact> _contactRepository;
        
        public ContactController(UserManager<AppIdentityUser> userManager,
                                 IBaseRepository<Contact> contactRepository)
        {
            _userManager = userManager;
            _contactRepository = contactRepository;
        }

        public async Task<IActionResult> Index()
        {
            var currentUser = await GetCurrentUser();
            var getAllUsers = await _userManager.Users.Where(x => x.Id != currentUser.Id).ToListAsync();
            
            var listOfUser = new List<ContactViewModel>();

            foreach(var item in getAllUsers)
            {
                listOfUser.Add(new ContactViewModel
                {
                    UserId = item.Id,
                    Username = item.UserName
                });
            }

            return View(listOfUser);
        }

        [HttpPost]
        public IActionResult Search(string userName)
        {
            
            return View(new {ContactName = ""});
        }


    #region API
        [HttpGet, ActionName("load-contacts")]
        public async Task<ActionResult<IEnumerable<ContactCustomVM>>> LoadContacts()
        {
            var currentUser = await GetCurrentUser();

            var contacts = await _userManager.Users
                                                    .Where(u => u.Id != currentUser.Id)
                                                    .OrderBy(u => u.UserName)
                                                    .ToListAsync();

            var customContactList = new List<ContactCustomVM>();
            
            foreach(var contact in contacts)
            {
                customContactList.Add(
                    new ContactCustomVM {
                        ContactId = contact.Id,
                        Username = contact.UserName
                    }
                );
            }

            return Ok(customContactList);
        }

        #endregion

        private async Task<AppIdentityUser> GetCurrentUser()
        {
            var claims = (ClaimsIdentity)User.Identity;
            var claimUser = claims.FindFirst(ClaimTypes.NameIdentifier);
            var currentUser = await _userManager.Users
                                .Where(u => u.Id == claimUser.Value)
                                .FirstOrDefaultAsync();

            return currentUser;
        }


    }
}