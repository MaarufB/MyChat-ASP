using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using MyChat.Models;
using MyChat.Repositories.IRepository;
using MyChat.ViewModels;

namespace MyChat.Hubs
{

    public interface IClient
    {
        Task<string> GetMessage();
        Task ReceiveMessage(string user, string message);

    }
    //public class ChatHub: Hub<IClient>
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // public override async Task OnConnectedAsync()
        // {
        //     var httpContext = Context.GetHttpContext();
        //     var testContext = httpContext.Request;
        //     var otherUser = httpContext.Request.Query["user"];
            

        //     var contextConnectionId = Context.ConnectionId;
        //     Console.WriteLine($"ConnectionId: {contextConnectionId}");
            
            
        //     // await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
        //     await base.OnConnectedAsync();
        
        // }
        
        private async Task AddToGroupAsync(string groupName)
        {
            string user = Context.User.Identity.Name;
            var userName = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userName}");
            await base.OnConnectedAsync();
        }


        private async Task<bool> SaveMessageAsync(MessageViewModel payload)
        {
            var recipient = await _unitOfWork.UserRespository.GetUserByIdAsync(payload.RecipientId); //_userManager.Users.Where(i => i.Id == payload.RecipientId).FirstOrDefaultAsync();


            var sender = await _unitOfWork.UserRespository.GetCurrentUserAsync();

            var createMessage = new Message
            {
                SenderId = payload.SenderId,
                SenderUsername = payload.SenderUsername,
                Sender = sender,
                RecipientId = payload.RecipientId,
                RecipientUsername = payload.RecipientUsername,
                Recipient = recipient,
                Content = payload.MessageContent
            };

            _unitOfWork.MessagingRepository.AddMessage(createMessage);


            var result = await _unitOfWork.Complete();

            
            
            return result;
        }
        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }

        public async Task<string> JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            return groupName;
        }

        public async Task<bool> SendMessageToGroup(string groupName, MessageViewModel message)
        {
            var isSavedSuccess = await SaveMessageAsync(message);

            if(!isSavedSuccess)
            {
                throw new HubException("Message Not saved");
            }

            await Clients.Group(groupName).SendAsync("ReceiveMessage", message);
            
            return isSavedSuccess;
        }

    }
}
