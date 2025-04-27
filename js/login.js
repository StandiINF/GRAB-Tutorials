window.addEventListener('DOMContentLoaded', () => {
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

    // Step 1: POST the code and org_scoped_id to /login
    fetch('https://api.grab-tutorials.live/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies/auth tokens are included
      body: JSON.stringify(decodedData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Worker Response (login):', data);

        if (data.alias && data.token) {
          // Step 2: Send token to backend to store it
          fetch('https://api.grab-tutorials.live/storeToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies/auth tokens are included
            body: JSON.stringify({ alias: data.alias, token: data.token })
          })
            .then(response => response.json())
            .then(storeData => {
              console.log('Token stored in backend:', storeData);
            })
            .catch(error => {
              console.error('Error storing token:', error);
            });

          console.log('Alias and token sent to backend.');

          // Step 3: (Optional) Verify by calling /getAlias
          fetch(`https://api.grab-tutorials.live/getAlias?alias=${encodeURIComponent(data.alias)}&token=${encodeURIComponent(data.token)}`, {
            method: 'GET',
            credentials: 'include', // Ensure credentials are included
          })
            .then(response => response.json())
            .then(verifyData => {
              console.log('Verification from /getAlias:', verifyData);

              if (verifyData.alias) {
                console.log(`Alias verified: ${verifyData.alias}`);
              } else {
                console.error('Alias verification failed.', verifyData);
              }
            })
            .catch(error => {
              console.error('Error verifying alias:', error);
            });

        } else {
          console.error('Alias or token missing in response.', data);
        }
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  } else {
    console.log('No fragment found in URL.');
  }
});
