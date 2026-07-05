-- ============================================================
-- ANCOREO — Motor de agendamento (MVP): solicitações de reserva
-- ============================================================
-- O visitante do site do cliente pede um horário pelo BookingWidget
-- (formulário público). O pedido NÃO é uma reserva confirmada — é uma
-- SOLICITAÇÃO que o dono do negócio confirma por fora (WhatsApp/telefone).
--
-- Segurança (mesmo padrão de orders/analytics_events):
--  • O visitante é ANÔNIMO. O insert acontece SÓ server-side, via
--    /api/booking com service_role, depois de validar site_id +
--    booking_enabled + campos obrigatórios. NÃO existe policy de INSERT
--    pra anon — insert anônimo direto pelo client-side é negado.
--  • A RLS aqui serve pro DONO (authenticated) ler/gerenciar as
--    solicitações do próprio tenant no painel (/agendamentos).
--
-- Data/hora preferida: colunas separadas DATE + TIME (não TIMESTAMPTZ)
-- de propósito — é uma PREFERÊNCIA que o dono lê literalmente
-- ("dia 12 às 9h"), sem conversão de fuso entre visitante/servidor/painel.
-- ============================================================

-- Toggle no site: o dono liga/desliga o widget de agendamento no /editor.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS booking_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id        UUID NOT NULL REFERENCES sites(id)   ON DELETE CASCADE,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,          -- só dígitos (WhatsApp/telefone)
  service        TEXT,                   -- serviço desejado (livre ou da lista)
  preferred_date DATE NOT NULL,          -- dia preferido (literal, sem fuso)
  preferred_time TIME NOT NULL,          -- horário preferido (literal, sem fuso)
  note           TEXT,                   -- observação opcional do visitante
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','contacted','confirmed','canceled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_requests_site_idx   ON booking_requests (site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_requests_status_idx ON booking_requests (status);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Dono vê/gerencia só as solicitações do próprio tenant.
DROP POLICY IF EXISTS tenant_isolation ON booking_requests;
CREATE POLICY tenant_isolation ON booking_requests
  USING (tenant_id = public.auth_tenant_id())
  WITH CHECK (tenant_id = public.auth_tenant_id());

-- anon NÃO insere direto (o caminho público é a API /api/booking, service_role).
REVOKE ALL ON booking_requests FROM anon;
GRANT SELECT, UPDATE, DELETE ON booking_requests TO authenticated;
GRANT ALL ON booking_requests TO service_role;

COMMENT ON TABLE booking_requests IS
  'Solicitações de agendamento vindas do BookingWidget dos sites publicados. Insert só via /api/booking (service_role); dono gerencia via RLS tenant_isolation.';
