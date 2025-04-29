import { createContext, useState } from "react";

export const languageContext = createContext(null);

const LanguageProvider = ({children}) => {
    const [isArabic, setIsArabic] = useState(true);
    const toggleLanguage = () => {
        setIsArabic(!isArabic)
    }
    return <languageContext.Provider value={{isArabic, toggleLanguage}}>{children}</languageContext.Provider>
}

export default LanguageProvider