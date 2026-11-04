import { createContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion
} from "firebase/firestore";

export const AccountsContext = createContext();

export const AccountsProvider = ({ children }) => {

  // 📦 ESTADO
  const [accounts, setAccounts] = useState([]);

  // 🔴 REALTIME FIRESTORE
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "accounts"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setAccounts(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // ➕ CREAR CUENTA
  const addAccount = async (name) => {
    try {
      if (!name.trim()) return;

      await addDoc(collection(db, "accounts"), {
        name,
        sales: [],
        payments: [], // 🔥 FIX
        createdAt: new Date()
      });

    } catch (err) {
      console.error("❌ Error al crear cuenta:", err);
    }
  };

  // 💰 AGREGAR VENTA
  const addSaleToAccount = async (accountId, sale) => {
    try {
      await updateDoc(doc(db, "accounts", accountId), {
        sales: arrayUnion(sale)
      });
    } catch (err) {
      console.error("❌ Error al agregar venta:", err);
    }
  };

  // 💸 AGREGAR PAGO
  const addPayment = async (accountId, amount) => {
    try {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return;

      const payment = {
        id: Date.now(),
        amount,
        date: new Date().toLocaleDateString("es-AR")
      };

      const updatedPayments = [
        ...(account.payments || []),
        payment
      ];

      await updateDoc(doc(db, "accounts", accountId), {
        payments: updatedPayments
      });

    } catch (err) {
      console.error("❌ Error al agregar pago:", err);
    }
  };

  // ✏️ EDITAR VENTA
  const editSale = async (accountId, saleId, updatedSale) => {
    try {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return;

      const updatedSales = (account.sales || []).map((s) =>
        s.id === saleId ? { ...s, ...updatedSale } : s
      );

      await updateDoc(doc(db, "accounts", accountId), {
        sales: updatedSales
      });

    } catch (err) {
      console.error("❌ Error al editar venta:", err);
    }
  };

  // ❌ ELIMINAR VENTA
  const deleteSale = async (accountId, saleId) => {
    try {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return;

      const updatedSales = (account.sales || []).filter(
        (s) => s.id !== saleId
      );

      await updateDoc(doc(db, "accounts", accountId), {
        sales: updatedSales
      });

    } catch (err) {
      console.error("❌ Error al eliminar venta:", err);
    }
  };

  // 🧹 REINICIAR CUENTA
  const resetAccount = async (accountId) => {
    try {
      await updateDoc(doc(db, "accounts", accountId), {
        sales: [],
        payments: [] // 🔥 FIX
      });
    } catch (err) {
      console.error("❌ Error al resetear cuenta:", err);
    }
  };

  // 💵 CALCULAR DEUDA REAL
  const getTotalDebt = (account) => {

    const totalSales = (account.sales || []).reduce(
      (acc, s) => acc + (s.total || 0),
      0
    );

    const totalPayments = (account.payments || []).reduce(
      (acc, p) => acc + (p.amount || 0),
      0
    );

    return Math.max(0, totalSales - totalPayments);
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addAccount,
        addSaleToAccount,
        addPayment, // 🔥 FIX
        editSale,
        deleteSale,
        resetAccount,
        getTotalDebt,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};