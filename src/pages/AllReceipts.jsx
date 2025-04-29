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
        const { data } = await axios.get(`http://192.168.8.10:5000/receipts/cash-session/${cash._id}`);
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {isArabic ? "الإيصالات لجلسة الكاش الحالية" : "Receipts for Current Cash Session"}
      </h1>

      {/* Sort Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded-md text-gray-700"
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
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition duration-200 bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-gray-700">
                {receipt.customerName || (isArabic ? "عميل غير معروف" : "Unknown Customer")}
              </span>
              <span className="text-sm text-gray-500">
                {receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : (isArabic ? "لا يوجد تاريخ" : "No date")}
              </span>
            </div>

            {/* Serial and Phone */}
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{isArabic ? "التسلسل" : "Serial"}: {receipt.serial || "N/A"}</span>
              <span>{isArabic ? "الهاتف" : "Phone"}: {receipt.mobileNumber || "N/A"}</span>
            </div>

            {/* Services */}
            {receipt.services?.length > 0 && (
              <div className="mb-2">
                <div className="text-gray-700 font-semibold mb-1">
                  {isArabic ? "الخدمات:" : "Services:"}
                </div>
                <ul className="list-disc list-inside text-gray-600 text-sm">
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
                <div className="text-gray-700 font-semibold mb-1">
                  {isArabic ? "المنتجات:" : "Products:"}
                </div>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {receipt.products.map((product, idx) => (
                    <li key={idx}>
                      {product.name} ×{product.quantity} - {(product.price * product.quantity).toFixed(2)} ريال
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payment & VAT */}
            <div className="text-sm text-gray-700 mt-2">
              <p>
                {isArabic ? "طريقة الدفع" : "Payment"}:{" "}
                <span className="font-medium text-gray-800">{receipt.paymentType || (isArabic ? "غير معروف" : "Unknown")}</span>
              </p>
              <p>
                {isArabic ? "ضريبة القيمة المضافة" : "VAT"}:{" "}
                <span className="font-medium text-gray-800">{receipt.vat?.toFixed(2) || "0.00"} {isArabic ? "ريال" : "SAR"}</span>
              </p>
            </div>

            {/* Total */}
            <div className="text-right text-green-600 font-semibold mt-1">
              {isArabic ? "الإجمالي" : "Total"}: {receipt.total?.toFixed(2) || "0.00"} {isArabic ? "ريال" : "SAR"}
            </div>

            <div className="text-xs text-gray-400 mt-2">
              <p>Product CashID : {receipt.cashId}</p>
              <p>Current CashID : {cash._id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllReceiptsPage;
