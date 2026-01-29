import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useForm, useFieldArray } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
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
} from 'lucide-react'

interface SettingsFormValues {
  openaiApiKey: string
  openaiModel: string
  dataSources: { url: string }[]
}

export function Settings() {
  const { user } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
      dataSources: [{ url: '' }],
    },
  })

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: 'dataSources',
  })

  useEffect(() => {
    if (user) {
      reset({
        openaiApiKey: user.openAiApiKey ?? '',
        openaiModel: user.openAiModel ?? 'gpt-4',
        dataSources: user.dataSources?.length
          ? user.dataSources.map((ds: { url: string }) => ({ url: ds.url ?? '' }))
          : [{ url: '' }],
      })
      setIsLoading(false)
    }
  }, [user, reset])

  const onSubmit = async () => {
    setSuccess(false)
    setError('')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erro ao salvar configurações. Tente novamente.')
    }
  }

  const handleAddDataSource = () => {
    prepend({ url: '' }, { shouldFocus: true })
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
              <Input
                id="openaiApiKey"
                placeholder="sk-..."
                type="password"
                autoComplete="off"
                {...register('openaiApiKey', { required: 'API Key é obrigatória' })}
              />
              {errors.openaiApiKey && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.openaiApiKey.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="openaiModel" className="flex items-center gap-2 text-sm font-medium">
                <Bot className="size-4 text-muted-foreground" />
                Modelo
              </label>
              <Input
                id="openaiModel"
                placeholder="gpt-4, gpt-3.5-turbo, etc."
                {...register('openaiModel', { required: 'Modelo é obrigatório' })}
              />
              {errors.openaiModel && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.openaiModel.message}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  gpt-4
                </Badge>
                <Badge variant="outline" className="text-xs">
                  gpt-4-turbo
                </Badge>
                <Badge variant="outline" className="text-xs">
                  gpt-3.5-turbo
                </Badge>
              </div>
            </div>
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
                  <Input
                    type="url"
                    placeholder="https://exemplo.com"
                    {...register(`dataSources.${index}.url`, {
                      required: 'Informe a URL',
                      pattern: {
                        value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
                        message: 'URL inválida',
                      },
                    })}
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
            {errors.dataSources && (
              <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3" />
                Verifique as URLs informadas
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {success && (
              <p className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" />
                Configurações salvas com sucesso!
              </p>
            )}
            {error && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {error}
              </p>
            )}
          </div>
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
