import axios from 'axios';

import { baseUrl } from './js/config';


document.addEventListener('DOMContentLoaded', (event) => {
  event.preventDefault();

  document.querySelector('#loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
    
      const response = await axios.post(`${baseUrl}/user/login`, { email, password });
      const token = response.data.token;
      localStorage.removeItem('token');
      localStorage.setItem('token', token);
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('permission',response.data.permission);
      const pictureUrl = response.data.pictureUrl;
      const fullUrl = `${baseUrl}${pictureUrl}`;
      localStorage.setItem('myPicture', fullUrl);


      const userRole = response.data.permission;
      if (userRole === 'customer') {
        document.getElementById('response').innerText = 'Login successful: ' + JSON.stringify(response.data);
        window.location.href = '/src/html/customer.html';
      } else 
      if (userRole === 'admin') {
        document.getElementById('response').innerText = 'Login successful: ' + JSON.stringify(response.data);
        window.location.href = '/src/html/admin.html';
      } else {
        document.getElementById('response').innerText = 'Login successful: ' + JSON.stringify(response.data);
        window.location.href = '/src/html/worker.html';
      }
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : 'An unknown error occurred.';
      document.getElementById('response').innerText = 'Login failed: ' + errorMessage;
    }
  });


  document.querySelector('#anonymousLogin').addEventListener('click', async () => {
    try {
      const response = await axios.post(`${baseUrl}/user/login`, { email:"anonynous@gmail.com", password:"aaaa123!" });
      const token = response.data.token;
      localStorage.removeItem('token');
      localStorage.setItem('token', token);
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('permission',response.data.permission);
      const pictureUrl = response.data.pictureUrl;
      const fullUrl = `${baseUrl}${pictureUrl}`;
      localStorage.setItem('myPicture', fullUrl);
      }
      catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : 'An unknown error occurred.';
      document.getElementById('response').innerText = 'system error: ' + errorMessage;
    }
    window.location.href = '/src/html/anonynous.html'; 
  });
});

document.querySelector('#logout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '.../index.html';
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const responseDiv = document.getElementById('response');
  const anonymousLoginButton = document.getElementById('anonymousLogin');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');


  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = passwordInput.value;


    try {
      const response = await fakeApiLogin(email, password);
      responseDiv.textContent = response.message;
      responseDiv.style.color = response.success ? 'green' : 'red';
    } catch (error) {
      responseDiv.textContent = error.message;
      responseDiv.style.color = 'red';
    }
  });


  anonymousLoginButton.addEventListener('click', async () => {
    try {
      const response = await fakeApiAnonymousLogin();
      responseDiv.textContent = response.message;
      responseDiv.style.color = response.success ? 'green' : 'red';
    } catch (error) {
      responseDiv.textContent = error.message;
      responseDiv.style.color = 'red';
    }
  });


  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '🔐'; 
  });


  async function fakeApiLogin(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'test@example.com' && password === 'password') {
      return { success: true, message: 'Login successful!' };
    } else {
      throw new Error('Invalid email or password.');
    }
  }


  async function fakeApiAnonymousLogin() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Logged in as guest!' };
  }
});


