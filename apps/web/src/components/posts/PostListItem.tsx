import { Edit2, Send, Calendar, Trash2, MoreHorizontal, Linkedin, Clock } from 'lucide-react'
import type { Post } from '@/services/posts.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PostListItemProps {
  readonly post: Post
  readonly onEdit: () => void
  readonly onPublish: () => void
  readonly onSchedule: () => void
  readonly onDelete: () => void
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
    case 'Pendente':
      return (
        <Badge variant="outline" className="border-warning text-warning">
          <Clock className="mr-1 size-3" />
          Pendente
        </Badge>
      )
    case 'Agendado':
      return (
        <Badge variant="outline" className="border-primary text-primary">
          <Calendar className="mr-1 size-3" />
          Agendado
        </Badge>
      )
    case 'published':
      return (
        <Badge variant="default" className="bg-success text-success-foreground">
          <Send className="mr-1 size-3" />
          Publicado
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function truncateContent(content: string, maxLength = 150): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PostListItem({ post, onEdit, onPublish, onSchedule, onDelete }: PostListItemProps) {
  const content = post.output ?? ''
  const title = post.input ?? 'Post sem título'

  return (
    <Card className="group transition-all hover:border-primary/20 hover:shadow-soft">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                <Linkedin className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 font-medium text-foreground">{title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {truncateContent(content)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {getStatusBadge(post.status)}
              <span>•</span>
              <span>Criado {formatDate(post.createdAt)}</span>
              {post.model && (
                <>
                  <span>•</span>
                  <span className="text-muted-foreground/70">{post.model}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Edit2 className="size-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button variant="default" size="sm" className="gap-1.5" onClick={onPublish}>
              <Send className="size-3.5" />
              <span className="hidden sm:inline">Publicar</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSchedule}>
                  <Calendar className="mr-2 size-4" />
                  Agendar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
