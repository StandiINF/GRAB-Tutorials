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

      if (!data.alias) throw new Error("Invalid session");

      sessionId = sid;
      localStorage.setItem("sessionId", sid);
      
      if (data.hexColor) {
        localStorage.setItem("hexColor", data.hexColor);
      }
      if (data.hexColorSecondary) {
        localStorage.setItem("hexColorSecondary", data.hexColorSecondary);
      }

      loginTextEl.textContent = data.alias;
      loginMetaEl.textContent = "Logout";

      loggedInEl.style.display = "none";
      loginWithBtnEl.style.display = "none";

      loginMetaEl.onclick = () => {
        localStorage.removeItem("sessionId");
        sessionId = null;
        setupLoginButton();

        loggedInEl.style.display = "block";
        loginWithBtnEl.style.display = "block";
      };
    } catch (err) {
      console.log(err);
      localStorage.removeItem("sessionId");
      setupLoginButton();
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
      setupLoginButton();
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