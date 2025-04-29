import React, { useContext } from 'react';
import { authContext } from '../contexts/AuthProvider';
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';

const PrivateRoute = ({ children }) => {
    const { user, userLoading } = useContext(authContext);

    if (!user && userLoading) return <Loading />

    if (!user) return <Navigate to="/login" />

    return children;
};

export default PrivateRoute;