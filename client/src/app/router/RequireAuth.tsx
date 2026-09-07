import { Navigate, Outlet, useLocation } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";

export default function RequireAuth() {
    const { isLoggedIn } = useAccount();
    const location = useLocation();

    if (!isLoggedIn()) return <Navigate to='/login' state={{from: location}} />

    return (
        <Outlet />
    )
}