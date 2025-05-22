window.addEventListener('DOMContentLoaded', () => {
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    const loginMetaElement = document.getElementById('loginMeta');
    const loginTextElement = document.getElementById('loginText');
    const loggedinElement = document.getElementById('loggedin');
    const loginwithbuttonElement = document.getElementById('loginwithbutton');
  
    let sessionId = localStorage.getItem('sessionId');
  
    async function proceedWithSession(sessionId) {
        if (sessionId) {
            try {
                await delay(1500);
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
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                localStorage.removeItem('sessionId');
                localStorage.removeItem('fragmentData');
                localStorage.removeItem('hexColor');
                localStorage.removeItem('hexColorSecondary');
                setupLoginButton();
            }
        } else {
            setupLoginButton();
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