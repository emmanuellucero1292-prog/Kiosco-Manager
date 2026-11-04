import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const Login = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // 🔥 MODAL STATE
  const [modal, setModal] = useState({
    show: false,
    message: ""
  });

  // 🔥 cargar email guardado
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setModal({
        show: true,
        message: "Completá los campos"
      });
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      // 💾 recordar email
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

    } catch (err) {
      let errorMsg = "Usuario y/o contraseña incorrecta";

      setModal({
        show: true,
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        flex-1 w-full
        flex items-center justify-center
        rounded-3xl mb-8
        transition-colors duration-300

        bg-gradient-to-br
        from-slate-100
        via-slate-200
        to-cyan-50

        dark:from-[#020817]
        dark:via-[#06152f]
        dark:to-[#071a38]
      "
    >
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="
          relative
          w-full max-w-md
          p-8
          rounded-2xl
          space-y-5

          backdrop-blur-2xl

          bg-white/75
          dark:bg-[#07152f]/80

          border
          border-cyan-300/70
          dark:border-cyan-400/50

          shadow-2xl

          shadow-cyan-300/20
          dark:shadow-cyan-400/20

          before:absolute
          before:inset-0
          before:-z-10
          before:rounded-2xl
          before:blur-xl
          before:bg-cyan-300/10
          dark:before:bg-cyan-400/10
        "
      >
        {/* HEADER */}
        <div className="text-center space-y-1">

          <div className="flex items-center justify-center gap-3">

            <img
              src="/logo.png"
              alt="Kiosco Manager"
              className="
                w-14 h-14
                object-contain
                drop-shadow-[0_0_10px_rgba(0,217,255,0.45)]
              "
            />

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
                dark:text-white
                tracking-tight
              "
            >
              Kiosco Manager
            </h1>

          </div>

          <p
            className="
              text-sm
              text-slate-500
              dark:text-cyan-100/70
            "
          >
            Acceso al sistema
          </p>

        </div>

        {/* EMAIL */}
        <div className="relative">

          <FaEnvelope
            className="
              absolute
              left-3
              top-3.5
              text-cyan-600
              dark:text-cyan-400
            "
          />

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              pl-10
              p-3
              rounded-lg

              bg-slate-100
              dark:bg-[#0b1d38]

              text-slate-800
              dark:text-white

              border
              border-slate-300
              dark:border-cyan-500/20

              outline-none

              transition

              focus:border-cyan-400
              dark:focus:border-cyan-400

              focus:ring-2
              focus:ring-cyan-300/30
              dark:focus:ring-cyan-400/20
            "
          />

        </div>

        {/* PASSWORD */}
        <div className="relative">

          <FaLock
            className="
              absolute
              left-3
              top-3.5
              text-cyan-600
              dark:text-cyan-400
            "
          />

          <input
            type={showPass ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              pl-10
              pr-10
              p-3
              rounded-lg

              bg-slate-100
              dark:bg-[#0b1d38]

              text-slate-800
              dark:text-white

              border
              border-slate-300
              dark:border-cyan-500/20

              outline-none

              transition

              focus:border-cyan-400
              dark:focus:border-cyan-400

              focus:ring-2
              focus:ring-cyan-300/30
              dark:focus:ring-cyan-400/20
            "
          />

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="
              absolute
              right-3
              top-3
              text-slate-500
              dark:text-cyan-400
              hover:text-cyan-500
              dark:hover:text-cyan-300
              transition
            "
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>

        {/* OPCIONES */}
        <div className="flex items-center justify-between text-sm">

          <label
            className="
              flex
              items-center
              gap-2
              text-slate-600
              dark:text-slate-300
            "
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="
                accent-cyan-500
              "
            />

            Recordarme
          </label>

          <span
            className="
              text-slate-400
              dark:text-slate-500
              cursor-not-allowed
            "
          >
            ¿Olvidaste?
          </span>

        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full
            py-3
            rounded-lg

            text-white
            font-semibold

            transition
            active:scale-95

            border

            ${
              loading
                ? `
                  bg-slate-500
                  border-slate-400
                  cursor-not-allowed
                `
                : `
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500

                  border-cyan-300/40

                  shadow-lg
                  shadow-cyan-400/30

                  hover:from-blue-500
                  hover:to-cyan-400

                  hover:shadow-[0_0_18px_rgba(0,217,255,0.45)]
                `
            }
          `}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

      </motion.form>

      {/* 🔥 MODAL */}
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
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="
                bg-white
                dark:bg-[#07152f]

                p-5
                rounded-xl
                shadow-2xl
                w-80
                text-center

                border
                border-cyan-300/60
                dark:border-cyan-400/40

                shadow-cyan-400/20
              "
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >

              <h3
                className="
                  text-lg
                  font-bold
                  mb-2

                  text-slate-800
                  dark:text-white
                "
              >
                ⚠️ Atención
              </h3>

              <p
                className="
                  text-sm
                  mb-4

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
                    message: ""
                  })
                }
                className="
                  px-4
                  py-2
                  rounded

                  text-white

                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500

                  shadow
                  shadow-cyan-400/30

                  hover:shadow-[0_0_14px_rgba(0,217,255,0.4)]

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

export default Login;