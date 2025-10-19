const decksUrl = "https://assets.grab-tutorials.live/decks.json";
const cache = {
  decks: null
};

const deckDomCache = new Map();

function isMobile() {
  return window.innerWidth <= 767;
}

function applyMobileCardStyles(div, img) {
  if (isMobile()) {
    div.style.width = "250px";
    div.style.height = "130px";
    if (img) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
    }
  }
}

async function fetchDecks() {
  if (cache.decks) return cache.decks;
  const res = await fetch(decksUrl);
  const data = await res.json();
  cache.decks = data;
  return data;
}

/**
 * @param {string} category
 * @param {Object} groups
 */
async function renderAllDecksCategories(category, groups) {
  if (!groups) return;
  try {
    const decksData = await fetchDecks();
    for (const container of Object.values(groups)) {
      if (container) container.innerHTML = "";
    }
    decksData.forEach(item => {
      if (item.category !== category || !item.cover || !item.subcategory) return;
      const container = groups[item.subcategory];
      if (!container) return;
      if (container.querySelector(`img[src$="${item.cover.replace(/^\/+/, "")}"]`)) {
        return;
      }
      const div = document.createElement("div");
      div.classList.add("cardGroup");
      div.style.position = "relative";

      if (item.title && item.title.toLowerCase() === "slider") {
        div.id = "sliderGroup";
      }

      const img = document.createElement("img");
      img.src = "https://assets.grab-tutorials.live/" + item.cover.replace(/^\/+/, "");
      img.alt = item.title || "Tutorial";
      img.loading = "lazy";
      img.classList.add("cardMain");
      if (item.title && item.title.toLowerCase().includes("slider")) {
        img.classList.add("sliderCard");
      }
      applyMobileCardStyles(div, img);
      div.appendChild(img);

      if (item.alt) {
        let altImages = [];
        if (typeof item.alt === "object") {
          altImages = Object.values(item.alt);
        } else if (typeof item.alt === "string") {
          altImages = [item.alt];
        }
        if (altImages.length > 0) {
          const altImgElements = [];
          altImages.forEach((altPath, idx) => {
            const altImg = document.createElement("img");
            altImg.src = "https://assets.grab-tutorials.live/" + altPath.replace(/^\/+/, "");
            altImg.alt = (item.title || "Tutorial") + " alt " + (idx + 1);
            altImg.className = "altCardImage";
            altImg.style.position = "absolute";
            altImg.style.top = "0";
            altImg.style.left = "0";
            altImg.style.width = "100%";
            altImg.style.height = "100%";
            altImg.style.zIndex = "11";
            altImg.style.pointerEvents = "none";
            altImg.style.setProperty("opacity", "0", "important");
            altImg.style.transition = "opacity 0.2s";
            if (isMobile()) {
              altImg.style.width = "100%";
              altImg.style.height = "100%";
              altImg.style.objectFit = "contain";
            }
            altImgElements.push(altImg);
          });
          altImgElements.forEach(altImg => div.appendChild(altImg));
          div.addEventListener("mouseenter", () => {
            altImgElements.forEach(img => img.style.setProperty("opacity", "0", "important"));
            if (altImgElements.length > 0) {
              const randomIdx = Math.floor(Math.random() * altImgElements.length);
              altImgElements[randomIdx].style.setProperty("opacity", "1", "important");
            }
          });
          div.addEventListener("mouseleave", () => {
            altImgElements.forEach(img => img.style.setProperty("opacity", "0", "important"));
          });
        }
      }

      if (item.gif) {
        const gifImg = document.createElement("img");
        gifImg.dataset.src = "https://assets.grab-tutorials.live/" + item.gif.replace(/^\/+/, "");
        gifImg.alt = (item.title || "Tutorial") + " gif";
        gifImg.className = (item.title ? item.title.replace(/\s+/g, '') : "card") + "Card gif";
        gifImg.classList.add("gif");
        gifImg.loading = "lazy";
        gifImg.style.position = "absolute";
        gifImg.style.top = "0";
        gifImg.style.left = "0";
        gifImg.style.width = "100%";
        gifImg.style.height = "100%";
        gifImg.style.zIndex = "2";
        gifImg.style.pointerEvents = "none";
        if (isMobile()) {
          gifImg.style.width = "100%";
          gifImg.style.height = "100%";
          gifImg.style.objectFit = "contain";
        }
        div.appendChild(gifImg);

        div.addEventListener("mouseenter", () => {
          gifImg.src = gifImg.dataset.src;
        });
        div.addEventListener("mouseleave", () => {
          gifImg.removeAttribute("src");
        });
      }

      if (item.dial) {
        const dialImg = document.createElement("img");
        dialImg.src = "https://assets.grab-tutorials.live/" + item.dial.replace(/^\/+/, "");
        dialImg.alt = (item.title || "Tutorial") + " dial";
        dialImg.id = "sliderDial";
        dialImg.loading = "lazy";
        if (isMobile()) {
          dialImg.style.width = "27px";
          dialImg.style.height = "27px";
          dialImg.style.left = "19px";
          dialImg.style.top = "82.5px";
        } else {
          dialImg.style.width = "50px";
          dialImg.style.height = "50px";
          dialImg.style.left = "42px";
          dialImg.style.top = "168px";
        }
        dialImg.style.position = "absolute";
        dialImg.style.zIndex = "1";
        dialImg.style.transition = "left 0.3s";
        dialImg.style.cursor = "pointer";

        div.addEventListener("mouseenter", () => {
          if (isMobile()) {
            dialImg.style.left = "202px";
          } else {
            dialImg.style.left = "409px";
          }
        });
        div.addEventListener("mouseleave", () => {
          if (isMobile()) {
            dialImg.style.left = "19px";
          } else {
            dialImg.style.left = "42px";
          }
        });
        div.appendChild(dialImg);
      }

      container.appendChild(div);
    });

    const placeholderMap = {
      basics: ["playing"],
      editor: ["basics"],
      animation: ["basics", "beginner", "intermediate", "advanced"],
      trigger: ["basics", "beginner", "intermediate", "advanced"]
    };
    const placeholderUrl = "https://assets.grab-tutorials.live/!assets/placeholder-discord-main.svg";
    const placeholderAlt = "Can't find what you're looking for? Join Discord!";
    if (placeholderMap[category]) {
      for (const subcat of placeholderMap[category]) {
        const container = groups[subcat];
        if (container) {
          if (!container.querySelector(`img[src="${placeholderUrl}"]`)) {
            const div = document.createElement("div");
            div.classList.add("cardGroup", "placeholder");
            div.style.position = "relative";
            applyMobileCardStyles(div);
            const img = document.createElement("img");
            img.src = placeholderUrl;
            img.alt = placeholderAlt;
            img.loading = "lazy";
            img.classList.add("cardMain");
            applyMobileCardStyles(div, img);
            div.addEventListener("click", () => {
              window.open("https://discord.gg/J3yDuye6Uz", "_blank");
            });
            div.appendChild(img);
            container.appendChild(div);
          }
        }
      }
    }
  } catch (e) {
    console.error(`Failed to fetch or render decks for category ${category}:`, e);
  }
}

