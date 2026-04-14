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

    section.style.display = 'block';
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
        const display = document.getElementById('discordCodeDisplay');
        const info = document.getElementById('discordCodeInfo');

        display.textContent = "Generating...";

        try {
          const data = await fetchJSON(
            'https://api.grab-tutorials.live/generateLinkCode',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            }
          );

          display.innerHTML = `
            Your code: <b>${data.code}</b>
          `;

          info.textContent = "Use this code in Discord /account link";
        } catch {
          display.textContent = "Error generating code";
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

  const applyColours = (primary, secondary) => {
    const lMenu = document.getElementById('LMenu');

    if (lMenu && getComputedStyle(lMenu).display === 'block') {
      const mMenu = document.getElementById('MMenu');
      const menuButtons = document.getElementById('menuButtons');

      if (mMenu) {
        mMenu.style.background = primary;
        mMenu.style.setProperty('--menu-gradient',
          `linear-gradient(to top, rgba(0,0,0,0), ${primary})`
        );
      }

      if (menuButtons) {
        menuButtons.style.setProperty('--button-gradient',
          `linear-gradient(to top, ${primary}, transparent)`
        );
      }
    }

    const lButton = document.getElementById('L');
    if (lButton) lButton.style.background = secondary;
  };

  const setupLoginButton = () => {
    loginMetaEl.onclick = () => {

      window.location.href =
        "https://auth.oculus.com/sso/?" +
        new URLSearchParams({
          organization_id: "638365782695092",
          redirect_uri: "https://grab-tutorials.live/",
          response_type: "token"
        });

    };

    hideDiscordLinkSection();
    localStorage.removeItem('hexColor');
    localStorage.removeItem('hexColorSecondary');
  };

  const proceedWithSession = async (sessionId) => {
    if (!sessionId) return setupLoginButton();

    try {
      await delay(200);

      const data = await fetchJSON(
        `https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`
      );

      if (!data.alias) throw new Error("Invalid session");

      loginTextEl.textContent = data.alias;
      loginMetaEl.textContent = "Logout";

      loggedInEl.style.display = "none";
      loginWithBtnEl.style.display = "none";

      localStorage.setItem('hexColor', data.hexColor);
      localStorage.setItem('hexColorSecondary', data.hexColorSecondary);

      applyColours(data.hexColor, data.hexColorSecondary);

      showDiscordLinkSection(sessionId);

      loginMetaEl.onclick = () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('hexColor');
        localStorage.removeItem('hexColorSecondary');

        loginTextEl.textContent = 'Login with Meta';
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
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');

    if (!access_token) return false;

    window.history.replaceState(null, '', window.location.pathname);

    try {
      const data = await fetchJSON('https://api.grab-tutorials.live/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token })
      });

      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        proceedWithSession(data.sessionId);
      }

    } catch {
      setupLoginButton();
    }

    return true;
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