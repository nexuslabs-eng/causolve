import type { CreateInvitationRequest } from "contracts/invitations/create-invitation.schema";

export interface InviteMembersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSend?: (invitations: CreateInvitationRequest[]) => void | Promise<void>;
    sending?: boolean;
    workspaceName?: string;
}

export interface SendInvitationsVariables {
    organizationId: string;
    invitations: CreateInvitationRequest[];
}

export interface InvitationFormProps {
    onSend?: (invitations: CreateInvitationRequest[]) => void | Promise<void>;
    onSent: (count: number) => void;
    onCancel: () => void;
    sending: boolean;
}

export type InviteMembersFormValues = {
    invitations: CreateInvitationRequest[];
};

export interface InvitationSuccessStateProps {
    count: number;
    onClose: () => void;
}

