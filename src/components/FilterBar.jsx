import { useApp } from '../context/AppContext';

export default function FilterBar() {
  const { view, setView, serviceFilter, setServiceFilter } = useApp();
  const services = ['All', 'Haircut', 'Color', 'Highlights', 'BlowDry', 'Treatment', 'Other'];

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="btn-group">
        <button className={`btn ${view==='day'?'btn-primary':''}`} onClick={()=>setView('day')}>Day</button>
        <button className={`btn ${view==='week'?'btn-primary':''}`} onClick={()=>setView('week')}>Week</button>
        <button className={`btn ${view==='month'?'btn-primary':''}`} onClick={()=>setView('month')}>Month</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Service</span>
        <select className="select select-bordered" value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)}>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
