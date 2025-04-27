window.addEventListener('DOMContentLoaded', () => {

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const sessionId = localStorage.getItem('sessionId');
  const loginMetaElement = document.getElementById('loginMeta');
  
  if (sessionId) {

    delay(3000)
      .then(() => {
        return fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`);
      })
      .then(response => response.json())
      .then(data => {
        if (data.alias) {
          console.log(`User is logged in as ${data.alias}`);
          loginMetaElement.textContent = `Logged in as ${data.alias}`;
        } else {
          console.log('Session expired or invalid');

        }
      })
      .catch(error => {
        console.error('Error verifying session:', error);
      });
  } else {
    console.log('No session found in localStorage.');

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

      delay(3000)
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
        .then(response => response.json())
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

                  loginMetaElement.textContent = `Logged in as ${verifyData.alias}`;
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
});
