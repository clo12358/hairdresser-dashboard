import { useMemo, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";

export default function StockManager() {
  const { stock, addStockItem, editStockItem, removeStockItem } = useApp();
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stock.map((s) => s.category || "General")));
    return ["All", ...cats];
  }, [stock]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    const filteredList = stock.filter(
      (item) =>
        (filterCat === "All" || (item.category || "General") === filterCat) &&
        (!search ||
          item.name?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search))
    );

    // 🔒 Sort without mutating the source array
    return [...filteredList].sort((a, b) => {
      const aLow = Number(a.quantity) <= 3;
      const bLow = Number(b.quantity) <= 3;
      if (aLow !== bLow) return aLow ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [q, filterCat, stock]);

  // ✅ Hidden minThreshold of 3 (never shown)
  const [form, setForm] = useState({
    name: "",
    category: "General",
    brand: "",
    quantity: 0,
    notes: "",
  });

  // ✅ Use latest quantity from context at click time (prevents stale-closure bugs)
  const adjustQuantity = useCallback(
    async (id, delta) => {
      const current = stock.find((s) => s.id === id);
      const currentQty = Number(current?.quantity ?? 0);
      const nextQty = Math.max(0, currentQty + delta);
      await editStockItem(id, { quantity: nextQty });
    },
    [stock, editStockItem]
  );

  return (
    <div className="rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-[#3B2F2F] mb-6">Stock Inventory</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Add Stock Form */}
        <div>
          <h4 className="text-xl font-semibold text-[#3B2F2F] mb-4">
            Add Stock Item
          </h4>
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await addStockItem({ ...form, minThreshold: 3 });
              setForm({
                name: "",
                category: "General",
                brand: "",
                quantity: 0,
                notes: "",
              });
            }}
          >
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              type="number"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />

            <button className="w-full px-4 py-2 text-sm rounded-full bg-gradient-to-r from-[#8A7563] to-[#AD947F] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
              Add Item
            </button>
          </form>
        </div>

        {/* Right side - Stock List */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h4 className="text-xl font-semibold text-[#3B2F2F]">All Stock</h4>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                className="w-full sm:w-40 px-3 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200 text-sm"
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] focus:outline-none focus:ring-2 focus:ring-[#AD947F] transition-all duration-200 text-sm"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#F1DCC3] border-b-2 border-[#D2BFAF] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#3B2F2F]">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#3B2F2F]">
                    Brand
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#3B2F2F]">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#3B2F2F]">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#3B2F2F]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2BFAF]">
                {filtered.map((item, index) => {
                  const low = Number(item.quantity) <= 3;
                  const key = item.id ?? `${item.name}-${index}`; // ✅ stable key fallback

                  return (
                    <tr
                      key={key}
                      className={`${
                        low
                          ? "bg-[#F1DCC3]/50"
                          : "hover:bg-[#F9F4ED] transition-colors"
                      }`}
                    >
                      <td className="px-3 py-2 text-[#3B2F2F] font-medium text-sm whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 text-[#8A7563] text-sm whitespace-nowrap">
                        {item.brand}
                      </td>
                      <td className="px-3 py-2 text-[#3B2F2F] font-semibold text-sm text-center">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {low ? (
                          <span className="px-2 py-1 rounded-full bg-[#FF8A80] text-white text-xs font-semibold">
                            Low
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-[#4CAF50] text-white text-xs font-semibold">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            className="px-2 py-1 rounded-lg bg-[#D2BFAF] text-[#3B2F2F] text-xs font-semibold hover:bg-[#AD947F] hover:text-white transition-all duration-200"
                            onClick={() => adjustQuantity(item.id, +1)}
                          >
                            +
                          </button>
                          <button
                            className="px-2 py-1 rounded-lg bg-[#D2BFAF] text-[#3B2F2F] text-xs font-semibold hover:bg-[#AD947F] hover:text-white transition-all duration-200"
                            onClick={() => adjustQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <button
                            className="px-2 py-1 rounded-lg bg-[#FF8A80] text-white text-xs font-semibold hover:bg-red-600 transition-all duration-200"
                            onClick={() => removeStockItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
