import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppLoading } from "@/components/loading/AppLoading";
import { RouteLoading } from "@/components/loading/RouteLoading";
import { ScrollToTop } from "@/layouts/ScrollToTop";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

const App = () => {
  const { pathname } = useLocation();
  const session = useAuthSession();
  const enteringWorkspace = pathname.startsWith("/data-flow-test/");

  if (session.isPending) {
    return <AppLoading />;
  }

  if (session.isError && pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />

      <Suspense
        key={pathname}
        fallback={
          enteringWorkspace ? (
            <AppLoading />
          ) : (
            <RouteLoading className="min-h-screen" />
          )
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
};

export default App;
