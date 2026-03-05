function signup(){

let email=document.getElementById("email").value
let pass=document.getElementById("password").value

auth.createUserWithEmailAndPassword(email,pass)

.then(()=>alert("Account created"))

.catch(e=>alert(e.message))

}



function login(){

let email=document.getElementById("email").value
let pass=document.getElementById("password").value

auth.signInWithEmailAndPassword(email,pass)

.then(()=>window.location="index.html")

.catch(e=>alert(e.message))

}



function postSkill(){

let name=document.getElementById("name").value
let have=document.getElementById("skillHave").value.toLowerCase()
let want=document.getElementById("skillWant").value.toLowerCase()
let level=document.getElementById("level").value

db.collection("skills").add({

name:name,
have:have,
want:want,
level:level

})

alert("Skill Posted")

}



function postIdea(){

let idea=document.getElementById("idea").value

db.collection("ideas").add({

idea:idea,
time:Date.now()

})

}



db.collection("ideas")

.orderBy("time")

.onSnapshot(snapshot=>{

let div=document.getElementById("ideas")

div.innerHTML=""

snapshot.forEach(doc=>{

div.innerHTML+=

`<div class="skill-card">

${doc.data().idea}

</div>`

})

})



function findMatches(){

db.collection("skills").get()

.then(snapshot=>{

let list=[]

snapshot.forEach(doc=>{

list.push(doc.data())

})

let div=document.getElementById("matches")

div.innerHTML=""

for(let i=0;i<list.length;i++){

for(let j=0;j<list.length;j++){

if(i!==j){

if(list[i].have===list[j].want){

div.innerHTML+=

`<div class="skill-card">

${list[i].name} (Level ${list[i].level})

can collaborate with

${list[j].name}

</div>`

}

}

}

}

})

}



function findCoFounder(){

let skill=document.getElementById("founderSkill").value.toLowerCase()

db.collection("skills").get()

.then(snapshot=>{

let div=document.getElementById("founderResults")

div.innerHTML=""

snapshot.forEach(doc=>{

let data=doc.data()

if(data.have.includes(skill)){

div.innerHTML+=

`<div class="skill-card">

<h3>${data.name}</h3>

<p>Skill: ${data.have}</p>

<p>Level: ${data.level}</p>

<button onclick="inviteFounder('${data.name}')">
Invite as Co-Founder
</button>

</div>`

}

})

})

}



function inviteFounder(name){

alert("Invitation sent to "+name)

}
