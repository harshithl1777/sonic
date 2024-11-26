import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import Loader from '@/components/ui/loader';

interface GatewayProps {
    children: ReactNode;
}

const Gateway: React.FC<GatewayProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <Loader />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to='/app/dashboard' /> : <>{children}</>;
};

export default Gateway;
