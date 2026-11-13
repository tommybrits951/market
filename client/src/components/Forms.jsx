import { useId, useState } from "react";

const controlClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2";

const controlState = (error) =>
  error
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200";

function FieldShell({ id, label, hint, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, required, ...props }) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={`${controlClass} ${controlState(error)}`}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, required, ...props }) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <textarea
        id={id}
        rows={4}
        required={required}
        aria-invalid={!!error}
        className={`${controlClass} ${controlState(error)}`}
        {...props}
      />
    </FieldShell>
  );
}

// options: array of strings, or of { value, label }
export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  placeholder = "Select...",
  ...props
}) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <select
        id={id}
        required={required}
        aria-invalid={!!error}
        className={`${controlClass} ${controlState(error)}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const { value, label: text } =
            typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ label, error, ...props }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-start gap-2 text-sm text-gray-700">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// Free-text list input: type a value and press Enter or comma to add it as a chip.
export function TagField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  max = 20,
}) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const add = (raw) => {
    const tag = raw.trim();
    if (!tag || value.length >= max) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const commit = () => {
    add(draft);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Enter must not submit the surrounding form
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 focus-within:ring-2 ${controlState()}`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-indigo-400 hover:text-indigo-700"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    </FieldShell>
  );
}
