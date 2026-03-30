"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { US_STATES } from "@/lib/constants";

const orgSettingsSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_email: z.string().email("Invalid email").or(z.literal("")).optional(),
  company_phone: z.string().optional(),
  company_address: z.string().optional(),
  company_city: z.string().optional(),
  company_state: z
    .string()
    .length(2, "Use 2-letter state code")
    .optional()
    .or(z.literal("")),
  company_zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code")
    .optional()
    .or(z.literal("")),
  license_number: z.string().optional(),
  underwriter: z.string().optional(),
  default_reminder_days: z.coerce.number().int().min(1).max(30).default(3),
  auto_screen: z.boolean().default(true),
});

type OrganizationSettings = {
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  license_number: string | null;
  underwriter: string | null;
  default_reminder_days: number;
  auto_screen: boolean;
};

type OrgSettingsValues = z.infer<typeof orgSettingsSchema>;

export function SettingsClient({
  organization,
}: {
  organization: OrganizationSettings | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<z.input<typeof orgSettingsSchema>, unknown, OrgSettingsValues>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: {
      company_name: organization?.company_name ?? "",
      company_email: organization?.company_email ?? "",
      company_phone: organization?.company_phone ?? "",
      company_address: organization?.company_address ?? "",
      company_city: organization?.company_city ?? "",
      company_state: organization?.company_state ?? "",
      company_zip: organization?.company_zip ?? "",
      license_number: organization?.license_number ?? "",
      underwriter: organization?.underwriter ?? "",
      default_reminder_days: organization?.default_reminder_days ?? 3,
      auto_screen: organization?.auto_screen ?? true,
    },
  });

  const stateValue = watch("company_state") ?? "";
  const autoScreenValue = watch("auto_screen");

  const onSubmit = async (values: OrgSettingsValues) => {
    const response = await fetch("/api/settings/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      window.alert("Failed to save organization settings.");
      return;
    }

    reset(values);
    window.alert("Organization settings saved.");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          This information will appear on all generated FinCEN filings as the
          Settlement Agent.
        </p>
      </div>

      {isDirty ? (
        <Alert variant="warning" title="You have unsaved changes" />
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input
              label="Company name"
              error={errors.company_name?.message}
              {...register("company_name")}
            />
            <Input
              label="Company email"
              variant="email"
              error={errors.company_email?.message}
              {...register("company_email")}
            />
            <Input
              label="Company phone"
              variant="tel"
              error={errors.company_phone?.message}
              {...register("company_phone")}
            />
            <Input
              label="Title agent license number"
              error={errors.license_number?.message}
              {...register("license_number")}
            />
            <div className="md:col-span-2">
              <Input
                label="Primary title insurance underwriter"
                error={errors.underwriter?.message}
                {...register("underwriter")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Street address"
                error={errors.company_address?.message}
                {...register("company_address")}
              />
            </div>
            <Input
              label="City"
              error={errors.company_city?.message}
              {...register("company_city")}
            />
            <Select
              label="State"
              options={US_STATES.map((state) => ({
                value: state.code,
                label: state.name,
              }))}
              value={stateValue}
              error={errors.company_state?.message}
              onChange={(event) =>
                setValue("company_state", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <Input
              label="ZIP code"
              error={errors.company_zip?.message}
              {...register("company_zip")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Default reminder interval"
              variant="number"
              min={1}
              max={30}
              error={errors.default_reminder_days?.message}
              helperText="Days before sending data collection reminders"
              {...register("default_reminder_days")}
            />
            <div className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto-screen new transactions
                </p>
                <p className="text-xs text-muted">
                  Automatically run FinCEN screening when a new transaction is
                  created
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScreenValue}
                  onChange={(event) =>
                    setValue("auto_screen", event.target.checked, {
                      shouldDirty: true,
                    })
                  }
                />
                Enabled
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
