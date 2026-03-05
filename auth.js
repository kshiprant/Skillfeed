import {
auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "./firebase.js";

window.register = async function () {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try {

await createUserWithEmailAndPassword(auth, email, password);

alert("Account created successfully");

} catch (error) {

alert(error.message);

}

};


window.login = async function () {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try {

await signInWithEmailAndPassword(auth, email, password);

alert("Login successful");

window.location.href = "dashboard.html";

} catch (error) {

alert(error.message);

}

};
