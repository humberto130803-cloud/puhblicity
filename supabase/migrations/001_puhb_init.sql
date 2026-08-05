-- PUHBLICITY schema. Lives in the SOLMATE/Ascending Supabase project, so every
-- object is prefixed puhb_. All amounts are lamports stored as bigint. No
-- floats anywhere.

create table puhb_dares (
  id                text primary key,              -- 8-char uppercase base32
  doer_wallet       text not null,
  doer_name         text not null,                 -- display name, 2-24 chars
  doer_instagram    text,                          -- optional, no @ stored
  category_id       text not null,
  detail            text not null,                 -- 0-140 chars, constrained free text
  target_lamports   bigint not null,
  pot_lamports      bigint not null default 0,
  backer_count      int not null default 0,
  status            text not null,                 -- OPEN|CLOSED|IN_REVIEW|PAID|REFUNDING|REFUNDED|KILLED
  created_at        timestamptz not null default now(),
  funding_ends_at   timestamptz not null,
  proof_due_at      timestamptz,
  proof_path        text,                          -- storage object path (private bucket)
  proof_note        text,
  proof_submitted_at timestamptz,
  settled_at        timestamptz,
  payout_signature  text,
  reject_reason     text,
  posting_fee_sig   text not null unique,
  flagged           boolean not null default false,
  verified          boolean not null default false,  -- reserved for handle verification
  constraint puhb_target_in_range check (
    target_lamports >= 250000000 and target_lamports <= 5000000000
  )
);

create table puhb_pledges (
  signature        text primary key,               -- tx signature = natural idempotency key
  dare_id          text not null references puhb_dares(id),
  backer_wallet    text not null,
  lamports         bigint not null,
  backer_note      text,                           -- optional, 0-80 chars, moderated
  credited_at      timestamptz not null default now(),
  refund_status    text not null default 'NONE',   -- NONE | DUE | SENT | FAILED
  refund_signature text,
  refund_attempts  int not null default 0
);

create table puhb_categories (
  id          text primary key,
  label       text not null,
  emoji       text not null,
  blurb       text not null,                       -- what counts as proof
  active      boolean not null default true,
  sort_order  int not null
);

alter table puhb_dares
  add constraint puhb_dares_category_fk
  foreign key (category_id) references puhb_categories(id);

create table puhb_settings (
  id                  int primary key default 1,
  paused              boolean not null default false,
  max_total_open_pot  bigint not null default 50000000000,  -- 50 SOL
  vault_pubkey        text not null,
  constraint puhb_settings_singleton check (id = 1)
);

create table puhb_admin_log (
  id serial primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  dare_id text,
  detail jsonb
);

-- SOL that arrived at the vault with no matchable memo. Never auto-credited.
create table puhb_orphan_payments (
  signature   text primary key,
  from_wallet text,
  lamports    bigint not null,
  memo        text,
  seen_at     timestamptz not null default now(),
  resolved    boolean not null default false,
  note        text
);

-- Indexer cursor: the newest vault signature we have fully processed.
create table puhb_indexer_state (
  id int primary key default 1,
  last_processed_signature text,
  updated_at timestamptz not null default now(),
  constraint puhb_indexer_singleton check (id = 1)
);
insert into puhb_indexer_state (id) values (1);

create index puhb_pledges_dare_idx on puhb_pledges (dare_id);
create index puhb_pledges_refund_due_idx on puhb_pledges (refund_status) where refund_status = 'DUE';
create index puhb_dares_status_idx on puhb_dares (status, funding_ends_at);

-- Lock everything down. No anon policies at all: every read and write goes
-- through server routes with the service role. The client never talks to
-- these tables directly.
alter table puhb_dares          enable row level security;
alter table puhb_pledges        enable row level security;
alter table puhb_categories     enable row level security;
alter table puhb_settings       enable row level security;
alter table puhb_admin_log      enable row level security;
alter table puhb_orphan_payments enable row level security;
alter table puhb_indexer_state  enable row level security;

-- The twelve launch categories. The allowlist is the moderation system.
insert into puhb_categories (id, label, emoji, blurb, active, sort_order) values
  ('pepper',  'Ghost pepper, on camera',          '🌶️', 'Eat it, stay on camera 60 seconds after.', true, 1),
  ('hair',    'Dye my hair a stupid color',       '🎨', 'Before and after in one take.', true, 2),
  ('plunge',  'Cold plunge, 60 seconds',          '🧊', 'Unbroken shot, visible timer.', true, 3),
  ('outfit',  'Wear the outfit in public',        '🤡', 'Full day, at least one stranger reacts.', true, 4),
  ('cover',   'Sing a cover, badly, in public',   '🎤', 'One take, no edits.', true, 5),
  ('dance',   'Dance routine in a public place',  '🕺', 'One take, learn it first.', true, 6),
  ('sign',    'Hold a sign somewhere busy',       '🪧', '10 minutes, sign legible.', true, 7),
  ('ex',      'Text my ex what you tell me',      '📱', 'Screenshot the send, redact them.', true, 8),
  ('bio',     'Change my bio for 7 days',         '✍️', 'Screenshot day 1 and day 7.', true, 9),
  ('haircut', 'Let the internet pick my haircut', '💈', 'Before and after.', true, 10),
  ('pushups', '100 pushups, one take',            '💪', 'One shot, no cuts.', true, 11),
  ('flavor',  'Eat the worst flavor combination', '🤢', 'One take, finish it.', true, 12);
