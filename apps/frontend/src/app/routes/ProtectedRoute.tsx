import { AppLoading } from "@/components/loading/AppLoading";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import type { AuthenticatedAuthSession } from "contracts";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onboardingRoutes } from "@/app/routes/constants";
import { SessionUnavailable } from "@/features/auth/components/SessionUnavailable"; 

const getNextRoute = (session: AuthenticatedAuthSession) => onboardingRoutes[session.onboarding.nextStep];

export const ProtectedRoute = () => {
    const location = useLocation();
    const session = useAuthSession();

    if (session.isPending) {
        return <AppLoading />
    }

    if (session.isError) {
        return (
            <SessionUnavailable
                retrying={session.isFetching}
                onRetry={() => void session.refetch()}
            />
        );
    }

    if (!session.data?.authenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const authSession = session.data;
    const pathname = location.pathname;
    const nextRoute = getNextRoute(authSession);

    if (authSession.onboarding.status === "COMPLETED") {
        if (pathname.startsWith("/signup") && pathname !== "/signup/complete") {
            return (
                <Navigate to="/signup/complete" replace />
            );
        }

        return <Outlet />;
    }

    if (!pathname.startsWith("/signup")) {
        return <Navigate to={nextRoute} replace />;
    }

    switch (pathname) {
        case "/signup/verify-email":
            if (authSession.onboarding.emailVerified) {
                return <Navigate to="/signup/workspace" replace />;
            }
            return <Outlet />;

        case "/signup/workspace":
            if (!authSession.onboarding.emailVerified) {
                return <Navigate to={nextRoute} replace />;
            }
            return <Outlet />;

        case "/signup/profile":
            if (!authSession.onboarding.workspaceCreated) {
                return <Navigate to={nextRoute} replace />;
            }
            return <Outlet />;

        case "/signup/complete":
            if (!authSession.onboarding.profileCompleted) {
                return <Navigate to={nextRoute} replace />;
            }

            return <Outlet />;

        default:
            return <Navigate to={nextRoute} replace />;
    }
};