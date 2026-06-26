#!/usr/bin/env bash
# Hook SessionStart do ANCOREO — injeta o estado real do projeto no início de toda sessão.
# Objetivo: o Claude nunca mais "começar do zero". A saída deste script vira contexto.

echo "════════════════════════════════════════════════════════"
echo "[ANCOREO] Sessão iniciada na casa do projeto."
echo ""
echo "REGRA DE OURO: antes de afirmar 'pronto/pendente' ou pedir"
echo "algo ao Cássio, rode a skill 'ancoreo-status' (git+banco+build)"
echo "ou 'cronograma'. Verificar > Afirmar. Mapa: LEIA-PRIMEIRO.md."
echo "Memória do projeto carrega de memoria/ (junction)."
echo "════════════════════════════════════════════════════════"
echo ""
echo "--- Últimos 5 commits ---"
git log --oneline -5 2>/dev/null || echo "(git indisponível neste shell)"
echo ""
echo "--- Trabalho não commitado (git status -s) ---"
git status -s 2>/dev/null || true
echo ""
echo "--- Commits locais ainda NÃO publicados (origin/master..master) ---"
git log origin/master..master --oneline 2>/dev/null || true
