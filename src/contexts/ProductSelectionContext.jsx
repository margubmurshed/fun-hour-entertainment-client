import { createContext, useState, useContext } from 'react';

const ProductSelectionContext = createContext();

export function ProductSelectionProvider({ children }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    return (
        <ProductSelectionContext.Provider value={{ selectedProducts, setSelectedProducts }}>
            {children}
        </ProductSelectionContext.Provider>
    );
}

export function useProductSelection() {
    return useContext(ProductSelectionContext);
}