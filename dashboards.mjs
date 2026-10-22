export function scoreLevel(v){
 if(v>=80)return {key:'very_high',label:'Muito alto',color:'#34764b'};
 if(v>=60)return {key:'high',label:'Alto',color:'#5e7950'};
 if(v>=50)return {key:'medium',label:'Médio',color:'#997825'};
 if(v>=40)return {key:'low',label:'Baixo',color:'#ab683c'};
 return {key:'very_low',label:'Muito baixo',color:'#a74a55'};
}
export function initDashboards(D,onSelectMetric=()=>{}){
 const $ = s => document.querySelector(s);

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const nf = (v,n=1) =>
  new Intl.NumberFormat('pt-BR',{
    minimumFractionDigits:n,
    maximumFractionDigits:n
  }).format(v);nf=(v,n=1)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:n,maximumFractionDigits:n}).format(v);
 const ods=D.dashboards.ods,culture=D.dashboards.culture;
 let selectedGoal=1;
 const exportRows=(name,rows)=>{const csv='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#toast').textContent='CSV exportado com território, referência, unidade e fonte.';$('#toast').hidden=false;setTimeout(()=>$('#toast').hidden=true,3500);};
 const goalRows=()=>{let rows=ods.goals.filter(g=>$('#ods-level').value==='all'||scoreLevel(g.value).key===$('#ods-level').value);const order=$('#ods-sort').value;return rows.toSorted?rows.toSorted((a,b)=>order==='asc'?a.value-b.value:order==='desc'?b.value-a.value:a.goal-b.goal):[...rows].sort((a,b)=>order==='asc'?a.value-b.value:order==='desc'?b.value-a.value:a.goal-b.goal);};
 function goalDetail(){const g=ods.goals.find(g=>g.goal===selectedGoal),l=scoreLevel(g.value);$('#ods-detail').innerHTML=`<img src="${esc(g.image)}" alt="ODS ${g.goal}: ${esc(g.unLabel)}" width="78" height="78"><div><small>ODS ${g.goal} · Contagem · edição ${ods.edition}</small><h3>${esc(g.unLabel)}</h3><strong class="dashboard-number">${nf(g.value)} <span>pontos de 100</span></strong><p><span class="level-pill" style="--level:${l.color}">${l.label}</span> Classificação do IDSC-BR.</p><p>O escore combina indicadores com referências diversas. Não equivale ao percentual de metas cumpridas.</p><div class="dashboard-links"><a href="${esc(g.unUrl)}" target="_blank" rel="noopener noreferrer">Conhecer o objetivo na ONU â†—</a><a href="#explorar" data-open-metric="idsc_${g.goal}">Abrir no explorador de indicadores â†'</a></div></div>`;$('#ods-detail [data-open-metric]').onclick=e=>onSelectMetric(e.currentTarget.dataset.openMetric);}
 function renderODS(){let rows=goalRows();if(rows.length&&!rows.some(g=>g.goal===selectedGoal))selectedGoal=rows[0].goal;
  $('#ods-filter-count').textContent=`${rows.length} de 17 objetivos · Contagem · edição ${ods.edition}`;
  $('#ods-tiles').innerHTML=rows.length?rows.map(g=>{const l=scoreLevel(g.value);return `<button class="ods-tile" data-goal="${g.goal}" aria-pressed="${g.goal===selectedGoal}" aria-label="ODS ${g.goal}, ${esc(g.unLabel)}, ${nf(g.value)} pontos, ${l.label}"><img src="${esc(g.image)}" alt="ODS ${g.goal}: ${esc(g.unLabel)}" loading="lazy" width="90" height="90"><span class="dashboard-number">${nf(g.value)}</span><small style="color:${l.color}">${l.label}</small></button>`;}).join(''):'<p class="dashboard-empty">Nenhum objetivo nesta faixa.</p>';
  $('#ods-bars').innerHTML=rows.map(g=>`<div class="hbar-row"><span class="hbar-label">${g.goal}. ${esc(g.unLabel)}</span><div class="hbar-track"><span style="width:${g.value}%;background:${scoreLevel(g.value).color}"></span></div><strong class="dashboard-number">${nf(g.value)}</strong></div>`).join('');
  $('#ods-rows').innerHTML=rows.map(g=>`<tr><td>ODS ${g.goal} · ${esc(g.unLabel)}</td><td class="number">${nf(g.value)}</td><td>pontos de 0 a 100</td><td>Edição ${ods.edition}</td><td>${scoreLevel(g.value).label}</td><td><a href="${esc(ods.url)}" target="_blank" rel="noopener noreferrer">ICS · IDSC-BR â†—</a></td></tr>`).join('');
  $('#ods-tiles').querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{selectedGoal=Number(b.dataset.goal);renderODS();});$('#ods-detail').hidden=rows.length===0;if(rows.length)goalDetail();
 }
 $('#ods-kpis').innerHTML=`<article class="dashboard-kpi"><small>IDSC-BR geral · Contagem</small><strong class="dashboard-number">${nf(ods.overall.value,2)} <span>/100</span></strong><p>${scoreLevel(ods.overall.value).label} · edição ${ods.edition}</p></article><article class="dashboard-kpi"><small>Objetivos em nível muito alto</small><strong class="dashboard-number">${ods.goals.filter(g=>g.value>=80).length}<span> de 17</span></strong><p>Faixa de 80 a 100 pontos</p></article><article class="dashboard-kpi"><small>Objetivos em nível muito baixo</small><strong class="dashboard-number">${ods.goals.filter(g=>g.value<40).length}<span> de 17</span></strong><p>Abaixo de 40 pontos</p></article>`;
 $('#ods-level').onchange=renderODS;$('#ods-sort').onchange=renderODS;
 $('#ods-export').onclick=()=>exportRows('contagem_idsc_ods_edicao_2026.csv',[['Território','Código IBGE','ODS','Objetivo','Pontuaço','Unidade','Edição','Classificação','Fonte','URL da fonte','Consulta'],...goalRows().map(g=>['Contagem','3118601',g.goal,g.unLabel,g.original.replace('.',','),'pontos de 0 a 100',ods.edition,scoreLevel(g.value).label,'Instituto Cidades Sustentáveis ​​Â· IDSC-BR',ods.url,D.checkedAt])]);
 const cultureRows=()=>{let rows=culture.records.filter(r=>r.group===$('#culture-group').value);return $('#culture-sort').value==='desc'?[...rows].sort((a,b)=>b.value-a.value):rows;};
 function renderCulture(){const rows=cultureRows(),unit=rows[0]?.unit??'',group=$('#culture-group').value;
  $('#culture-chart-title').textContent=group==='participação'?'Participação da ECIC no PIB brasileiro':group==='agrupamentos'?'Composição por agrupamento setorial':'Contribuição regional para o PIB da ECIC';
  $('#culture-chart-unit').textContent=`${unit} · referência ${culture.referenceYear} · contexto Brasil`;
  $('#culture-bars').innerHTML=rows.map(r=>`<div class="hbar-row"><span class="hbar-label">${esc(r.label)}</span><div class="hbar-track"><span style="width:${r.value}%;background:#4c68aa"></span></div><strong class="dashboard-number">${nf(r.value,2)}%</strong></div>`).join('');
  $('#culture-rows').innerHTML=rows.map(r=>`<tr><td>${esc(r.label)}</td><td class="number">${nf(r.value,2)}</td><td>${esc(r.unit)}</td><td>${esc(r.territory)}${r.group==='regioes'?' no total Brasil':''}</td><td>${r.year}</td><td><a href="${esc(culture.requestedUrl)}" target="_blank" rel="noopener noreferrer">Observatório Fundação Itaú â†—</a></td></tr>`).join('');
  $('#culture-row-count').textContent=`${rows.length} valores · referência 2020`;
  document.querySelectorAll('[data-culture-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cultureGroup===group)));
 }
 const share=culture.records.find(r=>r.id==='pib_share'),tech=culture.records.find(r=>r.id==='tecnologia'),se=culture.records.find(r=>r.id==='sudeste');
 $('#culture-kpis').innerHTML=[{r:share,group:'participação',title:'ECIC no PIB brasileiro',note:'Participação no PIB total do Brasil'},{r:tech,group:'agrupamentos',title:'Tecnologia no PIB da ECIC',note:'Participação no PIB criativo nacional'},{r:se,group:'regioes',title:'Sudeste no PIB da ECIC',note:'Contribuição da região ao total nacional'}].map(({r,group,title,note})=>`<button type="button" class="dashboard-kpi" data-culture-group="${group}" aria-pressed="false"><small>${title}</small><strong class="dashboard-number">${nf(r.value,2)}%</strong><p>${note} · ${r.year}</p></button>`).join('');
 $('#culture-kpis').querySelectorAll('[data-culture-group]').forEach(b=>b.onclick=()=>{$('#culture-group').value=b.dataset.cultureGroup;renderCulture();});
 $('#culture-group').onchange=renderCulture;$('#culture-sort').onchange=renderCulture;
 $('#culture-export').onclick=()=>exportRows('ecic_brasil_2020_'+$('#culture-group').value+'.csv',[['Indicador/categoria','Valor','Unidade','Território/recorte','Ano de referência','Fonte','URL da fonte','Consulta'],...cultureRows().map(r=>[r.label,r.original.replace('.',','),r.unit,r.territory+(r.group==='regioes'?' no total Brasil':''),r.year,culture.producer,culture.requestedUrl,D.checkedAt])]);
 $('#ods-source-snapshot').href=D.sources.idsc.snapshot;$('#culture-source-snapshot').href=D.sources.itau_ecic.snapshot;
 renderODS();renderCulture();
}
