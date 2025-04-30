import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { cashContext } from '../contexts/CashProvider';
import Loading from '../components/Loading';
import { languageContext } from '../contexts/LanguageProvider';
import ExpiredModal from '../components/ExpiredModal';

const rents = [
    { id: 1, name: "1 Hour", name_ar: "ساعة واحدة", price: 29, duration: 60 },
    { id: 2, name: "2 Hours", name_ar: "ساعتين", price: 40, duration: 120 },
    { id: 3, name: "3 Hours", name_ar: "ثلاث ساعات", price: 59, duration: 180 },
    { id: 4, name: "1 Minute", name_ar: "ثلاث ساعات", price: 59, duration: 1 },
];

const packages = [
    { id: 5, name: "5-Day Monthly Package", name_ar: "باقة شهرية 5 أيام", price: 650, duration: 5 * 24 * 60 },
    { id: 6, name: "3-Day Weekly Package", name_ar: "باقة أسبوعية 3 أيام", price: 400, duration: 3 * 24 * 60 },
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpiredIndex, setCurrentExpiredIndex] = useState(0);
    const { cash } = useContext(cashContext);
    const alertAudioRef = useRef(null);

    useEffect(() => {
        if (!alertAudioRef.current) {
            const audio = new Audio('/alert.mp3');
            audio.loop = true;
            alertAudioRef.current = audio;
        }

        if (expiredServices.length > 0) {
            alertAudioRef.current?.play().catch(e =>
                console.warn("Audio blocked until user interaction:", e)
            );
            setIsModalOpen(true); // <-- 💥 This is missing!
        } else {
            if (alertAudioRef.current) {
                alertAudioRef.current.pause();
                alertAudioRef.current.currentTime = 0;
            }
        }
    }, [expiredServices]);

    useEffect(() => {
        fetchProducts();
        const storedRentals = JSON.parse(localStorage.getItem('activeRentals') || '[]');
        setActiveRentals(storedRentals);
    }, []);


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

    const handleModalClose = () => {
        if (currentExpiredIndex < expiredServices.length - 1) {
            setCurrentExpiredIndex((prev) => prev + 1);
        } else {
            setIsModalOpen(false);
            setExpiredServices([]); // optional: clear after showing all
            setCurrentExpiredIndex(0);

            if (alertAudioRef.current) {
                alertAudioRef.current.pause();
                alertAudioRef.current.currentTime = 0;
            }
        }
    };


    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://192.168.0.102:5000/products");
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
            const result = await axios.post("http://192.168.0.102:5000/receipts", receipt);
            if (result.data.insertedId) {
                toast.success(isArabic ? "تم حفظ الفاتورة بنجاح!" : "Receipt Saved Successfully!");

                await Promise.all(selectedProducts.map(async (product) => {
                    const newInventory = product.inventory - product.quantity;
                    await axios.put(`http://192.168.0.102:5000/products/${product._id}`, { inventory: newInventory });
                }));

                const serialResult = await axios.get(`http://192.168.0.102:5000/getReceiptSerial/${result.data.insertedId}`);
                const serial = serialResult.data.serial;

                const now = Date.now();
                const rentals = selectedServices.map(service => ({
                    customerName,
                    mobileNumber,
                    serviceName: isArabic ? service.name_ar : service.name,
                    expireAt: now + (service.duration * 60 * 1000),
                    serial
                }));

                setActiveRentals(prev => {
                    const updated = [...prev, ...rentals];
                    localStorage.setItem('activeRentals', JSON.stringify(updated));
                    return updated;
                });

                const printResponse = await axios.post('http://192.168.0.102:5000/print', { receiptId: result.data.insertedId });
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
        <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-white to-purple-100 px-4 py-6">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight">
                        {isArabic ? "ساعة فرح للترفيه" : "Fun Hour Entertainment"}
                    </h1>
                </div>

                <input
                    type="text"
                    placeholder={isArabic ? "اسم العميل" : "Customer Name"}
                    className="input input-bordered w-full border-pink-300 focus:ring-2 focus:ring-pink-400"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder={isArabic ? "رقم الجوال" : "Mobile Number"}
                    className="input input-bordered w-full border-pink-300 focus:ring-2 focus:ring-pink-400"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                />

                <div>
                    <h2 className="text-xl font-bold mb-2 text-pink-700">
                        {isArabic ? "اختيار الخدمة" : "Select Service"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...rents, ...packages].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleService(item)}
                                className={`rounded-full py-2 px-4 font-medium shadow ${selectedServices.some(i => i.id === item.id)
                                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                                    : 'bg-white border border-pink-300 text-pink-600 hover:bg-pink-100'
                                    }`}
                            >
                                {isArabic ? item.name_ar : item.name} - {item.price} SAR
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-2 text-pink-700">
                        {isArabic ? "المنتجات" : "Products"}
                    </h2>
                    <input
                        type="text"
                        placeholder={isArabic ? "بحث عن منتج..." : "Search for a product..."}
                        className="input input-bordered w-full border-pink-300 focus:ring-2 focus:ring-pink-400 mb-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="bg-white border border-pink-200 p-4 rounded-xl shadow-md">
                                <h3 className="font-semibold text-pink-700">{product.name}</h3>
                                <p>{isArabic ? "السعر" : "Price"}: {product.price} SAR</p>
                                <p>{isArabic ? "المخزون" : "Stock"}: {product.inventory}</p>
                                <button
                                    className="mt-2 bg-pink-500 text-white rounded-full px-4 py-1 hover:bg-pink-600"
                                    onClick={() => addProduct(product)}
                                >
                                    {isArabic ? "إضافة" : "Add"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-2 text-pink-700">
                        {isArabic ? "العناصر المختارة" : "Selected Items"}
                    </h2>
                    {selectedProducts.length === 0 ? (
                        <p className="text-gray-500">{isArabic ? "لم يتم اختيار منتجات." : "No products selected."}</p>
                    ) : (
                        selectedProducts.map((item) => (
                            <div key={item._id} className="flex justify-between items-center bg-pink-50 rounded-xl p-3 mb-2 shadow-sm">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p>{item.price} x {item.quantity}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600" onClick={() => addProduct(item)}>+</button>
                                    <button className="bg-purple-400 text-white px-3 py-1 rounded hover:bg-purple-500" onClick={() => removeProduct(item)}>-</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-1 text-pink-700">
                    <p><strong>{isArabic ? "الضريبة (15%):" : "VAT (15%)"}:</strong> {vat.toFixed(2)} SAR</p>
                    <p><strong>{isArabic ? "السعر الإجمالي:" : "Total"}:</strong> {total.toFixed(2)} SAR</p>
                </div>

                <div className="space-y-2">
                    <label className="block font-bold text-pink-700">{isArabic ? "نوع الدفع:" : "Payment Type:"}</label>
                    <select
                        className="select select-bordered w-full border-pink-300 focus:ring-2 focus:ring-pink-400"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                    >
                        <option value="cash">{isArabic ? "نقداً" : "Cash"}</option>
                        <option value="card">{isArabic ? "بطاقة" : "Card"}</option>
                    </select>
                </div>

                <div className="mt-4">
                    <button
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl text-lg font-bold hover:from-pink-600 hover:to-purple-600 transition"
                        onClick={generateReceipt}
                    >
                        {isArabic ? "إنشاء الفاتورة" : "Generate Receipt"}
                    </button>
                </div>
            </div>
            <ExpiredModal
                open={isModalOpen}
                onClose={handleModalClose}
                expiredServices={expiredServices.length > 0 ? [expiredServices[currentExpiredIndex]] : []}
                isArabic={isArabic}
            />

        </div>

    );

}

