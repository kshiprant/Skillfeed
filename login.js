import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const status = document.getElementById("status");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function setStatus(t) {
  if (status) status.textContent = t;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/home.html";
  }
});

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const emailValue = email?.value.trim();
    const passwordValue = password?.value;

    if (!emailValue || !passwordValue) {
      setStatus("Please enter email and password.");
      return;
    }

    setStatus("Logging in...");

    try {
      await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      setStatus("✅ Logged in");
      window.location.href = "/home.html";
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.message || e));
    }
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const emailValue = email?.value.trim();
    const passwordValue = password?.value;

    if (!emailValue || !passwordValue) {
      setStatus("Please enter email and password.");
      return;
    }

    if (passwordValue.length < 6) {
      setStatus("Password should be at least 6 characters.");
      return;
    }

    setStatus("Creating account...");

    try {
      await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      setStatus("✅ Account created");
      window.location.href = "/home.html";
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.message || e));
    }
  });
}
// REPLACE your existing login.js with this

import API from './api-client.js';
import { handleAuthError } from './auth.js';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginSection = document.getElementById('login');
const signupSection = document.getElementById('signup');

// Tab switching
loginTab?.addEventListener('click', () => {
  loginSection.style.display = 'block';
  signupSection.style.display = 'none';
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
});

signupTab?.addEventListener('click', () => {
  signupSection.style.display = 'block';
  loginSection.style.display = 'none';
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
});

// Handle login
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    const response = await API.login(email, password);

    if (response.success) {
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user._id);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userName', response.user.name);

      // Set API token
      API.setToken(response.token);

      // Redirect to home
      window.location.href = '/home.html';
    }
  } catch (error) {
    if (handleAuthError(error)) return;
    
    alert(error.message || 'Login failed. Please try again.');
    console.error('Login error:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Handle signup
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signupName')?.value;
  const email = document.getElementById('signupEmail')?.value;
  const password = document.getElementById('signupPassword')?.value;
  const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!name || !email || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const response = await API.register(email, password, name);

    if (response.success) {
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user._id);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userName', response.user.name);

      // Set API token
      API.setToken(response.token);

      // Redirect to profile setup
      window.location.href = '/profile.html';
    }
  } catch (error) {
    if (handleAuthError(error)) return;
    
    alert(error.message || 'Signup failed. Please try again.');
    console.error('Signup error:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
