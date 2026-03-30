"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  used: number;
  limit: number | null;
};

export function FilingsUsageChart({ used, limit }: Props) {
  if (limit == null) {
    return (
      <div className="mt-3 flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-muted">
        Unlimited plan — {used} filing{used === 1 ? "" : "s"} this period
      </div>
    );
  }

  const cap = Math.max(limit, 1);
  const usedClamped = Math.min(used, cap);
  const remaining = Math.max(cap - usedClamped, 0);
  const data = [{ name: "usage", used: usedClamped, remaining }];

  return (
    <div className="mt-3 h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type="number" domain={[0, cap]} hide />
          <YAxis type="category" dataKey="name" hide width={0} />
          <Bar dataKey="used" stackId="a" radius={[4, 0, 0, 4]} barSize={28}>
            <Cell fill="#2563eb" />
          </Bar>
          <Bar dataKey="remaining" stackId="a" radius={[0, 4, 4, 0]} barSize={28}>
            <Cell fill="#e2e8f0" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-muted">
        {used} of {limit} filings used this month
      </p>
    </div>
  );
}
