window.addEventListener('DOMContentLoaded', () => {
  // Function to add a delay (in milliseconds)
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Select the "Login with Meta" button
  const loginWithMetaButton = document.getElementById('loginWithMeta');

  // Add event listener for the "Login with Meta" button
  if (loginWithMetaButton) {
    loginWithMetaButton.addEventListener('click', () => {
      // Clear sessionId from localStorage when "Login with Meta" is clicked
      localStorage.removeItem('sessionId');
      console.log('Session cleared from localStorage.');
      
      // Optionally, you can redirect or trigger the login flow after clearing the session
      window.location.href = 'https://grab-tutorials.live/';
    });
  }

  // Check if there's a sessionId in localStorage on page load
  const sessionId = localStorage.getItem('sessionId');
  const loginMetaElement = document.getElementById('loginMeta'); // Select the element to display alias
  
  if (sessionId) {
    // If sessionId exists, attempt to verify the session by calling the backend
    delay(3000) // Wait 3 seconds before calling /getAlias
      .then(() => {
        return fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`);
      })
      .then(response => response.json())
      .then(data => {
        if (data.alias) {
          console.log(`User is logged in as ${data.alias}`);
          // Update the loginMeta element with the user's alias
          loginMetaElement.textContent = `Logged in as ${data.alias}`;
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

      // Step 1: Wait 3 seconds before posting to /login
      delay(3000)
        .then(() => {
          return fetch('https://api.grab-tutorials.live/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies/auth tokens are included
            body: JSON.stringify(decodedData),
          });
        })
        .then(response => response.json())
        .then(data => {
          console.log('Login Response:', data);

          if (data.sessionId && data.alias) {
            // Step 2: Store sessionId in localStorage to persist session
            localStorage.setItem('sessionId', data.sessionId);

            console.log('Session ID saved to localStorage.');

            // Step 3: Redirect to the homepage (without the fragment in the URL)
            window.location.replace('https://grab-tutorials.live/');

            // Optionally, call /getAlias to verify session and restore user data after 3 seconds
            delay(3000)
              .then(() => {
                return fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(data.sessionId)}`);
              })
              .then(response => response.json())
              .then(verifyData => {
                console.log('Session verified:', verifyData);
                if (verifyData.alias) {
                  console.log(`User is logged in as ${verifyData.alias}`);
                  // Update the loginMeta element with the user's alias
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
