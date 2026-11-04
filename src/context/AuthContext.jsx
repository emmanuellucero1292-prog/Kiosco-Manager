import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 login
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // 🚪 logout
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          // 🔥 buscamos datos extra en firestore
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setUser({
              uid: u.uid,
              email: u.email,
              ...snap.data(), // 👈 name + role
            });
          } else {
            setUser({
              uid: u.uid,
              email: u.email,
              name: u.email,
              role: "empleado",
            });
          }
        } catch (err) {
          console.error(err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};