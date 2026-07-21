// ===== CONSOLIDATION: Roadmap Protection & Consolidation =====
(function(){
  'use strict';

  // Protect grhRenderRoadmap against accidental overwrites
  if(typeof window.grhRenderRoadmap === 'function'){
    Object.defineProperty(window, 'grhRenderRoadmap', {
      value: window.grhRenderRoadmap,
      writable: false,
      configurable: false,
      enumerable: true
    });
    console.log('[ROADMAP CONSOLIDATION] grhRenderRoadmap protected against overwrites');
  }

  // Protect grhRoadmapPainelHTML against accidental overwrites
  if(typeof window.grhRoadmapPainelHTML === 'function'){
    Object.defineProperty(window, 'grhRoadmapPainelHTML', {
      value: window.grhRoadmapPainelHTML,
      writable: false,
      configurable: false,
      enumerable: true
    });
    console.log('[ROADMAP CONSOLIDATION] grhRoadmapPainelHTML protected against overwrites');
  }

  // Ensure sidebar item for roadmap
  function ensureRoadmapSidebarItem(){
    let item = document.getElementById('sb-roadmap-produto');
    if(!item){
      const sidebar = document.getElementById('sidebar');
      if(sidebar){
        item = document.createElement('div');
        item.className = 'sb-item';
        item.id = 'sb-roadmap-produto';
        item.setAttribute('onclick', "sbNav('roadmap-produto')");
        item.innerHTML = '<span>🗺️</span><span class="sb-tip">Roadmap do Produto</span>';
        sidebar.appendChild(item);
        console.log('[ROADMAP CONSOLIDATION] Sidebar item created');
      }
    }
  }

  // Initialize
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureRoadmapSidebarItem);
  } else {
    ensureRoadmapSidebarItem();
  }
  setTimeout(ensureRoadmapSidebarItem, 300);

  // Expose for global access
  window.ensureRoadmapPaine = function(){
    const pane = document.getElementById('grh-pane-roadmap');
    if(pane && typeof window.grhRenderRoadmap === 'function'){
      window.grhRenderRoadmap();
    }
  };

  console.log('[ROADMAP CONSOLIDATION] Initialized - archivo 75 is now single source of truth');
})();

