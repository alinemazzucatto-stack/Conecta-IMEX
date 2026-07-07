// ===== script: login-particles-js =====
(function(){
  if(window.__tlLoginParticles) return;
  window.__tlLoginParticles = true;

  var ORBS = [
    {s:110,t:"8%", l:"7%", c:"rgba(99,102,241,.24)", blur:34,dur:"9s", del:"0s",   anim:"tlOrbA"},
    {s:62, t:"68%",l:"5%", c:"rgba(139,92,246,.2)",  blur:22,dur:"11s",del:"1.5s", anim:"tlOrbB"},
    {s:155,t:"9%", l:"69%",c:"rgba(67,56,202,.16)",  blur:52,dur:"13s",del:".6s",  anim:"tlOrbC"},
    {s:44, t:"44%",l:"88%",c:"rgba(167,139,250,.3)", blur:14,dur:"7s", del:"2s",   anim:"tlOrbA"},
    {s:80, t:"76%",l:"56%",c:"rgba(99,102,241,.15)", blur:26,dur:"10s",del:"1s",   anim:"tlOrbB"},
    {s:34, t:"26%",l:"20%",c:"rgba(139,92,246,.34)", blur:11,dur:"6s", del:"3s",   anim:"tlOrbC"},
    {s:120,t:"55%",l:"35%",c:"rgba(67,56,202,.10)",  blur:40,dur:"14s",del:"2.5s", anim:"tlOrbA"},
    {s:50, t:"86%",l:"80%",c:"rgba(167,139,250,.22)",blur:16,dur:"8s", del:"4s",   anim:"tlOrbB"},
    {s:22, t:"16%",l:"50%",c:"rgba(99,102,241,.4)",  blur:7, dur:"4.5s",del:".5s", anim:"tlOrbC"},
    {s:90, t:"40%",l:"2%", c:"rgba(139,92,246,.13)", blur:30,dur:"12s",del:"1.2s", anim:"tlOrbA"},
    {s:38, t:"60%",l:"92%",c:"rgba(99,102,241,.28)", blur:12,dur:"5.5s",del:"3.5s",anim:"tlOrbB"},
    {s:70, t:"88%",l:"28%",c:"rgba(167,139,250,.16)",blur:22,dur:"9.5s",del:"0.8s",anim:"tlOrbC"},
  ];

  function buildParticles() {
    var ls = document.getElementById("loginScreen");
    if(!ls || ls.querySelector(".tl-lp")) return;

    var mesh = document.createElement("div");
    mesh.id = "tl-login-mesh";
    ls.insertBefore(mesh, ls.firstChild);

    ORBS.forEach(function(o) {
      var el = document.createElement("div");
      el.className = "tl-lp";
      el.style.cssText =
        "width:"+o.s+"px;height:"+o.s+"px;" +
        "top:"+o.t+";left:"+o.l+";" +
        "background:"+o.c+";" +
        "filter:blur("+o.blur+"px);" +
        "animation:"+o.anim+" "+o.dur+" "+o.del+" ease-in-out infinite;";
      ls.insertBefore(el, ls.firstChild);
    });

    var box = ls.querySelector(".login-box");
    if(!box) return;

    if(!box.querySelector(".tl-login-brand")) {
      var brand = document.createElement("span");
      brand.className = "tl-login-brand";
      brand.textContent = "Portal Conecta IMEX";
      box.insertBefore(brand, box.firstChild);
    }

    var logoDiv = box.querySelector(".login-logo");
    if(logoDiv && !box.querySelector(".tl-login-logo-ring")) {
      var ring = document.createElement("div");
      ring.className = "tl-login-logo-ring";
      logoDiv.parentNode.insertBefore(ring, logoDiv);
      ring.appendChild(logoDiv);
    }
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildParticles);
  } else {
    buildParticles();
  }
  // Retry buildParticles once after a short delay to ensure particles are added
  // (removed redundant setInterval that was causing render oscillation)
  setTimeout(buildParticles, 300);
})();

