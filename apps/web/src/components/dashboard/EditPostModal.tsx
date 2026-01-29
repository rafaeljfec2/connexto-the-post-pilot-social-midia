import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsService, Post } from '@/services/posts.service'
import { useToast } from '@/components/ui/use-toast'
import { POSTS_QUERY_KEY } from '@/hooks/usePosts'
import { Loader2, Save, Copy, Check } from 'lucide-react'

interface EditPostModalProps {
  readonly post: Post
  readonly onClose: () => void
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const [content, setContent] = useState(post.output)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (newContent: string) =>
      postsService.update(post.id, { ...post, output: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
      toast({
        title: 'Post atualizado',
        description: 'As alterações foram salvas com sucesso.',
      })
      onClose()
    },
    onError: () => {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    },
  })

  const handleSave = () => {
    updateMutation.mutate(content)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copiado!',
        description: 'Conteúdo copiado para a área de transferência.',
      })
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o conteúdo.',
        variant: 'destructive',
      })
    }
  }

  const charCount = content.length
  const tokenEstimate = post.usage?.total_tokens ?? Math.round(charCount / 4)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Post</DialogTitle>
          <DialogDescription>Edite o conteúdo gerado pela IA antes de publicar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="original-theme" className="text-sm font-medium">
                Tema original
              </label>
              <Badge variant="outline" className="text-xs">
                {post.model}
              </Badge>
            </div>
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{post.input}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="post-content" className="text-sm font-medium">
                Conteúdo do post
              </label>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              className="resize-y font-mono text-sm"
              placeholder="Conteúdo do post..."
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{charCount} caracteres</span>
              <span>~{tokenEstimate} tokens</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="preview" className="text-sm font-medium">
              Pré-visualização
            </label>
            <div className="rounded-lg border bg-card p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {content || <span className="italic text-muted-foreground">Nenhum conteúdo</span>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !content.trim()}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
