import React, { useState } from "react";
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
    <div className="Login-Wrapper">
      <h1>Login</h1>
      <button onClick={signInWithGoogle} disabled={authing}>
        Sign in with Google
      </button>
      <br />
      <button onClick={signInAnonymous} disabled={authing}>
        Sign in Anonymously
      </button>
    </div>
  );
};

export default Login;
