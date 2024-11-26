import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import Loader from '@/components/ui/loader';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        setTimeout(() => setShowLoader(false), 1000);
    }, []);

    if (loading || showLoader) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <Loader />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/auth/login' />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
