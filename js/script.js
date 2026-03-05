const help = document.getElementById("help");
const text = document.getElementById("text");
const num = document.getElementById("num");
const tutID = document.getElementById("tutID");

const helpOne = document.getElementById("helpOne");
const helpTwo = document.getElementById("helpTwo");
const helpThree = document.getElementById("helpThree");
const helpFour = document.getElementById("helpFour");
const helpFive = document.getElementById("helpFive");
const helpSix = document.getElementById("helpSix");
const helpSeven = document.getElementById("helpSeven");
const helpEight = document.getElementById("helpEight");

let previouslyOpened = null;

const decksJSON = "https://assets.grab-tutorials.live/decks.json";

let lastPressedCard = null;

const MENU_PATHS = {
    TMenu: '/trigger',
    BMenu: '/basics',
    AMenu: '/animation',
    EMenu: '/editor',
    GMenu: '/gasm',
    LMenu: '/login'
};
const PATH_TO_MENU = Object.fromEntries(Object.entries(MENU_PATHS).map(([k,v]) => [v, k]));
const CATEGORY_TO_MENU = {
    'trigger': 'TMenu',
    'basics': 'BMenu',
    'animation': 'AMenu',
    'editor': 'EMenu',
    'gasm': 'GMenu'
};

window.__initialPathNavigation = false;

// menu opening / closing

