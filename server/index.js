import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs';
const { Schema } = mongoose, R = r => ({ type: Schema.Types.ObjectId, ref: r });
const M = (n, f) => mongoose.model(n, new Schema(f, { timestamps: true }));
// ---------- MODELS (User→Clients→Projects→Tasks/Milestones/Payments/Invoices) ----------
const User = M('User', { name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'freelancer' }, skill: String, avatar: String });
const Client = M('Client', { user: R('User'), name: String, email: String, phone: String, company: String, address: String, notes: String });
const Project = M('Project', { user: R('User'), client: R('Client'), name: String, description: String, budget: Number, start: { type: Date, default: Date.now }, deadline: Date, status: { type: String, default: 'Planning' } });
const Task = M('Task', { user: R('User'), project: R('Project'), title: String, priority: { type: String, default: 'Medium' }, status: { type: String, default: 'To Do' }, deadline: Date, hours: { type: Number, default: 4 }, assignee: String });
const Milestone = M('Milestone', { project: R('Project'), title: String, due: Date, status: { type: String, default: 'Pending' } });
const Payment = M('Payment', { user: R('User'), client: R('Client'), project: R('Project'), amount: Number, due: Date, status: { type: String, default: 'Pending' }, method: String, reference: String, notes: String });
const Invoice = M('Invoice', { user: R('User'), client: R('Client'), project: R('Project'), number: String, items: [{ desc: String, qty: Number, rate: Number }], tax: Number, discount: Number, due: Date, status: { type: String, default: 'Unpaid' } });
const Notification = M('Notification', { user: R('User'), type: String, text: String, read: { type: Boolean, default: false } });
M('Message', { from: R('User'), to: R('User'), text: String });
const Activity = M('Activity', { user: R('User'), text: String });

const app = express(); app.use(cors(), express.json());
const h = f => (q, s, n) => f(q, s, n).catch(e => s.status(400).json({ error: e.message }));
const SECRET = process.env.JWT_SECRET || 'dev';
const auth = (q, s, n) => { try { q.user = jwt.verify((q.headers.authorization || '').slice(7), SECRET); n(); } catch { s.status(401).json({ error: 'Unauthorized' }); } };
const sign = u => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '7d' });
// ---------- AUTH ----------
app.post('/api/auth/register', h(async (q, s) => { const u = await User.create({ ...q.body, password: await bcrypt.hash(q.body.password, 10) }); s.json({ token: sign(u), user: { name: u.name, role: u.role } }); }));
app.post('/api/auth/login', h(async (q, s) => { const u = await User.findOne({ email: q.body.email }); if (!u || !await bcrypt.compare(q.body.password, u.password)) throw new Error('Invalid credentials'); s.json({ token: sign(u), user: { name: u.name, role: u.role } }); }));
// ---------- AI DEADLINE RISK PREDICTOR (heuristic: remaining hours vs days left, weighted by high-priority tasks) ----------
const analyze = async p => {
  const t = await Task.find({ project: p._id }), open = t.filter(x => x.status !== 'Completed');
  const hi = open.filter(x => ['High', 'Critical'].includes(x.priority)).length;
  const need = Math.ceil(open.reduce((a, x) => a + x.hours, 0) / 5), left = Math.max(1, Math.ceil((p.deadline - Date.now()) / 864e5));
  const risk = open.length ? Math.min(99, Math.max(3, Math.round((need / left - .4) * 70 + hi * 3))) : 0, delay = Math.max(0, need - left);
  return { progress: t.length ? Math.round(100 * (t.length - open.length) / t.length) : 0, tasks: t.length, open: open.length, hi, risk, delay, left,
    health: risk > 60 ? 'Critical' : risk > 30 ? 'At Risk' : 'On Track', estimated: new Date(Date.now() + need * 864e5),
    message: delay ? `May miss the deadline by ~${delay} days because ${hi} high-priority tasks remain incomplete.` : `On pace: ${open.length} tasks left, ${left} days remaining.`,
    actions: hi ? ['Prioritize high-priority tasks first', 'Run testing in parallel with development', 'Request client feedback today'] : ['Keep current pace', 'Send a progress update to the client'] };
};
const overview = async u => Promise.all((await Project.find({ user: u }).populate('client')).map(async p => ({ ...p.toObject(), ...await analyze(p) })));
app.get('/api/projects/overview', auth, h(async (q, s) => s.json(await overview(q.user.id))));
app.get('/api/dashboard', auth, h(async (q, s) => {
  const u = q.user.id, [pr, c, pay, t] = await Promise.all([overview(u), Client.countDocuments({ user: u }), Payment.find({ user: u }), Task.find({ user: u })]);
  const sum = f => pay.filter(f).reduce((a, x) => a + x.amount, 0), m = {};
  pay.filter(x => x.status === 'Paid').forEach(x => { const k = x.due.toLocaleString('en', { month: 'short' }); m[k] = (m[k] || 0) + x.amount; });
  const done = t.filter(x => x.status === 'Completed').length;
  s.json({ projects: pr, clients: c, active: pr.filter(p => p.status === 'In Progress').length, received: sum(x => x.status === 'Paid'), pending: sum(x => x.status !== 'Paid'),
    dueSoon: t.filter(x => x.status !== 'Completed' && x.deadline - Date.now() < 3 * 864e5).length, productivity: Math.round(50 + 50 * done / (t.length || 1)),
    chart: Object.entries(m).map(([month, revenue]) => ({ month, revenue })), activity: await Activity.find({ user: u }).sort('-createdAt').limit(6) });
}));
// ---------- CRUD (scoped to logged-in user) ----------
const crud = (p, Mo, pop = []) => { const r = express.Router(); r.use(auth);
  r.get('/', h(async (q, s) => s.json(await Mo.find({ user: q.user.id }).populate(pop).sort('-createdAt'))));
  r.post('/', h(async (q, s) => s.json(await Mo.create({ ...q.body, user: q.user.id }))));
  r.get('/:id', h(async (q, s) => s.json(await Mo.findOne({ _id: q.params.id, user: q.user.id }).populate(pop))));
  r.put('/:id', h(async (q, s) => s.json(await Mo.findOneAndUpdate({ _id: q.params.id, user: q.user.id }, q.body, { new: true }))));
  r.delete('/:id', h(async (q, s) => { await Mo.deleteOne({ _id: q.params.id, user: q.user.id }); s.json({ ok: 1 }); }));
  app.use('/api/' + p, r); };
