// Scroll-reveal genérico pros sites publicados (os 10 layouts).
// Padrão dos builders top (Framer/Squarespace): seções entram com
// fade + subida suave quando aparecem na viewport.
//
// Seguro por construção:
//  - sem JS (ou erro), nada fica escondido — o CSS só esconde depois
//    que o script marca <html data-rv> e a seção ainda não entrou;
//  - prefers-reduced-motion desliga tudo;
//  - a 1ª dobra (hero/nav) entra visível: só seções abaixo de 85% da
//    viewport no momento do load são animadas.
// Renderizado UMA vez pelo LayoutRenderer, vale pros 10 layouts.

const REVEAL_CSS = `
@media (prefers-reduced-motion: no-preference) {
  html[data-rv] .rv-hide { opacity: 0; transform: translateY(26px); }
  html[data-rv] .rv-in { opacity: 1; transform: none; transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
}
`

const REVEAL_JS = `
(function () {
  // Só inicializa DEPOIS do load (pós-hidratação do React) — mexer em
  // className antes da hidratação gera mismatch e o React desfaz a classe.
  function init() {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;
      var els = document.querySelectorAll('main section, body > section, main > figure, footer');
      if (!els.length) return;
      document.documentElement.setAttribute('data-rv', '');
      var fold = window.innerHeight * 0.85;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('rv-in');
            e.target.classList.remove('rv-hide');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      els.forEach(function (el) {
        var top = el.getBoundingClientRect().top;
        if (top > fold) { el.classList.add('rv-hide'); io.observe(el); }
      });
    } catch (e) { /* reveal é decorativo — nunca quebra o site */ }
  }
  function deferred() { setTimeout(init, 300); }
  if (document.readyState === 'complete') deferred();
  else window.addEventListener('load', deferred);
})();
`

export default function SiteReveal() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: REVEAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: REVEAL_JS }} />
    </>
  )
}