function openMenu(menuId) {
    const menus = ["TMenu", "BMenu", "AMenu", "EMenu", "GMenu", "LMenu"];
    const buttons = ["T", "B", "A", "E", "G", "L"];
    let userColour = localStorage.getItem('hexColor') || "#888888";
    let userColourSecondary = localStorage.getItem('hexColorSecondary') || "#888888";
    const menu = document.getElementById(menuId);
    const menuButtons = document.getElementById("menuButtons");
    previouslyOpened = menuId;

    const sMenu = document.getElementById("SMenu");
    if (sMenu) {
        sMenu.style.display = 'none';
        sMenu.style.zIndex = '';
        sMenu.style.pointerEvents = 'none';
    }

    function applyMenuColours(colour, secondaryColour) {
        const colors = {
            TMenu: { background: "rgb(248, 153, 0)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(248, 153, 0) 100%)", buttonGradient: "linear-gradient(to top, rgb(248, 153, 0), transparent)" },
            BMenu: { background: "rgb(144, 207, 144)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(144, 207, 144) 100%)", buttonGradient: "linear-gradient(to top, rgb(144, 207, 144), transparent)" },
            AMenu: { background: "#638DDD", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, #638DDD 100%)", buttonGradient: "linear-gradient(to top, #638DDD, transparent)" },
            EMenu: { background: "rgb(124, 72, 72)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(124, 72, 72) 100%)", buttonGradient: "linear-gradient(to top, rgb(124, 72, 72), transparent)" },
            GMenu: { background: "rgb(115, 210, 120)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(115, 210, 120) 100%)", buttonGradient: "linear-gradient(to top, rgb(115, 210, 120), transparent)" },
            LMenu: { background: colour, gradient: `linear-gradient(to top, rgba(177, 65, 65, 0) 0%, ${colour} 100%)`, buttonGradient: `linear-gradient(to top, ${colour}, transparent)` },
        };
        menus.forEach((id, index) => {
            const currentMenu = document.getElementById(id);
            const containers = currentMenu.querySelectorAll(".menuContainer");
            const button = document.getElementById(buttons[index]);

            if (id === menuId) {
                currentMenu.style.display = 'block';
                currentMenu.style.zIndex = 1000;
                button.classList.add("active");

                if (id === "TMenu") button.style.background = "rgb(248, 153, 0)";
                else if (id === "BMenu") button.style.background = "rgb(144, 207, 144)";
                else if (id === "AMenu") button.style.background = "#638DDD";
                else if (id === "EMenu") button.style.background = "rgb(124, 72, 72)";
                else if (id === "GMenu") button.style.background = "rgb(115, 210, 120)";
                else if (id === "LMenu") button.style.background = secondaryColour;

                const mMenu = document.getElementById("MMenu");
                mMenu.style.transition = "background 0.3s ease, var(--menu-gradient) 0.3s ease";
                mMenu.style.background = colors[id].background;
                mMenu.style.setProperty("--menu-gradient", colors[id].gradient);

                menuButtons.style.setProperty("--button-gradient", colors[id].buttonGradient);

                containers.forEach(container => {
                    container.style.display = 'flex';
                });

                currentMenu.style.pointerEvents = 'auto';
                menuButtons.style.pointerEvents = "auto";

                const desiredPath = MENU_PATHS[id] || '/';
                try {
                    if (window.__initialPathNavigation) {
                        history.replaceState({ menuId: id }, '', desiredPath);
                        window.__initialPathNavigation = false;
                    } else if (location.pathname !== desiredPath) {
                        history.pushState({ menuId: id }, '', desiredPath);
                    }
                } catch (e) { }
            } else {
                currentMenu.style.pointerEvents = 'none';
                currentMenu.style.zIndex = '';
                currentMenu.style.display = 'none';
                button.classList.remove("active");
            }
        });
        const lButton = document.getElementById('L');
        if (lButton) {
            if (menuId === "LMenu") {
                lButton.style.background = secondaryColour;
            } else {
                const sessionId = localStorage.getItem('sessionId');
                if (sessionId && secondaryColour && secondaryColour !== "#888888") {
                    lButton.style.background = secondaryColour;
                }
            }
        }
    }

    menuButtons.style.pointerEvents = "none";

    if (menu.style.display === 'block') {
        closeMenu();
        buttons.forEach(buttonId => {
            document.getElementById(buttonId).classList.remove("active");
        });
        const mMenu = document.getElementById("MMenu");
        mMenu.style.background = "";
        mMenu.style.setProperty("--menu-gradient", "");
        menuButtons.style.setProperty("--button-gradient", "linear-gradient(to top, #2a3439, transparent)");
        menuButtons.style.pointerEvents = "auto";

        try {
            if (location.pathname !== '/') {
                history.pushState({}, '', '/');
            }
        } catch (e) { }
        return;
    }

    if (
        (menuId === "LMenu" || localStorage.getItem('sessionId')) &&
        (!localStorage.getItem('hexColor') || !localStorage.getItem('hexColorSecondary'))
    ) {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            fetch(`https://api.grab-tutorials.live/getAlias?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                if (data && data.hexColor) {
                    userColour = data.hexColor;
                    localStorage.setItem('hexColor', userColour);
                }
                if (data && data.hexColorSecondary) {
                    userColourSecondary = data.hexColorSecondary;
                    localStorage.setItem('hexColorSecondary', userColourSecondary);
                }
                applyMenuColours(userColour, userColourSecondary);
            })
            .catch(() => {
                applyMenuColours(userColour, userColourSecondary);
            });
            return;
        }
    }

    applyMenuColours(userColour, userColourSecondary);
}

function closeMenu() {
    const menus = ["TMenu", "BMenu", "AMenu", "EMenu", "GMenu", "LMenu"];
    previouslyOpened = null;
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        menu.style.pointerEvents = 'none';
        menu.style.display = 'none';
    });
}

// url opening hi

window.addEventListener('load', function () {
    try {
        const path = (window.location.pathname || '').toLowerCase();
        const parts = path.split('/').filter(Boolean);
        const mapping = {
            '/basics': 'B',
            '/editor': 'E',
            '/animation': 'A',
            '/trigger': 'T',
            '/gasm': 'G',
            '/login': 'L'
        };

        if (parts.length === 0) {
            return;
        }

        const base = '/' + parts[0];
        const btnId = mapping[base];
        if (btnId) {
            const btn = document.getElementById(btnId);
            if (btn) {
                window.__initialPathNavigation = true;
                btn.click();
            }

            if (parts.length > 1 && window.fetchDecks && window.renderCardDeck) {
                (async () => {
                    const slug = parts[1];
                    const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    try {
                        const decks = await window.fetchDecks();
                        const found = decks.find(item => {
                            if (!item || !item.title) return false;
                            const title = item.title.toString();
                            return normalize(title) === slug
                                || title.toLowerCase() === slug
                                || (item.slug && item.slug.toLowerCase() === slug);
                        });

                        if (found) {
                            window.renderCardDeck(found);
                            try { history.replaceState({ menuId: PATH_TO_MENU[base] }, '', path); } catch (e) {}
                        } else {
                            try { history.replaceState({}, '', base); } catch (e) {}
                        }
                    } catch (e) {
                        try { history.replaceState({}, '', base); } catch (e) {}
                    }
                })();
            }
            return;
        }

        if (parts.length === 1 && window.fetchDecks && window.renderCardDeck) {
            (async () => {
                const slug = parts[0];
                const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                try {
                    const decks = await window.fetchDecks();
                    const found = decks.find(item => {
                        if (!item || !item.title) return false;
                        const title = item.title.toString();
                        const itemSlugCandidates = [
                            normalize(title),
                            (item.slug || '').toString().toLowerCase(),
                            title.toLowerCase()
                        ];
                        return itemSlugCandidates.includes(slug);
                    });

                    if (found) {
                        const cat = (found.category || '').toString().toLowerCase();
                        const catBase = '/' + (cat || 'basics');
                        const menuId = PATH_TO_MENU[catBase];
                        if (menuId) {
                            const btn = document.getElementById(menuId.replace('Menu','').toUpperCase());
                            if (btn) {
                                window.__initialPathNavigation = true;
                                btn.click();
                                setTimeout(() => {
                                    window.renderCardDeck(found);
                                    try {
                                        const desired = catBase + '/' + (normalize(found.title || found.slug || ''));
                                        history.replaceState({ menuId: PATH_TO_MENU[catBase] }, '', desired);
                                    } catch (e) {}
                                }, 120);
                                return;
                            }
                        }
                        window.renderCardDeck(found);
                        try {
                            const desired = '/' + (found.category || 'basics') + '/' + normalize(found.title || found.slug || '');
                            history.replaceState({ menuId: PATH_TO_MENU['/' + (found.category || 'basics')] }, '', desired);
                        } catch (e) {}
                    } else {
                        try { history.replaceState({}, '', '/'); } catch (e) {}
                    }
                } catch (e) {
                    try { history.replaceState({}, '', '/'); } catch (e) {}
                }
            })();
            return;
        }
    } catch (e) {
        console.error('Menu auto-open error:', e);
    }
});

window.addEventListener('popstate', function(event) {
    try {
        const stateMenuId = event.state && event.state.menuId;
        if (stateMenuId) {
            openMenu(stateMenuId);
            return;
        }
        const path = (window.location.pathname || '').toLowerCase();
        let opened = false;
        for (const [p, mid] of Object.entries(PATH_TO_MENU)) {
            if (path.includes(p)) {
                openMenu(mid);
                opened = true;
                break;
            }
        }
        if (!opened) {
            closeMenu();
        }
    } catch (e) {
        console.error('popstate handling error:', e);
    }
});

// safety nets to prevent accidental closing

function moveSafetyNets(container) {
    const safetyNetsRoot = document.getElementById("safetyNets");
    const safetyNetMiddle = document.getElementById("safetyNetMiddle");
    const safetyNetRight = document.getElementById("safetyNetRight");
    const safetyNetLeft = document.getElementById("safetyNetLeft");
    const target = (container && container.appendChild) ? container : safetyNetsRoot || document.body;

    if (safetyNetMiddle && safetyNetMiddle.parentNode !== target) {
        target.appendChild(safetyNetMiddle);
    }
    if (safetyNetRight && safetyNetRight.parentNode !== target) {
        target.appendChild(safetyNetRight);
    }

    if (safetyNetLeft && safetyNetsRoot && safetyNetLeft.parentNode !== safetyNetsRoot) {
        safetyNetsRoot.appendChild(safetyNetLeft);
    }
}

function oneCardSafetyNet(container) {
    const safetyNetsRoot = document.getElementById("safetyNets");
    const oneCard = document.getElementById("oneCard");
    const safetyNetMiddle = document.getElementById("safetyNetMiddle");
    const safetyNetRight = document.getElementById("safetyNetRight");
    const safetyNetLeft = document.getElementById("safetyNetLeft");

    const target = (container && container.appendChild) ? container : safetyNetsRoot || document.body;
    if (oneCard && oneCard.parentNode !== target) {
        target.appendChild(oneCard);
    }

    if (safetyNetMiddle && oneCard && safetyNetMiddle.parentNode !== oneCard) {
        oneCard.appendChild(safetyNetMiddle);
    }

    if (safetyNetRight && safetyNetsRoot && safetyNetRight.parentNode !== safetyNetsRoot) {
        safetyNetsRoot.appendChild(safetyNetRight);
    }
    if (safetyNetLeft && safetyNetsRoot && safetyNetLeft.parentNode !== safetyNetsRoot) {
        safetyNetsRoot.appendChild(safetyNetLeft);
    }
}

// open the decks! (also open help and text containers)

function openTutorial(element, tutorialName, totalSteps, safetyNet) {
    help.style.display = 'block';
    text.style.display = 'block';
    var container = document.getElementById(element);
    container.style.display = 'block';

    if (safetyNet === "no") {
        oneCardSafetyNet(container);
    } else {
        moveSafetyNets(container);
    }

    if (Array.from(document.getElementsByClassName("cardOne")).some(el => el.classList.contains("active")) && safetyNet === "no") {
        setTimeout(() => {
            const secretMessage = document.getElementById("secretMessage");
            if (secretMessage && container) {
                container.appendChild(secretMessage);
                secretMessage.style.display = "block";
                secretMessage.style.opacity = 1;
                secretMessage.style.zIndex = "-1";
                secretMessage.style.position = "absolute";
            }
        }, 300);
    }

    const safetyNetsRoot = document.getElementById("safetyNets");
    const safetyNetMiddle = document.getElementById("safetyNetMiddle");
    const safetyNetRight = document.getElementById("safetyNetRight");
    const safetyNetLeft = document.getElementById("safetyNetLeft");

    if (safetyNet === "no") {
        if (safetyNetMiddle && safetyNetMiddle.parentNode !== container) {
            container.appendChild(safetyNetMiddle);
        }
        if (safetyNetRight && safetyNetRight.parentNode !== safetyNetsRoot) {
            safetyNetsRoot.appendChild(safetyNetRight);
        }
        if (safetyNetLeft && safetyNetLeft.parentNode !== safetyNetsRoot) {
            safetyNetsRoot.appendChild(safetyNetLeft);
        }
        if (safetyNetMiddle) safetyNetMiddle.style.display = "block";
        if (safetyNetRight) safetyNetRight.style.display = "none";
        if (safetyNetLeft) safetyNetLeft.style.display = "none";
    } else {
        if (safetyNetMiddle && safetyNetMiddle.parentNode !== container) {
            container.appendChild(safetyNetMiddle);
        }
        if (safetyNetRight && safetyNetRight.parentNode !== container) {
            container.appendChild(safetyNetRight);
        }
        if (safetyNetLeft && safetyNetLeft.parentNode !== safetyNetsRoot) {
            safetyNetsRoot.appendChild(safetyNetLeft);
        }
        if (safetyNetMiddle) safetyNetMiddle.style.display = "block";
        if (safetyNetRight) safetyNetRight.style.display = "block";
        if (safetyNetLeft) safetyNetLeft.style.display = "none";
    }

    num.innerText = `1/${totalSteps}`;
    tutID.innerText = tutorialName;
    setTimeout(() => {
        container.style.opacity = 1;
        container.style.pointerEvents = 'auto';
        help.style.opacity = 1;
        help.style.pointerEvents = 'auto';
        text.style.opacity = 1;
    }, 10);
}

function closeTutorial() {
    const containers = document.querySelectorAll(".cardContainer");

    containers.forEach(container => {
        if (container.style.opacity == 1) {
            container.style.opacity = 0;
            container.style.pointerEvents = 'none';
            help.style.opacity = 0;
            help.style.pointerEvents = 'none';
            help.classList.remove("active");
            text.style.opacity = 0;

            const secretMessage = document.getElementById("secretMessage");
            if (secretMessage) {
                secretMessage.style.display = "none";
                secretMessage.style.opacity = 0;
            }

            const elements = container.querySelectorAll(".card, .cardOne");
            elements.forEach(element => {
                try { if (element.dataset && element.dataset.__origTransform !== undefined) delete element.dataset.__origTransform; } catch(e) {}
                try { element.style.transform = ''; element.style.transition = ''; } catch(e) {}
            });

            elements.forEach(element => {
                element.classList.remove("active", "activeTwo");
                element.style.zIndex = '';
                element.style.pointerEvents = 'auto';
            });

            try { container.dataset.animating = '1'; } catch(e) {}
            setTimeout(() => { try { delete container.dataset.animating; } catch(e) {} }, 600);

            let [currentNum, total] = num.innerText.split('/').map(Number);

            function decrement() {
                if (currentNum > 1) {
                    currentNum--;
                    num.innerText = `${currentNum}/${total}`;
                    setTimeout(decrement, 50);
                }
            }

            decrement();

            setTimeout(() => {
                container.style.display = 'none';
                help.style.display = 'none';
                text.style.display = 'none';
                const safetyNetsRoot = document.getElementById("safetyNets");
                const oneCard = document.getElementById("oneCard");
                const safetyNetMiddle = document.getElementById("safetyNetMiddle");
                const safetyNetLeft = document.getElementById("safetyNetLeft");
                const safetyNetRight = document.getElementById("safetyNetRight");
                if (safetyNetLeft && safetyNetLeft.parentNode !== safetyNetsRoot) {
                    safetyNetsRoot.appendChild(safetyNetLeft);
                }
                if (safetyNetRight && safetyNetRight.parentNode !== safetyNetsRoot) {
                    safetyNetsRoot.appendChild(safetyNetRight);
                }
                if (oneCard && oneCard.parentNode !== safetyNetsRoot) {
                    safetyNetsRoot.appendChild(oneCard);
                }
                if (safetyNetMiddle && safetyNetMiddle.parentNode !== oneCard) {
                    oneCard.appendChild(safetyNetMiddle);
                }
                [safetyNetLeft, safetyNetRight, safetyNetMiddle].forEach(net => {
                    if (net && net.style) net.style.display = "none";
                });
            }, 300);
        }
    });

    const helpElements = [helpTwo, helpThree, helpFour, helpFive, helpSix, helpSeven, helpEight];
    helpElements.forEach(helpElement => {
        if (helpElement && helpElement.style) helpElement.style.opacity = "0";
    });

    if (helpOne && helpOne.style) helpOne.style.opacity = "1";

    document.querySelectorAll(".cardOne").forEach(cardOne => {
        cardOne.classList.remove("active");
        cardOne.style.pointerEvents = 'auto';
    });

    document.querySelectorAll(".cardGroup").forEach(card => {
        card.style.pointerEvents = 'none';
        setTimeout(() => {
            card.style.pointerEvents = 'auto';
        }, 300);
    });

    try {
        const parts = (location.pathname || '').split('/').filter(Boolean);
        if (parts.length >= 2) {
            const base = '/' + parts[0];
            history.replaceState({}, '', base);
        } else if (parts.length === 1) {
            history.replaceState({}, '', '/');
        }
    } catch (e) {
    }
}

// card flicking

document.body.addEventListener("click", function(event) {
    const cardContainer = event.target.closest(".cardContainer");
    if (!cardContainer || cardContainer.style.display === "none") return;

    if (cardContainer.dataset && cardContainer.dataset.animating === '1') return;

    if (event.target === cardContainer) {
        closeTutorial();
        return;
    }

        const card = event.target.closest(".card, .cardOne");
        if (!card) return;

        try { cardContainer.dataset.animating = '1'; } catch(e) {}

        try {
            const clearInline = (el) => {
                if (!el) return;
                try { if (el.dataset && el.dataset.__origTransform !== undefined) delete el.dataset.__origTransform; } catch (e) {}
                try { el.style.transform = ''; el.style.transition = ''; } catch (e) {}
            };
            clearInline(card);
            const container = card.closest('.cardContainer');
            if (container) {
                const active = container.querySelector('.card.active');
                const cardOne = container.querySelector('.cardOne');
                clearInline(active);
                clearInline(cardOne);
            }
        } catch (e) {}
        (function watchEnd() {
            try {
                const clear = () => { try { delete cardContainer.dataset.animating; } catch(e) {} };
                let cleared = false;
                const handler = (ev) => {
                    if (ev.propertyName && /transform|left|width|height/.test(ev.propertyName)) {
                        if (cleared) return;
                        cleared = true;
                        clear();
                        cardContainer.querySelectorAll('.card, .cardOne').forEach(c => c.removeEventListener('transitionend', handler));
                    }
                };
                cardContainer.querySelectorAll('.card, .cardOne').forEach(c => c.addEventListener('transitionend', handler));
                setTimeout(() => { if (!cleared) { cleared = true; clear(); } }, 600);
            } catch (e) {}
        })();

    if (card.classList.contains("cardOne") && !card.classList.contains("active")) {
        return;
    }

    const cards = Array.from(cardContainer.querySelectorAll(".card"));
    const cardOne = cardContainer.querySelector(".cardOne");
    const idx = cards.indexOf(card);

    const helpClass = Array.from(card.classList).find(cls => /^help(One|Two|Three|Four|Five|Six|Seven|Eight)$/.test(cls));
    if (helpClass) {
        showHelp(helpClass);
    } else {
        showHelp("helpOne");
    }

    if (card.classList.contains("cardTwo") && cardOne && !cardOne.classList.contains("active")) {
        cardOne.classList.add("active");
        cardOne.style.pointerEvents = "auto";
        const safetyNetLeft = document.getElementById("safetyNetLeft");
        if (safetyNetLeft && safetyNetLeft.parentNode !== cardContainer) {
            cardContainer.appendChild(safetyNetLeft);
        }
        if (safetyNetLeft) safetyNetLeft.style.display = "block";
    }

    if (card.classList.contains("cardThree") || card.classList.contains("cardFour")) {
        const safetyNetRight = document.getElementById("safetyNetRight");
        if (safetyNetRight && safetyNetRight.parentNode !== cardContainer) {
            cardContainer.appendChild(safetyNetRight);
        }
        if (safetyNetRight) safetyNetRight.style.display = "block";
    }

    if (card.classList.contains("cardOne") && card.classList.contains("active")) {
        card.classList.remove("active");
        const cardTwo = cardContainer.querySelector(".cardTwo");
        if (cardTwo) cardTwo.classList.remove("active");

        setTimeout(() => {
            const safetyNetLeft = document.getElementById("safetyNetLeft");
            if (safetyNetLeft) safetyNetLeft.style.display = "none";
        }, 700);

        const prevCard = cards.find(c => c.classList.contains("activeTwo"));
        if (prevCard) {
            prevCard.classList.remove("activeTwo");
            prevCard.classList.add("active");
            prevCard.style.pointerEvents = "none";
            const prevIdx = cards.indexOf(prevCard);
            if (prevIdx > 0) {
                cards[prevIdx - 1].style.pointerEvents = "auto";
            }
        }

        if (cards.length > 0) {
            cards[0].style.pointerEvents = "auto";
        }

        let currentNum = parseInt(num.innerText.split('/')[0]);
        if (currentNum > 1) {
            num.innerText = `${currentNum - 1}/${num.innerText.split('/')[1]}`;
        }
        return;
    }

    const active = cardContainer.querySelector(".card.active");
    lastPressedCard = card;
    card.style.pointerEvents = 'none';

    if (card.classList.contains("cardFour")) {
        setTimeout(() => {
            const safetyNetRight = document.getElementById("safetyNetRight");
            if (safetyNetRight) safetyNetRight.style.display = "none";
        }, 700);
    }

    if (card.classList.contains("cardThree")) {
        const safetyNetRight = document.getElementById("safetyNetRight");
        if (safetyNetRight) safetyNetRight.style.display = "block";
    }

    if (idx !== -1 && idx < cards.length - 1) {
        cards.forEach(cardEl => {
            cardEl.style.pointerEvents = "none";
        });
        cardContainer.querySelectorAll(".cardOne").forEach(cardOneEl => {
            cardOneEl.style.pointerEvents = "auto";
        });
        cards[idx + 1].style.pointerEvents = "auto";
        document.querySelectorAll(".cardOne").forEach(cardOne => {
            cardOne.classList.add("active");
            const safetyNetLeft = document.getElementById("safetyNetLeft");
            if (safetyNetLeft) safetyNetLeft.style.display = "block";
        });
    }

    if (card.classList.contains("activeTwo")) {
        card.classList.remove("activeTwo");
        card.classList.add("active");
        if (active) {
            active.classList.remove("active");
            active.style.pointerEvents = "auto";
        }
        if (idx > 0) {
            cards[idx - 1].style.pointerEvents = "auto";
        }
        let currentNum = parseInt(num.innerText.split('/')[0]);
        num.innerText = `${currentNum - 1}/${num.innerText.split('/')[1]}`;
        return;
    }

    if (!card.classList.contains("active") && !card.classList.contains("activeTwo")) {
        card.classList.add("active");
        if (active) {
            active.classList.add("activeTwo");
            active.classList.remove("active");
            active.style.pointerEvents = "auto";
        }
        let currentNum = parseInt(num.innerText.split('/')[0]);
        num.innerText = `${currentNum + 1}/${num.innerText.split('/')[1]}`;
    } else if (card.classList.contains("active") && !card.classList.contains("activeTwo")) {
        card.classList.add("activeTwo");
        card.classList.remove("active");
    }
});

// horizontal scrolling

document.querySelectorAll('.tutorialGroup').forEach(group => {
    let targetScroll = 0;
    let isScrolling = false;
    group.addEventListener('wheel', (e) => {
      e.preventDefault();
      const scrollSpeed = 2.5;
      targetScroll += e.deltaY * scrollSpeed;
      const maxScroll = group.scrollWidth - group.clientWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      if (!isScrolling) {
        isScrolling = true;
        smoothScroll();
      }
      function smoothScroll() {
        const currentScroll = group.scrollLeft;
        const distance = targetScroll - currentScroll;
        const step = distance * 0.15;
  
        if (Math.abs(step) > 0.5) {
          group.scrollLeft += step;
          requestAnimationFrame(smoothScroll);
        } else {
          group.scrollLeft = targetScroll;
          isScrolling = false;
        }
      }
    }, { passive: false });
  });  

(function setupHelpHover() {
    const helpEl = document.getElementById("help");
    if (!helpEl) return;

    helpEl.addEventListener('mouseenter', function () {
        try {
            if (this.classList.contains('active')) return;
            this.style.transition = this.style.transition || 'transform 0.32s cubic-bezier(0.4,0,0.2,1)';
            this.style.transform = 'translate(-50%,72%)';
            this.style.cursor = 'pointer';
        } catch (e) {}
    });
    helpEl.addEventListener('mouseleave', function () {
        try {
            if (this.classList.contains('active')) return;
            this.style.transform = 'translate(-50%,80%)';
        } catch (e) {}
    });

    helpEl.addEventListener('click', function () {
        try { this.style.transform = ''; this.style.transition = ''; } catch (e) {}
        this.classList.toggle('active');
    });
})();

document.querySelectorAll('.cardContainer').forEach(container => {
    container.addEventListener('click', function(event) {
        if (event.target === this) {
            closeTutorial();
        }
    });
});

document.querySelectorAll(".cardContainer").forEach(container => {
    const cards = container.querySelectorAll(".card, .cardOne");
    if (cards.length === 2) {
        cards[1].addEventListener("click", () => {
            const rightSafetyNet = document.getElementById("safetyNetRight");
            if (rightSafetyNet) {
                setTimeout(() => {
                    rightSafetyNet.style.display = "none";
                }, 500);
            }
        });
    }
});

// help menu stuff

function showHelp(helpId) {
    const helpElements = [helpOne, helpTwo, helpThree, helpFour, helpFive, helpSix, helpSeven, helpEight];
    helpElements.forEach(helpElement => {
        if (helpElement.id === helpId) {
            helpElement.style.opacity = 1;
            helpElement.style.pointerEvents = 'auto';
        } else {
            helpElement.style.opacity = 0;
            helpElement.style.pointerEvents = 'none';
        }
    });
}

["helpOne", "helpTwo", "helpThree", "helpFour", "helpFive", "helpSix", "helpSeven", "helpEight"].forEach(helpId => {
    document.querySelectorAll(`.${helpId}`).forEach(element => {
        element.addEventListener("click", () => showHelp(helpId));
    });
});

// disables hover effects on touch devices

function hasTouch() {
    return 'ontouchstart' in document.documentElement
           || navigator.maxTouchPoints > 0
           || navigator.msMaxTouchPoints > 0;
  }
  
  if (hasTouch()) {
    try {
      for (var si in document.styleSheets) {
        var styleSheet = document.styleSheets[si];
        if (!styleSheet.rules) continue;
  
        for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
          if (!styleSheet.rules[ri].selectorText) continue;
  
          if (styleSheet.rules[ri].selectorText.match(':hover')) {
            styleSheet.deleteRule(ri);
          }
        }
      }
    } catch (ex) {}
  }

fetch('https://assets.grab-tutorials.live/decks.json')
  .then(res => res.json())
  .then(decks => {
    const totalDecks = decks.length;
    let totalCards = 0;
    decks.forEach(deck => {
      if (deck.cards && typeof deck.cards === "object") {
        totalCards += Object.keys(deck.cards).length;
      }
    });
    console.log(`Total decks: ${totalDecks}`);
    console.log(`Total cards: ${totalCards}`);
  })
  .catch(() => {
    console.log("Could not fetch decks.json for deck/card count.");
  });

(function setupCardHoverMotion(){
    function getScaleSuffix(el) {
        if (el.classList.contains('cardOne') && !el.classList.contains('active')) return ' scale(1.4)';
        if (el.classList.contains('card') && el.classList.contains('active')) return ' scale(1.4)';
        return '';
    }

    function computeHoverTransform(el) {
        const scale = getScaleSuffix(el);
        if (el.classList.contains('cardOne')) {
            if (el.classList.contains('active')) return 'translate(-40%,-50%)' + scale;
            return 'translate(-50%,-50%)' + scale;
        }
        if (el.classList.contains('activeTwo')) {
            return 'translate(-40%,-50%)' + scale;
        }
        if (!el.classList.contains('active')) {
            return 'translate(-60%,-50%)' + scale;
        }
        return null;
    }

    function onCardMouseEnter(e) {
        const el = e.currentTarget;
        try {
            const desired = computeHoverTransform(el);
            if (!desired) return;
            if (el.dataset.__origTransform === undefined) {
                el.dataset.__origTransform = el.style.transform || '';
            }
            el.style.transition = el.style.transition || 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
            el.style.transform = desired;
        } catch (err) {}
    }

    function onCardMouseLeave(e) {
        const el = e.currentTarget;
        try {
            const orig = el.dataset.__origTransform;
            if (orig !== undefined) {
                el.style.transform = orig;
                delete el.dataset.__origTransform;
            }
        } catch (err) {}
    }

    function attachTo(el) {
        if (!el || el.__hoverAttached) return;
        el.addEventListener('mouseenter', onCardMouseEnter);
        el.addEventListener('mouseleave', onCardMouseLeave);
        el.__hoverAttached = true;
    }

    document.querySelectorAll('.card, .cardOne').forEach(attachTo);

    const mo = new MutationObserver(muts => {
        muts.forEach(m => {
            m.addedNodes && m.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches && (node.matches('.card') || node.matches('.cardOne'))) attachTo(node);
                node.querySelectorAll && node.querySelectorAll('.card, .cardOne').forEach(attachTo);
            });
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
})();

async function searchDecks() {
    var input = document.getElementById("searchBox").value.toLowerCase().trim();
    
    if (!input) {
        closeAllMenus();
        try { history.replaceState({}, '', '/'); } catch (e) {}
        return;
    }
    
    const searchTerms = input.split(/\s+/).filter(t => t);
    
    try {
        const response = await fetch("https://assets.grab-tutorials.live/decks.json");
        const decks = await response.json();
        
        const matchingCards = [];
        const seenCovers = new Set();
        
        decks.forEach(deck => {
            if (deck.cards && typeof deck.cards === "object") {
                Object.values(deck.cards).forEach(card => {
                    if (card.terms) {
                        const termsList = card.terms
                            .replace(/,/g, " ")
                            .split(/\s+/)
                            .filter(t => t)
                            .map(t => t.toLowerCase());
                        
                        let matchCount = 0;
                        searchTerms.forEach(searchTerm => {
                            if (termsList.some(term => term === searchTerm)) {
                                matchCount++;
                            }
                        });
                        
                        if (matchCount > 0) {
                            const cover = card.cover || deck.cover;
                            if (cover && !seenCovers.has(cover)) {
                                seenCovers.add(cover);
                                matchingCards.push({
                                    title: card.title || "Untitled",
                                    cover: cover,
                                    deckTitle: deck.title || deck.id,
                                    category: deck.category,
                                    slug: deck.slug,
                                    matchCount: matchCount
                                });
                            }
                        }
                    }
                });
            }
        });
        
        matchingCards.sort((a, b) => b.matchCount - a.matchCount);
        
        openSearchMenu(matchingCards);
        try {
            const query = encodeURIComponent(input);
            const newUrl = '/search?=' + query;
            try { history.replaceState({}, '', newUrl); } catch (e) {}
        } catch (e) {}
        
    } catch (error) {
        console.error("Error searching decks:", error);
    }
}
function openSearchMenu(cards) {
    closeAllMenus();
        const sMenu = document.getElementById("SMenu");
        const searchGrid = document.getElementById("searchResultsGrid");        
        if (!sMenu || !searchGrid) {
            return;
        }
        
        searchGrid.innerHTML = "";
    
    const categoryOrder = ['basics', 'editor', 'animation', 'trigger', 'gasm'];
    const categoryColors = {
        basics: 'rgb(144, 207, 144)',
        editor: 'rgb(124, 72, 72)',
        animation: '#638DDD',
        trigger: 'rgb(248, 153, 0)',
        gasm: 'rgb(115, 210, 120)'
    };
    
    const groupedCards = {};
    categoryOrder.forEach(cat => {
        groupedCards[cat] = [];
    });
    
    cards.forEach(card => {
        const category = (card.category || 'basics').toLowerCase();
        if (!groupedCards[category]) {
            groupedCards[category] = [];
        }
        groupedCards[category].push(card);
    });
    
    Object.keys(groupedCards).forEach(category => {
        groupedCards[category].sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0));
    });
    
    categoryOrder.forEach(category => {
        if (groupedCards[category].length > 0) {
            const headerDiv = document.createElement("div");
            headerDiv.style.gridColumn = '1 / -1';
            headerDiv.style.marginTop = category === 'basics' ? '0' : '1.5rem';
            headerDiv.style.marginBottom = '0.5rem';
            headerDiv.style.paddingLeft = '2rem';
            headerDiv.style.paddingBottom = '0.5rem';
            headerDiv.style.borderBottom = `2px solid ${categoryColors[category] || '#888888'}`;
            
            const titleH2 = document.createElement("h2");
            titleH2.textContent = category === 'gasm' ? 'GASM' : category.charAt(0).toUpperCase() + category.slice(1);
            titleH2.style.color = categoryColors[category] || '#888888';
            titleH2.style.fontSize = '1.3rem';
            titleH2.style.fontFamily = "'nunito', sans-serif";
            titleH2.style.fontWeight = '600';
            titleH2.style.margin = '0';
            
            headerDiv.appendChild(titleH2);
            searchGrid.appendChild(headerDiv);
            
            groupedCards[category].forEach(card => {
                if (card.cover) {
                    const cardItem = document.createElement("div");
                    cardItem.className = "searchCardItem";
                    
                    const img = document.createElement("img");
                    const imageUrl = "https://assets.grab-tutorials.live/" + card.cover.replace(/^\/+/, "");
                    img.src = imageUrl;
                    img.alt = card.title;
                    img.loading = "lazy";
                    
                    img.onerror = () => {
                        console.error(`Failed to load image: ${imageUrl}`);
                    };
                    
                    cardItem.appendChild(img);
                    
                    cardItem.addEventListener("click", () => {
                        openDeckFromSearch(card);
                    });
                    
                    searchGrid.appendChild(cardItem);
                }
            });
        }
    });
    
    const mMenu = document.getElementById("MMenu");
    mMenu.style.background = "";
    mMenu.style.setProperty("--menu-gradient", "");
    
    const menuButtons = document.getElementById("menuButtons");
    menuButtons.style.setProperty("--button-gradient", "linear-gradient(to top, rgb(115, 210, 120), transparent)");    
    
    const backButtonContainer = document.createElement("div");
    backButtonContainer.style.position = 'absolute';
    backButtonContainer.style.top = '1rem';
    backButtonContainer.style.left = '1rem';
    backButtonContainer.style.zIndex = '1001';
    backButtonContainer.style.cursor = 'pointer';
    
    const backButton = document.createElement("img");
    backButton.src = 'https://assets.grab-tutorials.live/!assets/back-btn.svg';
    backButton.alt = 'Back';
    backButton.style.width = '2rem';
    backButton.style.height = '2rem';
    
    backButtonContainer.appendChild(backButton);
    backButtonContainer.addEventListener('click', () => {
        closeSearchMenu();
        if (previouslyOpened !== null) {
            openMenu(previouslyOpened);
        }
    });
    
    searchGrid.appendChild(backButtonContainer);
    
    sMenu.style.display = 'block';
    sMenu.style.zIndex = 1000;
    sMenu.style.pointerEvents = 'auto';
}

function closeSearchMenu() {
    const sMenu = document.getElementById("SMenu");
    if (sMenu) {
        sMenu.style.display = 'none';
        sMenu.style.zIndex = '';
        sMenu.style.pointerEvents = 'none';
    }
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.value = '';
    }
    try { history.replaceState({}, '', '/'); } catch (e) {}
}

async function expandDeckCards(deckCard, searchTerms) {
    try {
        const decks = await window.fetchDecks();
        const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const matchedDeck = decks.find(deck => {
            const t = (deck.title || '').toString();
            return normalize(t) === normalize(deckCard.deckTitle) || t.toLowerCase() === deckCard.deckTitle.toLowerCase() || (deck.id && deck.id.toLowerCase() === deckCard.deckTitle.toLowerCase());
        });
        
        if (!matchedDeck || !matchedDeck.cards) return;
        
        const searchGrid = document.getElementById("searchResultsGrid");
        if (!searchGrid) return;
        
        searchGrid.innerHTML = "";
        
        Object.values(matchedDeck.cards).forEach(card => {
            if (card.terms) {
                const termsList = card.terms
                    .replace(/,/g, " ")
                    .split(/\s+/)
                    .filter(t => t)
                    .map(t => t.toLowerCase());
                
                if (searchTerms.every(searchTerm => termsList.some(term => term === searchTerm))) {
                    const cardEl = document.createElement("div");
                    cardEl.className = "searchCardItem";
                    
                    const img = document.createElement("img");
                    const cardCover = card.cover || matchedDeck.cover;
                    if (cardCover) {
                        const imageUrl = "https://assets.grab-tutorials.live/" + cardCover.replace(/^\/+/, "");
                        img.src = imageUrl;
                        img.alt = card.title;
                        img.loading = "lazy";
                        cardEl.appendChild(img);
                        searchGrid.appendChild(cardEl);
                    }
                }
            }
        });
        
        const backBtn = document.createElement("button");
        backBtn.className = "backDeckBtn";
        backBtn.textContent = "Back";
        backBtn.addEventListener("click", () => {
            openSearchMenu([deckCard]);
        });
        searchGrid.appendChild(backBtn);
        
    } catch (e) {
        console.error("Error expanding deck:", e);
    }
}

function closeAllMenus() {
    const menus = ["TMenu", "BMenu", "AMenu", "EMenu", "GMenu", "LMenu", "SMenu"];
    const buttons = ["T", "B", "A", "E", "G", "L"];

    for (let i = 0; i < menus.length; i++) {
        if (document.getElementById(menus[i]).style.display === "block") {
            previouslyOpened = menus[i];
        }
    }
    
    const mMenu = document.getElementById("MMenu");
    mMenu.style.background = "";
    mMenu.style.setProperty("--menu-gradient", "");
    
    menus.forEach((id, index) => {
        const menu = document.getElementById(id);
        if (menu) {
            menu.style.display = 'none';
            menu.style.zIndex = '';
            menu.style.pointerEvents = 'none';
        }
        if (index < buttons.length) {
            const button = document.getElementById(buttons[index]);
            if (button) button.classList.remove("active");
        }
    });
}

async function openDeckFromSearch(card) {
    try {
        if (!window.fetchDecks || !window.renderCardDeck) return;
        
        const sMenu = document.getElementById("SMenu");
        if (sMenu) sMenu.style.display = 'none';
        
        const decks = await window.fetchDecks();
        const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const matchedDeck = decks.find(deck => {
            const t = (deck.title || '').toString();
            return normalize(t) === normalize(card.deckTitle) || t.toLowerCase() === card.deckTitle.toLowerCase() || (deck.id && deck.id.toLowerCase() === card.deckTitle.toLowerCase());
        });
        
        if (!matchedDeck) return;
        
        const cat = (card.category || matchedDeck.category || 'basics').toLowerCase();
        const menuId = CATEGORY_TO_MENU[cat];
        if (!menuId) return;
        
        const buttonId = menuId.replace('Menu', '');
        const btn = document.getElementById(buttonId);
        
        if (btn) {
            window.__initialPathNavigation = true;
            btn.click();
            setTimeout(() => {
                window.renderCardDeck(matchedDeck);
                const deckSlug = normalize(matchedDeck.title || matchedDeck.slug || '');
                const fullPath = '/' + cat + '/' + deckSlug;
                try {
                    history.pushState({ menuId: menuId }, '', fullPath);
                } catch (e) {}
            }, 120);
        }
        
    } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("searchBox");
    const searchBtn = document.getElementById("searchBtn");
    const searchBar = document.getElementById("searchBar");

    (function restoreSearchFromUrl(){
        try {
            let q = '';
            const params = new URLSearchParams(window.location.search);
            if (params.has('q')) q = params.get('q');
            else if (params.has('search')) q = params.get('search');
            else if ((window.location.pathname || '').toLowerCase().startsWith('/search') && window.location.search && window.location.search.startsWith('?=')) q = decodeURIComponent(window.location.search.slice(2));
            if (q && searchBox) {
                searchBox.value = q;
                setTimeout(() => { if (typeof searchDecks === 'function') searchDecks(); }, 10);
            }
        } catch (e) {}
    })();
    
    function isMobile() {
        return window.innerWidth <= 767;
    }
    
    if (searchBox) {
        searchBox.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchDecks();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isMobile()) {
                searchBar.classList.toggle("expanded");
                if (searchBar.classList.contains("expanded")) {
                    setTimeout(() => searchBox.focus(), 100);
                }
            } else {
                searchDecks();
            }
        });
    }
    
    if (searchBox) {
        searchBox.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                searchBar.classList.remove("expanded");
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (isMobile() && searchBar && searchBox && searchBtn && searchBar.classList.contains("expanded")) {
            if (!searchBar.contains(e.target) && !searchBtn.contains(e.target) && !searchBox.contains(e.target)) {
                searchBar.classList.remove("expanded");
            }
        }
    });
});

fetch("https://assets.grab-tutorials.live/patch-notes.txt")
  .then(res => res.text())
  .then(html => {
    document.getElementById("patchContainer").innerHTML += html;
  })