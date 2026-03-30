import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">TitleComply</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              FinCEN compliance on autopilot for title and escrow.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Company
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            © 2026 TitleComply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
