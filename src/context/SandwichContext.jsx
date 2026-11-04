import { createContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const SandwichContext = createContext();

export const SandwichProvider = ({ children }) => {
  const [data, setData] = useState({
    mila: { stock: 0, cash: 0, mp: 0, retiro: 0 },
    fiambre: { stock: 0, cash: 0, mp: 0, retiro: 0 }
  });

  const PRICE = {
    mila: 4500,
    fiambre: 1500
  };

  const loadData = async () => {
    const ref = doc(db, "sandwiches", "data");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setData(snap.data());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const save = async (newData) => {
    await setDoc(doc(db, "sandwiches", "data"), newData);
  };

  const addStock = (type, qty) => {
    if (!qty) return;

    const updated = {
      ...data,
      [type]: {
        ...data[type],
        stock: data[type].stock + qty
      }
    };

    setData(updated);
    save(updated);
  };

  const sellSandwich = (type, qty, payment) => {
    const item = data[type];
    if (qty > item.stock) return alert("Sin stock");

    const amount = qty * PRICE[type];

    const updated = {
      ...data,
      [type]: {
        ...item,
        stock: item.stock - qty,
        cash: payment === "efectivo" ? item.cash + amount : item.cash,
        mp: payment === "mp" ? item.mp + amount : item.mp
      }
    };

    setData(updated);
    save(updated);
  };

  const retirar = (type, amount, method) => {
    const item = data[type];
    if (amount > item[method]) return alert("No alcanza");

    const updated = {
      ...data,
      [type]: {
        ...item,
        [method]: item[method] - amount,
        retiro: item.retiro + amount
      }
    };

    setData(updated);
    save(updated);
  };

  const reset = async () => {
    const empty = {
      mila: { stock: 0, cash: 0, mp: 0, retiro: 0 },
      fiambre: { stock: 0, cash: 0, mp: 0, retiro: 0 }
    };
    setData(empty);
    save(empty);
  };

  const resetType = (type) => {
    const updated = {
      ...data,
      [type]: {
        stock: 0,
        cash: 0,
        mp: 0,
        retiro: 0
      }
    };
    setData(updated);
    save(updated);
  };  
  return (
    <SandwichContext.Provider
      value={{ data, addStock, sellSandwich, retirar, reset, resetType }}
    >
      {children}
    </SandwichContext.Provider>
  );
};