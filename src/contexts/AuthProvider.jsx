import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase.config';
import { GoogleAuthProvider } from 'firebase/auth';
import { languageContext } from './LanguageProvider';

export const authContext = createContext(null)
const GoogleProvider = new GoogleAuthProvider();
GoogleProvider.setCustomParameters({
    prompt: "select_account"
})
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const {isArabic} = useContext(languageContext);
    
    useEffect(() => {
        auth.languageCode = isArabic ? 'ar' : 'en';
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setUserLoading(false);
        })

        return unsubscribe
    }, [])
    
    const googleLogin = () => {
        return signInWithPopup(auth, GoogleProvider);
    }

    const logOut = () => {
        return signOut(auth)
    }
    
    const value = {user, userLoading, setUserLoading, googleLogin, logOut};
    return (
        <authContext.Provider value={value}>
            {children}
        </authContext.Provider>
    );
};

export default AuthProvider;