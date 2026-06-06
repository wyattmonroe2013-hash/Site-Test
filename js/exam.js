import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* ==========================================
   DOM ELEMENTS
========================================== */

const startExamBtn =
    document.getElementById("startExamBtn");

const accessMessage =
    document.getElementById("accessMessage");

const accessCard =
    document.getElementById("accessCard");

const examWrapper =
    document.getElementById("examWrapper");

const candidateNameInput =
    document.getElementById("candidateName");

const candidateEmailInput =
    document.getElementById("candidateEmail");

const displayName =
    document.getElementById("displayName");

const displayEmail =
    document.getElementById("displayEmail");

const questionContainer =
    document.getElementById("questionContainer");

const scenarioContainer =
    document.getElementById("scenarioContainer");

const progressElement =
    document.getElementById("progress");

/* ==========================================
   GLOBAL STATE
========================================== */

let selectedQuestions = [];
let selectedScenarios = [];

let candidateName = "";
let candidateEmail = "";

/* ==========================================
   QUESTION BANK
========================================== */

const QUESTION_BANK = [

{
question:
"A user asks another member for their home address.",

answers:[
"No action is required.",
"Issue a reminder about privacy.",
"Remove the message and issue a warning.",
"Permanently ban the user."
],

correct:
"Remove the message and issue a warning."
},

{
question:
"A user posts discriminatory comments targeting a protected group.",

answers:[
"No action is required.",
"Ask them to be nicer.",
"Temporarily hide the comment.",
"Remove the content and apply severe enforcement."
],

correct:
"Remove the content and apply severe enforcement."
},

{
question:
"A user repeatedly asks minors what school they attend.",

answers:[
"No action is required.",
"Politely ignore it.",
"Moderate for soliciting personal information.",
"Reward the user."
],

correct:
"Moderate for soliciting personal information."
},

{
question:
"A user posts explicit adult content in a community containing minors.",

answers:[
"No action is required.",
"Issue a reminder.",
"Temporarily mute the user.",
"Remove the content and apply severe enforcement."
],

correct:
"Remove the content and apply severe enforcement."
},

{
question:
"A user politely discusses a movie they watched.",

answers:[
"No action is required.",
"Issue a warning.",
"Suspend the user.",
"Ban the user."
],

correct:
"No action is required."
},

{
question:
"A user posts another person's phone number publicly.",

answers:[
"No action is required.",
"Ask if permission was granted.",
"Remove the content and take moderation action.",
"Pin the message."
],

correct:
"Remove the content and take moderation action."
},

{
question:
"A user repeatedly insults another member.",

answers:[
"No action is required.",
"Document and escalate moderation action.",
"Reward the behavior.",
"Delete the victim's messages."
],

correct:
"Document and escalate moderation action."
},

{
question:
"A user asks for another member's exact location.",

answers:[
"No action.",
"Privacy reminder.",
"Moderate for personal information solicitation.",
"Feature the request."
],

correct:
"Moderate for personal information solicitation."
},

{
question:
"A user posts hateful content directed at a protected group.",

answers:[
"No action.",
"Reminder only.",
"Temporary mute only.",
"Remove content and enforce policy."
],

correct:
"Remove content and enforce policy."
},

{
question:
"A user respectfully disagrees with another member.",

answers:[
"No action.",
"Warning.",
"Suspension.",
"Ban."
],

correct:
"No action."
}

];

/* ==========================================
   SCENARIO BANK
========================================== */

const SCENARIO_BANK = [

{
scenario:
`UserA: Hello everyone.
UserB: Nobody wants you here.
UserA: Why?
UserB: Because you're annoying.`,

answers:[
"No action required.",
"Issue harassment warning.",
"Delete UserA account.",
"Ban everyone."
],

correct:
"Issue harassment warning."
},

{
scenario:
`UserA: I'm 14.
UserB: What school do you attend?
UserA: Lincoln Middle School.
UserB: What's your address?`,

answers:[
"Acceptable conversation.",
"Privacy violation.",
"Spam.",
"Off-topic discussion."
],

correct:
"Privacy violation."
},

{
scenario:
`UserA: People with disabilities shouldn't be here.`,

answers:[
"No action.",
"Reminder.",
"Escalated moderation action.",
"Feature message."
],

correct:
"Escalated moderation action."
}

];

