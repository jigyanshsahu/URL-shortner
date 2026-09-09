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
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
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
        className={`w-full rounded-xl border bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-1 ${
          hasError
            ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
        }`}
      />

      {hasError && (
        <p className="mt-1.5 text-xs text-red-400 font-medium">
          {field.state.meta.errors
            .map((error) => error?.message ?? String(error))
            .join(", ")}
        </p>
      )}
    </div>
  );
}