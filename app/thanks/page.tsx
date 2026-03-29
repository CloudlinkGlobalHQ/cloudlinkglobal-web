import Link from 'next/link'

export default function Thanks() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold">Thanks — you&apos;re on the list.</h1>
        <p className="mt-4 text-white/70">
          We&apos;ll reach out as early access opens.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-white/90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
