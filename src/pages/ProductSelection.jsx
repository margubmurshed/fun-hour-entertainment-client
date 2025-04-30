import { useContext, useEffect, useState } from 'react';
import { useProductSelection } from '../contexts/ProductSelectionContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { languageContext } from '../contexts/LanguageProvider';
import Loading from '../components/Loading';

export default function ProductSelection() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const limit = 20;

    const { selectedProducts, setSelectedProducts } = useProductSelection();
    const navigate = useNavigate();
    const { isArabic } = useContext(languageContext);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await axios.get('http://192.168.8.10:5000/products', {
            params: { search, page, limit }
        });
        setProducts(res.data.products);
        setTotal(res.data.total);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [search, page]);

    const addProduct = (item) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p._id === item._id);
            return existing
                ? prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p)
                : [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeProduct = (item) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p._id === item._id);
            if (!existing) return prev;

            if (existing.quantity > 1) {
                return prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity - 1 } : p);
            } else {
                return prev.filter(p => p._id !== item._id);
            }
        });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{isArabic ? 'اختر المنتجات' : 'Select Products'}</h2>

            <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder={isArabic ? 'ابحث عن منتج...' : 'Search products...'}
                className="mb-4 p-2 border rounded w-full"
            />

            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.map(product => {
                            const selected = selectedProducts.find(p => p._id === product._id);
                            return (
                                <div key={product._id} className="p-4 border rounded-lg shadow">
                                    <p className="font-bold">{isArabic ? product.name_ar : product.name}</p>
                                    <p>{isArabic ? 'السعر' : 'Price'}: {product.price} SAR</p>
                                    <p>{isArabic ? 'المخزون' : 'Stock'}: {product.inventory}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => addProduct(product)} className="px-3 py-1 bg-pink-500 text-white rounded">
                                            {isArabic ? 'إضافة' : '+ Add Product'}
                                        </button>
                                        <button onClick={() => removeProduct(product)} disabled={!selected}
                                            className={`px-3 py-1 rounded text-white ${selected ? 'bg-purple-400' : 'bg-gray-300 cursor-not-allowed'}`}>
                                            {isArabic ? 'إزالة' : '- Remove Product'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-200 rounded">
                            {isArabic ? 'السابق' : 'Previous'}
                        </button>
                        <span className="px-4 py-2">{`${page} / ${totalPages}`}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 rounded">
                            {isArabic ? 'التالي' : 'Next'}
                        </button>
                    </div>

                    {/* ✅ Selected Products Summary - Shown at Bottom */}
                    {selectedProducts.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-xl font-semibold mb-2">
                                {isArabic ? 'المنتجات المحددة:' : 'Selected Products:'}
                            </h3>
                            <div className="space-y-2">
                                {selectedProducts.map((p, index) => (
                                    <div
                                        key={p._id}
                                        className="flex justify-between bg-gray-100 p-3 rounded text-sm sm:text-base"
                                    >
                                        <span className="w-1/12 font-medium">{index + 1}.</span>
                                        <span className="w-5/12">{p.name}</span>
                                        <span className="w-2/12 text-center">
                                            {isArabic ? `الكمية: ${p.quantity}` : `Qty: ${p.quantity}`}
                                        </span>
                                        <span className="w-3/12 text-right">
                                            {isArabic ? `السعر: ${(p.price * p.quantity).toFixed(2)} ر.س` : `Price: ${(p.price * p.quantity).toFixed(2)} SAR`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <button
                onClick={() => navigate('/')}
                className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg"
            >
                {isArabic ? 'متابعة' : 'Proceed'}
            </button>
        </div>
    );
}
