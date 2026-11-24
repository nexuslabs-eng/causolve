import { tableFeatures, useTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Loader2, Plus, Trash2, Users } from "lucide-react";
import type { Team, TeamListResponse } from "contracts/teams/team.schema";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";

const features = tableFeatures({});
type TeamsListProps = {
  data?: TeamListResponse;
  loading: boolean;
  failed: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (teamId: string) => void;
  onDelete: (teamId: string) => void;
  deletingTeamId: string | null;
  onManageMembers: (teamId: string) => void;
  onRetry: () => void;
  retrying: boolean;
};

export const TeamsList = ({
  data,
  loading,
  failed,
  page,
  onPageChange,
  onCreate,
  onEdit,
  onDelete,
  deletingTeamId,
  onManageMembers,
  onRetry,
  retrying,
}: TeamsListProps) => {
  if (loading)
    return (
      <div
        className="flex min-h-32 items-center justify-center"
        role="status"
        aria-label="Loading teams"
      >
        <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
      </div>
    );
  if (failed || !data)
    return (
      <SettingsLoadError
        message="Unable to load teams"
        reason="We could not load the teams in this workspace. Try again shortly."
        retrying={retrying}
        onRetry={onRetry}
      />
    );
  if (data.items.length === 0)
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border px-6 text-center">
        <Users aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">No teams yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a team to organize members operationally.
        </p>
        <Button className="mt-4" type="button" variant="subtle" onClick={onCreate}>
          <Plus aria-hidden="true" />
          Create team
        </Button>
      </div>
    );
  return (
    <>
      <TeamsTable
        teams={data.items}
        deletingTeamId={deletingTeamId}
        onEdit={onEdit}
        onDelete={onDelete}
        onManageMembers={onManageMembers}
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

const TeamsTable = ({
  teams,
  deletingTeamId,
  onEdit,
  onDelete,
  onManageMembers,
}: {
  teams: Team[];
  deletingTeamId: string | null;
  onEdit: (teamId: string) => void;
  onDelete: (teamId: string) => void;
  onManageMembers: (teamId: string) => void;
}) => {
  const columns: Array<ColumnDef<typeof features, Team>> = [
    {
      accessorKey: "name",
      header: "Team",
      cell: (info) => <p className="font-medium text-foreground">{info.getValue<string>()}</p>,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (info) =>
        new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
          new Date(info.getValue<string>()),
        ),
    },
    {
      id: "manageMembers",
      header: "Manage members",
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              aria-label={`Manage members of ${row.original.name}`}
              onClick={() => onManageMembers(row.original.id)}
            >
              <Users aria-hidden="true" />
              Manage
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage members of {row.original.name}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Rename ${row.original.name}`}
                onClick={() => onEdit(row.original.id)}
              >
                <Edit3 aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rename {row.original.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Delete ${row.original.name}`}
                disabled={deletingTeamId === row.original.id}
                onClick={() => onDelete(row.original.id)}
              >
                {deletingTeamId === row.original.id ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <Trash2 aria-hidden="true" className="text-destructive" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete {row.original.name}</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];
  const table = useTable({
    key: "workspace-teams",
    features,
    columns,
    data: teams,
  });
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-full text-left text-sm">
        <caption className="sr-only">Workspace teams</caption>
        <thead className="border-b border-border bg-surface-inset/30 text-xs text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-medium last:text-right"
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
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
