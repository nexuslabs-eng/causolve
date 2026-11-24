import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Team } from "contracts/teams/team.schema";
import { Button } from "@/components/ui/button";
import { TeamFormDialog } from "@/components/dialog/team-form";
import { TeamMembersDialog } from "@/components/dialog/team-members";
import { TeamsList } from "@/features/workspace/components/TeamsList";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import {
  useCreateTeam,
  useDeleteTeam,
  useTeams,
  useUpdateTeam,
} from "@/features/workspace/hooks/use-teams";
import { isApiClientError } from "@/lib/api/api-client-error";

const TeamsSettings = () => {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team>();

  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [membersTeam, setMembersTeam] = useState<Team>();
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const { data: session } = useAuthSession();
  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";
  const teamsQuery = useTeams(organizationId, page);
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const openCreate = () => {
    setEditingTeam(undefined);
    setDialogOpen(true);
  };
  const openEdit = (teamId: string) => {
    const team = teamsQuery.data?.items.find((item) => item.id === teamId);
    if (team) {
      setEditingTeam(team);
      setDialogOpen(true);
    }
  };

  const formError = createMutation.error ?? updateMutation.error;
  const errorMessage = formError
    ? isApiClientError(formError)
      ? formError.message
      : "Unable to save the team."
    : undefined;

  const handleSubmit = (values: { name: string }) => {
    if (!organizationId) return;
    const callbacks = {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success(editingTeam ? "Team renamed successfully." : "Team created successfully.");
      },
      onError: (error: unknown) =>
        toast.error(isApiClientError(error) ? error.message : "Unable to save the team."),
    };
    if (editingTeam) {
      updateMutation.mutate({ organizationId, teamId: editingTeam.id, input: values }, callbacks);
    } else {
      createMutation.mutate({ organizationId, input: values }, callbacks);
    }
  };

  const handleDelete = (teamId: string) => {
    if (!organizationId || !window.confirm("Delete this team?")) return;
    setDeletingTeamId(teamId);
    deleteMutation.mutate(
      { organizationId, teamId },
      {
        onSuccess: () => {
          setDeletingTeamId(null);
          toast.success("Team deleted successfully.");
        },
        onError: (error: unknown) => {
          setDeletingTeamId(null);
          toast.error(isApiClientError(error) ? error.message : "Unable to delete the team.");
        },
      },
    );
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const openMembers = (teamId: string) => {
    const team = teamsQuery.data?.items.find((item) => item.id === teamId);

    if (!team) {
      return;
    }

    setMembersTeam(team);
    setMembersDialogOpen(true);
  };

  return (
    <div className="min-w-0">
      <header className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Teams</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Organize workspace members into teams for operational work.
          </p>
        </div>
        <Button className="shrink-0" type="button" variant="brand" onClick={openCreate}>
          <Plus />
          Create team
        </Button>
      </header>

      <section className="mt-6 min-w-0">
        <TeamsList
          data={teamsQuery.data}
          loading={teamsQuery.isPending}
          failed={teamsQuery.isError}
          page={page}
          onPageChange={setPage}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          deletingTeamId={deletingTeamId}
          onManageMembers={openMembers}
          onRetry={() => void teamsQuery.refetch()}
          retrying={teamsQuery.isFetching}
        />
      </section>

      <TeamFormDialog
        open={dialogOpen}
        team={editingTeam}
        saving={saving}
        error={errorMessage}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <TeamMembersDialog
        open={membersDialogOpen}
        organizationId={organizationId}
        team={membersTeam}
        onOpenChange={(open) => {
          setMembersDialogOpen(open);

          if (!open) {
            setMembersTeam(undefined);
          }
        }}
      />
    </div>
  );
};

export { TeamsSettings };
