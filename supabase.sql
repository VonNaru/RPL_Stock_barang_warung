create extension if not exists "pgcrypto";

-- 1. Struktur tabel pengguna / akun login warung
create table if not exists public.tabel_pengguna (
  id_pengguna uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  nama_lengkap text not null,
  role text not null default 'kasir' check (role in ('admin', 'kasir', 'pemilik')),
  created_at timestamptz not null default now()
);

create index if not exists idx_tabel_pengguna_username on public.tabel_pengguna(username);

-- Akun default untuk login awal (admin / admin123 & kasir / kasir123)
insert into public.tabel_pengguna (username, password, nama_lengkap, role)
values 
  ('admin', 'admin123', 'Administrator Warung', 'admin'),
  ('kasir', 'kasir123', 'Kasir Warung', 'kasir')
on conflict (username) do nothing;

-- 2. Struktur tabel master barang (Multi-Tenant per Pengguna)
create table if not exists public.tabel_barang (
  id_barang uuid primary key default gen_random_uuid(),
  id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade,
  nama_barang text not null,
  stok_saat_ini integer not null default 0 check (stok_saat_ini >= 0),
  stok_minimum integer not null default 0 check (stok_minimum >= 0),
  harga_beli numeric not null default 0 check (harga_beli >= 0),
  harga_jual numeric not null default 0 check (harga_jual >= 0),
  created_at timestamptz not null default now()
);

-- Migration jika tabel_barang sudah ada sebelumnya
alter table public.tabel_barang 
add column if not exists id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade;

alter table public.tabel_barang 
add column if not exists harga_beli numeric not null default 0 check (harga_beli >= 0);

alter table public.tabel_barang 
add column if not exists harga_jual numeric not null default 0 check (harga_jual >= 0);

create index if not exists idx_tabel_barang_id_pengguna on public.tabel_barang(id_pengguna);

-- 3. Struktur tabel transaksi stok (Multi-Tenant per Pengguna)
create table if not exists public.tabel_transaksi (
  id_transaksi uuid primary key default gen_random_uuid(),
  id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade,
  id_barang uuid not null references public.tabel_barang(id_barang) on delete restrict,
  jenis_transaksi text not null check (jenis_transaksi in ('masuk', 'keluar')),
  jumlah integer not null check (jumlah > 0),
  harga_beli numeric not null default 0 check (harga_beli >= 0),
  harga_jual numeric not null default 0 check (harga_jual >= 0),
  created_at timestamptz not null default now()
);

-- Migration jika tabel_transaksi sudah ada sebelumnya
alter table public.tabel_transaksi 
add column if not exists id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade;

alter table public.tabel_transaksi 
add column if not exists harga_beli numeric not null default 0 check (harga_beli >= 0);

alter table public.tabel_transaksi 
add column if not exists harga_jual numeric not null default 0 check (harga_jual >= 0);

create index if not exists idx_tabel_transaksi_id_barang on public.tabel_transaksi(id_barang);
create index if not exists idx_tabel_transaksi_id_pengguna on public.tabel_transaksi(id_pengguna);
create index if not exists idx_tabel_transaksi_created_at on public.tabel_transaksi(created_at desc);

-- 4. Stored procedure pemrosesan transaksi & mutasi stok
drop function if exists public.catat_transaksi_stok(uuid, text, integer);

create or replace function public.catat_transaksi_stok(
  p_id_barang uuid,
  p_jenis_transaksi text,
  p_jumlah integer,
  p_harga_beli numeric default 0,
  p_harga_jual numeric default 0
)
returns public.tabel_transaksi
language plpgsql security definer set search_path = public
as $$
declare
  transaksi public.tabel_transaksi;
  v_harga_beli numeric := coalesce(p_harga_beli, 0);
  v_harga_jual numeric := coalesce(p_harga_jual, 0);
  v_id_pengguna uuid;
