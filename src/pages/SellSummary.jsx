import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import Loading from '../components/Loading';
import { languageContext } from '../contexts/LanguageProvider';
import { cashContext } from '../contexts/CashProvider';

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
      const res = await axios.get(`http://192.168.8.10:5000/receipts/cash-session/${cash._id}`);
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
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
        {isArabic ? "ملخص مبيعات اليوم" : "Today's Sales Summary"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{isArabic ? "إجمالي المبيعات" : "Total Sales"}</div>
            <div className="stat-value text-primary">{totalSales.toFixed(2)} ريال</div>
            <div className="stat-desc">
              {todaysReceipts.length} {isArabic ? "إيصال" : "Receipts"}
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{isArabic ? "إجمالي الضريبة" : "Total VAT"}</div>
            <div className="stat-value text-secondary">{totalVat.toFixed(2)} ريال</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{isArabic ? "مبيعات نقدية" : "Cash Sales"}</div>
            <div className="stat-value text-success">{cashSales.toFixed(2)} ريال</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{isArabic ? "مبيعات بطاقة" : "Card Sales"}</div>
            <div className="stat-value text-accent">{cardSales.toFixed(2)} ريال</div>
          </div>
        </div>
      </div>

      {/* Products Sold Today */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          {isArabic ? "المنتجات المباعة اليوم" : "Products Sold Today"}
        </h2>
        {productsSold.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{isArabic ? "المنتج" : "Product Name"}</th>
                  <th>{isArabic ? "السعر (لكل وحدة)" : "Price (Each)"}</th>
                  <th>{isArabic ? "الكمية" : "Quantity Sold"}</th>
                  <th>{isArabic ? "الإجمالي (ريال)" : "Total (SAR)"}</th>
                </tr>
              </thead>
              <tbody>
                {productsSold.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.price} ريال</td>
                    <td>{item.quantity}</td>
                    <td>{(item.price * item.quantity).toFixed(2)} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{isArabic ? "لم يتم بيع أي منتجات اليوم." : "No products sold today."}</p>
        )}
      </div>

      {/* Services Sold Today */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          {isArabic ? "الخدمات المقدمة اليوم" : "Services Sold Today"}
        </h2>
        {servicesSold.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{isArabic ? "الخدمة" : "Service Name"}</th>
                  <th>{isArabic ? "السعر" : "Price (Each)"}</th>
                  <th>{isArabic ? "عدد المرات" : "Times Sold"}</th>
                  <th>{isArabic ? "الإجمالي (ريال)" : "Total (SAR)"}</th>
                </tr>
              </thead>
              <tbody>
                {servicesSold.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.price} ريال</td>
                    <td>{item.count}</td>
                    <td>{(item.price * item.count).toFixed(2)} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{isArabic ? "لم يتم بيع أي خدمات اليوم." : "No services sold today."}</p>
        )}
      </div>

      {/* Receipts Table */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          {isArabic ? "إيصالات اليوم" : "Receipts of Today"}
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{isArabic ? "العميل" : "Customer"}</th>
                <th>{isArabic ? "رقم الجوال" : "Mobile"}</th>
                <th>{isArabic ? "الدفع" : "Payment"}</th>
                <th>{isArabic ? "الإجمالي (ريال)" : "Total (SAR)"}</th>
                <th>{isArabic ? "الوقت" : "Time"}</th>
              </tr>
            </thead>
            <tbody>
              {todaysReceipts.map(r => (
                <tr key={r._id}>
                  <td>{r.customerName || (isArabic ? 'غير معروف' : 'N/A')}</td>
                  <td>{r.mobileNumber || 'N/A'}</td>
                  <td className="capitalize">
                    {r.paymentType === 'cash' && (isArabic ? 'نقداً' : 'Cash')}
                    {r.paymentType === 'card' && (isArabic ? 'بطاقة' : 'Card')}
                    {!['cash', 'card'].includes(r.paymentType) && 'N/A'}
                  </td>
                  <td>{(r.total || 0).toFixed(2)} ريال</td>
                  <td>{moment(r.createdAt).format('hh:mm A')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
