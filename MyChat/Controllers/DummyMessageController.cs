
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MyChat.Interfaces;
using MyChat.Models;
using MyChat.ViewModels;

namespace MyChat.Controllers
{
    [Authorize]
    public class DummyMessageController : BaseController
    {
        private readonly UserManager<AppIdentityUser> _userManager;
        private readonly IBaseRepository<DummyMessage> _repo;
        public DummyMessageController(
            UserManager<AppIdentityUser> userManager,
            IBaseRepository<DummyMessage> repo)
        {
            _userManager = userManager;
            _repo = repo;
        }

        public ActionResult Index()
        {
            var users = _userManager.Users.ToList();
            ViewBag.Recipient = new SelectList(users);
            
            return View(users);
        }

        [HttpGet, ActionName("CreateMessage")]
        public async Task<ActionResult> CreateMessage(string id)
        {
            var otherUser = _userManager.Users
                                    .Where(i => i.Id == id)
                                    .FirstOrDefault();

            if(otherUser == null)
            {
                
                return RedirectToAction($"Message");
            }

            var claims = (ClaimsIdentity)User.Identity;
            var claimsUser = claims.FindFirst(ClaimTypes.NameIdentifier);
    
            var currentUser = await _userManager.Users
                                    .Where(i=> i.Id == claimsUser.Value)
                                    .FirstOrDefaultAsync();

            var createMessage = new CreateMessageViewModel
            {
                RecipientUsername = otherUser.UserName,
                RecipientId = otherUser.Id,
                SenderUsername = currentUser.UserName,
                SenderId = currentUser.Id,
                GroupName = NormalizeGroupName(currentUser.UserName, otherUser.UserName)
            };

            Console.WriteLine($"GroupName: {currentUser.UserName}");
            return View(createMessage);
        }

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

        #region API CALLS
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

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessagePayload payload)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(payload);
            }

            var otherUser = await _userManager.Users.Where(i => i.Id == payload.RecipientId).FirstOrDefaultAsync();


            var sender = await _userManager.Users.Where(i => i.Id == payload.SenderId).FirstOrDefaultAsync();

            var createMessage = new DummyMessage
            {
                SenderId = payload.SenderId,
                SenderUsername = payload.SenderUsername,
                Sender = sender,
                RecipientId = payload.RecipientId,
                RecipientUsername = payload.RecipientUsername,
                Recipient = otherUser,
                Content = payload.MessageContent
            };

            var result = await _repo.CreateAsync(createMessage);

            if(result == 0) return BadRequest(payload);

            return Ok(payload);
        }

        #endregion
    }
}