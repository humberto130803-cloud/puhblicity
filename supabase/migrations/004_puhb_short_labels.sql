-- Cards need a short category name for the eyebrow ("Ghost pepper"), while
-- the full label stays the headline ("Ghost pepper, on camera"). Deriving one
-- from the other by truncation reads badly ("Let the internet pick my
-- haircut"), so the short form is authored, not computed.

alter table puhb_categories add column short_label text;

update puhb_categories set short_label = case id
  when 'pepper'  then 'Ghost pepper'
  when 'hair'    then 'Hair dye'
  when 'plunge'  then 'Cold plunge'
  when 'outfit'  then 'The outfit'
  when 'cover'   then 'Public cover'
  when 'dance'   then 'Public dance'
  when 'sign'    then 'Public sign'
  when 'ex'      then 'Text my ex'
  when 'bio'     then 'Bio swap'
  when 'haircut' then 'Haircut'
  when 'pushups' then '100 pushups'
  when 'flavor'  then 'Worst flavour'
  else label
end;

alter table puhb_categories alter column short_label set not null;
