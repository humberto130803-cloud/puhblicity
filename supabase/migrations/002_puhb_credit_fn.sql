-- Atomic pledge crediting. The REST API cannot express "insert pledge +
-- bump pot + maybe close the dare" as one transaction, so it lives here.
-- The dare row is locked for the duration, which serializes concurrent
-- indexer runs and makes the target-crossing decision race-free.

-- Crash-safety columns beyond the spec:
--   refund_status gains a transient 'SENDING' value, claimed atomically
--   before a refund tx is sent. If the worker dies mid-send, recovery looks
--   the memo up on-chain before deciding to resend — a double-send on Solana
--   has no clawback.
alter table puhb_pledges add column refund_claimed_at timestamptz;
alter table puhb_dares  add column payout_claimed_at timestamptz;

create or replace function puhb_credit_pledge(
  p_signature text,
  p_dare_id   text,
  p_backer    text,
  p_lamports  bigint,
  p_note      text
) returns text
language plpgsql
security definer
as $$
declare
  d record;
  v_count int;
  v_refund_status text;
begin
  select * into d from puhb_dares where id = p_dare_id for update;
  if not found then
    return 'NO_DARE';
  end if;

  -- 50000000 mirrors CONFIG.MIN_PLEDGE_LAMPORTS. A pledge below minimum or
  -- one that lands after funding shut is credited only to be refunded.
  if d.status = 'OPEN' and p_lamports >= 50000000 then
    v_refund_status := 'NONE';
  else
    v_refund_status := 'DUE';
  end if;

  insert into puhb_pledges (signature, dare_id, backer_wallet, lamports, backer_note, refund_status)
  values (p_signature, p_dare_id, p_backer, p_lamports, p_note, v_refund_status)
  on conflict (signature) do nothing;
  get diagnostics v_count = row_count;
  if v_count = 0 then
    return 'DUPLICATE';
  end if;

  if v_refund_status = 'DUE' then
    insert into puhb_admin_log (actor, action, dare_id, detail)
    values ('system', 'pledge_auto_refund_due', p_dare_id,
            jsonb_build_object('signature', p_signature, 'lamports', p_lamports, 'dare_status', d.status));
    return 'REFUND_DUE';
  end if;

  update puhb_dares
     set pot_lamports = pot_lamports + p_lamports,
         backer_count = backer_count + 1
   where id = p_dare_id;

  if d.pot_lamports + p_lamports >= d.target_lamports then
    update puhb_dares
       set status = 'CLOSED',
           proof_due_at = now() + interval '48 hours'
     where id = p_dare_id and status = 'OPEN';
    insert into puhb_admin_log (actor, action, dare_id, detail)
    values ('system', 'closed_target_hit', p_dare_id,
            jsonb_build_object('pot', d.pot_lamports + p_lamports, 'target', d.target_lamports));
    return 'CLOSED';
  end if;

  return 'CREDITED';
end
$$;

-- Total pot across live dares — the platform-exposure gate on dare creation.
create or replace function puhb_open_pot_total() returns bigint
language sql stable
as $$
  select coalesce(sum(pot_lamports), 0)::bigint
  from puhb_dares
  where status in ('OPEN', 'CLOSED', 'IN_REVIEW', 'REFUNDING');
$$;
