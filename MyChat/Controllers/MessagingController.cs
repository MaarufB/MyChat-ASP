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
using MyChat.ViewModels;
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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
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

            foreach (var convo in getDistinctUser)
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

        [HttpGet]
        public async Task<ActionResult<List<LoadMessageViewModel>>> LoadMessage(string id)
        {
            var otherUser = _userManager.Users
                                    .Where(i => i.Id == id)
                                    .FirstOrDefault();

            if(otherUser == null)
            {
                return NotFound();
            }

            var claims = (ClaimsIdentity)User.Identity;
            var claimsUser = claims.FindFirst(ClaimTypes.NameIdentifier);
    
            var currentUser = await _userManager.Users
                                    .Where(i=> i.Id == claimsUser.Value)
                                    .FirstOrDefaultAsync();


            var messages = await _repo.GetAllAsync();
      
            var messagesOrderByDate = messages.Where(x => (x.RecipientUsername == otherUser.UserName && 
                                                          x.SenderUsername == currentUser.UserName) ||
                                                          (x.SenderUsername == otherUser.UserName && 
                                                          x.RecipientUsername == currentUser.UserName))
                                                        .OrderBy(x => x.MessageSentDate).ToList();
            
            var messageThread = new List<LoadMessageViewModel>();                                    
            
            foreach(var message in messagesOrderByDate)
            {
                var messageList = new LoadMessageViewModel
                {
                    SenderId = message.SenderId,
                    SenderUsername = message.SenderUsername,
                    RecipientId = message.RecipientId,
                    RecipientUsername = message.RecipientUsername,
                    MessageContent = message.Content,
                };

                messageThread.Add(messageList);
            }

            return Ok(messageThread);
        }

        [HttpGet]
        // [AllowAnonymous]
        public async Task<ActionResult<GroupNameVM>> GetGroupName(string id)
        {
            Console.WriteLine($"RecipientId: {id}");
            if(string.IsNullOrEmpty(id)){
                throw new Exception("RecipientId is null");
            }

            var currentUser = await GetCurrentUser();
            var otherUser = await _userManager.Users
                                .Where(i => i.Id == id)
                                .FirstOrDefaultAsync();

            // var groupName = NormalizeGroupName(currentUser.UserName, otherUser.UserName);

            var groupName = new GroupNameVM
            {
                GroupName = NormalizeGroupName(currentUser.UserName, otherUser.UserName)
            };

            return groupName;
        }

        [HttpGet]
        public async Task<object> InitialMessagingPayload(string id)
        {
            var otherUser = _userManager.Users
                                    .Where(i => i.Id == id)
                                    .FirstOrDefault();

            var currentUser = await GetCurrentUser();
            
            return new 
            {
                SenderId = currentUser.Id,
                SenderUsername = currentUser.UserName,
                RecipientId = otherUser.Id,
                RecipientUsername = otherUser.UserName
            };
        }


        #endregion
        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }

        private string NormalizeGroupName(string sender, string recipient)
        {
            var messageSender = string.Empty;
            var messageRecipient = string.Empty;

            if (sender.Contains("@") || recipient.Contains("@"))
            {
                messageSender = sender.Split("@")[0];
                messageRecipient = recipient.Split("@")[0];
            }

            return GetGroupName(messageSender, messageRecipient);
        }

        private async Task<AppIdentityUser> GetCurrentUser()
        {
            var claims = (ClaimsIdentity)User.Identity;
            var claimUser = claims.FindFirst(ClaimTypes.NameIdentifier);
            var currentUser = await _userManager.Users
                                .Where(u => u.Id == claimUser.Value)
                                // .Where(u => u.UserName == "user1@gmail.com")
                                .FirstOrDefaultAsync();

            return currentUser;
        }
    }
}