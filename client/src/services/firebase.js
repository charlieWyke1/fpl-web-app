// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgBufXicMzgCkQVpb2ZiMmFG5lxTHkgcM",
  authDomain: "fantasy-project-b56e5.firebaseapp.com",
  projectId: "fantasy-project-b56e5",
  storageBucket: "fantasy-project-b56e5.firebasestorage.app",
  messagingSenderId: "414591089077",
  appId: "1:414591089077:web:238ba4efe6bb12f20dc1fc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
