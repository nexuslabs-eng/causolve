import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamRequestSchema, type Team } from "contracts/teams/team.schema";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

type TeamFormValues = { name: string };

export const TeamFormDialog = ({
  open,
  team,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  team?: Team;
  saving: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TeamFormValues) => void;
}) => {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(CreateTeamRequestSchema),
    mode: "onChange",
    defaultValues: { name: team?.name ?? "" },
  });

  useEffect(() => {
    form.reset({ name: team?.name ?? "" });
  }, [form, team, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <DialogContent>
            <DialogTitle>{team ? "Rename team" : "Create team"}</DialogTitle>
            <DialogDescription>
              {team
                ? "Update this team name for your workspace."
                : "Create a team to organize members for operational work."}
            </DialogDescription>

            <form
              noValidate
              className="mt-6 space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Field name="name" invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel>Team name</FieldLabel>
                <Input autoFocus {...form.register("name")} />
                <FieldError match={Boolean(form.formState.errors.name)}>
                  {form.formState.errors.name?.message}
                </FieldError>
              </Field>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={!form.formState.isValid || saving}
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin" />
                      Saving...
                    </>
                  ) : team ? (
                    "Save changes"
                  ) : (
                    "Create team"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
};
