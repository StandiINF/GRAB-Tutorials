window.addEventListener('DOMContentLoaded', () => {

  const loginMetaEl = document.getElementById('loginMeta');
  const loginTextEl = document.getElementById('loginText');
  const loggedInEl = document.getElementById('loggedin');
  const loginWithBtnEl = document.getElementById('loginwithbutton');
  let sessionId = localStorage.getItem('sessionId');

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, { ...options, credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const showDiscordLinkSection = async (sessionId) => {
    const section = document.getElementById('discordLinkSection');
    if (!section) return;

    const isMobile = window.innerWidth <= 767;
    Object.assign(section.style, isMobile ? {
      position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      width: '96vw', maxWidth: '110px', zIndex: '9999',
      background: '#181a20', borderRadius: '8px', boxShadow: '0 2px 10px #000a',
      padding: '3px 2px 2px 2px', margin: '0', display: 'block', fontSize: '0.75em'
    } : {
      position: 'fixed', left: '20px', bottom: '20px', transform: '', width: '340px',
      maxWidth: '90vw', zIndex: '9999', background: '#181a20', borderRadius: '12px',
      boxShadow: '0 2px 16px #000a', padding: '18px 12px 12px 12px', margin: '0', display: 'block'
    });

    section.innerHTML = 'Checking Discord link status...';

    try {
      const aliasData = await fetchJSON(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`);
      if (!aliasData.alias) throw new Error('No alias');

      // Check if already linked
      const sqlData = await fetchJSON(`https://api.grab-tutorials.live/get-alias?alias=${encodeURIComponent(aliasData.alias)}`).catch(() => null);
      if (sqlData?.alias === aliasData.alias) {
        section.style.display = 'none';
        return;
      }

      section.innerHTML = `
        <button id="generateDiscordCodeBtn" style="
          background: linear-gradient(90deg, #5865f2 0%, #4752c4 100%);
          color: #fff; border: none; border-radius: 4px; padding: 2px 6px;
          font-size: 0.75em; font-weight: 600; box-shadow: 0 1px 2px #0002;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          outline: none; margin-bottom: 2px; letter-spacing: 0.01em;
        ">Generate Discord Link Code</button>
        <div id="discordCodeDisplay" style="margin-top:2px;"></div>
        <div id="discordCodeInfo" style="font-size:0.7em;color:#aaa;margin-top:1px;"></div>
        <button id="refreshDiscordLinkBtn" style="margin-top:8px;font-size:0.8em; background:none; border:none; cursor:pointer;">
          <img src="https://assets.grab-tutorials.live/!assets/refresh-icon.png" alt="Refresh" style="width:22px;height:22px;vertical-align:middle;">
        </button>
      `;

      document.getElementById('generateDiscordCodeBtn').onclick = async () => {
        const display = section.querySelector('#discordCodeDisplay');
        const info = section.querySelector('#discordCodeInfo');
        display.textContent = 'Generating...';
        try {
          const data = await fetchJSON('https://api.grab-tutorials.live/generateLinkCode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          if (data.alreadyLinked) {
            section.style.display = 'none';
            return;
          }

          display.innerHTML = `
            Your code: <span id="discordGeneratedCode" style="
              user-select: all; font-weight: bold; background: #222; color: #fff;
              padding: 2px 6px; border-radius: 4px; cursor: text;
            ">${data.code}</span>
            <button id="copyDiscordCodeBtn" style="margin-left:8px; font-size:0.9em; background:none; border:none; cursor:pointer;">
              <img src="https://assets.grab-tutorials.live/!assets/copy-icon.png" alt="Copy" style="width:14px;height:14px;vertical-align:middle;">
            </button>
          `;
          info.textContent = `Use /account link code: ${data.code} in Discord within 10 minutes.`;

          document.getElementById('copyDiscordCodeBtn').onclick = () => {
            const codeSpan = document.getElementById('discordGeneratedCode');
            if (navigator.clipboard) navigator.clipboard.writeText(codeSpan.textContent);
            else {
              const range = document.createRange();
              range.selectNodeContents(codeSpan);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
              document.execCommand('copy');
              sel.removeAllRanges();
            }
            codeSpan.style.outline = '2px solid #4caf50';
            setTimeout(() => codeSpan.style.outline = '', 800);
          };
        } catch {
          display.textContent = 'Error generating code.';
        }
      };

      document.getElementById('refreshDiscordLinkBtn').onclick = () => window.location.reload();

    } catch {
      section.style.display = 'none';
    }
  };

  const hideDiscordLinkSection = () => {
    const section = document.getElementById('discordLinkSection');
    if (section) { section.style.display = 'none'; section.innerHTML = ''; }
  };

  const applyColours = (primary, secondary) => {
    const lMenu = document.getElementById('LMenu');
    if (lMenu && getComputedStyle(lMenu).display === 'block') {
      const mMenu = document.getElementById('MMenu');
      const menuButtons = document.getElementById('menuButtons');
      if (mMenu) {
        mMenu.style.background = primary;
        mMenu.style.setProperty('--menu-gradient', `linear-gradient(to top, rgba(177,65,65,0) 0%, ${primary} 100%)`);
      }
      if (menuButtons) menuButtons.style.setProperty('--button-gradient', `linear-gradient(to top, ${primary}, transparent)`);
    }
    const lButton = document.getElementById('L');
    if (lButton) lButton.style.background = secondary;
  };

  const setupLoginButton = () => {
    const isMobile = window.innerWidth <= 767;
    loginTextEl.textContent = isMobile ? 'Login' : 'Login with Meta';
    loginMetaEl.onclick = () => {
      window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
    };
    hideDiscordLinkSection();
    localStorage.removeItem('hexColor');
    localStorage.removeItem('hexColorSecondary');
  };

  const proceedWithSession = async (sessionId) => {
    if (!sessionId) { setupLoginButton(); return; }
    try {
      await delay(250);
      const data = await fetchJSON(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`);
      if (!data.alias) throw new Error('Invalid session');

      loginTextEl.textContent = data.alias;
      loginMetaEl.textContent = 'Logout';
      loggedInEl.style.display = 'none';
      loginWithBtnEl.style.display = 'none';

      localStorage.setItem('hexColor', data.hexColor);
      localStorage.setItem('hexColorSecondary', data.hexColorSecondary);
      applyColours(data.hexColor, data.hexColorSecondary);

      showDiscordLinkSection(sessionId);

      loginMetaEl.onclick = () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('hexColor');
        localStorage.removeItem('hexColorSecondary');
        loginTextEl.textContent = 'Login with Meta';
        loginMetaEl.textContent = 'Login';
        loggedInEl.style.display = 'block';
        loginWithBtnEl.style.display = 'block';
        applyColours('#888888', '#888888');
        hideDiscordLinkSection();
        setupLoginButton();
      };

    } catch {
      localStorage.removeItem('sessionId');
      setupLoginButton();
      hideDiscordLinkSection();
    }
  };

  const handleFragment = async () => {
    const fragment = window.location.hash.substring(1);
    if (!fragment) return false;

    let decoded;
    try {
      decoded = JSON.parse(atob(fragment));
      localStorage.setItem('fragmentData', JSON.stringify(decoded));
    } catch { return false; }

    if (!decoded?.code) return false;

    window.history.replaceState(null, '', window.location.pathname);

    try {
      const data = await fetchJSON('https://api.grab-tutorials.live/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decoded)
      });
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.removeItem('fragmentData');
        proceedWithSession(data.sessionId);
      }
    } catch {
      localStorage.removeItem('fragmentData');
      setupLoginButton();
    }
    return true;
  };

  const handleStoredFragment = async () => {
    const stored = localStorage.getItem('fragmentData');
    if (!stored) return false;

    try {
      const data = JSON.parse(stored);
      const res = await fetchJSON('https://api.grab-tutorials.live/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.sessionId) {
        localStorage.setItem('sessionId', res.sessionId);
        localStorage.removeItem('fragmentData');
        proceedWithSession(res.sessionId);
      }
    } catch {
      localStorage.removeItem('fragmentData');
      setupLoginButton();
    }
    return true;
  };

  (async () => {
    const handled = await handleFragment();
    if (!handled) {
      const storedHandled = await handleStoredFragment();
      if (!storedHandled) proceedWithSession(sessionId);
    }
  })();

});