window.fetchDecks = fetchDecks;
window.renderAllDecksCategories = renderAllDecksCategories;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("B").addEventListener("click", () => {
    const playingGroup = document.querySelector('#BMenu .groupOneContainer .tutorialGroup');
    const uiGroup = document.querySelector('#BMenu .groupTwoContainer .tutorialGroup');
    const bogGroup = document.querySelector('#BMenu .groupThreeContainer .tutorialGroup');
    window.renderAllDecksCategories("basics", {
      playing: playingGroup,
      ui: uiGroup,
      bog: bogGroup
    });
  });

  document.getElementById("E").addEventListener("click", () => {
    const basicsGroup = document.querySelector('#EMenu .groupOneContainer .tutorialGroup');
    const uiGroup = document.querySelector('#EMenu .groupTwoContainer .tutorialGroup');
    const wristGroup = document.querySelector('#EMenu .groupThreeContainer .tutorialGroup');
    const blocksGroup = document.querySelector('#EMenu .groupFourContainer .tutorialGroup');
    window.renderAllDecksCategories("editor", {
      basics: basicsGroup,
      ui: uiGroup,
      wrist: wristGroup,
      blocks: blocksGroup
    });
  });

  document.getElementById("A").addEventListener("click", () => {
    const basicsGroup = document.querySelector('#AMenu .groupOneContainer .tutorialGroup');
    const beginnerGroup = document.querySelector('#AMenu .groupTwoContainer .tutorialGroup');
    const intermediateGroup = document.querySelector('#AMenu .groupThreeContainer .tutorialGroup');
    const advancedGroup = document.querySelector('#AMenu .groupFourContainer .tutorialGroup');
    window.renderAllDecksCategories("animation", {
      basics: basicsGroup,
      beginner: beginnerGroup,
      intermediate: intermediateGroup,
      advanced: advancedGroup
    });
  });

  document.getElementById("T").addEventListener("click", () => {
    const basicsGroup = document.querySelector('#TMenu .groupOneContainer .tutorialGroup');
    const beginnerGroup = document.querySelector('#TMenu .groupTwoContainer .tutorialGroup');
    const intermediateGroup = document.querySelector('#TMenu .groupThreeContainer .tutorialGroup');
    const advancedGroup = document.querySelector('#TMenu .groupFourContainer .tutorialGroup');
    const logicGroup = document.querySelector('#TMenu .groupFiveContainer .tutorialGroup');
    window.renderAllDecksCategories("trigger", {
      basics: basicsGroup,
      beginner: beginnerGroup,
      intermediate: intermediateGroup,
      advanced: advancedGroup,
      logic: logicGroup
    });
  });

  document.body.addEventListener("mousedown", async function (e) {
    const cardGroup = e.target.closest(".cardGroup");
    if (!cardGroup) return;
    if (cardGroup.classList.contains("placeholder")) return;

    const img = cardGroup.querySelector("img");
    if (!img) return;

    const data = await fetchDecks();

    let cover = img.src.replace(/^https?:\/\/[^\/]+\/assets\//, "");
    let found = findCardObj(data, cover, img.alt.replace(/\.svg$/i, ""));

    if (!found) {
      found = data.find(item => img.alt && item.title && img.alt.toLowerCase().includes(item.title.toLowerCase()));
    }
    if (!found) return;

    renderCardDeck(found);
    try {
      const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const category = (found.category || '').toString().toLowerCase() || 'basics';
      const slug = normalize(found.title || found.slug || '');
      const desiredPath = '/' + category + (slug ? '/' + slug : '');
      const menuId = (window.PATH_TO_MENU && window.PATH_TO_MENU['/' + category]) || undefined;
      history.pushState({ menuId: menuId }, '', desiredPath);
    } catch (e) { }

  }, true);
});

