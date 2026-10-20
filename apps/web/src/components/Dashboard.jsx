import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Receipt,
  TrendingUp,
} from "lucide-react";
import StatCard from "./StatCard";
import { formatRupiah } from "../utils/format";

export default function Dashboard({ lowStock, barang, transactions, stats }) {
  const totalKuantitasMasuk =
    stats?.totalKuantitasMasuk ??
    transactions
      .filter((item) => item.jenis_transaksi === "masuk")
      .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  const totalKuantitasKeluar =
    stats?.totalKuantitasKeluar ??
    transactions
      .filter((item) => item.jenis_transaksi === "keluar")
      .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  const totalPengeluaranKulakan =
    stats?.totalPengeluaranKulakan ??
    transactions
      .filter((item) => item.jenis_transaksi === "masuk")
      .reduce(
        (sum, item) =>
          sum + (Number(item.jumlah) || 0) * (Number(item.harga_beli) || 0),
        0,
      );

  const totalOmzetPenjualan =
    stats?.totalOmzetPenjualan ??
    transactions
      .filter((item) => item.jenis_transaksi === "keluar")
      .reduce(
        (sum, item) =>
          sum + (Number(item.jumlah) || 0) * (Number(item.harga_jual) || 0),
        0,
      );

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-500">Selamat datang kembali,</p>
        <h2 className="display mt-1 text-3xl font-bold">
          Pantau warungmu hari ini.
        </h2>
      </div>

      {/* 4 StatCard Utama: Arus Barang & Finansial */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ArrowDownToLine}
          label="Total Item Masuk"
          value={`${totalKuantitasMasuk.toLocaleString("id-ID")} unit`}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={ArrowUpFromLine}
          label="Total Item Keluar"
          value={`${totalKuantitasKeluar.toLocaleString("id-ID")} unit`}
          accent="bg-orange-100 text-orange-700"
        />
        <StatCard
          icon={Receipt}
          label="Total Pengeluaran Kulakan"
          value={formatRupiah(totalPengeluaranKulakan)}
          accent="bg-rose-100 text-rose-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Omzet Penjualan"
          value={formatRupiah(totalOmzetPenjualan)}
          accent="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* Ringkasan Master & Frekuensi Transaksi */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Boxes}
          label="Total Master Barang"
          value={`${barang.length} item`}
          accent="bg-slate-100 text-slate-700"
        />
        <StatCard
          icon={ArrowDownToLine}
          label="Frekuensi Transaksi Masuk"
          value={`${transactions.filter((item) => item.jenis_transaksi === "masuk").length} kali`}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={ArrowUpFromLine}
          label="Frekuensi Transaksi Keluar"
          value={`${transactions.filter((item) => item.jenis_transaksi === "keluar").length} kali`}
          accent="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Peringatan Stok Minimum */}
      <section className="mt-8 rounded-2xl border border-red-100 bg-[#fffaf8] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle size={21} />
          </div>
          <div>
            <h3 className="display text-lg font-bold">Perlu perhatian</h3>
            <p className="mt-1 text-sm text-slate-500">
              {lowStock.length
                ? `${lowStock.length} barang menyentuh batas stok minimum.`
                : "Semua stok berada di atas batas minimum."}
            </p>
          </div>
        </div>
        {lowStock.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((item) => (
              <div
                key={item.id_barang}
                className="flex items-center justify-between rounded-xl border border-red-100 bg-white p-4"
              >
                <div>
                  <span className="font-semibold">{item.nama_barang}</span>
                  <p className="text-xs text-slate-400">
                    Beli: {formatRupiah(item.harga_beli)} &bull; Jual:{" "}
                    {formatRupiah(item.harga_jual)}
                  </p>
                </div>
                <span className="rounded-lg bg-red-50 px-2 py-1 text-sm font-bold text-red-600">
                  {item.stok_saat_ini} / {item.stok_minimum}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
