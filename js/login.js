window.addEventListener('DOMContentLoaded', () => {
  // Check if there's a sessionId in localStorage on page load
  const sessionId = localStorage.getItem('sessionId');
  
  if (sessionId) {
    // If sessionId exists, attempt to verify the session by calling the backend
    fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`)
      .then(response => response.json())
      .then(data => {
        if (data.alias) {
          console.log(`User is logged in as ${data.alias}`);
          // Handle the UI updates for a logged-in user
        } else {
          console.log('Session expired or invalid');
          // Handle the case where the session is not valid
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

            // Optionally, call /getAlias to verify session and restore user data
            fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(data.sessionId)}`)
              .then(response => response.json())
              .then(verifyData => {
                console.log('Session verified:', verifyData);
                if (verifyData.alias) {
                  console.log(`User is logged in as ${verifyData.alias}`);
                  // Handle UI updates for the logged-in user
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
