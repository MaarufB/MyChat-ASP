using MyChat.ViewModels.Contact;

namespace MyChat.Services.Contact
{
    public interface IContactService
    {
        Task<IEnumerable<ContactViewModel>> GetContacts();
        Task<ContactViewModel> AddContact();
    }
}