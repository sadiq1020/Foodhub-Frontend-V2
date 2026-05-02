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
type UserBreakdown = { name: string; value: number; fill: string }[];

interface AdminChartsProps {
  ordersByStatus: OrdersByStatus;
  ordersLast7Days: OrdersLast7Days;
  userBreakdown: UserBreakdown;
}

// ─── Explicit color palettes ──────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Placed: "#6366f1",
  Preparing: "#f59e0b",
  Ready: "#3b82f6",
  Delivered: "#10b981",
  Cancelled: "#f43f5e",
};

const BAR_PALETTE = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#3b82f6",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

const USER_COLORS: Record<string, string> = {
  Customers: "#6366f1",
  Providers: "#10b981",
};

// ─── Chart configs ────────────────────────────────────────────────────────────
const ordersBarConfig = {
  orders: { label: "Orders", color: "#10b981" },
} satisfies ChartConfig;

const statusPieConfig: ChartConfig = Object.fromEntries(
  Object.entries(STATUS_COLORS).map(([k, color]) => [k, { label: k, color }]),
);

const userBarConfig: ChartConfig = Object.fromEntries(
  Object.entries(USER_COLORS).map(([k, color]) => [k, { label: k, color }]),
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
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const x1 = cx + (outerRadius + 4) * Math.cos(-midAngle * RADIAN);
  const y1 = cy + (outerRadius + 4) * Math.sin(-midAngle * RADIAN);
  const color = STATUS_COLORS[name] ?? "#888";

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x}
        y2={y}
        stroke={color}
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
        fill={color}
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
        className="fill-zinc-700 dark:fill-zinc-300"
      >
        {value}
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminCharts({
  ordersByStatus,
  ordersLast7Days,
}: AdminChartsProps) {
  const hasWeekly = ordersLast7Days.some((d) => d.orders > 0);
  const hasStatus = ordersByStatus.some((d) => d.value > 0);

  const pieData = ordersByStatus
    .filter((d) => d.value > 0)
    .map((d) => ({ ...d, fill: STATUS_COLORS[d.name] ?? "#888" }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* ── Bar: orders last 7 days (2/3 width) ── */}
      <div className="lg:col-span-2">
        <ChartCard
          title="Orders — Last 7 Days"
          subtitle="Daily order volume across the platform"
        >
          {hasWeekly ? (
            <ChartContainer config={ordersBarConfig} className="h-60 w-full">
              <BarChart
                data={ordersLast7Days}
                margin={{ top: 16, right: 4, left: -20, bottom: 0 }}
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
                  {ordersLast7Days.map((_, i) => (
                    <Cell
                      key={i}
                      fill={BAR_PALETTE[i % BAR_PALETTE.length]}
                      fillOpacity={0.85}
                    />
                  ))}
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
      <ChartCard
        title="Orders by Status"
        subtitle="Current status distribution"
      >
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

// ─── User breakdown chart ─────────────────────────────────────────────────────
export function UserBreakdownChart({
  userBreakdown,
}: {
  userBreakdown: UserBreakdown;
}) {
  const data = [
    {
      label: "Users",
      Customers: userBreakdown.find((u) => u.name === "Customers")?.value ?? 0,
      Providers: userBreakdown.find((u) => u.name === "Providers")?.value ?? 0,
    },
  ];

  return (
    <ChartCard
      title="User Breakdown"
      subtitle="Customers vs Providers registered on the platform"
      className="mb-8"
    >
      <ChartContainer config={userBarConfig} className="h-27.5 w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#3f3f46"
            opacity={0.4}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#71717a" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "#71717a" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="Customers"
            fill={USER_COLORS.Customers}
            radius={[0, 6, 6, 0]}
          >
            <LabelList
              dataKey="Customers"
              position="right"
              style={{
                fontSize: 11,
                fontWeight: 600,
                fill: USER_COLORS.Customers,
              }}
            />
          </Bar>
          <Bar
            dataKey="Providers"
            fill={USER_COLORS.Providers}
            radius={[0, 6, 6, 0]}
          >
            <LabelList
              dataKey="Providers"
              position="right"
              style={{
                fontSize: 11,
                fontWeight: 600,
                fill: USER_COLORS.Providers,
              }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
