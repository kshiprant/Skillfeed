import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

apiKey: "AIzaSyCfsQJHExYNMyUb4eNFqdCQxW50qPtmrok",

authDomain: "skillfeed2026.firebaseapp.com",

projectId: "skillfeed2026",

storageBucket: "skillfeed2026.firebasestorage.app",

messagingSenderId: "516697457596",

appId: "1:516697457596:web:38edcd623662153ffbe1b9",

measurementId: "G-TC9M770VGL"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// Export both so other files can use them
export { auth, db };
