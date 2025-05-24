import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import {
  suggestionsService,
  Article,
  TimeRecommendation,
  Trend,
} from '@/services/suggestions.service'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function Suggestions() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [timeRecommendations, setTimeRecommendations] = useState<TimeRecommendation[]>([])
  const [trends, setTrends] = useState<Trend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [articlesData, timeData, trendsData] = await Promise.all([
        suggestionsService.getArticleSuggestions(),
        suggestionsService.getTimeRecommendations(),
        suggestionsService.getTrends(),
      ])
      setArticles(articlesData)
      setTimeRecommendations(timeData)
      setTrends(trendsData)
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (article: Article) => {
    try {
      const response = await suggestionsService.generatePost({
        topic: article.title,
        includeHashtags: true,
      })
      // Redirecionar para a tela de criação de posts com o conteúdo gerado
      navigate('/app/pending', { state: { generatedContent: response } })
    } catch (error) {
      console.error('Erro ao gerar post:', error)
    }
  }

  const handleSchedule = (article: Article) => {
    // TODO: Implementar lógica de agendamento
    console.log('Agendar post com tema:', article.title)
  }

  const handleDiscard = (article: Article) => {
    setArticles(articles.filter(a => a.url !== article.url))
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-xl md:px-8">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Sugestões de IA / Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-medium">Sugestões de Temas</h3>
              <div className="space-y-2">
                {articles.map(article => (
                  <Card key={article.url} className="p-2">
                    <CardContent className="p-2">
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">{article.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" onClick={() => handleCreatePost(article)}>
                          Criar post
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSchedule(article)}>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">Horários Recomendados</h3>
              <div className="space-y-2">
                {timeRecommendations.map(rec => (
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
                {trends.map(trend => (
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
