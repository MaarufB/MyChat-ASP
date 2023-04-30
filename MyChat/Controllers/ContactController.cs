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
using MyChat.Models;
using MyChat.ViewModels.ContactViewModel;

namespace MyChat.Controllers
{
    [Authorize]
    // [Route("[controller]/[action]")]
    public class ContactController : BaseController
    {
        private readonly UserManager<AppIdentityUser> _userManager;
        public ContactController(UserManager<AppIdentityUser> userManager)
        {
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
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