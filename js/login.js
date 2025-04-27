window.addEventListener('DOMContentLoaded', () => {
  const fragment = window.location.hash.substring(1);

  if (fragment) {
    let decodedData;
    try {
      // Decode the fragment and parse as JSON
      const decodedFragment = atob(fragment);
      decodedData = JSON.parse(decodedFragment);
    } catch (e) {
      console.error('Failed to decode and parse fragment:', e);
      return;
    }

    // Send the decoded data to your Cloudflare Worker
    fetch('https://api.grab-tutorials.live/login', {  // Updated URL here
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decodedData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Worker Response:', data);
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  }

  // Fetch the alias from the secure cookie
  fetch('https://api.grab-tutorials.live/getAlias', {
    method: 'GET',
    credentials: 'include', // Send the HTTP-only cookie with the request
  })
    .then(response => response.json())
    .then(data => {
      if (data.alias) {
        // Store alias in localStorage
        localStorage.setItem('userAlias', data.alias);
        console.log('User alias:', data.alias);
      } else {
        console.error('Alias not found or not authenticated.');
      }
    })
    .catch(error => {
      console.error('Error fetching alias:', error);
    });
});
