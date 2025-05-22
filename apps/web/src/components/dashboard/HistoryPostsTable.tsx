import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const posts = [
  {
    id: 1,
    title: 'Como a IA está transformando o marketing digital',
    status: 'Publicado',
    engajamento: 320,
    date: '2024-06-10',
    network: 'LinkedIn',
  },
  {
    id: 2,
    title: '5 tendências de conteúdo para LinkedIn em 2024',
    status: 'Agendado',
    engajamento: 210,
    date: '2024-06-09',
    network: 'Instagram',
  },
  {
    id: 3,
    title: 'Novo produto lançado!',
    status: 'Pendente',
    engajamento: 120,
    date: '2024-06-08',
    network: 'Facebook',
  },
]

export function HistoryPostsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rede</TableHead>
            <TableHead>Engajamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => (
            <TableRow key={post.id}>
              <TableCell className="max-w-[120px] truncate text-xs md:text-sm">
                {post.title}
              </TableCell>
              <TableCell>
                <Badge>{post.status}</Badge>
              </TableCell>
              <TableCell>{post.network}</TableCell>
              <TableCell>{post.engajamento}</TableCell>
              <TableCell>{post.date}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
