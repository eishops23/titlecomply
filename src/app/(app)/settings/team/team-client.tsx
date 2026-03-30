"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { PLAN_USER_LIMITS } from "@/lib/constants";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  COMPLIANCE_OFFICER: "Compliance Officer",
  CLOSER: "Closer",
  PROCESSOR: "Processor",
  READ_ONLY: "Read Only",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full access including billing and team management",
  COMPLIANCE_OFFICER: "View all transactions, manage filings, run reports",
  CLOSER: "Create and edit own transactions, generate filings",
  PROCESSOR: "Data entry and document upload only",
  READ_ONLY: "View-only access for auditors",
};

type TeamMember = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "ADMIN" | "COMPLIANCE_OFFICER" | "CLOSER" | "PROCESSOR" | "READ_ONLY";
  created_at: Date | string;
};

type TeamOrg = {
  plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "PAY_PER_FILE";
  users: TeamMember[];
};

function relativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(diff / 86400000);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(diff / (86400000 * 30));
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(diff / (86400000 * 365)), "year");
}

function usageColorClass(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function TeamClient({ organization }: { organization: TeamOrg | null }) {
  const [users, setUsers] = React.useState<TeamMember[]>(organization?.users ?? []);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TeamMember["role"]>("CLOSER");
  const [busy, setBusy] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<TeamMember | null>(null);

  if (!organization) {
    return <p className="text-sm text-muted">Organization not found.</p>;
  }

  const limit = PLAN_USER_LIMITS[organization.plan];
  const usagePercent = Number.isFinite(limit)
    ? Math.min(100, Math.round((users.length / limit) * 100))
    : 0;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const currentUserId = users[0]?.id ?? "";
  const atLimit = Number.isFinite(limit) && users.length >= limit;

  const onInvite = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = (await response.json()) as { user?: TeamMember; error?: string };
      if (!response.ok || !data.user) {
        toastError("Invite failed", data.error ?? "Failed to send invite.");
        return;
      }
      const invitedUser = data.user;
      setUsers((prev) => [...prev, invitedUser]);
      setInviteEmail("");
      setInviteRole("CLOSER");
      setInviteOpen(false);
      toastSuccess("Invitation sent");
    } finally {
      setBusy(false);
    }
  };

  const onRoleChange = async (user: TeamMember, role: TeamMember["role"]) => {
    if (role === user.role) return;
    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
    if (!window.confirm(`Change ${name}'s role to ${ROLE_LABELS[role]}?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/team/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toastError("Role update failed", data.error ?? "Failed to update role.");
        return;
      }
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role } : item)));
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    const user = removeTarget;
    if (!user) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/team/${user.id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toastError("Remove failed", data.error ?? "Failed to remove member.");
        return;
      }
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      toastSuccess("Team member removed");
      setRemoveTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="mt-1 text-sm text-muted">
                {users.length} of {Number.isFinite(limit) ? limit : "Unlimited"} seats used (
                {organization.plan.replaceAll("_", " ").toLowerCase()} plan)
              </p>
            </div>
            <Tooltip content={atLimit ? "Upgrade your plan to add more team members" : ""}>
              <span>
                <Button disabled={atLimit} onClick={() => setInviteOpen(true)}>
                  Invite Team Member
                </Button>
              </span>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto sm:mx-0 -mx-4">
            <div className="min-w-[640px] sm:min-w-0 px-4 sm:px-0">
          <div className="mb-4 h-2 w-full overflow-hidden rounded bg-slate-200">
            <div
              className={cn("h-full transition-[width]", usageColorClass(usagePercent))}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—";
                const lastAdmin = user.role === "ADMIN" && adminCount <= 1;
                const isSelf = user.id === currentUserId;
                const removeBlocked = lastAdmin || isSelf;
                const removeReason = lastAdmin
                  ? "Cannot remove the last admin"
                  : isSelf
                    ? "You cannot remove yourself"
                    : "";
                return (
                  <TableRow key={user.id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="min-w-56">
                      <Select
                        value={user.role}
                        disabled={busy}
                        options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                        onChange={(event) =>
                          void onRoleChange(user, event.target.value as TeamMember["role"])
                        }
                      />
                      <p className="mt-1 text-xs text-muted">{ROLE_DESCRIPTIONS[user.role]}</p>
                    </TableCell>
                    <TableCell>{relativeTime(user.created_at)}</TableCell>
                    <TableCell>
                      <Tooltip content={removeReason}>
                        <span>
                          <Button
                            variant="ghost"
                            className="text-danger hover:bg-red-50 hover:text-danger"
                            disabled={busy || removeBlocked}
                            onClick={() => setRemoveTarget(user)}
                          >
                            Remove
                          </Button>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        open={removeTarget != null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemove()}
        title="Remove team member?"
        message={
          removeTarget
            ? `Remove ${`${removeTarget.first_name ?? ""} ${removeTarget.last_name ?? ""}`.trim() || removeTarget.email} from this organization? They will lose access immediately.`
            : ""
        }
        confirmLabel="Remove"
        variant="danger"
        isLoading={busy}
      />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={busy}
              disabled={!inviteEmail.trim().includes("@")}
              onClick={() => void onInvite()}
            >
              Send Invitation
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Email address"
            variant="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
          <Select
            label="Role"
            value={inviteRole}
            options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(event) => setInviteRole(event.target.value as TeamMember["role"])}
          />
        </div>
      </Modal>
    </div>
  );
}
