create extension if not exists "pgcrypto";

create table if not exists public.tabel_barang (
  id_barang uuid primary key default gen_random_uuid(),
  nama_barang text not null,
  stok_saat_ini integer not null default 0 check (stok_saat_ini >= 0),
  stok_minimum integer not null default 0 check (stok_minimum >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.tabel_transaksi (
  id_transaksi uuid primary key default gen_random_uuid(),
  id_barang uuid not null references public.tabel_barang(id_barang) on delete restrict,
  jenis_transaksi text not null check (jenis_transaksi in ('masuk', 'keluar')),
  jumlah integer not null check (jumlah > 0),
  created_at timestamptz not null default now()
);

create or replace function public.catat_transaksi_stok(p_id_barang uuid, p_jenis_transaksi text, p_jumlah integer)
returns public.tabel_transaksi
language plpgsql security definer set search_path = public
as $$
declare
  transaksi public.tabel_transaksi;
begin
  if p_jumlah <= 0 or p_jenis_transaksi not in ('masuk', 'keluar') then
    raise exception 'DATA_TIDAK_VALID';
  end if;
  update tabel_barang
  set stok_saat_ini = stok_saat_ini + case when p_jenis_transaksi = 'masuk' then p_jumlah else -p_jumlah end
  where id_barang = p_id_barang and (p_jenis_transaksi = 'masuk' or stok_saat_ini >= p_jumlah);
  if not found then raise exception 'STOK_TIDAK_CUKUP'; end if;
  insert into tabel_transaksi(id_barang, jenis_transaksi, jumlah)
  values (p_id_barang, p_jenis_transaksi, p_jumlah)
  returning * into transaksi;
  return transaksi;
end;
$$;