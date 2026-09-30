export default function StatCard({ icon: Icon, label, value, accent }) {
  return <div className="rounded-2xl border border-[#e1e8e1] bg-white p-5 shadow-sm"><div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon size={19} /></div><p className="text-sm text-slate-500">{label}</p><p className="display mt-1 text-3xl font-bold text-[#17211b]">{value}</p></div>;
}