/**
 * @param {Object} cardObj
 */
function renderCardDeck(cardObj) {
  const cardDecks = document.querySelector('[name="cardDecks"]');
  if (!cardDecks) return;

  cardDecks.innerHTML = "";

  const containerId = (cardObj.title || "deck").replace(/\s+/g, '') + "Container";
  const deckStorage = document.getElementById("deckStorage");

  let storedDeck = deckStorage && deckStorage.querySelector(`#${containerId}`);
  if (storedDeck) {
    cardDecks.appendChild(storedDeck);
    storedDeck.style.display = "block";
    window.openTutorial(containerId, cardObj.title, Object.keys(cardObj.cards).length, Object.keys(cardObj.cards).length === 1 ? "no" : "yes");
    return;
  }
  let existingDeck = document.getElementById(containerId);
  if (existingDeck && existingDeck.parentNode === cardDecks) {
    existingDeck.style.display = "block";
    window.openTutorial(containerId, cardObj.title, Object.keys(cardObj.cards).length, Object.keys(cardObj.cards).length === 1 ? "no" : "yes");
    return;
  }
  if (deckDomCache.has(containerId)) {
    const cached = deckDomCache.get(containerId);
    cardDecks.appendChild(cached);
    cached.style.display = "block";
    window.openTutorial(containerId, cardObj.title, Object.keys(cardObj.cards).length, Object.keys(cardObj.cards).length === 1 ? "no" : "yes");
    return;
  }

  const container = document.createElement("div");
  container.id = containerId;
  container.className = "cardContainer";
  const cardKeys = Object.keys(cardObj.cards);
  const total = cardKeys.length;
  cardKeys.forEach((key, idx) => {
    const cardData = cardObj.cards[key];
    const img = document.createElement("img");
    let src = cardData.svg;
    if (!/^https?:\/\//.test(src)) {
      src = "https://assets.grab-tutorials.live/" + src.replace(/^\/+/, "");
    }
    img.src = src;
    img.alt = src.split('/').pop();
    const indexWord = numberToWord(idx + 1);

    let cardClass = "";
    if (total === 3) {
      if (idx === 0) {
        cardClass = `cardOne index${indexWord} ${cardData.help || ""}`;
      } else if (idx === 1) {
        cardClass = `card cardTwo index${indexWord} ${cardData.help || ""}`;
      } else if (idx === 2) {
        cardClass = `card cardFour index${indexWord} ${cardData.help || ""}`;
      }
    } else {
      if (idx === 0) {
        cardClass = `cardOne index${indexWord} ${cardData.help || ""}`;
      } else if (idx === 1) {
        cardClass = `card cardTwo index${indexWord} ${cardData.help || ""}`;
      } else if (idx === total - 2) {
        cardClass = `card cardThree index${indexWord} ${cardData.help || ""}`;
      } else if (idx === total - 1) {
        cardClass = `card cardFour index${indexWord} ${cardData.help || ""}`;
      } else {
        cardClass = `card index${indexWord} ${cardData.help || ""}`;
      }
    }

    img.className = cardClass.trim();
    img.loading = "lazy";
    if (isMobile()) {
      img.style.width = "250px";
      img.style.height = "130px";
      img.style.objectFit = "contain";
    }
    container.appendChild(img);
  });
  container.style.display = "block";
  cardDecks.appendChild(container);

  deckDomCache.set(containerId, container);

  window.openTutorial(container.id, cardObj.title, cardKeys.length, cardKeys.length === 1 ? "no" : "yes");
}

window._originalCloseTutorial = window.closeTutorial;
window.closeTutorial = function() {
  const cardDecks = document.querySelector('[name="cardDecks"]');
  const deckStorage = document.getElementById("deckStorage");

  setTimeout(() => {
    document.querySelectorAll(".cardContainer").forEach(container => {
      if (container.style.opacity == 1 || container.style.display === "block") {
        container.style.display = "none";
        if (deckStorage && container.parentNode !== deckStorage) {
          deckStorage.appendChild(container);
        }
      }
    });
  }, 350);
  window._originalCloseTutorial();
};

function numberToWord(n) {
  const words = [
    "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"
  ];
  return words[n - 1] || n.toString();
}

function findCardObj(data, cover, title) {
  let found = data.find(item => item.cover === cover);
  if (!found && title) {
    found = data.find(item => item.title === title);
  }
  return found;
}

// this file was mostly AI because a lot of it i just didnt know how to do