import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* -------------------------
   Candidate Info
------------------------- */
const name = sessionStorage.getItem("candidateName") || "Unknown";
const email = sessionStorage.getItem("candidateEmail") || "Unknown";

document.getElementById("name").textContent = name;
document.getElementById("email").textContent = email;

/* -------------------------
   QUESTION BANK (20 MCQ)
------------------------- */
const mcq = Array.from({ length: 20 }).map((_, i) => ({
    q: `Policy Question ${i + 1}: Determine correct moderation action.`,
    correct: ["A","B","C","D"][Math.floor(Math.random() * 4)]
}));

/* -------------------------
   CHAT SCENARIOS (10)
------------------------- */
const scenarios = Array.from({ length: 10 }).map((_, i) => ({
    text: `UserA: Message ${i + 1}\nUserB: Offensive / risky content detected`,
    correct: "C"
}));

/* -------------------------
   RENDER MCQ
------------------------- */
const mcqContainer = document.getElementById("mcqContainer");

mcq.forEach((q, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p><b>Q${i + 1}.</b> ${q.q}</p>

        <label><input type="radio" name="q${i}" value="A"> A</label><br>
        <label><input type="radio" name="q${i}" value="B"> B</label><br>
        <label><input type="radio" name="q${i}" value="C"> C</label><br>
        <label><input type="radio" name="q${i}" value="D"> D</label>
        <hr>
    `;
    mcqContainer.appendChild(div);
});

/* -------------------------
   RENDER SCENARIOS
------------------------- */
const scenarioContainer = document.getElementById("scenarioContainer");

scenarios.forEach((s, i) => {
    const div = document.createElement("div");

    div.innerHTML = `
        <pre>${s.text}</pre>

        <label>Action</label>
        <select id="s${i}">
            <option value="">Select</option>
            <option value="A">No Action</option>
            <option value="B">Warn</option>
            <option value="C">Suspend</option>
            <option value="D">Ban</option>
        </select>

        <hr>
    `;

    scenarioContainer.appendChild(div);
});

/* -------------------------
   TIMER (45 MINUTES)
------------------------- */
let time = 45 * 60;

const timerEl = document.getElementById("timer");

setInterval(() => {
    if (time <= 0) {
        document.getElementById("examForm").requestSubmit();
        return;
    }

    time--;

    const m = Math.floor(time / 60);
    const s = time % 60;

    timerEl.textContent =
        `${m}:${s.toString().padStart(2, "0")}`;

}, 1000);

/* -------------------------
   SUBMIT
------------------------- */
let submitted = false;

document.getElementById("examForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitted) return;
    submitted = true;

    let score = 0;

    /* MCQ grading */
    mcq.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === q.correct) score++;
    });

    /* Scenario grading */
    scenarios.forEach((s, i) => {
        const val = document.getElementById(`s${i}`).value;
        if (val === s.correct) score++;
    });

    const payload = {
        candidateName,
        candidateEmail,
        autoScore: score,
        writtenResponses: {
            w1: document.getElementById("w1").value,
            w2: document.getElementById("w2").value,
            w3: document.getElementById("w3").value
        },
        status: "pending",
        submittedAt: serverTimestamp()
    };

    await addDoc(collection(db, "attempts"), payload);

    alert("Exam submitted successfully.");
    window.location.href = "index.html";
});
