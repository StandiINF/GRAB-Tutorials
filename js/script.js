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

let lastPressedCard = null;

const patchNotesContainer = document.getElementById("patchNotesContainer");
const patchNotesToggle = document.getElementById("patchNotesToggle");

// patch notes appear thing

patchNotesToggle.addEventListener("click", () => {
    if (patchNotesContainer.style.top === "0px") {
        patchNotesContainer.style.top = "-100%";
        patchNotesToggle.innerText = "Patch Notes";
        setTimeout(() => { 
            patchNotesContainer.style.display = "none";
        }, 100);
    } else {
        patchNotesContainer.style.display = "block";
        setTimeout(() => {
            patchNotesContainer.style.top = "0px";
            patchNotesToggle.innerText = "Close";
        }, 10);
    }
});

patchNotesToggle.style.display = "none";

// open / close when press numpad +

document.addEventListener("keydown", (event) => {
    if (patchNotesToggle.style.display === "block" && (event.key === "P" || event.key === "p")) {
        patchNotesToggle.click();
    }
    if (event.code === "NumpadAdd") {
        patchNotesToggle.style.display = patchNotesToggle.style.display === "block" ? "none" : "block";
    }
});

// menu opening / closing

function openMenu(menuId) {
    const menus = ["TMenu", "BMenu", "AMenu", "EMenu", "LMenu"];
    const buttons = ["T", "B", "A", "E", "L"];
    let userColour = localStorage.getItem('hexColor') || "#888888";
    let userColourSecondary = localStorage.getItem('hexColorSecondary') || "#888888";
    const menu = document.getElementById(menuId);
    const menuButtons = document.getElementById("menuButtons");

    function applyMenuColours(colour, secondaryColour) {
        const colors = {
            TMenu: { background: "rgb(248, 153, 0)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(248, 153, 0) 100%)", buttonGradient: "linear-gradient(to top, rgb(248, 153, 0), transparent)" },
            BMenu: { background: "rgb(144, 207, 144)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(144, 207, 144) 100%)", buttonGradient: "linear-gradient(to top, rgb(144, 207, 144), transparent)" },
            AMenu: { background: "#638DDD", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, #638DDD 100%)", buttonGradient: "linear-gradient(to top, #638DDD, transparent)" },
            EMenu: { background: "rgb(124, 72, 72)", gradient: "linear-gradient(to top, rgba(177, 65, 65, 0) 0%, rgb(124, 72, 72) 100%)", buttonGradient: "linear-gradient(to top, rgb(124, 72, 72), transparent)" },
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
    const menus = ["TMenu", "BMenu", "AMenu", "EMenu", "LMenu"];
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        menu.style.pointerEvents = 'none';
        menu.style.display = 'none';
    });
}

// safety nets to prevent accidental closing

function moveSafetyNets(container) {
    const safetyNetMiddle = document.getElementById("safetyNetMiddle");
    const safetyNetRight = document.getElementById("safetyNetRight");
    if (safetyNetMiddle && safetyNetMiddle.parentNode !== container) {
        container.appendChild(safetyNetMiddle);
    }
    if (safetyNetRight && safetyNetRight.parentNode !== container) {
        container.appendChild(safetyNetRight);
    }
}

function oneCardSafetyNet(container) {
    const oneCard = document.getElementById("oneCard");
    if (oneCard && oneCard.parentNode !== container) {
        container.appendChild(oneCard);
    }
    const safetyNetMiddle = document.getElementById("safetyNetMiddle");
    if (safetyNetMiddle && safetyNetMiddle.parentNode !== oneCard) {
        oneCard.appendChild(safetyNetMiddle);
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

            const elements = container.querySelectorAll(".card");
            elements.forEach(element => {
                element.classList.remove("active", "activeTwo");
                element.style.zIndex = '';
                element.style.pointerEvents = 'auto';
            });

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
}

// card flicking

document.body.addEventListener("click", function(event) {
    const cardContainer = event.target.closest(".cardContainer");
    if (!cardContainer || cardContainer.style.display === "none") return;

    if (event.target === cardContainer) {
        closeTutorial();
        return;
    }

    const card = event.target.closest(".card, .cardOne");
    if (!card) return;

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

document.getElementById("help").addEventListener("click", function() {
    this.classList.toggle("active");
});

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
    console.log(`To open Patch Notes, press Numpad +`);
  })
  .catch(() => {
    console.log("Could not fetch decks.json for deck/card count.");
  });