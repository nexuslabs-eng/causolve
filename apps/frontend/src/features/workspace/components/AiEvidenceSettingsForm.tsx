import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil, Save, X } from "lucide-react";

import {
  AiEvidenceSettingsSchema,
  type AiEvidenceSettings,
} from "contracts/settings/ai-evidence-settings.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  settings: AiEvidenceSettings | null;
  canEdit: boolean;
  onSave: (values: AiEvidenceSettings) => Promise<void>;
};

const EMPTY_SETTINGS: AiEvidenceSettings = {
  aiAssistanceEnabled: false,
  humanApprovalRequired: false,
  externalEvidenceAllowed: false,
  evidenceRetentionDays: 0,
};

export const AiEvidenceSettingsForm = ({ settings, canEdit, onSave }: Props) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<AiEvidenceSettings>({
    resolver: zodResolver(AiEvidenceSettingsSchema),
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
  }, [reset, settings]);

  const { aiAssistanceEnabled, humanApprovalRequired, externalEvidenceAllowed } = useWatch({
    control: form.control,
  });

  const updateCheckbox = (
    field: "aiAssistanceEnabled" | "humanApprovalRequired" | "externalEvidenceAllowed",
    value: boolean | "indeterminate",
  ) => {
    setValue(field, value === true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const submit = async (values: AiEvidenceSettings) => {
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

  const controlsDisabled = !canEdit || !editing;

  return (
    <form className="mt-6 min-w-0 space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">AI & evidence policies</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Configure how AI assistance and evidence are handled.
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
          checked={aiAssistanceEnabled}
          disabled={controlsDisabled}
          onCheckedChange={(value) => updateCheckbox("aiAssistanceEnabled", value)}
        />

        <span>
          <span className="block text-sm font-medium">Enable AI assistance</span>

          <span className="text-sm text-muted-foreground">
            Allow AI-assisted investigation analysis and hypothesis generation.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={humanApprovalRequired}
          disabled={controlsDisabled}
          onCheckedChange={(value) => updateCheckbox("humanApprovalRequired", value)}
        />

        <span>
          <span className="block text-sm font-medium">Require human approval</span>

          <span className="text-sm text-muted-foreground">
            Require approval before AI-generated recommendations can be acted on.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={externalEvidenceAllowed}
          disabled={controlsDisabled}
          onCheckedChange={(value) => updateCheckbox("externalEvidenceAllowed", value)}
        />

        <span>
          <span className="block text-sm font-medium">Allow external evidence</span>

          <span className="text-sm text-muted-foreground">
            Permit evidence collected from connected external integrations.
          </span>
        </span>
      </label>

      <Field invalid={Boolean(errors.evidenceRetentionDays)}>
        <FieldLabel>Evidence retention period</FieldLabel>

        {settings ? (
          <Input
            type="number"
            min={30}
            max={3650}
            disabled={controlsDisabled}
            {...register("evidenceRetentionDays", {
              valueAsNumber: true,
            })}
          />
        ) : (
          <Input
            type="number"
            disabled
            placeholder="Unavailable"
            aria-label="Evidence retention period unavailable"
          />
        )}

        <p className="text-xs text-muted-foreground">
          Number of days evidence should remain available.
        </p>

        <FieldError>{errors.evidenceRetentionDays?.message}</FieldError>
      </Field>

      {canEdit && editing && (
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={cancel} disabled={saving}>
            <X />
            Cancel
          </Button>

          <Button type="submit" variant="brand" disabled={!isDirty || !isValid || saving}>
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
