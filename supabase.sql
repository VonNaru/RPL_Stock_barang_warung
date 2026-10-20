create extension if not exists "pgcrypto";

-- 1. Struktur tabel master barang
create table if not exists public.tabel_barang (
  id_barang uuid primary key default gen_random_uuid(),
  nama_barang text not null,
  stok_saat_ini integer not null default 0 check (stok_saat_ini >= 0),
  stok_minimum integer not null default 0 check (stok_minimum >= 0),
  harga_beli numeric not null default 0 check (harga_beli >= 0),
  harga_jual numeric not null default 0 check (harga_jual >= 0),
  created_at timestamptz not null default now()
);

-- Migration jika tabel_barang sudah ada sebelumnya
alter table public.tabel_barang 
add column if not exists harga_beli numeric not null default 0 check (harga_beli >= 0);

alter table public.tabel_barang 
add column if not exists harga_jual numeric not null default 0 check (harga_jual >= 0);

-- 2. Struktur tabel transaksi stok
create table if not exists public.tabel_transaksi (
  id_transaksi uuid primary key default gen_random_uuid(),
  id_barang uuid not null references public.tabel_barang(id_barang) on delete restrict,
  jenis_transaksi text not null check (jenis_transaksi in ('masuk', 'keluar')),
  jumlah integer not null check (jumlah > 0),
  harga_beli numeric not null default 0 check (harga_beli >= 0),
  harga_jual numeric not null default 0 check (harga_jual >= 0),
  created_at timestamptz not null default now()
);

-- Migration jika tabel_transaksi sudah ada sebelumnya
alter table public.tabel_transaksi 
add column if not exists harga_beli numeric not null default 0 check (harga_beli >= 0);

alter table public.tabel_transaksi 
add column if not exists harga_jual numeric not null default 0 check (harga_jual >= 0);

-- Indexing tabel transaksi
create index if not exists idx_tabel_transaksi_id_barang on public.tabel_transaksi(id_barang);
create index if not exists idx_tabel_transaksi_created_at on public.tabel_transaksi(created_at desc);

-- 3. Stored procedure pemrosesan transaksi & mutasi stok
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
begin
  if p_jumlah <= 0 or p_jenis_transaksi not in ('masuk', 'keluar') then
    raise exception 'DATA_TIDAK_VALID';
  end if;

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

  -- Catat transaksi ke tabel_transaksi
  insert into tabel_transaksi(id_barang, jenis_transaksi, jumlah, harga_beli, harga_jual)
  values (
    p_id_barang,
    p_jenis_transaksi,
    p_jumlah,
    case when p_jenis_transaksi = 'masuk' then v_harga_beli else 0 end,
    case when p_jenis_transaksi = 'keluar' then v_harga_jual else 0 end
  )
  returning * into transaksi;

  return transaksi;
end;
$$;

-- 4. Tabel Pesanan Pelanggan (Pre-Order / Booking)
create table if not exists public.tabel_pesanan (
  id_pesanan uuid primary key default gen_random_uuid(),
  nama_pelanggan text not null,
  id_barang uuid not null references public.tabel_barang(id_barang) on delete cascade,
  jumlah_pesanan integer not null check (jumlah_pesanan > 0),
  status_pesanan text not null default 'Menunggu Stok' check (status_pesanan in ('Menunggu Stok', 'Siap Diambil', 'Selesai', 'Dibatalkan')),
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tabel_pesanan_status_pesanan on public.tabel_pesanan(status_pesanan);
create index if not exists idx_tabel_pesanan_id_barang on public.tabel_pesanan(id_barang);