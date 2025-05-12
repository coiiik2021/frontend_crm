import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [recipientInfo, setRecipientInfo] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postCode: "",
        country: ""
    });

    const [packages, setPackages] = useState([]);

    return (
        <OrderContext.Provider value={{
            recipientInfo,
            setRecipientInfo,
            packages,
            setPackages
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
} 