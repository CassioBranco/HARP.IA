#!/usr/bin/env bash
# Hook SessionStart do ANCOREO.
#
# Regenera o painel e o ESTADO.md e joga os dois no contexto. O Claude nunca
# mais começa uma sessão perguntando "onde paramos" nem lendo documentação em
# prosa que envelheceu — o que ele lê aqui foi verificado contra git, banco e
# código agora, neste segundo.
#
# O PAINEL é a visão do Cássio: ele pediu pra ver em que passo estamos ANTES de
# começar qualquer coisa nova. Não é opcional e não depende de eu lembrar.

echo "════════════════════════════════════════════════════════"
echo "[ANCOREO] Sessão na casa do projeto."
echo ""
echo "ORDEM DE LEITURA: PAINEL.md > ESTADO.md (gerados) > MVP.md > RITUAL.md > CLAUDE.md."
echo "REGRA DE OURO: verifique o código e o banco, nunca a prosa."
echo "Escopo travado do MVP: onboarding · site builder · blog builder ·"
echo "métricas SEO/GEO/AEO · Google Perfil de Empresa. E-commerce está FORA."
echo ""
echo ">> COMBINADO COM O CÁSSIO (13/08): antes de começar qualquer trabalho novo,"
echo ">> mostre a ele o painel abaixo — porcentagem, dias pro lançamento, o que"
echo ">> está esperando ele, e qual é o próximo item. Curto. Depois pergunte."
echo "════════════════════════════════════════════════════════"
echo ""

if node scripts/planilha.mjs >/dev/null 2>&1; then
  cat PAINEL.md
  echo ""
  echo "──────────── detalhe técnico ────────────"
  echo ""
  cat ESTADO.md
else
  echo "!! scripts/planilha.mjs falhou. NÃO confie nos arquivos abaixo (podem estar velhos)."
  echo "!! Rode 'node scripts/planilha.mjs' e conserte antes de afirmar qualquer coisa."
  echo ""
  cat PAINEL.md 2>/dev/null
  cat ESTADO.md 2>/dev/null
fi
