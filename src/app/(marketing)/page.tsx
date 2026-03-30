export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <main className="max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          TitleComply
        </h1>
        <p className="mt-4 text-muted">
          FinCEN compliance automation for title and escrow.
        </p>
      </main>
    </div>
  );
}
