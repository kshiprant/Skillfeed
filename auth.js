import {

auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword

} from "./firebase.js";

window.register = async function(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

await createUserWithEmailAndPassword(auth,email,password);

alert("Account created");

}

window.login = async function(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

await signInWithEmailAndPassword(auth,email,password);

window.location = "dashboard.html";

}
