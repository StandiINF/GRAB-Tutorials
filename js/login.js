window.addEventListener('DOMContentLoaded', () => {

  const loginMetaEl = document.getElementById('loginMeta');
  const loginTextEl = document.getElementById('loginText');
  const loggedInEl = document.getElementById('loggedin');
  const loginWithBtnEl = document.getElementById('loginwithbutton');

  let sessionId = localStorage.getItem('sessionId');

  const fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, { ...options, credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const setupLoginButton = () => {
    loginMetaEl.onclick = () => {
      const redirectUri = encodeURIComponent("https://grab-tutorials.live/");

      window.location.href =
        `https://auth.oculus.com/sso/?` +
        `organization_id=638365782695092&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=token`;
    };

    hideDiscordLinkSection();
  };

  const handleFragment = async () => {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (!accessToken) return false;

    window.history.replaceState(null, '', window.location.pathname);

    try {
      const data = await fetchJSON('https://api.grab-tutorials.live/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken })
      });

      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        proceedWithSession(data.sessionId);
      }

    } catch (err) {
      console.error("Login failed:", err);
      setupLoginButton();
    }

    return true;
  };

  const proceedWithSession = async (sessionId) => {
    if (!sessionId) {
      setupLoginButton();
      return;
    }

    try {
      const data = await fetchJSON(
        `https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`
      );

      if (!data.alias) throw new Error("Invalid session");

      loginTextEl.textContent = data.alias;
      loginMetaEl.textContent = 'Logout';
      loggedInEl.style.display = 'none';
      loginWithBtnEl.style.display = 'none';

      loginMetaEl.onclick = () => {
        localStorage.removeItem('sessionId');
        location.reload();
      };

      showDiscordLinkSection(sessionId);

    } catch (err) {
      console.error(err);
      localStorage.removeItem('sessionId');
      setupLoginButton();
      hideDiscordLinkSection();
    }
  };

  const showDiscordLinkSection = async (sessionId) => {
    const section = document.getElementById('discordLinkSection');
    if (!section) return;

    const isMobile = window.innerWidth <= 767;

    Object.assign(section.style, isMobile ? {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '96vw',
      maxWidth: '110px',
      zIndex: '9999',
      background: '#181a20',
      borderRadius: '8px',
      boxShadow: '0 2px 10px #000a',
      padding: '3px 2px',
      display: 'block',
      fontSize: '0.75em'
    } : {
      position: 'fixed',
      left: '20px',
      bottom: '20px',
      width: '340px',
      maxWidth: '90vw',
      zIndex: '9999',
      background: '#181a20',
      borderRadius: '12px',
      boxShadow: '0 2px 16px #000a',
      padding: '18px 12px',
      display: 'block'
    });

    section.innerHTML = 'Checking Discord link status...';

    try {
      const aliasData = await fetchJSON(
        `https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`
      );

      if (!aliasData.alias) throw new Error('No alias');

      section.innerHTML = `
        <button id="generateDiscordCodeBtn">Generate Discord Link Code</button>
        <div id="discordCodeDisplay"></div>
        <div id="discordCodeInfo"></div>
        <button id="refreshDiscordLinkBtn">Refresh</button>
      `;

      document.getElementById('generateDiscordCodeBtn').onclick = async () => {
        const display = section.querySelector('#discordCodeDisplay');
        display.textContent = 'Generating...';

        try {
          const data = await fetchJSON('https://api.grab-tutorials.live/generateLinkCode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });

          display.innerHTML = `Your code: <b>${data.code}</b>`;
          section.querySelector('#discordCodeInfo').textContent =
            `Use /account link code in Discord`;

        } catch {
          display.textContent = 'Error generating code';
        }
      };

      document.getElementById('refreshDiscordLinkBtn').onclick =
        () => window.location.reload();

    } catch {
      section.style.display = 'none';
    }
  };

  const hideDiscordLinkSection = () => {
    const section = document.getElementById('discordLinkSection');
    if (section) {
      section.style.display = 'none';
      section.innerHTML = '';
    }
  };

  (async () => {
    const handled = await handleFragment();

    if (!handled) {
      if (sessionId) {
        proceedWithSession(sessionId);
      } else {
        setupLoginButton();
      }
    }
  })();

});