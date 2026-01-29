type ErrorTranslation = {
  readonly pattern: RegExp | string
  readonly message: string
  readonly action?: string
}

const errorTranslations: ErrorTranslation[] = [
  {
    pattern: /LinkedIn not connected/i,
    message: 'LinkedIn não conectado',
    action: 'Conecte sua conta do LinkedIn na página de Perfil para publicar posts.',
  },
  {
    pattern: /token expired|token invalid|401|403/i,
    message: 'Sessão do LinkedIn expirada',
    action: 'Reconecte sua conta do LinkedIn na página de Perfil.',
  },
  {
    pattern: /API key/i,
    message: 'Chave da OpenAI não configurada',
    action: 'Configure sua API Key nas Configurações.',
  },
  {
    pattern: /OpenAI error/i,
    message: 'Erro na geração de conteúdo',
    action: 'Verifique sua API Key da OpenAI ou tente novamente.',
  },
  {
    pattern: /network|fetch|ECONNREFUSED/i,
    message: 'Erro de conexão',
    action: 'Verifique sua conexão com a internet e tente novamente.',
  },
  {
    pattern: /timeout/i,
    message: 'Tempo esgotado',
    action: 'O servidor demorou para responder. Tente novamente.',
  },
  {
    pattern: /unauthorized|not authenticated/i,
    message: 'Não autorizado',
    action: 'Faça login novamente para continuar.',
  },
  {
    pattern: /validation|invalid|required/i,
    message: 'Dados inválidos',
    action: 'Verifique os dados informados e tente novamente.',
  },
]

export interface TranslatedError {
  readonly title: string
  readonly description: string
}

export function translateError(error: unknown): TranslatedError {
  const errorMessage = extractErrorMessage(error)

  for (const translation of errorTranslations) {
    const matches =
      typeof translation.pattern === 'string'
        ? errorMessage.toLowerCase().includes(translation.pattern.toLowerCase())
        : translation.pattern.test(errorMessage)

    if (matches) {
      return {
        title: translation.message,
        description: translation.action ?? errorMessage,
      }
    }
  }

  return {
    title: 'Erro',
    description: errorMessage || 'Ocorreu um erro inesperado. Tente novamente.',
  }
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const objError = error as Record<string, unknown>

    // Primeiro tenta extrair do response.data (Axios)
    const axiosMessage = extractAxiosErrorMessage(objError)
    if (axiosMessage) return axiosMessage

    // Fallback para message do objeto
    if ('message' in objError && typeof objError.message === 'string') {
      return objError.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erro desconhecido'
}

function extractAxiosErrorMessage(obj: Record<string, unknown>): string | null {
  const response = obj.response as Record<string, unknown> | undefined
  if (!response || typeof response !== 'object') return null

  const data = response.data as Record<string, unknown> | undefined
  if (!data || typeof data !== 'object') return null

  // Formato: { error: { message: "..." } }
  const nestedError = data.error as Record<string, unknown> | undefined
  if (nestedError && typeof nestedError === 'object' && typeof nestedError.message === 'string') {
    return nestedError.message
  }

  // Formato: { message: "..." }
  if (typeof data.message === 'string') {
    return data.message
  }

  // Formato: { error: "string message" }
  if (typeof data.error === 'string') {
    return data.error
  }

  return null
}
