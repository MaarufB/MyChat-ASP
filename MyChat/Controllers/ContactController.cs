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
        
        [HttpPost]
        [Route("messaging/add-contact")]
        public async Task<IActionResult> AddContact(AddContactViewModel contactPayload)
        {       
            // var currentUser = await GetCurrentUser();

            // var contact = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == contactPayload.ContactId);

            // var contactAdded = new Contact
            // {
            //     ContactOwnerId = currentUser.Id,
            //     ContactOwnerUsername = currentUser.UserName,
            //     ContactOwner = currentUser,
            //     ContactPersonId = contact.Id,
            //     ContactPersonUsername = contact.UserName,
            //     ContactPerson = contact
            // };

            // var isSuccess = await _contactRepository.CreateAsync(contactAdded);
            
            // if(isSuccess < 1) return BadRequest();

            // var addContactResponse = new AddContactResponseViewModel
            // {
            //     AddedContactId = contactAdded.ContactPersonId,
            //     IsSuccess = true
            // };

            // Test API
            var addContactTest = new AddContactResponseViewModel
            {
                AddedContactId = contactPayload.ContactId,
                IsSuccess = true
            };

            return Ok(addContactTest);
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