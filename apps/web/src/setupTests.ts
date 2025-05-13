import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup()
}) 