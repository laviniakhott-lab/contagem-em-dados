const $ = s => document.querySelector(s);
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selectEvents(events, period, category, now = Date.now()) {
 return events.filter(e => (category === 'all' || e.category === category) && (period === 'all' || (period === 'past' ? Date.parse(e.end) < now : Date.parse(e.end) >= now))).sort((a,b) => Date.parse(a.start)-Date.parse(b.start));
}
async function init() {
 try {
  const response = await fetch('/events.json', {cache:'no-cache'});
  if (!response.ok) throw new Error('Agenda indisponÃ­vel');
  const data = await response.json();
  const render = () => {
   const now = Date.now();
   const rows = selectEvents(data.events, $('#events-period').value, $('#events-category').value, now);
   $('#events-count').textContent = `${rows.length} evento${rows.length === 1 ? '' : 's'}`;
   $('#events-list').innerHTML = rows.length ? rows.map(e => `<article class="panel event-card"><span class="mini-label">${escape(e.category)} Â· ${Date.parse(e.end)<now?'Encerrado':Date.parse(e.start)<=now?'Em perÃ­odo de realizaÃ§Ã£o':'Programado'}</span><h3>${escape(e.title)}</h3><p class="event-date">${escape(e.when)}</p><p>${escape(e.place)}</p><p class="muted">${escape(e.description)}</p><a href="${escape(e.source)}" target="_blank" rel="noopener noreferrer">Conferir na Prefeitura â†—</a></article>`).join('') : '<p>Nenhum evento neste recorte.</p>';
  };
  $('#events-period').addEventListener('change', render);
  $('#events-category').addEventListener('change', render);
  render();
  setInterval(render, 60000);
 } catch {
  $('#events-list').textContent = 'NÃ£o foi possÃ­vel carregar a agenda. Consulte a agenda oficial no link acima.';
 }
}
if (typeof document !== 'undefined') init();
