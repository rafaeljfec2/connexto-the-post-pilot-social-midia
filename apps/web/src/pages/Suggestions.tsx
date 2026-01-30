import { motion } from 'framer-motion'
import {
  Sparkles,
  Search,
  Loader2,
  RefreshCw,
  Filter,
  FileText,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Article } from '@/services/suggestions.service'
import { SuggestionCard } from '@/components/suggestions/SuggestionCard'
import { FadeIn } from '@/components/ui/animations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useGeneratePost } from '@/hooks/usePosts'
import { useSuggestions, SuggestionsFilters } from '@/hooks/useSuggestions'
import { translateError } from '@/utils/errorMessages'

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
  const [manualTopic, setManualTopic] = useState('')
  const [isGeneratingManual, setIsGeneratingManual] = useState(false)
  const [showManualInput, setShowManualInput] = useState(true)

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
      const { title, description } = translateError(err)
      toast({
        title,
        description,
        variant: 'destructive',
      })
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

  const handleGenerateManual = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualTopic.trim()) {
      toast({
        title: 'Digite um tema',
        description: 'Informe um tema ou descrição para gerar o post.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsGeneratingManual(true)
      const response = await generatePost.mutateAsync({ topic: manualTopic })

      toast({
        title: 'Post gerado com sucesso!',
        description: 'Redirecionando para a lista de posts...',
      })

      setManualTopic('')

      navigate('/app/pending', {
        state: { generatedContent: response, highlight: response.logId },
      })
    } catch (err) {
      const { title, description } = translateError(err)
      toast({
        title,
        description,
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingManual(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <FadeIn>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Criar Conteúdo</h1>
          <p className="text-muted-foreground">
            Use IA para encontrar inspiração e gerar posts para suas redes sociais.
          </p>
        </div>
      </FadeIn>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4 md:p-6">
          <button
            type="button"
            className="flex w-full items-center justify-between"
            onClick={() => setShowManualInput(!showManualInput)}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Wand2 className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Gerar Post com IA</h3>
                <p className="text-sm text-muted-foreground">
                  Digite um tema e deixe a IA criar o conteúdo
                </p>
              </div>
            </div>
            {showManualInput ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </button>

          {showManualInput && (
            <form onSubmit={handleGenerateManual} className="mt-4 space-y-4">
              <Textarea
                placeholder="Descreva o tema do post que você deseja criar...&#10;&#10;Exemplo: 'As 5 principais tendências de IA para 2026 no mercado de tecnologia'"
                value={manualTopic}
                onChange={e => setManualTopic(e.target.value)}
                rows={4}
                className="resize-none text-base"
                disabled={isGeneratingManual}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {manualTopic.length} caracteres • Quanto mais detalhado, melhor o resultado
                </p>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={isGeneratingManual || !manualTopic.trim()}
                >
                  {isGeneratingManual ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Gerar Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou busque inspiração</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar sugestões por tema, palavra-chave..."
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
              <Button type="submit" variant="outline" className="gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Buscar Sugestões
              </Button>
              <Button
                type="button"
                variant="ghost"
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
    </motion.div>
  )
}
