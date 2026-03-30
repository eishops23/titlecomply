import { PricingCards } from "@/components/marketing/PricingCards";

export const dynamic = "force-dynamic";

function Check() {
  return (
    <span className="font-bold text-[#059669]" aria-label="Yes">
      ✓
    </span>
  );
}

function Dash() {
  return <span className="text-gray-300">—</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <h1 className="text-center text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
        Pricing
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
        Start with a 14-day free trial. Cancel anytime before day 15 — no
        charge.
      </p>

      <div className="mt-16">
        <PricingCards highlightPlan="PROFESSIONAL" />
      </div>

      <div className="mx-auto mt-20 max-w-5xl overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 pr-4 font-semibold text-[#0F172A]">
                Feature
              </th>
              <th className="px-4 py-4 font-semibold text-[#0F172A]">
                Starter
              </th>
              <th className="bg-blue-50/30 px-4 py-4 font-semibold text-[#0F172A]">
                Professional
              </th>
              <th className="px-4 py-4 font-semibold text-[#0F172A]">
                Enterprise
              </th>
              <th className="px-4 py-4 font-semibold text-[#0F172A]">
                Per-File
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Transactions/month</td>
              <td className="px-4 py-4">25</td>
              <td className="bg-blue-50/30 px-4 py-4">100</td>
              <td className="px-4 py-4">Unlimited</td>
              <td className="px-4 py-4">Pay per use</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Team members</td>
              <td className="px-4 py-4">2</td>
              <td className="bg-blue-50/30 px-4 py-4">10</td>
              <td className="px-4 py-4">Unlimited</td>
              <td className="px-4 py-4">1</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Screening engine</td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Data collection</td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Filing generation</td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Audit trail</td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">AI document extraction</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">API access</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Dash />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Multi-office support</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Dash />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">White-label</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Dash />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Priority support</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 pr-4">Custom integrations</td>
              <td className="px-4 py-4">
                <Dash />
              </td>
              <td className="bg-blue-50/30 px-4 py-4">
                <Dash />
              </td>
              <td className="px-4 py-4">
                <Check />
              </td>
              <td className="px-4 py-4">
                <Dash />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
