import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm, useFieldArray } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

interface SettingsFormValues {
  openaiApiKey: string
  openaiModel: string
  linkedinClientId: string
  linkedinClientSecret: string
  linkedinRedirectUri: string
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
      openaiModel: '',
      linkedinClientId: '',
      linkedinClientSecret: '',
      linkedinRedirectUri: '',
      dataSources: [{ url: '' }],
    },
  })
  const { fields, append, prepend, remove } = useFieldArray({ control, name: 'dataSources' })

  useEffect(() => {
    if (user) {
      reset({
        openaiApiKey: user.openAiApiKey ?? '',
        openaiModel: user.openAiModel ?? '',
        dataSources: user.dataSources?.length
          ? user.dataSources.map((ds: { url: string }) => ({ url: ds.url ?? '' }))
          : [{ url: '' }],
      })
      setIsLoading(false)
    }
  }, [user, reset])

  const onSubmit = async (data: SettingsFormValues) => {
    setSuccess(false)
    setError('')
    try {
      // TODO: Implementar atualização do usuário
      setSuccess(true)
    } catch (e) {
      setError('Erro ao salvar configurações.')
    }
  }

  const handleAddDataSource = () => {
    prepend({ url: '' }, { shouldFocus: true })
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="text-muted-foreground">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-xl md:px-8">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Configurações de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="openaiApiKey" className="mb-1 block text-sm font-medium">
                OpenAI API Key
              </label>
              <Input
                id="openaiApiKey"
                placeholder="sk-..."
                type="password"
                autoComplete="off"
                {...register('openaiApiKey', { required: true })}
              />
              {errors.openaiApiKey && (
                <span className="text-xs text-destructive">API Key é obrigatória</span>
              )}
            </div>
            <div>
              <label htmlFor="openaiModel" className="mb-1 block text-sm font-medium">
                OpenAI Model
              </label>
              <Input
                id="openaiModel"
                placeholder="gpt-4, gpt-3.5-turbo, etc."
                {...register('openaiModel', { required: true })}
              />
              {errors.openaiModel && (
                <span className="text-xs text-destructive">Modelo é obrigatório</span>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">Fontes de Dados para IA</label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDataSource}>
                  Adicionar site
                </Button>
              </div>
              <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-md border p-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      type="url"
                      placeholder="https://site.com"
                      {...register(`dataSources.${index}.url`, {
                        required: 'Informe a URL',
                        pattern: {
                          value: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/,
                          message: 'URL inválida',
                        },
                      })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                {errors.dataSources && (
                  <span className="text-xs text-destructive">Verifique as URLs informadas</span>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Salvar configurações
            </Button>
            {success && (
              <span className="mt-2 block text-sm text-green-600">
                Configurações salvas com sucesso!
              </span>
            )}
            {error && <span className="mt-2 block text-sm text-destructive">{error}</span>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
