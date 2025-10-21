import { useApp } from "../context/AppContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LowStockBanner() {
  const { stock } = useApp();
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Filter low stock items (<= 3)
  const lowStockItems = useMemo(() => {
    return stock.filter((item) => Number(item.quantity) <= 3);
  }, [stock]);

  if (!visible || lowStockItems.length === 0) return null;

  return (
    <div className="w-full">
      <div
        onClick={() => navigate("/stock")}
        className="cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#FF8A80]/90 border border-[#FF8A80] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-100"
      >
        {/* Left: Warning Icon + Text */}
        <div className="flex items-start sm:items-center gap-3 text-white">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-white text-base">
              {lowStockItems.length === 1
                ? "1 item is running low on stock."
                : `${lowStockItems.length} items are running low on stock.`}
            </p>
            <p className="text-sm opacity-90">
              Click here to view and restock items.
            </p>
          </div>
        </div>

        {/* Right: Dismiss + Button */}
        <div className="flex items-center gap-3 sm:ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent navigation when dismissing
              setVisible(false);
            }}
            className="text-white/90 hover:text-white font-medium text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
