import { useState, useEffect, useContext } from "react";
import Header from "./components/layout/Header";
import Nav from "./components/layout/Nav";
import Dashbord from "./pages/Dashbord";
import Footer from "./pages/Footer";
import Login from "./pages/Login";
import { AuthContext } from "./context/AuthContext";

function App() {
  const [dark, setDark] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const saved = localStorage.getItem("dark");

    if (saved) {
      setDark(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dark", dark);

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div
      className="
        h-screen
        flex
        flex-col

        overflow-hidden

        bg-gradient-to-br
        from-slate-100
        via-gray-100
        to-cyan-50

        dark:from-[#020817]
        dark:via-[#06152f]
        dark:to-[#071a38]

        transition-colors
        duration-300
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="max-w-7xl mx-auto w-full px-4 pt-4 shrink-0">
        <Header
          dark={dark}
          setDark={setDark}
        />
      </div>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <div
        className="
          flex-1
          max-w-7xl
          mx-auto
          w-full

          px-2

          flex
          flex-col

          overflow-hidden
        "
      >

        {!user ? (

          /* =================================================
             LOGIN
          ================================================= */

          <div
            className="
              flex-1
              flex
              mb-2
            "
          >
            <Login />
          </div>

        ) : (

          /* =================================================
             APP
          ================================================= */

          <>
            {/* NAV */}

            <div className="px-2 shrink-0">
              <Nav />
            </div>

            {/* DASHBOARD */}

            <div
              className="
                flex-1
                overflow-hidden
                px-2
                pb-20
              "
            >
              <Dashbord />
            </div>
          </>

        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          max-w-7xl
          mx-auto
          w-full

          px-4
          pb-4

          shrink-0
        "
      >
        <Footer />
      </div>

    </div>
  );
}

export default App;