import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { app as firebaseApp } from "../../functions/lib/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  DatabaseReference,
  onDisconnect,
  onValue,
  update,
  remove,
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
  // const playerRef = useRef<DatabaseReference>(null); // Reference to the player in the database
  const isAddedToDatabase = useRef(false);
  const navigate = useNavigate(); // React router hook to navigate between pages
  const [userName, setUserName] = useState<string>(""); // State to store the player's name
  const [newName, setNewName] = useState<string>(""); // State to store the new name when editing
  const [anonError, setAnonError] = useState<string>(""); // State to store the error message when trying to change the name of an anonymous user
  const [playerRef, setPlayerRef] = useState<DatabaseReference | null>(null);
  const [userGold, setUserGold] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [equippedWeapon, setEquippedWeapon] = useState<string>("");

  const auth = getAuth(firebaseApp); // Get the Firebase authentication object
  const user = auth.currentUser;
  const db = getDatabase(firebaseApp); // Get the Firebase database object

  useEffect(() => {
    if (user) {
      console.log("Authenticated User Logged in as:", user);
      playerId.current = user.uid; // Store the player ID
      const newPlayerRef = ref(db, `players/${playerId.current}`); // Reference to the player in the database

      setPlayerRef(newPlayerRef);

      // Set up listener for player data in the database
      onValue(newPlayerRef, (snapshot) => {
        const playerData = snapshot.val();
        if (playerData) {
          // If the player's data already exists in the database, don't override it
          // console.log("Player data:", playerData);
          setUserName(playerData.name || "");
          setUserGold(playerData.gold || 0);
          setUserLevel(playerData.level || 1);
          setEquippedWeapon(playerData.equipped.weapon || "");
          isAddedToDatabase.current = true;
          update(newPlayerRef, { online: true });
        } else {
          // If the player's data doesn't exist in the database, create it
          set(newPlayerRef, {
            id: playerId.current,
            name: createName(),
            level: 1,
            xp: 0,
            hp: 100,
            x: 0,
            y: 0,
            mp: 100,
            gold: 0,
            inventory: [],
            equipped: {
              weapon: "None(Placeholder)",
              armor: "None",
              accessory: "None",
            },
            online: true,
          });
        }

        // Set up onDisconnect event to remove player data when disconnected
        if (newPlayerRef) {
          onDisconnect(newPlayerRef)
            .update({ online: false })
            .then(() => {
              console.log(
                "Prepared to remove player from database upon disconnect."
              );
            })
            .catch((error) => {
              console.error("Error setting up onDisconnect:", error);
            });
        }
      });
    } else {
      console.log("Not logged in.");
    }
  }, []);

  const handleSignOut = async () => {
    const auth = getAuth(firebaseApp);
    try {
      if (auth.currentUser?.isAnonymous && playerRef) {
        // Remove player's data from the database before signing out if the user is anonymous
        await remove(playerRef);
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
      setAnonError(
        "Anonymous users cannot change their name. Please Sign Up to Change Your Name!"
      );
      console.log("Anonymous users cannot change their name.");
      return;
    }

    if (playerRef) {
      setAnonError("");
      update(playerRef, { name: newName })
        .then(() => {
          console.log("Player's name changed successfully.");
        })
        .catch((error) => {
          console.error("Error changing player's name:", error);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-8 rounded-lg">
      <h1 className="text-3xl font-bold text-center ">Welcome to</h1>
      <br />
      <p className="soetext">Shadows of Eternia!</p>
      {userName && (
        <div className="transition duration-500">
          <h1 className="text-2xl mt-4 mb-2">
            Welcome, <span className="nameglow">{userName}</span>!
          </h1>
          <p>Level: {userLevel}</p>
          <p>Gold: {userGold}</p>
          <p>Equipped Weapon: {equippedWeapon}</p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleChangeName(newName);
        }}
        className="flex flex-col items-center mt-8"
      >
        <input
          type="text"
          placeholder="Change Display Name"
          className="p-2 text-black placeholder-gray-400 rounded-md mb-4"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        {anonError && <div className="mt-2">{anonError}</div>}
        <button
          type="submit"
          className="mt-4 px-8 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600"
        >
          Change Name
        </button>
      </form>
      <button
        className="mt-4 px-8 py-2 bg-red-500 rounded-md text-white hover:bg-red-600"
        onClick={handleSignOut}
      >
        Sign out!
      </button>
      <Link
        to="/game"
        className="mt-4 px-8 py-2 bg-green-500 rounded-md text-white hover:bg-green-600"
      >
        Play Game!
      </Link>
    </div>
  );
}

export default App;
