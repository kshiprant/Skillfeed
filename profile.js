import { auth, db } from "./firebase.js"

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"

let currentUser = null

onAuthStateChanged(auth,(user)=>{

if(user){

currentUser = user

}else{

window.location.href="/"

}

})

window.saveProfile = async function(){

const name = document.getElementById("name").value
const skills = document.getElementById("skills").value
const location = document.getElementById("location").value
const startup = document.getElementById("startup").value
const bio = document.getElementById("bio").value
const level = document.getElementById("level").value

await setDoc(doc(db,"users",currentUser.uid),{

name:name,
skills:skills,
location:location,
startup:startup,
bio:bio,
level:level

})

alert("Profile Created!")

window.location.href="/people.html"

}
