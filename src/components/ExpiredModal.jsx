import { motion, AnimatePresence } from 'framer-motion';

export default function ExpiredModal({ open, onClose, expiredServices = [], isArabic }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }} // 👈 faster exit
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-white max-w-2xl w-full mx-4 rounded-2xl shadow-2xl p-10 text-center space-y-6"
                    >
                        <h2 className="text-3xl font-extrabold text-pink-600">
                            {isArabic ? "انتهت مدة الخدمة!" : "Rental Time Expired!"}
                        </h2>

                        <ul className="space-y-4 text-lg text-gray-700 max-h-80 overflow-y-auto pr-2 text-start">
                            {expiredServices.map((s, i) => {
                                const bgColors = ['bg-pink-200', 'bg-purple-200', 'bg-yellow-200', 'bg-blue-200'];
                                const borderColors = ['border-pink-200', 'border-purple-200', 'border-yellow-200', 'border-blue-200'];
                                const bg = bgColors[i % bgColors.length];
                                const border = borderColors[i % borderColors.length];

                                return (
                                    <li key={i} className={`font-medium ${bg} p-4 rounded-xl border ${border}`}>
                                        <p className="text-pink-600 font-bold text-xl">
                                            {isArabic ? `التسلسل: ${s.serial || 'غير متوفر'}` : `Serial: ${s.serial || 'N/A'}`}
                                        </p>
                                        <p>{isArabic ? `الخدمة: ${s.serviceName}` : `Service: ${s.serviceName}`}</p>
                                        <p>{isArabic ? `العميل: ${s.customerName}` : `Customer: ${s.customerName}`}</p>
                                        <p>{isArabic ? `الجوال: ${s.mobileNumber || 'غير متوفر'}` : `Mobile: ${s.mobileNumber || 'N/A'}`}</p>
                                    </li>
                                );
                            })}
                        </ul>


                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-lg font-semibold shadow-lg hover:from-pink-600 hover:to-purple-600 transition"
                        >
                            {isArabic ? "إغلاق" : "Close"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
