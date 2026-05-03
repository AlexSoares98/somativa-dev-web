import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtRZQMOkL5xNrUN4Jpm8oAD_LrUxvMKl0",
  authDomain: "atividade-somativa-2-dev-web.firebaseapp.com",
  projectId: "atividade-somativa-2-dev-web",
  storageBucket: "atividade-somativa-2-dev-web.firebasestorage.app",
  messagingSenderId: "153423565472",
  appId: "1:153423565472:web:170049d6a04b3aaf7aefc5",
  measurementId: "G-1N16D0JDXR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };