window.addEventListener('DOMContentLoaded', () => {
  // Check if sessionId is already in localStorage (indicating a logged-in session)
  const sessionId = localStorage.getItem('sessionId');
  const loginMetaButton = document.getElementById('loginMeta'); // Reference to the login button

  if (sessionId) {
    // If sessionId exists, attempt to verify the session by calling the backend
    fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionId}`,  // If token-based authentication is needed
      },
      credentials: 'include', // Ensure cookies/auth tokens are included
    })
      .then(response => {
        if (response.status === 403) {
          console.error('Session is not valid or has expired');
          // Redirect to login page or handle session expiration
          window.location.replace('https://grab-tutorials.live/login');
        }
        return response.json();
      })
      .then(data => {
        if (data.alias) {
          console.log(`User is logged in as ${data.alias}`);
          // Update the text of the login button with the user's alias
          loginMetaButton.textContent = `Logged in as ${data.alias}`;
        } else {
          console.log('Session expired or invalid');
        }
      })
      .catch(error => {
        console.error('Error verifying session:', error);
      });
  } else {
    console.log('No session found in localStorage.');
    // Proceed with login flow if no sessionId is found
    const fragment = window.location.hash.substring(1);

    if (fragment) {
      let decodedData;
      try {
        const decodedFragment = atob(fragment); // Decode fragment data
        decodedData = JSON.parse(decodedFragment); // Parse it into an object
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
          console.log('Login Response:', data);

          if (data.sessionId && data.alias) {
            // Step 2: Store sessionId in localStorage to persist session
            localStorage.setItem('sessionId', data.sessionId);

            console.log('Session ID saved to localStorage.');

            // Update the login button text with the alias
            loginMetaButton.textContent = `Logged in as ${data.alias}`;

            // Step 3: Redirect to the homepage (without the fragment in the URL)
            window.location.replace('https://grab-tutorials.live/');

            // Optionally, call /getAlias to verify session and restore user data
            fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(data.sessionId)}`)
              .then(response => response.json())
              .then(verifyData => {
                console.log('Session verified:', verifyData);
                if (verifyData.alias) {
                  console.log(`User is logged in as ${verifyData.alias}`);
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
