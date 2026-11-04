import { useContext, useState, useMemo } from "react";
import { SalesContext } from "../context/SalesContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaTrash,
  FaEdit,
  FaCheck,
} from "react-icons/fa";

import jsPDF from "jspdf";

const Historial = () => {
  const {
    history = [],
    updateSaleInHistory,
    deleteSaleFromHistory,
    updateDayTotals,
  } = useContext(SalesContext) || {};

  const [openDayId, setOpenDayId] = useState(null);
  const [openId, setOpenId] = useState(null);

  const [editingSale, setEditingSale] = useState(null);
  const [newQty, setNewQty] = useState(1);

  const [editingRetiro, setEditingRetiro] = useState(null);
  const [retiroCash, setRetiroCash] = useState(0);
  const [retiroMp, setRetiroMp] = useState(0);

  const [modalMsg, setModalMsg] = useState("");

  // =========================================================
  // FECHA AUTOMÁTICA
  // =========================================================

  const parseDate = (dateString) => {
    if (!dateString) return null;

    // DD/MM/YYYY
    if (dateString.includes("/")) {
      const parts = dateString.split("/");

      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);

        return new Date(year, month, day);
      }
    }

    // YYYY-MM-DD
    if (dateString.includes("-")) {
      const parts = dateString.split("-");

      if (
        parts.length === 3 &&
        parts[0].length === 4
      ) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);

        return new Date(year, month, day);
      }
    }

    const date = new Date(dateString);

    return isNaN(date.getTime()) ? null : date;
  };

  const formatDay = (dateString) => {
    const date = parseDate(dateString);

    if (!date) return dateString;

    return new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // =========================================================
  // AGRUPAR TURNOS POR DÍA
  // =========================================================

  const groupedHistory = useMemo(() => {
  const groups = {};

  history.forEach((day) => {
    // ✅ Usar fechaKey de Firebase como fuente principal
    const dateValue =
      day.fechaKey || day.date;

    const date = parseDate(dateValue);

    if (!date) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

    if (!groups[key]) {
      groups[key] = {
        key,
        // ✅ Guardamos la fecha correcta
        date: dateValue,
        days: [],
      };
    }

    groups[key].days.push(day);
  });

  return Object.values(groups).sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    return dateB - dateA;
  });
}, [history]);

  // =========================================================
  // TOTAL REAL
  // =========================================================

  const getRealTotal = (day) => {
    return (
      (day.total || 0) -
      (day.retiros?.cash || 0) -
      (day.retiros?.mp || 0)
    );
  };

  // =========================================================
  // TOTAL POR SECCIONES
  // =========================================================

  const getSectionTotals = (day) => {
    const totals = {
      bebidas: 0,
      kiosco: 0,
      almacen: 0,
      cigarros: 0,
    };

    (day.sales || []).forEach((sale) => {
      sale.items?.forEach((it) => {
        const total = it.price * it.quantity;
        const name = it.name?.toLowerCase() || "";

        if (
          name.includes("coca") ||
          name.includes("manaos") ||
          name.includes("pepsi") ||
          name.includes("fanta") ||
          name.includes("sprite") ||
          name.includes("agua")
        ) {
          totals.bebidas += total;
        } else if (
          name.includes("marlboro") ||
          name.includes("philip") ||
          name.includes("pucho") ||
          name.includes("cig")
        ) {
          totals.cigarros += total;
        } else if (
          name.includes("arroz") ||
          name.includes("aceite") ||
          name.includes("fideo") ||
          name.includes("yerba") ||
          name.includes("azucar")
        ) {
          totals.almacen += total;
        } else {
          totals.kiosco += total;
        }
      });
    });

    return totals;
  };

  // =========================================================
  // WHATSAPP
  // =========================================================

  const exportDay = (day) => {
    let text = `📊 *CIERRE DE CAJA*\n`;
    text += `📅 ${day.date} - ${day.hora}\n`;
    text += `Turno: ${day.turno}\n\n`;

    (day.sales || []).forEach((sale, i) => {
      text += `🧾 *Venta #${i + 1}*\n`;

      sale.items?.forEach((it) => {
        const totalItem = it.price * it.quantity;

        text += `• ${it.name} x${it.quantity} → $${totalItem}\n`;
      });

      text += `Total: $${sale.total}\n`;
      text += `----------------------\n`;
    });

    text += `\n💵 Efectivo: $${day.totals?.cash || 0}`;
    text += `\n📲 Mercado: $${day.totals?.mp || 0}`;

    if (
      (day.retiros?.cash || 0) > 0 ||
      (day.retiros?.mp || 0) > 0
    ) {
      text += `\n\n Retiros:`;
      text += `\n $${day.retiros?.cash || 0}`;
      text += `\n $${day.retiros?.mp || 0}`;
    }

    text += `\n\n *TOTAL FINAL: $${getRealTotal(day)}*`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`
    );
  };

  // =========================================================
  // CARGAR LOGO PARA PDF
  // =========================================================

  const loadLogo = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height
        );

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        reject(
          new Error("No se pudo cargar el logo")
        );
      };

      img.src = "/logo.png";
    });
  };

  // =========================================================
  // PDF
  // =========================================================

  const exportPDF = async (day) => {
    const sectionTotals =
      getSectionTotals(day);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200],
    });

    let y = 10;

    const PAGE_WIDTH = 80;
    const PAGE_HEIGHT = 200;

    const MARGIN_TOP = 8;
    const MARGIN_BOTTOM = 10;
    const MARGIN_LEFT = 5;

    // -------------------------------------------------------
    // NUEVA PÁGINA
    // -------------------------------------------------------

    const newPage = () => {
      pdf.addPage(
        [PAGE_WIDTH, PAGE_HEIGHT],
        "portrait"
      );

      y = MARGIN_TOP;
    };

    // -------------------------------------------------------
    // COMPROBAR ESPACIO
    // -------------------------------------------------------

    const checkPageSpace = (neededSpace = 5) => {
      if (
        y + neededSpace >
        PAGE_HEIGHT - MARGIN_BOTTOM
      ) {
        newPage();
      }
    };

    // -------------------------------------------------------
    // ESCRIBIR LÍNEA
    // -------------------------------------------------------

    const line = (
      text,
      space = 5
    ) => {
      checkPageSpace(space);

      pdf.text(
        String(text),
        MARGIN_LEFT,
        y
      );

      y += space;
    };

    // -------------------------------------------------------
    // CENTRAR
    // -------------------------------------------------------

    const center = (
      text,
      space = 6
    ) => {
      checkPageSpace(space);

      pdf.text(
        String(text),
        PAGE_WIDTH / 2,
        y,
        {
          align: "center",
        }
      );

      y += space;
    };

    // -------------------------------------------------------
    // CARGAR LOGO
    // -------------------------------------------------------

    try {
      const logoData =
        await loadLogo();

      const logoWidth = 42;
      const logoHeight = 28;

      const logoX =
        (PAGE_WIDTH - logoWidth) / 2;

      checkPageSpace(
        logoHeight + 4
      );

      pdf.addImage(
        logoData,
        "PNG",
        logoX,
        y,
        logoWidth,
        logoHeight
      );

      y += logoHeight + 5;

    } catch (error) {
      console.warn(
        "No se pudo cargar el logo:",
        error
      );
    }

    // -------------------------------------------------------
    // ENCABEZADO
    // -------------------------------------------------------

    pdf.setFontSize(12);

    center("CIERRE DE CAJA");

    pdf.setFontSize(9);

    center(
      `${day.date} - ${day.hora}`
    );

    center(
      `Turno: ${day.turno}`
    );

    y += 2;

    line("------------------------");

    // -------------------------------------------------------
    // VENTAS
    // -------------------------------------------------------

    (day.sales || []).forEach(
      (sale, i) => {

        let estimatedSpace = 10;

        sale.items?.forEach(() => {
          estimatedSpace += 9;
        });

        checkPageSpace(
          estimatedSpace
        );

        line(
          `Venta #${i + 1}`
        );

        sale.items?.forEach(
          (it) => {

            const itemTotal =
              it.price *
              it.quantity;

            line(
              `${it.name} x${it.quantity}`
            );

            line(
              `$${itemTotal}`,
              4
            );
          }
        );

        line(
          `Total: $${sale.total}`
        );

        line(
          "------------------------"
        );
      }
    );

    // -------------------------------------------------------
    // SECCIONES
    // -------------------------------------------------------

    checkPageSpace(30);

    line("SECCIONES");

    line(
      `Bebidas: $${sectionTotals.bebidas}`
    );

    line(
      `Kiosco: $${sectionTotals.kiosco}`
    );

    line(
      `Almacen: $${sectionTotals.almacen}`
    );

    line(
      `Cigarros: $${sectionTotals.cigarros}`
    );

    line(
      "------------------------"
    );

    // -------------------------------------------------------
    // MEDIOS DE PAGO
    // -------------------------------------------------------

    line(
      `Efectivo: $${day.totals?.cash || 0}`
    );

    line(
      `MP: $${day.totals?.mp || 0}`
    );

    // -------------------------------------------------------
    // RETIROS
    // -------------------------------------------------------

    if (
      (day.retiros?.cash || 0) > 0 ||
      (day.retiros?.mp || 0) > 0
    ) {
      line(
        "------------------------"
      );

      line("Retiros:");

      line(
        `Efectivo: $${day.retiros?.cash || 0}`
      );

      line(
        `MP: $${day.retiros?.mp || 0}`
      );
    }

    // -------------------------------------------------------
    // TOTAL FINAL
    // -------------------------------------------------------

    checkPageSpace(15);

    line(
      "------------------------"
    );

    const final =
      getRealTotal(day);

    pdf.setFontSize(12);

    center(
      `TOTAL: $${final}`
    );

    // -------------------------------------------------------
    // GUARDAR
    // -------------------------------------------------------

    pdf.save(
      `cierre-${day.date}-${day.turno}.pdf`
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="text-gray-700 dark:text-white pb-10">

      <h2
        className="
          text-xl
          mb-4
          font-semibold

          text-slate-800
          dark:text-white
        "
      >
        Historial de Turnos
      </h2>

      {history.length === 0 && (
        <p className="text-slate-400 dark:text-slate-500">
          No hay historial aún
        </p>
      )}

      {/* =====================================================
          DÍAS
      ===================================================== */}

      {groupedHistory.map((group) => {

        const isDayOpen =
          openDayId === group.key;

        return (
          <motion.div
            key={group.key}
            className="mb-4"
          >

            {/* =================================================
                HEADER DEL DÍA
            ================================================= */}

            <div
              onClick={() =>
                setOpenDayId(
                  isDayOpen
                    ? null
                    : group.key
                )
              }
              className="
                relative
                overflow-hidden

                cursor-pointer

                backdrop-blur-xl

                bg-white/10
                dark:bg-[#06152f]/85

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                p-3
                rounded-xl

                flex
                justify-between
                items-center

                shadow-lg
                shadow-cyan-300/10
                dark:shadow-cyan-400/10

                hover:border-cyan-400
                dark:hover:border-cyan-300

                hover:shadow-[0_0_16px_rgba(0,217,255,0.16)]

                transition-all
              "
            >

              <div>

                <p
                  className="
                    font-semibold
                    capitalize

                    text-slate-800
                    dark:text-white
                  "
                >
                  {formatDay(group.date)}
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {group.days.length}{" "}
                  {group.days.length === 1
                    ? "turno"
                    : "turnos"}
                </p>

              </div>

              <div className="flex items-center">

                <span
                  className="
                    text-xl

                    text-cyan-600
                    dark:text-cyan-300

                    drop-shadow-[0_0_6px_rgba(0,217,255,0.25)]
                  "
                >
                  {isDayOpen
                    ? "▲"
                    : "▼"}
                </span>

              </div>

            </div>

            {/* =================================================
                TURNOS
            ================================================= */}

            <AnimatePresence>
              {isDayOpen && (
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

                  {group.days.map(
                    (day) => (

                      <motion.div
                        key={day.id}
                        className="mt-2"
                      >

                        {/* HEADER TURNO */}
                        <div
                          onClick={() =>
                            setOpenId(
                              openId === day.id
                                ? null
                                : day.id
                            )
                          }
                          className="
                            relative
                            overflow-hidden

                            cursor-pointer

                            backdrop-blur-xl

                            bg-white/10
                            dark:bg-[#0b1d38]/80

                            border
                            border-cyan-200/60
                            dark:border-cyan-400/30

                            p-3
                            rounded-xl

                            flex
                            justify-between

                            shadow-lg
                            shadow-cyan-300/5
                            dark:shadow-cyan-400/5

                            hover:border-cyan-400/70
                            dark:hover:border-cyan-300/50

                            hover:shadow-[0_0_14px_rgba(0,217,255,0.13)]

                            transition-all
                          "
                        >

                          <div>

                            <p
                              className="
                                font-semibold
                                text-slate-800
                                dark:text-white
                              "
                            >
                              {day.turno}
                            </p>

                            <p
                              className="
                                text-xs
                                opacity-70
                                text-slate-500
                                dark:text-slate-300
                              "
                            >
                              {day.hora}
                            </p>

                          </div>

                          <div className="flex flex-col items-end gap-2">

                            <div className="text-right text-sm">

                              <p
                                className="
                                  font-bold

                                  text-cyan-600
                                  dark:text-cyan-300
                                "
                              >
                                🏦 Caja : $
                                {day.total || 0}
                              </p>

                              <p
                                className="
                                  text-slate-600
                                  dark:text-slate-300
                                "
                              >
                                💵Efectivo : $
                                {day.totals?.cash ||
                                  0}

                                <br />

                                📲 Mercado : $
                                {day.totals?.mp ||
                                  0}
                              </p>

                              <p
                                className="
                                  text-green-500
                                  font-bold

                                  drop-shadow-[0_0_5px_rgba(34,197,94,0.18)]
                                "
                              >
                                🧾 Total : $
                                {getRealTotal(
                                  day
                                )}
                              </p>

                            </div>

                            <div className="flex gap-2 flex-wrap justify-end">

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportDay(day);
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

                                  shadow
                                  shadow-green-500/15

                                  transition
                                "
                              >
                                <FaWhatsapp />
                                Enviar
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportPDF(day);
                                }}
                                className="
                                  bg-gradient-to-r
                                  from-blue-600
                                  to-cyan-500

                                  px-3
                                  py-1
                                  rounded

                                  text-white
                                  text-sm

                                  border
                                  border-cyan-300/30

                                  shadow
                                  shadow-cyan-400/20

                                  hover:shadow-[0_0_12px_rgba(0,217,255,0.3)]

                                  transition
                                "
                              >
                                📄 PDF
                              </button>

                            </div>

                          </div>

                        </div>

                        {/* =================================================
                            DETALLE
                        ================================================= */}

                        <AnimatePresence>
                          {openId === day.id && (

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
                            >

                              <div
                                className="
                                  mt-2
                                  p-3
                                  rounded-xl

                                  backdrop-blur-xl

                                  bg-white/55
                                  dark:bg-[#07152f]/70

                                  border
                                  border-cyan-300/40
                                  dark:border-cyan-400/25

                                  shadow-lg
                                  shadow-cyan-300/5
                                  dark:shadow-cyan-400/5
                                "
                              >

                                {/* VENTAS */}

                                {(day.sales || []).map(
                                  (sale, i) => (

                                    <div
                                      key={sale.id}
                                      className="
                                        mb-3
                                        p-2
                                        rounded-lg

                                        bg-cyan-50/60
                                        dark:bg-cyan-500/5

                                        border
                                        border-cyan-200/40
                                        dark:border-cyan-400/10
                                      "
                                    >

                                      <p
                                        className="
                                          font-bold
                                          mb-1

                                          text-slate-800
                                          dark:text-white
                                        "
                                      >
                                        🧾 Venta #
                                        {i + 1}
                                      </p>

                                      {sale.items?.map(
                                        (it) => (

                                          <div
                                            key={it.id}
                                            className="
                                              flex
                                              justify-between
                                              items-center
                                              text-sm
                                              mb-1
                                              gap-2
                                            "
                                          >

                                            <span
                                              className="
                                                text-slate-700
                                                dark:text-slate-200
                                              "
                                            >
                                              {it.name} x
                                              {it.quantity}
                                            </span>

                                            {editingSale ===
                                            it.id ? (

                                              <div className="flex gap-2 items-center">

                                                <input
                                                  type="number"
                                                  value={newQty}
                                                  onChange={(e) =>
                                                    setNewQty(
                                                      Number(
                                                        e.target.value
                                                      )
                                                    )
                                                  }
                                                  className="
                                                    w-16
                                                    p-1
                                                    rounded

                                                    bg-slate-100
                                                    dark:bg-[#0b1d38]

                                                    text-slate-800
                                                    dark:text-white

                                                    border
                                                    border-cyan-300/40
                                                    dark:border-cyan-400/20

                                                    outline-none

                                                    focus:border-cyan-400
                                                  "
                                                />

                                                <button
                                                  onClick={() => {

                                                    updateSaleInHistory(
                                                      day.id,
                                                      it.id,
                                                      {
                                                        quantity:
                                                          newQty,
                                                        total:
                                                          it.price *
                                                          newQty,
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

                                              </div>

                                            ) : (

                                              <div className="flex gap-2 items-center">

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

                                                <button
                                                  onClick={() => {

                                                    setEditingSale(
                                                      it.id
                                                    );

                                                    setNewQty(
                                                      it.quantity
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

                                                    transition
                                                  "
                                                >
                                                  <FaEdit />
                                                  Editar
                                                </button>

                                                <button
                                                  onClick={() =>
                                                    deleteSaleFromHistory(
                                                      day.id,
                                                      it.id
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

                                                    transition
                                                  "
                                                >
                                                  <FaTrash />
                                                  Eliminar
                                                </button>

                                              </div>

                                            )}

                                          </div>

                                        )
                                      )}

                                      <p
                                        className="
                                          text-right
                                          font-bold
                                          text-green-500
                                          mt-1
                                        "
                                      >
                                        Total venta: $
                                        {sale.total}
                                      </p>

                                    </div>

                                  )
                                )}

                                {/* RETIROS */}

                                <div
                                  className="
                                    mt-3
                                    border-t
                                    pt-2
                                    border-cyan-200/40
                                    dark:border-cyan-400/10
                                  "
                                >

                                  {editingRetiro ===
                                  day.id ? (

                                    <div
                                      className="
                                        flex
                                        gap-2
                                        flex-wrap
                                        items-center
                                      "
                                    >

                                      <span
                                        className="
                                          text-slate-700
                                          dark:text-slate-200
                                        "
                                      >
                                        💵 Efectivo:
                                      </span>

                                      <input
                                        type="number"
                                        value={
                                          retiroCash
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setRetiroCash(
                                            Number(
                                              e.target
                                                .value
                                            )
                                          )
                                        }
                                        className="
                                          p-1
                                          w-24
                                          rounded

                                          bg-slate-100
                                          dark:bg-[#0b1d38]

                                          text-slate-800
                                          dark:text-white

                                          border
                                          border-cyan-300/40
                                          dark:border-cyan-400/20

                                          outline-none

                                          focus:border-cyan-400
                                        "
                                      />

                                      <span
                                        className="
                                          text-slate-700
                                          dark:text-slate-200
                                        "
                                      >
                                        📲 Mercado:
                                      </span>

                                      <input
                                        type="number"
                                        value={
                                          retiroMp
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setRetiroMp(
                                            Number(
                                              e.target
                                                .value
                                            )
                                          )
                                        }
                                        className="
                                          p-1
                                          w-24
                                          rounded

                                          bg-slate-100
                                          dark:bg-[#0b1d38]

                                          text-slate-800
                                          dark:text-white

                                          border
                                          border-cyan-300/40
                                          dark:border-cyan-400/20

                                          outline-none

                                          focus:border-cyan-400
                                        "
                                      />

                                      <button
                                        onClick={() => {

                                          if (
                                            retiroCash +
                                              retiroMp >
                                            day.total
                                          ) {

                                            setModalMsg(
                                              "Los retiros no pueden superar el total"
                                            );

                                            return;
                                          }

                                          updateDayTotals(
                                            day.id,
                                            {
                                              retiroCash,
                                              retiroMp,
                                            }
                                          );

                                          setEditingRetiro(
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

                                          transition
                                        "
                                      >
                                        Guardar
                                      </button>

                                    </div>

                                  ) : (

                                    <button
                                      onClick={() => {

                                        setEditingRetiro(
                                          day.id
                                        );

                                        setRetiroCash(
                                          day.retiros?.cash ||
                                            0
                                        );

                                        setRetiroMp(
                                          day.retiros?.mp ||
                                            0
                                        );

                                      }}
                                      className="
                                        bg-gradient-to-r
                                        from-blue-600
                                        to-cyan-500

                                        px-2
                                        py-1
                                        rounded

                                        text-white

                                        shadow
                                        shadow-cyan-400/15

                                        hover:shadow-[0_0_10px_rgba(0,217,255,0.25)]

                                        transition
                                      "
                                    >
                                      Editar retiros
                                    </button>

                                  )}

                                </div>

                              </div>

                            </motion.div>

                          )}
                        </AnimatePresence>

                      </motion.div>
                    )
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        );
      })}

      {/* =====================================================
          MODAL
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
                bg-white
                dark:bg-[#07152f]

                p-5
                rounded-2xl

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-400/20
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

    </div>
  );
};

export default Historial;