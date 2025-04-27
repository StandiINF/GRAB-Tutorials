window.addEventListener('DOMContentLoaded', () => {
  function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  const loginMetaElement = document.getElementById('loginMeta');
  const loginTextElement = document.getElementById('loginText');

//  generate new sessionId
  function generateSessionId() {
      return fetch('https://api.grab-tutorials.live/newSession', {
          method: 'POST',
          credentials: 'include',
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          if (data.sessionId) {
              localStorage.setItem('sessionId', data.sessionId);
              console.log('New sessionId generated and saved:', data.sessionId);
              return data.sessionId;
          } else {
              throw new Error('Failed to generate sessionId');
          }
      })
      .catch(error => {
          console.error('Error generating sessionId:', error);
      });
  }

  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
      console.log('No sessionId found. Generating a new one...');
      generateSessionId().then(newSessionId => {
          sessionId = newSessionId;

          proceedWithSession(sessionId);
      });
  } else {
      console.log('Existing sessionId found. Replacing with a new one...');
      generateSessionId().then(newSessionId => {
          sessionId = newSessionId;

          proceedWithSession(sessionId);
      });
  }

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
                  } else {
                      console.log('Session expired or invalid');
                  }
              })
              .catch(error => {
                  console.error('Error verifying session:', error);
                  loginTextElement.textContent = 'Login with Meta';
                  loginMetaElement.onclick = () => {
                      window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
                  };
              });
      } else {
          console.log('No session found in localStorage.');

          loginMetaElement.addEventListener('click', () => {
              window.location.href = 'https://auth.oculus.com/sso/?organization_id=638365782695092&redirect_uri=https%3A%2F%2Fgrab-tutorials.live%2F';
          });

          const fragment = window.location.hash.substring(1);

          if (fragment) {
              let decodedData;
              try {
                  const decodedFragment = atob(fragment);
                  decodedData = JSON.parse(decodedFragment);
              } catch (e) {
                  console.error('Failed to decode and parse fragment:', e);
                  return;
              }

              // Adjust validation logic to check for required fields
              if (!decodedData || typeof decodedData !== 'object' || !decodedData.code || !decodedData.org_scoped_id) {
                  console.error('Invalid or missing data in decoded fragment:', decodedData);
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

                          window.location.replace('https://grab-tutorials.live/');

                          delay(3000)
                              .then(() => {
                                  return fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(data.sessionId)}`);
                              })
                              .then(response => response.json())
                              .then(verifyData => {
                                  console.log('Session verified:', verifyData);
                                  if (verifyData.alias) {
                                      console.log(`User is logged in as ${verifyData.alias}`);

                                      loginMetaElement.textContent = `${verifyData.alias}`;
                                  }
                              })
                              .catch(error => {
                                  console.error('Error verifying session:', error);
                              });
                      } else {
                          console.error('Missing sessionId or alias.');
                      }
                  })
                  .catch(error => {
                      console.error('Error during login:', error);
                  });
          } else {
              console.log('No fragment found in URL.');
          }
      }
  }
});