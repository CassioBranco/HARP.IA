# /new-prompt [agente] [nicho?]

Cria ou refatora um prompt para os agentes IA do Produto HARPIA, seguindo a arquitetura de 3 camadas (global + agente + nicho).

## Uso
```
/new-prompt blog                    ← Bloco 2 — Agente Blog (todas as vertentes)
/new-prompt blog clinica            ← Bloco 2 + Bloco 6 — Blog específico pra clínica
/new-prompt onboarding              ← Bloco 1 — Agente Onboarding
/new-prompt gbp restaurante         ← Bloco 3 + Bloco 10 — GBP para restaurante
```

## O que este comando faz

1. **Lê** o Bloco 0 (`prompts/global/bloco-0.md`) como contexto obrigatório
2. **Lê** o arquivo do agente correspondente se já existir
3. **Rascunha** o prompt com todas as variáveis de template explícitas
4. **Valida** contra as 7 regras críticas do Bloco 0
5. **Salva** em `prompts/agents/{agente}.md` ou `prompts/niches/{nicho}.md`
6. **Não sincroniza com o banco** — mostra o SQL de INSERT para aprovação

## Variáveis disponíveis (referência rápida)
```
{business_name} {city} {niche} {services} {differentials}
{target_audience} {pain_points} {credentials} {authority_block}
{kw_primary} {kw_secondary} {tone} {intent} {gbp_data}
```

## Checklist de validação (aplicar antes de entregar)
- [ ] Keyword principal nos primeiros 100 caracteres do output esperado
- [ ] Cidade mencionada ≥ 2x por seção longa
- [ ] Zero em-dashes, zero gerundismo no output
- [ ] CTA com verbo de posse ("Quero", "Preciso", "Agende")
- [ ] FAQ presente (blog/onboarding)
- [ ] Resposta direta na primeira frase
- [ ] Todas as variáveis de template usadas têm fallback `[NÃO INFORMADO]`
- [ ] Search intent declarado e estrutura adaptada

## SQL para sincronizar com o banco (gerar junto)
```sql
INSERT INTO prompt_templates (scope, agent, niche, version, content, is_active)
VALUES (
  'agent',           -- 'global' | 'agent' | 'niche'
  'blog',            -- nome do agente (null se global)
  null,              -- nicho (null se não for niche-specific)
  1,                 -- version (incrementar se já existir)
  $$ ... conteúdo do prompt ... $$,
  true
)
ON CONFLICT (scope, agent, niche) DO UPDATE
  SET content = EXCLUDED.content,
      version = prompt_templates.version + 1,
      is_active = true;
```

## Restrições
- **Nunca** altere o Bloco 0 sem aprovação do Cássio — é o alicerce de toda geração
- **Nunca** remova variável de template sem verificar uso em todos os agentes
- **Sempre** incremente `version` — nunca sobrescreva sem histórico
- **Sempre** teste mentalmente com 3 perfis de cliente antes de entregar
