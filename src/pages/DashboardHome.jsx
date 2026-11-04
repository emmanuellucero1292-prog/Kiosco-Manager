import { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import { SalesContext } from "../context/SalesContext";

const DashboardHome = () => {
  const { products } = useContext(InventoryContext);
  const { currentSales } = useContext(SalesContext);

  // 💰 TOTAL DEL DIA
  const totalDay = currentSales.reduce((acc, s) => acc + s.total, 0);

  // ⚠️ STOCK BAJO
  const lowStock = products.filter(p => p.stock <= 2);

  // 🏆 PRODUCTO MÁS VENDIDO
  const topProduct = Object.values(
    currentSales.reduce((acc, sale) => {
      if (!acc[sale.name]) {
        acc[sale.name] = { ...sale, quantity: 0 };
      }
      acc[sale.name].quantity += sale.quantity;
      return acc;
    }, {})
  ).sort((a, b) => b.quantity - a.quantity)[0];

  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* TOTAL */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <h3 className="text-gray-300">Total del día</h3>
        <p className="text-2xl font-bold text-green-400">
          ${totalDay}
        </p>
      </div>

      {/* STOCK BAJO */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <h3 className="text-gray-400">Stock bajo</h3>

        {lowStock.length === 0 ? (
          <p className="text-sm text-gray-400">
            Todo OK
          </p>
        ) : (
          lowStock.map(p => (
            <p key={p.id} className="text-sm text-red-400">
              {p.name} ({p.stock})
            </p>
          ))
        )}
      </div>

      {/* TOP PRODUCTO */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <h3 className="text-gray-400">Más vendido</h3>

        {topProduct ? (
          <p className="text-yellow-400 font-bold">
            {topProduct.name} ({topProduct.quantity})
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Sin ventas
          </p>
        )}
      </div>

      {/* VENTAS RECIENTES */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <h3 className="text-gray-400 mb-2">
          Ventas recientes
        </h3>

        {currentSales.slice(-3).map(s => (
          <div
            key={s.id}
            className="flex justify-between text-sm"
          >
            <span>{s.name}</span>
            <span>${s.total}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardHome;
