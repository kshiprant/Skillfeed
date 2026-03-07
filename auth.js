import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.logout = async function logout(){
  await signOut(auth);
  window.location.href = "/index.html";
};

// If a page has <body data-protected="1"> then require login
const protectedPage = document.body?.dataset?.protected === "1";

if (protectedPage) {
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "/index.html";
  });
}
// ADD THESE TO YOUR EXISTING auth.js

import API from './api-client.js';

// Check if user is logged in
export function isLoggedIn() {
  return !!localStorage.getItem('token') && !!localStorage.getItem('userId');
}

// Get current user ID
export function getCurrentUserId() {
  return localStorage.getItem('userId');
}

// Get current token
export function getToken() {
  return localStorage.getItem('token');
}

// Logout user
export async function logout() {
  try {
    await API.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    API.clearToken();
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local data anyway
    localStorage.clear();
    window.location.href = '/index.html';
  }
}

// Redirect to login if not authenticated
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/index.html';
  }
}

// Handle API errors and token expiration
export function handleAuthError(error) {
  if (error.message.includes('unauthorized') || error.message.includes('Invalid token')) {
    logout();
    return true;
  }
  return false;
}
