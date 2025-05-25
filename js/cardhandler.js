const urls = [
  "https://assets.grab-tutorials.live/basics.json",
  "https://assets.grab-tutorials.live/editor.json",
  "https://assets.grab-tutorials.live/animation.json",
  "https://assets.grab-tutorials.live/trigger.json",
  "https://assets.grab-tutorials.live/help.json"
];

const cache = {
  basics: null,
  editor: null,
  animation: null,
  trigger: null,
  help: null
};

const deckDomCache = new Map();

async function fetchBasics() {
  if (cache.basics) return cache.basics;
  const res = await fetch("https://assets.grab-tutorials.live/basics.json");
  const data = await res.json();
  cache.basics = data;
  return data;
}

async function fetchEditor() {
  if (cache.editor) return cache.editor;
  const res = await fetch("https://assets.grab-tutorials.live/editor.json");
  const data = await res.json();
  cache.editor = data;
  return data;
}

async function fetchAnimation() {
  if (cache.animation) return cache.animation;
  const res = await fetch("https://assets.grab-tutorials.live/animation.json");
  const data = await res.json();
  cache.animation = data;
  return data;
}

async function fetchTrigger() {
  if (cache.trigger) return cache.trigger;
  const res = await fetch("https://assets.grab-tutorials.live/trigger.json");
  const data = await res.json();
  cache.trigger = data;
  return data;
}

async function fetchHelp() {
  if (cache.help) return cache.help;
  const res = await fetch("https://assets.grab-tutorials.live/help.json");
  const data = await res.json();
  cache.help = data;
  return data;
}

/**
 * @param {HTMLElement} container
 * @param {string} category
 */
async function renderBasicsCategory(container, category) {
  if (!container) return;
  try {
    const basicsData = await fetchBasics();
    const items = basicsData.filter(item => item.category === category && item.cover);

    items.forEach(item => {

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
      div.appendChild(img);

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
        div.appendChild(dialImg);
      }

      container.appendChild(div);
    });
  } catch (e) {
    console.error(`Failed to fetch or render basics ${category} data:`, e);
  }
}

async function renderBasicsPlaying(container) {
  return renderBasicsCategory(container, "playing");
}

/**
 * @param {Function} fetchFn
 * @param {Object} groups
 */
