const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#header-navigation');
function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('open');
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.science-menu[open]').forEach(el => el.open = false);
    if (toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  }
});
document.addEventListener('click', event => {
  document.querySelectorAll('.science-menu[open]').forEach(el => { if (!el.contains(event.target)) el.open = false; });
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 861px)').addEventListener('change', closeMenu);

const search = document.querySelector('#blog-search');
search?.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  document.querySelectorAll('.post-card').forEach(card => {
    card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
    if (!card.hidden) count++;
  });
  document.querySelector('#no-results').hidden = count !== 0;
  document.querySelector('#blog-results').textContent = `${count} article${count === 1 ? '' : 's'} found`;
  document.querySelector('.article-count').textContent = `${count} article${count === 1 ? '' : 's'}`;
});

const form = document.querySelector('#contact-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const d = new FormData(form);
  const name = `${d.get('firstName')} ${d.get('lastName')}`.trim();
  const subject = encodeURIComponent(`SurgicGuide enquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${d.get('email')}\n\n${d.get('message')}`);
  window.location.href = `mailto:enquiry@surgicguide.com?subject=${subject}&body=${body}`;
  document.querySelector('#form-status').textContent = 'If your email app did not open, email enquiry@surgicguide.com directly. Your enquiry is sent only when you send the email.';
});

const figureDialog = document.querySelector('#figure-dialog');
let figureTrigger;
if (figureDialog?.showModal) {
  document.querySelectorAll('[data-figure]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const description = link.dataset.caption;
    const enlarged = figureDialog.querySelector('img');
    enlarged.src = link.href;
    enlarged.alt = description;
    document.querySelector('#figure-dialog-caption').textContent = description;
    document.querySelector('#figure-original').href = link.href;
    figureTrigger = link;
    figureDialog.showModal();
    document.documentElement.classList.add('figure-open');
  }));
  figureDialog.querySelector('.dialog-close').addEventListener('click', () => figureDialog.close());
  figureDialog.addEventListener('click', event => {
    if (event.target !== figureDialog) return;
    const box = figureDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) figureDialog.close();
  });
  figureDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('figure-open');
    figureTrigger?.focus({preventScroll:true});
  });
}
