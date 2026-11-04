import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryContext } from "../context/InventoryContext";
import { SalesContext } from "../context/SalesContext";
import { AccountsContext } from "../context/AccountsContext";
import { SandwichContext } from "../context/SandwichContext";

const Ventas = () => {
  const { products = [], updateProduct } =
    useContext(InventoryContext);

  const {
    data: sandwiches,
    sellSandwich
  } = useContext(SandwichContext) || {};

  const {
    currentSales = [],
    addSale,
    closeDay
  } = useContext(SalesContext) || {};

  const {
    accounts = [],
    addSaleToAccount
  } = useContext(AccountsContext);

  const [cart, setCart] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [mode, setMode] = useState("normal");
  const [accountId, setAccountId] = useState("");
  const [payment, setPayment] =
    useState("efectivo");

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] =
    useState(false);

  // 🔥 MODALES
  const [showCloseModal, setShowCloseModal] =
    useState(false);

  const [turno, setTurno] = useState("");

  const [modal, setModal] = useState({
    show: false,
    message: "",
  });

  const sandwichProducts = [
    {
      id: "mila",
      name: "🥪 Mila (Yamila)",
      price: 4500,
      stock:
        sandwiches?.mila?.stock || 0,
      isSandwich: true,
      type: "mila",
    },
    {
      id: "fiambre",
      name: "🥪 Fiambre (Gladys)",
      price: 1500,
      stock:
        sandwiches?.fiambre?.stock || 0,
      isSandwich: true,
      type: "fiambre",
    },
  ];

  const allProducts = [
    ...products,
    ...sandwichProducts,
  ];

  const filteredProducts =
    allProducts.filter((p) =>
      p.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const selectedProduct =
    allProducts.find(
      (p) => p.id == productId
    );

  // =========================================================
  // AGREGAR AL CARRITO
  // =========================================================

  const addToCart = () => {

    if (!selectedProduct) {
      setModal({
        show: true,
        message:
          "Seleccioná un producto",
      });

      return;
    }

    if (
      quantity >
      selectedProduct.stock
    ) {
      setModal({
        show: true,
        message:
          "No hay stock suficiente",
      });

      return;
    }

    const existing = cart.find(
      (i) =>
        i.id === selectedProduct.id
    );

    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === selectedProduct.id
            ? {
                ...i,
                quantity:
                  i.quantity +
                  quantity
              }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...selectedProduct,
          quantity,
        },
      ]);
    }

    setProductId("");
    setQuantity(1);
    setSearch("");
    setShowResults(false);
  };

  const removeItem = (id) => {
    setCart(
      cart.filter(
        (i) => i.id !== id
      )
    );
  };

  const cartTotal = cart.reduce(
    (acc, i) =>
      acc +
      i.price *
        i.quantity,
    0
  );

  // =========================================================
  // SOLO VENTAS NORMALES
  // =========================================================

  const safeSales =
    currentSales.filter(
      (s) =>
        s.payment !== "cuenta"
    );

  const totals =
    safeSales.reduce(
      (acc, s) => {

        if (
          s.payment ===
          "efectivo"
        ) {
          acc.cash +=
            s.total;
        } else if (
          s.payment === "mp"
        ) {
          acc.mp +=
            s.total;
        }

        acc.total +=
          s.total;

        return acc;

      },
      {
        cash: 0,
        mp: 0,
        total: 0,
      }
    );

  // =========================================================
  // CONFIRMAR VENTA
  // =========================================================

  const handleSubmit = async () => {

    if (cart.length === 0) {
      setModal({
        show: true,
        message:
          "Agregá productos",
      });

      return;
    }

    const now = new Date();

    const saleGroup = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      payment:
        mode === "normal"
          ? payment
          : "cuenta",

      date:
        now.toLocaleDateString(),
    };

    if (mode === "cuenta") {

      if (!accountId) {
        setModal({
          show: true,
          message:
            "Seleccioná cliente",
        });

        return;
      }

      for (const item of cart) {
        await addSaleToAccount(
          accountId,
          {
            id:
              Date.now() +
              Math.random(),

            name:
              item.name,

            quantity:
              item.quantity,

            total:
              item.price *
              item.quantity,

            date:
              saleGroup.date,
          }
        );
      }

    } else {
      addSale(saleGroup);
    }

    cart.forEach((item) => {

      if (item.isSandwich) {

        sellSandwich(
          item.type,
          item.quantity,
          payment
        );

      } else {

        updateProduct({
          ...item,
          stock:
            item.stock -
            item.quantity,
        });

      }

    });

    setCart([]);

    setModal({
      show: true,
      message:
        "Venta realizada correctamente",
    });
  };

  // =========================================================
  // ABRIR CIERRE
  // =========================================================

  const handleCloseDay = () => {

    if (currentSales.length === 0)
      return;

    setShowCloseModal(true);
  };

  // =========================================================
  // CONFIRMAR CIERRE
  // =========================================================

  const confirmCloseDay = () => {

    if (!turno) {

      setModal({
        show: true,
        message:
          "Ingresá turno",
      });

      return;
    }

    const now = new Date();

    const totalsClose =
      safeSales.reduce(
        (acc, s) => {

          if (
            s.payment ===
            "efectivo"
          ) {
            acc.cash +=
              s.total;
          } else if (
            s.payment === "mp"
          ) {
            acc.mp +=
              s.total;
          }

          acc.total +=
            s.total;

          return acc;

        },
        {
          cash: 0,
          mp: 0,
          total: 0,
        }
      );

    closeDay({
      date:
        now.toLocaleDateString(),

      turno,

      hora:
        now.toLocaleTimeString(),

      totals:
        totalsClose,
    });

    setShowCloseModal(false);

    setTurno("");

    setModal({
      show: true,
      message:
        "Caja cerrada correctamente",
    });
  };

  // =========================================================
  // ⌨️ ATAJOS DE TECLADO
  // =========================================================

  useEffect(() => {

    const handleKeyDown = (e) => {

      const target =
        e.target;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      // =====================================================
      // ESC → CANCELAR / CERRAR
      // =====================================================

      if (e.key === "Escape") {

        if (showCloseModal) {
          setShowCloseModal(false);
          setTurno("");
          return;
        }

        if (modal.show) {
          setModal({
            show: false,
            message: "",
          });
          return;
        }

        if (showResults) {
          setShowResults(false);
          return;
        }

        return;
      }

      // =====================================================
      // F8 → ABRIR CIERRE DE CAJA
      // =====================================================

      if (e.key === "F8") {

        e.preventDefault();

        if (
          !showCloseModal &&
          !modal.show
        ) {
          handleCloseDay();
        }

        return;
      }

      // =====================================================
      // F9 → CONFIRMAR CIERRE
      // =====================================================

      if (e.key === "F9") {

        e.preventDefault();

        if (
          showCloseModal &&
          !modal.show
        ) {
          confirmCloseDay();
        }

        return;
      }

      // =====================================================
      // ENTER → AGREGAR PRODUCTO
      // =====================================================

      if (e.key === "Enter") {

        /*
         * Permitimos Enter en el buscador.
         * En turno/otros campos no ejecutamos
         * ninguna acción global.
         */

        if (
          target.tagName === "INPUT" &&
          target.placeholder === "Buscar..."
        ) {

          e.preventDefault();

          if (
            selectedProduct
          ) {
            addToCart();
          }

          return;
        }

        return;
      }

      // =====================================================
      // ESPACIO → VENDER
      // =====================================================

      if (e.code === "Space") {

        /*
         * Si estamos escribiendo,
         * el espacio pertenece al campo.
         */

        if (isTyping)
          return;

        e.preventDefault();

        if (
          !showCloseModal &&
          !modal.show
        ) {
          handleSubmit();
        }

        return;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [
    cart,
    productId,
    quantity,
    mode,
    accountId,
    payment,
    search,
    showResults,
    showCloseModal,
    modal,
    currentSales,
    turno,
    selectedProduct,
    safeSales,
  ]);

  return (
    <div className="pb-10 text-gray-700 dark:text-white">

      {/* TÍTULO */}
      <h2
        className="
          text-xl
          mb-4
          font-semibold
          text-slate-800
          dark:text-white
        "
      >
        Ventas
      </h2>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div
        className="
          relative
          z-[50]
          overflow-visible

          bg-white/10
          dark:bg-[#06152f]/80

          backdrop-blur-xl

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          shadow-xl
          shadow-cyan-300/10
          dark:shadow-cyan-400/10

          p-3
          rounded-xl

          mb-4

          flex
          flex-wrap
          items-center
          gap-2
        "
      >

        {/* MODO */}
        <select
          value={mode}
          onChange={(e) =>
            setMode(e.target.value)
          }
          className="
            p-2
            rounded-lg
            bg-white/10
            dark:bg-[#0b1d38]
            text-slate-800
            dark:text-white
            border
            border-cyan-300/50
            dark:border-cyan-400/25
            outline-none
            focus:border-cyan-400
            focus:ring-2
            focus:ring-cyan-300/20
            transition
          "
        >
          <option value="normal">
            Venta
          </option>

          <option value="cuenta">
            Cuenta
          </option>
        </select>

        {/* MEDIO DE PAGO */}
        {mode === "normal" && (
          <select
            value={payment}
            onChange={(e) =>
              setPayment(
                e.target.value
              )
            }
            className="
              p-2
              rounded-lg
              bg-white/10
              dark:bg-[#0b1d38]
              text-slate-800
              dark:text-white
              border
              border-cyan-300/50
              dark:border-cyan-400/25
              outline-none
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-300/20
              transition
            "
          >
            <option value="efectivo">
              Efectivo
            </option>

            <option value="mp">
              MP
            </option>
          </select>
        )}

        {/* CLIENTE */}
        {mode === "cuenta" && (
          <select
            value={accountId}
            onChange={(e) =>
              setAccountId(
                e.target.value
              )
            }
            className="
              p-2
              rounded-lg
              bg-white/10
              dark:bg-[#0b1d38]
              text-slate-800
              dark:text-white
              border
              border-cyan-300/50
              dark:border-cyan-400/25
              outline-none
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-300/20
              transition
            "
          >
            <option value="">
              Cliente
            </option>

            {accounts.map(
              (acc) => (
                <option
                  key={acc.id}
                  value={acc.id}
                >
                  {acc.name}
                </option>
              )
            )}
          </select>
        )}

        {/* BUSCADOR */}
        <div
          className="
            relative
            z-[60]
            w-56
          "
        >

          <input
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );

              setShowResults(
                true
              );
            }}
            placeholder="Buscar..."
            className="
              relative
              z-[70]
              w-full
              p-2
              rounded-lg
              bg-white/10
              dark:bg-[#0b1d38]
              text-slate-800
              dark:text-white
              border
              border-cyan-300/50
              dark:border-cyan-400/25
              outline-none
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-300/20
              transition
            "
          />

          {/* RESULTADOS */}
          {showResults &&
            search && (
              <div
                className="
                  absolute
                  left-0
                  top-full
                  mt-1
                  w-full

                  bg-blue-50
                  dark:bg-[#07152f]

                  rounded-xl

                  shadow-2xl

                  border
                  border-cyan-300/60
                  dark:border-cyan-400/30

                  z-[9999]

                  max-h-60
                  overflow-auto
                "
              >

                {filteredProducts.length === 0 ? (
                  <div
                    className="
                      p-3
                      text-sm
                      text-slate-400
                      dark:text-slate-500
                      text-center
                    "
                  >
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProducts.map(
                    (p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setProductId(
                            p.id
                          );

                          setSearch(
                            p.name
                          );

                          setShowResults(
                            false
                          );
                        }}
                        className="
                          p-2
                          hover:bg-cyan-50
                          dark:hover:bg-cyan-500/5
                          cursor-pointer
                          flex
                          justify-between
                          text-slate-700
                          dark:text-slate-200
                          transition
                        "
                      >

                        <span>
                          {p.name}
                        </span>

                        <span
                          className="
                            text-cyan-600
                            dark:text-cyan-300
                            font-semibold
                          "
                        >
                          ${p.price}
                        </span>

                      </div>
                    )
                  )
                )}

              </div>
            )}

        </div>

        {/* CANTIDAD */}
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Number(
                e.target.value
              )
            )
          }
          className="
            w-16
            p-2
            rounded-lg
            bg-white/10
            dark:bg-[#0b1d38]
            text-slate-800
            dark:text-white
            border
            border-cyan-300/50
            dark:border-cyan-400/25
            outline-none
            focus:border-cyan-400
            transition
          "
        />

        {/* AGREGAR */}
        <button
          onClick={addToCart}
          className="
            px-3
            py-2
            rounded-lg
            text-white
            font-semibold
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            border
            border-cyan-300/30
            shadow
            shadow-cyan-400/20
            hover:shadow-[0_0_14px_rgba(0,217,255,0.35)]
            active:scale-95
            transition
          "
        >
          Agregar
          <span className="ml-1 text-xs opacity-70">
            Enter
          </span>
        </button>

        {/* VENDER */}
        <button
          onClick={handleSubmit}
          className="
            px-3
            py-2
            rounded-lg
            text-white
            font-semibold
            bg-green-500
            hover:bg-green-600
            shadow
            shadow-green-500/15
            active:scale-95
            transition
          "
        >
          Vender
          <span className="ml-1 text-xs opacity-70">
            Espacio
          </span>
        </button>

        {/* CERRAR CAJA */}
        <button
          onClick={handleCloseDay}
          className="
            px-3
            py-2
            rounded-lg
            text-white
            font-semibold
            bg-red-500
            hover:bg-red-600
            shadow
            shadow-red-500/15
            active:scale-95
            transition
          "
        >
          Cerrar Caja
          <span className="ml-1 text-xs opacity-70">
            F8
          </span>
        </button>

      </div>

      {/* =====================================================
          CARRITO
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mb-4
          p-3
          rounded-xl
          bg-white/10
          dark:bg-[#07152f]/70
          backdrop-blur-xl
          border
          border-cyan-300/50
          dark:border-cyan-400/25
          shadow-lg
          shadow-cyan-300/5
          dark:shadow-cyan-400/5
        "
      >

        {cart.length === 0 ? (
          <p
            className="
              text-sm
              text-slate-400
              dark:text-slate-500
            "
          >
            Carrito vacío
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="
                flex
                justify-between
                items-center
                mb-2
                px-2
                py-1.5
                rounded-lg
                bg-cyan-50/60
                dark:bg-cyan-500/5
                border
                border-cyan-200/40
                dark:border-cyan-400/10
              "
            >

              <span
                className="
                  text-slate-700
                  dark:text-slate-200
                "
              >
                {item.name} x
                {item.quantity}
              </span>

              <div className="flex gap-2 items-center">

                <span
                  className="
                    text-cyan-600
                    dark:text-cyan-300
                    font-semibold
                  "
                >
                  $
                  {item.price *
                    item.quantity}
                </span>

                <button
                  onClick={() =>
                    removeItem(
                      item.id
                    )
                  }
                  className="
                    text-red-500
                    hover:text-red-400
                    transition
                  "
                >
                  ❌
                </button>

              </div>

            </div>
          ))
        )}

        <p
          className="
            font-bold
            mt-2
            text-slate-800
            dark:text-white
          "
        >
          Total:{" "}
          <span
            className="
              text-cyan-600
              dark:text-cyan-300
            "
          >
            ${cartTotal}
          </span>
        </p>

      </div>

      {/* =====================================================
          TOTALES
      ===================================================== */}

      <div
        className="
          mb-4
          p-3
          rounded-xl
          bg-emerald-100/70
          dark:bg-emerald-950/30
          border
          border-emerald-300/60
          dark:border-emerald-400/20
          shadow-lg
          shadow-emerald-300/5
          dark:shadow-emerald-500/5
        "
      >

        <p
          className="
            text-slate-700
            dark:text-slate-200
          "
        >
          💵 Efectivo:
          ${totals.cash}
        </p>

        <p
          className="
            text-slate-700
            dark:text-slate-200
          "
        >
          📲 Mercado:
          ${totals.mp}
        </p>

        <p
          className="
            font-bold
            text-emerald-600
            dark:text-emerald-300
          "
        >
          🧾 Total:
          ${totals.total}
        </p>

      </div>

      {/* =====================================================
          HISTORIAL
      ===================================================== */}

      <h3
        className="
          font-bold
          mb-2
          text-slate-800
          dark:text-white
        "
      >
        Ventas del día
      </h3>

      {safeSales.map(
        (sale, i) => (
          <div
            key={sale.id}
            className="
              relative
              overflow-hidden
              bg-white/70
              dark:bg-[#0b1d38]/80
              border
              border-cyan-300/50
              dark:border-cyan-400/25
              p-3
              mb-2
              rounded-xl
              shadow-lg
              shadow-cyan-300/5
              dark:shadow-cyan-400/5
            "
          >

            <p
              className="
                font-semibold
                text-slate-800
                dark:text-white
              "
            >
              Venta #{i + 1}
            </p>

            {sale.items?.map(
              (it, idx) => (
                <div
                  key={idx}
                  className="
                    flex
                    justify-between
                    text-sm
                    text-slate-700
                    dark:text-slate-200
                  "
                >
                  <span>
                    {it.name} x
                    {it.quantity}
                  </span>

                  <span
                    className="
                      text-cyan-600
                      dark:text-cyan-300
                      font-semibold
                    "
                  >
                    $
                    {it.price *
                      it.quantity}
                  </span>
                </div>
              )
            )}

            <div className="flex justify-between mt-2">

              <span
                className="
                  text-sm
                  font-bold
                  text-slate-600
                  dark:text-slate-300
                "
              >
                {sale.payment ===
                  "efectivo" &&
                  "💵 Efectivo"}

                {sale.payment ===
                  "mp" &&
                  "📲 Mercado Pago"}
              </span>

              <span
                className="
                  text-green-500
                  font-bold
                "
              >
                ${sale.total}
              </span>

            </div>

          </div>
        )
      )}

      {/* =====================================================
          MODAL CIERRE
      ===================================================== */}

      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            className="
              fixed
              inset-0
              bg-black/50
              backdrop-blur-sm
              flex
              items-center
              justify-center
              z-50
              p-4
            "
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
          >

            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.8,
                opacity: 0
              }}
              className="
                bg-white
                dark:bg-[#07152f]
                p-6
                rounded-2xl
                shadow-2xl
                shadow-cyan-400/20
                w-80
                text-center
                border
                border-cyan-300/70
                dark:border-cyan-400/40
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  mb-3
                  text-slate-800
                  dark:text-white
                "
              >
                🧾 Cierre de Caja
              </h3>

              <div
                className="
                  text-left
                  mb-4
                  text-slate-700
                  dark:text-slate-200
                "
              >

                <p>
                  💵 Efectivo:
                  ${totals.cash}
                </p>

                <p>
                  📲 MP:
                  ${totals.mp}
                </p>

                <p className="font-bold">
                  Total:
                  ${totals.total}
                </p>

              </div>

              <input
                value={turno}
                onChange={(e) =>
                  setTurno(
                    e.target.value
                  )
                }
                placeholder="Turno"
                className="
                  w-full
                  p-2
                  rounded-lg
                  mb-4
                  bg-slate-100
                  dark:bg-[#0b1d38]
                  text-slate-800
                  dark:text-white
                  border
                  border-cyan-300/50
                  dark:border-cyan-400/25
                  outline-none
                  focus:border-cyan-400
                  transition
                "
              />

              <div
                className="
                  flex
                  justify-center
                  gap-3
                "
              >

                <button
                  onClick={
                    confirmCloseDay
                  }
                  className="
                    bg-green-500
                    hover:bg-green-600
                    px-4
                    py-2
                    rounded-lg
                    text-white
                    font-semibold
                    transition
                  "
                >
                  Confirmar
                  <span className="ml-1 text-xs opacity-70">
                    F9
                  </span>
                </button>

                <button
                  onClick={() =>
                    setShowCloseModal(
                      false
                    )
                  }
                  className="
                    bg-red-500
                    hover:bg-red-600
                    px-4
                    py-2
                    rounded-lg
                    text-white
                    font-semibold
                    transition
                  "
                >
                  Cancelar
                  <span className="ml-1 text-xs opacity-70">
                    Esc
                  </span>
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MODAL GENERAL
      ===================================================== */}

      <AnimatePresence>
        {modal.show && (
          <motion.div
            className="
              fixed
              inset-0
              bg-black/50
              backdrop-blur-sm
              flex
              items-center
              justify-center
              z-[9999]
              p-4
            "
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
          >

            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.8,
                opacity: 0
              }}
              className="
                bg-white
                dark:bg-[#07152f]
                p-5
                rounded-2xl
                shadow-2xl
                shadow-cyan-400/20
                w-80
                text-center
                border
                border-cyan-300/70
                dark:border-cyan-400/40
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  mb-3
                  text-slate-800
                  dark:text-white
                "
              >
                ⚠️ Atención
              </h3>

              <p
                className="
                  mb-4
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                "
              >
                {modal.message}
              </p>

              <button
                onClick={() =>
                  setModal({
                    show: false,
                    message: "",
                  })
                }
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  hover:shadow-[0_0_14px_rgba(0,217,255,0.35)]
                  px-4
                  py-2
                  rounded-lg
                  text-white
                  font-semibold
                  transition
                "
              >
                OK
              </button>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Ventas;