/* ==========================================
   UTILITIES
========================================== */

function shuffle(array){

    return [...array]
        .sort(() => Math.random() - 0.5);

}

/* ==========================================
   ATTEMPT CHECK
========================================== */

async function checkAttemptStatus(email){

    const q = query(
        collection(db, "attempts"),
        where("candidateEmail", "==", email)
    );

    const snap = await getDocs(q);

    let hasPassed = false;
    let hasPending = false;

    snap.forEach(doc => {

        const data = doc.data();

        if(data.status === "passed"){
            hasPassed = true;
        }

        if(data.status === "pending"){
            hasPending = true;
        }

    });

    return {
        hasPassed,
        hasPending
    };

}

/* ==========================================
   START EXAM
========================================== */

startExamBtn.addEventListener(
    "click",
    async () => {

        candidateName =
            candidateNameInput.value.trim();

        candidateEmail =
            candidateEmailInput.value
            .trim()
            .toLowerCase();

        if(!candidateName){

            accessMessage.textContent =
                "Enter your name.";

            return;
        }

        if(!candidateEmail){

            accessMessage.textContent =
                "Enter your email.";

            return;
        }

        accessMessage.textContent =
            "Checking eligibility...";

        try{

            const result =
                await checkAttemptStatus(
                    candidateEmail
                );

            if(result.hasPassed){

                accessMessage.innerHTML =
                    "<span class='success'>You have already passed this certification.</span>";

                return;
            }

            if(result.hasPending){

                accessMessage.innerHTML =
                    "<span class='warning'>Your previous attempt is awaiting review.</span>";

                return;
            }

            beginExam();

        }
        catch(error){

            console.error(error);

            accessMessage.innerHTML =
                "<span class='warning'>Unable to verify eligibility.</span>";

        }

    }
);

/* ==========================================
   BEGIN EXAM
========================================== */

function beginExam(){

    displayName.textContent =
        candidateName;

    displayEmail.textContent =
        candidateEmail;

    accessCard.classList.add("hidden");

    examWrapper.classList.remove("hidden");

    selectedQuestions =
        shuffle(QUESTION_BANK)
        .slice(0, 10);

    selectedScenarios =
        shuffle(SCENARIO_BANK)
        .slice(0, 3);

    renderQuestions();

    renderScenarios();

    updateProgress();

}

/* ==========================================
   RENDER QUESTIONS
========================================== */

function renderQuestions(){

    questionContainer.innerHTML = "";

    selectedQuestions.forEach(
        (question, index) => {

            const div =
                document.createElement("div");

            div.className =
                "question";

            let html =
                `<p>Question ${index + 1}: ${question.question}</p>`;

            shuffle(question.answers)
            .forEach(answer => {

                html += `
                <label>
                    <input
                        type="radio"
                        name="question_${index}"
                        value="${answer}">
                    ${answer}
                </label>
                `;

            });

            div.innerHTML = html;

            questionContainer.appendChild(div);

        }
    );

}

/* ==========================================
   RENDER SCENARIOS
========================================== */

function renderScenarios(){

    scenarioContainer.innerHTML = "";

    selectedScenarios.forEach(
        (scenario, index) => {

            const div =
                document.createElement("div");

            div.className =
                "question";

            let html = `
                <pre>${scenario.scenario}</pre>
            `;

            shuffle(scenario.answers)
            .forEach(answer => {

                html += `
                <label>
                    <input
                        type="radio"
                        name="scenario_${index}"
                        value="${answer}">
                    ${answer}
                </label>
                `;

            });

            div.innerHTML = html;

            scenarioContainer.appendChild(div);

        }
    );

}

/* ==========================================
   PROGRESS TRACKING
========================================== */

document.addEventListener(
    "change",
    updateProgress
);

function updateProgress(){

    const answered =
        document.querySelectorAll(
            'input[type="radio"]:checked'
        ).length;

    progressElement.textContent =
        `${answered} answered`;

}

/* ==========================================
   TIMER
========================================== */

const examForm =
    document.getElementById("examForm");

const timerElement =
    document.getElementById("timer");

let submitted = false;

let remainingSeconds =
    45 * 60;

