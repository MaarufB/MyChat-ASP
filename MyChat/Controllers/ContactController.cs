using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyChat.Interfaces;
using MyChat.Models;
using MyChat.ViewModels.Contact;

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

        #region API

        [HttpPost]
        [Route("contact/add-contact")]
        public async Task<IActionResult> AddContact([FromBody] ContactViewModel contactPayload)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(contactPayload);
            }

            if (contactPayload.Id != null)
            {
                return BadRequest("Contact is already Exist!");
            }

            var currentUser = await GetCurrentUser();

            if (currentUser.Id == contactPayload.CurrentUserId && currentUser.Id == contactPayload.ContactId)
            {
                return BadRequest("You cannot add yourself as your contact!");
            }

            var contacts = await _contactRepository.GetAllAsync();
            var isContactExist = contacts.Any(x => x.ContactOwnerId == contactPayload.CurrentUserId && x.ContactPersonId == contactPayload.ContactId);

            if (isContactExist)
            {
                contactPayload.OnContactList = true;

                return Ok(contactPayload);
            }

            var newContact = new Contact
            {
                ContactOwnerId = contactPayload.CurrentUserId,
                ContactOwnerUsername = contactPayload.CurrentUsername,
                ContactPersonId = contactPayload.ContactId,
                ContactPersonUsername = contactPayload.ContactUsername
            };

            var createdContact = await _contactRepository.CreateAsync(newContact);

            if (createdContact > 0)
            {
                contactPayload.Id = newContact.Id;
                contactPayload.OnContactList = true;
            }

            return Ok(contactPayload);
        }

        [HttpPost]
        [Route("contact/remove-contact")]
        public async Task<IActionResult> RemoveContact(ContactViewModel contactPayload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (contactPayload.Id == null)
            {
                return BadRequest("Contact Id is Null");
            }

            await _contactRepository.Delete(contactPayload.Id);

            return Ok();

        }

        [HttpGet]
        [Route("contact/get-contact/{id}")]
        public async Task<IActionResult> GetContact(string id)
        {
            var contact = await _contactRepository.GetOneAsync(id);

            return Ok(contact);
        }

        [HttpGet, ActionName("get-contacts")]
        public async Task<IActionResult> GetContacts()
        {
            var currentUser = await GetCurrentUser();
            var allUser = await _userManager.Users.ToListAsync();
            allUser = allUser.Where(x => x.Id != currentUser.Id).ToList();


            var currentUserContacts = await _contactRepository.GetAllAsync();
            currentUserContacts = currentUserContacts.Where(x => x.ContactOwnerId == currentUser.Id && x.ContactPersonId != currentUser.Id)
                                                     .OrderBy(x => x.ContactAddedDate)
                                                     .ToList();

            var existingContactIds = new Dictionary<string, string>();

            var contactListResponse = new List<ContactViewModel>();

            foreach (var item in currentUserContacts)
            {
                // existingContactIds[item.ContactPersonId] = item.Id;
                existingContactIds.Add(item.ContactPersonId, item.Id);
            }

            foreach (var item in allUser)
            {
                if (item.Id == currentUser.Id) continue;

                var isExisting = existingContactIds.ContainsKey(item.Id);
                if(!isExisting) continue;

                var contact = new ContactViewModel
                {
                    Id = isExisting ? existingContactIds[item.Id] : null,
                    CurrentUserId = currentUser.Id,
                    CurrentUsername = currentUser.UserName,
                    ContactId = item.Id,
                    ContactUsername = item.UserName,
                    OnContactList = isExisting ? true : false
                };

                contactListResponse.Add(contact);
            }

            return Ok(contactListResponse);
        }



        [HttpGet, ActionName("get-users")]
        public async Task<ActionResult<IEnumerable<ContactViewModel>>> GetUsers()
        {
            var currentUser = await GetCurrentUser();
            var allUser = await _userManager.Users.ToListAsync();
            allUser = allUser.Where(x => x.Id != currentUser.Id).ToList();

            var currentUserContacts = await _contactRepository.GetAllAsync();
            currentUserContacts = currentUserContacts.Where(x => x.ContactOwnerId == currentUser.Id && x.ContactPersonId != currentUser.Id).ToList();

            var existingContactIds = new Dictionary<string, string>();

            var contactListResponse = new List<ContactViewModel>();

            foreach (var item in currentUserContacts)
            {
                // existingContactIds[item.ContactPersonId] = item.Id;
                existingContactIds.Add(item.ContactPersonId, item.Id);
            }

            foreach (var item in allUser)
            {
                if (item.Id == currentUser.Id) continue;

                var isExisting = existingContactIds.ContainsKey(item.Id);

                var contact = new ContactViewModel
                {
                    Id = isExisting ? existingContactIds[item.Id] : null,
                    CurrentUserId = currentUser.Id,
                    CurrentUsername = currentUser.UserName,
                    ContactId = item.Id,
                    ContactUsername = item.UserName,
                    OnContactList = isExisting ? true : false
                };

                contactListResponse.Add(contact);
            }

            return Ok(contactListResponse);
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