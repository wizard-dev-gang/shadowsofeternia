// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDnDWMeiJpXpwlMSfMDCbiM8hhaojp8J2s",
  authDomain: "fir-frontend-ece3c.firebaseapp.com",
  databaseURL: "https://fir-frontend-ece3c-default-rtdb.firebaseio.com",
  projectId: "fir-frontend-ece3c",
  storageBucket: "fir-frontend-ece3c.appspot.com",
  messagingSenderId: "916260554529",
  appId: "1:916260554529:web:7fd64be9142cbcbc0a2060",
  measurementId: "G-8QYMCNLQHE",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
