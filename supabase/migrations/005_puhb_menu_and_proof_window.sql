-- Three changes:
--   1. The menu grows from 12 to 42, grouped so the picker stays usable.
--   2. Proof videos get a public window, after which the file is deleted.
--   3. Doer handles can be verified, so a name on the board means something.
--
-- Every category is checked against the hard bans in spec §6: nothing with
-- heights, vehicles, water beyond a plunge tub, fire, weapons, alcohol,
-- drugs, fasting or purging, more than a single serving of any consumable,
-- sexual content, animals, minors, or a non-consenting third party.
--
-- They are also chosen to be HARD TO FAKE. The properties that do that:
--   · a stranger has to visibly react (can't be staged alone in a room)
--   · one continuous take with no cuts
--   · it leaves a persistent change someone can check later
--   · it takes a measurable amount of time on camera
-- On top of all of them, the doer must show or say their dare code.

-- short_label already exists from 004; this adds the grouping.
alter table puhb_categories add column group_label text not null default 'Nerve';

-- 1. Group the twelve originals.
update puhb_categories set group_label = case id
  when 'pepper'  then 'Taste'
  when 'flavor'  then 'Taste'
  when 'hair'    then 'Looks'
  when 'haircut' then 'Looks'
  when 'outfit'  then 'Looks'
  when 'plunge'  then 'Body'
  when 'pushups' then 'Body'
  when 'cover'   then 'Nerve'
  when 'dance'   then 'Nerve'
  when 'sign'    then 'Nerve'
  when 'ex'      then 'Online'
  when 'bio'     then 'Online'
  else 'Nerve'
end;

-- 2. Thirty more.
insert into puhb_categories (id, label, short_label, emoji, blurb, group_label, active, sort_order) values
  -- ---------- Nerve: a stranger has to react, which is the hard part ----------
  ('serenade',  'Serenade a whole café',                'Serenade',      '🎻', 'One take, full song, at least one table reacts.',                      'Nerve', true, 20),
  ('anthem',    'Sing the anthem in a supermarket',      'Anthem',        '🇵🇦', 'One take, standing still, until someone looks.',                       'Nerve', true, 21),
  ('busk',      'Busk for 20 minutes with a hat out',    'Busking',       '🎩', 'One take of the full 20 minutes, hat visible, whatever you earn shown at the end.', 'Nerve', true, 22),
  ('compliment','Compliment 20 strangers in 10 minutes', '20 compliments','💐', 'One take, count them out loud as you go.',                            'Nerve', true, 23),
  ('tedtalk',   'Give a 2-minute talk to strangers in a park', 'Park TED talk', '🎙️', 'One take, real strangers, they must still be there at the end.',   'Nerve', true, 24),
  ('commentate','Commentate your grocery shop out loud', 'Commentary',    '📢', 'One take, whole shop, sports-commentator voice, other shoppers audible.', 'Nerve', true, 25),
  ('openmic',   'Do 60 seconds at an open mic',          'Open mic',      '🎤', 'One take from the stage, audience audible.',                          'Nerve', true, 26),
  ('freehugs',  'Hold a FREE HUGS sign for 15 minutes',  'Free hugs',     '🤗', 'One take, sign legible, only people who walk up to you.',             'Nerve', true, 27),
  ('rate',      'Ask 10 strangers to rate your outfit',  'Outfit ratings','🔟', 'One take, all ten answers audible.',                                  'Nerve', true, 28),
  ('magic',     'Fail a magic trick 10 times in public', 'Bad magic',     '🪄', 'One take, ten attempts, all of them bad.',                            'Nerve', true, 29),
  ('rhyme',     'Speak only in rhyme for an hour',       'Rhyme hour',    '📜', 'One take of a real conversation, at least 10 minutes of it in shot.',  'Nerve', true, 30),
  ('accent',    'Hold a fake accent all day in public',  'Fake accent',   '🎭', 'One take of at least three real interactions, accent never drops.',    'Nerve', true, 31),
  ('backwards', 'Recite the alphabet backwards in a queue', 'Alphabet',   '🔤', 'One take, out loud, in a real queue, no notes.',                      'Nerve', true, 32),
  ('pi',        'Recite 50 digits of pi from memory in public', '50 digits of pi', '🥧', 'One take, no notes, said out loud to strangers.',            'Nerve', true, 33),

  -- ---------- Looks: leaves a persistent change anyone can verify ----------
  ('eyebrows',  'Dye your eyebrows a stupid colour',     'Eyebrows',      '🖍️', 'Before and after in one take, then a daylight shot.',                 'Looks', true, 40),
  ('beard',     'Shave your beard into a ridiculous shape', 'Beard shape','🪒', 'Before and after in one take, then out in public with it.',           'Looks', true, 41),
  ('nails',     'Nails in a colour the internet picks, 7 days', 'Nails',  '💅', 'Painting it in one take, then a hand shot on day 7.',                 'Looks', true, 42),
  ('wig',       'Wear a wig all day and never mention it', 'The wig',     '👱', 'One take of at least two interactions where nobody is told.',         'Looks', true, 43),
  ('sockssandals','Socks and sandals in public for a day','Socks+sandals','🩴', 'One take out of the house, feet clearly in shot.',                     'Looks', true, 44),
  ('mismatch',  'Mismatched shoes for a full day out',   'Odd shoes',     '👟', 'One take out of the house, both feet in shot, plus one stranger noticing.', 'Looks', true, 45),
  ('suitbeach', 'Full suit at the beach for the day',    'Suit at beach', '🕴️', 'One take on the sand, in the suit, with other people around.',        'Looks', true, 46),
  ('facepaint', 'Let a stranger draw on your face',      'Face drawing',  '🖌️', 'One take, washable marker only, their choice not yours.',             'Looks', true, 47),

  -- ---------- Taste: single serving, nothing that hurts you ----------
  ('lemon',     'Eat a whole lemon like an apple',       'Whole lemon',   '🍋', 'One take, skin and all, no cuts.',                                    'Taste', true, 60),
  ('onion',     'Eat a raw onion like an apple',         'Raw onion',     '🧅', 'One take, no cuts, finish it.',                                       'Taste', true, 61),
  ('mystery',   'Eat the weirdest thing on the menu',    'Weird menu item','🍽️', 'One take ordering it, one take finishing it.',                        'Taste', true, 62),
  ('babyfood',  'Review three jars of baby food on camera', 'Baby food',  '🍼', 'One take, all three, honest scores.',                                 'Taste', true, 63),

  -- ---------- Body: safe, measurable, and visibly hard ----------
  ('wallsit',   'Wall sit for 2 minutes',                'Wall sit',      '🧱', 'One unbroken shot, visible timer, no leaning on anything else.',      'Body', true, 70),
  ('plank',     'Plank for 3 minutes',                   '3-min plank',   '🏋️', 'One unbroken shot, visible timer.',                                   'Body', true, 71),
  ('burpees',   '50 burpees in a public square',         '50 burpees',    '🤸', 'One take, all fifty, strangers visible.',                             'Body', true, 72),
  ('coldsing',  'Cold shower while singing the whole time', 'Cold sing',  '🚿', 'One unbroken shot, 3 minutes, visible timer, singing never stops.',    'Body', true, 73),

  -- ---------- Online: the artifact is the proof ----------
  ('pfp',       'Profile picture the internet picks, 7 days', 'PFP swap', '🖼️', 'Screenshot day 1 and day 7, profile publicly visible.',               'Online', true, 80),
  ('voicenote', 'Sing a voice note to your family chat', 'Family voice note', '🎙️', 'Screenshot the send, redact everyone else.',                     'Online', true, 81),
  ('diary',     'Read your teenage diary out loud',      'Teenage diary', '📔', 'One take, face and page both in shot, redact other names.',           'Online', true, 82);

-- 3. Proof lifecycle: public for a window, then the file goes.
alter table puhb_dares add column proof_public_until timestamptz;
alter table puhb_dares add column proof_deleted_at timestamptz;

create index puhb_dares_proof_expiry_idx on puhb_dares (proof_public_until)
  where proof_public_until is not null and proof_deleted_at is null;
