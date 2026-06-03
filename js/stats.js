import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

let data = [];

async function load(){

    const snap = await getDocs(collection(db,"attempts"));

    let pass = 0;
    let fail = 0;

    data = [];

    snap.forEach(doc => {
        const d = doc.data();
        data.push(d);

        if(d.status === "passed") pass++;
        if(d.status === "failed") fail++;
    });

    document.getElementById("stats").innerHTML = `
        Total Attempts: ${data.length}<br>
        Passed: ${pass}<br>
        Failed: ${fail}
    `;
}

load();

window.exportCSV = function(){

    let csv = "Name,Email,Status,AutoScore,FinalScore\n";

    data.forEach(d => {
        csv += `${d.candidateName},${d.candidateEmail},${d.status},${d.autoScore},${d.finalScore}\n`;
    });

    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-results.csv";
    a.click();
};
