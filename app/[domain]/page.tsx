type PublishedSitePageProps = {
  params: Promise<{ domain: string }>
}

export default async function PublishedSitePage({
  params,
}: PublishedSitePageProps) {
  const { domain } = await params

  return (
    <main className="mx-auto max-w-3xl p-8">
      <p className="text-sm text-muted-foreground">Site publicado</p>
      <h1 className="text-2xl font-semibold">{domain}</h1>
      <p className="mt-2 text-muted-foreground">
        Render SSR dos sites dos clientes — Sprint S3/S5.
      </p>
    </main>
  )
}
