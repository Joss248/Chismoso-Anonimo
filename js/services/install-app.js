export function setupInstallation() {
  const slot = document.querySelector('#install-slot');
  const button = document.querySelector('#install-button');
  const status = document.querySelector('#install-status');
  const help = document.querySelector('#install-help');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let installPrompt;
  let installed = false;
  let prompting = false;

  function update() {
    const hide = installed || standalone.matches || navigator.standalone === true;
    if (hide && document.activeElement === button) {
      document.querySelector('#contenido').focus({ preventScroll: true });
    }
    slot.hidden = hide;
    button.disabled = prompting;
    button.textContent = installPrompt || prompting ? 'Instalar' : 'Cómo instalar';
    if (installPrompt || prompting) button.removeAttribute('aria-haspopup');
    else button.setAttribute('aria-haspopup', 'dialog');
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    if (installed) return;
    installPrompt = event;
    if (help.open) help.close();
    update();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = undefined;
    if (help.open) help.close();
    update();
  });

  standalone.addEventListener('change', update);
  button.addEventListener('click', async () => {
    if (prompting) return;
    if (!installPrompt) {
      help.showModal();
      return;
    }

    const prompt = installPrompt;
    installPrompt = undefined;
    prompting = true;
    status.textContent = '';
    update();
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') installed = true;
      else status.textContent = 'Instalación cancelada.';
    } catch {
      status.textContent = 'El navegador no pudo abrir el diálogo de instalación. Consulta Cómo instalar.';
    } finally {
      prompting = false;
      update();
    }
  });
  update();
}
