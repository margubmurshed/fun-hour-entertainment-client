import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { authContext } from "../contexts/AuthProvider";
import { cashContext } from "../contexts/CashProvider";
import { languageContext } from "../contexts/LanguageProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";

export default function CloseCash() {
  const [closingCash, setClosingCash] = useState("");
  const { user } = useContext(authContext);
  const { cash, setCashLoading, fetchCash, cashLoading } = useContext(cashContext); // ✅ Added cashLoading
  const { isArabic } = useContext(languageContext);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!cash) {
      toast.error(isArabic ? "لا يمكن إغلاق الصندوق قبل فتحه" : "Can't close cash without opening cash");
      return;
    }

    const parsedClosingCash = parseFloat(closingCash);

    if (!closingCash || isNaN(parsedClosingCash) || parsedClosingCash <= 0) {
      toast.error(isArabic ? "يرجى إدخال مبلغ صالح" : "Please enter a valid closing cash amount.");
      return;
    }

    const data = {
      closingCashAmount: parsedClosingCash,
      closingCashTime: new Date().getTime(),
    };

    setCashLoading(true);
    axios.patch(`http://192.168.8.10:5000/cashes/${cash._id}`, data)
      .then((result) => {
        if (result.data.modifiedCount) {
          axios.post("http://192.168.8.10:5000/print-cash", {
            cashierName: user.displayName,
            cashierEmail: user.email,
            cashId: cash._id
          })
            .then(() => {
              fetchCash().then(() => {
                toast.success(isArabic ? "تم إغلاق الصندوق بنجاح" : "Cash Closed Successfully");
                navigate("/");
              });
            })
            .catch(err => {
              toast.error(`${err.message} - Printing failed`);
              setCashLoading(false);
            });
        }
      })
      .catch((err) => {
        toast.error(err.message);
        setCashLoading(false);
      })
      .finally(() => {
        setCashLoading(false);
      });
  };

  // ✅ Moved inside the component
  if (cashLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 py-10 px-6 select-none" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-extrabold text-pink-600 mb-6 text-center">
          {isArabic ? "أدخل المبلغ الختامي" : "Enter Closing Cash"}
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder={isArabic ? "أدخل المبلغ بالريال" : "Enter amount in SAR"}
            className="w-full border border-pink-300 focus:ring-2 focus:ring-pink-400 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400"
            value={closingCash}
            onChange={(e) => setClosingCash(e.target.value)}
          />

          <button
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
            onClick={handleSubmit}
          >
            {isArabic ? "إغلاق الصندوق" : "Close Cash"}
          </button>
        </div>
      </div>
    </div>
  );

}
