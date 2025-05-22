import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PendingPostsFilters() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Select>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="scheduled">Agendado</SelectItem>
          <SelectItem value="published">Publicado</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Rede Social" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="linkedin">LinkedIn</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="twitter">Twitter</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="all">Todo o período</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-full sm:w-auto">Filtrar</Button>
    </div>
  )
}
