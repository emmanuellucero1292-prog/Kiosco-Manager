import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { HiSearch } from "react-icons/hi";

const Nav = () => {
  const {
    section,
    setSection,
    search,
    setSearch
  } = useContext(AppContext);

  const buttons = [
    "Bebidas",
    "Kiosco",
    "Cigarros",
    "Almacen",
    "Ventas",
    "Pedidos",
    "Historial",
    "Cuenta"
  ];

  const getPlaceholder = () => {
    switch (section) {
      case "Ventas":
        return "Buscar producto...";
      case "Pedidos":
        return "Buscar pedidos...";
      case "Cuenta":
        return "Buscar cliente...";
      default:
        return "Buscar producto...";
    }
  };

  return (
    <nav
      className="
        sticky top-[72px] z-40

        backdrop-blur-xl

        bg-white/10
        dark:bg-[#06152f]/80

        border
        border-cyan-300/70
        dark:border-cyan-400/40

        shadow-2xl
        shadow-cyan-300/10
        dark:shadow-cyan-400/10

        p-3
        rounded-xl

        flex
        flex-col
        md:flex-row

        gap-3
        justify-between
        items-center

        text-slate-700
        dark:text-white

        transition-all
        duration-100
      "
    >

      {/* GLOW INTERNO */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-xl
          shadow-[inset_0_0_18px_rgba(0,217,255,0.06)]
          dark:shadow-[inset_0_0_20px_rgba(0,217,255,0.10)]
        "
      />

      {/* BOTONES */}
      <div
        className="
          relative
          flex
          gap-2
          flex-wrap
          justify-center
          md:justify-start
        "
      >

        {buttons.map((btn) => {

          const active = section === btn;

          return (
            <button
              key={btn}
              onClick={() => {
                setSection(btn);
                setSearch("");
              }}
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-medium

                transition-all
                duration-100

                active:scale-95

                border

                ${
                  active
                    ? `
                      bg-gradient-to-r
                      from-blue-600
                      to-cyan-500

                      border-cyan-300/50

                      text-white

                      shadow-lg
                      shadow-cyan-400/25

                      scale-[1.05]

                      hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]
                    `
                    : `
                      bg-white/10
                      dark:bg-[#0b1d38]/70

                      border-cyan-200/40
                      dark:border-cyan-400/20

                      text-slate-700
                      dark:text-slate-200

                      hover:bg-cyan-50
                      dark:hover:bg-cyan-500/5

                      hover:border-cyan-400/60
                      dark:hover:border-cyan-400/40

                      hover:text-cyan-600
                      dark:hover:text-cyan-200

                      hover:shadow-[0_0_10px_rgba(0,217,255,0.15)]
                    `
                }
              `}
            >
              {btn}
            </button>
          );
        })}

      </div>

      {/* BUSCADOR */}
      <div
        className="
          relative

          flex
          items-center
          gap-2

          backdrop-blur-md

          bg-white/50
          dark:bg-[#0b1d38]/75

          border
          border-cyan-300/60
          dark:border-cyan-400/30

          px-3
          py-2

          rounded-xl

          w-full
          md:w-64

          transition-all

          focus-within:border-cyan-400
          dark:focus-within:border-cyan-300

          focus-within:shadow-[0_0_15px_rgba(0,217,255,0.22)]
          dark:focus-within:shadow-[0_0_18px_rgba(0,217,255,0.18)]
        "
      >

        <HiSearch
          className="
            text-cyan-600
            dark:text-cyan-300
            text-lg
            shrink-0

            drop-shadow-[0_0_5px_rgba(0,217,255,0.25)]
          "
        />

        <input
          type="text"
          placeholder={getPlaceholder()}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            bg-transparent
            w-full
            outline-none
            text-sm

            text-slate-800
            dark:text-white

            placeholder-slate-500
            dark:placeholder-slate-400
          "
        />

      </div>

    </nav>
  );
};

export default Nav;