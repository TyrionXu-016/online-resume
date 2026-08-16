export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted">{description}</p>
    </main>
  );
}
