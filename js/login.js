window.addEventListener("DOMContentLoaded", () => {
  const loginMetaEl = document.getElementById("loginMeta");
  const loginTextEl = document.getElementById("loginText");
  const loggedInEl = document.getElementById("loggedin");
  const loginWithBtnEl = document.getElementById("loginwithbutton");

  let sessionId = localStorage.getItem("sessionId");

  const fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text);
    }

    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const setupLoginButton = () => {
    loginTextEl.textContent = "Login with Meta";
    loginMetaEl.textContent = "Login";

    loginMetaEl.onclick = () => {
      const params = new URLSearchParams({
        organization_id: "638365782695092",
        redirect_uri: "https://grab-tutorials.live/",
        response_type: "code",
      });

      window.location.href = `https://auth.oculus.com/sso/?${params}`;
    };
  };

  const proceedWithSession = async (sid) => {
    if (!sid) return setupLoginButton();

    try {
      await delay(200);

      const data = await fetchJSON(
        `https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(
          sid
        )}`
      );

      if (!data.user_name) throw new Error("Invalid session");

      sessionId = sid;
      localStorage.setItem("sessionId", sid);
      
      if (data.primaryColour) {
        localStorage.setItem("primaryColour", data.primaryColour);
      }
      if (data.secondaryColour) {
        localStorage.setItem("secondaryColour", data.secondaryColour);
      }

      if (window.updateColors) {
        window.updateColors();
      }

      loginTextEl.textContent = data.user_name;
      loginMetaEl.textContent = "Logout";

      loggedInEl.style.display = "none";
      loginWithBtnEl.style.display = "none";

      loginMetaEl.onclick = async () => {
        try {
          await fetch(`https://api.grab-tutorials.live/logout?sessionId=${encodeURIComponent(sessionId)}`, {
            method: 'GET',
            credentials: 'include',
          });
        } catch (err) {
          console.log("Logout request failed:", err);
        }

        localStorage.removeItem("sessionId");
        localStorage.removeItem("primaryColour");
        localStorage.removeItem("secondaryColour");
        sessionId = null;
        setupLoginButton();

        // Reset colors to default
        if (window.updateColors) {
          window.updateColors();
        }

        loggedInEl.style.display = "block";
        loginWithBtnEl.style.display = "block";
      };
    } catch (err) {
      console.log(err);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("primaryColour");
      localStorage.removeItem("secondaryColour");
      setupLoginButton();
      
      // Reset colors to default
      if (window.updateColors) {
        window.updateColors();
      }
    }
  };

  const handleFragment = async () => {
    const fragment = window.location.hash.substring(1);
    if (!fragment) return false;

    let decoded;
    try {
      decoded = JSON.parse(atob(fragment));
    } catch {
      return false;
    }

    if (!decoded?.code || !decoded?.org_scoped_id) return false;

    window.history.replaceState(null, "", window.location.pathname);

    try {
      const data = await fetchJSON(
        "https://api.grab-tutorials.live/login",
        {
          method: "POST",
          body: JSON.stringify(decoded),
        }
      );

      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem("sessionId", sessionId);
        proceedWithSession(sessionId);
      }
    } catch (err) {
      console.error("Login failed:", err);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("primaryColour");
      localStorage.removeItem("secondaryColour");
      setupLoginButton();
      
      // Reset colors to default
      if (window.updateColors) {
        window.updateColors();
      }
    }

    return true;
  };

  const init = async () => {
    const handled = await handleFragment();
    if (!handled && sessionId) {
      proceedWithSession(sessionId);
    } else if (!handled) {
      setupLoginButton();
    }
  };

  init();
});