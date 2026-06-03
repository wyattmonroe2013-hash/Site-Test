// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyClXyHkXhDONqkOlfYlu13wVJ3zoV1OZ14",
    authDomain: "testing-site-90d5e.firebaseapp.com",
    projectId: "testing-site-90d5e",
    storageBucket: "testing-site-90d5e.firebasestorage.app",
    messagingSenderId: "672064487773",
    appId: "1:672064487773:web:dce6db4470d7577c27e8b4",
    measurementId: "G-NFQT1LY277"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
