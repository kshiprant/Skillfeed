import { auth } from "./firebase.js";

import { 
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.register = function () {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

createUserWithEmailAndPassword(auth, email, password)
.then((userCredential) => {

const user = userCredential.user;

alert("Registration Successful: " + user.email);

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

const user = userCredential.user;

alert("Login Successful: " + user.email);

})
.catch((error) => {

alert(error.message);

});

};
