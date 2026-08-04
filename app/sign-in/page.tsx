import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-[var(--space-4)]">
      <div className="w-full max-w-[400px]">
        <div className="mb-[var(--space-8)] text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[28px] font-[500] leading-[1.15] tracking-[-0.01em] text-[var(--color-ink)]">
            Shelf
          </h1>
          <p className="mt-[var(--space-2)] text-[15px] leading-[1.5] text-[var(--color-ink-muted)]">
            Access the office library to borrow and return books.
          </p>
        </div>
        <SignInForm redirectTo="/" />
      </div>
    </main>
  );
}
