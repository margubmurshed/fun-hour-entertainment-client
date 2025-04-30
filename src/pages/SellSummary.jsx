import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import Loading from '../components/Loading';
import { languageContext } from '../contexts/LanguageProvider';
import { cashContext } from '../contexts/CashProvider';

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-rose-600 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function StyledTable({ headers, children }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-pink-100 bg-white">
      <table className="min-w-full table-auto text-sm text-left">
        <thead className="bg-pink-100 text-rose-700">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function NoDataMessage({ text }) {
  return <p className="text-gray-500 italic">{text}</p>;
}


export default function SellSummary() {
  const { isArabic } = useContext(languageContext);
  const { cash } = useContext(cashContext);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cash) {
      fetchReceipts();
    }
  }, [cash]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://192.168.0.102:5000/receipts/cash-session/${cash._id}`);
      setReceipts(res.data);
    } catch (err) {
      toast.error(isArabic ? "فشل في جلب الإيصالات!" : "Failed to fetch receipts!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = moment().startOf('day');
  const todaysReceipts = receipts.filter(receipt =>
    moment(receipt.createdAt).isSame(today, 'day')
  );

  const totalSales = todaysReceipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalVat = todaysReceipts.reduce((sum, r) => sum + (r.vat || 0), 0);
  const cashSales = todaysReceipts
    .filter(r => r.paymentType === 'cash')
    .reduce((sum, r) => sum + (r.total || 0), 0);
  const cardSales = todaysReceipts
    .filter(r => r.paymentType === 'card')
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const productsSoldMap = new Map();
  const servicesSoldMap = new Map();


  todaysReceipts.forEach(receipt => {
    // Products
    receipt.products?.forEach(product => {
      const id = product._id;
      const existing = productsSoldMap.get(id);
      const quantity = product.quantity || 1;
      if (existing) {
        existing.quantity += quantity;
      } else {
        productsSoldMap.set(id, {
          name: product.name,
          price: product.price,
          quantity: quantity,
        });
      }
    });

    // Services
    receipt.services?.forEach(service => {
      const id = service.id;
      const existing = servicesSoldMap.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        servicesSoldMap.set(id, {
          name: service.name,
          price: service.price,
          count: 1,
        });
      }
    });

  });

  const productsSold = Array.from(productsSoldMap.values());
  const servicesSold = Array.from(servicesSoldMap.values());

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-8 bg-pink-50 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold text-center text-rose-600 mb-10">
        {isArabic ? "ملخص مبيعات اليوم" : "Today's Sales Summary"}
      </h1>
  
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {[
          { label: isArabic ? "إجمالي المبيعات" : "Total Sales", value: totalSales, color: "rose-600" },
          { label: isArabic ? "إجمالي الضريبة" : "Total VAT", value: totalVat, color: "pink-600" },
          { label: isArabic ? "مبيعات نقدية" : "Cash Sales", value: cashSales, color: "fuchsia-600" },
          { label: isArabic ? "مبيعات بطاقة" : "Card Sales", value: cardSales, color: "purple-600" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-md border border-pink-100">
            <div className="text-sm text-gray-500 mb-1">{item.label}</div>
            <div className={`text-2xl font-semibold text-${item.color}`}>
              {item.value.toFixed(2)} ريال
            </div>
          </div>
        ))}
      </div>
  
      {/* Section: Products */}
      <Section title={isArabic ? "المنتجات المباعة اليوم" : "Products Sold Today"}>
        {productsSold.length > 0 ? (
          <StyledTable headers={[
            isArabic ? "المنتج" : "Product Name",
            isArabic ? "السعر" : "Price",
            isArabic ? "الكمية" : "Quantity",
            isArabic ? "الإجمالي" : "Total"
          ]}>
            {productsSold.map((item, i) => (
              <tr key={i} className="hover:bg-pink-50">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.price} ريال</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{(item.price * item.quantity).toFixed(2)} ريال</td>
              </tr>
            ))}
          </StyledTable>
        ) : (
          <NoDataMessage text={isArabic ? "لم يتم بيع أي منتجات اليوم." : "No products sold today."} />
        )}
      </Section>
  
      {/* Section: Services */}
      <Section title={isArabic ? "الخدمات المقدمة اليوم" : "Services Sold Today"}>
        {servicesSold.length > 0 ? (
          <StyledTable headers={[
            isArabic ? "الخدمة" : "Service Name",
            isArabic ? "السعر" : "Price",
            isArabic ? "عدد المرات" : "Times",
            isArabic ? "الإجمالي" : "Total"
          ]}>
            {servicesSold.map((item, i) => (
              <tr key={i} className="hover:bg-pink-50">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.price} ريال</td>
                <td className="px-4 py-2">{item.count}</td>
                <td className="px-4 py-2">{(item.price * item.count).toFixed(2)} ريال</td>
              </tr>
            ))}
          </StyledTable>
        ) : (
          <NoDataMessage text={isArabic ? "لم يتم بيع أي خدمات اليوم." : "No services sold today."} />
        )}
      </Section>
  
      {/* Section: Receipts */}
      <Section title={isArabic ? "إيصالات اليوم" : "Receipts of Today"}>
        <StyledTable headers={[
          isArabic ? "العميل" : "Customer",
          isArabic ? "رقم الجوال" : "Mobile",
          isArabic ? "الدفع" : "Payment",
          isArabic ? "الإجمالي" : "Total",
          isArabic ? "الوقت" : "Time",
        ]}>
          {todaysReceipts.map(r => (
            <tr key={r._id} className="hover:bg-pink-50">
              <td className="px-4 py-2">{r.customerName || (isArabic ? "غير معروف" : "N/A")}</td>
              <td className="px-4 py-2">{r.mobileNumber || 'N/A'}</td>
              <td className="px-4 py-2 capitalize">
                {r.paymentType === 'cash' && (isArabic ? 'نقداً' : 'Cash')}
                {r.paymentType === 'card' && (isArabic ? 'بطاقة' : 'Card')}
                {!['cash', 'card'].includes(r.paymentType) && 'N/A'}
              </td>
              <td className="px-4 py-2">{(r.total || 0).toFixed(2)} ريال</td>
              <td className="px-4 py-2">{moment(r.createdAt).format('hh:mm A')}</td>
            </tr>
          ))}
        </StyledTable>
      </Section>
    </div>
  );
  
}
