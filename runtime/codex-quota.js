/* Dedicated account card. Values remain text; only the header illustration is PNG. */
(function (root) {
  'use strict';
  function timestamp(value) {
    if (value === null || value === undefined || value === '') return '未提供';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '未提供';
    const p = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}/${p(date.getMonth()+1)}/${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
  }
  function model(state) {
    const windows = Array.isArray(state.windows) ? state.windows : [];
    const row = (minutes, label) => {
      const found = windows.find(w => w.minutes === minutes);
      const used = Number.isFinite(found?.percent) ? Math.round(Math.max(0, Math.min(100, found.percent))*10)/10 : null;
      return {label, used, remaining:used===null?null:Math.round((100-used)*10)/10, reset:timestamp(found?.resetsAt)};
    };
    return {windows:[row(300,'5 小时'),row(10080,'1 周'),...windows.filter(w=>![300,10080].includes(w.minutes)).map(w=>row(w.minutes,w.minutes?`${w.minutes/60} 小时`:'当前周期'))], resets:Number.isSafeInteger(state.availableResetCount)&&state.availableResetCount>=0?`${state.availableResetCount} 次`:'未提供', updated:timestamp(state.queriedAt)};
  }
  function render(state, close) {
    const data = model(state);
    const node = (tag, cls, text) => {const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
    const card=node('section','quota-card codex-quota');card.setAttribute('aria-label','Codex 登录额度');
    const header=node('header','cq-header');
    const art=node('img','cq-header-art');art.src=new URL('./quota-header.png',document.baseURI).href;art.alt='';art.draggable=false;
    const title=node('h2','cq-title','Codex 登录额度');
    const button=node('button','quota-close cq-close','×');button.type='button';button.title='关闭额度查询';button.setAttribute('aria-label',button.title);button.onclick=e=>{e.stopPropagation();close();};
    header.append(art,title,button);card.append(header);
    const content=node('div','quota-content cq-content');
    for (const value of data.windows) {
      const section=node('section','cq-window');
      const line=node('div','cq-window-heading');line.append(node('span','cq-period',value.label));
      const amount=node('div','cq-amount');amount.append(node('span','cq-remaining-label','剩余'),node('strong','cq-percent',value.remaining===null?'—':`${value.remaining}%`));line.append(amount);
      const bar=node('div','cq-track');bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',`${value.label}剩余额度`);bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
      if(value.remaining!==null){bar.setAttribute('aria-valuenow',String(value.remaining));if(value.remaining<=10)section.dataset.level='low';else if(value.remaining<=25)section.dataset.level='warning';const fill=node('div','cq-fill');fill.style.width=value.remaining+'%';bar.append(fill);}else{bar.setAttribute('aria-valuetext','未提供');bar.classList.add('cq-unavailable');}
      section.append(line,bar,node('div','cq-used',value.used===null?'用量未提供':`已用 ${value.used}%`),node('div','cq-reset',`重置于 ${value.reset}`));content.append(section);
    }
    const resets=node('div','cq-resets');resets.append(node('span','','可用重置次数'),node('strong','cq-reset-count',data.resets));
    const footer=node('footer','cq-footer');footer.append(node('span','cq-updated-label','更新时间'),node('time','cq-updated',data.updated));
    content.append(resets,footer);card.append(content);return card;
  }
  const api={model,timestamp,render};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PetCodexQuota=api;
})(typeof window==='undefined'?globalThis:window);
