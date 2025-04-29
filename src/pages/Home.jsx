import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cashContext } from '../contexts/CashProvider';
import Loading from '../components/Loading';
import { languageContext } from '../contexts/LanguageProvider';

const rents = [
    { id: 1, name: "1 Hour", name_ar: "ساعة واحدة", price: 29, duration: 60 },
    { id: 2, name: "2 Hours", name_ar: "ساعتين", price: 40, duration: 120 },
    { id: 3, name: "3 Hours", name_ar: "ثلاث ساعات", price: 59, duration: 180 },
];

const packages = [
    { id: 4, name: "5-Day Monthly Package", name_ar: "باقة شهرية 5 أيام", price: 650, duration: 5 * 24 * 60 },
    { id: 5, name: "3-Day Weekly Package", name_ar: "باقة أسبوعية 3 أيام", price: 400, duration: 3 * 24 * 60 },
];

export default function Home() {
    const { isArabic } = useContext(languageContext);
    const [customerName, setCustomerName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentType, setPaymentType] = useState('cash');
    const [loading, setLoading] = useState(true);
    const [activeRentals, setActiveRentals] = useState([]);
    const [expiredServices, setExpiredServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { cash } = useContext(cashContext);
    const alertAudioRef = useRef(null);


    useEffect(() => {
        fetchProducts();
        const storedRentals = JSON.parse(localStorage.getItem('activeRentals') || '[]');
        setActiveRentals(storedRentals);
    }, []);

    useEffect(() => {
        if (!alertAudioRef.current) {
            alertAudioRef.current = new Audio('/alert.mp3'); // Put alert.mp3 in public/
            alertAudioRef.current.loop = true;
        }
    
        if (expiredServices.length > 0) {
            alertAudioRef.current.play().catch(e => console.warn("Audio blocked until user interaction:", e));
        } else {
            alertAudioRef.current.pause();
            alertAudioRef.current.currentTime = 0;
        }
    }, [expiredServices]);
    

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const expiredRentals = activeRentals.filter(rental => rental.expireAt <= now);

            expiredRentals.forEach(rental => {
                setExpiredServices(prev => [...prev, rental]);
            });

            if (expiredRentals.length > 0) {
                setActiveRentals(prev => {
                    const updated = prev.filter(rental => rental.expireAt > now);
                    localStorage.setItem('activeRentals', JSON.stringify(updated));
                    return updated;
                });
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [activeRentals]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://192.168.8.10:5000/products");
            setProducts(res.data);
        } catch (err) {
            toast.error(isArabic ? "فشل تحميل المنتجات" : "Failed to load products");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (item) => {
        setSelectedServices(prev =>
            prev.find(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const addProduct = (item) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p._id === item._id);
            if (existing) {
                return prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p);
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    };

    const removeProduct = (item) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p._id === item._id);
            if (existing && existing.quantity > 1) {
                return prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity - 1 } : p);
            } else {
                return prev.filter(p => p._id !== item._id);
            }
        });
    };

    const totalService = selectedServices.reduce((sum, item) => sum + item.price, 0);
    const totalProduct = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = totalService + totalProduct;
    const vat = total * 0.15;

    const generateReceipt = async () => {
        if (!cash) {
            toast.error(isArabic ? "يرجى فتح الكاش لإنشاء الفاتورة" : "Open the cash to generate receipt");
            return;
        }

        if (selectedProducts.some(p => p.quantity > p.inventory)) {
            toast.error(isArabic ? "الكمية المحددة تتجاوز المخزون المتاح!" : "Selected quantity exceeds available stock!");
            return;
        }

        const receipt = {
            customerName,
            mobileNumber,
            services: selectedServices,
            products: selectedProducts,
            paymentType,
            total,
            vat,
            cashId: cash._id,
            createdAt: new Date().getTime()
        };

        try {
            const result = await axios.post("http://192.168.8.10:5000/receipts", receipt);
            if (result.data.insertedId) {
                toast.success(isArabic ? "تم حفظ الفاتورة بنجاح!" : "Receipt Saved Successfully!");

                await Promise.all(selectedProducts.map(async (product) => {
                    const newInventory = product.inventory - product.quantity;
                    await axios.put(`http://192.168.8.10:5000/products/${product._id}`, { inventory: newInventory });
                }));

                const now = Date.now();
                const rentals = selectedServices.map(service => ({
                    customerName,
                    mobileNumber,
                    serviceName: isArabic ? service.name_ar : service.name,
                    expireAt: now + (service.duration * 60 * 1000),
                }));

                setActiveRentals(prev => {
                    const updated = [...prev, ...rentals];
                    localStorage.setItem('activeRentals', JSON.stringify(updated));
                    return updated;
                });

                const printResponse = await axios.post('http://192.168.8.10:5000/print', { receiptId: result.data.insertedId });
                toast.success(printResponse.data.message);

                setCustomerName('');
                setMobileNumber('');
                setSelectedServices([]);
                setSelectedProducts([]);
                setPaymentType('cash');

                fetchProducts();
            }
        } catch (e) {
            toast.error(isArabic ? "فشل حفظ الفاتورة" : "Failed to save receipt");
            console.error(e);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading />;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 bg-white min-h-screen relative">
            {expiredServices.map((rental, index) => (
                <div key={index} className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-red-600 animate-bounce">{isArabic ? "⏰ انتهى الوقت!" : "⏰ Time Over!"}</h2>
                        <p className="text-lg mb-2 font-semibold">{rental.customerName}</p>
                        <p className="text-lg mb-2 font-semibold">{rental.mobileNumber}</p>
                        <p className="mb-4">{isArabic ? "الخدمة:" : "Service:"} <strong>{rental.serviceName}</strong> {isArabic ? "انتهت صلاحيتها!" : "has expired!"}</p>
                        <button className="btn btn-error" onClick={() => setExpiredServices(prev => prev.filter((_, i) => i !== index))}>
                            {isArabic ? "إغلاق" : "Close"}
                        </button>
                    </motion.div>
                </div>
            ))}

            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-pink-600">{isArabic ? "ساعة فرح للترفيه" : "Fun Hour Entertainment"}</h1>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder={isArabic ? "اسم العميل" : "Customer Name"}
                    className="input input-bordered w-full"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder={isArabic ? "رقم الجوال" : "Mobile Number"}
                    className="input input-bordered w-full"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                />
                <div>
                    <h2 className="text-xl font-bold mb-2">
                        {isArabic ? "اختيار الخدمة" : "Select Service"}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[...rents, ...packages].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleService(item)}
                                className={`btn ${selectedServices.some(i => i.id === item.id) ? 'btn-success' : 'btn-outline'}`}
                            >
                                {isArabic ? item.name_ar : item.name} - {item.price} SAR
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-2">
                        {isArabic ? "المنتجات" : "Products"}
                    </h2>
                    <input
                        type="text"
                        placeholder={isArabic ? "بحث عن منتج..." : "Search for a product..."}
                        className="input input-bordered w-full mb-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="border p-3 rounded shadow">
                                <h3 className="font-semibold">{product.name}</h3>
                                <p>{isArabic ? "السعر" : "Price"}: {product.price} SAR</p>
                                <p>{isArabic ? "المخزون" : "Stock"}: {product.inventory}</p>
                                <button className="btn btn-primary btn-sm mt-2" onClick={() => addProduct(product)}>
                                    {isArabic ? "إضافة" : "Add"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-2">
                        {isArabic ? "العناصر المختارة" : "Selected Items"}
                    </h2>
                    {selectedProducts.length === 0 ? (
                        <p className="text-gray-500">{isArabic ? "لم يتم اختيار منتجات." : "No products selected."}</p>
                    ) : (
                        selectedProducts.map((item) => (
                            <div key={item._id} className="flex justify-between items-center mb-2">
                                <div>
                                    <p>{item.name}</p>
                                    <p>{item.price} x {item.quantity}</p>
                                </div>
                                <div>
                                    <button className="btn btn-sm btn-outline mr-1" onClick={() => addProduct(item)}>+</button>
                                    <button className="btn btn-sm btn-outline" onClick={() => removeProduct(item)}>-</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-1">
                    <p><strong>{isArabic ? "الضريبة (15%):" : "VAT (15%)"}:</strong> {vat.toFixed(2)} SAR</p>
                    <p><strong>{isArabic ? "السعر الإجمالي:" : "Total"}:</strong> {total.toFixed(2)} SAR</p>
                </div>

                <div className="space-y-2">
                    <label className="block font-bold">{isArabic ? "نوع الدفع:" : "Payment Type:"}</label>
                    <select className="select select-bordered w-full" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                        <option value="cash">{isArabic ? "نقداً" : "Cash"}</option>
                        <option value="card">{isArabic ? "بطاقة" : "Card"}</option>
                    </select>
                </div>

                <div className="mt-4">
                    <button className="btn btn-primary w-full" onClick={generateReceipt}>
                        {isArabic ? "إنشاء الفاتورة" : "Generate Receipt"}
                    </button>
                </div>
            </div>
        </div>
    );
}

