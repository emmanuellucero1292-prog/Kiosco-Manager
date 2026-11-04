import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

import ProductsList from "../components/ProductsList";
import Ventas from "./Ventas";
import Historial from "./Historial";
import Pedidos from "./Pedidos";
import CuentaCorriente from "./CuentaCorriente";
import ProductModal from "../components/ProductModal";
import DashboardHome from "./DashboardHome";
import Alerts from "../components/Alerts";
import Sandwiches from "./Sandwiches";

const Dashboard = () => {
  const { section } = useContext(AppContext);

  const renderSection = () => {
    switch (section) {
      case "Bebidas":
      case "Kiosco":
      case "Cigarros":
      case "Almacen":
        return (
          <>
            <h2
              className="
                text-xl
                font-semibold
                mb-3

                text-slate-800
                dark:text-white

                drop-shadow-[0_0_5px_rgba(0,217,255,0.08)]
              "
            >
              {section}
            </h2>

            <ProductsList />
          </>
        );

      case "Ventas":
        return <Ventas />;

      case "Historial":
        return <Historial />;

      case "Pedidos":
        return <Pedidos />;

      case "Cuenta":
        return <CuentaCorriente />;

      case "Sandwiches":
        return <Sandwiches />;

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div
      className="
        relative

        backdrop-blur-xl

        bg-white/10
        dark:bg-[#06152f]/80

        border
        border-cyan-300/70
        dark:border-cyan-400/40

        shadow-2xl
        shadow-cyan-300/10
        dark:shadow-cyan-400/10

        rounded-2xl
        mt-4

        flex
        flex-col

        h-full

        overflow-hidden

        transition-all
        duration-300
      "
    >

      {/* GLOW INTERNO */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl

          shadow-[inset_0_0_24px_rgba(0,217,255,0.05)]
          dark:shadow-[inset_0_0_28px_rgba(0,217,255,0.10)]
        "
      />

      {/* ALERTAS */}
      <div className="relative p-4 pb-0 shrink-0">
        <Alerts />
      </div>

      {/* CONTENIDO */}
      <div
        className="
          relative

          flex-1
          overflow-y-auto

          px-4
          pt-2
          pb-20

          scroll-smooth

          scrollbar-thin
          scrollbar-thumb-cyan-400/40
          scrollbar-track-transparent
        "
      >

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.98
            }}
            transition={{
              duration: 0.25
            }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* MODAL + BOTÓN FLOTANTE */}
      <ProductModal />

    </div>
  );
};

export default Dashboard;