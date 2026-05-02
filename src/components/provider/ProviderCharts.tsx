"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrdersByStatus = { name: string; value: number; fill: string }[];
type OrdersLast7Days = { day: string; orders: number }[];

interface ProviderChartsProps {
  ordersByStatus: OrdersByStatus;
  ordersLast7Days: OrdersLast7Days;
}

// ─── Explicit colors — avoids --chart-1 resolving to near-black ──────────────
const STATUS_COLORS: Record<string, string> = {
  Placed: "#6366f1", // indigo
  Preparing: "#f59e0b", // amber
  Ready: "#3b82f6", // blue
  Delivered: "#10b981", // emerald
  Cancelled: "#f43f5e", // rose
};

// Bar chart day colors — cycle through a palette for visual variety
const BAR_PALETTE = [
  "#10b981", // emerald
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

const ordersBarConfig = {
  orders: { label: "Orders", color: "#10b981" },
} satisfies ChartConfig;

const statusPieConfig: ChartConfig = Object.fromEntries(
  Object.entries(STATUS_COLORS).map(([key, color]) => [
    key,
    { label: key, color },
  ]),
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ height = 200 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center text-zinc-400 text-sm"
      style={{ height }}
    >
      No data yet
    </div>
  );
}

// ─── Custom always-visible pie label ─────────────────────────────────────────
function PieLabel({
  cx,
  cy,
  midAngle,
  // innerRadius,
  outerRadius,
  value,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
  name: string;
}) {
  if (value === 0) return null;

  const RADIAN = Math.PI / 180;
  // Position the label outside the slice
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Small connector line from slice edge to label
  const lineStartRadius = outerRadius + 4;
  const x1 = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
  const y1 = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x}
        y2={y}
        stroke={STATUS_COLORS[name] ?? "#888"}
        strokeWidth={1}
        strokeOpacity={0.5}
      />
      <text
        x={x}
        y={y - 5}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10}
        fontWeight={600}
        fill={STATUS_COLORS[name] ?? "#888"}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 8}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="currentColor"
        className="fill-zinc-700 dark:fill-zinc-300"
      >
        {value}
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProviderCharts({
  ordersByStatus,
  ordersLast7Days,
}: ProviderChartsProps) {
  const hasOrders = ordersLast7Days.some((d) => d.orders > 0);
  const hasStatus = ordersByStatus.some((d) => d.value > 0);

  const pieData = ordersByStatus
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      fill: STATUS_COLORS[d.name] ?? "#888",
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* ── Bar: orders last 7 days (2/3 width) ── */}
      <div className="lg:col-span-2">
        <ChartCard
          title="Orders — Last 7 Days"
          subtitle="All incoming orders across the last 7 days"
        >
          {hasOrders ? (
            <ChartContainer config={ordersBarConfig} className="h-60 w-full">
              <BarChart
                data={ordersLast7Days}
                margin={{ top: 16, right: 4, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#3f3f46"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(v) => v.split(",")[0]}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {/* Each bar gets a distinct color from the palette */}
                  {ordersLast7Days.map((_, i) => (
                    <Cell
                      key={i}
                      fill={BAR_PALETTE[i % BAR_PALETTE.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                  {/* Always-visible count label on top of each bar */}
                  <LabelList
                    dataKey="orders"
                    position="top"
                    formatter={(v: unknown) => (Number(v) > 0 ? Number(v) : "")}
                    style={{ fontSize: 11, fontWeight: 600, fill: "#a1a1aa" }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      {/* ── Pie: orders by status (1/3 width) ── */}
      <ChartCard title="Orders by Status" subtitle="All-time order breakdown">
        {hasStatus ? (
          <ChartContainer config={statusPieConfig} className="h-65 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={70}
                paddingAngle={3}
                // @ts-expect-error recharts label prop accepts custom component
                label={PieLabel}
                labelLine={false}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>
    </div>
  );
}
