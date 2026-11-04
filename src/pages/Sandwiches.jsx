import { useContext, useState } from "react";
import { SandwichContext } from "../context/SandwichContext";
import { FaWhatsapp, FaRedo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

const Sandwiches = () => {
  const {
    data,
    addStock,
    retirar,
    resetType
  } = useContext(SandwichContext);

  const [milaQty, setMilaQty] = useState("");
  const [fiambreQty, setFiambreQty] = useState("");

  const [retiro, setRetiro] = useState("");
  const [method, setMethod] = useState("cash");

  const [open, setOpen] = useState(null);

  // 🔥 MODAL
  const [modal, setModal] = useState({
    show: false,
    type: null,
    payload: null,
    message: ""
  });

  const closeModal = () =>
    setModal({
      show: false,
      type: null,
      payload: null,
      message: ""
    });

  // =========================================================
  // WHATSAPP
  // =========================================================

  const sendWhatsApp = (type, item) => {
    const total =
      item.cash + item.mp;

    const retirado =
      (item.retirosCash || 0) +
      (item.retirosMp || 0);

    const caja =
      total - retirado;

    let text =
      `🥪 ${
        type === "mila"
          ? "Mila (Yamila)"
          : "Fiambre (Gladys)"
      }\n\n`;

    text +=
      `💵 Efectivo: $${item.cash}\n`;

    text +=
      `📲 MP: $${item.mp}\n\n`;

    text +=
      `🔻 Retiros:\n`;

    text +=
      `- Efectivo: $${item.retirosCash || 0}\n`;

    text +=
      `- MP: $${item.retirosMp || 0}\n\n`;

    text +=
      `🧾 Total generado: $${total}\n`;

    text +=
      `💼 En caja: $${caja}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        text
      )}`
    );
  };

  // =========================================================
  // PDF
  // =========================================================

  const exportPDF = (type, item) => {
    const total =
      item.cash + item.mp;

    const retirado =
      (item.retirosCash || 0) +
      (item.retirosMp || 0);

    const caja =
      total - retirado;

    const pdf = new jsPDF();

    let y = 10;

    const line = (
      text,
      space = 6
    ) => {
      pdf.text(
        text,
        10,
        y
      );

      y += space;
    };

    pdf.setFontSize(14);

    line(
      "Resumen Sandwiches"
    );

    pdf.setFontSize(10);

    line(
      `Fecha: ${new Date().toLocaleString()}`
    );

    line(
      `Tipo: ${
        type === "mila"
          ? "Mila (Yamila)"
          : "Fiambre (Gladys)"
      }`
    );

    line(
      "--------------------------"
    );

    line(
      `Efectivo: $${item.cash}`
    );

    line(
      `MP: $${item.mp}`
    );

    line(
      "--------------------------"
    );

    line(
      `Retiros efectivo: $${item.retirosCash || 0}`
    );

    line(
      `Retiros MP: $${item.retirosMp || 0}`
    );

    line(
      "--------------------------"
    );

    line(
      `Total generado: $${total}`
    );

    line(
      `En caja: $${caja}`
    );

    pdf.save(
      `sandwich-${type}.pdf`
    );
  };

  return (
    <div className="space-y-4 pb-10 text-gray-700 dark:text-white">

      {/* =====================================================
          TÍTULO
      ===================================================== */}

      <h2
        className="
          text-xl
          font-semibold

          text-slate-800
          dark:text-white
        "
      >
        🥪 Sandwiches
      </h2>

      {/* =====================================================
          PRODUCCIÓN
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden

          backdrop-blur-xl

          bg-white/70
          dark:bg-[#06152f]/80

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          p-4
          rounded-2xl

          shadow-xl
          shadow-cyan-300/10
          dark:shadow-cyan-400/10
        "
      >
        <h3
          className="
            mb-2
            font-medium

            text-slate-800
            dark:text-white
          "
        >
          Producción diaria
        </h3>

        <div className="flex gap-2 flex-wrap">

          {/* MILAS */}
          <input
            type="number"
            placeholder="Milas"
            value={milaQty}
            onChange={(e) =>
              setMilaQty(
                e.target.value
              )
            }
            className="
              p-2
              rounded-lg
              w-24

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

          <button
            onClick={() => {
              addStock(
                "mila",
                Number(milaQty)
              );

              setMilaQty("");
            }}
            className="
              bg-gradient-to-r
              from-blue-600
              to-cyan-500

              px-3
              py-1
              rounded-lg

              text-white
              font-semibold

              shadow
              shadow-cyan-400/20

              hover:shadow-[0_0_13px_rgba(0,217,255,0.3)]

              active:scale-95

              transition
            "
          >
            Agregar Mila
          </button>

          {/* FIAMBRE */}
          <input
            type="number"
            placeholder="Fiambre"
            value={fiambreQty}
            onChange={(e) =>
              setFiambreQty(
                e.target.value
              )
            }
            className="
              p-2
              rounded-lg
              w-24

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

          <button
            onClick={() => {
              addStock(
                "fiambre",
                Number(fiambreQty)
              );

              setFiambreQty("");
            }}
            className="
              bg-gradient-to-r
              from-indigo-600
              to-blue-500

              px-3
              py-1
              rounded-lg

              text-white
              font-semibold

              shadow
              shadow-blue-400/20

              hover:shadow-[0_0_13px_rgba(59,130,246,0.3)]

              active:scale-95

              transition
            "
          >
            Agregar Fiambre
          </button>

        </div>
      </div>

      {/* =====================================================
          SUBSECCIONES
      ===================================================== */}

      {["mila", "fiambre"].map(
        (type) => {
          const item =
            data[type];

          const total =
            item.cash + item.mp;

          const retirado =
            (item.retirosCash || 0) +
            (item.retirosMp || 0);

          const caja =
            total - retirado;

          return (
            <motion.div
              key={type}
              layout
              className="
                relative
                overflow-hidden

                backdrop-blur-xl

                bg-white/70
                dark:bg-[#06152f]/80

                border
                border-cyan-300/60
                dark:border-cyan-400/35

                rounded-2xl

                shadow-xl
                shadow-cyan-300/10
                dark:shadow-cyan-400/10
              "
            >

              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                onClick={() =>
                  setOpen(
                    open === type
                      ? null
                      : type
                  )
                }
                className="
                  p-3
                  cursor-pointer

                  flex
                  justify-between
                  items-center
                  gap-3

                  hover:bg-cyan-50/50
                  dark:hover:bg-cyan-500/5

                  transition
                "
              >

                <span
                  className="
                    font-semibold

                    text-slate-800
                    dark:text-white
                  "
                >
                  {type === "mila"
                    ? "Mila (Yamila)"
                    : "Fiambre (Gladys)"}
                </span>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    flex-wrap
                    justify-end
                  "
                >

                  <div
                    className="
                      text-right
                    "
                  >
                    <p
                      className="
                        font-bold

                        text-cyan-600
                        dark:text-cyan-300
                      "
                    >
                      🧾 Total $:{total}
                    </p>

                    <p
                      className="
                        text-sm
                        font-bold

                        text-green-500
                      "
                    >
                      💼 Caja $:{caja}
                    </p>
                  </div>

                  {/* WHATSAPP */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      sendWhatsApp(
                        type,
                        item
                      );
                    }}
                    className="
                      flex
                      items-center
                      gap-2

                      bg-green-500
                      hover:bg-green-600

                      px-3
                      py-2
                      rounded-lg

                      text-white
                      text-sm

                      shadow
                      shadow-green-500/15

                      hover:scale-[1.03]

                      transition
                    "
                  >
                    <FaWhatsapp
                      size={16}
                    />
                    Enviar
                  </button>

                  {/* PDF */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      exportPDF(
                        type,
                        item
                      );
                    }}
                    className="
                      bg-gradient-to-r
                      from-blue-600
                      to-cyan-500

                      px-3
                      py-2
                      rounded-lg

                      text-white
                      text-sm

                      shadow
                      shadow-cyan-400/20

                      hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                      transition
                    "
                  >
                    📄 PDF
                  </button>

                  {/* REINICIAR */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setModal({
                        show: true,
                        type: "reset",
                        payload: {
                          type
                        },
                        message:
                          "¿Reiniciar mes?"
                      });
                    }}
                    className="
                      flex
                      items-center
                      gap-2

                      bg-red-500
                      hover:bg-red-600

                      px-3
                      py-2
                      rounded-lg

                      text-white
                      text-sm

                      shadow
                      shadow-red-500/15

                      hover:scale-[1.03]

                      transition
                    "
                  >
                    <FaRedo
                      size={16}
                    />
                    Reiniciar
                  </button>

                </div>
              </div>

              {/* =================================================
                  DETALLE
              ================================================= */}

              <AnimatePresence>
                {open === type && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto"
                    }}
                    exit={{
                      opacity: 0,
                      height: 0
                    }}
                    className="
                      border-t
                      border-cyan-200/40
                      dark:border-cyan-400/10
                    "
                  >

                    <div
                      className="
                        p-3
                        space-y-2

                        bg-cyan-50/30
                        dark:bg-cyan-500/5
                      "
                    >

                      <p
                        className="
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        📦 Stock:{" "}
                        {item.stock}
                      </p>

                      <p
                        className="
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        💵 Efectivo: $
                        {item.cash}
                      </p>

                      <p
                        className="
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        📲 Mercado: $
                        {item.mp}
                      </p>

                      <p
                        className="
                          text-red-500
                        "
                      >
                        🔻 Retirado efectivo:
                        $
                        {item.retirosCash ||
                          0}
                      </p>

                      <p
                        className="
                          text-red-500
                        "
                      >
                        🔻 Retirado MP:
                        $
                        {item.retirosMp ||
                          0}
                      </p>

                      <p
                        className="
                          font-bold
                          mt-1

                          text-slate-800
                          dark:text-white
                        "
                      >
                        🧾 Total generado:
                        ${total}
                      </p>

                      <p
                        className="
                          font-bold

                          text-green-500

                          drop-shadow-[0_0_5px_rgba(34,197,94,0.18)]
                        "
                      >
                        💼 En caja:
                        ${caja}
                      </p>

                      {/* RETIRO */}
                      <div
                        className="
                          flex
                          gap-2
                          mt-3
                          flex-wrap
                          items-center
                        "
                      >

                        <input
                          type="number"
                          placeholder="Retiro"
                          value={retiro}
                          onChange={(e) =>
                            setRetiro(
                              e.target.value
                            )
                          }
                          className="
                            p-2
                            w-24
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

                        <select
                          value={method}
                          onChange={(e) =>
                            setMethod(
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
                        >
                          <option value="cash">
                            Efectivo
                          </option>

                          <option value="mp">
                            MP
                          </option>
                        </select>

                        <button
                          onClick={() => {
                            const monto =
                              Number(
                                retiro
                              );

                            if (!monto)
                              return;

                            if (
                              monto >
                              caja
                            ) {
                              setModal({
                                show: true,
                                type: "message",
                                payload: null,
                                message:
                                  "No podés retirar más de lo disponible"
                              });

                              return;
                            }

                            setModal({
                              show: true,
                              type: "retiro",
                              payload: {
                                type,
                                monto,
                                method
                              },
                              message:
                                "¿Confirmar retiro?"
                            });
                          }}
                          className="
                            bg-red-500
                            hover:bg-red-600

                            px-3
                            py-2
                            rounded-lg

                            text-white
                            font-semibold

                            shadow
                            shadow-red-500/15

                            transition
                          "
                        >
                          Retirar
                        </button>

                      </div>

                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        }
      )}

      {/* =====================================================
          MODAL
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

                p-5
                rounded-2xl

                w-80

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-400/20

                text-slate-700
                dark:text-white
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  mb-3
                "
              >
                {modal.type ===
                  "message"
                  ? "Atención"
                  : modal.type ===
                    "reset"
                  ? "Reiniciar"
                  : "Confirmar retiro"}
              </h3>

              <p
                className="
                  mb-4
                  text-sm

                  text-slate-600
                  dark:text-slate-300
                "
              >
                {modal.message ||
                  (modal.type ===
                  "reset"
                    ? "¿Reiniciar mes?"
                    : "¿Confirmar retiro?")}
              </p>

              <div
                className="
                  flex
                  justify-end
                  gap-2
                "
              >

                {modal.type ===
                "message" ? (

                  <button
                    onClick={
                      closeModal
                    }
                    className="
                      bg-gradient-to-r
                      from-blue-600
                      to-cyan-500

                      px-4
                      py-2

                      rounded-lg

                      text-white
                      font-semibold

                      shadow
                      shadow-cyan-400/20

                      transition
                    "
                  >
                    OK
                  </button>

                ) : (

                  <>
                    <button
                      onClick={
                        closeModal
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
                      onClick={() => {

                        if (
                          modal.type ===
                          "reset"
                        ) {
                          resetType(
                            modal
                              .payload
                              .type
                          );
                        }

                        if (
                          modal.type ===
                          "retiro"
                        ) {
                          retirar(
                            modal
                              .payload
                              .type,
                            modal
                              .payload
                              .monto,
                            modal
                              .payload
                              .method
                          );

                          setRetiro(
                            ""
                          );
                        }

                        closeModal();

                      }}
                      className="
                        bg-red-500
                        hover:bg-red-600

                        text-white

                        px-3
                        py-2

                        rounded-lg

                        shadow
                        shadow-red-500/15

                        transition
                      "
                    >
                      Confirmar
                    </button>
                  </>
                )}

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Sandwiches;