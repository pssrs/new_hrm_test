import { Navigate } from 'react-router';
import { useAccount } from '../../lib/hooks/useAccount';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAccount();
    const hasToken = !!localStorage.getItem("token");

    // Token exists but user not loaded yet → wait (don't redirect)
    if (hasToken && !user) {
        return null;
    }

    // No token → go to login
    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    // User loaded: check admin status
    if (!user || user.kk !== 1) {
        return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
    }

    return children;
}
