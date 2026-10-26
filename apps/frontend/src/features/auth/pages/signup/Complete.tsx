import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { AuthStatusPanel } from "@/features/auth/components/AuthStatusPanel";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthSummary } from "@/features/auth/components/AuthSummary";
import { JOB_ROLES } from "@/features/auth/fixtures/profile";
import { useSignupCompletion } from "@/features/auth/hooks/use-signup-completion";

const Complete = () => {
    const navigate = useNavigate();
    const { data } = useSignupCompletion();

    const { workspace, profile } = data;
    const jobRoleLabel = JOB_ROLES.find(role => 
        role.value === profile.jobRole)?.label ?? profile.jobRole;

    return (
        <>
            <AuthStatusPanel
                icon={Check}
                tone="success"
                title="Your workspace is ready"
                description={
                    <p>
                        <span className="font-medium text-foreground wrap-break-word">
                            {workspace.name}
                        </span>{" "}
                        has been created.
                    </p>
                }
            >
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    You can now start configuring Causolve for your incident response workflow.
                </p>

                <AuthSummary
                    items={[
                        { label: "Workspace", value: workspace.name },
                        { label: "Job role", value: jobRoleLabel },
                    ]}
                />

                <AuthSubmitButton
                    type="button"
                    onClick={() => navigate("/workspace", {replace: true})}
                >
                    Enter Causolve
                </AuthSubmitButton>
            </AuthStatusPanel>
        </>
    )
}

export default Complete;
