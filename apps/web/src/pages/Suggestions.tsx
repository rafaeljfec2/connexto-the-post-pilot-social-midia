import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SuggestionCard } from '@/components/suggestions/SuggestionCard'
import { useSuggestions, SuggestionsFilters } from '@/hooks/useSuggestions'
import { useGeneratePost } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/use-toast'
import type { Article } from '@/services/suggestions.service'
import { Sparkles, Search, Loader2, RefreshCw, Filter, FileText } from 'lucide-react'

const quickFilters = [
  { label: 'Todos', value: '' },
  { label: 'Tech', value: 'tech,technology,software' },
  { label: 'Marketing', value: 'marketing,growth,sales' },
  { label: 'IA', value: 'ai,artificial intelligence,machine learning' },
  { label: 'Negócios', value: 'business,startup,entrepreneurship' },
]

export function Suggestions() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const generatePost = useGeneratePost()

  const filters: SuggestionsFilters = {
    q: searchQuery || activeFilter,
    tags: activeFilter ? activeFilter.split(',').map(t => t.trim()) : [],
    limit: 12,
  }

  const { data: articles = [], isLoading, error, refetch } = useSuggestions(filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const handleQuickFilter = (filter: string) => {
    setActiveFilter(filter)
    setSearchQuery('')
  }

  const handleCreatePost = async (article: Article) => {
    try {
      setGeneratingId(article.url)
      const response = await generatePost.mutateAsync({ topic: article.title })

      toast({
        title: 'Post gerado com sucesso!',
        description: 'Redirecionando para a lista de posts...',
      })

      navigate('/app/pending', {
        state: { generatedContent: response, highlight: response.logId },
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      if (errorMessage.includes('API') || errorMessage.includes('key')) {
        toast({
          title: 'Configure sua API Key',
          description: 'Vá em Configurações e adicione sua chave da OpenAI.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro ao gerar post',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setGeneratingId(null)
    }
  }

  const handleSchedule = () => {
    toast({
      title: 'Em breve',
      description: 'Agendamento será implementado em breve.',
    })
  }

  const handleDiscard = () => {
    toast({
      title: 'Sugestão descartada',
      description: 'Atualize para ver novas sugestões.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Criar Conteúdo</h1>
        <p className="text-muted-foreground">
          Use IA para encontrar inspiração e gerar posts para suas redes sociais.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite um tema, palavra-chave ou cole um link..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-12 pl-10 text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Filter className="size-3.5" />
                Filtros:
              </span>
              {quickFilters.map(filter => (
                <Badge
                  key={filter.label}
                  variant={activeFilter === filter.value ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors hover:bg-primary/10"
                  onClick={() => handleQuickFilter(filter.value)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Buscar Sugestões
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Buscando sugestões...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <p className="font-medium text-destructive">Erro ao carregar sugestões</p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-full bg-muted p-3">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Nenhuma sugestão encontrada</p>
              <p className="text-sm text-muted-foreground">
                Tente buscar por outro tema ou ajuste os filtros.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{articles.length} sugestões encontradas</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: Article) => (
              <SuggestionCard
                key={article.url}
                article={article}
                onCreatePost={handleCreatePost}
                onSchedule={handleSchedule}
                onDiscard={handleDiscard}
                isGenerating={generatingId === article.url}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
