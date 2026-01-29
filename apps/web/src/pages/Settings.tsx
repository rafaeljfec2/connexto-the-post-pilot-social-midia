import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ui/use-toast'
import {
  Key,
  Bot,
  Globe,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

interface DataSourceInput {
  type: 'rss' | 'devto' | 'hackernews'
  url: string
  tags?: string[]
}

interface SettingsFormValues {
  openaiApiKey: string
  openaiModel: string
  dataSources: DataSourceInput[]
}

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Mais inteligente, mais lento' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Rápido e inteligente' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Mais rápido, mais barato' },
]

export function Settings() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SettingsFormValues>({
    defaultValues: {
      openaiApiKey: '',
      openaiModel: 'gpt-4',
      dataSources: [{ type: 'rss', url: '', tags: [] }],
    },
  })

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: 'dataSources',
  })

  const hasApiKeyConfigured = Boolean(user?.openAiApiKey && user.openAiApiKey.length > 0)

  useEffect(() => {
    if (user) {
      reset({
        openaiApiKey: '', // Nunca preencher com a key mascarada - sempre vazio
        openaiModel: user.openAiModel ?? 'gpt-4',
        dataSources:
          user.dataSources && user.dataSources.length > 0
            ? user.dataSources.map(ds => ({
                type: ds.type ?? 'rss',
                url: ds.url ?? '',
                tags: ds.tags ?? [],
              }))
            : [{ type: 'rss', url: '', tags: [] }],
      })
      setIsLoading(false)
    }
  }, [user, reset])

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user) return

    try {
      const validDataSources = data.dataSources
        .filter(ds => ds.url.trim() !== '')
        .map(ds => ({
          type: ds.type,
          url: ds.url,
          tags: ds.tags ?? [],
        }))

      const updateData: {
        openAiApiKey?: string
        openAiModel?: string
        dataSources?: typeof validDataSources
      } = {
        openAiModel: data.openaiModel,
        dataSources: validDataSources,
      }

      // Só envia API key se o usuário digitou uma nova
      if (data.openaiApiKey.trim()) {
        updateData.openAiApiKey = data.openaiApiKey
      }

      await authService.updateProfile(updateData)
      await refreshUser()

      // Limpa o campo de API key após salvar
      reset(prev => ({ ...prev, openaiApiKey: '' }))

      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram atualizadas com sucesso.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleAddDataSource = () => {
    prepend({ type: 'rss', url: '', tags: [] }, { shouldFocus: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configure a integração com IA e fontes de dados.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Bot className="size-5 text-primary" />
              Configurações de IA
            </CardTitle>
            <CardDescription>
              Configure sua chave de API e modelo do OpenAI para geração de conteúdo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="openaiApiKey" className="flex items-center gap-2 text-sm font-medium">
                <Key className="size-4 text-muted-foreground" />
                OpenAI API Key
              </label>
              <div className="relative">
                <Input
                  id="openaiApiKey"
                  placeholder={hasApiKeyConfigured ? 'Deixe vazio para manter a atual' : 'sk-...'}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete="off"
                  {...register('openaiApiKey', {
                    required: hasApiKeyConfigured ? false : 'API Key é obrigatória',
                  })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {hasApiKeyConfigured && (
                <p className="font-mono text-xs text-muted-foreground">
                  Chave atual: {user?.openAiApiKey}
                </p>
              )}
              {errors.openaiApiKey && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.openaiApiKey.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Obtenha sua API Key em{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="openaiModel" className="flex items-center gap-2 text-sm font-medium">
                <Bot className="size-4 text-muted-foreground" />
                Modelo
              </label>
              <Controller
                name="openaiModel"
                control={control}
                rules={{ required: 'Modelo é obrigatório' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex flex-col">
                            <span>{model.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.openaiModel && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.openaiModel.message}
                </p>
              )}
            </div>

            {hasApiKeyConfigured && (
              <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                <p className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" />
                  API Key configurada
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <Globe className="size-5 text-primary" />
                  Fontes de Dados
                </CardTitle>
                <CardDescription>
                  URLs que a IA usará como referência para gerar conteúdo.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDataSource}
                className="gap-2"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Adicionar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`dataSources.${index}.type`}
                    control={control}
                    render={({ field: typeField }) => (
                      <Select value={typeField.value} onValueChange={typeField.onChange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rss">RSS</SelectItem>
                          <SelectItem value="devto">Dev.to</SelectItem>
                          <SelectItem value="hackernews">Hacker News</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/feed"
                    {...register(`dataSources.${index}.url`)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Adicione feeds RSS, blogs ou sites para que a IA busque sugestões de conteúdo.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
