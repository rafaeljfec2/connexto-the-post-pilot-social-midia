import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm, useFieldArray } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      openaiApiKey: user?.openAiApiKey ?? '',
      openaiModel: user?.openAiModel ?? '',
      linkedinClientId: user?.email ?? '',
      linkedinClientSecret: '',
      linkedinRedirectUri: '',
      dataSources: user?.dataSources?.map(ds => ({ url: ds.url ?? '' })) ?? [{ url: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dataSources',
  })

  // Atualiza o formulário quando o usuário mudar (ex: após login ou reload)
  useEffect(() => {
    reset({
      openaiApiKey: user?.openAiApiKey ?? '',
      openaiModel: user?.openAiModel ?? '',
      linkedinClientId: user?.email ?? '',
      linkedinClientSecret: '',
      linkedinRedirectUri: '',
      dataSources: user?.dataSources?.map(ds => ({ url: ds.url ?? '' })) ?? [{ url: '' }],
    })
  }, [user, reset])

  const onSubmit = (data: SettingsFormValues) => {
    // Aqui você pode salvar as configurações (ex: via API ou localStorage)
    alert('Configurações salvas com sucesso!\n' + JSON.stringify(data, null, 2))
  }

  return (
    <div className="container mx-auto flex justify-center px-2 py-6 sm:px-4 md:px-6">
      <Card className="w-full max-w-xl bg-card">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h2 className="mb-2 text-lg font-semibold">OpenAI</h2>
              <div className="space-y-2">
                <label htmlFor="openaiApiKey" className="block text-sm font-medium">
                  OpenAI API Key
                </label>
                <Input
                  id="openaiApiKey"
                  placeholder="sk-..."
                  type="password"
                  {...register('openaiApiKey', { required: true })}
                  autoComplete="off"
                />
                {errors.openaiApiKey && (
                  <span className="text-xs text-destructive">API Key é obrigatória</span>
                )}
                <label htmlFor="openaiModel" className="block text-sm font-medium">
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
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Fontes de Dados para IA</h2>
              <div className="space-y-2">
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
                <Button type="button" variant="outline" onClick={() => append({ url: '' })}>
                  Adicionar site
                </Button>
                {errors.dataSources && (
                  <span className="text-xs text-destructive">Verifique as URLs informadas</span>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Salvar configurações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
