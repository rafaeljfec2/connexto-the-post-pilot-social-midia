import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard as CreditCardIcon, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const countries = ['Brasil', 'Estados Unidos', 'Portugal', 'Argentina']

export function Subscription() {
  const [method, setMethod] = useState<'card' | 'google'>('card')
  const [form, setForm] = useState({
    card: '',
    expiry: '',
    cvc: '',
    country: 'Brasil',
  })
  const [invoices] = useState([
    { date: '2024-06-10', amount: 'R$ 49,90', status: 'Pago' },
    { date: '2024-05-10', amount: 'R$ 49,90', status: 'Pago' },
  ])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie seus métodos de pagamento e faturas.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Forma de Pagamento</CardTitle>
            <CardDescription>Adicione ou altere seu método de pagamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-2">
              <Button
                type="button"
                variant={method === 'card' ? 'default' : 'outline'}
                className="flex flex-1 items-center gap-2"
                onClick={() => setMethod('card')}
              >
                <CreditCardIcon className="size-4" />
                Cartão
              </Button>
              <Button
                type="button"
                variant={method === 'google' ? 'default' : 'outline'}
                className="flex flex-1 items-center gap-2"
                onClick={() => setMethod('google')}
              >
                <Smartphone className="size-4" />
                Google Pay
              </Button>
            </div>

            {method === 'card' && (
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Número do cartão</label>
                  <Input placeholder="1234 1234 1234 1234" maxLength={19} inputMode="numeric" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Validade</label>
                    <Input placeholder="MM / AA" maxLength={5} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CVC</label>
                    <Input placeholder="123" maxLength={4} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Select
                    value={form.country}
                    onValueChange={country => setForm(f => ({ ...f, country }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ao fornecer seus dados, você autoriza cobranças futuras conforme os termos de uso.
                </p>
                <Button className="w-full" type="submit">
                  Adicionar cartão
                </Button>
              </form>
            )}

            {method === 'google' && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Smartphone className="size-8 text-muted-foreground" />
                </div>
                <p className="mb-4 text-center text-muted-foreground">
                  Pagamento via Google Pay estará disponível em breve.
                </p>
                <Button disabled>Indisponível</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Histórico de Faturas</CardTitle>
            <CardDescription>Suas últimas transações e pagamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {invoices.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">{item.amount}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 border-success text-success">
                    <CheckCircle2 className="size-3" />
                    {item.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
