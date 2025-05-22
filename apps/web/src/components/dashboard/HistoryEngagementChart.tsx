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
    <Card className="h-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Engajamento Histórico</CardTitle>
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
