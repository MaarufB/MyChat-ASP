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
using MyChat.ViewModels.MessagingViewModel;

namespace MyChat.Controllers
{
    [Authorize]
    public class MessagingController : BaseController
    {

        private readonly UserManager<AppIdentityUser> _userManager; 
        // private readonly IBaseRepository<Messaging> _repo;
        private readonly IBaseRepository<DummyMessage> _repo;

        private readonly IBaseRepository<AppIdentityUser> _userRepo;

        public MessagingController(
            UserManager<AppIdentityUser> userManager,
            // IBaseRepository<Messaging> repo,
            IBaseRepository<DummyMessage> repo,
            IBaseRepository<AppIdentityUser> userRepo
        )
        {
            _userManager = userManager;
            _repo = repo;
            _userRepo = userRepo;
        }

        public ActionResult Index()
        {

            return View();
        }

        #region API CALLS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetContactVM>>> GetContacts()
        {
            // Get the contacts
            // Put the data to the view model
            // Include the recent message in the convo
            var contactList = new List<GetContactVM>();
            var currentUser = await GetCurrentUser();
            var contactConvo = await _repo.GetAllAsync();

            var getDistinctUser = contactConvo.Where(u => 
                                                    (u.SenderId == currentUser.Id && u.RecipientId != currentUser.Id) ||
                                                    (u.SenderId != currentUser.Id && u.RecipientId == currentUser.Id))
                                                    .OrderBy(o => o.MessageSentDate)
                                                    .GroupBy(u => u.SenderId)
                                                    .ToList();

            Console.WriteLine($"DistictUserLenght: {getDistinctUser.Count()}");

            foreach(var convo in getDistinctUser)
            {
                
                var uniqueUser = convo.LastOrDefault();
                var recentConvo = new GetContactVM
                {
                    SenderId = uniqueUser.SenderId,
                    SenderUsername = uniqueUser.SenderUsername,
                    RecipientId = uniqueUser.RecipientId,
                    RecipientUsername = uniqueUser.RecipientUsername,
                    RecentMessage = uniqueUser.Content
                };

                contactList.Add(recentConvo);
            }

            return Ok(contactList);
        
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