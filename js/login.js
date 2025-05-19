window.addEventListener('DOMContentLoaded', () => {
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const loginMetaElement = document.getElementById('loginMeta');
    const loginTextElement = document.getElementById('loginText');

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

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
                        document.cookie = 'sessionId=; Max-Age=0; path=/';
                        setupLoginButton();
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.alias) {
                    console.log(`User is logged in as ${data.alias}`);
                    loginTextElement.textContent = `${data.alias}`;
                    loginMetaElement.addEventListener('click', () => {
                        document.cookie = 'sessionId=; Max-Age=0; path=/';
                        loginTextElement.textContent = 'Login with Meta';
                        loginMetaElement.onclick = () => {
                            window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
                        };
                        console.log('Logged out successfully.');
                    });
                } else {
                    console.log('Session expired or invalid');
                    document.cookie = 'sessionId=; Max-Age=0; path=/';
                    setupLoginButton();
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                document.cookie = 'sessionId=; Max-Age=0; path=/';
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
    }

    const fragment = window.location.hash.substring(1);

    if (fragment) {
        let decodedData;
        try {
            const decodedFragment = atob(fragment);
            decodedData = JSON.parse(decodedFragment);
        } catch (e) {
            console.error('Failed to decode and parse fragment:', e);
            setupLoginButton();
            return;
        }

        if (!decodedData || typeof decodedData !== 'object' || !decodedData.code || !decodedData.org_scoped_id) {
            console.error('Invalid or missing data in decoded fragment:', decodedData);
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
                    proceedWithSession(data.sessionId);
                } else {
                    console.error('Missing sessionId or alias.');
                    setupLoginButton();
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                setupLoginButton();
            });
    } else {
        const sessionId = getCookie('sessionId');
        proceedWithSession(sessionId);
    }
});