async function renderCategories(fetchFn, groups) {
  if (!groups) return;
  try {
    const data = await fetchFn();
    for (const [category, container] of Object.entries(groups)) {
      if (!container) continue;

      const items = data.filter(item => item.category === category && item.cover);
      items.forEach(item => {

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
        div.appendChild(img);

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
          div.appendChild(dialImg);
        }

        container.appendChild(div);
      });

      if (
        (fetchFn === fetchAnimation && ["beginner", "intermediate", "advanced"].includes(category)) ||
        (fetchFn === fetchTrigger && ["beginner", "intermediate", "advanced"].includes(category)) ||
        (fetchFn === fetchBasics && category === "playing")
      ) {
        if (!container.querySelector('.FeedbackLink')) {
          const feedbackDiv = document.createElement("div");
          feedbackDiv.className = "cardGroup FeedbackLink";
          feedbackDiv.onclick = function() {
            window.open('https://discord.gg/J3yDuye6Uz', '_blank');
          };
          const feedbackImg = document.createElement("img");
          feedbackImg.src = "https://assets.grab-tutorials.live/!assets/placeholder-discord-main.svg";
          feedbackImg.alt = "Placeholder.svg";
          feedbackImg.className = "cardMain";
          feedbackImg.loading = "lazy";
          feedbackDiv.appendChild(feedbackImg);
          container.appendChild(feedbackDiv);
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch or render categories:", e);
  }
}

/**
 * @param {Object} groups
 */
async function renderAllBasicsCategories(groups) {
  await renderCategories(fetchBasics, {
    playing: groups.playingGroup,
    ui: groups.uiGroup,
    bog: groups.bogGroup
  });
}

/**
 * @param {Object} groups
 */
async function renderAllEditorCategories(groups) {
  await renderCategories(fetchEditor, {
    ui: groups.uiGroup,
    wrist: groups.wristGroup,
    blocks: groups.blocksGroup
  });
}

/**
 * @param {Object} groups
 */
async function renderAllAnimationCategories(groups) {
  await renderCategories(fetchAnimation, {
    basics: groups.basicsGroup,
    beginner: groups.beginnerGroup,
    intermediate: groups.intermediateGroup,
    advanced: groups.advancedGroup
  });
}

/**
 * @param {Object} groups
 */
async function renderAllTriggerCategories(groups) {
  await renderCategories(fetchTrigger, {
    basics: groups.basicsGroup,
    beginner: groups.beginnerGroup,
    intermediate: groups.intermediateGroup,
    advanced: groups.advancedGroup,
    logic: groups.logicGroup
  });
}

window.fetchBasics = fetchBasics;
window.fetchEditor = fetchEditor;
window.fetchAnimation = fetchAnimation;
window.fetchTrigger = fetchTrigger;
window.fetchHelp = fetchHelp;
window.renderBasicsPlaying = renderBasicsPlaying;
window.renderBasicsCategory = renderBasicsCategory;
window.renderAllBasicsCategories = renderAllBasicsCategories;
window.renderAllEditorCategories = renderAllEditorCategories;
window.renderAllAnimationCategories = renderAllAnimationCategories;
window.renderAllTriggerCategories = renderAllTriggerCategories;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("B").addEventListener("click", () => {
        const playingGroup = document.querySelector('#BMenu .groupOneContainer .tutorialGroup');
        const uiGroup = document.querySelector('#BMenu .groupTwoContainer .tutorialGroup');
        const bogGroup = document.querySelector('#BMenu .groupThreeContainer .tutorialGroup');
        if (window.renderAllBasicsCategories) {
            window.renderAllBasicsCategories({ playingGroup, uiGroup, bogGroup });
        }
    });

    document.getElementById("E").addEventListener("click", () => {
        const uiGroup = document.querySelector('#EMenu .groupOneContainer .tutorialGroup');
        const wristGroup = document.querySelector('#EMenu .groupTwoContainer .tutorialGroup');
        const blocksGroup = document.querySelector('#EMenu .groupThreeContainer .tutorialGroup');
        if (window.renderAllEditorCategories) {
            window.renderAllEditorCategories({ uiGroup, wristGroup, blocksGroup });
        }
    });

    document.getElementById("A").addEventListener("click", () => {
        const basicsGroup = document.querySelector('#AMenu .groupOneContainer .tutorialGroup');
        const beginnerGroup = document.querySelector('#AMenu .groupTwoContainer .tutorialGroup');
        const intermediateGroup = document.querySelector('#AMenu .groupThreeContainer .tutorialGroup');
        const advancedGroup = document.querySelector('#AMenu .groupFourContainer .tutorialGroup');
        if (window.renderAllAnimationCategories) {
            window.renderAllAnimationCategories({ basicsGroup, beginnerGroup, intermediateGroup, advancedGroup });
        }
    });

    document.getElementById("T").addEventListener("click", () => {
        const basicsGroup = document.querySelector('#TMenu .groupOneContainer .tutorialGroup');
        const beginnerGroup = document.querySelector('#TMenu .groupTwoContainer .tutorialGroup');
        const intermediateGroup = document.querySelector('#TMenu .groupThreeContainer .tutorialGroup');
        const advancedGroup = document.querySelector('#TMenu .groupFourContainer .tutorialGroup');
        const logicGroup = document.querySelector('#TMenu .groupFiveContainer .tutorialGroup');
        if (window.renderAllTriggerCategories) {
            window.renderAllTriggerCategories({ basicsGroup, beginnerGroup, intermediateGroup, advancedGroup, logicGroup });
        }
    });

  document.body.addEventListener("mousedown", async function (e) {
    const cardGroup = e.target.closest(".cardGroup");
    if (!cardGroup) return;

    const img = cardGroup.querySelector("img");
    if (!img) return;

    const menuId = getCurrentMenuId();
    const jsonSource = getJsonSourceByMenu(menuId);
    if (!jsonSource) return;

    const data = await jsonSource.fetchFn();

    let cover = img.src.replace(/^https?:\/\/[^\/]+\/assets\//, "");
    let found = findCardObj(data, cover, img.alt.replace(/\.svg$/i, ""));

    if (!found) {
      found = data.find(item => img.alt && item.title && img.alt.toLowerCase().includes(item.title.toLowerCase()));
    }
    if (!found) return;

    renderCardDeck(found, jsonSource.cacheKey);
  }, true);
});

function getJsonSourceByMenu(menuId) {
  switch (menuId) {
    case "BMenu": return { fetchFn: fetchBasics, cacheKey: "basics" };
    case "EMenu": return { fetchFn: fetchEditor, cacheKey: "editor" };
    case "AMenu": return { fetchFn: fetchAnimation, cacheKey: "animation" };
    case "TMenu": return { fetchFn: fetchTrigger, cacheKey: "trigger" };
    default: return null;
  }
}

function getCurrentMenuId() {
  const menus = ["BMenu", "EMenu", "AMenu", "TMenu"];
  for (const id of menus) {
    const el = document.getElementById(id);
    if (el && el.style.display === "block") return id;
  }
  return null;
}

/**
 * @param {Object} cardObj
 * @param {string} jsonKey
 */
function renderCardDeck(cardObj, jsonKey) {
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
    let src = cardData.link;
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