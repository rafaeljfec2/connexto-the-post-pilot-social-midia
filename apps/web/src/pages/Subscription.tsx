import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  CreditCard as CreditCardIcon,
  ShieldCheck,
  Apple,
  CheckCircle,
} from 'lucide-react'
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
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar forma de pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2">
            <Button
              type="button"
              variant={method === 'card' ? 'outline' : 'ghost'}
              className={`flex flex-1 items-center gap-2 ${method === 'card' ? 'border-blue-600 text-blue-600' : ''}`}
              onClick={() => setMethod('card')}
            >
              <CreditCardIcon className="h-5 w-5" /> Cartão
            </Button>
            <Button
              type="button"
              variant={method === 'google' ? 'outline' : 'ghost'}
              className={`flex flex-1 items-center gap-2 ${method === 'google' ? 'border-blue-600 text-blue-600' : ''}`}
              onClick={() => setMethod('google')}
            >
              <Apple className="h-5 w-5" /> Google Pay
            </Button>
          </div>
          {method === 'card' && (
            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Número do cartão</label>
                <Input
                  placeholder="1234 1234 1234 1234"
                  maxLength={19}
                  inputMode="numeric"
                  className="pr-16"
                />
                <div className="absolute right-4 top-10 flex gap-1">
                  <img src="https://img.icons8.com/color/24/000000/visa.png" alt="Visa" />
                  <img
                    src="https://img.icons8.com/color/24/000000/mastercard-logo.png"
                    alt="Mastercard"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Data de validade</label>
                  <Input placeholder="MM / AA" maxLength={5} />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Código de segurança</label>
                  <Input placeholder="CVC" maxLength={4} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">País</label>
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
              <p className="mt-2 text-xs text-muted-foreground">
                Ao fornecer seus dados de cartão, você permite que a plataforma faça a cobrança para
                pagamentos futuros em conformidade com os respectivos termos.
              </p>
              <Button className="mt-4 w-full" type="submit">
                Adicionar
              </Button>
              <Button className="mt-2 w-full" variant="outline" type="button">
                Voltar
              </Button>
            </form>
          )}
          {method === 'google' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Apple className="mb-2 h-10 w-10 text-zinc-700" />
              <p className="mb-4 text-muted-foreground">Pagamento via Google Pay em breve.</p>
              <Button disabled>Indisponível</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {invoices.map((item, idx) => (
              <li key={idx} className="flex items-center gap-4 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>{item.date}</span>
                <span>{item.amount}</span>
                <Badge className="bg-green-600 text-white">{item.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
