using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyChat.Models;
using MyChat.Repositories.IRepository;
using MyChat.ViewModels;

namespace MyChat.Controllers
{
    [Authorize]
    public class MessageController : BaseController
    {
        private readonly IUnitOfWork _unitOfWork;

        public MessageController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
        [Route("message/load-messages/{id}")]
        public async Task<ActionResult<List<MessageViewModel>>> LoadMessage(string id)
        {
            var recipient = await _unitOfWork.UserRespository.GetUserByIdAsync(id);
            if(recipient == null)
            {
                return NotFound();
            }
    
            var sender = await _unitOfWork.UserRespository.GetCurrentUserAsync();
            var messages = await _unitOfWork.MessageRepository.GetMessageThread(sender, recipient);

            var messageThread = new List<MessageViewModel>();                                    
            
            foreach(var message in messages)
            {
                var messageList = new MessageViewModel
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
        [Route("message/get-groupname/{id}")]
        public async Task<ActionResult<GroupNameVM>> GetGroupName(string id)
        {
            if(string.IsNullOrEmpty(id)){
                throw new Exception("RecipientId is null");
            }

            var currentUser = await _unitOfWork.UserRespository.GetCurrentUserAsync();
            var otherUser = await _unitOfWork.UserRespository.GetUserByIdAsync(id);

            var groupName = new GroupNameVM
            {
                GroupName = NormalizeGroupName(currentUser.UserName, otherUser.UserName)
            };

            return groupName;
        }

        [HttpGet, ActionName("initial-message-payload")]
        public async Task<ActionResult> InitialMessagePayload(string id)
        {
 
            var otherUser = await _unitOfWork.UserRespository.GetUserByIdAsync(id);
            var currentUser = await _unitOfWork.UserRespository.GetCurrentUserAsync();


            var initialPayload = new InitialMessagePayload
            {
                SenderId = currentUser.Id,
                SenderUsername = currentUser.UserName,
                RecipientId = otherUser.Id,
                RecipientUsername = otherUser.UserName
            };
            
            return Ok(initialPayload);
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

    }
}