import { createContext, useState, useEffect } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // 💾 persistencia
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // 🔔 AGREGAR
  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      message,
      type, // info | success | warning | error
      date: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // ❌ ELIMINAR
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  // 🧹 LIMPIAR TODO
  const clearAll = () => {
    setNotifications([]);
  };

  // 👁 MARCAR COMO LEÍDA
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  // 📭 SOLO NO LEÍDAS
  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};