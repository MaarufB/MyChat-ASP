using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MyChat.Interfaces;
using MyChat.Models;
using MyChat.Repositories;
using MyChat.ViewModels;
//using Microsoft.AspNetCore.SignalR.IClientProxy;

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
        //public async Task SendMessage(string user, string message)
        //{
        //    //await Clients.All.SendAsync("ReceiveMessage", user, message);
        //    await Clients.All.ReceiveMessage(user, message);
        //}

        // public async Task SendMessageToUser(string connectionId, string message)
        // {
        //     await Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
        // }

        // public override async Task OnConnectedAsync()
        // {
        //     await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
        //     await base.OnConnectedAsync();
        // }

        // public override async Task OnDisconnectedAsync(Exception exception)
        // {
        //     await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
        //     await base.OnDisconnectedAsync(exception);
        // }

        private readonly UserManager<AppIdentityUser> _userManager;
        // private readonly IBaseRepository<DummyMessage> _repo;
        private readonly IBaseRepository<Message> _repo;

        public ChatHub(
                        IBaseRepository<Message> repo, 
                        UserManager<AppIdentityUser> userManager
                        )
        {
            _userManager = userManager;
            _repo = repo;
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


        private async Task<int> SaveMessageAsync(CreateMessagePayload payload)
        {
            var otherUser = await _userManager.Users.Where(i => i.Id == payload.RecipientId).FirstOrDefaultAsync();


            var sender = await _userManager.Users.Where(i => i.Id == payload.SenderId).FirstOrDefaultAsync();

            var createMessage = new Message
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

            var groupNameInfo = $"Group Information: {groupName}";
            Console.WriteLine(groupNameInfo);

            return groupName;
        }

        public async Task<bool> SendMessageToGroup(string groupName, CreateMessagePayload message)
        {
            var isSavedSuccess = await SaveMessageAsync(message);

            if(isSavedSuccess < 1)
            {
                throw new HubException("Message Not saved");
            }

            var messageLogInfo = $"Message log info"+
                                $"sender: {message.SenderUsername}\n" +
                                $"recipient: {message.RecipientUsername}\n" +
                                $"content: {message.MessageContent}";

            Console.WriteLine(messageLogInfo);

            await Clients.Group(groupName).SendAsync("ReceiveMessage", message);
            

            return isSavedSuccess != 0;
        }

    }
}
