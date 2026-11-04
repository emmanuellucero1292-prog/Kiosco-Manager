import { useContext, useState } from "react";
import { InventoryContext } from "../context/InventoryContext";
import { AppContext } from "../context/AppContext";
import {
  FaEdit,
  FaTrash,
  FaPause,
  FaPlay
} from "react-icons/fa";

const ProductList = () => {
  const {
    products,
    deleteProduct,
    togglePauseProduct
  } = useContext(InventoryContext);

  const {
    section,
    search
  } = useContext(AppContext);

  const [sort, setSort] = useState("name");
  const [subFilter, setSubFilter] = useState("all");

  // 🔍 NORMALIZADOR
  const normalize = (text) =>
    (text || "").toString().toLowerCase().trim();

  // 🔍 FILTRO + ORDEN
  const filtered = products
    .filter((p) => {
      if (!p || !p.name) return false;

      const matchesSearch =
        normalize(p.name).includes(
          normalize(search)
        );

      if (search.trim() !== "") {
        return matchesSearch;
      }

      const matchesSection =
        normalize(p.category) ===
        normalize(section);

      const matchesSub =
        subFilter === "all" ||
        (subFilter === "paused" && p.paused) ||
        normalize(p.subcategory) ===
          normalize(subFilter);

      return (
        matchesSection &&
        matchesSub
      );
    })
    .sort((a, b) => {
      if (sort === "price") {
        return a.price - b.price;
      }

      return a.name.localeCompare(b.name);
    });

  // ✏️ EDITAR
  const handleEdit = (product) => {
    window.dispatchEvent(
      new CustomEvent("editProduct", {
        detail: product
      })
    );
  };

  return (
    <div>

      {/* 🔎 BÚSQUEDA */}
      {search && (
        <p
          className="
            text-sm
            text-cyan-600
            dark:text-cyan-300
            mb-2
            font-medium
          "
        >
          🔍 Resultados globales para: "{search}"
        </p>
      )}

      {/* 🎛️ CONTROLES */}
      {!search && (
        <div className="flex gap-2 mb-3 flex-wrap">

          {/* ORDEN */}
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="
              p-2
              rounded-lg

              bg-white/10
              dark:bg-[#0b1d38]/80

              text-slate-700
              dark:text-white

              border
              border-cyan-300/60
              dark:border-cyan-400/30

              outline-none

              focus:border-cyan-400
              dark:focus:border-cyan-300

              focus:ring-2
              focus:ring-cyan-300/20

              transition
            "
          >
            <option value="name">
              A-Z
            </option>

            <option value="price">
              Precio
            </option>
          </select>

          {/* SUBCATEGORIA */}
          <select
            value={subFilter}
            onChange={(e) =>
              setSubFilter(e.target.value)
            }
            className="
              p-2
              rounded-lg

              bg-white/10
              dark:bg-[#0b1d38]/80

              text-slate-700
              dark:text-white

              border
              border-cyan-300/60
              dark:border-cyan-400/30

              outline-none

              focus:border-cyan-400
              dark:focus:border-cyan-300

              focus:ring-2
              focus:ring-cyan-300/20

              transition
            "
          >
            <option value="all">
              Todo
            </option>

            <option value="paused">
              ⏸️ Pausados
            </option>

            {section === "Bebidas" && (
              <>
                <option>
                  Gaseosas
                </option>

                <option>
                  Cervezas
                </option>

                <option>
                  Jugos
                </option>

                <option>
                  Energéticas
                </option>

                <option>
                  Aguas
                </option>
              </>
            )}

            {section === "Kiosco" && (
              <>
                <option>
                  Alfajores
                </option>

                <option>
                  Galletas
                </option>

                <option>
                  Golosinas
                </option>
              </>
            )}

            {section === "Cigarros" && (
              <>
                <option>
                  Box
                </option>

                <option>
                  Comun
                </option>

                <option>
                  Convertibles
                </option>

                <option>
                  Analgesicos
                </option>
              </>
            )}

            {section === "Almacen" && (
              <>
                <option>
                  Lacteos
                </option>

                <option>
                  Secos
                </option>

                <option>
                  Limpieza
                </option>

                <option>
                  Perfumeria
                </option>

                <option>
                  Cocina
                </option>

                <option>
                  Libreria
                </option>
              </>
            )}
          </select>

        </div>
      )}

      {/* ❌ SIN PRODUCTOS */}
      {filtered.length === 0 ? (

        <p
          className="
            text-slate-400
            dark:text-slate-500
            py-4
          "
        >
          No hay productos.
        </p>

      ) : (

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            gap-3
          "
        >

          {filtered.map((p) => (

            <div
              key={p.id}
              className={`
                relative

                p-3
                rounded-xl

                border

                shadow-lg

                transition-all
                duration-100

                ${
                  p.paused
                    ? `
                      bg-slate-300/50
                      dark:bg-slate-800/80

                      border-slate-400/40
                      dark:border-slate-600/40

                      opacity-60
                      grayscale
                    `
                    : `
                      bg-white/10
                      dark:bg-[#0b1d38]/80

                      border-cyan-300/50
                      dark:border-cyan-400/25

                      text-slate-700
                      dark:text-white

                      shadow-cyan-300/5
                      dark:shadow-cyan-400/5

                      hover:scale-[1.03]

                      hover:border-cyan-400/70
                      dark:hover:border-cyan-300/50

                      hover:shadow-[0_0_16px_rgba(0,217,255,0.18)]
                    `
                }
              `}
            >

              {/* 🔥 GLOW INTERNO */}
              {!p.paused && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-xl

                    shadow-[inset_0_0_15px_rgba(0,217,255,0.04)]
                  "
                />
              )}

              {/* 🔥 BADGE ESTADO */}
              <div className="absolute top-2 right-2">

                <span
                  className={`
                    flex
                    items-center
                    gap-1

                    text-xs
                    px-2
                    py-1

                    rounded-full
                    font-semibold
                    shadow

                    ${
                      p.paused
                        ? `
                          bg-slate-700
                          text-white
                        `
                        : `
                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500

                          text-white

                          shadow-cyan-400/20
                        `
                    }
                  `}
                >

                  {p.paused ? (
                    <>
                      <FaPause className="text-[10px]" />
                      Pausado
                    </>
                  ) : (
                    <>
                      <FaPlay className="text-[10px]" />
                      Activo
                    </>
                  )}

                </span>

              </div>

              {/* 🔥 BADGE STOCK */}
              {!p.paused &&
                p.stock <= 5 && (

                  <span
                    className="
                      absolute
                      top-2
                      left-2

                      text-[10px]

                      px-2
                      py-1

                      rounded-full
                      font-semibold

                      bg-red-500
                      text-white

                      shadow
                      shadow-red-500/20
                    "
                  >
                    Bajo stock
                  </span>

                )}

              {/* INFO */}
              <p
                className="
                  font-semibold
                  text-sm
                  mt-6

                  text-slate-800
                  dark:text-white
                "
              >
                {p.name}
              </p>

              <p
                className="
                  text-xs
                  opacity-70

                  text-slate-500
                  dark:text-slate-300
                "
              >
                {p.subcategory ||
                  "Sin subcategoría"}
              </p>

              <p
                className="
                  text-cyan-600
                  dark:text-cyan-300

                  text-sm
                  font-bold

                  mt-1
                "
              >
                ${p.price}
              </p>

              <p
                className="
                  text-xs
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Stock: {p.stock}
              </p>

              {/* BOTONES */}
              <div
                className="
                  flex
                  gap-1
                  mt-2
                  flex-wrap
                "
              >

                {/* EDITAR */}
                <button
                  onClick={() =>
                    handleEdit(p)
                  }
                  className="
                    bg-gradient-to-r
                    from-yellow-500
                    to-amber-500

                    px-2
                    py-1
                    rounded

                    text-white
                    text-xs

                    flex
                    items-center
                    gap-1

                    shadow
                    shadow-yellow-500/15

                    hover:scale-105

                    transition
                  "
                >
                  <FaEdit />
                  Editar
                </button>

                {/* ELIMINAR */}
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Eliminar producto?"
                      )
                    ) {
                      deleteProduct(p.id);
                    }
                  }}
                  className="
                    bg-red-500
                    hover:bg-red-600

                    px-2
                    py-1
                    rounded

                    text-white
                    text-xs

                    flex
                    items-center
                    gap-1

                    shadow
                    shadow-red-500/15

                    hover:scale-105

                    transition
                  "
                >
                  <FaTrash />
                  Eliminar
                </button>

                {/* PAUSAR / ACTIVAR */}
                <button
                  onClick={() =>
                    togglePauseProduct(p)
                  }
                  className={`
                    px-2
                    py-1
                    rounded

                    text-white
                    text-xs

                    flex
                    items-center
                    gap-1

                    hover:scale-105

                    transition

                    ${
                      p.paused
                        ? `
                          bg-green-600
                          hover:bg-green-500

                          shadow
                          shadow-green-500/15
                        `
                        : `
                          bg-slate-600
                          dark:bg-slate-700

                          hover:bg-cyan-700

                          shadow
                          shadow-cyan-400/10
                        `
                    }
                  `}
                >

                  {p.paused ? (
                    <>
                      <FaPlay />
                      Activar
                    </>
                  ) : (
                    <>
                      <FaPause />
                      Pausar
                    </>
                  )}

                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProductList;