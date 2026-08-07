# PROTOCOLO — Diagnóstico de "está quebrado" no ANCOREO

> Regra-mãe: **menor caminho até a verdade.** Não abrir navegador, não pedir
> permissão em círculo, não chutar pelo pixel. Grounding antes de ação.
> Criado em 2026-07-22 depois de um episódio de flailing (fui pro Chrome quando
> o print + o código já bastavam).

---

## Os 5 passos, nesta ordem

**1. Capturar o sintoma (30s).**
O print ou a frase do Cássio É o sintoma. Nomear os defeitos concretos que se
veem ("campos vazios" + "imagem do hero sem relação"). Não interpretar além do
que está na tela.

**2. Ler o código do componente (fonte da verdade nº 1).**
Abrir o componente exato e listar os estados que ele PODE renderizar.
→ Se o sintoma não bate com nenhum estado previsto, o problema é **dado
divergente**, não lógica. Ir pro passo 3.
→ Se bate com um estado de erro do próprio código, corrigir ali.

**3. Ler o dado real (fonte da verdade nº 2).**
Uma query de **leitura** no Supabase (`pages`, `sections`, `sites` do tenant).
Confirma: o conteúdo existe? Os nomes que o código espera (`slug='home'`,
`section_type='hero'`, etc.) batem com o que está gravado? Só leitura, não toca
em nada.

**4. Só então, se código + dado não explicarem: navegador.**
Aí sim console/runtime. E mesmo assim: pega UMA janela e age. Sem loop de
"qual navegador / posso abrir / confirma de novo".

**5. Corrigir local → `npx tsc --noEmit` verde → PARAR.**
Nada de commit, push, deploy ou migration_apply sem OK explícito do Cássio.

---

## Anti-flailing (o que me fez apanhar)

- **Print + código já bastam? Não abrir Chrome.** Navegador é passo 4, não 1.
- **Não perguntar duas vezes a mesma coisa.** Uma pergunta só quando a resposta
  muda o rumo do trabalho.
- **Não narrar tool-theater.** Menos "vou conectar / vou inspecionar", mais
  resultado.

---

## Prevenção (pra o bug não voltar a passar batido)

Antes de dar o builder como "ok", abrir **1 site real gerado** e conferir:
- [ ] Campos do editor preenchidos (não barra cinza vazia).
- [ ] Imagem do hero coerente com o negócio (não stock aleatório).
- [ ] `section_type` / slug do banco batendo com o que o `SectionEditor` busca.

Se qualquer um falhar → não está ok, mesmo que `tsc` e `next build` passem
(esses não pegam bug de runtime nem de dado).
