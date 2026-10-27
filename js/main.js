// Menu toggle
const btn=document.getElementById('menu-btn'),list=document.getElementById('nav-list');
btn.addEventListener('click',()=>{const o=list.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
list.addEventListener('click',e=>{if(e.target.tagName==='A')list.classList.remove('open')});

// Course filter
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));
  const f=b.dataset.filter;
  document.querySelectorAll('#courses .card').forEach(c=>c.hidden=!(f==='all'||c.dataset.type===f));
}));

// Schedule tabs
document.querySelectorAll('[role=tab]').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('[role=tab]').forEach(x=>x.setAttribute('aria-selected',x===t));
  document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==t.dataset.panel);
}));
