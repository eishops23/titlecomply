"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProfileUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "ADMIN" | "COMPLIANCE_OFFICER" | "CLOSER" | "PROCESSOR" | "READ_ONLY";
};

type NotificationPreferences = {
  complianceAlerts: boolean;
  filingGenerated: boolean;
  overdueReminders: boolean;
  monthlySummary: boolean;
  teamActivity: boolean;
};

const STORAGE_KEY = "titlecomply:notification-preferences";

const DEFAULT_PREFS: NotificationPreferences = {
  complianceAlerts: true,
  filingGenerated: true,
  overdueReminders: true,
  monthlySummary: true,
  teamActivity: false,
};

const ROLE_LABELS: Record<ProfileUser["role"], string> = {
  ADMIN: "Admin",
  COMPLIANCE_OFFICER: "Compliance Officer",
  CLOSER: "Closer",
  PROCESSOR: "Processor",
  READ_ONLY: "Read Only",
};

export function ProfileClient({ user }: { user: ProfileUser | null }) {
  const [firstName, setFirstName] = React.useState(user?.first_name ?? "");
  const [lastName, setLastName] = React.useState(user?.last_name ?? "");
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [prefs, setPrefs] = React.useState<NotificationPreferences>(DEFAULT_PREFS);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<NotificationPreferences>;
      setPrefs({ ...DEFAULT_PREFS, ...parsed });
    } catch {
      setPrefs(DEFAULT_PREFS);
    }
  }, []);

  if (!user) {
    return <p className="text-sm text-muted">User not found.</p>;
  }

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Failed to save profile.");
        return;
      }
      window.alert("Profile updated.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = () => {
    setSavingPrefs(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      window.alert("Notification preferences saved.");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <Input
            label="Email"
            variant="email"
            value={user.email}
            disabled
            helperText="Email is managed through your authentication provider"
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Role</p>
            <Badge className="bg-slate-100 text-slate-700 ring-slate-200">
              {ROLE_LABELS[user.role]}
            </Badge>
            <p className="text-xs text-muted">
              Admins can update roles from the Team settings page.
            </p>
          </div>
          <Button loading={savingProfile} onClick={() => void saveProfile()}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PreferenceRow
            label="New compliance alerts"
            checked={prefs.complianceAlerts}
            onChange={(checked) => setPrefs((prev) => ({ ...prev, complianceAlerts: checked }))}
          />
          <PreferenceRow
            label="Filing generated"
            checked={prefs.filingGenerated}
            onChange={(checked) => setPrefs((prev) => ({ ...prev, filingGenerated: checked }))}
          />
          <PreferenceRow
            label="Overdue transaction reminders"
            checked={prefs.overdueReminders}
            onChange={(checked) => setPrefs((prev) => ({ ...prev, overdueReminders: checked }))}
          />
          <PreferenceRow
            label="Monthly compliance summary"
            checked={prefs.monthlySummary}
            onChange={(checked) => setPrefs((prev) => ({ ...prev, monthlySummary: checked }))}
          />
          <PreferenceRow
            label="Team member activity"
            checked={prefs.teamActivity}
            onChange={(checked) => setPrefs((prev) => ({ ...prev, teamActivity: checked }))}
          />
          <Button loading={savingPrefs} onClick={savePreferences}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 p-3">
      <p className="text-sm text-foreground">{label}</p>
      <label className="inline-flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        Enabled
      </label>
    </div>
  );
}
