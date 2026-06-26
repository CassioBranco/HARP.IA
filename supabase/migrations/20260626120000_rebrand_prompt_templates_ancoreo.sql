-- ANCOREO — Rebrand: troca "HARPIA" por "ANCOREO" no conteúdo dos prompt_templates
--
-- Motivo: o nome comercial final é ANCOREO. O seed antigo (20260610130000) gravou
-- "plataforma HARPIA" na coluna content, que o motor de IA usa como identidade própria.
-- Migration aplicada NÃO se edita (é histórico) — por isso esta migration NOVA faz o UPDATE
-- sobre o estado atual do banco.
--
-- Idempotente: rodar de novo é inofensivo (depois da 1ª vez não há mais 'HARPIA' a trocar).
-- Escopo: só a coluna content; só linhas que contêm 'HARPIA'. Não toca infra (harp-ia/harpia.site).

UPDATE prompt_templates
SET content = replace(content, 'HARPIA', 'ANCOREO')
WHERE content LIKE '%HARPIA%';
