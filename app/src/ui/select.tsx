interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-[var(--foreground)]">{label}</label>}
      <select
        className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)] dark:placeholder-[var(--muted-foreground)] mb-4"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}