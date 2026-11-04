import { createContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  // 🔄 OBTENER PRODUCTOS
  const getProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));

      const data = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name || "",
        category: d.data().category || "",
        subcategory: d.data().subcategory || "",
        stock: Number(d.data().stock || 0),
        price: Number(d.data().price || 0),
        paused: d.data().paused ?? false // 🔥 clave
      }));

      setProducts(data);

    } catch (err) {
      console.error("❌ Error al obtener productos:", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // ➕ AGREGAR PRODUCTO
  const addProduct = async (product) => {
    try {
      const payload = {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || "",
        stock: Number(product.stock),
        price: Number(product.price),
        paused: false
      };

      const docRef = await addDoc(collection(db, "products"), payload);

      setProducts((prev) => [
        ...prev,
        { id: docRef.id, ...payload }
      ]);

    } catch (err) {
      console.error("❌ Error al agregar producto:", err);
    }
  };

  // ✏️ EDITAR PRODUCTO
  const updateProduct = async (product) => {
    try {
      if (!product || !product.id) return;

      const id = String(product.id);

      if (id.length < 15) {
        alert("Producto viejo, recrealo.");
        return;
      }

      const payload = {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || "",
        stock: Number(product.stock),
        price: Number(product.price),
        paused: product.paused ?? false
      };

      await updateDoc(doc(db, "products", id), payload);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...payload } : p
        )
      );

    } catch (err) {
      console.error("❌ Error al actualizar:", err);
    }
  };

  // ⏸️ TOGGLE PAUSA
  const togglePauseProduct = async (product) => {
    try {
      if (!product?.id) return;

      const newState = !product.paused;

      await updateDoc(doc(db, "products", product.id), {
        paused: newState
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, paused: newState }
            : p
        )
      );

    } catch (err) {
      console.error("❌ Error al pausar:", err);
    }
  };

  // 🗑️ ELIMINAR
  const deleteProduct = async (id) => {
    try {
      const safeId = String(id);

      if (safeId.length < 15) {
        setProducts((prev) =>
          prev.filter((p) => p.id !== safeId)
        );
        return;
      }

      await deleteDoc(doc(db, "products", safeId));

      setProducts((prev) =>
        prev.filter((p) => p.id !== safeId)
      );

    } catch (err) {
      console.error("❌ Error al eliminar:", err);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        togglePauseProduct,
        getProducts
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};