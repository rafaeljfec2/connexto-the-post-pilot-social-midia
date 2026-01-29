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
  { name: 'Seg', engajamento: 120 },
  { name: 'Ter', engajamento: 210 },
  { name: 'Qua', engajamento: 180 },
  { name: 'Qui', engajamento: 250 },
  { name: 'Sex', engajamento: 300 },
  { name: 'Sáb', engajamento: 200 },
  { name: 'Dom', engajamento: 170 },
]

export function EngagementLineChart() {
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
