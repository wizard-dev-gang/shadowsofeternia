import React, { useState, useEffect } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [authing, setAuthing] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 500); // Start fade-in after 500ms

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthing(true);

    signInWithPopup(auth, new GoogleAuthProvider())
      .then((response) => {
        console.log("Successfully signed in as:", response.user.uid);
        navigate("/");
      })
      .catch((error) => {
        console.error("Sign-in failed:", error);
        setAuthing(false);
      });
  };

  const signInAnonymous = async () => {
    setAuthing(true);

    // inform the user about the consequences of signing in anonymously
    const confirmed = window.confirm(
      "You're about to sign in as an anonymous user. If you refresh or close the browser, your data will be lost. Are you sure you want to continue?"
    );

    if (!confirmed) {
      setAuthing(false);
      return;
    }

    signInAnonymously(auth)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Successfully signed in as:", user?.uid);
        //Set isAnonymous flag in local storage
        window.localStorage.setItem("isAnonymous", "true");
        navigate("/");
      })
      .catch((error) => {
        console.error("Sign-in failed:", error);
        setAuthing(false);
      });
  };

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gray-800 text-white p-8 rounded-lg ${
        fadeIn ? "opacity-100 transition-opacity duration-500" : "opacity-0"
      }`}
    >
      <h1 className="text-3xl font-bold text-center ">Welcome to</h1>
      <br />
      <p className="soetext">Shadows of Eternia!</p>
      <div className="Login-Wrapper flex flex-col items-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <button
          onClick={signInWithGoogle}
          disabled={authing}
          className="py-2 px-4 bg-blue-500 rounded-md text-white hover:bg-blue-600"
        >
          Sign in with Google
        </button>
        <button
          onClick={signInAnonymous}
          disabled={authing}
          className="py-2 px-4 mt-4 bg-blue-500 rounded-md text-white hover:bg-blue-600"
        >
          Sign in As Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
