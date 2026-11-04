import { useState, useContext, useEffect } from "react";
import { InventoryContext } from "../context/InventoryContext";

const ProductForm = ({ editingProduct, onClose }) => {
  const { addProduct, updateProduct } = useContext(InventoryContext);

  const [form, setForm] = useState({
    name: "",
    category: "Bebidas",
    subcategory: "Gaseosas",
    stock: "",
    price: "",
    active: true
  });

  const isEditing = !!editingProduct;

  // 🔥 MAPA DE SUBCATEGORIAS (PRO)
  const subMap = {
    Bebidas: [
      "Gaseosas",
      "Cervezas",
      "Jugos",
      "Energéticas",
      "Aguas"
    ],
    Kiosco: [
      "Alfajores",
      "Galletas",
      "Golosinas"
    ],
    Cigarros: [
      "Box",
      "Comun",
      "Convertibles",
      "Analgesicos"
    ],
    Almacen: [
      "Lácteos",
      "Secos",
      "Limpieza",
      "Perfumeria",
      "Cocina",
      "Libreria"
    ]
  };

  // 🔁 CAMBIOS INPUT
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 🔥 SI CAMBIA CATEGORIA → RESETEAR SUBCATEGORIA
    if (name === "category") {
      setForm({
        ...form,
        category: value,
        subcategory: subMap[value][0]
      });

      return;
    }

    setForm({
      ...form,
      [name]: type === "checkbox"
        ? checked
        : value
    });
  };

  // 💾 GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Poné nombre");
    }

    if (form.stock === "") {
      return alert("Poné stock");
    }

    if (form.price === "") {
      return alert("Poné precio");
    }

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      stock: Number(form.stock),
      price: Number(form.price),
      paused: form.active === false
    };

    if (isEditing) {
      await updateProduct({
        ...payload,
        id: editingProduct.id
      });
    } else {
      await addProduct(payload);
    }

    onClose();

    // 🔄 RESET
    setForm({
      name: "",
      category: "Bebidas",
      subcategory: "Gaseosas",
      stock: "",
      price: "",
      active: true
    });
  };

  // 🔁 CARGAR DATOS AL EDITAR
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        category: editingProduct.category || "Bebidas",
        subcategory:
          editingProduct.subcategory ||
          subMap[editingProduct.category]?.[0] ||
          "Gaseosas",
        stock: editingProduct.stock ?? "",
        price: editingProduct.price ?? "",
        active: editingProduct.paused
          ? false
          : true
      });
    }
  }, [editingProduct]);

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative
        mb-4

        flex
        gap-2
        flex-wrap
        items-center

        backdrop-blur-xl

        bg-white/10
        dark:bg-[#06152f]/80

        border
        border-cyan-300/70
        dark:border-cyan-400/40

        shadow-xl
        shadow-cyan-300/10
        dark:shadow-cyan-400/10

        p-4
        rounded-xl

        transition-all
        duration-300
      "
    >

      {/* GLOW INTERNO */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-xl
          shadow-[inset_0_0_18px_rgba(0,217,255,0.06)]
          dark:shadow-[inset_0_0_20px_rgba(0,217,255,0.10)]
        "
      />

      {/* NOMBRE */}
      <input
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        className="
          relative

          p-2
          rounded
          outline-none

          bg-white/10
          dark:bg-[#0b1d38]

          text-slate-800
          dark:text-white

          border
          border-slate-300
          dark:border-cyan-500/20

          focus:border-cyan-400
          dark:focus:border-cyan-400

          focus:ring-2
          focus:ring-cyan-300/30
          dark:focus:ring-cyan-400/20

          transition
        "
      />

      {/* CATEGORIA */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="
          relative

          p-2
          rounded

          bg-white/10
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
      >
        {Object.keys(subMap).map((cat) => (
          <option
            key={cat}
            value={cat}
          >
            {cat}
          </option>
        ))}
      </select>

      {/* SUBCATEGORIA */}
      <select
        name="subcategory"
        value={form.subcategory}
        onChange={handleChange}
        className="
          relative

          p-2
          rounded

          bg-white/10
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
      >
        {subMap[form.category].map((sub) => (
          <option
            key={sub}
            value={sub}
          >
            {sub}
          </option>
        ))}
      </select>

      {/* STOCK */}
      <input
        name="stock"
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
        className="
          relative

          w-24
          p-2
          rounded
          outline-none

          bg-white/10
          dark:bg-[#0b1d38]

          text-slate-800
          dark:text-white

          border
          border-slate-300
          dark:border-cyan-500/20

          focus:border-cyan-400
          dark:focus:border-cyan-400

          focus:ring-2
          focus:ring-cyan-300/30

          transition
        "
      />

      {/* PRECIO */}
      <input
        name="price"
        type="number"
        placeholder="Precio"
        value={form.price}
        onChange={handleChange}
        className="
          relative

          w-24
          p-2
          rounded
          outline-none

          bg-white/10
          dark:bg-[#0b1d38]

          text-slate-800
          dark:text-white

          border
          border-slate-300
          dark:border-cyan-500/20

          focus:border-cyan-400
          dark:focus:border-cyan-400

          focus:ring-2
          focus:ring-cyan-300/30

          transition
        "
      />

      {/* ACTIVO */}
      <label
        className="
          relative

          flex
          items-center
          gap-2

          text-sm

          text-slate-700
          dark:text-slate-200

          cursor-pointer
        "
      >
        <input
          type="checkbox"
          name="active"
          checked={form.active}
          onChange={handleChange}
          className="
            accent-cyan-500
          "
        />

        Activo
      </label>

      {/* BOTON */}
      <button
        type="submit"
        className="
          relative

          px-4
          py-2
          rounded

          text-white
          font-semibold

          bg-gradient-to-r
          from-blue-600
          to-cyan-500

          border
          border-cyan-300/30

          shadow-lg
          shadow-cyan-400/25

          hover:shadow-[0_0_16px_rgba(0,217,255,0.4)]

          hover:from-blue-500
          hover:to-cyan-400

          active:scale-95

          transition
        "
      >
        {isEditing
          ? "Guardar cambios"
          : "Agregar Producto"}
      </button>

    </form>
  );
};

export default ProductForm;