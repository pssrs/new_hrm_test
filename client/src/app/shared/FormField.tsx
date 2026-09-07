import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label style={error ? { color: 'var(--color-destructive-foreground)' } : {}}>
                {label}
            </Label>
            {children}
            {error && (
                <p className="text-xs" style={{ color: 'var(--color-destructive-foreground)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
