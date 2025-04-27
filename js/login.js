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

    fetch('https://api.grab-tutorials.live/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decodedData),
      credentials: 'include', // include cookies!
    })
      .then(response => response.text())
      .then(text => {
        console.log('Login result:', text);
        fetchAlias();
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  } else {
    fetchAlias();
  }

  function fetchAlias() {
    fetch('https://api.grab-tutorials.live/getAlias', {
      method: 'GET',
      credentials: 'include', // VERY important!
    })
      .then(response => response.json())
      .then(data => {
        if (data.alias) {
          localStorage.setItem('userAlias', data.alias);
          console.log('Alias stored:', data.alias);
        } else {
          console.log('No alias found.');
        }
      })
      .catch(error => {
        console.error('Error fetching alias:', error);
      });
  }
});
