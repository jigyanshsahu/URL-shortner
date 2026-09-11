import type { AnyFieldApi } from "@tanstack/react-form";

interface AuthInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  field: AnyFieldApi;
}

export default function AuthInput({
  label,
  name,
  type = "text",
  placeholder,
  field,
}: AuthInputProps) {
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-surface-container-low px-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-outline outline-none transition focus:bg-surface-container-lowest ${
          hasError
            ? "border-error focus:border-error"
            : "border-outline-variant/40 focus:border-primary-container"
        }`}
      />

      {hasError && (
        <p className="text-xs text-error font-medium">
          {field.state.meta.errors
            .map((error) => error?.message ?? String(error))
            .join(", ")}
        </p>
      )}
    </div>
  );
}