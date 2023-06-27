import React, { useEffect } from "react";
import { FirebaseApp } from "firebase/app";
import { app as firebaseApp } from "../../lib/firebaseConfig";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const app: FirebaseApp = firebaseApp;
const auth = getAuth(app);

function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in", user);
      } else {
        console.log("User is signed out");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function signInAnon() {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in anonymously");
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        console.log("Anon sign-in failed!");
      });
  }

  return (
    <div>
      <h1 className="text-6xl font-extrabold text-indigo-800">
        This is a sample text to show the website is running and Tailwind is
        working.
      </h1>
      <button onClick={signInAnon}>Sign In Anonymously</button>
    </div>
  );
}

export default App;
