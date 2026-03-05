import {

auth,
db,
signOut,
collection,
addDoc,
getDocs,
query,
where

} from "./firebase.js";


window.logout = async function(){

await signOut(auth);

window.location = "index.html";

}


window.addSkill = async function(){

const skill = document.getElementById("skill").value;
const level = document.getElementById("level").value;

await addDoc(collection(db,"skills"),{

skill,
level

});

alert("Skill added");

}


window.postIdea = async function(){

const title = document.getElementById("ideaTitle").value;
const desc = document.getElementById("ideaDesc").value;

await addDoc(collection(db,"ideas"),{

title,
desc

});

alert("Idea posted");

}


window.searchSkill = async function(){

const skill = document.getElementById("searchSkill").value;

const q = query(collection(db,"skills"),where("skill","==",skill));

const snapshot = await getDocs(q);

const results = document.getElementById("results");

results.innerHTML="";

snapshot.forEach(doc=>{

const data = doc.data();

results.innerHTML +=

`<p>${data.skill} - Level ${data.level}</p>`;

});

}
