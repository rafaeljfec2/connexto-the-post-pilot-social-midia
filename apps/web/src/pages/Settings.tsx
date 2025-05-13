import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Settings() {
  return (
    <div className="container py-6">
      <Card className="bg-card">
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