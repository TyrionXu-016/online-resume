import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const fieldClass =
  "w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-primary";
const labelClass = "mb-1 block text-[12px] font-medium text-muted";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-[96px] resize-y ${props.className ?? ""}`} />;
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-border bg-white p-4">
      <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
