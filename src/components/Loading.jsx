import React, { useContext } from 'react';
import { languageContext } from '../contexts/LanguageProvider';

const Loading = () => {
  const { isArabic } = useContext(languageContext);

  return (
    <div className="flex items-center justify-center min-h-[50vh] bg-gray-100">
      <div className="flex flex-col items-center space-y-4">

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-700">
          {isArabic ? "جارٍ التحميل..." : "Loading..."}
        </h2>

      </div>
    </div>
  );
};

export default Loading;
