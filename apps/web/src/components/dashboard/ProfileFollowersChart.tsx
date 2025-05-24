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
    <Card className="h-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Crescimento de Seguidores</CardTitle>
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
              dataKey="seguidores"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
