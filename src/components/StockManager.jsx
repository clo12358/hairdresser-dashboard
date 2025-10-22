import { useMemo, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function StockManager() {
  const { stock, addStockItem, editStockItem, removeStockItem } = useApp();
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [loading, setLoading] = useState(false);

  // 🧮 Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(stock.map((s) => s.category || "General")));
    return ["All", ...cats];
  }, [stock]);

  // 🔍 Filter logic (search name, brand, or category)
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    const filteredList = stock.filter(
      (item) =>
        (filterCat === "All" || (item.category || "General") === filterCat) &&
        (!search ||
          item.name?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search))
    );

    return [...filteredList].sort((a, b) => {
      const aLow = Number(a.quantity) <= 3;
      const bLow = Number(b.quantity) <= 3;
      if (aLow !== bLow) return aLow ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [q, filterCat, stock]);

  const [form, setForm] = useState({
    name: "",
    category: "General",
    brand: "",
    quantity: 0,
    notes: "",
  });

  // ✅ Adjust quantity in table
  const adjustQuantity = useCallback(
    async (id, delta) => {
      const current = stock.find((s) => s.id === id);
      const currentQty = Number(current?.quantity ?? 0);
      const nextQty = Math.max(0, currentQty + delta);
      await editStockItem(id, { quantity: nextQty });
      toast.success(`Quantity updated for "${current.name}"`);
    },
    [stock, editStockItem]
  );

  // ✅ Add item handler
  async function handleAddItem(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter a name.");
    setLoading(true);
    try {
      await addStockItem({ ...form, minThreshold: 3 });
      toast.success(`"${form.name}" added to stock.`);
      setForm({
        name: "",
        category: "General",
        brand: "",
        quantity: 0,
        notes: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add stock item.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Delete item with confirmation
  async function handleDelete(id, name) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await removeStockItem(id);
      toast.success(`"${name}" removed.`);
    }
  }

  return (
    <div className="rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-[#3B2F2F] mb-6">Stock Inventory</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Add Stock Form */}
        <div>
          <h4 className="text-xl font-semibold text-[#3B2F2F] mb-4">
            Add Stock Item
          </h4>
          <form className="grid gap-3" onSubmit={handleAddItem}>
            <input
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F]"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F]"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            {/* Quantity input with buttons */}
            <div>
              <label className="block text-[#3B2F2F] font-medium mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Math.max(0, prev.quantity - 1),
                    }))
                  }
                  className="px-3 py-2 bg-[#D2BFAF] text-[#3B2F2F] rounded-full hover:bg-[#AD947F]"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                  className="w-24 text-center input input-bordered bg-white border-[#D2BFAF] text-[#3B2F2F] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AD947F]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }))
                  }
                  className="px-3 py-2 bg-[#D2BFAF] text-[#3B2F2F] rounded-full hover:bg-[#AD947F]"
                >
                  +
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full mt-2 px-4 py-2 text-sm rounded-full bg-gradient-to-r from-[#8A7563] to-[#AD947F] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </form>
        </div>

        {/* Right side - Stock List */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h4 className="text-xl font-semibold text-[#3B2F2F]">All Stock</h4>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                className="w-full sm:w-40 px-3 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:ring-2 focus:ring-[#AD947F] text-sm"
                placeholder="Search name, brand..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] focus:ring-2 focus:ring-[#AD947F] text-sm"
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
          {filtered.length === 0 ? (
            <p className="text-center text-[#8A7563] italic py-6">
              No stock items found.
            </p>
          ) : (
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
                      Category
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#3B2F2F]">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#3B2F2F]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#3B2F2F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2BFAF]">
                  {filtered.map((item, index) => {
                    const low = Number(item.quantity) <= 3;
                    const key = item.id ?? `${item.name}-${index}`;
                    return (
                      <tr
                        key={key}
                        className={`transition-all duration-150 ${
                          index % 2 === 0 ? "bg-[#F9F4ED]" : "bg-white"
                        } hover:bg-[#F1DCC3]/50`}
                      >
                        <td className="px-3 py-2 text-[#3B2F2F] font-medium text-sm">
                          {item.name}
                        </td>
                        <td className="px-3 py-2 text-[#8A7563] text-sm">
                          {item.brand || "—"}
                        </td>
                        <td className="px-3 py-2 text-[#8A7563] text-sm">
                          {item.category || "General"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {Number(item.quantity) === 0 ? (
                            <span className="text-[#B36C5B] font-semibold italic">
                              Out of stock
                            </span>
                          ) : (
                            <span className="text-[#3B2F2F] font-semibold">
                              {item.quantity}
                            </span>
                          )}
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
                          <div className="flex justify-center flex-wrap gap-1 sm:gap-2">
                            <button
                              className="px-2 py-1 rounded-lg bg-[#D2BFAF] text-[#3B2F2F] text-xs font-semibold hover:bg-[#AD947F] hover:text-white"
                              onClick={() => adjustQuantity(item.id, +1)}
                            >
                              +
                            </button>
                            <button
                              className="px-2 py-1 rounded-lg bg-[#D2BFAF] text-[#3B2F2F] text-xs font-semibold hover:bg-[#AD947F] hover:text-white"
                              onClick={() => adjustQuantity(item.id, -1)}
                            >
                              −
                            </button>
                            <button
                              className="px-2 py-1 rounded-lg bg-[#FF8A80] text-white text-xs font-semibold hover:bg-red-600"
                              onClick={() => handleDelete(item.id, item.name)}
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
          )}
        </div>
      </div>
    </div>
  );
}
