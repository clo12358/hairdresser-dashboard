import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add Insights link here
  const links = [
    { to: "/", label: "Calendar" },
    { to: "/clients", label: "Clients" },
    { to: "/stock", label: "Stock" },
    { to: "/insights", label: "Insights" }, // 🌟 New Page
  ];

  return (
    <nav className="bg-white border-b-2 border-[#D2BFAF] shadow-sm mb-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Title */}
          <div className="flex-1">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#8A7563] to-[#AD947F] bg-clip-text text-transparent">
              Dashboard
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-none">
            <ul className="flex gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`px-4 lg:px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                      location.pathname === link.to
                        ? "bg-gradient-to-r from-[#8A7563] to-[#AD947F] text-white shadow-md"
                        : "bg-[#F1DCC3] text-[#3B2F2F] hover:bg-[#D2BFAF]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#F1DCC3] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6 text-[#3B2F2F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      location.pathname === link.to
                        ? "bg-gradient-to-r from-[#8A7563] to-[#AD947F] text-white shadow-md"
                        : "bg-[#F1DCC3] text-[#3B2F2F] hover:bg-[#D2BFAF]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
