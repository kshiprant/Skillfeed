import { auth } from "./firebase.js";
import { 
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "firebase/auth";

window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("User registered successfully!");
    console.log(userCredential.user);
  } catch (error) {
    alert(error.message);
  }
};

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Login successful!");
    console.log(userCredential.user);
  } catch (error) {
    alert(error.message);
  }
};
