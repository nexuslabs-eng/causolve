import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil, Save, X } from "lucide-react";

import {
  AuditEventCategorySchema,
  AuditSettingsSchema,
  type AuditEventCategory,
  type AuditExportPermission,
  type AuditSettings,
} from "contracts/settings/audit-settings.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPORT_PERMISSION_LABELS: Record<AuditExportPermission, string> = {
  ADMINS_ONLY: "Admins only",
  ADMINS_AND_AUDITORS: "Admins and auditors",
  ALL_MEMBERS: "All members",
};

const EVENT_CATEGORY_LABELS: Record<AuditEventCategory, string> = {
  MEMBERSHIP: "Membership changes",
  SETTINGS: "Settings changes",
  INTEGRATIONS: "Integration changes",
  INCIDENTS: "Incident activity",
  INVESTIGATIONS: "Investigation activity",
  REMEDIATION: "Remediation actions",
};

const EVENT_CATEGORIES = AuditEventCategorySchema.options;

type Props = {
  settings: AuditSettings | null;
  canEdit: boolean;
  onSave: (values: AuditSettings) => Promise<void>;
};

const EMPTY_SETTINGS: AuditSettings = {
  retentionPeriodDays: 0,
  exportPermission: "ADMINS_ONLY",
  eventCategories: [],
  complianceArchivalEnabled: false,
};

export const AuditSettingsForm = ({ settings, canEdit, onSave }: Props) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<AuditSettings>({
    resolver: zodResolver(AuditSettingsSchema),
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

  const { eventCategories, complianceArchivalEnabled: archivalEnabled, exportPermission } =
    useWatch({ control: form.control });
  const categories = eventCategories ?? [];
  const controlsDisabled = !canEdit || !editing;

  const toggleCategory = (category: AuditEventCategory) => {
    const nextCategories = categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category];

    setValue("eventCategories", nextCategories, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const submit = async (values: AuditSettings) => {
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
          <h1 className="text-2xl font-semibold">Audit & activity</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure audit retention, access, event coverage, and archival.
          </p>
        </div>
        {canEdit && !editing && (
          <Button type="button" variant="subtle" onClick={() => setEditing(true)}>
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      <Field invalid={Boolean(errors.retentionPeriodDays)}>
        <FieldLabel>Audit log retention period</FieldLabel>
        {settings ? (
          <Input
            type="number"
            min={30}
            max={3650}
            disabled={controlsDisabled}
            {...register("retentionPeriodDays", { valueAsNumber: true })}
          />
        ) : (
          <Input disabled placeholder="Unavailable" aria-label="Audit log retention period" />
        )}
        <p className="text-xs text-muted-foreground">
          Number of days audit records remain available.
        </p>
        <FieldError>{errors.retentionPeriodDays?.message}</FieldError>
      </Field>

      <Field invalid={Boolean(errors.exportPermission)}>
        <FieldLabel>Audit log export permissions</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Choose which workspace members can export the audit log.
        </p>
        <Select
          value={settings ? exportPermission : null}
          disabled={controlsDisabled}
          onValueChange={(value) => {
            if (value) {
              setValue("exportPermission", value as AuditExportPermission, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select export permissions" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPORT_PERMISSION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.exportPermission?.message}</FieldError>
      </Field>

      <Field invalid={Boolean(errors.eventCategories)}>
        <FieldLabel>Audit event categories</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Choose which workspace activities are recorded in the audit log.
        </p>
        <div className="space-y-3">
          {EVENT_CATEGORIES.map((category) => (
            <label key={category} className="flex items-start gap-3">
              <Checkbox
                checked={categories.includes(category)}
                disabled={controlsDisabled}
                onCheckedChange={() => toggleCategory(category)}
              />
              <span className="text-sm text-foreground">
                {EVENT_CATEGORY_LABELS[category]}
              </span>
            </label>
          ))}
        </div>
        <FieldError>{errors.eventCategories?.message}</FieldError>
      </Field>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={archivalEnabled}
          disabled={controlsDisabled}
          onCheckedChange={(value) =>
            setValue("complianceArchivalEnabled", value === true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <span>
          <span className="block text-sm font-medium">
            Compliance and archival settings
          </span>
          <span className="text-sm text-muted-foreground">
            Preserve audit records for compliance and archival workflows.
          </span>
        </span>
      </label>

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
