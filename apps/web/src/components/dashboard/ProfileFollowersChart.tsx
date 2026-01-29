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
  { name: 'Jan', seguidores: 1200 },
  { name: 'Fev', seguidores: 1350 },
  { name: 'Mar', seguidores: 1500 },
  { name: 'Abr', seguidores: 1700 },
  { name: 'Mai', seguidores: 2000 },
  { name: 'Jun', seguidores: 2300 },
  { name: 'Jul', seguidores: 2500 },
]

export function ProfileFollowersChart() {
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
          dataKey="seguidores"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--success))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--success))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
