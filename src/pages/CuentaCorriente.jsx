import { useContext, useState } from "react";
import { AccountsContext } from "../context/AccountsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaEdit,
  FaTrash,
  FaCheck,
  FaRedo
} from "react-icons/fa";

import jsPDF from "jspdf";

const CuentaCorriente = () => {
  const {
    accounts,
    addAccount,
    getTotalDebt,
    editSale,
    deleteSale,
    resetAccount,
    addPayment
  } = useContext(AccountsContext);

  const [name, setName] = useState("");
  const [openId, setOpenId] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    addAccount(name);
    setName("");
  };

  const getDaysSinceLastSale = (acc) => {
    if (!acc.sales || acc.sales.length === 0) return 0;

    const last = acc.sales[acc.sales.length - 1];
    const parts = last.date.split("/");
    const lastDate = new Date(
      parts[2],
      parts[1] - 1,
      parts[0]
    );

    const today = new Date();

    return Math.floor(
      (today - lastDate) /
        (1000 * 60 * 60 * 24)
    );
  };

  const getInterest = (acc) => {
    const days = getDaysSinceLastSale(acc);
    const debt = getTotalDebt(acc);

    if (days >= 45 && debt > 0) {
      return Math.round(debt * 0.1);
    }

    return 0;
  };

  // =========================================================
  // PDF
  // =========================================================

  const exportPDF = (acc) => {
    const debt = getTotalDebt(acc);
    const interest = getInterest(acc);
    const totalFinal = debt + interest;

    const pdf = new jsPDF();
    let y = 10;

    const addLine = (text, size = 10) => {
      pdf.setFontSize(size);

      const lines = pdf.splitTextToSize(
        text,
        180
      );

      lines.forEach((line) => {
        if (y > 280) {
          pdf.addPage();
          y = 10;
        }

        pdf.text(line, 10, y);
        y += 5;
      });
    };

    addLine("CUENTA CORRIENTE", 14);
    addLine(
      `Fecha: ${new Date().toLocaleString()}`
    );
    addLine(`Cliente: ${acc.name}`);

    addLine("-----------------------------");

    addLine("Ventas:");

    acc.sales?.forEach((s) => {
      addLine(
        `${s.date} - ${s.name} x${s.quantity} - $${s.total}`
      );
    });

    addLine("-----------------------------");

    addLine("Pagos:");

    acc.payments?.forEach((p) => {
      addLine(
        `${p.date} - Pago $${p.amount}`
      );
    });

    addLine("-----------------------------");

    addLine(`Subtotal: $${debt}`);

    if (interest > 0) {
      addLine(
        `Interés (10%): $${interest}`
      );
    }

    addLine(
      "============================="
    );

    addLine(
      `TOTAL: $${totalFinal}`,
      13
    );

    pdf.save(
      `cuenta-${acc.name}.pdf`
    );
  };

  // =========================================================
  // WHATSAPP
  // =========================================================

  const sendWhatsApp = (acc) => {
    const debt = getTotalDebt(acc);
    const interest = getInterest(acc);
    const totalFinal = debt + interest;

    let text =
      `📒 Cuenta corriente - ${acc.name}\n\n`;

    text += `🧾 Ventas:\n`;

    acc.sales?.forEach((s) => {
      text +=
        `${s.date} - ${s.name} x${s.quantity} - $${s.total}\n`;
    });

    text += `\n💸 Pagos:\n`;

    acc.payments?.forEach((p) => {
      text +=
        `${p.date} - Pago $${p.amount}\n`;
    });

    text += `\nSubtotal: $${debt}`;

    if (interest > 0) {
      text +=
        `\nInterés (10%): $${interest}`;
    }

    text += `\n\nTOTAL: $${totalFinal}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        text
      )}`
    );
  };

  return (
    <div className="space-y-4 pb-10 text-gray-700 dark:text-white">

      <h2 className="text-xl font-semibold">
        Cuenta Corriente
      </h2>

      {/* =====================================================
          AGREGAR CUENTA
      ===================================================== */}

      <div
        className="
          relative

          bg-white/75
          dark:bg-[#06152f]/80

          backdrop-blur-xl

          p-3
          rounded-xl

          flex
          gap-2
          flex-wrap

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          shadow-xl
          shadow-cyan-300/10
          dark:shadow-cyan-400/10
        "
      >

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Nombre cliente"
          className="
            flex
            p-2
            rounded-lg

            bg-slate-100
            dark:bg-[#0b1d38]

            text-slate-800
            dark:text-white

            border
            border-slate-300
            dark:border-cyan-500/20

            outline-none

            focus:border-cyan-400
            dark:focus:border-cyan-400

            focus:ring-2
            focus:ring-cyan-300/30

            transition
          "
        />

        <button
          onClick={handleAdd}
          className="
            px-4
            py-2
            rounded-lg

            text-white
            font-semibold

            bg-gradient-to-r
            from-blue-600
            to-cyan-500

            border
            border-cyan-300/30

            shadow-lg
            shadow-cyan-400/20

            hover:shadow-[0_0_14px_rgba(0,217,255,0.35)]

            active:scale-95

            transition
          "
        >
          Agregar
        </button>

      </div>

      {/* =====================================================
          CUENTAS
      ===================================================== */}

      {accounts.map((acc) => {
        const debt = getTotalDebt(acc);
        const interest = getInterest(acc);
        const totalFinal =
          debt + interest;

        const days =
          getDaysSinceLastSale(acc);

        const isPaid = debt <= 0;
        const isLate =
          days >= 7 && debt > 0;

        return (
          <motion.div
            key={acc.id}
            layout
            className="mb-2"
          >

            {/* HEADER CUENTA */}
            <div
              onClick={() =>
                setOpenId(
                  openId === acc.id
                    ? null
                    : acc.id
                )
              }
              className={`
                relative

                p-3
                rounded-xl

                flex
                justify-between
                items-center

                cursor-pointer

                border
                shadow-lg

                transition-all
                duration-200

                ${
                  isPaid
                    ? `
                      bg-emerald-50/80
                      dark:bg-emerald-950/40

                      border-emerald-300/70
                      dark:border-emerald-400/30

                      shadow-emerald-300/10
                      dark:shadow-emerald-500/10
                    `
                    : isLate
                    ? `
                      bg-red-50/80
                      dark:bg-red-950/40

                      border-red-300/70
                      dark:border-red-400/30

                      shadow-red-300/10
                      dark:shadow-red-500/10
                    `
                    : `
                      bg-white/70
                      dark:bg-[#0b1d38]/80

                      border-cyan-300/60
                      dark:border-cyan-400/30

                      shadow-cyan-300/10
                      dark:shadow-cyan-400/10

                      hover:border-cyan-400/70
                      dark:hover:border-cyan-300/50

                      hover:shadow-[0_0_14px_rgba(0,217,255,0.15)]
                    `
                }
              `}
            >

              <span
                className="
                  font-semibold
                  flex
                  items-center
                  gap-2
                "
              >
                {acc.name}

                {isPaid && (
                  <span
                    className="
                      text-emerald-700
                      dark:text-emerald-300

                      text-xs
                      font-semibold
                    "
                  >
                    ✅ Al día
                  </span>
                )}

                {isLate && (
                  <span
                    className="
                      text-red-700
                      dark:text-red-300

                      text-xs
                      font-semibold
                    "
                  >
                    ⚠️ {days} días sin pagar
                  </span>
                )}
              </span>

              <span
                className="
                  font-bold

                  text-cyan-600
                  dark:text-cyan-300

                  drop-shadow-[0_0_5px_rgba(0,217,255,0.2)]
                "
              >
                Total: ${totalFinal}
              </span>

            </div>

            {/* =================================================
                DETALLE
            ================================================= */}

            <AnimatePresence>
              {openId === acc.id && (
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
                  className="overflow-hidden"
                >

                  <div
                    className="
                      mt-2
                      p-3
                      rounded-xl

                      bg-white/60
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

                    {/* BOTONES */}
                    <div className="flex gap-2 mb-3 flex-wrap">

                      <button
                        onClick={() =>
                          sendWhatsApp(acc)
                        }
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

                          hover:scale-[1.02]

                          transition
                        "
                      >
                        <FaWhatsapp />
                        Enviar
                      </button>

                      <button
                        onClick={() =>
                          exportPDF(acc)
                        }
                        className="
                          flex
                          items-center
                          gap-2

                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500

                          px-3
                          py-2

                          rounded-lg

                          text-white
                          text-sm

                          border
                          border-cyan-300/20

                          shadow
                          shadow-cyan-400/20

                          hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                          transition
                        "
                      >
                        📄 PDF
                      </button>

                    </div>

                    {/* VENTAS */}
                    <p
                      className="
                        font-semibold
                        mb-2

                        text-slate-800
                        dark:text-white
                      "
                    >
                      Ventas
                    </p>

                    {acc.sales?.map((s) => (
                      <div
                        key={s.id}
                        className="
                          flex
                          justify-between
                          items-center
                          text-sm
                          mb-2
                          flex-wrap
                          gap-2
                        "
                      >

                        <span
                          className="
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          {s.date} - {s.name} x
                          {s.quantity}
                        </span>

                        {editingSale ===
                        s.id ? (

                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) =>
                              setNewPrice(
                                e.target.value
                              )
                            }
                            className="
                              w-24
                              p-1
                              rounded

                              bg-slate-100
                              dark:bg-[#0b1d38]

                              text-slate-800
                              dark:text-white

                              border
                              border-cyan-300/40
                              dark:border-cyan-400/25

                              outline-none
                              focus:border-cyan-400
                            "
                          />

                        ) : (

                          <span
                            className="
                              text-cyan-600
                              dark:text-cyan-300
                              font-semibold
                            "
                          >
                            ${s.total}
                          </span>

                        )}

                        <div className="flex gap-1">

                          {editingSale !==
                          s.id ? (

                            <button
                              onClick={() => {
                                setEditingSale(
                                  s.id
                                );

                                setNewPrice(
                                  s.total
                                );
                              }}
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

                          ) : (

                            <button
                              onClick={() => {
                                editSale(
                                  acc.id,
                                  s.id,
                                  {
                                    total:
                                      Number(
                                        newPrice
                                      )
                                  }
                                );

                                setEditingSale(
                                  null
                                );
                              }}
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

                                transition
                              "
                            >
                              <FaCheck />
                              Guardar
                            </button>

                          )}

                          <button
                            onClick={() =>
                              deleteSale(
                                acc.id,
                                s.id
                              )
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

                      </div>
                    ))}

                    {/* PAGOS */}
                    <p
                      className="
                        font-semibold
                        mt-3

                        text-slate-800
                        dark:text-white
                      "
                    >
                      Pagos
                    </p>

                    {acc.payments?.map((p) => (
                      <p
                        key={p.id}
                        className="
                          text-cyan-600
                          dark:text-cyan-300
                          text-sm
                        "
                      >
                        💸 {p.date} - $
                        {p.amount}
                      </p>
                    ))}

                    {/* INTERÉS */}
                    {interest > 0 && (
                      <p
                        className="
                          text-red-500
                          dark:text-red-400

                          font-semibold
                          mt-2
                        "
                      >
                        Interés aplicado (10%):
                        ${interest}
                      </p>
                    )}

                    {/* PAGOS */}
                    <div
                      className="
                        flex
                        gap-2
                        mt-3
                        flex-wrap
                      "
                    >

                      <input
                        type="number"
                        placeholder="Monto"
                        value={paymentAmount}
                        onChange={(e) =>
                          setPaymentAmount(
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
                          border-cyan-300/40
                          dark:border-cyan-400/25

                          outline-none

                          focus:border-cyan-400

                          transition
                        "
                      />

                      <button
                        onClick={() => {
                          if (!paymentAmount)
                            return;

                          addPayment(
                            acc.id,
                            Number(
                              paymentAmount
                            )
                          );

                          setPaymentAmount("");
                        }}
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
                        💸 Pagar
                      </button>

                      <button
                        onClick={() => {
                          if (
                            totalFinal <= 0
                          )
                            return;

                          addPayment(
                            acc.id,
                            totalFinal
                          );
                        }}
                        className="
                          bg-green-600
                          hover:bg-green-500

                          px-3
                          py-2

                          rounded-lg

                          text-white
                          font-semibold

                          shadow
                          shadow-green-500/15

                          transition
                        "
                      >
                        ✔ Pagar todo
                      </button>

                    </div>

                    {/* REINICIAR */}
                    <div
                      className="
                        flex
                        gap-2
                        mt-4
                        flex-wrap
                      "
                    >

                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setShowResetModal(
                            true
                          );
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

                          transition
                        "
                      >
                        <FaRedo />
                        Reiniciar Cuenta
                      </button>

                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        );
      })}

      {/* =====================================================
          MODAL REINICIAR
      ===================================================== */}

      <AnimatePresence>
        {showResetModal && (
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
                scale: 0.9,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.9,
                opacity: 0
              }}
              className="
                relative

                bg-blue-50
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
                  mb-2

                  text-slate-900
                  dark:text-white
                "
              >
                Reiniciar cuenta
              </h3>

              <p
                className="
                  text-sm
                  mb-4

                  text-slate-600
                  dark:text-slate-300
                "
              >
                ¿Seguro borrar deuda de{" "}
                <strong>
                  {selectedAccount?.name}
                </strong>
                ?
              </p>

              <div className="flex justify-end gap-2">

                <button
                  onClick={() =>
                    setShowResetModal(false)
                  }
                  className="
                    px-3
                    py-2
                    rounded-lg

                    bg-slate-400
                    hover:bg-slate-500

                    text-white

                    transition
                  "
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    resetAccount(
                      selectedAccount.id
                    );

                    setShowResetModal(false);
                  }}
                  className="
                    px-3
                    py-2
                    rounded-lg

                    bg-red-500
                    hover:bg-red-600

                    text-white

                    shadow
                    shadow-red-500/20

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

export default CuentaCorriente;