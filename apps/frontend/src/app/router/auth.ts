import { lazy } from "react";
import { redirect, type RouteObject } from "react-router-dom";

const Login = lazy(() => import("@/features/auth/pages/Login"));
const Account = lazy(() => import("@/features/auth/pages/signup/Account"));
const VerifyEmail = lazy(() => import("@/features/auth/pages/signup/VerifyEmail"));
const WorkspaceSetup = lazy(() => import("@/features/auth/pages/signup/WorkspaceSetup"));
const ProfileSetup = lazy(() => import("@/features/auth/pages/signup/ProfileSetup"));
const Complete = lazy(() => import("@/features/auth/pages/signup/Complete"));
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPassword"));
const PasswordUpdated = lazy(() =>
    import("@/features/auth/pages/ResetPassword").then((module) => ({
        default: module.PasswordUpdated,
    })),
);
const CheckEmail = lazy(() => import("@/features/auth/pages/CheckEmail"));
const AcceptInvitation = lazy(() => import("@/features/auth/pages/AcceptInvitation"));

export const publicAuthRoutes: RouteObject[] = [
    { path: "login", Component: Login },
    { path: "invite", Component: AcceptInvitation },
    { path: "signup", loader: () => redirect("/signup/account") },
    { path: "signup/account", Component: Account },
    { path: "forgot-password", Component: ForgotPassword },
    { path: "reset-password", Component: ResetPassword },
    { path: "password-updated", Component: PasswordUpdated },
    { path: "check-email", Component: CheckEmail }
];

export const protectedOnboardingRoutes: RouteObject[] = [
    { path: "signup/verify-email", Component: VerifyEmail },
    { path: "signup/workspace", Component: WorkspaceSetup },
    { path: "signup/profile", Component: ProfileSetup },
    { path: "signup/complete", Component: Complete },
];
