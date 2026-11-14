-- Sample Cambodian administrative divisions (subset for local dev/demo).
-- Full official NIS data (~25 provinces, ~200 districts, ~1,600+ communes,
-- ~14,000+ villages) should be imported separately in a real deployment.

with province as (
  insert into public.addresses (level, code, name_en, name_km)
  values ('province', 'KH-12', 'Phnom Penh', 'ភ្នំពេញ')
  on conflict (code) do update set name_en = excluded.name_en
  returning id
),
district as (
  insert into public.addresses (parent_id, level, code, name_en, name_km)
  select id, 'district', 'KH-1201', 'Chamkar Mon', 'ចំការមន' from province
  on conflict (code) do update set name_en = excluded.name_en
  returning id
),
commune as (
  insert into public.addresses (parent_id, level, code, name_en, name_km)
  select id, 'commune', 'KH-120101', 'Tonle Bassac', 'ទន្លេបាសាក់' from district
  on conflict (code) do update set name_en = excluded.name_en
  returning id
)
insert into public.addresses (parent_id, level, code, name_en, name_km)
select id, 'village', 'KH-12010101', 'Village 1', 'ភូមិទី១' from commune
on conflict (code) do update set name_en = excluded.name_en;

insert into public.addresses (level, code, name_en, name_km) values
  ('province', 'KH-02', 'Kampong Cham', 'កំពង់ចាម'),
  ('province', 'KH-03', 'Kampong Chhnang', 'កំពង់ឆ្នាំង'),
  ('province', 'KH-04', 'Kampong Speu', 'កំពង់ស្ពឺ'),
  ('province', 'KH-05', 'Kampong Thom', 'កំពង់ធំ'),
  ('province', 'KH-06', 'Kampot', 'កំពត'),
  ('province', 'KH-07', 'Kandal', 'កណ្តាល'),
  ('province', 'KH-09', 'Kratie', 'ក្រចេះ'),
  ('province', 'KH-10', 'Mondulkiri', 'មណ្ឌលគិរី'),
  ('province', 'KH-14', 'Preah Vihear', 'ព្រះវិហារ'),
  ('province', 'KH-15', 'Prey Veng', 'ព្រៃវែង'),
  ('province', 'KH-17', 'Siem Reap', 'សៀមរាប'),
  ('province', 'KH-18', 'Preah Sihanouk', 'ព្រះសីហនុ'),
  ('province', 'KH-19', 'Stung Treng', 'ស្ទឹងត្រែង'),
  ('province', 'KH-20', 'Svay Rieng', 'ស្វាយរៀង'),
  ('province', 'KH-21', 'Takeo', 'តាកែវ'),
  ('province', 'KH-22', 'Otdar Meanchey', 'ឧត្តរមានជ័យ'),
  ('province', 'KH-23', 'Kep', 'កែប'),
  ('province', 'KH-24', 'Pailin', 'ប៉ៃលិន'),
  ('province', 'KH-25', 'Tboung Khmum', 'ត្បូងឃ្មុំ'),
  ('province', 'KH-01', 'Banteay Meanchey', 'បន្ទាយមានជ័យ'),
  ('province', 'KH-08', 'Koh Kong', 'កោះកុង'),
  ('province', 'KH-11', 'Battambang', 'បាត់ដំបង'),
  ('province', 'KH-13', 'Pursat', 'ពោធិ៍សាត់'),
  ('province', 'KH-16', 'Ratanakiri', 'រតនគិរី')
on conflict (code) do nothing;
