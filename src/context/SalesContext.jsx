import { createContext, useState, useEffect } from "react";
import { db } from "../firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [currentSales, setCurrentSales] = useState([]);
  const [history, setHistory] = useState([]);

  // =========================================================
  // FECHA LOCAL YYYY-MM-DD
  // =========================================================

  const getLocalDateKey = () => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FECHA VISIBLE
  // =========================================================

  const getLocalDate = () => {
    return new Date().toLocaleDateString(
      "es-AR"
    );
  };

  // =========================================================
  // HORA LOCAL
  // =========================================================

  const getLocalTime = () => {
    return new Date().toLocaleTimeString(
      "es-AR"
    );
  };

  // =========================================================
  // VENTAS ABIERTAS - FIREBASE REALTIME
  // =========================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "openSales"),
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({
            firebaseId: d.id,
            ...d.data(),
          }))
          .sort(
            (a, b) =>
              (a.createdAt || 0) -
              (b.createdAt || 0)
          );

        setCurrentSales(data);
      },
      (error) => {
        console.error(
          "Error leyendo ventas abiertas:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================================
  // HISTORIAL - FIREBASE REALTIME
  // =========================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sales"),
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .sort((a, b) => {
            const dateA =
              a.fechaKey ||
              a.date ||
              "";

            const dateB =
              b.fechaKey ||
              b.date ||
              "";

            if (dateA !== dateB) {
              return dateB.localeCompare(
                dateA
              );
            }

            return (
              b.hora || ""
            ).localeCompare(
              a.hora || ""
            );
          });

        setHistory(data);
      },
      (error) => {
        console.error(
          "Error leyendo historial:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================================
  // AGREGAR VENTA
  // =========================================================

  const addSale = async (sale) => {
    try {
      const now = new Date();

      const saleToSave = {
        ...sale,

        fechaKey: getLocalDateKey(),

        date: getLocalDate(),

        hora: getLocalTime(),

        createdAt: now.getTime(),
      };

      await addDoc(
        collection(db, "openSales"),
        saleToSave
      );

    } catch (error) {
      console.error(
        "Error guardando venta:",
        error
      );

      throw error;
    }
  };

  // =========================================================
  // CERRAR CAJA
  // =========================================================

  const closeDay = async ({
    date,
    turno,
    hora,
    totals,
  }) => {
    try {
      // -----------------------------------------------------
      // COPIA DE LAS VENTAS ACTUALES
      // -----------------------------------------------------

      const salesToClose = [
        ...currentSales,
      ];

      // -----------------------------------------------------
      // SI NO HAY VENTAS, NO HACER NADA
      // -----------------------------------------------------

      if (
        salesToClose.length === 0
      ) {
        return;
      }

      // -----------------------------------------------------
      // FECHA Y HORA LOCALES
      // -----------------------------------------------------

      const fechaKey =
        getLocalDateKey();

      const fechaVisible =
        date || getLocalDate();

      const horaVisible =
        hora || getLocalTime();

      // -----------------------------------------------------
      // CREAR CIERRE
      // -----------------------------------------------------

      const newDay = {
        date: fechaVisible,

        fechaKey,

        turno,

        hora: horaVisible,

        sales: salesToClose,

        totals:
          totals || {
            cash: 0,
            mp: 0,
            total: 0,
          },

        retiros: {
          cash: 0,
          mp: 0,
        },

        total:
          totals?.total || 0,

        createdAt:
          Date.now(),
      };

      // -----------------------------------------------------
      // GUARDAR HISTORIAL
      // -----------------------------------------------------

      await addDoc(
        collection(db, "sales"),
        newDay
      );

      // -----------------------------------------------------
      // ELIMINAR TODAS LAS VENTAS ABIERTAS
      // -----------------------------------------------------

      const deletePromises =
        salesToClose.map(
          (sale) => {
            if (
              !sale.firebaseId
            ) {
              return null;
            }

            return deleteDoc(
              doc(
                db,
                "openSales",
                sale.firebaseId
              )
            );
          }
        );

      await Promise.all(
        deletePromises.filter(Boolean)
      );

      // -----------------------------------------------------
      // LIMPIAR ESTADO LOCAL
      // -----------------------------------------------------

      setCurrentSales([]);

    } catch (error) {
      console.error(
        "Error cerrando caja:",
        error
      );

      throw error;
    }
  };

  // =========================================================
  // RECALCULAR TOTALES
  // =========================================================

  const calculateTotals = (
    sales
  ) => {
    return sales.reduce(
      (acc, s) => {
        if (
          s.payment ===
          "efectivo"
        ) {
          acc.cash +=
            Number(s.total) || 0;
        }

        if (
          s.payment ===
          "mp"
        ) {
          acc.mp +=
            Number(s.total) || 0;
        }

        acc.total +=
          Number(s.total) || 0;

        return acc;
      },
      {
        cash: 0,
        mp: 0,
        total: 0,
      }
    );
  };

  // =========================================================
  // EDITAR VENTA DEL HISTORIAL
  // =========================================================

  const updateSaleInHistory =
    async (
      dayId,
      saleId,
      updates
    ) => {
      const day =
        history.find(
          (d) =>
            d.id === dayId
        );

      if (!day) return;

      const updatedSales =
        (day.sales || []).map(
          (s) =>
            s.id === saleId
              ? {
                  ...s,
                  ...updates,
                }
              : s
        );

      const newTotals =
        calculateTotals(
          updatedSales
        );

      await updateDoc(
        doc(
          db,
          "sales",
          dayId
        ),
        {
          sales:
            updatedSales,

          totals:
            newTotals,

          total:
            newTotals.total,
        }
      );
    };

  // =========================================================
  // ELIMINAR VENTA DEL HISTORIAL
  // =========================================================

  const deleteSaleFromHistory =
    async (
      dayId,
      saleId
    ) => {
      const day =
        history.find(
          (d) =>
            d.id === dayId
        );

      if (!day) return;

      const updatedSales =
        (day.sales || []).filter(
          (s) =>
            s.id !== saleId
        );

      const newTotals =
        calculateTotals(
          updatedSales
        );

      await updateDoc(
        doc(
          db,
          "sales",
          dayId
        ),
        {
          sales:
            updatedSales,

          totals:
            newTotals,

          total:
            newTotals.total,
        }
      );
    };

  // =========================================================
  // RETIROS
  // =========================================================

  const updateDayTotals =
    async (
      dayId,
      {
        retiroCash,
        retiroMp,
      }
    ) => {
      const safeCash =
        Number(
          retiroCash
        ) || 0;

      const safeMp =
        Number(
          retiroMp
        ) || 0;

      const ref = doc(
        db,
        "sales",
        dayId
      );

      await updateDoc(
        ref,
        {
          retiros: {
            cash: safeCash,
            mp: safeMp,
          },
        }
      );

      setHistory(
        (prev) =>
          prev.map(
            (d) =>
              d.id === dayId
                ? {
                    ...d,
                    retiros: {
                      cash:
                        safeCash,
                      mp:
                        safeMp,
                    },
                  }
                : d
          )
      );
    };

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <SalesContext.Provider
      value={{
        currentSales,

        history,

        addSale,

        closeDay,

        updateSaleInHistory,

        deleteSaleFromHistory,

        updateDayTotals,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export default SalesContext;