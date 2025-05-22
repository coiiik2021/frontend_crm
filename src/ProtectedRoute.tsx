import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    try {
        const decoded: any = jwtDecode(token);
        const userRoles: string[] = decoded.roles || [];

        const hasAccess = allowedRoles.some(role => userRoles.includes(role));
        if (!hasAccess) {
            return <Navigate to="/403" replace />;
        }

        return children;
    } catch (err) {
        return <Navigate to="/signin" replace />;
    }
};

export default ProtectedRoute;
