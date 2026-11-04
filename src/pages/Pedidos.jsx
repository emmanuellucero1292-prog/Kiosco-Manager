import { useContext, useState, useMemo, useRef } from "react";
import { OrdersContext } from "../context/OrdersContext";
import { InventoryContext } from "../context/InventoryContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaTrash,
  FaEdit,
  FaPlus,
  FaCheck,
  FaCopy,
} from "react-icons/fa";

const Pedidos = () => {
  const {
    orders,
    addOrder,
    updateOrder,
    toggleStatus,
    deleteOrder,
  } = useContext(OrdersContext);

  const { products, updateProduct } =
    useContext(InventoryContext);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [modalMsg, setModalMsg] = useState("");

  // 🔥 MODAL CONFIRMACIÓN
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    id: null,
    type: "",
  });

  const inputRef = useRef();

  const today =
    new Date().toISOString().split("T")[0];

  const normalize = (str) =>
    str.toLowerCase().trim();

  // =========================================================
  // FILTRO
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      o.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );
  }, [orders, search]);

  const pending = filteredOrders.filter(
    (o) => !o.done
  );

  const done = filteredOrders.filter(
    (o) => o.done
  );

  // =========================================================
  // SUGERENCIAS
  // =========================================================

  const suggestions = products.filter(
    (p) => p.stock <= 5 && !p.paused
  );

  const currentProduct = products.find(
    (p) =>
      normalize(p.name) ===
      normalize(text)
  );

  // =========================================================
  // AGREGAR ITEM
  // =========================================================

  const addItem = () => {
    if (!text.trim()) return;

    const product = products.find(
      (p) =>
        normalize(p.name) ===
        normalize(text)
    );

    if (
      product &&
      product.stock < quantity
    ) {
      setModalMsg(
        "No hay suficiente stock"
      );
      return;
    }

    setItems((prev) => {
      const exists = prev.find(
        (i) =>
          normalize(i.text) ===
          normalize(text)
      );

      if (exists) {
        return prev.map((i) =>
          normalize(i.text) ===
          normalize(text)
            ? {
                ...i,
                quantity:
                  i.quantity +
                  quantity,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          text,
          quantity,
        },
      ];
    });

    setText("");
    setQuantity(1);

    setTimeout(
      () =>
        inputRef.current?.focus(),
      100
    );
  };

  const removeItem = (index) => {
    setItems(
      items.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // GUARDAR
  // =========================================================

  const handleSave = () => {
    if (!title)
      return setModalMsg(
        "Poné un título"
      );

    if (items.length === 0)
      return setModalMsg(
        "Agregá productos"
      );

    if (!date)
      return setModalMsg(
        "Seleccioná fecha"
      );

    const newOrder = {
      id:
        editingId ||
        Date.now(),

      title,
      items,
      date,
      done: false,
    };

    editingId
      ? updateOrder(newOrder)
      : addOrder(newOrder);

    setTitle("");
    setItems([]);
    setDate("");
    setEditingId(null);

    setTimeout(
      () =>
        inputRef.current?.focus(),
      100
    );
  };

  // =========================================================
  // EDITAR
  // =========================================================

  const handleEdit = (o) => {
    setTitle(o.title);
    setItems([...o.items]);
    setDate(o.date);
    setEditingId(o.id);
  };

  // =========================================================
  // ELIMINAR
  // =========================================================

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      id,
      type: "delete",
    });
  };

  // =========================================================
  // WHATSAPP
  // =========================================================

  const sendWhatsApp = (o) => {
    let msg =
      `📦 *PEDIDO*\n`;

    msg +=
      `📝 ${o.title}\n`;

    msg +=
      `📅 ${o.date}\n\n`;

    o.items.forEach((i) => {
      msg +=
        `• ${i.text} x${i.quantity}\n`;
    });

    msg +=
      `\n✅ Confirmar disponibilidad`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        msg
      )}`
    );
  };

  // =========================================================
  // COPIAR
  // =========================================================

  const copyOrder = (o) => {
    let msg =
      `${o.title}\n`;

    o.items.forEach((i) => {
      msg +=
        `• ${i.text} x${i.quantity}\n`;
    });

    navigator.clipboard.writeText(
      msg
    );
  };

  // =========================================================
  // DUPLICAR
  // =========================================================

  const duplicateOrder = (o) => {
    addOrder({
      ...o,
      id: Date.now(),
      done: false,
    });
  };

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

  const handleToggle = (o) => {
    setConfirmModal({
      show: true,
      id: o.id,
      order: o,
      type: "toggle",
    });
  };

  // =========================================================
  // CONFIRMAR ACCIONES
  // =========================================================

  const confirmAction = () => {
    if (
      confirmModal.type ===
      "delete"
    ) {
      deleteOrder(
        confirmModal.id
      );
    }

    if (
      confirmModal.type ===
      "toggle"
    ) {
      const o =
        confirmModal.order;

      const newStatus =
        !o.done;

      toggleStatus(o.id);

      o.items.forEach(
        (item) => {
          const product =
            products.find(
              (p) =>
                normalize(
                  p.name
                ) ===
                normalize(
                  item.text
                )
            );

          if (product) {
            updateProduct({
              ...product,
              stock: newStatus
                ? Math.max(
                    0,
                    product.stock -
                      item.quantity
                  )
                : product.stock +
                  item.quantity,
            });
          }
        }
      );
    }

    setConfirmModal({
      show: false,
      id: null,
      type: "",
    });
  };

  // =========================================================
  // CARGAR FALTANTES
  // =========================================================

  const loadSuggestions = () => {
    setItems(
      suggestions.map((s) => ({
        text: s.name,
        quantity: 1,
      }))
    );
  };

  const totalItems = items.reduce(
    (acc, i) =>
      acc + i.quantity,
    0
  );

  return (
    <div className="space-y-4 pb-10 text-gray-700 dark:text-white">

      {/* TÍTULO */}
      <h2
        className="
          text-xl
          font-semibold
          text-slate-800
          dark:text-white
        "
      >
        Pedidos
      </h2>

      {/* =====================================================
          STOCK BAJO
      ===================================================== */}

      {suggestions.length > 0 && (
        <div
          className="
            relative
            overflow-hidden

            bg-yellow-50/80
            dark:bg-[#251d05]/80

            p-3
            rounded-xl

            border
            border-yellow-300/70
            dark:border-yellow-400/30

            shadow-lg
            shadow-yellow-300/10
            dark:shadow-yellow-500/10

            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
              gap-3
            "
          >
            <p
              className="
                font-semibold
                text-yellow-700
                dark:text-yellow-300
              "
            >
              ⚠️ Stock bajo (
              {suggestions.length})
            </p>

            <button
              onClick={
                loadSuggestions
              }
              className="
                bg-gradient-to-r
                from-yellow-500
                to-amber-500

                px-3
                py-1
                rounded

                text-white
                text-sm
                font-semibold

                shadow
                shadow-yellow-500/20

                hover:shadow-[0_0_12px_rgba(250,204,21,0.25)]

                transition
              "
            >
              Cargar faltantes
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          BUSCAR PEDIDO
      ===================================================== */}

      <input
        placeholder="Buscar pedido..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="
          w-full

          p-2
          rounded-xl

          bg-white/70
          dark:bg-[#0b1d38]/80

          text-slate-800
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
      />

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div
        className="
          relative

          bg-white/70
          dark:bg-[#06152f]/80

          p-4
          rounded-2xl

          backdrop-blur-xl

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          shadow-xl
          shadow-cyan-300/10
          dark:shadow-cyan-400/10
        "
      >

        {/* TÍTULO */}
        <input
          placeholder="Nombre del pedido"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="
            w-full

            p-2
            mb-3
            rounded-lg

            bg-slate-100
            dark:bg-[#0b1d38]

            text-slate-800
            dark:text-white

            border
            border-cyan-300/40
            dark:border-cyan-400/20

            outline-none

            focus:border-cyan-400

            focus:ring-2
            focus:ring-cyan-300/20

            transition
          "
        />

        {/* PRODUCTO + CANTIDAD */}
        <div className="flex gap-2 flex-wrap mb-2">

          <input
            ref={inputRef}
            list="products"
            placeholder="Producto"
            value={text}
            onChange={(e) =>
              setText(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                e.preventDefault();
                addItem();
              }
            }}
            className="
              p-2
              rounded-lg

              bg-slate-100
              dark:bg-[#0b1d38]

              text-slate-800
              dark:text-white

              border
              border-cyan-300/40
              dark:border-cyan-400/20

              outline-none

              focus:border-cyan-400

              focus:ring-2
              focus:ring-cyan-300/20

              transition
            "
          />

          <datalist id="products">
            {products.map(
              (p) => (
                <option
                  key={p.id}
                  value={p.name}
                />
              )
            )}
          </datalist>

          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) =>
              setQuantity(
                Number(
                  e.target.value
                )
              )
            }
            className="
              w-20
              p-2
              rounded-lg

              bg-slate-100
              dark:bg-[#0b1d38]

              text-slate-800
              dark:text-white

              border
              border-cyan-300/40
              dark:border-cyan-400/20

              outline-none

              focus:border-cyan-400

              transition
            "
          />

          <button
            type="button"
            onClick={addItem}
            className="
              bg-gradient-to-r
              from-blue-600
              to-cyan-500

              px-3
              rounded-lg

              text-white

              border
              border-cyan-300/30

              shadow
              shadow-cyan-400/20

              hover:shadow-[0_0_13px_rgba(0,217,255,0.3)]

              active:scale-95

              transition
            "
          >
            <FaPlus />
          </button>

        </div>

        {/* STOCK */}
        {currentProduct && (
          <p
            className="
              text-xs
              mb-2

              text-slate-500
              dark:text-slate-400
            "
          >
            Stock actual:{" "}
            {currentProduct.stock}
          </p>
        )}

        {/* TOTAL */}
        <p
          className="
            text-xs
            mb-2

            text-slate-600
            dark:text-slate-300
          "
        >
          Total productos:{" "}
          <span
            className="
              font-semibold
              text-cyan-600
              dark:text-cyan-300
            "
          >
            {totalItems}
          </span>
        </p>

        {/* ITEMS */}
        <div className="flex flex-wrap gap-2 mb-3">

          {items.map(
            (item, i) => (
              <motion.div
                key={i}
                layout
                className="
                  px-2
                  py-1
                  rounded-lg

                  flex
                  gap-2
                  items-center

                  bg-cyan-50/70
                  dark:bg-cyan-500/5

                  border
                  border-cyan-200/50
                  dark:border-cyan-400/10

                  text-sm

                  text-slate-700
                  dark:text-slate-200
                "
              >
                {item.text} x
                {item.quantity}

                <button
                  onClick={() =>
                    removeItem(i)
                  }
                  className="
                    text-red-500
                    hover:text-red-400
                    transition
                  "
                >
                  <FaTrash />
                </button>
              </motion.div>
            )
          )}

        </div>

        {/* FECHA + GUARDAR */}
        <div className="flex gap-3 items-end flex-wrap">

          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            className="
              p-2
              rounded-lg

              bg-slate-100
              dark:bg-[#0b1d38]

              text-slate-800
              dark:text-white

              border
              border-cyan-300/40
              dark:border-cyan-400/20

              outline-none

              focus:border-cyan-400

              transition
            "
          />

          <button
            onClick={handleSave}
            className="
              bg-gradient-to-r
              from-blue-600
              to-cyan-500

              px-4
              py-2
              rounded-lg

              text-white
              font-semibold

              border
              border-cyan-300/30

              shadow
              shadow-cyan-400/20

              hover:shadow-[0_0_14px_rgba(0,217,255,0.35)]

              active:scale-95

              transition
            "
          >
            {editingId
              ? "Guardar cambios"
              : "Guardar pedido"}
          </button>

        </div>

      </div>

      {/* =====================================================
          PENDIENTES / HECHOS
      ===================================================== */}

      {[
        {
          title: "Pendientes",
          data: pending,
        },
        {
          title: "Hechos",
          data: done,
        },
      ].map((sec) => (

        <div key={sec.title}>

          <h3
            className="
              font-semibold
              mb-2

              text-slate-800
              dark:text-white
            "
          >
            {sec.title}
          </h3>

          <AnimatePresence>

            {sec.data.map(
              (o) => {

                // 🔥 SOLO PENDIENTES PUEDEN ESTAR ATRASADOS
                const isExpired =
                  !o.done &&
                  o.date < today;

                const daysLate =
                  Math.floor(
                    (new Date() -
                      new Date(
                        o.date
                      )) /
                      (1000 *
                        60 *
                        60 *
                        24)
                  );

                return (
                  <motion.div
                    key={o.id}
                    layout
                    className={`
                      relative
                      overflow-hidden

                      p-3
                      mb-2
                      rounded-xl

                      shadow-lg

                      border

                      transition-all

                      ${
                        o.done
                          ? `
                            bg-emerald-50/70
                            dark:bg-emerald-950/30

                            border-emerald-300/60
                            dark:border-emerald-400/25

                            shadow-emerald-300/5
                            dark:shadow-emerald-500/5
                          `
                          : `
                            bg-white/70
                            dark:bg-[#0b1d38]/80

                            border-cyan-300/50
                            dark:border-cyan-400/25

                            shadow-cyan-300/5
                            dark:shadow-cyan-400/5
                          `
                      }

                      ${
                        isExpired
                          ? `
                            border-red-400
                            dark:border-red-400

                            shadow-red-400/10

                            hover:shadow-[0_0_15px_rgba(248,113,113,0.15)]
                          `
                          : `
                            hover:border-cyan-400/70
                            dark:hover:border-cyan-300/50

                            hover:shadow-[0_0_14px_rgba(0,217,255,0.12)]
                          `
                      }
                    `}
                  >

                    {/* CABECERA */}
                    <div
                      className="
                        flex
                        justify-between
                        items-center
                        gap-3
                      "
                    >
                      <h4
                        className="
                          font-bold

                          text-slate-800
                          dark:text-white
                        "
                      >
                        {o.title}
                      </h4>

                      <span
                        className="
                          text-xs

                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {o.date}
                      </span>
                    </div>

                    {/* ATRASO */}
                    {isExpired && (
                      <span
                        className="
                          inline-block
                          mt-1

                          text-red-500
                          dark:text-red-400

                          text-xs
                          font-semibold
                        "
                      >
                        ⚠️ {daysLate} días
                        atrasado
                      </span>
                    )}

                    {/* ITEMS */}
                    <div className="mt-2">

                      {o.items.map(
                        (i, idx) => (
                          <p
                            key={idx}
                            className="
                              text-sm

                              text-slate-700
                              dark:text-slate-200
                            "
                          >
                            • {i.text} x
                            {i.quantity}
                          </p>
                        )
                      )}

                    </div>

                    {/* BOTONES */}
                    <div
                      className="
                        flex
                        gap-2
                        mt-3
                        flex-wrap
                      "
                    >

                      {/* EDITAR */}
                      <button
                        onClick={() =>
                          handleEdit(o)
                        }
                        className="
                          bg-yellow-500
                          hover:bg-yellow-600

                          px-2
                          py-1
                          rounded

                          text-white

                          flex
                          items-center
                          gap-1

                          shadow
                          shadow-yellow-500/15

                          transition
                        "
                      >
                        <FaEdit />
                        Editar
                      </button>

                      {/* WHATSAPP */}
                      <button
                        onClick={() =>
                          sendWhatsApp(o)
                        }
                        className="
                          bg-green-500
                          hover:bg-green-600

                          px-2
                          py-1
                          rounded

                          text-white

                          flex
                          items-center
                          gap-1

                          shadow
                          shadow-green-500/15

                          transition
                        "
                      >
                        <FaWhatsapp />
                        Enviar
                      </button>

                      {/* COMPLETAR */}
                      <button
                        onClick={() =>
                          handleToggle(o)
                        }
                        className="
                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500

                          px-2
                          py-1
                          rounded

                          text-white

                          flex
                          items-center
                          gap-1

                          shadow
                          shadow-cyan-400/20

                          hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                          transition
                        "
                      >
                        <FaCheck />
                        {o.done
                          ? "Reabrir"
                          : "Completar"}
                      </button>

                      {/* COPIAR */}
                      <button
                        onClick={() =>
                          copyOrder(o)
                        }
                        className="
                          bg-slate-600
                          hover:bg-slate-700

                          dark:bg-slate-700
                          dark:hover:bg-slate-600

                          px-2
                          py-1
                          rounded

                          text-white

                          flex
                          items-center
                          gap-1

                          transition
                        "
                      >
                        <FaCopy />
                        Copiar
                      </button>

                      {/* ELIMINAR */}
                      <button
                        onClick={() =>
                          handleDelete(o.id)
                        }
                        className="
                          bg-red-500
                          hover:bg-red-600

                          px-2
                          py-1
                          rounded

                          text-white

                          flex
                          items-center
                          gap-1

                          shadow
                          shadow-red-500/15

                          transition
                        "
                      >
                        <FaTrash />
                        Eliminar
                      </button>

                    </div>

                  </motion.div>
                );
              }
            )}

          </AnimatePresence>

        </div>
      ))}

      {/* =====================================================
          MODAL MENSAJES
      ===================================================== */}

      <AnimatePresence>
        {modalMsg && (
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
                bg-blue-100
                dark:bg-[#07152f]

                p-5
                rounded-2xl

                w-80

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-400/20

                text-center
              "
            >

              <p
                className="
                  mb-3

                  text-slate-700
                  dark:text-slate-200
                "
              >
                {modalMsg}
              </p>

              <button
                onClick={() =>
                  setModalMsg("")
                }
                className="
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500

                  px-3
                  py-2

                  rounded-lg

                  text-white
                  font-semibold

                  w-full

                  shadow
                  shadow-cyan-400/20

                  hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                  transition
                "
              >
                OK
              </button>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MODAL CONFIRMACIÓN
      ===================================================== */}

      <AnimatePresence>
        {confirmModal.show && (
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
                bg-blue-100
                dark:bg-[#07152f]

                p-5
                rounded-2xl

                w-80

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-400/20
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
                ⚠️ Confirmar
              </h3>

              <p
                className="
                  mb-4
                  text-sm

                  text-slate-600
                  dark:text-slate-300
                "
              >
                {confirmModal.type ===
                "delete"
                  ? "¿Eliminar pedido completo?"
                  : "¿Cambiar estado del pedido?"}
              </p>

              <div
                className="
                  flex
                  justify-end
                  gap-2
                "
              >

                <button
                  onClick={() =>
                    setConfirmModal({
                      show: false,
                      id: null,
                      type: "",
                    })
                  }
                  className="
                    bg-slate-500
                    hover:bg-slate-600

                    px-3
                    py-2
                    rounded-lg

                    text-white

                    transition
                  "
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmAction}
                  className="
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500

                    px-3
                    py-2
                    rounded-lg

                    text-white
                    font-semibold

                    shadow
                    shadow-cyan-400/20

                    hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                    transition
                  "
                >
                  Confirmar
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Pedidos;