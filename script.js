// script.js — оновлений, стабільний
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Theme toggle (плавно) ---------- */
  const themeBtn = document.querySelector('[data-action="theme-toggle"]');
  const savedTheme = localStorage.getItem('wa-theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('wa-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('wa-theme', 'dark');
      }
    });
  }

  /* ---------- Universal toggle description (robust) ---------- */
  document.querySelectorAll('[data-action="toggle-desc"]').forEach(btn => {
    // support both data-target and aria-controls
    const sel = btn.getAttribute('data-target') || btn.getAttribute('aria-controls');
    if (!sel) return;
    const target = document.querySelector(sel);
    if (!target) return;
    // ensure consistent initial state
    if (!target.classList.contains('hidden')) target.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = target.classList.toggle('hidden');
      btn.textContent = isHidden ? 'Показати опис' : 'Сховати опис';
      btn.setAttribute('aria-expanded', String(!isHidden));
    });
  });

  /* ---------- Favorites modal (works for any .btn-fav) ---------- */
  // If page already contains markup with id #fav-modal, use it; otherwise create one.
  let favModal = document.getElementById('fav-modal');
  if (!favModal) {
    favModal = document.createElement('div');
    favModal.id = 'fav-modal';
    favModal.className = 'modal-overlay';
    favModal.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fav-title">
        <h3 id="fav-title">💙 Ми раді, що ви обрали нас!</h3>
        <p>Щоб забронювати тур або взяти спорядження в прокат — звертайтесь за телефоном або пишіть нам у соцмережі.</p>
        <div style="margin:12px 0; color:var(--muted);">
          <div>📞 +38 (0123) 456-78-90</div>
          <div>📧 info@wateradventure.com</div>
          <div>🔗 @water_adventure</div>
        </div>
        <div style="text-align:center;"><button class="btn" id="fav-close">OK</button></div>
      </div>
    `;
    document.body.appendChild(favModal);
  }

  const openFavButtons = document.querySelectorAll('.btn-fav, .btn-neo.btn-fav, [data-action="open-fav"]');
  function openFav() {
    favModal.classList.add('active');
    // lock scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // focus close for accessibility
    const closeBtn = favModal.querySelector('#fav-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeFav() {
    favModal.classList.remove('active');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  openFavButtons.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openFav(); }));

  // close handlers
  favModal.addEventListener('click', (e) => {
    if (e.target === favModal) closeFav();
  });
  const favClose = favModal.querySelector('#fav-close');
  if (favClose) favClose.addEventListener('click', closeFav);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && favModal.classList.contains('active')) closeFav();
  });

  /* ---------- Lightbox (robust: collects many selectors) ---------- */
  const selectors = ['.gallery-grid img', 'img[data-large]', '.gallery-item', '.route-img', '.responsive-img'];
  const images = Array.from(document.querySelectorAll(selectors.join(',')))
    .filter(img => img && (img.dataset.large || img.src));
  const uniqueSrcs = [];
  const imgs = [];
  images.forEach(img => {
    const src = img.dataset.large || img.src;
    if (!uniqueSrcs.includes(src)) { uniqueSrcs.push(src); imgs.push({el: img, src}); }
  });
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && imgs.length) {
    const lbImg = lightbox.querySelector('img');
    const btnClose = lightbox.querySelector('.close');
    const btnNext = lightbox.querySelector('.next');
    const btnPrev = lightbox.querySelector('.prev');
    let idx = -1;
    function openLB(i) {
      idx = i;
      lbImg.src = imgs[idx].src;
      lightbox.classList.add('open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    function closeLB() {
      lightbox.classList.remove('open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    imgs.forEach((item, i) => {
      item.el.addEventListener('click', (e) => { e.preventDefault(); openLB(i); });
      item.el.setAttribute('tabindex', '0');
      item.el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') openLB(i); });
    });
    btnClose && btnClose.addEventListener('click', closeLB);
    btnNext && btnNext.addEventListener('click', () => openLB((idx + 1) % imgs.length));
    btnPrev && btnPrev.addEventListener('click', () => openLB((idx - 1 + imgs.length) % imgs.length));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') openLB((idx + 1) % imgs.length);
      if (e.key === 'ArrowLeft') openLB((idx - 1 + imgs.length) % imgs.length);
    });
  }

  /* ---------- Toast buttons ---------- */
  document.querySelectorAll('[data-action="toast"], [data-action="add"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = btn.getAttribute('data-message') || 'Готово!';
      const t = document.createElement('div');
      t.className = 'wa-toast';
      t.textContent = message;
      Object.assign(t.style, {
        position: 'fixed', right: '18px', bottom: '18px',
        padding: '10px 14px', background: 'rgba(30,40,50,0.9)', color:'#fff',
        borderRadius:'10px', zIndex: 6000, boxShadow:'0 6px 20px rgba(0,0,0,0.3)'
      });
      document.body.appendChild(t);
      setTimeout(()=> t.style.opacity = '0', 2400);
      setTimeout(()=> t.remove(), 2800);
    });
  });

});
