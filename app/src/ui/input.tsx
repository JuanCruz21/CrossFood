
class InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    [key: string]: any;
}

export function Input({ label, placeholder, value, ...props }: InputProps) {
    return (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <input className="border border-gray-300 rounded-md p-2 w-full" placeholder={placeholder} value={value} {...props} />
    </div>
    )
}

export function TextArea({ label, placeholder, value, ...props }: InputProps) {
    return (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <textarea className="border border-gray-300 rounded-md p-2 w-full" placeholder={placeholder} value={value} {...props} />
    </div>
    )
}
