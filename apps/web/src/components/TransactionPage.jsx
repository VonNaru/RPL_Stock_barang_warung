import { useEffect } from "react";
import { PackagePlus } from "lucide-react";
import { formatRupiah } from "../utils/format";

export default function TransactionPage({
  barang,
  transaction,
  setTransaction,
  onSubmit,
}) {
  const selectedBarang = barang.find(
    (item) => item.id_barang === transaction.id_barang,
  );

  // Otomatis sinkronkan harga jual jika transaksi keluar dan belum terisi
  useEffect(() => {
    if (transaction.jenis_transaksi === "keluar" && selectedBarang) {
      if (
        transaction.harga_jual === undefined ||
        transaction.harga_jual === ""
      ) {
        setTransaction((prev) => ({
          ...prev,
          harga_jual: selectedBarang.harga_jual ?? 0,
        }));
      }
    }
  }, [transaction.jenis_transaksi, transaction.id_barang, selectedBarang]);

  const handleBarangChange = (id) => {
    const item = barang.find((b) => b.id_barang === id);
    if (transaction.jenis_transaksi === "keluar") {
      setTransaction({
        ...transaction,
        id_barang: id,
        harga_jual: item ? item.harga_jual ?? 0 : 0,
        harga_beli: 0,
      });
    } else {
      setTransaction({
        ...transaction,
        id_barang: id,
        harga_beli: "",
        harga_jual: "",
      });
    }
  };

  const handleJenisChange = (jenis) => {
    if (jenis === "keluar") {
      setTransaction({
        ...transaction,
        jenis_transaksi: jenis,
        harga_jual: selectedBarang ? selectedBarang.harga_jual ?? 0 : 0,
        harga_beli: 0,
      });
    } else {
      setTransaction({
        ...transaction,
        jenis_transaksi: jenis,
        harga_beli: "",
        harga_jual: "",
      });
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-slate-500">Catat pergerakan persediaan</p>
      <h2 className="display mt-1 text-3xl font-bold">Transaksi stok</h2>
      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-[#e1e8e1] bg-white p-6 shadow-sm md:p-8"
      >
        <label className="block text-sm font-semibold">
          Pilih barang
          <select
            required
            value={transaction.id_barang}
            onChange={(event) => handleBarangChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="">Pilih barang...</option>
            {barang.map((item) => (
              <option key={item.id_barang} value={item.id_barang}>
                {item.nama_barang} (stok: {item.stok_saat_ini} | Jual:{" "}
                {formatRupiah(item.harga_jual)})
              </option>
            ))}
          </select>
        </label>

        {selectedBarang && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold">{selectedBarang.nama_barang}</span>{" "}
            &bull; Stok: <span className="font-bold">{selectedBarang.stok_saat_ini}</span>{" "}
            &bull; Harga Beli:{" "}
            <span className="font-semibold">
              {formatRupiah(selectedBarang.harga_beli)}
            </span>{" "}
            &bull; Harga Jual:{" "}
            <span className="font-semibold text-emerald-700">
              {formatRupiah(selectedBarang.harga_jual)}
            </span>
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Jenis transaksi
            <select
              value={transaction.jenis_transaksi}
              onChange={(event) => handleJenisChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="masuk">Barang masuk (Restok / Kulakan)</option>
              <option value="keluar">Barang keluar (Penjualan / Omzet)</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Jumlah
            <input
              required
              min="1"
              type="number"
              value={transaction.jumlah}
              onChange={(event) =>
                setTransaction({
                  ...transaction,
                  jumlah: Number(event.target.value),
                })
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
        </div>

        {/* Input Dinamis Berdasarkan Jenis Transaksi */}
        {transaction.jenis_transaksi === "masuk" ? (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Pembaruan Harga Kulakan & Jual (Opsional)
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Isi jika harga beli kulakan atau harga jual mengalami perubahan.
              Master barang akan otomatis diperbarui. Kosongkan jika harga tetap.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Harga Beli Baru / Dus
                <input
                  type="number"
                  min="0"
                  placeholder={
                    selectedBarang
                      ? `Saat ini: ${formatRupiah(selectedBarang.harga_beli)}`
                      : "0"
                  }
                  value={transaction.harga_beli ?? ""}
                  onChange={(event) =>
                    setTransaction({
                      ...transaction,
                      harga_beli:
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Harga Jual Baru / Dus
                <input
                  type="number"
                  min="0"
                  placeholder={
                    selectedBarang
                      ? `Saat ini: ${formatRupiah(selectedBarang.harga_jual)}`
                      : "0"
                  }
                  value={transaction.harga_jual ?? ""}
                  onChange={(event) =>
                    setTransaction({
                      ...transaction,
                      harga_jual:
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
            <label className="block text-sm font-semibold text-slate-700">
              Harga Jual / Dus (Pencatatan Omzet)
              <input
                required
                type="number"
                min="0"
                value={transaction.harga_jual ?? ""}
                onChange={(event) =>
                  setTransaction({
                    ...transaction,
                    harga_jual:
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <p className="mt-1.5 text-xs text-slate-500">
              Otomatis terisi dari master barang (
              {formatRupiah(selectedBarang?.harga_jual || 0)}). Anda dapat
              mengubahnya jika terdapat diskon khusus atau penyesuaian harga.
            </p>
          </div>
        )}

        <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f2a] px-5 py-3 font-bold text-white hover:bg-[#0e2d1d]">
          <PackagePlus size={18} /> Simpan transaksi
        </button>
      </form>
    </div>
  );
}
