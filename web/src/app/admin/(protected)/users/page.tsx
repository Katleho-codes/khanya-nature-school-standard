"use client";

import { useState } from "react";
import type { AdminUser, Role } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import { formatDate } from "@/lib/format";
import {
  AdminBadge,
  AdminButton,
  AdminError,
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  TableSkeleton,
  adminInput,
} from "@/components/admin/admin-ui";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { ArrowRightIcon } from "@/components/icons";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "editor",
};

export default function AdminUsersPage() {
  const { data, loading, error, reload } = useAdminData<{ users: AdminUser[] }>(
    "/users",
  );
  const { data: meData } = useAdminData<{ user: { id: string; name: string } }>(
    "/me",
  );
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});
  const [savingReset, setSavingReset] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    { type: "deactivate" | "delete"; user: AdminUser } | null
  >(null);

  const meId = meData?.user.id;

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setCreating(true);
  }

  function openEdit(user: AdminUser) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role ?? "editor",
    });
    setErrors({});
    setEditing(user);
  }

  function set<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await adminFetch(`/users/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
          }),
        });
        toast(`${form.name} was updated.`);
      } else {
        await adminFetch("/users", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast(
          `${form.name} was added. The welcome email is in the demo outbox.`,
        );
      }
      setCreating(false);
      setEditing(null);
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetting) return;
    setSavingReset(true);
    setResetErrors({});
    try {
      await adminFetch(`/users/${resetting.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      toast(
        `Password reset for ${resetting.name}. Their sessions were signed out.`,
      );
      setResetting(null);
      setNewPassword("");
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setResetErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSavingReset(false);
    }
  }

  async function reactivate(user: AdminUser) {
    try {
      await adminFetch(`/users/${user.id}/reactivate`, { method: "PATCH" });
      toast(`${user.name} can sign in again.`);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function confirm() {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    try {
      if (type === "deactivate") {
        await adminFetch(`/users/${user.id}/deactivate`, { method: "PATCH" });
        toast(`${user.name} was deactivated.`);
      } else {
        await adminFetch(`/users/${user.id}`, { method: "DELETE" });
        toast(`${user.name} was deleted.`);
      }
      setConfirmAction(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const open = creating || editing !== null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="School"
        title="Users"
        description="Administrators manage everything. Editors manage content and enquiries but cannot change users or site settings."
        actions={<AdminButton onClick={openCreate}>Add user</AdminButton>}
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={3} />
      ) : data.users.length === 0 ? (
        <EmptyState
          title="No users yet"
          body="Add the first staff account so someone can sign in to the admin."
          action={<AdminButton onClick={openCreate}>Add user</AdminButton>}
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[1.4fr_9rem_8rem_9rem_13rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 lg:grid">
            <span>Person</span>
            <span>Role</span>
            <span>Status</span>
            <span>Added</span>
            <span className="text-right">Actions</span>
          </div>
          {data.users.map((user) => {
            const isMe = user.id === meId;
            return (
              <div
                key={user.id}
                className="grid gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[1.4fr_9rem_8rem_9rem_13rem] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.84rem] font-medium text-ink">
                    {user.name}
                    {isMe ? (
                      <span className="ml-2 text-[0.66rem] font-normal text-ink/60">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-[0.72rem] text-ink/60">{user.email}</p>
                </div>
                <div>
                  <AdminBadge tone={user.role === "admin" ? "ink" : "neutral"}>
                    {user.role ?? "No role"}
                  </AdminBadge>
                </div>
                <div>
                  <AdminBadge tone={user.isActive ? "meadow" : "poppy"}>
                    {user.isActive ? "Active" : "Deactivated"}
                  </AdminBadge>
                </div>
                <div className="text-[0.74rem] text-ink/60">
                  {formatDate(user.createdAt)}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  <AdminButton size="sm" variant="outline" onClick={() => openEdit(user)}>
                    Edit
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNewPassword("");
                      setResetErrors({});
                      setResetting(user);
                    }}
                  >
                    Password
                  </AdminButton>
                  {user.isActive ? (
                    <AdminButton
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        isMe
                          ? toast("You cannot deactivate your own account.", "error")
                          : setConfirmAction({ type: "deactivate", user })
                      }
                    >
                      Deactivate
                    </AdminButton>
                  ) : (
                    <AdminButton size="sm" variant="ghost" onClick={() => reactivate(user)}>
                      Reactivate
                    </AdminButton>
                  )}
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      isMe
                        ? toast("You cannot delete your own account.", "error")
                        : setConfirmAction({ type: "delete", user })
                    }
                  >
                    Delete
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="paper-card-plain border-2 border-ink/10 bg-paper p-4">
        <p className="text-[0.66rem] uppercase tracking-[0.14em] text-ink/60">
          How accounts work
        </p>
        <ul className="mt-2 space-y-1 text-[0.76rem] leading-relaxed text-ink/60">
          <li>There is no public sign up. Accounts are created here by an administrator.</li>
          <li>Deactivating an account signs the person out and keeps their history.</li>
          <li>Resetting a password also signs out every active session for that person.</li>
          <li>In this demonstration, welcome emails are captured in the Outbox instead of being sent.</li>
        </ul>
      </div>

      <Modal
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${editing.name}` : "Add a user"}
        description={
          editing
            ? "Changing an email address changes the sign in name immediately."
            : "The person can sign in as soon as the account is created. Share the password separately."
        }
      >
        <form onSubmit={save} className="space-y-5">
          <Field label="Full name" htmlFor="user-name" required error={errors.name}>
            <input
              id="user-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              className={adminInput}
              required
            />
          </Field>
          <Field label="Email address" htmlFor="user-email" required error={errors.email}>
            <input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
              className={adminInput}
              required
            />
          </Field>
          {!editing ? (
            <Field
              label="Temporary password"
              htmlFor="user-password"
              required
              error={errors.password}
              hint="At least eight characters. Ask the person to change it after signing in."
            >
              <input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(event) => set("password", event.target.value)}
                className={adminInput}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </Field>
          ) : null}
          <Field label="Role" htmlFor="user-role" required error={errors.role}>
            <select
              id="user-role"
              value={form.role}
              onChange={(event) => set("role", event.target.value as Role)}
              className={adminInput}
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>

          {Object.keys(errors).length > 0 ? (
            <p className="text-[0.76rem] text-poppy-deep">
              Some fields need attention. Check the messages above.
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t-2 border-ink/10 pt-4">
            <AdminButton
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              disabled={saving}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving" : editing ? "Save changes" : "Create user"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={resetting !== null}
        onOpenChange={(value) => !value && setResetting(null)}
        title={`Reset password for ${resetting?.name ?? "user"}`}
        description="This signs the person out of every device. Tell them the new password in person or by phone."
      >
        <form onSubmit={savePassword} className="space-y-5">
          <Field
            label="New password"
            htmlFor="reset-password"
            required
            error={resetErrors.password}
            hint="At least eight characters."
          >
            <input
              id="reset-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={adminInput}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </Field>
          <div className="flex justify-end gap-2 border-t-2 border-ink/10 pt-4">
            <AdminButton
              variant="outline"
              onClick={() => setResetting(null)}
              disabled={savingReset}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={savingReset}>
              {savingReset ? "Resetting" : "Reset password"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(value) => !value && setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? `Delete ${confirmAction.user.name}?`
            : `Deactivate ${confirmAction?.user.name ?? "this account"}?`
        }
        body={
          confirmAction?.type === "delete"
            ? "The account is removed permanently. Their posts and notes are reassigned to you."
            : "The person is signed out immediately and cannot sign in until an administrator reactivates the account."
        }
        confirmLabel={
          confirmAction?.type === "delete" ? "Delete user" : "Deactivate user"
        }
        onConfirm={confirm}
      />
    </div>
  );
}
