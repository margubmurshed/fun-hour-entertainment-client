// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyejgZr57pB5BXSgNYKOHcgwxK3igtRqk",
  authDomain: "fun-hour-entertainment.firebaseapp.com",
  projectId: "fun-hour-entertainment",
  storageBucket: "fun-hour-entertainment.firebasestorage.app",
  messagingSenderId: "153977547695",
  appId: "1:153977547695:web:8dd13851a900dff7c15d5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);