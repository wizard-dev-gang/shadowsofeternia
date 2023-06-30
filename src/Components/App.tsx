import GameComponent from "./GameComponent";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { app as firebaseApp } from "../../lib/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  DatabaseReference,
  onValue,
  Query,
  update,
} from "firebase/database";

// Helper function to get a random element from an array
function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to create a random name for the player given a prefix and suffix
function createName() {
  const prefix = randomFromArray([
    "Aelarion",
    "Aerith",
    "Aethelwulf",
    "Alduin",
    "Draven",
    "Drax",
    "Eldrin",
    "Faelan",
    "Gareth",
    "Hawthorne",
    "Isolde",
    "Jareth",
    "Kaelen",
    "Lorelei",
    "Malachi",
    "Nyx",
    "Orin",
    "Peregrine",
    "Quillan",
    "Ravenna",
    "Sorin",
    "Tiberius",
    "Valerian",
    "Xanthe",
    "Yara",
    "Zephyr",
    "Aurelia",
    "Baelor",
    "Cassian",
    "Dorian",
  ]);
  const suffix = randomFromArray([
    "the Wise",
    "the Strong",
    "the Mighty",
    "the Brave",
    "the Bold",
    "the Foolish",
    "the Cursed",
    "the Fierce",
    "the Fearless",
    "the Shadowborn",
    "the Dragonheart",
    "the Radiant",
    "the Valiant",
    "the Enigma",
    "the Stormbringer",
    "the Swift",
    "the Arcane",
    "the Merciless",
    "the Ironclad",
    "the Whisperer",
    "the Wanderer",
    "the Nightwalker",
    "the Shieldbearer",
    "the Deathbringer",
    "the Lorekeeper",
    "the Frostborn",
    "the Moonlit",
    "the Phoenix",
    "the Runebound",
    "the Soulweaver",
  ]);

  return `${prefix} ${suffix}`;
}

  
function App() {
  const playerId = useRef<string | null>(null); // Reference to store the player ID
  const playerRef = useRef<DatabaseReference | null>(null); // Reference to the player in the database
  const isAddedToDatabase = useRef(false);
  const navigate = useNavigate(); // React router hook to navigate between pages
  const [userName, setUserName] = useState<string>(""); // State to store the player's name

  useEffect(() => {
    const auth = getAuth(firebaseApp); // Get the Firebase authentication object
    const user = auth.currentUser;

    if (user) {
      console.log("Logged in as:", user);
      playerId.current = user.uid; // Store the player ID
      const db = getDatabase(firebaseApp); // Get the Firebase database object
      playerRef.current = ref(db, `players/${playerId.current}`); // Reference to the player in the database

      onValue(playerRef.current, (snapshot) => {
        const playerData = snapshot.val();
        if (playerData) {
          // If the player's data already exists in the database, don't override it
          console.log("Player data:", playerData);
          setUserName(playerData.name || "");
          isAddedToDatabase.current = true;
        } else {
          // If the player's data doesn't exist in the database, create it
          set(playerRef.current, {
            id: playerId.current,
            name: createName(),
            level: 2,
            xp: 0,
            hp: 100,
            mp: 100,
            gold: 0,
            inventory: [],
            equipped: {
              weapon: "placeholder",
              armor: "placeholder",
              accessory: "placeholder",
            },
          })
            .then(() => {
              console.log("Player added to database");
              isAddedToDatabase.current = true;
              if (playerRef.current) {
                const query: Query = playerRef.current; // Convert the playerRef.current to a Query
                onValue(query, (snapshot) => {
                  const playerData = snapshot.val();
                  console.log("Player data:", playerData);
                  if (playerData) {
                    setUserName(playerData.name || "");
                  }
                });
              }
            })
            .catch((error) => {
              console.error("Error adding player to database:", error);
            });
        }
      });

      // Only set up onDisconnect listener for anonymous users
      if (user.isAnonymous) {
        window.onbeforeunload = async () => {
          if (playerRef.current) {
            await set(playerRef.current, null); // Delete the user's data
            console.log("Anonymous player data deleted from database");
          }
        };
      }
    } else {
      const isAnonymousStr = window.localStorage.getItem("isAnonymous");
      const isAnonymous = JSON.parse(
        isAnonymousStr !== null ? isAnonymousStr : "false"
      );
      if (isAnonymous) {
        handleSignOut();
        window.localStorage.removeItem("isAnonymous");
        navigate("/login");
      }
      console.error("No user is logged in.");
    }
  });

  const handleSignOut = async () => {
    const auth = getAuth(firebaseApp);
    try {
      if (auth.currentUser?.isAnonymous && playerRef.current) {
        // Remove player's data from the database before signing out if the user is anonymous
        await set(playerRef.current, null);
      }
      await signOut(auth);
      navigate("/login"); // Navigate to login page after sign out
      console.log("Signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function for changing the player's name
  const handleChangeName = (newName: string) => {
    const auth = getAuth(firebaseApp);
    if (auth.currentUser?.isAnonymous) {
      console.log("Anonymous users cannot change their name.");
      return;
    }

    if (playerRef.current) {
      update(playerRef.current, { name: newName })
        .then(() => {
          console.log("Player's name changed successfully.");
        })
        .catch((error) => {
          console.error("Error changing player's name:", error);
        });
    }
  };

  return (
    <div>
      {userName && <h1>Welcome, {userName}!</h1>}
      <h1 className="text-6xl font-extrabold text-indigo-800">
        This is a sample text to show the website is running and Tailwind is
        working.
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleChangeName(e.target[0].value);
        }}
      >
        <input type="text" placeholder="Change Display Name" />
        <button type="submit">Change Name</button>
      </form>
      <button onClick={handleSignOut}>
        Sign out! (Anonymouse users will be deleted from the database)
      </button>
      <GameComponent/>
    </div>
  );
}

export default App;

