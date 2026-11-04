import { useContext, useState, useEffect } from "react";
import { OrdersContext } from "../context/OrdersContext";
import { InventoryContext } from "../context/InventoryContext";
import { NotificationContext } from "../context/NotificationContext";
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const Alerts = () => {
  const { orders } = useContext(OrdersContext);
  const { products } = useContext(InventoryContext);
  const { addNotification } =
    useContext(NotificationContext);

  const [hideOrders, setHideOrders] = useState(
    localStorage.getItem("hideOrders") === "true"
  );

  const [hideStock, setHideStock] = useState(
    localStorage.getItem("hideStock") === "true"
  );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =========================================================
  // PEDIDOS
  // =========================================================

  const todayOrders = orders.filter(
    (o) => o.date === today && !o.done
  );

  // =========================================================
  // STOCK CRÍTICO
  // =========================================================

  const lowStock = products.filter(
    (p) => p.stock <= 2 && !p.paused
  );

  // =========================================================
  // RESET DIARIO
  // =========================================================

  useEffect(() => {
    const lastDate =
      localStorage.getItem("alertDate");

    if (lastDate !== today) {
      localStorage.removeItem(
        "hideOrders"
      );

      localStorage.removeItem(
        "hideStock"
      );

      localStorage.removeItem(
        "notifiedOrders"
      );

      localStorage.removeItem(
        "notifiedStock"
      );

      localStorage.setItem(
        "alertDate",
        today
      );

      // 🔥 volver a mostrar alertas
      setHideOrders(false);
      setHideStock(false);
    }
  }, [today]);

  // =========================================================
  // NOTIFICACIÓN PEDIDOS
  // =========================================================

  useEffect(() => {
    if (todayOrders.length > 0) {
      const notified =
        localStorage.getItem(
          "notifiedOrders"
        );

      if (!notified) {
        const details = todayOrders
          .map((o) => `• ${o.title}`)
          .join("\n");

        addNotification(
          `📦 Pedidos de hoy:\n${details}`,
          "warning"
        );

        localStorage.setItem(
          "notifiedOrders",
          "true"
        );
      }
    }
  }, [todayOrders, addNotification]);

  // =========================================================
  // NOTIFICACIÓN STOCK
  // =========================================================

  useEffect(() => {
    if (lowStock.length > 0) {
      const notified =
        localStorage.getItem(
          "notifiedStock"
        );

      if (!notified) {
        const details = lowStock
          .slice(0, 5)
          .map(
            (p) =>
              `• ${p.name} (${p.stock})`
          )
          .join("\n");

        addNotification(
          `⚠️ Stock crítico:\n${details}`,
          "error"
        );

        localStorage.setItem(
          "notifiedStock",
          "true"
        );
      }
    }
  }, [lowStock, addNotification]);

  // =========================================================
  // NO MOSTRAR NADA
  // =========================================================

  if (
    (todayOrders.length === 0 ||
      hideOrders) &&
    (lowStock.length === 0 ||
      hideStock)
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mb-3">

      <AnimatePresence>

        {/* ===================================================
            PEDIDOS
        =================================================== */}

        {todayOrders.length > 0 &&
          !hideOrders && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              transition={{
                duration: 0.2
              }}
              className="
                relative
                overflow-hidden

                p-3
                rounded-xl

                bg-yellow-50/90
                dark:bg-[#251d05]/85

                text-slate-800
                dark:text-yellow-50

                border
                border-yellow-300/70
                dark:border-yellow-400/30

                shadow-lg
                shadow-yellow-300/10
                dark:shadow-yellow-500/10

                backdrop-blur-xl
              "
            >

              {/* GLOW */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-xl

                  shadow-[inset_0_0_18px_rgba(250,204,21,0.06)]
                  dark:shadow-[inset_0_0_20px_rgba(250,204,21,0.08)]
                "
              />

              {/* CERRAR */}
              <button
                onClick={() => {
                  setHideOrders(true);

                  localStorage.setItem(
                    "hideOrders",
                    "true"
                  );
                }}
                className="
                  absolute
                  top-2
                  right-2

                  w-7
                  h-7

                  flex
                  items-center
                  justify-center

                  rounded-lg

                  text-slate-500
                  dark:text-yellow-200/70

                  hover:text-red-500
                  dark:hover:text-red-400

                  hover:bg-yellow-200/40
                  dark:hover:bg-yellow-500/10

                  transition
                "
              >
                <HiX size={18} />
              </button>

              {/* TÍTULO */}
              <p
                className="
                  relative

                  font-bold
                  mb-1
                  pr-8

                  text-yellow-700
                  dark:text-yellow-300
                "
              >
                📦 Pedidos hoy (
                {todayOrders.length})
              </p>

              {/* LISTA */}
              <div className="relative">

                {todayOrders.map((o) => (
                  <p
                    key={o.id}
                    className="
                      text-sm

                      text-slate-700
                      dark:text-yellow-100/90
                    "
                  >
                    • {o.title}
                  </p>
                ))}

              </div>

            </motion.div>
          )}

        {/* ===================================================
            STOCK CRÍTICO
        =================================================== */}

        {lowStock.length > 0 &&
          !hideStock && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              transition={{
                duration: 0.2
              }}
              className="
                relative
                overflow-hidden

                p-3
                rounded-xl

                bg-red-50/90
                dark:bg-[#260b10]/85

                text-slate-800
                dark:text-red-50

                border
                border-red-300/70
                dark:border-red-400/30

                shadow-lg
                shadow-red-300/10
                dark:shadow-red-500/10

                backdrop-blur-xl
              "
            >

              {/* GLOW */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-xl

                  shadow-[inset_0_0_18px_rgba(248,113,113,0.06)]
                  dark:shadow-[inset_0_0_20px_rgba(248,113,113,0.08)]
                "
              />

              {/* CERRAR */}
              <button
                onClick={() => {
                  setHideStock(true);

                  localStorage.setItem(
                    "hideStock",
                    "true"
                  );
                }}
                className="
                   absolute
    top-2
    right-2

    z-20
    pointer-events-auto

    w-9
    h-9

    flex
    items-center
    justify-center

    rounded-full

    bg-red-500/10
    dark:bg-red-500/10

    text-slate-500
    dark:text-red-200/80

    hover:text-red-500
    dark:hover:text-white

    hover:bg-red-200/50
    dark:hover:bg-red-500/20

    hover:scale-105

    cursor-pointer

    transition
                "
              >
                <HiX size={20} />
              </button>

              {/* TÍTULO */}
              <p
                className="
                  relative

                  font-bold
                  mb-1
                  pr-10

                  text-red-700
                  dark:text-red-300
                "
              >
                ⚠️ Stock crítico (
                {lowStock.length})
              </p>

              {/* LISTA */}
              <div className="relative">

                {lowStock.map((p) => (
                  <p
                    key={p.id}
                    className="
                      text-sm

                      text-slate-700
                      dark:text-red-100/90
                    "
                  >
                    • {p.name} ({p.stock})
                  </p>
                ))}

              </div>

            </motion.div>
          )}

      </AnimatePresence>

    </div>
  );
};

export default Alerts;