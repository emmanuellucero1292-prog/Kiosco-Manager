import { createContext, useState, useEffect } from "react";

export const MilaContext = createContext();

export const MilaProvider = ({ children }) => {
  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem("mila_days");
    return saved ? JSON.parse(saved) : [];
  });

  const [box, setBox] = useState(() => {
    const saved = localStorage.getItem("mila_box");
    return saved
      ? JSON.parse(saved)
      : {
          month: new Date().getMonth(),
          total: 0,
        };
  });

  // 💾 guardar
  useEffect(() => {
    localStorage.setItem("mila_days", JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem("mila_box", JSON.stringify(box));
  }, [box]);

  // 🔄 reset mensual automático
  useEffect(() => {
    const currentMonth = new Date().getMonth();

    if (box.month !== currentMonth) {
      setBox({
        month: currentMonth,
        total: 0,
      });
    }
  }, []);

  // ➕ agregar día
  const addDay = (data) => {
    const ganancia = data.total - data.retiro;

    setDays((prev) => [
      {
        id: Date.now(),
        ...data,
        ganancia,
      },
      ...prev,
    ]);

    setBox((prev) => ({
      ...prev,
      total: prev.total + ganancia,
    }));
  };

  // 🔁 eliminar día
  const deleteDay = (id) => {
    const day = days.find((d) => d.id === id);
    if (!day) return;

    setDays((prev) => prev.filter((d) => d.id !== id));

    setBox((prev) => ({
      ...prev,
      total: prev.total - day.ganancia,
    }));
  };

  // 🧹 reset manual
  const resetMonth = () => {
    if (!confirm("Resetear caja mensual?")) return;

    setDays([]);
    setBox({
      month: new Date().getMonth(),
      total: 0,
    });
  };

  return (
    <MilaContext.Provider
      value={{
        days,
        box,
        addDay,
        deleteDay,
        resetMonth,
      }}
    >
      {children}
    </MilaContext.Provider>
  );
};