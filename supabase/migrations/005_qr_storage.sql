-- Public bucket for QR code images
insert into storage.buckets (id, name, public)
values ('qr-codes', 'qr-codes', true)
on conflict (id) do nothing;

-- Allow anyone to read QR codes (they're public by design)
create policy "Public read qr-codes"
  on storage.objects for select
  using (bucket_id = 'qr-codes');

-- Allow service role to upload QR codes
create policy "Service role upload qr-codes"
  on storage.objects for insert
  with check (bucket_id = 'qr-codes');
