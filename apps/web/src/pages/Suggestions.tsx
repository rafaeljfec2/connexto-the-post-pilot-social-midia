import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  suggestionsService,
  Article,
  TimeRecommendation,
  Trend,
} from '@/services/suggestions.service'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { useSuggestions, SuggestionsFilters } from '@/hooks/useSuggestions'

export function Suggestions() {
  const navigate = useNavigate()

  // Estado do formulário e dos filtros aplicados
  const [formFilters, setFormFilters] = useState<SuggestionsFilters>({
    q: '',
    from: '',
    to: '',
    tags: [],
    limit: 10,
  })
  const [filters, setFilters] = useState<SuggestionsFilters>(formFilters)

  // Handler para atualizar campos do formulário
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormFilters(f => ({
      ...f,
      [name]:
        name === 'tags'
          ? value
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : name === 'limit'
            ? value
              ? Number(value)
              : undefined
            : value,
    }))
  }

  // Handler para aplicar filtros ao submeter
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFilters(formFilters)
  }

  const {
    data: articles = [],
    isLoading: isLoadingArticles,
    error: errorArticles,
    refetch: refetchArticles,
  } = useSuggestions(filters)

  const {
    data: timeRecommendations = [],
    isLoading: isLoadingTimes,
    error: errorTimes,
    refetch: refetchTimes,
  } = useQuery<TimeRecommendation[]>({
    queryKey: ['suggestions', 'times'],
    queryFn: () => suggestionsService.getTimeRecommendations(),
  })

  const {
    data: trends = [],
    isLoading: isLoadingTrends,
    error: errorTrends,
    refetch: refetchTrends,
  } = useQuery<Trend[]>({
    queryKey: ['suggestions', 'trends'],
    queryFn: () => suggestionsService.getTrends(),
  })

  const isLoading = isLoadingArticles || isLoadingTimes || isLoadingTrends
  const error = errorArticles || errorTimes || errorTrends

  const handleCreatePost = async (article: Article) => {
    try {
      const response = await suggestionsService.generatePost({
        topic: article.title,
        includeHashtags: true,
      })
      navigate('/app/pending', { state: { generatedContent: response } })
    } catch (error) {
      console.error('Erro ao gerar post:', error)
    }
  }

  const handleSchedule = (article: Article) => {
    console.log('Agendar post com tema:', article.title)
  }

  const handleDiscard = (article: Article) => {
    refetchArticles()
  }

  // Função utilitária para sanitizar o summary
  function getSafeSummary(summary?: string) {
    if (!summary) return ''
    return DOMPurify.sanitize(summary, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'ul', 'ol', 'li', 'br', 'span', 'img', 'a'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'style'],
      FORBID_TAGS: ['iframe', 'script', 'object', 'embed'],
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-destructive">
          Não foi possível carregar as sugestões. Tente novamente mais tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-2xl md:px-8">
      {/* Formulário de filtros */}
      <form className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-6" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label htmlFor="q" className="mb-1 text-xs text-muted-foreground">
            Palavra-chave
          </label>
          <input
            type="text"
            name="q"
            id="q"
            placeholder="Palavra-chave"
            value={formFilters.q}
            onChange={handleFormChange}
            className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="from" className="mb-1 text-xs text-muted-foreground">
            De
          </label>
          <input
            type="date"
            name="from"
            id="from"
            placeholder="De (YYYY-MM-DD)"
            value={formFilters.from}
            onChange={handleFormChange}
            className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="to" className="mb-1 text-xs text-muted-foreground">
            Até
          </label>
          <input
            type="date"
            name="to"
            id="to"
            placeholder="Até (YYYY-MM-DD)"
            value={formFilters.to}
            onChange={handleFormChange}
            className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="tags" className="mb-1 text-xs text-muted-foreground">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            placeholder="Tags (separadas por vírgula)"
            value={formFilters.tags?.join(',') ?? ''}
            onChange={handleFormChange}
            className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="limit" className="mb-1 text-xs text-muted-foreground">
            Limite
          </label>
          <input
            type="number"
            name="limit"
            id="limit"
            min={1}
            max={100}
            placeholder="Limite"
            value={formFilters.limit ?? ''}
            onChange={handleFormChange}
            className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded bg-primary px-4 py-1 text-sm font-semibold text-white shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:text-zinc-900"
          >
            Filtrar
          </button>
        </div>
      </form>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Sugestões de IA / Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-medium">Sugestões de Temas</h3>
              <div className="space-y-2">
                {articles.map((article: Article) => (
                  <Card
                    key={article.url}
                    className="border border-border bg-muted/60 p-2 transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-2">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-base font-semibold text-primary md:text-lg">
                          {article.title}
                        </h4>
                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                        {article.summary && (
                          <div
                            className="relative max-h-24 overflow-hidden pr-2 text-sm text-muted-foreground"
                            style={{
                              WebkitMaskImage:
                                'linear-gradient(180deg, #000 60%, transparent 100%)',
                            }}
                            dangerouslySetInnerHTML={{ __html: getSafeSummary(article.summary) }}
                          />
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {article.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-row-reverse gap-2">
                          <Button size="sm" onClick={() => handleCreatePost(article)}>
                            Criar post
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSchedule(article)}
                          >
                            Agendar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscard(article)}
                          >
                            Descartar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">Horários Recomendados</h3>
              <div className="space-y-2">
                {timeRecommendations.map((rec: TimeRecommendation) => (
                  <Card key={rec.time} className="p-2">
                    <CardContent className="p-2">
                      <p className="font-medium">{rec.time}</p>
                      <p className="text-sm text-muted-foreground">
                        Engajamento: {rec.engagement}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">Tendências de Engajamento</h3>
              <div className="space-y-2">
                {trends.map((trend: Trend) => (
                  <Card key={trend.topic} className="p-2">
                    <CardContent className="p-2">
                      <p className="font-medium">{trend.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        Engajamento: {trend.engagement}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
