-- Discretionary manual refund of a single pledge while its dare is OPEN
-- ("it costs you nothing to grant one for a genuine mistake" — §7.2).
-- Atomic: the pot decrement and the DUE mark move together or not at all.

create or replace function puhb_manual_refund(p_signature text) returns text
language plpgsql
security definer
as $$
declare
  p record;
  d record;
begin
  select * into p from puhb_pledges where signature = p_signature for update;
  if not found then return 'NO_PLEDGE'; end if;
  if p.refund_status <> 'NONE' then return 'ALREADY_HANDLED'; end if;

  select * into d from puhb_dares where id = p.dare_id for update;
  if d.status <> 'OPEN' then return 'DARE_NOT_OPEN'; end if;

  update puhb_pledges set refund_status = 'DUE' where signature = p_signature;
  update puhb_dares
     set pot_lamports = pot_lamports - p.lamports,
         backer_count = greatest(backer_count - 1, 0)
   where id = p.dare_id;

  insert into puhb_admin_log (actor, action, dare_id, detail)
  values ('admin', 'manual_refund', p.dare_id,
          jsonb_build_object('pledge', p_signature, 'lamports', p.lamports));
  return 'OK';
end
$$;
