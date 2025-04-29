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
      .post("http://192.168.8.10:5000/cashes/", data)
      .then((result) => {
        if (result.data.insertedId) {
          toast.success(isArabic ? "تم فتح الصندوق بنجاح" : "Cash Opened Successfully");
          fetchCash();
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCashLoading(false));
  };

  if (cashLoading)
    return (
      <Loading />
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 select-none" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          {isArabic ? "أدخل المبلغ الافتتاحي" : "Enter Opening Cash"}
        </h1>

        <div className="card bg-base-100 shadow p-6">
          <input
            type="text"
            placeholder={isArabic ? "أدخل المبلغ بالريال" : "Enter amount in SAR"}
            className="input input-bordered w-full mb-4"
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
          />

          <button className="btn btn-primary w-full" onClick={handleSubmit}>
            {isArabic ? "حفظ المبلغ الافتتاحي" : "Save Opening Cash"}
          </button>
        </div>
      </div>
    </div>
  );
}
