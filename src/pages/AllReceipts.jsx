import { useContext, useEffect, useState } from "react";
import { cashContext } from "../contexts/CashProvider";
import { languageContext } from "../contexts/LanguageProvider";
import axios from "axios";
import Loading from "../components/Loading";

const AllReceiptsPage = () => {
  const { cash, cashLoading } = useContext(cashContext);
  const { isArabic } = useContext(languageContext);
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!cash?._id) {
        setLoadingReceipts(false);
        return;
      }

      try {
        const { data } = await axios.get(`http://192.168.0.102:5000/receipts/cash-session/${cash._id}`);
        setReceipts(data || []);
      } catch (error) {
        console.error("Failed to fetch receipts", error);
      } finally {
        setLoadingReceipts(false);
      }
    };

    fetchReceipts();
  }, [cash?._id]);

  const sortedReceipts = [...receipts].sort((a, b) => {
    return sortOrder === "desc"
      ? (b.serial || 0) - (a.serial || 0)
      : (a.serial || 0) - (b.serial || 0);
  });

  if (cashLoading || loadingReceipts) {
    return <Loading />;
  }

  if (!receipts.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {isArabic ? "الإيصالات لجلسة الكاش الحالية" : "Receipts for Current Cash Session"}
          </h2>
          <p className="text-gray-500">
            {isArabic ? "لم يتم العثور على إيصالات." : "No receipts found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6">
        <h1 className="text-3xl font-extrabold text-pink-600 text-center">
          {isArabic ? "الإيصالات لجلسة الكاش الحالية" : "Receipts for Current Cash Session"}
        </h1>

        {/* Sort Order */}
        <div className="flex justify-end">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="select select-bordered border-pink-300 focus:ring-2 focus:ring-pink-400"
          >
            <option value="desc">
              {isArabic ? "التسلسل: من الأعلى إلى الأدنى" : "Serial: High to Low"}
            </option>
            <option value="asc">
              {isArabic ? "التسلسل: من الأدنى إلى الأعلى" : "Serial: Low to High"}
            </option>
          </select>
        </div>

        {/* Receipts List */}
        <div className="space-y-4">
          {sortedReceipts.map((receipt) => (
            <div
              key={receipt._id}
              className="bg-pink-50 border border-pink-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-pink-700">
                  {receipt.customerName || (isArabic ? "عميل غير معروف" : "Unknown Customer")}
                </span>
                <span className="text-sm text-gray-500">
                  {receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : (isArabic ? "لا يوجد تاريخ" : "No date")}
                </span>
              </div>

              {/* Serial and Phone */}
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{isArabic ? "التسلسل" : "Serial"}: {receipt.serial || "N/A"}</span>
                <span>{isArabic ? "الهاتف" : "Phone"}: {receipt.mobileNumber || "N/A"}</span>
              </div>

              {/* Services */}
              {receipt.services?.length > 0 && (
                <div className="mb-2">
                  <div className="text-pink-700 font-semibold mb-1">
                    {isArabic ? "الخدمات:" : "Services:"}
                  </div>
                  <ul className="list-disc list-inside text-pink-900 text-sm">
                    {receipt.services.map((service, idx) => (
                      <li key={idx}>
                        {service.name} - {service.price?.toFixed(2)} ريال
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Products */}
              {receipt.products?.length > 0 && (
                <div className="mb-2">
                  <div className="text-purple-700 font-semibold mb-1">
                    {isArabic ? "المنتجات:" : "Products:"}
                  </div>
                  <ul className="list-disc list-inside text-purple-900 text-sm">
                    {receipt.products.map((product, idx) => (
                      <li key={idx}>
                        {product.name} ×{product.quantity} - {(product.price * product.quantity).toFixed(2)} ريال
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Info */}
              <div className="text-sm text-gray-700 mt-3">
                <p>
                  {isArabic ? "طريقة الدفع" : "Payment"}:{" "}
                  <span className="font-semibold text-pink-700">
                    {receipt.paymentType || (isArabic ? "غير معروف" : "Unknown")}
                  </span>
                </p>
                <p>
                  {isArabic ? "ضريبة القيمة المضافة" : "VAT"}:{" "}
                  <span className="font-semibold text-purple-700">
                    {receipt.vat?.toFixed(2) || "0.00"} {isArabic ? "ريال" : "SAR"}
                  </span>
                </p>
              </div>

              {/* Total */}
              <div className="text-right text-green-600 font-bold mt-2 text-lg">
                {isArabic ? "الإجمالي" : "Total"}:  {receipt.total?.toFixed(2) || "0.00"} {isArabic ? "ريال" : "SAR"}
              </div>

              <div className="text-xs text-gray-400 mt-3">
                <p>Product CashID : {receipt.cashId}</p>
                <p>Current CashID : {cash._id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default AllReceiptsPage;
