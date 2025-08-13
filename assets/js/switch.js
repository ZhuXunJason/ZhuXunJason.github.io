document.addEventListener('DOMContentLoaded', () => {
    const switcher=document.querySelector('.switch');
    if(!switcher) return;
    const tabs=[...switcher.querySelectorAll('button[role="tab"]')];
    const thumb=switcher.querySelector('.switch__thumb');
    const lists={ life:document.getElementById('list-life'), academic:document.getElementById('list-academic') };
    const searchInput=document.getElementById('search-input');

    function setActive(target){ Object.keys(lists).forEach(k=>lists[k].classList.toggle('hidden', k!==target)); }
    function slideThumb(){ const active=tabs.find(b=>b.classList.contains('active'))||tabs[0]; if(!active) return; const pad=parseFloat(getComputedStyle(switcher).paddingLeft)||0; const x=active.offsetLeft-pad; const w=active.offsetWidth; thumb.style.transform=`translateX(${x}px)`; thumb.style.width=`${w}px`; }
    function animateList(list){ list.classList.remove('appearing'); const cards=[...list.querySelectorAll('.post-card')]; cards.forEach((c,i)=>c.style.setProperty('--d',`${Math.min(i*40,400)}ms`)); void list.offsetWidth; list.classList.add('appearing'); setTimeout(()=>list.classList.remove('appearing'),700); }

    switcher.addEventListener('click',e=>{ const btn=e.target.closest('button[role="tab"]'); if(!btn) return; tabs.forEach(b=>{ const act=b===btn; b.classList.toggle('active',act); b.setAttribute('aria-selected',act?'true':'false'); }); const target=btn.dataset.target; setActive(target); slideThumb(); animateList(lists[target]); filter(); });

    // 初始化：显示 life, 隐藏 academic
    setActive('life'); slideThumb();
    window.addEventListener('resize', slideThumb);
});