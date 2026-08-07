#!/usr/bin/env bash
# Hook SessionStart do ANCOREO.
#
# Regenera o ESTADO.md e joga ele no contexto. O Claude nunca mais começa uma
# sessão perguntando "onde paramos" nem lendo documentação em prosa que
# envelheceu — o que ele lê aqui foi verificado contra git, banco e código
# agora, neste segundo.

echo "════════════════════════════════════════════════════════"
echo "[ANCOREO] Sessão na casa do projeto."
echo ""
echo "ORDEM DE LEITURA: ESTADO.md (gerado) > MVP.md > RITUAL.md > CLAUDE.md."
echo "REGRA DE OURO: verifique o código e o banco, nunca a prosa."
echo "Escopo travado do MVP: onboarding · site builder · blog builder ·"
echo "métricas SEO/GEO/AEO · Google Perfil de Empresa. E-commerce está FORA."
echo "════════════════════════════════════════════════════════"
echo ""

if node scripts/estado.mjs >/dev/null 2>&1; then
  cat ESTADO.md
else
  echo "!! scripts/estado.mjs falhou. NÃO confie no ESTADO.md abaixo (pode estar velho)."
  echo "!! Rode 'node scripts/estado.mjs' e conserte antes de afirmar qualquer coisa."
  echo ""
  cat ESTADO.md 2>/dev/null
fi
