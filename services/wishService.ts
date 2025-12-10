import { Wish } from '../types';

/* 
  FIREBASE CONFIGURATION INSTRUCTIONS:
  
  To use real Firebase:
  1. Uncomment the imports below.
  2. Paste your firebaseConfig object.
  3. Uncomment the 'real' implementation in the functions.
*/

// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "...",
//   appId: "..."
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const storage = getStorage(app);

// MOCK STORAGE for Demo Purposes (Since we don't have real keys in this environment)
let MOCK_WISHES: Wish[] = [
  {
    id: '1',
    lat: 34.0522,
    lng: -118.2437,
    message: "Hoping for peace and clarity this year.",
    locationName: "Griffith Observatory",
    timestamp: Date.now() - 100000,
    photoUrl: "https://picsum.photos/400/300?random=1"
  },
  {
    id: '2',
    lat: 34.0195,
    lng: -118.4912,
    message: "Found this on my morning walk. Wishing for love.",
    locationName: "Santa Monica Pier",
    timestamp: Date.now() - 50000,
    photoUrl: "https://picsum.photos/400/300?random=2"
  }
];

export const subscribeToWishes = (callback: (wishes: Wish[]) => void) => {
  // --- REAL FIREBASE IMPLEMENTATION ---
  /*
  const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const wishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wish));
    callback(wishes);
  });
  return unsubscribe;
  */

  // --- MOCK IMPLEMENTATION ---
  // Simulate network delay and initial load
  setTimeout(() => callback([...MOCK_WISHES]), 500);

  // Return a dummy unsubscribe function
  return () => {};
};

export const addNewWish = async (wish: Omit<Wish, 'id' | 'timestamp'>, file?: File): Promise<void> => {
  // --- REAL FIREBASE IMPLEMENTATION ---
  /*
  let photoUrl = "";
  if (file) {
    const storageRef = ref(storage, `wishes/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    photoUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "wishes"), {
    ...wish,
    photoUrl,
    timestamp: Date.now()
  });
  */

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve) => {
    setTimeout(() => {
      const newWish: Wish = {
        ...wish,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        // Create a fake object URL for the uploaded file so it displays immediately
        photoUrl: file ? URL.createObjectURL(file) : "https://picsum.photos/400/300?random=3"
      };
      MOCK_WISHES = [newWish, ...MOCK_WISHES];
      // Trigger a "refresh" - in a real app, the listener would handle this
      resolve();
    }, 1000);
  });
};
