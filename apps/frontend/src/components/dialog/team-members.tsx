import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddTeamMemberRequestSchema,
  type WorkspaceMember,
} from "contracts/teams/team-members.schema";
import type { Team } from "contracts/teams/team.schema";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddTeamMember,
  useRemoveTeamMember,
  useTeamMembers,
  useWorkspaceMembers,
} from "@/features/workspace/hooks/use-team-members";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { ROLE_LABELS } from "@/features/workspace/lib/invite-members";
import { isApiClientError } from "@/lib/api/api-client-error";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TeamMembersFormValues = {
  membershipId: string;
};

type TeamMembersDialogProps = {
  open: boolean;
  organizationId: string;
  team?: Team;
  onOpenChange: (open: boolean) => void;
};

const TeamMembersDialog = ({
  open,
  organizationId,
  team,
  onOpenChange,
}: TeamMembersDialogProps) => {
  const [removingMembershipId, setRemovingMembershipId] = useState<
    string | null
  >(null);

  const form = useForm<TeamMembersFormValues>({
    resolver: zodResolver(AddTeamMemberRequestSchema),
    mode: "onChange",
    defaultValues: {
      membershipId: "",
    },
  });

  const workspaceMembersQuery = useWorkspaceMembers(organizationId);
  const teamMembersQuery = useTeamMembers(organizationId, team?.id ?? "");

  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const currentMembers = useMemo(
    () => teamMembersQuery.data?.items ?? [],
    [teamMembersQuery.data?.items],
  );

  const membershipId = useWatch({
    control: form.control,
    name: "membershipId",
  });

  const currentMembershipIds = useMemo(
    () => new Set(currentMembers.map((member) => member.membershipId)),
    [currentMembers],
  );

  const availableMembers = useMemo(() => {
    return (workspaceMembersQuery.data?.items ?? []).filter(
      (member) => !currentMembershipIds.has(member.membershipId),
    );
  }, [currentMembershipIds, workspaceMembersQuery.data?.items]);

  useEffect(() => {
    if (open) {
      form.reset({ membershipId: "" });
    }
  }, [form, open, team?.id]);

  const handleAddMember = (values: TeamMembersFormValues) => {
    if (!organizationId || !team) {
      return;
    }

    addMemberMutation.mutate(
      {
        organizationId,
        teamId: team.id,
        input: values,
      },
      {
        onSuccess: () => {
          form.reset({ membershipId: "" });
          toast.success("Member added to the team.");
        },
        onError: (error: unknown) => {
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Unable to add this member to the team.",
          );
        },
      },
    );
  };

  const handleRemoveMember = (member: WorkspaceMember) => {
    if (!organizationId || !team) {
      return;
    }

    setRemovingMembershipId(member.membershipId);

    removeMemberMutation.mutate(
      {
        organizationId,
        teamId: team.id,
        membershipId: member.membershipId,
      },
      {
        onSuccess: () => {
          setRemovingMembershipId(null);
          toast.success(`${member.fullName} was removed from the team.`);
        },
        onError: (error: unknown) => {
          setRemovingMembershipId(null);
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Unable to remove this member from the team.",
          );
        },
      },
    );
  };

  const loadingMembers =
    workspaceMembersQuery.isPending || teamMembersQuery.isPending;

  const loadingFailed =
    !loadingMembers &&
    !workspaceMembersQuery.isFetching &&
    !teamMembersQuery.isFetching &&
    (workspaceMembersQuery.isError || teamMembersQuery.isError);

  const retryMembers = () => {
    void Promise.all([
      workspaceMembersQuery.refetch(),
      teamMembersQuery.refetch(),
    ]);
  };

  const formError = addMemberMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <DialogContent className="max-h-[min(90vh,720px)] max-w-2xl overflow-y-auto">
            <DialogTitle>Manage team members</DialogTitle>

            <DialogDescription>
              Add or remove members from {team?.name ?? "this team"}.
            </DialogDescription>

            {loadingFailed && (
              <SettingsLoadError
                message="Team members could not be loaded."
                reason="The team membership service is unavailable."
                retrying={
                  workspaceMembersQuery.isFetching ||
                  teamMembersQuery.isFetching
                }
                onRetry={retryMembers}
              />
            )}

            <div className="mt-6 space-y-6">
              <section>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">Current members</h2>
                </div>

                {loadingMembers && (
                  <div
                    className="flex min-h-32 items-center justify-center"
                    role="status"
                    aria-label="Loading team members"
                  >
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                )}

                {!loadingMembers &&
                  !loadingFailed &&
                  currentMembers.length === 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No members have been added to this team yet.
                    </p>
                  )}

                {!loadingMembers &&
                  !loadingFailed &&
                  currentMembers.length > 0 && (
                    <div className="mt-4 divide-y divide-border border border-border">
                      {currentMembers.map((member) => (
                        <div
                          key={member.membershipId}
                          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {member.fullName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {member.email}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {ROLE_LABELS[member.role]}
                            </p>
                          </div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`Remove ${member.fullName}`}
                                disabled={
                                  removingMembershipId === member.membershipId
                                }
                                onClick={() => handleRemoveMember(member)}
                              >
                                {removingMembershipId ===
                                member.membershipId ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  <Trash2 />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove member</TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  )}
              </section>

              <section className="border-t border-border pt-6">
                <h2 className="text-sm font-semibold">Add member</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an existing workspace member to this team.
                </p>

                <form
                  noValidate
                  className="mt-4 space-y-4"
                  onSubmit={form.handleSubmit(handleAddMember)}
                >
                  <Field
                    name="membershipId"
                    invalid={Boolean(form.formState.errors.membershipId)}
                  >
                    <FieldLabel>Workspace member</FieldLabel>

                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                      <Select
                      value={membershipId || null}
                      onValueChange={(value) => {
                        form.setValue("membershipId", value ?? "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      disabled={
                        loadingMembers ||
                        availableMembers.length === 0 ||
                        addMemberMutation.isPending
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>

                      <SelectContent>
                        {availableMembers.map((member) => (
                          <SelectItem
                            key={member.membershipId}
                            value={member.membershipId}
                          >
                            {member.fullName} · {member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            variant="brand"
                            aria-label="Add member"
                            className="shrink-0 px-3 sm:px-4"
                            disabled={
                              !form.formState.isValid ||
                              addMemberMutation.isPending ||
                              loadingMembers
                            }
                          >
                            {addMemberMutation.isPending ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Plus />
                            )}
                            <span className="hidden sm:inline">
                              {addMemberMutation.isPending
                                ? "Adding..."
                                : "Add member"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add member</TooltipContent>
                      </Tooltip>
                    </div>

                    <FieldError
                      match={Boolean(form.formState.errors.membershipId)}
                    >
                      {form.formState.errors.membershipId?.message}
                    </FieldError>
                  </Field>

                  {availableMembers.length === 0 &&
                    !loadingMembers &&
                    !loadingFailed && (
                      <p className="text-sm text-muted-foreground">
                        All workspace members are already part of this team.
                      </p>
                    )}

                  {formError && (
                    <p className="text-sm text-destructive">
                      {isApiClientError(formError)
                        ? formError.message
                        : "Unable to add this member to the team."}
                    </p>
                  )}

                </form>
              </section>
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-5">
              <Button
                type="button"
                variant="subtle"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export { TeamMembersDialog };
