import { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import { HiPlus, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const ProductModal = () => {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const hanldeEdit = (e) => {
      setEditingProduct(e.detail);
      setOpen(true);
    };

    window.addEventListener("editProduct", hanldeEdit);

    return () => {
      window.removeEventListener("editProduct", hanldeEdit);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  return (
    <>
      {/* 🔥 BOTÓN FLOTANTE */}
      <button
        onClick={() => {
          setEditingProduct(null);
          setOpen(true);
        }}
        className="
          fixed
          right-6
          bottom-[calc(25px+env(safe-area-inset-bottom))]

          w-14
          h-14
          rounded-full

          flex
          items-center
          justify-center

          bg-gradient-to-br
          from-blue-600
          to-cyan-500

          text-white

          border
          border-cyan-300/60

          shadow-2xl
          shadow-cyan-400/30

          hover:shadow-[0_0_22px_rgba(0,217,255,0.5)]
          hover:scale-105

          active:scale-95

          transition-all
          duration-300

          z-[9999]
        "
      >
        <HiPlus size={24} />
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="
              fixed
              inset-0

              bg-black/50
              backdrop-blur-sm

              flex
              items-center
              justify-center

              z-[9998]

              p-4
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >

            {/* CONTENIDO */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{
                scale: 0.9,
                opacity: 0,
                y: 20
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: 20
              }}
              transition={{
                duration: 0.2
              }}
              className="
                relative

                w-full
                max-w-md

                p-6
                rounded-2xl

                backdrop-blur-2xl

                bg-white
                dark:bg-[#06152f]/95

                border
                border-cyan-300/70
                dark:border-cyan-400/40

                shadow-2xl
                shadow-cyan-300/15
                dark:shadow-cyan-400/20

                transition-all
              "
            >

              {/* GLOW INTERNO */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-2xl

                  shadow-[inset_0_0_22px_rgba(0,217,255,0.07)]
                  dark:shadow-[inset_0_0_25px_rgba(0,217,255,0.10)]
                "
              />

              {/* CERRAR */}
              <button
                onClick={handleClose}
                className="
                  absolute
                  top-3
                  right-3

                  w-9
                  h-9

                  flex
                  items-center
                  justify-center

                  rounded-lg

                  bg-white/60
                  dark:bg-[#0b1d38]

                  border
                  border-cyan-300/50
                  dark:border-cyan-400/30

                  text-slate-600
                  dark:text-cyan-200

                  hover:text-red-500
                  dark:hover:text-red-400

                  hover:border-red-400/60

                  hover:shadow-[0_0_10px_rgba(248,113,113,0.2)]

                  transition
                "
              >
                <HiX size={22} />
              </button>

              {/* TITULO */}
              <h2
                className="
                  relative

                  text-xl
                  mb-4
                  font-semibold

                  text-slate-900
                  dark:text-white
                "
              >
                {editingProduct
                  ? "Editar Producto"
                  : "Agregar Producto"}
              </h2>

              {/* FORM */}
              <div className="relative">
                <ProductForm
                  editingProduct={editingProduct}
                  onClose={handleClose}
                />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductModal;