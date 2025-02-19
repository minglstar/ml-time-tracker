import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCp92B3Oi4pGnqK0_EldXRdBecSJUazmKU",
    authDomain: "ml-time-tracker.firebaseapp.com",
    projectId: "ml-time-tracker",
    storageBucket: "ml-time-tracker.firebasestorage.app",
    messagingSenderId: "204292174054",
    appId: "1:204292174054:web:a48a1d98bc6e36f6478b27",
    measurementId: "G-G94M3PJ2BT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize google analytics
const ga = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { ga, db, auth };