import { useApp } from '../context/AppContext';

export default function QuickNotes() {
  const { quickNotes, setQuickNotes } = useApp();
  
  return (
    <div className="rounded-3xl border border-[#D2BFAF] bg-[#F9F4ED] p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-[#3B2F2F] mb-4">Quick Notes</h3>
      <textarea
        className="w-full min-h-[160px] p-4 rounded-xl border border-[#D2BFAF] bg-white text-[#3B2F2F] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#AD947F] focus:border-transparent transition-all duration-200"
        value={quickNotes}
        onChange={e => setQuickNotes(e.target.value)}
        placeholder="Buy more foil..."
      />
    </div>
  );
}