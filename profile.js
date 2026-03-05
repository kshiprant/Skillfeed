import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

let userLoaded = false;
let currentUser = null;

onAuthStateChanged(auth, (user) => {

  if (user) {
    currentUser = user;
    userLoaded = true;
