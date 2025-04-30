import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authContext } from './AuthProvider';
import toast from 'react-hot-toast';

export const cashContext = createContext(null);

const CashProvider = ({ children }) => {
    const [cash, setCash] = useState(null);
    const [cashLoading, setCashLoading] = useState(true);
    const { user } = useContext(authContext)


    const fetchCash = () => {
        setCashLoading(true);
        return axios.get(`http://192.168.0.102:5000/cashes/${user.email}`)
            .then(result => {
                if (!result.data) setCash(null)
                else setCash(result.data);
                setCashLoading(false)
            })
            
    }

    useEffect(() => {
        if (user?.email) {
          fetchCash().catch(err => {
            toast.error(err.message);
            setCashLoading(false);
          });
        }
      }, [user]);

    const value = { cash, cashLoading, setCashLoading, fetchCash }
    return (
        <cashContext.Provider value={value}>
            {children}
        </cashContext.Provider>
    );
};

export default CashProvider;