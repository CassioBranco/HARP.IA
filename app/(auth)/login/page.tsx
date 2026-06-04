import Link from 'next/link'

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fluxo de autenticação — Sprint S2.
      </p>
      <p className="mt-4 text-sm">
        <Link href="/signup" className="underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </>
  )
}
