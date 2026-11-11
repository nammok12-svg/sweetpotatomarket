type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export default function Field({ label, hint, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="block w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-3 focus:ring-accent/15"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
