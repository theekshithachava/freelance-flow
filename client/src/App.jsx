import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, CreditCard, Sparkles, Bot, Bell, LogOut, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
// API helper: attaches the JWT from localStorage
const api = (p, o = {}) => fetch('/api' + p, { method: o.method || (o.body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.token }, body: o.body && JSON.stringify(o.body) }).then(r => r.json());
const inr = n => '₹' + (n || 0).toLocaleString('en-IN');
const Card = ({ children, className = '' }) => <div className={`rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-5 ${className}`}>{children}</div>;
const HC = { 'On Track': 'bg-emerald-100 text-emerald-700', 'At Risk': 'bg-amber-100 text-amber-700', Critical: 'bg-red-100 text-red-700' };
const Badge = ({ h }) => <span className={`text-xs px-2 py-1 rounded-full font-medium ${HC[h] || 'bg-slate-100 text-slate-600'}`}>{{ 'On Track': '🟢', 'At Risk': '🟡', Critical: '🔴' }[h]} {h}</span>;
const Bar = ({ v }) => <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: v + '%' }} /></div>;
const inp = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm';
const btn = 'rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90';

function Login({ onAuth }) {
  const [f, setF] = useState({ email: 'demo@freelanceflow.dev', password: 'demo123' }), [reg, setReg] = useState(false), [err, setErr] = useState('');
  const go = async () => { const r = await api('/auth/' + (reg ? 'register' : 'login'), { body: f }); if (r.token) { localStorage.token = r.token; localStorage.name = r.user.name; onAuth(); } else setErr(r.error); };
  return <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-600 to-purple-700 p-4"><Card className="w-full max-w-sm space-y-3">
    <h1 className="text-2xl font-bold">Freelance<span className="text-purple-600">Flow</span></h1><p className="text-sm text-slate-500">Demo: demo@freelanceflow.dev / demo123</p>
    {reg && <input className={inp} placeholder="Name" onChange={e => setF({ ...f, name: e.target.value })} />}
    <input className={inp} placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    <input className={inp} type="password" placeholder="Password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
    {reg && <input className={inp} placeholder="Skill (e.g. Designer)" onChange={e => setF({ ...f, skill: e.target.value })} />}
    {err && <p className="text-red-500 text-sm">{err}</p>}<button className={btn + ' w-full'} onClick={go}>{reg ? 'Create account' : 'Sign in'}</button>
    <button className="text-sm text-purple-600" onClick={() => setReg(!reg)}>{reg ? 'Have an account? Sign in' : 'New here? Register'}</button></Card></div>;
}
function Dashboard() {
  const [d, setD] = useState(); useEffect(() => { api('/dashboard').then(setD); }, []);
  if (!d) return <div className="animate-pulse h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />;
  const S = [['Active Projects', d.active], ['Clients', d.clients], ['Due Soon', d.dueSoon], ['Revenue', inr(d.received)], ['Pending', inr(d.pending)], ['Productivity', d.productivity + '/100']];
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Good morning, {localStorage.name} 👋</h1><p className="text-slate-500">Here's what's happening with your freelance business.</p></div>
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">{S.map(([k, v]) => <Card key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-xl font-bold mt-1">{v}</p></Card>)}</div>
    <div className="grid lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><h2 className="font-semibold mb-3">Project Health</h2><div className="space-y-4">{d.projects.map(p => <div key={p._id}>
      <div className="flex justify-between items-center"><span className="font-medium">{p.name} <span className="text-slate-400 text-sm">· {p.client?.name}</span></span><Badge h={p.health} /></div>
      <Bar v={p.progress} /><p className="text-xs text-slate-500 mt-1">{p.progress}% · Due {new Date(p.deadline).toLocaleDateString()} · Est. {new Date(p.estimated).toLocaleDateString()} · Risk {p.risk}%</p></div>)}</div></Card>
      <Card><h2 className="font-semibold mb-3">Recent Activity</h2>{d.activity.map(a => <p key={a._id} className="text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">{a.text}</p>)}</Card></div>
    <Card><h2 className="font-semibold mb-3">Revenue</h2><div className="h-56"><ResponsiveContainer><AreaChart data={d.chart}><XAxis dataKey="month" /><Tooltip /><Area dataKey="revenue" stroke="#7c3aed" fill="#a78bfa55" /></AreaChart></ResponsiveContainer></div></Card></div>;
}
function Projects() {
  const [ps, setPs] = useState([]), [r, setR] = useState({}); const load = () => api('/projects/overview').then(setPs); useEffect(() => { load(); }, []);
  const recalc = async p => setR({ ...r, [p._id]: await api('/ai/risk-analysis', { body: { projectId: p._id } }) });
  return <div className="grid md:grid-cols-2 gap-4">{ps.map(p => { const a = r[p._id] || p; return <Card key={p._id} className="space-y-2">
    <div className="flex justify-between"><h3 className="font-semibold">{p.name}</h3><Badge h={a.health} /></div><p className="text-sm text-slate-500">{p.client?.name} · {inr(p.budget)} · {p.tasks} tasks</p><Bar v={a.progress} />
    <p className="text-sm">Delay risk <b>{a.risk}%</b> — {a.message}</p><ol className="text-xs text-slate-500 list-decimal ml-4">{a.actions.map(x => <li key={x}>{x}</li>)}</ol>
    <button className={btn} onClick={() => recalc(p)}>Recalculate Risk</button></Card>; })}</div>;
}
function Tasks() {
  const cols = ['To Do', 'In Progress', 'Review', 'Completed'], [ts, setTs] = useState([]); useEffect(() => { api('/tasks').then(setTs); }, []);
  const drop = async (e, status) => { const id = e.dataTransfer.getData('id'); setTs(ts.map(t => t._id === id ? { ...t, status } : t)); api('/tasks/' + id, { method: 'PUT', body: { status } }); };
  const PC = { Critical: 'text-red-600', High: 'text-orange-500', Medium: 'text-blue-500', Low: 'text-slate-400' };
  return <div className="grid md:grid-cols-4 gap-3">{cols.map(c => <div key={c} onDragOver={e => e.preventDefault()} onDrop={e => drop(e, c)} className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 min-h-[200px]">
    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">{c}</h3><div className="space-y-2">{ts.filter(t => t.status === c).map(t => <div key={t._id} draggable onDragStart={e => e.dataTransfer.setData('id', t._id)} className="cursor-grab rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm">
      <p className="font-medium text-sm">{t.title}</p><p className="text-xs text-slate-500">{t.project?.name}</p><p className="text-xs mt-1"><span className={PC[t.priority]}>● {t.priority}</span> · {t.hours}h · {new Date(t.deadline).toLocaleDateString()}</p></div>)}</div></div>)}</div>;
}
function Planner({ go }) {
  const [f, setF] = useState({ name: '', description: 'I need to build an e-commerce website for a clothing company in 30 days.', client: '', budget: 50000, days: 30 }), [cl, setCl] = useState([]), [ph, setPh] = useState();
  useEffect(() => { api('/clients').then(c => { setCl(c); setF(x => ({ ...x, client: c[0]?._id })); }); }, []);
  const edit = (i, j, k, v) => setPh(ph.map((p, a) => a !== i ? p : { ...p, tasks: p.tasks.map((t, b) => b === j ? { ...t, [k]: v } : t) }));
  const save = async () => { const all = ph.flatMap(p => p.tasks).map(t => t.deadline).sort(); await api('/ai/save-plan', { body: { ...f, deadline: all.at(-1), phases: ph } }); go('Projects'); };
  return <div className="space-y-4"><Card className="grid md:grid-cols-2 gap-3">
    <input className={inp} placeholder="Project name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    <select className={inp} value={f.client} onChange={e => setF({ ...f, client: e.target.value })}>{cl.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
    <textarea className={inp + ' md:col-span-2'} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    <input className={inp} type="number" value={f.budget} onChange={e => setF({ ...f, budget: +e.target.value })} /><input className={inp} type="number" value={f.days} onChange={e => setF({ ...f, days: +e.target.value })} />
    <button className={btn + ' md:col-span-2'} onClick={async () => setPh((await api('/ai/generate-project-plan', { body: f })).phases)}>✨ Generate Project Plan</button></Card>
    {ph && <>{ph.map((p, i) => <Card key={p.phase}><h3 className="font-semibold mb-2">PHASE {i + 1} — {p.phase}</h3>{p.tasks.map((t, j) => <div key={j} className="flex gap-2 mb-2">
      <input className={inp} value={t.title} onChange={e => edit(i, j, 'title', e.target.value)} /><input className={inp + ' !w-40'} type="date" value={t.deadline} onChange={e => edit(i, j, 'deadline', e.target.value)} />
      <button onClick={() => setPh(ph.map((x, a) => a === i ? { ...x, tasks: x.tasks.filter((_, b) => b !== j) } : x))}><Trash2 size={16} /></button></div>)}
      <button className="text-sm text-purple-600 flex gap-1 items-center" onClick={() => setPh(ph.map((x, a) => a === i ? { ...x, tasks: [...x.tasks, { title: 'New task', priority: 'Medium', hours: 4, deadline: x.tasks.at(-1)?.deadline }] } : x))}><Plus size={14} />Add task</button></Card>)}
      <button className={btn} onClick={save}>Save Project Plan</button></>}</div>;
}
function Assistant() {
  const [m, setM] = useState([{ r: 'ai', t: 'Hi! Ask about risks, pending payments, or what to focus on.' }]), [q, setQ] = useState(''), [mt, setMt] = useState({ type: 'Deadline Delay', reason: 'Payment gateway requires additional testing.' }), [txt, setTxt] = useState('');
  const send = async () => { const s = q; setQ(''); setM(x => [...x, { r: 'me', t: s }]); const a = await api('/ai/chat', { body: { message: s } }); setM(x => [...x, { r: 'ai', t: a.reply }]); };
  const gen = async () => setTxt((await api('/ai/generate-message', { body: { ...mt, name: 'Rahul' } })).text);
  return <div className="grid lg:grid-cols-2 gap-4"><Card className="space-y-2"><div className="space-y-2 h-80 overflow-y-auto">{m.map((x, i) => <p key={i} className={`text-sm p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${x.r === 'me' ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{x.t}</p>)}</div>
    <div className="flex gap-2"><input className={inp} value={q} placeholder="Which project should I focus on today?" onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} /><button className={btn} onClick={send}>Send</button></div></Card>
    <Card className="space-y-2"><h3 className="font-semibold">AI Client Message</h3><select className={inp} value={mt.type} onChange={e => setMt({ ...mt, type: e.target.value })}>{['Project Update', 'Deadline Delay', 'Payment Reminder', 'Milestone Completed', 'Meeting Request', 'Project Completion'].map(t => <option key={t}>{t}</option>)}</select>
      <input className={inp} value={mt.reason} onChange={e => setMt({ ...mt, reason: e.target.value })} /><button className={btn} onClick={gen}>{txt ? 'Regenerate' : 'Generate'}</button>
      {txt && <><textarea className={inp + ' h-48'} value={txt} onChange={e => setTxt(e.target.value)} /><button className="text-sm text-purple-600" onClick={() => navigator.clipboard.writeText(txt)}>Copy</button></>}</Card></div>;
}
function Payments() {
  const [p, setP] = useState([]); const load = () => api('/payments').then(setP); useEffect(() => { load(); }, []);
  const tot = s => p.filter(x => s.includes(x.status)).reduce((a, x) => a + x.amount, 0);
  return <div className="space-y-4"><div className="grid grid-cols-3 gap-3">{[['Received', ['Paid']], ['Pending', ['Pending', 'Partially Paid']], ['Overdue', ['Overdue']]].map(([k, s]) => <Card key={k}><p className="text-xs text-slate-500">{k}</p><p className={`text-xl font-bold ${k === 'Overdue' ? 'text-red-600' : ''}`}>{inr(tot(s))}</p></Card>)}</div>
    <Card className="overflow-x-auto"><table className="w-full text-sm"><tbody>{p.map(x => <tr key={x._id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-2">{x.client?.name}</td><td>{x.project?.name}</td><td>{inr(x.amount)}</td><td>{new Date(x.due).toLocaleDateString()}</td><td>{x.status}</td>
      <td>{x.status !== 'Paid' && <button className="text-purple-600" onClick={async () => { await api('/payments/' + x._id, { method: 'PUT', body: { status: 'Paid' } }); load(); }}>Mark paid</button>}</td></tr>)}</tbody></table></Card></div>;
}
function Clients() {
  const [c, setC] = useState([]), [s, setS] = useState(''), [n, setN] = useState(''); const load = () => api('/clients').then(setC); useEffect(() => { load(); }, []);
  return <div className="space-y-4"><div className="flex gap-2"><input className={inp} placeholder="Search clients" onChange={e => setS(e.target.value)} /><input className={inp} placeholder="New client name" value={n} onChange={e => setN(e.target.value)} />
    <button className={btn} onClick={async () => { await api('/clients', { body: { name: n } }); setN(''); load(); }}>Add</button></div>
    <div className="grid md:grid-cols-3 gap-3">{c.filter(x => x.name.toLowerCase().includes(s.toLowerCase())).map(x => <Card key={x._id}><p className="font-semibold">{x.name}</p><p className="text-sm text-slate-500">{x.company} · {x.email}</p>
      <button className="text-sm text-red-500 mt-2" onClick={async () => { if (confirm('Delete client?')) { await api('/clients/' + x._id, { method: 'DELETE' }); load(); } }}>Delete</button></Card>)}</div></div>;
}
function Notifs() {
  const [n, setN] = useState([]); useEffect(() => { api('/notifications').then(setN); }, []);
  return <div className="space-y-2">{n.map(x => <Card key={x._id} className={x.read ? 'opacity-60' : 'border-l-4 !border-l-purple-500'}><div className="flex justify-between"><div><p className="font-medium">{x.type}</p><p className="text-sm text-slate-500">{x.text}</p></div>
    {!x.read && <button className="text-sm text-purple-600" onClick={async () => { await api(`/notifications/${x._id}/read`, { method: 'PUT', body: {} }); setN(n.map(y => y._id === x._id ? { ...y, read: true } : y)); }}>Mark read</button>}</div></Card>)}</div>;
}
const NAV = [['Dashboard', LayoutDashboard, Dashboard], ['Clients', Users, Clients], ['Projects', FolderKanban, Projects], ['Tasks', CheckSquare, Tasks], ['Payments', CreditCard, Payments], ['AI Planner', Sparkles, Planner], ['AI Assistant', Bot, Assistant], ['Notifications', Bell, Notifs]];
export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.token), [page, setPage] = useState('Dashboard'), [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  if (!authed) return <Login onAuth={() => setAuthed(true)} />;
  const Page = NAV.find(n => n[0] === page)[2];
  return <div className="min-h-screen flex flex-col md:flex-row"><nav className="md:w-60 md:min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-3 flex md:flex-col gap-1 overflow-x-auto">
    <h1 className="hidden md:block text-xl font-bold px-3 py-2">Freelance<span className="text-purple-600">Flow</span></h1>
    {NAV.map(([k, I]) => <button key={k} onClick={() => setPage(k)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap ${page === k ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}><I size={16} />{k}</button>)}
    <div className="md:mt-auto flex md:flex-col gap-1"><p className="hidden md:block px-3 text-xs text-slate-500">🟢 Online · {localStorage.name}</p>
      <button className="flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setDark(!dark)}>{dark ? <Sun size={16} /> : <Moon size={16} />}Theme</button>
      <button className="flex items-center gap-2 px-3 py-2 text-sm" onClick={() => { localStorage.clear(); setAuthed(false); }}><LogOut size={16} />Logout</button></div></nav>
    <main className="flex-1 p-4 md:p-8 max-w-6xl"><Page go={setPage} /></main></div>;
}
