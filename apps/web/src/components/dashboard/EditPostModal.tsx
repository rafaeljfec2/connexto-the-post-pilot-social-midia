import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Post } from '@/services/posts.service'

interface EditPostModalProps {
  post: Post
  onClose: () => void
  onSave?: (newContent: string) => void
}

export function EditPostModal({ post, onClose, onSave }: EditPostModalProps) {
  const [content, setContent] = useState(post.output)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    if (onSave) {
      await onSave(content)
    }
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Conteúdo do post</label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            className="resize-y"
            autoFocus
          />
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-mono">Modelo: {post.model}</span>
            <span className="ml-4">Tokens: {post.usage.total_tokens}</span>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold">Pré-visualização:</label>
            <div className="whitespace-pre-line rounded border bg-muted p-2 text-sm">{content}</div>
          </div>
        </div>
        <DialogFooter className="mt-4 flex flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
