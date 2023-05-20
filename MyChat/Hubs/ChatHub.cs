﻿using System.Reflection;
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
        private readonly UserManager<AppIdentityUser> _userManager;
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


        private async Task<int> SaveMessageAsync(MessageViewModel payload)
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

            return groupName;
        }

        public async Task<bool> SendMessageToGroup(string groupName, MessageViewModel message)
        {
            var isSavedSuccess = await SaveMessageAsync(message);

            if(isSavedSuccess < 1)
            {
                throw new HubException("Message Not saved");
            }

            await Clients.Group(groupName).SendAsync("ReceiveMessage", message);
            

            return isSavedSuccess != 0;
        }

    }
}
