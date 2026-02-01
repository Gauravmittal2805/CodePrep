import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCkNta5PZKV11N28lFRRtTtJxoqp1eLYv0",
    authDomain: "codeprep-d8400.firebaseapp.com",
    projectId: "codeprep-d8400",
    storageBucket: "codeprep-d8400.firebasestorage.app",
    messagingSenderId: "277516133179",
    appId: "1:277516133179:web:89dbc64f7e8838fb968d1e",
    measurementId: "G-X0YQE95TQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth };
