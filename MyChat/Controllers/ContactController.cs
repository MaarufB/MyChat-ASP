using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyChat.Models;
using MyChat.Repositories.IRepository;
using MyChat.ViewModels.Contact;

namespace MyChat.Controllers
{
    [Authorize]
    public class ContactController : BaseController
    {
        private readonly IUnitOfWork _unitOfWork;        
        public ContactController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

            var currentUser = await _unitOfWork.UserRespository.GetCurrentUserAsync();

            if (currentUser.Id == contactPayload.CurrentUserId && 
                currentUser.Id == contactPayload.ContactId)
            {
                return BadRequest("You cannot add yourself as your contact!");
            }

            var contacts = await _unitOfWork.ContactRepository.GetContacts(currentUser.Id);
            var isContactExist = contacts.Any(x => x.ContactOwnerId == contactPayload.CurrentUserId &&
                                                   x.ContactPersonId == contactPayload.ContactId);

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

            _unitOfWork.ContactRepository.AddContact(newContact);

            if (await _unitOfWork.Complete())
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

            var contact = await _unitOfWork.ContactRepository.GetContact(contactPayload.CurrentUserId, contactPayload.ContactId);

            _unitOfWork.ContactRepository.RemoveContact(contact);
            
            if(await _unitOfWork.Complete())
            {
                return Ok(true);
            }

            return BadRequest();

        }

        [HttpGet]
        [Route("contact/get-contact/{id}")]
        public async Task<IActionResult> GetContact(string id)
        {
            var contact = await _unitOfWork.UserRespository.GetUserByIdAsync(id);

            return Ok(contact);
        }

        [HttpGet, ActionName("get-contacts")]
        public async Task<IActionResult> GetContacts()
        {
            var currentUser = await _unitOfWork.UserRespository.GetCurrentUserAsync();
            var allUser = await _unitOfWork.UserRespository.GetUsersAsync();

            allUser = allUser.Where(x => x.Id != currentUser.Id).ToList();

            var currentUserContacts = await _unitOfWork.ContactRepository.GetContacts(currentUser.Id);

            var existingContactIds = new Dictionary<string, string>();

            var contactListResponse = new List<ContactViewModel>();

            foreach (var item in currentUserContacts)
            {
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
            var currentUser = await _unitOfWork.UserRespository.GetCurrentUserAsync();
            var allUser = await _unitOfWork.UserRespository.GetUsersAsync();

            allUser = allUser.Where(x => x.Id != currentUser.Id).ToList();

            var currentUserContacts = await _unitOfWork.ContactRepository.GetContacts(currentUser.Id);
            currentUserContacts = currentUserContacts.Where(x => x.ContactOwnerId == currentUser.Id && x.ContactPersonId != currentUser.Id).ToList();

            var existingContactIds = new Dictionary<string, string>();

            var contactListResponse = new List<ContactViewModel>();

            foreach (var item in currentUserContacts)
            {
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
    }
}