begin
  if p_jumlah <= 0 or p_jenis_transaksi not in ('masuk', 'keluar') then
    raise exception 'DATA_TIDAK_VALID';
  end if;

  -- Dapatkan id_pengguna pemilik barang
  select id_pengguna into v_id_pengguna from tabel_barang where id_barang = p_id_barang;

  if p_jenis_transaksi = 'masuk' then
    -- Jika harga beli tidak diinput baru saat restok, pakai harga beli dari master barang
    if v_harga_beli = 0 then
      select coalesce(harga_beli, 0) into v_harga_beli from tabel_barang where id_barang = p_id_barang;
    end if;

    -- Update stok dan perbarui harga beli/jual di master jika ada nilai baru (> 0)
    update tabel_barang
    set stok_saat_ini = stok_saat_ini + p_jumlah,
        harga_beli = case when coalesce(p_harga_beli, 0) > 0 then p_harga_beli else harga_beli end,
        harga_jual = case when coalesce(p_harga_jual, 0) > 0 then p_harga_jual else harga_jual end
    where id_barang = p_id_barang;
  else
    -- Untuk transaksi keluar, jika harga jual tidak diinput khusus, gunakan harga jual dari master barang
    if v_harga_jual = 0 then
      select coalesce(harga_jual, 0) into v_harga_jual from tabel_barang where id_barang = p_id_barang;
    end if;

    -- Update pengurangan stok dengan validasi proteksi stok tidak minus
    update tabel_barang
    set stok_saat_ini = stok_saat_ini - p_jumlah
    where id_barang = p_id_barang and stok_saat_ini >= p_jumlah;
  end if;

  if not found then 
    raise exception 'STOK_TIDAK_CUKUP'; 
  end if;

  -- Catat transaksi ke tabel_transaksi dengan id_pengguna yang sesuai
  insert into tabel_transaksi(id_barang, jenis_transaksi, jumlah, harga_beli, harga_jual, id_pengguna)
  values (
    p_id_barang,
    p_jenis_transaksi,
    p_jumlah,
    case when p_jenis_transaksi = 'masuk' then v_harga_beli else 0 end,
    case when p_jenis_transaksi = 'keluar' then v_harga_jual else 0 end,
    v_id_pengguna
  )
  returning * into transaksi;

  return transaksi;
end;
$$;

-- 5. Tabel Pesanan Pelanggan (Multi-Tenant per Pengguna)
create table if not exists public.tabel_pesanan (
  id_pesanan uuid primary key default gen_random_uuid(),
  id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade,
  nama_pelanggan text not null,
  id_barang uuid not null references public.tabel_barang(id_barang) on delete cascade,
  jumlah_pesanan integer not null check (jumlah_pesanan > 0),
  status_pesanan text not null default 'Menunggu Stok' check (status_pesanan in ('Menunggu Stok', 'Siap Diambil', 'Selesai', 'Dibatalkan')),
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pastikan kolom id_pengguna sudah ada di seluruh tabel (aman dijalankan berulang)
alter table public.tabel_barang 
add column if not exists id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade;

alter table public.tabel_transaksi 
add column if not exists id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade;

alter table public.tabel_pesanan 
add column if not exists id_pengguna uuid references public.tabel_pengguna(id_pengguna) on delete cascade;

create index if not exists idx_tabel_barang_id_pengguna on public.tabel_barang(id_pengguna);
create index if not exists idx_tabel_transaksi_id_pengguna on public.tabel_transaksi(id_pengguna);
create index if not exists idx_tabel_pesanan_id_pengguna on public.tabel_pesanan(id_pengguna);
create index if not exists idx_tabel_pesanan_status_pesanan on public.tabel_pesanan(status_pesanan);
create index if not exists idx_tabel_pesanan_id_barang on public.tabel_pesanan(id_barang);

-- 6. Migrasi data lama & Seed contoh barang terpisah (Admin vs Kasir)

-- Kaitkan data lama yang belum memiliki id_pengguna ke akun admin
update public.tabel_barang 
set id_pengguna = (select id_pengguna from public.tabel_pengguna where username = 'admin' limit 1)
where id_pengguna is null;

update public.tabel_transaksi 
set id_pengguna = (select id_pengguna from public.tabel_pengguna where username = 'admin' limit 1)
where id_pengguna is null;

update public.tabel_pesanan 
set id_pengguna = (select id_pengguna from public.tabel_pengguna where username = 'admin' limit 1)
where id_pengguna is null;

-- Contoh barang untuk Toko Admin
insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Beras Maknyuss 5kg (Toko Admin)', 25, 5, 65000, 72000, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'admin'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna
  );

insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Minyak Goreng Bimoli 2L (Toko Admin)', 12, 4, 32000, 36000, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'admin'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna and b.nama_barang like '%Minyak%'
  );

insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Gula Pasir Gulaku 1kg (Toko Admin)', 3, 5, 15000, 17500, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'admin'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna and b.nama_barang like '%Gula%'
  );

-- Contoh barang untuk Toko Kasir (berbeda total)
insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Indomie Goreng Dus (Toko Kasir)', 18, 3, 115000, 125000, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'kasir'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna
  );

insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Kopi Kapal Api Dus (Toko Kasir)', 10, 2, 85000, 95000, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'kasir'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna and b.nama_barang like '%Kopi%'
  );

insert into public.tabel_barang (nama_barang, stok_saat_ini, stok_minimum, harga_beli, harga_jual, id_pengguna)
select 'Teh Celup Sariwangi (Toko Kasir)', 2, 5, 6000, 7500, p.id_pengguna
from public.tabel_pengguna p
where p.username = 'kasir'
  and not exists (
    select 1 from public.tabel_barang b where b.id_pengguna = p.id_pengguna and b.nama_barang like '%Teh%'
  );
