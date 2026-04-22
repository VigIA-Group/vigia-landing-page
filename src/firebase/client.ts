import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 1. Importar getAnalytics e isSupported
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_APIKEY,
  authDomain: import.meta.env.PUBLIC_AUTHDOMAIN,
  projectId: import.meta.env.PUBLIC_PROJECTID,
  storageBucket: import.meta.env.PUBLIC_STORAGEBUCKET,
  messagingSenderId: import.meta.env.PUBLIC_MESSAGINGSENDERID,
  appId: import.meta.env.PUBLIC_APPID,
  measurementId: import.meta.env.PUBLIC_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      console.log("Initializing analytics");
      analytics = getAnalytics(app);
      console.log("Initialized");
    }
  });
}
