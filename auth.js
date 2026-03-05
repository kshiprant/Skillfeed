import { auth } from "./firebase.js";

import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


window.register = function () {

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;

createUserWithEmailAndPassword(auth, email, password)

.then((userCredential) => {

alert("Account Created");

window.location.href = "/home.html";

})

.catch((error) => {

alert(error.message);

});

};


window.login = function () {

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;

signInWithEmailAndPassword(auth, email, password)

.then((userCredential) => {

window.location.href = "/home.html";

})

.catch((error) => {

alert(error.message);

});

};


window.logout = function () {

signOut(auth)

.then(() => {

window.location.href = "/";

});

};
