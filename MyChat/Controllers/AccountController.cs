using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyChat.Interfaces;
using MyChat.Models;
using MyChat.ViewModels.Account;

namespace MyChat.Controllers
{
    public class AccountController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly UserManager<AppIdentityUser> _userManager;
        private readonly SignInManager<AppIdentityUser> _signInManager;
        private readonly IBaseRepository<Message> _messageRepository;
        // private readonly IUserRepository _userRepository;

        public AccountController(UserManager<AppIdentityUser> userManager,
                                 IBaseRepository<Message> messageRepository,
                                 SignInManager<AppIdentityUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _messageRepository = messageRepository;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Login()
        {
            return View(new LoginViewModel());
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel loginViewModel)
        {
            var user = await _userManager.FindByEmailAsync(loginViewModel.EmailAddress);
         
            if(user == null)
            {
                return View(loginViewModel);
            }

            var passwordCheck = await _userManager.CheckPasswordAsync(user, loginViewModel.Password);
         
            if (!passwordCheck)
            { 
                return View(loginViewModel);
            }

            var signInUser = await _signInManager.PasswordSignInAsync(user, loginViewModel.Password, false, false);
            
            if (!signInUser.Succeeded)
            {
                return View(loginViewModel);
            }

            return RedirectToAction("Index", "Messaging");
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Register()
        {
            return View(new RegisterViewModel());
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel registerViewModel)
        {
            if(!ModelState.IsValid)
            {
                return View(registerViewModel);
            }

            if(registerViewModel.Password != registerViewModel.ConfirmPassword)
            {
                return View(registerViewModel);
            }

            var isEmailExist = await _userManager.FindByEmailAsync(registerViewModel.EmailAddress);
            if (isEmailExist is not null) 
            {
                return View(registerViewModel);
            }

            var newUser = new AppIdentityUser
            {
                Email = registerViewModel.EmailAddress,
                UserName = registerViewModel.EmailAddress
            };

            var newUserResponse = await _userManager.CreateAsync(newUser, registerViewModel.Password);

            if (!newUserResponse.Succeeded) return View(registerViewModel);

            return RedirectToAction("Login");
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {

            await _signInManager.SignOutAsync();

            return RedirectToAction("Login", "Account");
        }
    }
}