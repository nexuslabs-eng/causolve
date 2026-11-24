import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil, Save, X } from "lucide-react";
import {
  InvestigationSettingsSchema,
  type EvidenceCollectionTimeout,
  type InvestigationSettings,
} from "contracts/settings/investigation-settings.schema";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  settings: InvestigationSettings | null;
  canEdit: boolean;
  onSave: (values: InvestigationSettings) => Promise<void>;
};

const EMPTY_SETTINGS: InvestigationSettings = {
  autoStartInvestigations: false,
  evidenceCollectionTimeout: {
    value: 0,
    unit: "SECONDS",
  },
  maxEvidenceItems: 0,
  requireEvidenceAttribution: false,
};

export const InvestigationSettingsForm = ({
  settings,
  canEdit,
  onSave,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<InvestigationSettings>({
    resolver: zodResolver(InvestigationSettingsSchema),
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
  }, [settings, reset]);

  const {
    autoStartInvestigations: autoStart,
    requireEvidenceAttribution: attribution,
    evidenceCollectionTimeout: timeout,
  } = useWatch({ control: form.control });

  const submit = async (values: InvestigationSettings) => {
    setSaving(true);

    try {
      await onSave(values);
      setEditing(false);
      reset(values);
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
    <form className="mt-6 space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="flex items-start justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold">
            Investigation configuration
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure how investigations collect and evaluate evidence.
          </p>
        </div>

        {canEdit && !editing && (
          <Button
            type="button"
            variant="subtle"
            onClick={() => setEditing(true)}
          >
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      <Field invalid={Boolean(errors.evidenceCollectionTimeout)}>
        <FieldLabel>Evidence collection timeout</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Set how long evidence collection may run before it times out. Choose
          seconds for precise limits or minutes for longer collection windows.
        </p>
        {settings ? (
          <div className="flex h-11 min-w-0 overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
            <Input
              type="number"
              min={timeout?.unit === "MINUTES" ? 1 : 30}
              max={timeout?.unit === "MINUTES" ? 60 : 3600}
              disabled={controlsDisabled}
              className="h-full min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
              {...register("evidenceCollectionTimeout.value", {
                valueAsNumber: true,
              })}
            />
            <Select
              value={timeout?.unit ?? null}
              disabled={controlsDisabled}
              onValueChange={(value) => {
                if (value) {
                  setValue(
                    "evidenceCollectionTimeout.unit",
                    value as EvidenceCollectionTimeout["unit"],
                    { shouldDirty: true, shouldValidate: true },
                  );
                }
              }}
            >
              <SelectTrigger className="flex h-full! w-32 shrink-0 items-center rounded-none border-0 border-l border-input bg-muted/40 py-0! px-3 shadow-none focus:ring-0">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SECONDS">Seconds</SelectItem>
                <SelectItem value="MINUTES">Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex h-11 min-w-0 overflow-hidden rounded-md border border-input bg-background">
            <Input
              type="number"
              disabled
              placeholder="Unavailable"
              aria-label="Evidence collection timeout unavailable"
              className="h-full min-w-0 flex-1 rounded-none border-0 shadow-none"
            />
            <Select disabled value={null}>
              <SelectTrigger className="flex h-full! w-32 shrink-0 items-center rounded-none border-0 border-l border-input bg-muted/40 py-0! px-3 shadow-none">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
            </Select>
          </div>
        )}
        <FieldError>
          {errors.evidenceCollectionTimeout?.value?.message ??
            errors.evidenceCollectionTimeout?.unit?.message ??
            errors.evidenceCollectionTimeout?.message}
        </FieldError>
      </Field>

      <Field invalid={Boolean(errors.maxEvidenceItems)}>
        <FieldLabel>Maximum evidence items</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Limit the number of evidence items collected for one investigation.
        </p>
        {settings ? (
          <Input
            type="number"
            min={1}
            max={500}
            disabled={controlsDisabled}
            {...register("maxEvidenceItems", {
              valueAsNumber: true,
            })}
          />
        ) : (
          <Input
            type="number"
            disabled
            placeholder="Unavailable"
            aria-label="Maximum evidence items unavailable"
          />
        )}
        <FieldError>{errors.maxEvidenceItems?.message}</FieldError>
      </Field>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={autoStart}
          disabled={controlsDisabled}
          onCheckedChange={(value: boolean) =>
            setValue("autoStartInvestigations", value === true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <span>
          <span className="block text-sm font-medium">
            Start investigations automatically
          </span>
          <span className="text-sm text-muted-foreground">
            Begin evidence collection when an incident enters investigation.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={attribution}
          disabled={controlsDisabled}
          onCheckedChange={(value: boolean) =>
            setValue("requireEvidenceAttribution", value === true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <span>
          <span className="block text-sm font-medium">
            Require evidence attribution
          </span>
          <span className="text-sm text-muted-foreground">
            Every evidence item must identify its source and collection time.
          </span>
        </span>
      </label>

      {canEdit && editing && (
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={cancel}>
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
                <Loader />
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
