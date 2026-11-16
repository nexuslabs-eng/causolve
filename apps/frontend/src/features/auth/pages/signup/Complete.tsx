import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import type { CreateInvitationRequest } from "contracts";

import { Button } from "@/components/ui/button";
import { AuthStatusPanel } from "@/features/auth/components/AuthStatusPanel";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthSummary } from "@/features/auth/components/AuthSummary";
import { JOB_ROLES } from "@/features/auth/fixtures/profile";
import { useSignupCompletion } from "@/features/auth/hooks/use-signup-completion";
import InviteMembersDialog from "@/components/dialog/invite-members";
import { useSendInvitations } from "@/features/workspace/hooks/use-send-invitations";

const Complete = () => {
    const navigate = useNavigate();
    const { data } = useSignupCompletion();

    const [isInviteDialogOpen, setIsInvitedDialogOpen] = useState(false);
    const sendInvitationsMutation = useSendInvitations();

    const { workspace, profile } = data;
    const jobRoleLabel = JOB_ROLES.find(role => 
        role.value === profile.jobRole)?.label ?? profile.jobRole;

    const handleSendInvitations = async (invitations: CreateInvitationRequest[]) => {
        await sendInvitationsMutation.mutateAsync({
            organizationId: workspace.organizationId,
            invitations,
        });
    };

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

                <div className="mt-8 w-full max-w-md border-t border-border pt-6">
                    <h2 className="text-base font-semibold text-foreground">
                        Bring your team on board
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Invite your teammates to collaborate in {workspace.name} workspace. You can also invite them later from the Workspace Settings.
                    </p>

                    <Button
                        type="button"
                        variant="subtle"
                        className="mt-4 w-full"
                        onClick={() => setIsInvitedDialogOpen(true)}
                    >
                        <UserPlus aria-hidden="true" />
                        Invite team members
                    </Button>
                </div>

                <AuthSubmitButton
                    type="button"
                    onClick={() => navigate("/workspace", {replace: true})}
                >
                    Enter Causolve
                </AuthSubmitButton>
            </AuthStatusPanel>

            <InviteMembersDialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInvitedDialogOpen}
                onSend={handleSendInvitations}
                sending={sendInvitationsMutation.isPending}
                workspaceName={workspace.name}
            />
        </>
    )
}

export default Complete;
