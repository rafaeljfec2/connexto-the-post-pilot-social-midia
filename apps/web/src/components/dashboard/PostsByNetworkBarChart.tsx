import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { name: 'LinkedIn', posts: 40 },
  { name: 'Instagram', posts: 32 },
  { name: 'Twitter', posts: 18 },
  { name: 'Facebook', posts: 10 },
]

export function PostsByNetworkBarChart() {
  return (
    <Card className="h-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Posts por Rede Social</CardTitle>
      </CardHeader>
      <CardContent className="h-48 p-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="posts" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
