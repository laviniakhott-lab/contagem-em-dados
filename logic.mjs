export function observation(metric,year){
  return metric.values.find(p=>p.year===Number(year));
}

export function within(metric,start,end){
  return metric.values.filter(p=>p.year>=start&&p.year<=end);
}

export function compare(metric,base,target){
  const a=observation(metric,base),
        b=observation(metric,target);

  if(metric.frequency==='edition') return {status:'edition'};
  if(metric.frequency==='monthly') return {status:'monthly'};
  if(!a||!b) return {status:'missing'};
  if(Number(base)>Number(target)) return {status:'order'};
  if(metric.breakYear&&((a.year<metric.breakYear)!==(b.year<metric.breakYear)))
      return {status:'break'};
  if(Number(base)===Number(target))
      return {status:'same'};

  const absolute=b.value-a.value,
        mode=metric.comparison??'relative';

  if(a.value===0&&mode==='relative')
      return {status:'zero',absolute,a,b};

  return {
      status:'ok',
      mode,
      absolute,
      percent:a.value===0?null:absolute/a.value*100,
      a,
      b
  };
}

export function years(start,end){
  return Array.from(
      {length:end-start+1},
      (_,i)=>start+i
  );
}
