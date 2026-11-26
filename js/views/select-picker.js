let nextPickerId = 0;

export function enhanceSelect(select, signal) {
  const originalLabel = select.closest('label');
  const id = `picker-${++nextPickerId}`;
  const picker = document.createElement('div');
  picker.className = 'select-picker';
  picker.innerHTML = `
    <span id="${id}-label" class="picker-label"></span>
    <div class="picker-anchor">
      <button id="${id}-trigger" type="button" class="picker-trigger" role="combobox" aria-expanded="false"
        aria-haspopup="listbox" aria-controls="${id}-list" aria-labelledby="${id}-label ${id}-trigger"></button>
      <div id="${id}-list" role="listbox" aria-labelledby="${id}-label" class="picker-list" hidden></div>
    </div>
    <span id="${id}-error" class="picker-error" hidden>Selecciona una opción.</span>`;
  const label = picker.querySelector('.picker-label');
  const button = picker.querySelector('button');
  const list = picker.querySelector('[role=listbox]');
  const error = picker.querySelector('.picker-error');
  label.textContent = originalLabel.firstChild.textContent.trim();
  const accessibleLabel = select.getAttribute('aria-label');
  if (accessibleLabel) {
    const accessibleText = document.createElement('span');
    accessibleText.id = `${id}-accessible-label`;
    accessibleText.className = 'visually-hidden';
    accessibleText.textContent = accessibleLabel;
    picker.append(accessibleText);
    button.setAttribute('aria-labelledby', `${accessibleText.id} ${button.id}`);
    list.setAttribute('aria-labelledby', accessibleText.id);
  }
  if (select.required) button.setAttribute('aria-required', 'true');

  const options = Array.from(select.options).flatMap((option, index) => {
    if (option.disabled || (select.required && !option.value)) return [];
    const item = document.createElement('div');
    item.id = `${id}-option-${index}`;
    item.setAttribute('role', 'option');
    item.textContent = option.text;
    list.append(item);
    return [{ item, index }];
  });

  originalLabel.replaceWith(picker);
  picker.prepend(select);
  select.hidden = true;
  let active = -1;
  let listeners;
  let typed = '';
  let lastTyped = 0;

  function refresh() {
    button.textContent = select.selectedOptions[0]?.text ?? '';
    for (const { item, index } of options) {
      item.setAttribute('aria-selected', String(index === select.selectedIndex));
    }
    if (select.validity.valid) {
      error.hidden = true;
      button.removeAttribute('aria-invalid');
      button.removeAttribute('aria-describedby');
    }
  }

  function highlight(index) {
    options[active]?.item.classList.remove('active');
    active = Math.max(0, Math.min(index, options.length - 1));
    const item = options[active].item;
    item.classList.add('active');
    button.setAttribute('aria-activedescendant', item.id);
    const optionBounds = item.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (optionBounds.top < listBounds.top) list.scrollTop -= listBounds.top - optionBounds.top;
    if (optionBounds.bottom > listBounds.bottom) list.scrollTop += optionBounds.bottom - listBounds.bottom;
  }

  function position() {
    const bounds = button.getBoundingClientRect();
    const navigation = document.querySelector('.navigation');
    const bottom = navigation && getComputedStyle(navigation).position === 'fixed'
      ? navigation.getBoundingClientRect().top : document.documentElement.clientHeight;
    const above = bounds.top - 8;
    const below = bottom - bounds.bottom - 8;
    const opensAbove = below < 220 && above > below;
    list.classList.toggle('opens-above', opensAbove);
    list.style.maxHeight = `${Math.max(0, Math.min(224, opensAbove ? above : below))}px`;
  }

  function close() {
    if (list.hidden) return;
    listeners.abort();
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-activedescendant');
    typed = '';
  }

  function open(preferLast = false) {
    if (!options.length || select.matches(':disabled')) return;
    button.focus({ preventScroll: true });
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    position();
    const selected = options.findIndex(option => option.index === select.selectedIndex);
    highlight(selected >= 0 ? selected : preferLast ? options.length - 1 : 0);
    listeners = new AbortController();
    const settings = { signal: listeners.signal };
    document.addEventListener('pointerdown', event => {
      if (!picker.contains(event.target)) close();
    }, settings);
    window.addEventListener('resize', position, settings);
    window.addEventListener('scroll', position, { ...settings, passive: true });
  }

  function choose(option) {
    const changed = select.selectedIndex !== option.index;
    select.selectedIndex = option.index;
    refresh();
    close();
    button.focus({ preventScroll: true });
    if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  label.addEventListener('click', () => button.focus());
  button.addEventListener('click', () => list.hidden ? open() : close());
  list.addEventListener('mousedown', event => event.preventDefault());
  list.addEventListener('click', event => {
    const option = options.find(entry => entry.item === event.target);
    if (option && !select.matches(':disabled')) choose(option);
  });
  button.addEventListener('keydown', event => {
    const { key } = event;
    if (key === 'Tab') {
      close();
      return;
    }
    if (key === 'Escape' && !list.hidden) {
      event.preventDefault();
      close();
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (list.hidden) open();
      else choose(options[active]);
      return;
    }
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (list.hidden) {
        open(key === 'ArrowUp' || key === 'End');
        if (list.hidden || key.startsWith('Arrow')) return;
      }
      const positions = { ArrowUp: active - 1, ArrowDown: active + 1, Home: 0, End: options.length - 1 };
      highlight(positions[key]);
      return;
    }
    if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      if (list.hidden) open();
      if (list.hidden) return;
      event.preventDefault();
      const now = performance.now();
      typed = now - lastTyped > 650 ? key : typed + key;
      lastTyped = now;
      const match = options.findIndex(({ item }) => item.textContent.toLocaleLowerCase('es').startsWith(typed.toLocaleLowerCase('es')));
      if (match >= 0) highlight(match);
    }
  });

  select.addEventListener('change', refresh);
  select.addEventListener('invalid', event => {
    event.preventDefault();
    error.hidden = false;
    button.setAttribute('aria-invalid', 'true');
    button.setAttribute('aria-describedby', error.id);
    if (select.form.querySelector('input:invalid, textarea:invalid, select:invalid') === select) button.focus();
  });
  signal.addEventListener('abort', close, { once: true });
  refresh();
  return refresh;
}
