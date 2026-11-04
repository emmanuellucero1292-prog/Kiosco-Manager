import { useState, useEffect, useContext, useRef } from "react";
import { FaDownload, FaBell, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import usePWAInstall from "../../hooks/usePWAInstall";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";

const Header = ({ dark, setDark }) => {
  const [dateTime, setDateTime] = useState("");
  const [openNotif, setOpenNotif] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const notifRef = useRef();

  const { installApp, canInstall } = usePWAInstall();
  const { user, logout } = useContext(AuthContext);
  const { notifications, removeNotification, clearAll } =
    useContext(NotificationContext);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setDateTime(
        now.toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const username =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const initial = username.charAt(0).toUpperCase();

  const getColorFromName = (name) => {
    const colors = [
      "bg-blue-600",
      "bg-cyan-600",
      "bg-indigo-600",
      "bg-sky-600",
      "bg-violet-600",
      "bg-teal-600",
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash =
        name.charCodeAt(i) +
        ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromName(username);

  const role = user?.role || "empleado";

  const roleStyles = {
    dueño:
      "bg-cyan-400 text-[#06152f] font-semibold",
    admin:
      "bg-blue-500 text-white font-semibold",
    empleado:
      "bg-slate-500 text-white",
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative
          z-[9999]

          backdrop-blur-xl

          bg-white/20
          dark:bg-[#06152f]/80

          border
          border-cyan-300/70
          dark:border-cyan-400/40

          shadow-2xl
          shadow-cyan-300/15
          dark:shadow-cyan-400/15

          p-4
          rounded-2xl
          mb-4

          flex
          justify-between
          items-center

          transition-all
          duration-300
        "
      >

        {/* GLOW SUAVE */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-2xl
            shadow-[inset_0_0_18px_rgba(0,217,255,0.08)]
            dark:shadow-[inset_0_0_22px_rgba(0,217,255,0.12)]
          "
        />

        {/* IZQUIERDA */}
        <h1
          className="
            relative
            text-xl
            md:text-2xl
            font-bold

            text-slate-900
            dark:text-white

            flex
            items-center
            gap-2
          "
        >
          <img
            src="/logo.png"
            alt="Kiosco"
            className="
              w-8
              object-contain
              drop-shadow-[0_0_8px_rgba(0,217,255,0.35)]
            "
          />

          Kiosco Manager

          <span
            className="
              text-xs
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              text-white
              px-2
              py-0.5
              rounded

              shadow
              shadow-cyan-400/20
            "
          >
            PRO
          </span>
        </h1>

        {/* BOTÓN MOBILE */}
        <button
          onClick={() => setOpenMenu(true)}
          className="
            md:hidden
            relative

            p-2
            rounded-lg

            bg-white/10
            dark:bg-[#0b1d38]/70

            text-slate-700
            dark:text-cyan-200

            border
            border-cyan-300/60
            dark:border-cyan-400/30

            hover:shadow-[0_0_12px_rgba(0,217,255,0.25)]

            transition
          "
        >
          <FaBars />
        </button>

        {/* DERECHA */}
        <div className="hidden md:flex items-center gap-3 relative">

          {/* FECHA */}
          <span
            className="
              text-sm
              font-bold
              text-slate-700
              dark:text-cyan-100/80
            "
          >
            {dateTime}
          </span>

          {/* NOTIFICACIONES */}
          {user && (
            <div
              className="relative"
              ref={notifRef}
            >

              <button
                onClick={() =>
                  setOpenNotif(!openNotif)
                }
                className="
                  relative
                  p-2
                  rounded-lg

                  bg-white/10
                  dark:bg-[#0b1d38]/70

                  border
                  border-cyan-300/60
                  dark:border-cyan-400/30

                  text-slate-700
                  dark:text-cyan-200

                  hover:shadow-[0_0_12px_rgba(0,217,255,0.25)]

                  transition
                "
              >
                <FaBell className="text-orange-400" />

                {notifications.length > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1

                      bg-red-500
                      text-white

                      text-[10px]
                      px-1.5
                      rounded-full

                      shadow
                      shadow-red-500/30
                    "
                  >
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {openNotif && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    className="
                      absolute
                      right-0
                      mt-2
                      w-72

                      bg-white
                      dark:bg-[#07152f]

                      rounded-xl
                      shadow-2xl

                      border
                      border-cyan-300/60
                      dark:border-cyan-400/30

                      z-[9999]

                      text-gray-700
                      dark:text-white

                      overflow-hidden
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                        p-2
                        border-b
                        border-gray-200
                        dark:border-white/10
                      "
                    >
                      <span>
                        Notificaciones
                      </span>

                      <button
                        onClick={clearAll}
                        className="
                          text-xs
                          text-cyan-600
                          dark:text-cyan-300

                          hover:text-cyan-400

                          transition
                        "
                      >
                        Limpiar
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <p
                        className="
                          p-3
                          text-sm
                          text-gray-400
                          text-center
                        "
                      >
                        Sin notificaciones
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="
                            p-2
                            flex
                            justify-between
                            border-b
                            border-gray-100
                            dark:border-white/5
                            hover:bg-cyan-50
                            dark:hover:bg-cyan-500/5
                            transition
                          "
                        >

                          <span>
                            {n.message}
                          </span>

                          <button
                            onClick={() =>
                              removeNotification(n.id)
                            }
                            className="
                              text-red-500
                              hover:text-red-400
                            "
                          >
                            ✖
                          </button>

                        </div>
                      ))
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* USER */}
          {user && (
            <div
              className="
                flex
                items-center
                gap-3

                bg-white/10
                dark:bg-[#0b1d38]/70

                px-3
                py-1.5
                rounded-full

                border
                border-cyan-300/60
                dark:border-cyan-400/30

                shadow-sm
                shadow-cyan-300/10
                dark:shadow-cyan-400/10

                transition
              "
            >

              <div
                className={`
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center

                  rounded-full
                  text-white
                  font-semibold

                  shadow-lg

                  ${avatarColor}
                `}
              >
                {initial}
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-slate-700
                  dark:text-white
                "
              >

                <span>
                  {username}
                </span>

                <span
                  className={`
                    text-[10px]
                    px-2
                    rounded-full

                    ${roleStyles[role]}
                  `}
                >
                  {role.toUpperCase()}
                </span>

              </div>

            </div>
          )}

          {/* DARK MODE */}
          <button
            onClick={() =>
              setDark(!dark)
            }
            className="
              px-3
              py-1
              rounded-lg

              bg-white/10
              dark:bg-[#0b1d38]/70

              border
              border-cyan-300/60
              dark:border-cyan-400/30

              text-slate-700
              dark:text-white

              hover:shadow-[0_0_12px_rgba(0,217,255,0.25)]

              transition
            "
          >
            {dark
              ? "☀️ Claro"
              : "🌙 Oscuro"}
          </button>

          {/* PWA */}
          {canInstall && (
            <button
              onClick={installApp}
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500

                px-3
                py-1
                rounded

                text-white

                border
                border-cyan-300/30

                shadow
                shadow-cyan-400/30

                hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]

                transition
              "
            >
              <FaDownload />
            </button>
          )}

          {/* LOGOUT */}
          {user && (
            <button
              onClick={logout}
              className="
                bg-red-500
                hover:bg-red-600

                px-3
                py-1
                rounded

                text-white

                shadow
                shadow-red-500/20

                transition
              "
            >
              Salir
            </button>
          )}

        </div>

      </motion.header>

      {/* =====================================================
          MENU MOBILE
      ===================================================== */}

      <AnimatePresence>
        {openMenu && (
          <motion.div
            className="
              fixed
              inset-0
              bg-black/50
              backdrop-blur-sm

              z-[9999]
              flex
              justify-end
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}

              className="
                w-72
                h-full

                backdrop-blur-xl

                bg-white/90
                dark:bg-[#06152f]/95

                border-l
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-400/20

                p-4
                space-y-3

                flex
                flex-col
                items-center
              "
            >

              {/* CERRAR */}
              <button
                onClick={() =>
                  setOpenMenu(false)
                }
                className="
                  self-end

                  px-2
                  py-1

                  rounded-lg

                  bg-white/50
                  dark:bg-[#0b1d38]

                  border
                  border-cyan-300/60
                  dark:border-cyan-400/30

                  text-slate-700
                  dark:text-cyan-200

                  hover:shadow-[0_0_12px_rgba(0,217,255,0.25)]

                  transition
                "
              >
                ✖
              </button>

              {/* FECHA */}
              <p
                className="
                  font-bold

                  text-slate-700
                  dark:text-cyan-100/80
                "
              >
                {dateTime}
              </p>

              {/* USER */}
              {user && (
                <div
                  className="
                    flex
                    items-center
                    gap-3

                    bg-white/50
                    dark:bg-[#0b1d38]/70

                    px-3
                    py-1.5

                    rounded-full

                    border
                    border-cyan-300/60
                    dark:border-cyan-400/30
                  "
                >

                  <div
                    className={`
                      w-9
                      h-9
                      flex
                      items-center
                      justify-center

                      rounded-full
                      text-white

                      ${avatarColor}
                    `}
                  >
                    {initial}
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2

                      text-slate-700
                      dark:text-white
                    "
                  >

                    <span>
                      {username}
                    </span>

                    <span
                      className={`
                        text-[10px]
                        px-2
                        rounded-full

                        ${roleStyles[role]}
                      `}
                    >
                      {role.toUpperCase()}
                    </span>

                  </div>

                </div>
              )}

              {/* DARK */}
              <button
                onClick={() =>
                  setDark(!dark)
                }
                className="
                  px-3
                  py-1
                  rounded-lg

                  bg-white/50
                  dark:bg-[#0b1d38]/70

                  border
                  border-cyan-300/60
                  dark:border-cyan-400/30

                  text-slate-700
                  dark:text-white

                  hover:shadow-[0_0_12px_rgba(0,217,255,0.25)]

                  transition
                "
              >
                {dark
                  ? "☀️ Claro"
                  : "🌙 Oscuro"}
              </button>

              {/* PWA */}
              {canInstall && (
                <button
                  onClick={installApp}
                  className="
                    px-4
                    py-2
                    rounded-lg

                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500

                    border
                    border-cyan-300/30

                    text-white

                    shadow
                    shadow-cyan-400/25

                    hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]

                    transition
                  "
                >
                  Instalar App
                </button>
              )}

              {/* LOGOUT */}
              {user && (
                <button
                  onClick={logout}
                  className="
                    bg-red-500
                    hover:bg-red-600

                    px-7
                    py-1
                    rounded

                    text-white

                    shadow
                    shadow-red-500/20

                    transition
                  "
                >
                  Salir
                </button>
              )}

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;