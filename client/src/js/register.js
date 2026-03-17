import axios from 'axios';
import { baseUrl } from './config';

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const picture = document.getElementById('picture').files[0]; 

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    if (picture) {
        formData.append('picture', picture); 
    }

    try {
        const response = await axios.post(`${baseUrl}/user/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const token = response.data.token;
        localStorage.removeItem('token');
        localStorage.setItem('token', token);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('permission',response.data.permission);
        const pictureUrl = response.data.pictureUrl;
        const fullUrl = `${baseUrl}${pictureUrl}`;
        localStorage.setItem('myPicture', fullUrl);
        window.location.href = '../html/customer.html';
    } catch (error) {
        console.log('Error registering user:'+ error.message );
        alert('Registration failed: ');
    }
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

document.getElementById('picture').addEventListener('change', function() {
    var icon = document.getElementById('icon');
    if (this.files.length > 0) {
        icon.innerHTML = '✔'; 
    } else {
        icon.innerHTML = ''; 
    }
});


