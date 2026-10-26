import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onboardingRoutes, recoveryRoutes } from "@/app/routes/constants";

export const PublicRoute = () => {
    const location = useLocation();
    const session = useAuthSession();

    if (session.isPending) {
        return <Outlet />;
    }

    if (session.isError) {
        return <Outlet />;
    }

    if (!session.data?.authenticated) {
        return <Outlet />;
    }

    const authSession = session.data;
    const pathname = location.pathname;

    if (recoveryRoutes.has(pathname)) {
        return <Outlet />;
    }

    if (authSession.onboarding.status === "COMPLETED") {
        return (
            <Navigate to="/workspace" replace />
        );
    }

    if (pathname === "/signup/account") {
        return <Outlet />;
    }

    return (
        <Navigate
            to={onboardingRoutes[authSession.onboarding.nextStep]}
            replace
        />
    )
};