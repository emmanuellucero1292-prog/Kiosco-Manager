import { useContext } from "react";
import { SalesContext } from "../context/SalesContext";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import {
  FaCashRegister,
  FaHistory,
  FaBoxes
} from "react-icons/fa";

const Footer = () => {
  const { currentSales = [] } =
    useContext(SalesContext) || {};

  const { user } =
    useContext(AuthContext) || {};

  const { section, setSection } =
    useContext(AppContext);

  const totals = currentSales.reduce(
    (acc, s) => {
      if (s.payment === "efectivo") {
        acc.cash += s.total;
      } else if (s.payment === "mp") {
        acc.mp += s.total;
      }

      acc.total += s.total;

      return acc;
    },
    {
      cash: 0,
      mp: 0,
      total: 0
    }
  );

  const isActive = (s) =>
    section === s
      ? `
        text-cyan-600
        dark:text-cyan-300
        font-semibold
        drop-shadow-[0_0_6px_rgba(0,217,255,0.35)]
      `
      : "";

  return (
    <div
      className="
        fixed
        bottom-2
        left-0
        w-full
        flex
        justify-center
        z-[999]
        px-2
      "
    >

      <div
        className="
          relative
          w-full
          max-w-7xl

          backdrop-blur-xl

          bg-white/10
          dark:bg-[#06152f]/85

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          shadow-2xl
          shadow-cyan-300/15
          dark:shadow-cyan-400/15

          rounded-2xl
          px-6
          min-h-[40px]

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
            shadow-[inset_0_0_16px_rgba(0,217,255,0.08)]
            dark:shadow-[inset_0_0_20px_rgba(0,217,255,0.12)]
          "
        />

        {/* CONTENIDO */}
        <div
          className="
            relative
            flex
            items-center
            justify-between
            h-full
          "
        >

          {/* IZQUIERDA */}
          <div
            className="
              hidden
              md:flex
              gap-4

              text-sm

              text-slate-700
              dark:text-slate-300

              z-10
              min-w-[140px]
            "
          >

            {user && (
              <>
                {/* VENTAS */}
                <button
                  onClick={() =>
                    setSection("Ventas")
                  }
                  className={`
                    flex
                    items-center
                    gap-1

                    hover:text-cyan-500
                    dark:hover:text-cyan-300

                    transition

                    ${isActive("Ventas")}
                  `}
                >
                  <FaCashRegister
                    size={18}
                  />
                  Ventas
                </button>

                {/* HISTORIAL */}
                <button
                  onClick={() =>
                    setSection("Historial")
                  }
                  className={`
                    flex
                    items-center
                    gap-1

                    hover:text-cyan-500
                    dark:hover:text-cyan-300

                    transition

                    ${isActive("Historial")}
                  `}
                >
                  <FaHistory
                    size={18}
                  />
                  Historial
                </button>

                {/* STOCK */}
                <button
                  onClick={() =>
                    setSection("Bebidas")
                  }
                  className={`
                    flex
                    items-center
                    gap-1

                    hover:text-cyan-500
                    dark:hover:text-cyan-300

                    transition

                    ${isActive("Bebidas")}
                  `}
                >
                  <FaBoxes
                    size={18}
                  />
                  Stock
                </button>
              </>
            )}

          </div>

          {/* DERECHA */}
          <div
            className="
              hidden
              md:block

              text-right
              text-sm

              text-slate-700
              dark:text-slate-300

              z-10
              min-w-[140px]
            "
          >

            {user && (
              <>
                <p>
                  <span className="text-cyan-600 dark:text-cyan-300">
                    💵
                  </span>{" "}
                  Efectivo : {totals.cash}
                </p>

                <p>
                  <span className="text-cyan-600 dark:text-cyan-300">
                    📲
                  </span>{" "}
                  Mercado : {totals.mp}
                </p>

                <p
                  className="
                    font-bold
                    text-green-500
                    drop-shadow-[0_0_5px_rgba(34,197,94,0.2)]
                  "
                >
                  🧾 Total : ${totals.total}
                </p>
              </>
            )}

          </div>

        </div>

        {/* CENTRO REAL */}
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
          "
        >

          <p
            className="
              text-sm

              text-slate-700
              dark:text-slate-300

              text-center
            "
          >

            ©{" "}
            <strong
              className="
                text-slate-900
                dark:text-white
              "
            >
              Kiosco Manager
            </strong>{" "}
            {new Date().getFullYear()} •{" "}

            <a
              href="https://emaportafolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                pointer-events-auto

                font-semibold

                text-cyan-600
                dark:text-cyan-300

                hover:text-cyan-500
                dark:hover:text-cyan-200

                drop-shadow-[0_0_5px_rgba(0,217,255,0.2)]

                transition

                underline-offset-2
                hover:underline
              "
            >
              EmaMzq
            </a>

          </p>

        </div>

      </div>
    </div>
  );
};

export default Footer;