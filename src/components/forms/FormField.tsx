
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

export const FormField = ({ label, children, required = false, error, className }: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-left block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive text-left">{error}</p>
      )}
    </div>
  );
};
