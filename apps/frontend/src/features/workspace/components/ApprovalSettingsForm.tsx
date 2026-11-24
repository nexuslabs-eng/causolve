import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil, Save, X } from "lucide-react";

import {
  ApprovalSettingsSchema,
  type ApprovalSettings,
} from "contracts/settings/approval-settings.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  settings: ApprovalSettings | null;
  canEdit: boolean;
  onSave: (values: ApprovalSettings) => Promise<void>;
};

const EMPTY_SETTINGS: ApprovalSettings = {
  requireApprovalBeforeRemediation: false,
  minimumRequiredApprovals: 0,
  automaticRemediationEnabled: false,
  approvalTimeoutHours: 0,
};

export const ApprovalSettingsForm = ({
  settings,
  canEdit,
  onSave,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ApprovalSettings>({
    resolver: zodResolver(ApprovalSettingsSchema),
    defaultValues: settings ?? EMPTY_SETTINGS,
    mode: "onChange",
  });

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = form;

  useEffect(() => {
    reset(settings ?? EMPTY_SETTINGS);
  }, [canEdit, reset, settings]);

  const { requireApprovalBeforeRemediation: requireApproval, automaticRemediationEnabled: automaticRemediation } =
    useWatch({ control: form.control });
  const controlsDisabled = !canEdit || !editing;

  const updateCheckbox = (
    field:
      | "requireApprovalBeforeRemediation"
      | "automaticRemediationEnabled",
    value: boolean | "indeterminate",
  ) => {
    setValue(field, value === true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const submit = async (values: ApprovalSettings) => {
    setSaving(true);

    try {
      await onSave(values);
      reset(values);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    reset(settings ?? EMPTY_SETTINGS);
    setEditing(false);
  };

  return (
    <form className="mt-6 min-w-0 space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Approvals & remediation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure authorization requirements for high-impact actions.
          </p>
        </div>

        {canEdit && !editing && (
          <Button type="button" variant="subtle" onClick={() => setEditing(true)}>
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={requireApproval}
          disabled={controlsDisabled}
          onCheckedChange={(value) =>
            updateCheckbox("requireApprovalBeforeRemediation", value)
          }
        />
        <span>
          <span className="block text-sm font-medium">
            Require approval before remediation
          </span>
          <span className="text-sm text-muted-foreground">
            Prevent high-impact remediation from running before approval.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={automaticRemediation}
          disabled={controlsDisabled}
          onCheckedChange={(value) =>
            updateCheckbox("automaticRemediationEnabled", value)
          }
        />
        <span>
          <span className="block text-sm font-medium">
            Allow automatic remediation
          </span>
          <span className="text-sm text-muted-foreground">
            Allow approved actions to execute without another manual trigger.
          </span>
        </span>
      </label>

      <Field invalid={Boolean(errors.minimumRequiredApprovals)}>
        <FieldLabel>Minimum required approvals</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Set how many authorized reviewers must approve a high-impact action.
        </p>
        {settings ? (
          <Input
            type="number"
            min={1}
            max={5}
            disabled={controlsDisabled}
            {...register("minimumRequiredApprovals", {
              valueAsNumber: true,
            })}
          />
        ) : (
          <Input
            type="number"
            disabled
            placeholder="Unavailable"
            aria-label="Minimum required approvals unavailable"
          />
        )}
        <FieldError>
          {errors.minimumRequiredApprovals?.message}
        </FieldError>
      </Field>

      <Field invalid={Boolean(errors.approvalTimeoutHours)}>
        <FieldLabel>Approval timeout</FieldLabel>
        {settings ? (
          <Input
            type="number"
            min={1}
            max={720}
            disabled={controlsDisabled}
            {...register("approvalTimeoutHours", {
              valueAsNumber: true,
            })}
          />
        ) : (
          <Input
            type="number"
            disabled
            placeholder="Unavailable"
            aria-label="Approval timeout unavailable"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Number of hours an approval request remains valid.
        </p>
        <FieldError>{errors.approvalTimeoutHours?.message}</FieldError>
      </Field>

      {canEdit && editing && (
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={cancel} disabled={saving}>
            <X />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={!isDirty || !isValid || saving}
          >
            {saving ? (
              <>
                <Loader className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save />
                Save changes
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
