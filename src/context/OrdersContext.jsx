import { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // 📥 CARGAR DESDE LOCALSTORAGE
  useEffect(() => {
    const data = localStorage.getItem("orders");
    if (data) setOrders(JSON.parse(data));
  }, []);

  // 💾 GUARDAR EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // ➕ AGREGAR PEDIDO
  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  // ✏️ EDITAR PEDIDO
  const updateOrder = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === updatedOrder.id ? updatedOrder : o
      )
    );
  };

  // ✅ CAMBIAR ESTADO (HECHO / PENDIENTE)
  const toggleStatus = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, done: !o.done } : o
      )
    );
  };

  // ❌ ELIMINAR PEDIDO
  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        toggleStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};