crud('clients', Client); crud('projects', Project, 'client'); crud('tasks', Task, 'project'); crud('payments', Payment, ['client', 'project']); crud('invoices', Invoice, ['client', 'project']);
// ---------- MOCK AI (swap bodies for a real LLM call using an env API key) ----------
const PLAN = [['Planning', ['Requirement gathering', 'Competitor analysis']], ['UI/UX', ['Wireframes', 'Homepage design', 'Product page design']], ['Development', ['Authentication', 'Product management', 'Shopping cart', 'Payment integration']], ['Testing', ['Functional testing', 'Security testing', 'Client review']]];
app.post('/api/ai/generate-project-plan', auth, (q, s) => {
  const days = +q.body.days || 30, n = PLAN.reduce((a, p) => a + p[1].length, 0); let i = 0;
  s.json({ phases: PLAN.map(([phase, ts]) => ({ phase, tasks: ts.map(title => ({ title, priority: phase === 'Development' ? 'High' : 'Medium', hours: 6, deadline: new Date(Date.now() + Math.ceil(++i / n * days) * 864e5).toISOString().slice(0, 10) })) })) });
});
app.post('/api/ai/save-plan', auth, h(async (q, s) => {
  const u = q.user.id, { phases, ...b } = q.body, p = await Project.create({ ...b, user: u, status: 'In Progress' });
  for (const ph of phases) { await Milestone.create({ project: p.id, title: ph.phase, due: ph.tasks.at(-1)?.deadline });
    await Task.insertMany(ph.tasks.map(t => ({ ...t, user: u, project: p.id, assignee: 'Me' }))); }
  await Activity.create({ user: u, text: `AI plan saved for ${p.name}` }); s.json(p);
}));
app.post('/api/ai/risk-analysis', auth, h(async (q, s) => s.json(await analyze(await Project.findById(q.body.projectId)))));
const msg = (type, name, r) => `Hi ${name},\n\n${{ 'Project Update': 'I wanted to share a quick update: work is progressing well and we remain on track.', 'Deadline Delay': `I wanted to update you on the timeline. ${r || 'Some work needs additional testing'}, so delivery may shift by approximately two days.`, 'Payment Reminder': 'This is a friendly reminder that your invoice is still pending. Please let me know if you need anything from my side.', 'Milestone Completed': 'A milestone has just been completed and is ready for your review.', 'Meeting Request': 'Could we schedule a short call this week to align on next steps?', 'Project Completion': 'The project is complete! Please review the deliverables and share any final feedback.' }[type]}\n\nThank you,\nTeekshitha`;
app.post('/api/ai/generate-message', auth, (q, s) => s.json({ text: msg(q.body.type, q.body.name || 'there', q.body.reason) }));
app.post('/api/ai/chat', auth, h(async (q, s) => {
  const u = q.user.id, m = (q.body.message || '').toLowerCase(), pr = await overview(u), pay = await Payment.find({ user: u, status: { $ne: 'Paid' } });
  const top = [...pr].sort((a, b) => b.risk - a.risk)[0], owed = pay.reduce((a, x) => a + x.amount, 0);
  s.json({ reply: /risk/.test(m) ? `At risk: ${pr.filter(p => p.health !== 'On Track').map(p => `${p.name} (${p.risk}%)`).join(', ') || 'none'}.`
    : /money|owe|waiting|pending/.test(m) ? `You're waiting on ₹${owed.toLocaleString('en-IN')} across ${pay.length} payments.`
    : /focus|prioriti|today/.test(m) ? `Focus on ${top.name}: ${top.hi} high-priority tasks open and ${top.left} days left.`
    : /remind|draft/.test(m) ? msg('Payment Reminder', 'Rahul') : 'Ask me about risks, pending money, or what to focus on today.' });
}));
// ---------- NOTIFICATIONS ----------
app.get('/api/notifications', auth, h(async (q, s) => s.json(await Notification.find({ user: q.user.id }).sort('-createdAt'))));
app.put('/api/notifications/:id/read', auth, h(async (q, s) => s.json(await Notification.findByIdAndUpdate(q.params.id, { read: true }, { new: true }))));
// ---------- DEMO SEED ----------
const seed = async () => {
  if (await User.countDocuments()) return;
  const u = await User.create({ name: 'Teekshitha', email: 'demo@freelanceflow.dev', password: await bcrypt.hash('demo123', 10), skill: 'Full-Stack Developer' }), id = u.id, d = n => new Date(Date.now() + n * 864e5);
  const [r, a, v] = await Client.create([['Rahul Sharma', 'ABC Solutions'], ['Ananya Rao', 'DesignHub'], ['Vikram Kumar', 'TechNova']].map(([name, company]) => ({ user: id, name, company, email: name.split(' ')[0].toLowerCase() + '@example.com' })));
  const [e, b, po, sa] = await Project.create([{ name: 'E-Commerce Website', client: r.id, budget: 50000, deadline: d(17) }, { name: 'Mobile Banking App', client: v.id, budget: 120000, deadline: d(6) }, { name: 'Portfolio Website', client: a.id, budget: 20000, deadline: d(25) }, { name: 'SaaS Landing Page', client: a.id, budget: 35000, deadline: d(9) }].map(p => ({ ...p, user: id, status: 'In Progress' })));
  const T = (p, title, priority, status, days, hours) => ({ user: id, project: p.id, title, priority, status, deadline: d(days), hours, assignee: 'Me' });
  await Task.create([T(e, 'Product page', 'High', 'Completed', -2, 6), T(e, 'Shopping cart', 'High', 'In Progress', 4, 10), T(e, 'Testing', 'Medium', 'To Do', 14, 8),
    T(b, 'Authentication', 'Critical', 'In Progress', 2, 12), T(b, 'Payment integration', 'Critical', 'To Do', 4, 20), T(b, 'Security testing', 'High', 'To Do', 5, 14), T(b, 'UI polish', 'Low', 'Review', 5, 6),
    T(po, 'Hero section', 'Low', 'Completed', -5, 3), T(po, 'Case studies', 'Medium', 'To Do', 20, 8), T(sa, 'Pricing page', 'Medium', 'Review', 2, 5), T(sa, 'Copywriting', 'High', 'To Do', 7, 6)]);
  await Payment.create([{ client: r.id, project: e.id, amount: 25000, status: 'Paid', due: d(-40) }, { client: v.id, project: b.id, amount: 60000, status: 'Paid', due: d(-10) }, { client: r.id, project: e.id, amount: 15000, due: d(-7), status: 'Overdue' }, { client: a.id, project: sa.id, amount: 17000, due: d(10) }].map(p => ({ ...p, user: id })));
  await Notification.create([['⚠️ Project Risk Detected', 'Mobile Banking App may miss its deadline.'], ['💰 Payment Reminder', '₹15,000 payment has been pending for 7 days.'], ['🤖 AI Suggestion', 'Consider prioritizing the payment integration task.']].map(([t, x]) => ({ user: id, type: t, text: x })));
  await Activity.create(['Payment received from TechNova', 'Client approved milestone UI Design', 'AI detected risk in Mobile Banking App'].map(text => ({ user: id, text })));
};
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelanceflow').then(seed).then(() => app.listen(process.env.PORT || 5000, () => console.log('API on :5000')));
