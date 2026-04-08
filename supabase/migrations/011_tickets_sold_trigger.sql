-- ── Fix stale tickets_sold counters ───────────────────────────────────────────
-- Recalculate from actual ticket records (status active or used)
UPDATE events
SET tickets_sold = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM tickets
  WHERE tickets.event_id = events.id
    AND tickets.status IN ('active', 'used')
);

-- ── Trigger: keep tickets_sold in sync automatically ──────────────────────────
CREATE OR REPLACE FUNCTION sync_tickets_sold()
RETURNS TRIGGER AS $$
DECLARE
  affected_event_id UUID;
BEGIN
  -- For DELETE use OLD, otherwise use NEW
  affected_event_id := COALESCE(NEW.event_id, OLD.event_id);

  UPDATE events
  SET tickets_sold = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM tickets
    WHERE tickets.event_id = affected_event_id
      AND tickets.status IN ('active', 'used')
  )
  WHERE id = affected_event_id;

  -- If an UPDATE moved a ticket to a different event (shouldn't happen, but be safe)
  IF TG_OP = 'UPDATE' AND OLD.event_id IS DISTINCT FROM NEW.event_id THEN
    UPDATE events
    SET tickets_sold = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM tickets
      WHERE tickets.event_id = OLD.event_id
        AND tickets.status IN ('active', 'used')
    )
    WHERE id = OLD.event_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tickets_sold_sync ON tickets;

CREATE TRIGGER tickets_sold_sync
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION sync_tickets_sold();
