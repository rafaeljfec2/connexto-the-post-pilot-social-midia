import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Settings() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6 flex justify-center">
      <Card className="bg-card w-full max-w-xl">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure suas preferências e integrações com redes sociais.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 