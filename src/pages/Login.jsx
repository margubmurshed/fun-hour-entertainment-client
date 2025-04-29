import React, { useContext } from 'react';
import logo from '../assets/logo.png'
import { authContext } from '../contexts/AuthProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { languageContext } from '../contexts/LanguageProvider';

export default function Login() {
  const { googleLogin, user, userLoading, setUserLoading } = useContext(authContext);
  const {isArabic} = useContext(languageContext)
  const navigate = useNavigate();

  const handleLogin = () => {
    setUserLoading(true);
    googleLogin().then(() => {
      navigate("/")
    })
      .catch(err => {
        toast.error(err.message);
        setUserLoading(false);
      })
  }

  if (user) return <Navigate to="/" />

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 select-none">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-6">

        {/* Logo */}
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24"
        />

        {/* Login Text */}
        <h1 className="text-2xl font-bold text-gray-700">
          {isArabic ? "سجّل الدخول الآن" : "Login Now"}
        </h1>

        {/* Google Login Button */}
        <button className="flex items-center space-x-3 bg-white border border-gray-300 px-6 py-3 rounded-full shadow hover:shadow-md transition" onClick={handleLogin} disabled={userLoading}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span className="font-medium text-gray-700">
            {isArabic ? "تسجيل الدخول باستخدام جوجل" : "Sign in with Google"}
          </span>
        </button>

      </div>
    </div>
  );
}
