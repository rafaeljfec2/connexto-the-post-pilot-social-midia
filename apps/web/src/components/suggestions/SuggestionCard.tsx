import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Sparkles, Calendar, X } from 'lucide-react'
import type { Article } from '@/services/suggestions.service'
import DOMPurify from 'dompurify'

interface SuggestionCardProps {
  readonly article: Article
  readonly onCreatePost: (article: Article) => void
  readonly onSchedule: (article: Article) => void
  readonly onDiscard: (article: Article) => void
  readonly isGenerating?: boolean
}

function sanitizeSummary(summary?: string): string {
  if (!summary) return ''
  return DOMPurify.sanitize(summary, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
    ALLOWED_ATTR: [],
  })
}

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function SuggestionCard({
  article,
  onCreatePost,
  onSchedule,
  onDiscard,
  isGenerating = false,
}: SuggestionCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/20 hover:shadow-soft-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-start gap-1"
              >
                <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover/link:text-primary">
                  {article.title}
                </h3>
                <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onDiscard(article)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {article.publishedAt && (
              <>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </>
            )}
          </div>

          {article.summary && (
            <p
              className="line-clamp-2 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeSummary(article.summary) }}
            />
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{article.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 border-t pt-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onCreatePost(article)}
              disabled={isGenerating}
            >
              <Sparkles className="size-4" />
              Criar Post
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onSchedule(article)}
            >
              <Calendar className="size-4" />
              Agendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
