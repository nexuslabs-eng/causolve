import { tableFeatures, useTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Mail, RefreshCw, XCircle } from "lucide-react";
import type { InvitationListItem, InvitationListResponse } from "contracts/invitations/invitation-list.schema";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import type { InvitationAction } from "@/features/workspace/hooks/use-members-settings";
import {
  JOB_ROLES_LABELS,
  ROLE_LABELS,
} from "@/features/workspace/lib/invite-members";
import { cn } from "@/lib/utils";

const features = tableFeatures({});
const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
const invitationStatusStyles = {
  PENDING: "border-caution/30 bg-caution/10 text-caution",
  ACCEPTED: "border-success/30 bg-success/10 text-success",
  EXPIRED: "border-critical/30 bg-critical/10 text-critical",
  REVOKED: "border-border bg-muted/40 text-muted-foreground",
} as const;
const invitationStatusLabels = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
} as const;

type MembersInvitationsProps = {
  data?: InvitationListResponse;
  loading: boolean;
  failed: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
  changingInvitation: boolean;
  activeInvitationAction: InvitationAction | null;
  onRetry: () => void;
  retrying: boolean;
};

export const MembersInvitations = ({
  data,
  loading,
  failed,
  page,
  onPageChange,
  onResend,
  onRevoke,
  changingInvitation,
  activeInvitationAction,
  onRetry,
  retrying,
}: MembersInvitationsProps) => {
  if (loading)
    return (
      <div
        className="flex min-h-32 items-center justify-center"
        role="status"
        aria-label="Loading invitations"
      >
        <Loader2
          aria-hidden="true"
          className="size-4 animate-spin text-primary"
        />
      </div>
    );
  if (failed || !data)
    return (
      <SettingsLoadError
        message="Unable to load invitations"
        reason="We could not load the invitations for this workspace. Try again shortly."
        retrying={retrying}
        onRetry={onRetry}
      />
    );
  if (data.invitations.length === 0)
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border px-6 text-center">
        <Mail aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No invitations yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite teammates to start building your workspace team.
        </p>
      </div>
    );
  const invitations = [...data.invitations].sort(
    (first, second) =>
      Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
  return (
    <>
      <InvitationsTable
        invitations={invitations}
        changingInvitation={changingInvitation}
        activeInvitationAction={activeInvitationAction}
        onResend={onResend}
        onRevoke={onRevoke}
      />
      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const InvitationsTable = ({
  invitations,
  changingInvitation,
  activeInvitationAction,
  onResend,
  onRevoke,
}: {
  invitations: InvitationListItem[];
  changingInvitation: boolean;
  activeInvitationAction: InvitationAction | null;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
}) => {
  const columns: Array<ColumnDef<typeof features, InvitationListItem>> = [
    {
      accessorKey: "email",
      header: "Invitee",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Mail aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="text-foreground">{info.getValue<string>()}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Workspace role",
      cell: (info) => ROLE_LABELS[info.getValue<keyof typeof ROLE_LABELS>()],
    },
    {
      accessorKey: "jobRole",
      header: "Professional role",
      cell: (info) =>
        JOB_ROLES_LABELS[info.getValue<keyof typeof JOB_ROLES_LABELS>()],
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue<keyof typeof invitationStatusStyles>();
        return (
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-1 text-[10px] font-medium",
              invitationStatusStyles[status],
            )}
          >
            {invitationStatusLabels[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: (info) => formatDate(info.getValue<string>()),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invitation = row.original;
        if (invitation.status !== "PENDING") return null;
        return (
          <div className="flex justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Resend invitation to ${invitation.email}`}
                  disabled={changingInvitation}
                  onClick={() => onResend(invitation.id)}
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={cn(
                      activeInvitationAction?.invitationId === invitation.id &&
                        activeInvitationAction.type === "resend" &&
                        "animate-spin",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resend invitation</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Revoke invitation for ${invitation.email}`}
                  disabled={changingInvitation}
                  onClick={() => onRevoke(invitation.id)}
                >
                  <XCircle
                    aria-hidden="true"
                    className={cn(
                      activeInvitationAction?.invitationId === invitation.id &&
                        activeInvitationAction.type === "revoke" &&
                        "animate-spin",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Revoke invitation</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  const table = useTable({
    key: "workspace-invitations",
    features,
    columns,
    data: invitations,
  });
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-225 text-left text-sm">
        <caption className="sr-only">Workspace invitations</caption>
        <thead className="border-b border-border bg-surface-inset/30 text-xs text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-medium last:text-right"
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-accent/20">
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-4 py-3 text-muted-foreground last:text-right"
                >
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
