import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="h-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Engajamento por dia</CardTitle>
      </CardHeader>
      <CardContent className="h-48 p-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="engajamento"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
