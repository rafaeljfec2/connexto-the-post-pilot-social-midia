import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const data = [
  { name: 'Mai', engajamento: 1200 },
  { name: 'Jun', engajamento: 2100 },
  { name: 'Jul', engajamento: 1800 },
  { name: 'Ago', engajamento: 2500 },
  { name: 'Set', engajamento: 3000 },
  { name: 'Out', engajamento: 2000 },
  { name: 'Nov', engajamento: 1700 },
]

export function HistoryEngagementChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
        />
        <Line
          type="monotone"
          dataKey="engajamento"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
