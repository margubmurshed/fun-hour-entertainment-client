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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 select-none" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          {isArabic ? "أدخل المبلغ الختامي" : "Enter Closing Cash"}
        </h1>

        <div className="card bg-base-100 shadow p-6">
          <input
            type="text"
            placeholder={isArabic ? "أدخل المبلغ بالريال" : "Enter amount in SAR"}
            className="input input-bordered w-full mb-4"
            value={closingCash}
            onChange={(e) => setClosingCash(e.target.value)}
          />

          <button className="btn btn-primary w-full" onClick={handleSubmit}>
            {isArabic ? "إغلاق الصندوق" : "Close Cash"}
          </button>
        </div>
      </div>
    </div>
  );
}
