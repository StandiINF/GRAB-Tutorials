window.addEventListener('DOMContentLoaded', () => {
  function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  const loginMetaElement = document.getElementById('loginMeta');
  const loginTextElement = document.getElementById('loginText');

  let sessionId = localStorage.getItem('sessionId');

  function proceedWithSession(sessionId) {
      if (sessionId) {
          delay(1500)
              .then(() => {
                  return fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`, {
                      method: 'GET',
                      credentials: 'include',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                  });
              })
              .then(response => {
                  if (!response.ok) {
                      if (response.status === 403) {
                          console.error('Session is invalid or expired.');
                          localStorage.removeItem('sessionId');
                          setupLoginButton();
                      }
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  return response.json();
              })
              .then(data => {
                  if (data.alias) {
                      console.log(`User is logged in as ${data.alias}`);
                      loginTextElement.textContent = `${data.alias}`;
                      loginMetaElement.addEventListener('click', () => {
                          localStorage.removeItem('sessionId');
                          loginTextElement.textContent = 'Login with Meta';
                          loginMetaElement.onclick = () => {
                              window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
                          };
                          console.log('Logged out successfully.');
                      });
                      // Generate a new sessionId only if the user is logged in
                      generateNewSessionId();
                  } else {
                      console.log('Session expired or invalid');
                      localStorage.removeItem('sessionId');
                      setupLoginButton();
                  }
              })
              .catch(error => {
                  console.error('Error verifying session:', error);
                  localStorage.removeItem('sessionId');
                  setupLoginButton();
              });
      } else {
          console.log('No session found in localStorage.');
          setupLoginButton();
      }
  }

  function generateNewSessionId() {
      return fetch('https://api.grab-tutorials.live/newSession', {
          method: 'POST',
          credentials: 'include',
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`Failed to generate new session ID. HTTP status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          if (data.sessionId) {
              localStorage.setItem('sessionId', data.sessionId);
              console.log('New session ID generated:', data.sessionId);
          } else {
              throw new Error('No session ID returned from server.');
          }
      })
      .catch(error => {
          console.error('Error generating new session ID:', error);
      });
  }

  function setupLoginButton() {
      loginTextElement.textContent = 'Login with Meta';
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
              console.log('Login Response:', data);

              if (data.sessionId && data.alias) {
                  localStorage.setItem('sessionId', data.sessionId);
                  console.log('Session ID saved to localStorage.');

                  window.history.replaceState(null, '', window.location.pathname);

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
      proceedWithSession(sessionId);
  }
});
