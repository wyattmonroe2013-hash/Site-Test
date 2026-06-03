import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* -------------------------
   SECURITY CHECK
------------------------- */
if(sessionStorage.getItem("admin") !== "true"){
    window.location.href = "admin.html";
}

/* -------------------------
   STATE
------------------------- */
let currentId = null;
let submissions = [];

/* -------------------------
   LOAD SUBMISSIONS
------------------------- */
async function load(){

    const snap = await getDocs(collection(db,"attempts"));

    submissions = [];

    snap.forEach(docSnap => {
        submissions.push({ id: docSnap.id, ...docSnap.data() });
    });

    const list = document.getElementById("list");
    list.innerHTML = "";

    submissions.forEach((s, i) => {

        const div = document.createElement("div");

        div.className = "card";

        div.innerHTML = `
            <b>${s.candidateName}</b><br>
            ${s.candidateEmail}<br>
            Score: ${s.autoScore}<br><br>

            <button class="btn" onclick="view(${i})">
                Review
            </button>
        `;

        list.appendChild(div);

    });
}

load();

/* -------------------------
   VIEW SUBMISSION
------------------------- */
window.view = function(index){

    const s = submissions[index];
    currentId = s.id;

    document.getElementById("review").style.display = "block";

    document.getElementById("rName").textContent = s.candidateName;
    document.getElementById("rEmail").textContent = s.candidateEmail;
    document.getElementById("rScore").textContent = s.autoScore;

    document.getElementById("w1").textContent = s.writtenResponses.w1;
    document.getElementById("w2").textContent = s.writtenResponses.w2;
    document.getElementById("w3").textContent = s.writtenResponses.w3;
};

/* -------------------------
   FINALIZE
------------------------- */
window.finalize = async function(pass){

    const written = Number(
        document.getElementById("writtenScore").value || 0
    );

    const s = submissions.find(x => x.id === currentId);

    const finalScore =
        s.autoScore + written;

    await updateDoc(doc(db,"attempts",currentId),{
        writtenScore: written,
        finalScore,
        status: pass ? "passed" : "failed"
    });

    alert("Submission updated.");

    location.reload();
};
