// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCztPWjSUqMq3Jkrp8pBbnFruAtyTrzDGA",
  authDomain: "sistematrb.firebaseapp.com",
  projectId: "sistematrb",
  storageBucket: "sistematrb.firebasestorage.app",
  messagingSenderId: "397698272912",
  appId: "1:397698272912:web:b4866212140b331052d215",
  measurementId: "G-4D0RZ7BD1K"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);