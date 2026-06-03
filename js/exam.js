import { db } from "./firebase.js";

import {
collection,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const candidateName =
sessionStorage.getItem("candidateName") || "Unknown";

const candidateEmail =
sessionStorage.getItem("candidateEmail") || "Unknown";

document.getElementById("candidateName").textContent =
candidateName;

document.getElementById("candidateEmail").textContent =
candidateEmail;

const questions = [
{
q:"A user asks another member for their home address.",
correct:"B"
},
{
q:"A user uses a racial slur.",
correct:"D"
},
{
q:"A user posts age-appropriate friendly content.",
correct:"A"
},
{
q:"A user repeatedly asks for phone numbers.",
correct:"C"
},
{
q:"A user shares graphic adult content.",
correct:"D"
},
{
q:"A user mocks a disability.",
correct:"C"
},
{
q:"A user promotes respect and inclusion.",
correct:"A"
},
{
q:"A user asks a minor where they live.",
correct:"C"
},
{
q:"A user posts hateful comments.",
correct:"D"
},
{
q:"A user politely discusses movies.",
correct:"A"
},
{
q:"A user shares another person's phone number.",
correct:"C"
},
{
q:"A user posts illegal scam instructions.",
correct:"D"
},
{
q:"A user uses homophobic insults.",
correct:"D"
},
{
q:"A user repeatedly harasses another member.",
correct:"C"
},
{
q:"A user asks for a school name.",
correct:"C"
},
{
q:"A user encourages rule-following.",
correct:"A"
},
{
q:"A user targets a protected group.",
correct:"D"
},
{
q:"A user posts a personal address.",
correct:"C"
},
{
q:"A user behaves respectfully.",
correct:"A"
},
{
q:"A user repeatedly requests private information.",
correct:"D"
}
];

const container =
document.getElementById("questionContainer");

questions.forEach((question,index)=>{

```
const block =
    document.createElement("div");

block.style.marginBottom = "20px";

block.innerHTML = `
    <p><strong>Q${index+1}.</strong> ${question.q}</p>

    <label>
        <input type="radio"
        name="q${index}"
        value="A">
        A. No Action
    </label><br>

    <label>
        <input type="radio"
        name="q${index}"
        value="B">
        B. Warning
    </label><br>

    <label>
        <input type="radio"
        name="q${index}"
        value="C">
        C. Temporary Suspension
    </label><br>

    <label>
        <input type="radio"
        name="q${index}"
        value="D">
        D. Permanent Ban
    </label>
`;

container.appendChild(block);
```

});

document
.getElementById("examForm")
.addEventListener("submit", async (e)=>{

```
e.preventDefault();

let score = 0;

questions.forEach((question,index)=>{

    const selected =
        document.querySelector(
            `input[name="q${index}"]:checked`
        );

    if(
        selected &&
        selected.value === question.correct
    ){
        score++;
    }

});

if(
    document.getElementById("scenario1").value === "1"
){
    score++;
}

if(
    document.getElementById("scenario2").value === "2"
){
    score++;
}

const submission = {

    candidateName,
    candidateEmail,

    autoScore: score,

    writtenResponses: {
        response1:
            document.getElementById("written1").value,
        response2:
            document.getElementById("written2").value,
        response3:
            document.getElementById("written3").value
    },

    status: "pending",

    submittedAt:
        serverTimestamp()
};

try{

    await addDoc(
        collection(db,"attempts"),
        submission
    );

    alert(
        "Exam submitted successfully."
    );

    location.href = "results.html";

}catch(error){

    console.error(error);

    alert(
        "Failed to submit examination."
    );

}
```

});
