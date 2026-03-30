import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-[#1E3A5F]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-[#0F172A]">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
