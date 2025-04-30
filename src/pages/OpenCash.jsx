import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authContext } from "../contexts/AuthProvider";
import { cashContext } from "../contexts/CashProvider";
import { languageContext } from "../contexts/LanguageProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";

export default function OpenCash() {
  const [openingCash, setOpeningCash] = useState("");
  const { user } = useContext(authContext);
  const { cash, cashLoading, setCashLoading, fetchCash } = useContext(cashContext);
  const { isArabic } = useContext(languageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (cash) {
      toast.error(isArabic ? "يجب إغلاق الصندوق الحالي قبل فتح صندوق جديد" : "Close the current cash before opening a new one");
      navigate("/close-cash");
    }
  }, [cashLoading]);

  const handleSubmit = () => {
    const parsedOpeningCash = parseFloat(openingCash);

    if (!openingCash || isNaN(parsedOpeningCash) || parsedOpeningCash <= 0) {
      toast.error(isArabic ? "يرجى إدخال مبلغ صحيح لفتح الصندوق" : "Please enter a valid opening cash amount.");
      return;
    }

    const data = {
      openingCashAmount: parsedOpeningCash,
      openingCashTime: new Date().getTime(),
      closingCashAmount: null,
      closingCashTime: null,
      cashierEmail: user.email,
    };

    setCashLoading(true);
    axios
      .post("http://192.168.0.102:5000/cashes/", data)
      .then((result) => {
        if (result.data.insertedId) {
          toast.success(isArabic ? "تم فتح الصندوق بنجاح" : "Cash Opened Successfully");
          fetchCash();
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCashLoading(false));
  };

  if (cashLoading) return <Loading />;

  return (
    <div
      className="min-h-screen w-full px-4 py-10 bg-gradient-to-br from-pink-100 to-purple-100"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">
          {isArabic ? "أدخل المبلغ الافتتاحي" : "Enter Opening Cash"}
        </h1>

        <input
          type="text"
          placeholder={isArabic ? "أدخل المبلغ بالريال" : "Enter amount in SAR"}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {isArabic ? "حفظ المبلغ الافتتاحي" : "Save Opening Cash"}
        </button>
      </div>
    </div>
  );
}
