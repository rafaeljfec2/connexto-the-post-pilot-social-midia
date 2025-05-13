import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"

interface SettingsFormValues {
  openaiApiKey: string
  openaiModel: string
  linkedinClientId: string
  linkedinClientSecret: string
  linkedinRedirectUri: string
}

export function Settings() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>()

  const onSubmit = (data: SettingsFormValues) => {
    // Aqui você pode salvar as configurações (ex: via API ou localStorage)
    alert("Configurações salvas com sucesso!\n" + JSON.stringify(data, null, 2))
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6 flex justify-center">
      <Card className="bg-card w-full max-w-xl">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h2 className="text-lg font-semibold mb-2">OpenAI</h2>
              <div className="space-y-2">
                <label htmlFor="openaiApiKey" className="block text-sm font-medium">OpenAI API Key</label>
                <Input
                  id="openaiApiKey"
                  placeholder="sk-..."
                  type="password"
                  {...register("openaiApiKey", { required: true })}
                  autoComplete="off"
                />
                {errors.openaiApiKey && <span className="text-destructive text-xs">API Key é obrigatória</span>}
                <label htmlFor="openaiModel" className="block text-sm font-medium">OpenAI Model</label>
                <Input
                  id="openaiModel"
                  placeholder="gpt-4, gpt-3.5-turbo, etc."
                  {...register("openaiModel", { required: true })}
                />
                {errors.openaiModel && <span className="text-destructive text-xs">Modelo é obrigatório</span>}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">LinkedIn</h2>
              <div className="space-y-2">
                <label htmlFor="linkedinClientId" className="block text-sm font-medium">Client ID</label>
                <Input
                  id="linkedinClientId"
                  placeholder="Seu Client ID do LinkedIn"
                  {...register("linkedinClientId", { required: true })}
                />
                {errors.linkedinClientId && <span className="text-destructive text-xs">Client ID é obrigatório</span>}
                <label htmlFor="linkedinClientSecret" className="block text-sm font-medium">Client Secret</label>
                <Input
                  id="linkedinClientSecret"
                  placeholder="Seu Client Secret do LinkedIn"
                  type="password"
                  {...register("linkedinClientSecret", { required: true })}
                  autoComplete="off"
                />
                {errors.linkedinClientSecret && <span className="text-destructive text-xs">Client Secret é obrigatório</span>}
                <label htmlFor="linkedinRedirectUri" className="block text-sm font-medium">Redirect URI</label>
                <Input
                  id="linkedinRedirectUri"
                  placeholder="https://seuapp.com/auth/linkedin/callback"
                  {...register("linkedinRedirectUri", { required: true })}
                />
                {errors.linkedinRedirectUri && <span className="text-destructive text-xs">Redirect URI é obrigatória</span>}
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