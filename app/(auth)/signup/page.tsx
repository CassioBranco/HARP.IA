import Link from 'next/link'

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cadastro com Supabase Auth — Sprint S2.
      </p>
      <p className="mt-4 text-sm">
        <Link href="/login" className="underline underline-offset-4">
          Já tenho conta
        </Link>
      </p>
    </>
  )
}
