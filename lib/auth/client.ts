export async function ensureProfileOnClient(): Promise<void> {
  const res = await fetch('/api/auth/ensure-profile', { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json()) as { message?: string }
    throw new Error(body.message ?? 'Erro ao preparar sua conta')
  }
}
