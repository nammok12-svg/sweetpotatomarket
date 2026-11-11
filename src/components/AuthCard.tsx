export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(31,27,26,0.04)] sm:p-8">
        {children}
      </div>
    </div>
  );
}
