// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABvyHKTF7jWTdYstsVp4YItnInF3UiW2M",
  authDomain: "bikeworks-au.firebaseapp.com",
  projectId: "bikeworks-au",
  storageBucket: "bikeworks-au.appspot.com",
  messagingSenderId: "801348189808",
  appId: "1:801348189808:web:102226916715ecc8df3eb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage }; 