const timerInterval =
    setInterval(() => {

        if(submitted){

            clearInterval(timerInterval);

            return;
        }

        if(remainingSeconds <= 0){

            clearInterval(timerInterval);

            alert(
                "Time has expired. Your exam will now be submitted."
            );

            examForm.requestSubmit();

            return;
        }

        remainingSeconds--;

        const minutes =
            Math.floor(
                remainingSeconds / 60
            );

        const seconds =
            remainingSeconds % 60;

        timerElement.textContent =
            `${minutes}:${String(seconds)
                .padStart(2,"0")}`;

    }, 1000);

/* ==========================================
   SCORING
========================================== */

function calculateScore(){

    let score = 0;

    selectedQuestions.forEach(
        (question, index) => {

            const selected =
                document.querySelector(
                    `input[name="question_${index}"]:checked`
                );

            if(
                selected &&
                selected.value === question.correct
            ){
                score++;
            }

        }
    );

    selectedScenarios.forEach(
        (scenario, index) => {

            const selected =
                document.querySelector(
                    `input[name="scenario_${index}"]:checked`
                );

            if(
                selected &&
                selected.value === scenario.correct
            ){
                score++;
            }

        }
    );

    return score;

}

/* ==========================================
   COLLECT ANSWERS
========================================== */

function collectAnswers(){

    const objectiveAnswers = [];

    selectedQuestions.forEach(
        (question, index) => {

            const selected =
                document.querySelector(
                    `input[name="question_${index}"]:checked`
                );

            objectiveAnswers.push({

                type: "question",

                question:
                    question.question,

                selected:
                    selected
                        ? selected.value
                        : null,

                correct:
                    question.correct

            });

        }
    );

    selectedScenarios.forEach(
        (scenario, index) => {

            const selected =
                document.querySelector(
                    `input[name="scenario_${index}"]:checked`
                );

            objectiveAnswers.push({

                type: "scenario",

                scenario:
                    scenario.scenario,

                selected:
                    selected
                        ? selected.value
                        : null,

                correct:
                    scenario.correct

            });

        }
    );

    return objectiveAnswers;

}

/* ==========================================
   SUBMIT EXAM
========================================== */

examForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if(submitted){
            return;
        }

        submitted = true;

        const submitButton =
            examForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting...";

        try{

            const autoScore =
                calculateScore();

            const answers =
                collectAnswers();

            const writtenResponses = {

                harassment:
                    document
                    .getElementById(
                        "written1"
                    )
                    .value
                    .trim(),

                personalInformation:
                    document
                    .getElementById(
                        "written2"
                    )
                    .value
                    .trim(),

                discrimination:
                    document
                    .getElementById(
                        "written3"
                    )
                    .value
                    .trim()

            };

            const totalObjectiveQuestions =
                selectedQuestions.length +
                selectedScenarios.length;

            await addDoc(

                collection(
                    db,
                    "attempts"
                ),

                {

                    candidateName,

                    candidateEmail,

                    autoScore,

                    totalObjectiveQuestions,

                    answers,

                    writtenResponses,

                    status:
                        "pending",

                    submittedAt:
                        serverTimestamp(),

                    review: {

                        reviewed: false,

                        reviewedBy: null,

                        reviewedAt: null,

                        finalScore: null,

                        notes: ""

                    }

                }

            );

            clearInterval(
                timerInterval
            );

            alert(
                "Exam submitted successfully. Your submission is now awaiting review."
            );

            location.href =
                "index.html";

        }
        catch(error){

            console.error(
                error
            );

            submitted = false;

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Examination";

            alert(
                "Submission failed. Please try again."
            );

        }

    }
);

/* ==========================================
   PAGE EXIT WARNING
========================================== */

window.addEventListener(
    "beforeunload",
    (event) => {

        if(submitted){
            return;
        }

        if(
            examWrapper &&
            !examWrapper.classList.contains(
                "hidden"
            )
        ){

            event.preventDefault();

            event.returnValue =
                "";

        }

    }
);

/* ==========================================
   ANTI-DOUBLE CLICK
========================================== */

document.addEventListener(
    "dblclick",
    (event) => {

        if(
            event.target.tagName ===
            "BUTTON"
        ){

            event.preventDefault();

        }

    }
);

/* ==========================================
   DEBUG
========================================== */

console.log(
    "Exam system loaded successfully."
);
