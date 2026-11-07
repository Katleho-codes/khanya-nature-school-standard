"use client";

import type { Branch } from "@/lib/types";
import { adminInput, adminLabel } from "./admin-ui";
import { useAdminData } from "./useAdmin";

export interface BranchOption {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

export function useBranches() {
  const { data, loading, error } = useAdminData<{ branches: Branch[] }>(
    "/branches",
  );
  const branches: BranchOption[] = (data?.branches ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((branch) => ({
      id: branch.id,
      slug: branch.slug,
      name: branch.name,
      isActive: branch.isActive,
    }));
  return { branches, loading, error };
}

export function BranchSelect({
  id,
  label,
  value,
  onChange,
  allowEmpty = true,
  emptyLabel = "All branches",
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const { branches, loading } = useBranches();

  return (
    <div>
      <label htmlFor={id} className={adminLabel}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading}
        className={adminInput}
      >
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {loading ? <option value="">Loading branches...</option> : null}
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
            {branch.isActive ? "" : " (hidden)"}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-[0.7rem] text-ink/75">{hint}</p> : null}
    </div>
  );
}

export function BranchCheckboxes({
  values,
  onChange,
  hint,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  const { branches, loading, error } = useBranches();

  function toggle(id: string) {
    if (values.includes(id)) {
      onChange(values.filter((value) => value !== id));
    } else {
      onChange([...values, id]);
    }
  }

  return (
    <fieldset>
      <legend className={adminLabel}>Available at</legend>
      {loading ? (
        <p className="mt-1 text-[0.74rem] text-ink/75">Loading branches...</p>
      ) : error ? (
        <p className="mt-1 text-[0.74rem] text-poppy-deep">{error}</p>
      ) : branches.length === 0 ? (
        <p className="mt-1 text-[0.74rem] text-ink/75">
          Add a branch before linking programmes.
        </p>
      ) : (
        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          {branches.map((branch) => (
            <label
              key={branch.id}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border-2 border-ink/10 px-3.5 py-2 text-[0.82rem] font-semibold text-ink hover:bg-sun-tint/40"
            >
              <input
                type="checkbox"
                checked={values.includes(branch.id)}
                onChange={() => toggle(branch.id)}
                className="admin-check"
              />
              {branch.name}
              {branch.isActive ? null : (
                <span className="text-[0.68rem] text-ink/75">(hidden)</span>
              )}
            </label>
          ))}
        </div>
      )}
      {hint ? <p className="mt-1 text-[0.7rem] text-ink/75">{hint}</p> : null}
    </fieldset>
  );
}
