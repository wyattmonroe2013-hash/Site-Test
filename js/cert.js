import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.loadCert = async function(){

    const email = document.getElementById("email").value;

    const snap = await getDocs(collection(db,"attempts"));

    let found = null;

    snap.forEach(doc => {
        const d = doc.data();
        if(d.candidateEmail === email && d.status === "passed"){
            found = d;
        }
    });

    if(!found){
        alert("No certificate found.");
        return;
    }

    document.getElementById("cert").style.display = "block";

    document.getElementById("name").textContent = found.candidateName;
    document.getElementById("mail").textContent = found.candidateEmail;
    document.getElementById("status").textContent = found.status;
    document.getElementById("score").textContent = found.finalScore || 0;

    document.getElementById("cid").textContent =
        "MOD-" + Math.floor(Math.random() * 99999999);
};
