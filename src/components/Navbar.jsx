import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { cashContext } from "../contexts/CashProvider";
import { authContext } from "../contexts/AuthProvider";
import { languageContext } from "../contexts/LanguageProvider";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, userLoading, logOut } = useContext(authContext);
  const { cash, cashLoading } = useContext(cashContext);
  const { isArabic, toggleLanguage } = useContext(languageContext);
  const [isOpen, setIsOpen] = useState(false);

  const userName = userLoading ? "Loading..." : (user?.displayName || "User");

  const handleLanguageToggle = () => {
    toggleLanguage();
    setIsOpen(false)
  }

  const handleSignOut = () => {
    logOut()
      .then(() => toast.success("Signed out successfully"))
      .catch((err) => toast.error(err.message));
  };

  const menuItems = (
    <>
      <NavLink
      onClick={() => setIsOpen(false)}
        to="/"
        className={({ isActive }) =>
          isActive
            ? "btn btn-ghost font-semibold text-pink-600"
            : "btn btn-ghost"
        }
      >
        {isArabic ? "الرئيسية" : "Home"}
      </NavLink>
      {!cash && (
        <NavLink
        onClick={() => setIsOpen(false)}
          to="/open-cash"
          className={({ isActive }) =>
            isActive
              ? "btn btn-ghost font-semibold text-pink-600"
              : "btn btn-ghost"
          }
        >
          {isArabic ? "فتح الصندوق" : "Open Cash"}
        </NavLink>
      )}
      <NavLink
      onClick={() => setIsOpen(false)}
        to="/all-receipts"
        className={({ isActive }) =>
          isActive
            ? "btn btn-ghost font-semibold text-pink-600"
            : "btn btn-ghost"
        }
      >
        {isArabic ? "جميع الإيصالات" : "All Receipts"}
      </NavLink>
      <NavLink
      onClick={() => setIsOpen(false)}
        to="/sell-summary"
        className={({ isActive }) =>
          isActive
            ? "btn btn-ghost font-semibold text-pink-600"
            : "btn btn-ghost"
        }
      >
        {isArabic ? "ملخص المبيعات" : "Sell Summary"}
      </NavLink>
      <NavLink
      onClick={() => setIsOpen(false)}
        to="/products"
        className={({ isActive }) =>
          isActive
            ? "btn btn-ghost font-semibold text-pink-600"
            : "btn btn-ghost"
        }
      >
        {isArabic ? "المنتجات" : "Products"}
      </NavLink>
      <NavLink
      onClick={() => setIsOpen(false)}
        to="/close-cash"
        className={({ isActive }) =>
          isActive
            ? "btn btn-ghost font-semibold text-pink-600"
            : "btn btn-ghost"
        }
      >
        {isArabic ? "إغلاق الصندوق" : "Close Cash"}
      </NavLink>
    </>
  );

  return (
    <div className="bg-white shadow-md select-none">
      <div className="navbar max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 no-select">
            <img
              src={logo}
              alt="fun-hour-entertainment-logo"
              className="w-10 h-10 object-contain"
              draggable={false}
            />
            <span className="text-xl font-bold text-pink-600 hidden sm:block">
              {isArabic ? "ساعة فرح للترفيه" : "Fun Hour Entertainment"}
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-ghost focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Toggleable Menu (Always used) */}
<div className={`transition-all duration-300 ease-in-out bg-white overflow-hidden ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
  <div className="flex flex-col gap-2 p-4">
    {menuItems}
    {(cash && !cashLoading) && (
      <button className="btn btn-outline btn-primary w-full">
        {isArabic? "مبلغ افتتاح النقدية": "Cash Opening Amount"} : {cash.openingCashAmount} {isArabic ? "ر.س" : "SAR"}
      </button>
    )}
    <div className="flex flex-col gap-2 mt-2">
      <div className="font-semibold text-center">{userName}</div>
      <button onClick={handleSignOut} className="btn btn-error btn-sm w-full">
        {isArabic ? "تسجيل الخروج" : "Sign Out"}
      </button>
      <button onClick={handleLanguageToggle} className="btn btn-outline btn-sm w-full">
        {isArabic ? "English" : "العربية"}
      </button>
    </div>
  </div>
</div>

    </div>
  );
}
