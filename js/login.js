window.addEventListener('DOMContentLoaded', () => {
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    const loginMetaElement = document.getElementById('loginMeta');
    const loginTextElement = document.getElementById('loginText');
    const loggedinElement = document.getElementById('loggedin');
    const loginwithbuttonElement = document.getElementById('loginwithbutton');
  
    let sessionId = localStorage.getItem('sessionId');
  
    async function showDiscordLinkSection(sessionId) {
        const discordLinkSection = document.getElementById('discordLinkSection');
        if (!discordLinkSection) return;
        const isMobile = window.innerWidth <= 767;
        if (isMobile) {
            discordLinkSection.style.position = 'fixed';
            discordLinkSection.style.left = '50%';
            discordLinkSection.style.top = '50%';
            discordLinkSection.style.transform = 'translate(-50%, -50%)';
            discordLinkSection.style.width = '96vw';
            discordLinkSection.style.maxWidth = '110px';
            discordLinkSection.style.zIndex = '9999';
            discordLinkSection.style.background = '#181a20';
            discordLinkSection.style.borderRadius = '8px';
            discordLinkSection.style.boxShadow = '0 2px 10px #000a';
            discordLinkSection.style.padding = '3px 2px 2px 2px';
            discordLinkSection.style.margin = '0';
            discordLinkSection.style.display = 'block';
            discordLinkSection.style.fontSize = '0.75em';
        } else {
            discordLinkSection.style.position = 'fixed';
            discordLinkSection.style.left = '20px';
            discordLinkSection.style.bottom = '20px';
            discordLinkSection.style.top = '';
            discordLinkSection.style.transform = '';
            discordLinkSection.style.width = '340px';
            discordLinkSection.style.maxWidth = '90vw';
            discordLinkSection.style.zIndex = '9999';
            discordLinkSection.style.background = '#181a20';
            discordLinkSection.style.borderRadius = '12px';
            discordLinkSection.style.boxShadow = '0 2px 16px #000a';
            discordLinkSection.style.padding = '18px 12px 12px 12px';
            discordLinkSection.style.margin = '0';
            discordLinkSection.style.display = 'block';
        }
        discordLinkSection.innerHTML = 'Checking Discord link status...';
        discordLinkSection.style.display = 'block';
        try {
            const aliasRes = await fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!aliasRes.ok) throw new Error('Failed to get alias');
            const aliasData = await aliasRes.json();
            if (!aliasData.alias) throw new Error('No alias found');

            const sqlRes = await fetch(`https://api.grab-tutorials.live/get-alias?alias=${encodeURIComponent(aliasData.alias)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (sqlRes.ok) {
                const sqlData = await sqlRes.json();
                if (sqlData.alias && sqlData.alias === aliasData.alias) {
                    discordLinkSection.style.display = 'none';
                    discordLinkSection.innerHTML = '';
                    return;
                }
            }

            discordLinkSection.innerHTML = `
                <button id="generateDiscordCodeBtn" style="
                    background: linear-gradient(90deg, #5865f2 0%, #4752c4 100%);
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-size: 0.75em;
                    font-weight: 600;
                    box-shadow: 0 1px 2px #0002;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s;
                    outline: none;
                    margin-bottom: 2px;
                    letter-spacing: 0.01em;
                    min-width: 0;
                    min-height: 0;
                " onmouseover="this.style.background='linear-gradient(90deg,#4752c4 0%,#5865f2 100%)';this.style.transform='scale(1.01)';"
                  onmouseout="this.style.background='linear-gradient(90deg,#5865f2 0%,#4752c4 100%)';this.style.transform='';"
                >Generate Discord Link Code</button>
                <div id="discordCodeDisplay" style="margin-top:2px;"></div>
                <div id="discordCodeInfo" style="font-size:0.7em;color:#aaa;margin-top:1px;"></div>
                <button id="refreshDiscordLinkBtn" style="margin-top:8px;font-size:0.8em; background:none; border:none; cursor:pointer;">
                    <img src="https://assets.grab-tutorials.live/!assets/refresh-icon.png" alt="Refresh" style="width:22px;height:22px;vertical-align:middle;">
                </button>
            `;
            document.getElementById('generateDiscordCodeBtn').onclick = async () => {
                discordLinkSection.querySelector('#discordCodeDisplay').textContent = 'Generating...';
                try {
                    const res2 = await fetch('https://api.grab-tutorials.live/generateLinkCode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ sessionId })
                    });
                    if (!res2.ok) throw new Error('Failed to generate code');
                    const data2 = await res2.json();
                    if (data2.alreadyLinked) {
                        discordLinkSection.style.display = 'none';
                        discordLinkSection.innerHTML = '';
                        return;
                    }
                    discordLinkSection.querySelector('#discordCodeDisplay').innerHTML = `
                        Your code: <span id="discordGeneratedCode" style="user-select:all; font-weight:bold; background:#222; color:#fff; padding:2px 6px; border-radius:4px; cursor:text;">${data2.code}</span>
                        <button id="copyDiscordCodeBtn" style="margin-left:8px; font-size:0.9em; background:none; border:none; cursor:pointer; vertical-align:middle; padding:0;">
                            <img src="https://assets.grab-tutorials.live/!assets/copy-icon.png" alt="Copy" style="width:14px;height:14px;vertical-align:middle;">
                        </button>
                    `;
                    discordLinkSection.querySelector('#discordCodeInfo').textContent = 'Use /account link code:' + data2.code + ' in Discord within 10 minutes.';

                    const copyBtn = document.getElementById('copyDiscordCodeBtn');
                    const codeSpan = document.getElementById('discordGeneratedCode');
                    if (copyBtn && codeSpan) {
                        copyBtn.onclick = () => {
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(codeSpan.textContent);
                            } else {
                                const range = document.createRange();
                                range.selectNodeContents(codeSpan);
                                const sel = window.getSelection();
                                sel.removeAllRanges();
                                sel.addRange(range);
                                try { document.execCommand('copy'); } catch (e) {}
                                sel.removeAllRanges();
                            }
                            codeSpan.style.outline = "2px solid #4caf50";
                            setTimeout(() => { codeSpan.style.outline = ""; }, 800);
                        };
                    }
                } catch (e) {
                    discordLinkSection.querySelector('#discordCodeDisplay').textContent = 'Error generating code.';
                }
            };
            document.getElementById('refreshDiscordLinkBtn').onclick = () => {
                window.location.reload();
            };
        } catch (e) {
            discordLinkSection.style.display = 'none';
            discordLinkSection.innerHTML = '';
        }
    }

    async function hideDiscordLinkSection() {
        const discordLinkSection = document.getElementById('discordLinkSection');
        if (discordLinkSection) {
            discordLinkSection.style.display = 'none';
            discordLinkSection.innerHTML = '';
        }
    }

    async function proceedWithSession(sessionId) {
        if (sessionId) {
            try {
                await delay(250);
                const response = await fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
  
                if (!response.ok) {
                    if (response.status === 403) {
                        console.error('Session is invalid or expired.');
                        localStorage.removeItem('sessionId');
                        localStorage.removeItem('fragmentData');
                        localStorage.removeItem('hexColor');
                        localStorage.removeItem('hexColorSecondary');
                        setupLoginButton();
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
  
                const data = await response.json();
                if (data.alias) {
                    console.log(`User is logged in as ${data.alias}`);
                    const userColour = data.hexColor;
                    const userColourSecondary = data.hexColorSecondary;

                    localStorage.setItem('hexColor', userColour);
                    localStorage.setItem('hexColorSecondary', userColourSecondary);

                    loginTextElement.textContent = `${data.alias}`;
                    loginMetaElement.textContent = 'Logout';
                    loggedinElement.style.display = 'none';
                    loginwithbuttonElement.style.display = 'none';

                    applyUserColour(userColour);
                    applySecondaryColour(userColourSecondary);

                    showDiscordLinkSection(sessionId);

                    loginMetaElement.addEventListener('click', () => {
                        localStorage.removeItem('sessionId');
                        loginTextElement.textContent = 'Login with Meta';
                        loginMetaElement.textContent = 'Login';
                        loggedinElement.style.display = 'block';
                        loginwithbuttonElement.style.display = 'block';

                        localStorage.removeItem('hexColor');
                        localStorage.removeItem('hexColorSecondary');

                        applyUserColour('#888888');
                        applySecondaryColour('#888888');

                        hideDiscordLinkSection();

                        const lMenu = document.getElementById('LMenu');
                        if (lMenu && window.getComputedStyle(lMenu).display === 'block') {
                            const mMenu = document.getElementById('MMenu');
                            const menuButtons = document.getElementById('menuButtons');
                            if (mMenu) {
                                mMenu.style.background = '#888888';
                                mMenu.style.setProperty('--menu-gradient', 'linear-gradient(to top, rgba(177, 65, 65, 0) 0%, #888888 100%)');
                            }
                            if (menuButtons) {
                                menuButtons.style.setProperty('--button-gradient', 'linear-gradient(to top, #888888, transparent)');
                            }
                        }

                        loginMetaElement.onclick = () => {
                            window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
                        };
                        console.log('Logged out successfully.');
                    });
                } else {
                    console.log('Session expired or invalid');
                    localStorage.removeItem('sessionId');
                    localStorage.removeItem('fragmentData');
                    localStorage.removeItem('hexColor');
                    localStorage.removeItem('hexColorSecondary');
                    setupLoginButton();
                    hideDiscordLinkSection();
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                localStorage.removeItem('sessionId');
                localStorage.removeItem('fragmentData');
                localStorage.removeItem('hexColor');
                localStorage.removeItem('hexColorSecondary');
                setupLoginButton();
                hideDiscordLinkSection();
            }
        } else {
            setupLoginButton();
            hideDiscordLinkSection();
        }
    }
  
    function setupLoginButton() {
        const isMobile = window.innerWidth <= 767;
        loginTextElement.textContent = isMobile ? 'Login' : 'Login with Meta';
        loginMetaElement.onclick = () => {
            window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
        };
        localStorage.removeItem('hexColor');
        localStorage.removeItem('hexColorSecondary');
        hideDiscordLinkSection();
    }
  
    function applyUserColour(colour) {
        const lMenu = document.getElementById('LMenu');
        if (lMenu && window.getComputedStyle(lMenu).display === 'block') {
            const mMenu = document.getElementById('MMenu');
            const menuButtons = document.getElementById('menuButtons');
            if (mMenu) {
                mMenu.style.background = colour;
                mMenu.style.setProperty('--menu-gradient', `linear-gradient(to top, rgba(177, 65, 65, 0) 0%, ${colour} 100%)`);
            }
            if (menuButtons) {
                menuButtons.style.setProperty('--button-gradient', `linear-gradient(to top, ${colour}, transparent)`);
            }
        }
    }

    function applySecondaryColour(colour) {
        const lButton = document.getElementById('L');
        lButton.style.background = colour;
    }

    const fragment = window.location.hash.substring(1);
  
    if (fragment) {
        let decodedData;
        try {
            const decodedFragment = atob(fragment);
            decodedData = JSON.parse(decodedFragment);
            localStorage.setItem('fragmentData', JSON.stringify(decodedData));
        } catch (e) {
            console.error('Failed to decode and parse fragment:', e);
            localStorage.removeItem('fragmentData');
            setupLoginButton();
            return;
        }
  
        if (!decodedData || typeof decodedData !== 'object' || !decodedData.code || !decodedData.org_scoped_id) {
            console.error('Invalid or missing data in decoded fragment:', decodedData);
            localStorage.removeItem('fragmentData');
            setupLoginButton();
            return;
        }
  
        window.history.replaceState(null, '', window.location.pathname);
  
        delay(1000)
            .then(() => {
                return fetch('https://api.grab-tutorials.live/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(decodedData),
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
  
                if (data.sessionId && data.alias) {
                    localStorage.setItem('sessionId', data.sessionId);
  
                    localStorage.removeItem('fragmentData');
                    proceedWithSession(data.sessionId);
                } else {
                    console.error('Missing sessionId or alias.');
                    localStorage.removeItem('fragmentData');
                    localStorage.removeItem('hexColor');
                    localStorage.removeItem('hexColorSecondary');
                    setupLoginButton();
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                localStorage.removeItem('fragmentData');
                localStorage.removeItem('hexColor');
                localStorage.removeItem('hexColorSecondary');
                setupLoginButton();
            });
    } else {
        const storedFragment = localStorage.getItem('fragmentData');
        if (storedFragment) {
            const decodedData = JSON.parse(storedFragment);
  
            delay(1500)
                .then(() => {
                    return fetch('https://api.grab-tutorials.live/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(decodedData),
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
  
                    if (data.sessionId && data.alias) {
                        localStorage.setItem('sessionId', data.sessionId);
  
                        localStorage.removeItem('fragmentData');
                        proceedWithSession(data.sessionId);
                    } else {
                        console.error('Missing sessionId or alias.');
                        localStorage.removeItem('fragmentData');
                        localStorage.removeItem('hexColor');
                        localStorage.removeItem('hexColorSecondary');
                        setupLoginButton();
                    }
                })
                .catch(error => {
                    console.error('Error during login:', error);
                    localStorage.removeItem('fragmentData');
                    localStorage.removeItem('hexColor');
                    localStorage.removeItem('hexColorSecondary');
                    setupLoginButton();
                });
        } else {
            proceedWithSession(sessionId);
        }
    }
});