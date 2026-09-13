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
        className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono"
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
        className={`w-full rounded-xl border bg-[#14141a] px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:bg-[#181822] ${
          hasError
            ? "border-red-500/80 focus:border-red-500"
            : "border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
        }`}
      />

      {hasError && (
        <p className="text-xs text-red-400 font-medium">
          {field.state.meta.errors
            .map((error) => error?.message ?? String(error))
            .join(", ")}
        </p>
      )}
    </div>
  );
}