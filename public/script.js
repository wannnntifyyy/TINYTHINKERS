(() => {
  "use strict";

  // ==========================================
  // 1. APPLICATION STATE
  // ==========================================

  const STORAGE_KEY = "tinyThinkers_v1";

  const defaultState = {
    name: "Little Explorer",
    avatar: "🐻",
    stars: 0,
    coins: 20,
    stickers: [],
    ownedCharacters: ["🐻"],
    activeCharacter: "🐻",
    tasks: 0,
    completed: [],
    apiPath: "/api/agent"
  };

  let state = loadState();
  let toastTimer;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  // ==========================================
  // 2. LOCAL STORAGE
  // ==========================================

  function loadState() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      return {
        ...defaultState,
        ...saved
      };

    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    renderStats();
  }


  // ==========================================
  // 3. TOAST NOTIFICATION
  // ==========================================

  function toast(message) {
    const node = $("#toast");

    node.textContent = message;
    node.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      node.classList.remove("show");
    }, 2500);
  }


  // ==========================================
  // 4. PAGE NAVIGATION
  // ==========================================

  function showPage(pageName) {

    const page = $(`#page-${pageName}`);

    if (!page) {
      toast("This page is not available yet.");
      return;
    }

    $$(".page").forEach(section => {
      section.classList.toggle(
        "active",
        section === page
      );
    });

    $$(".nav-btn[data-page]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    $("#sidebar").classList.remove("open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (pageName === "ai-tools") {
      checkAIConnection();
    }

    if (pageName === "rewards") {
      renderRewards();
    }

    if (pageName === "profile") {
      renderProfile();
    }

    if (pageName === "settings") {
      $("#apiPathInput").value = state.apiPath;
    }
  }


  // ==========================================
  // 5. UPDATE DASHBOARD STATISTICS
  // ==========================================

  function renderStats() {

    $("#topStars").textContent = state.stars;
    $("#topCoins").textContent = state.coins;

    $("#welcomeName").textContent = state.name;
    $("#profileName").textContent = state.name;

    $("#profileAvatar").textContent =
      state.activeCharacter || state.avatar;

    $("#profileLevel").textContent =
      `Level ${Math.max(
        1,
        Math.floor(state.tasks / 5) + 1
      )} Explorer`;

    $("#homeProgressText").textContent =
      `${state.tasks} activities`;

    $("#homeProgressBar").style.width =
      `${Math.min(100, (state.tasks % 10) * 10)}%`;

    $("#insightTasks").textContent = state.tasks;
    $("#insightCoins").textContent = state.coins;

    $("#insightStickers").textContent =
      state.stickers.length;

    $("#rewardStars").textContent = state.stars;
    $("#rewardCoins").textContent = state.coins;

    $("#rewardStickers").textContent =
      state.stickers.length;
  }


  // ==========================================
  // 6. REWARD SYSTEM
  // ==========================================

  function completeActivity(label) {

    state.tasks += 1;
    state.stars += 1;
    state.coins += 2;

    const stickerPool = [
      "🌟",
      "🦄",
      "🌈",
      "🍭",
      "🐸",
      "🦋",
      "🍎",
      "🚀"
    ];

    const sticker =
      stickerPool[(state.tasks - 1) % stickerPool.length];

    if (!state.stickers.includes(sticker)) {
      state.stickers.push(sticker);
    }

    state.completed.push(label);

    saveState();

    toast(
      `Great job! +1 star, +2 coins and ${sticker} sticker!`
    );

    renderRewards();
  }


  // ==========================================
  // 7. HAPPY MART PRODUCT DATABASE
  // ==========================================

  const products = {

    apple: {
      emoji: "🍎",
      name: "APPLE",
      description:
        "An apple is a fruit. It can be red, green or yellow.",
      syllable: "AP - PLE",
      word: "A P P L E"
    },

    milk: {
      emoji: "🥛",
      name: "MILK",
      description:
        "Milk is a drink. It helps our body grow strong.",
      syllable: "MILK",
      word: "M I L K"
    },

    banana: {
      emoji: "🍌",
      name: "BANANA",
      description:
        "A banana is a long, soft fruit. Monkeys like bananas!",
      syllable: "BA - NA - NA",
      word: "B A N A N A"
    },

    bread: {
      emoji: "🍞",
      name: "BREAD",
      description:
        "Bread is a food that we can eat for breakfast.",
      syllable: "BREAD",
      word: "B R E A D"
    },

    egg: {
      emoji: "🥚",
      name: "EGG",
      description:
        "An egg is a food that comes from a chicken.",
      syllable: "EGG",
      word: "E G G"
    },

    juice: {
      emoji: "🧃",
      name: "JUICE",
      description:
        "Juice is a drink often made from fruit.",
      syllable: "JUICE",
      word: "J U I C E"
    }

  };


  // ==========================================
  // 8. TEXT TO SPEECH
  // ==========================================

  function speak(text) {

    if (!("speechSynthesis" in window)) {

      toast(
        "Speech playback is not supported in this browser."
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.82;

    window.speechSynthesis.speak(utterance);
  }


  // ==========================================
  // 9. OPEN PRODUCT LEARNING PANEL
  // ==========================================

  function openProduct(key) {

    const product = products[key];

    if (!product) return;

    $("#learningPanel").classList.remove("hidden");

    $("#learningObject").textContent =
      product.emoji;

    $("#learningWord").textContent =
      product.name;

    $("#learningDescription").textContent =
      product.description;

    $("#learningSyllable").textContent =
      product.syllable;

    $("#missingWord").textContent =
      product.word;

    $("#learningPanel").dataset.product = key;

    $("#learningPanel").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }


  // ==========================================
  // 10. CHAT MESSAGE DISPLAY
  // ==========================================

  function addChatMessage(message, sender) {

    const bubble = document.createElement("div");

    bubble.className =
      `chat-bubble ${
        sender === "user"
          ? "user-bubble"
          : "ai-bubble"
      }`;

    bubble.textContent = message;

    $("#chatMessages").appendChild(bubble);

    $("#chatMessages").scrollTop =
      $("#chatMessages").scrollHeight;

    return bubble;
  }


  // ==========================================
  // 11. AI AGENT CONNECTION
  // ==========================================
  
const preparedAnswers = [
  {
    keywords: ["teach me abc", "teach me the alphabet", "alphabet", "abc"],
    reply: `🌟 Let's learn the alphabet!

There are 26 letters in the English alphabet.

A is for Apple 🍎
B is for Ball ⚽
C is for Cat 🐱
D is for Dog 🐶

Let's practise together!

Can you say:
A, B, C, D?

Wonderful job, little explorer! 🎉`
  },
  {
    keywords: ["teach me numbers", "count", "counting", "numbers"],
    reply: `🔢 Let's learn to count from 1 to 5!

1️⃣ One 🍎
2️⃣ Two 🍌🍌
3️⃣ Three ⭐⭐⭐
4️⃣ Four 🐻🐻🐻🐻
5️⃣ Five 🎈🎈🎈🎈🎈

Now let's count together!

1... 2... 3... 4... 5!

Amazing! You did it! 🌈`
  },
  {
    keywords: ["tell me about fruits", "fruits", "fruit"],
    reply: `🍎 Welcome to the Fruit Garden!

Let's discover some delicious fruits!

🍎 Apple – Red, crunchy and sweet!
🍌 Banana – Yellow, soft and yummy!
🍊 Orange – Juicy and full of vitamin C!
🍇 Grapes – Small, round and sweet!
🍉 Watermelon – Big, juicy and refreshing!

Which fruit is your favourite?

Remember to eat fruits to stay healthy! 💚`
  }
];

function getPreparedAnswer(message) {
  const question = message.toLowerCase().trim();

  const matched = preparedAnswers.find(item =>
    item.keywords.some(keyword => question.includes(keyword))
  );

  return matched ? matched.reply : null;
}


  async function askAI(message, mode = "chat") {

    const text = String(message || "").trim();

    if (!text) return;

    addChatMessage(text, "user");

// Check prepared answers first
const preparedReply = getPreparedAnswer(text);

if (preparedReply) {
  const pending = addChatMessage(
    "Thinking of a helpful answer... 🤖",
    "ai"
  );

  setTimeout(() => {
    pending.textContent = preparedReply;
    setAIStatus(true, "Learning Buddy ready");

    if (mode === "pronunciation") {
      speak(preparedReply);
    }
  }, 500);

  return;
}

const pending = addChatMessage(
  "Thinking of a helpful answer... 🤖",
  "ai"
);

    const sendButton = $("#aiChatForm button");

    sendButton.disabled = true;

    let timeout;

    try {

      const controller = new AbortController();

      timeout = setTimeout(() => {
        controller.abort();
      }, 90000);

      const response = await fetch(
        state.apiPath || "/api/agent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            message: text,

            mode: mode,

            studentName: state.name,

            audience: "preschool",

            currentModule: "ABC & BIM",

            studentProgress: {

              tasks: state.tasks,

              stars: state.stars,

              coins: state.coins,

              stickers: state.stickers.length,

              recentActivities:
                state.completed.slice(-5)

            }

          }),

          signal: controller.signal

        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {

        throw new Error(
          data.error ||
          data.message ||
          `Server returned ${response.status}`
        );

      }

      const reply =
        data.reply ||
        data.answer ||
        data.message ||
        data.output;

      if (
        typeof reply !== "string" ||
        !reply.trim()
      ) {

        throw new Error(
          "Backend responded, but no reply text was found. Return JSON with a 'reply' property."
        );

      }

      pending.textContent = reply;

      setAIStatus(true, "AI connected");

      if (mode === "pronunciation") {
        speak(reply);
      }

    } catch (error) {

      const detail =
        error.name === "AbortError"
          ? "The AI request took too long."
          : error.message;

      pending.textContent =
        `I couldn't reach my AI helper just now. ${detail} Please check that your Node.js backend is running and that the frontend is served from the correct address.`;

      console.error(
        "AI request error:",
        error
      );

      setAIStatus(
        false,
        "AI connection unavailable"
      );

    } finally {

      clearTimeout(timeout);

      sendButton.disabled = false;

      $("#aiInput").focus();

    }

  }


  // ==========================================
  // 12. AI CONNECTION STATUS
  // ==========================================

  function setAIStatus(connected, label) {

    const status = $("#aiStatus");

    status.classList.toggle(
      "connected",
      connected
    );

    status.classList.toggle(
      "error",
      !connected &&
      label !== "Checking AI connection..."
    );

    status.innerHTML = `<i></i>${label}`;

    $("#connectionLabel").textContent =
      connected
        ? "● AI connected"
        : "● " + label;

  }


  async function checkAIConnection() {

    setAIStatus(
      false,
      "Checking AI connection..."
    );

    try {

      const response = await fetch(
        "/api/health",
        {
          method: "GET"
        }
      );

      if (response.ok) {

        setAIStatus(
          true,
          "Backend is online"
        );

        return;
      }

    } catch (_) {

      // Health endpoint may not exist.
      // AI chat requests can still be attempted.

    }

    setAIStatus(
      false,
      "Ready to test backend"
    );

  }


  // ==========================================
  // 13. AI LEARNING INSIGHTS
  // ==========================================

  async function analyseProgress() {

    const summary = `
      Please give a short, encouraging learning progress
      summary for a preschool learner named ${state.name}.

      They have completed ${state.tasks} activities,
      earned ${state.stars} stars,
      collected ${state.stickers.length} unique stickers
      and have ${state.coins} coins.

      Mention that these numbers alone do not prove mastery.

      Suggest three simple activities for a parent or teacher.
    `;

    $("#insightResult").textContent =
      "🤖 Preparing your learning summary...";

    await askAI(summary, "insights");

    const lastAI =
      $$("#chatMessages .ai-bubble").at(-1);

    $("#insightResult").textContent =
      lastAI
        ? lastAI.textContent
        : "No summary is available yet.";

  }


  // ==========================================
  // 14. CHARACTER SHOP
  // ==========================================

  const characters = [

    {
      emoji: "🐻",
      name: "Cuddly Bear",
      cost: 0
    },

    {
      emoji: "🦊",
      name: "Clever Fox",
      cost: 3
    },

    {
      emoji: "🐯",
      name: "Happy Tiger",
      cost: 5
    },

    {
      emoji: "🐸",
      name: "Jumpy Frog",
      cost: 5
    },

    {
      emoji: "🐼",
      name: "Panda Pal",
      cost: 7
    },

    {
      emoji: "🐰",
      name: "Bunny Buddy",
      cost: 7
    }

  ];


  function renderRewards() {

    $("#stickerGrid").innerHTML = "";

    const allStickers = [
      "🌟",
      "🦄",
      "🌈",
      "🍭",
      "🐸",
      "🦋",
      "🍎",
      "🚀"
    ];

    allStickers.forEach((emoji, index) => {

      const owned =
        state.stickers.includes(emoji);

      const card =
        document.createElement("div");

      card.className = "sticker-item";

      card.innerHTML = `
        <span>${owned ? emoji : "🔒"}</span>

        <strong>
          ${owned ? "Collected!" : "Mystery sticker"}
        </strong>

        <small>
          ${
            owned
              ? "In your album"
              : "Complete activities to unlock"
          }
        </small>
      `;

      $("#stickerGrid").appendChild(card);

    });


    $("#characterShop").innerHTML = "";

    characters.forEach(character => {

      const owned =
        state.ownedCharacters.includes(
          character.emoji
        );

      const card =
        document.createElement("div");

      card.className = "character-item";

      const action = owned

        ? `
          <button data-use-character="${character.emoji}">
            ${
              state.activeCharacter === character.emoji
                ? "Selected"
                : "Use character"
            }
          </button>
        `

        : `
          <button
            data-buy-character="${character.emoji}"
            data-cost="${character.cost}"
          >
            Buy · ${character.cost} stickers
          </button>
        `;

      card.innerHTML = `
        <span>${character.emoji}</span>

        <strong>${character.name}</strong>

        <small>
          ${owned ? "Owned" : "Unlock a new friend"}
        </small>

        ${action}
      `;

      $("#characterShop").appendChild(card);

    });

    renderStats();

  }


  // ==========================================
  // 15. STUDENT PROFILE
  // ==========================================

  function renderProfile() {

    $("#studentNameInput").value =
      state.name;

    $("#avatarSelect").value =
      state.avatar;

    $("#profileBigAvatar").textContent =
      state.activeCharacter || state.avatar;

  }


  function saveProfile() {

    const name =
      $("#studentNameInput").value.trim();

    if (!name) {

      $("#profileFeedback").textContent =
        "Please enter a name first.";

      return;
    }

    state.name = name;

    state.avatar =
      $("#avatarSelect").value;

    if (
      !state.activeCharacter ||
      state.activeCharacter === "🐻"
    ) {

      state.activeCharacter =
        state.avatar;

    }

    saveState();

    $("#profileFeedback").textContent =
      "Profile saved!";

    toast(
      "Your explorer profile has been updated!"
    );

  }


  // ==========================================
  // 16. GAME MODULE SELECTION
  // ==========================================

  function openModule(module) {

    showPage("game");

    const names = {

      alphabet: "Alphabet Adventure",

      numbers: "Numbers & Counting",

      compare: "Comparing",

      shapes: "Shapes",

      sorting: "Sorting & Classifying"

    };

    toast(
      `${names[module] || "Learning activity"} selected! Choose an item in Happy Mart to begin the demo.`
    );

    if (module === "alphabet") {
      openProduct("apple");
    }

    if (module === "numbers") {
      openProduct("milk");
    }

    if (module === "compare") {
      openProduct("banana");
    }

    if (module === "shapes") {
      openProduct("egg");
    }

    if (module === "sorting") {
      openProduct("bread");
    }

  }


  // ==========================================
  // 17. EVENT LISTENERS
  // ==========================================

  function initEvents() {

    // Navigation

    $$("[data-page]").forEach(button => {

      button.addEventListener("click", () => {

        showPage(
          button.dataset.page
        );

      });

    });


    $$("[data-page-link]").forEach(link => {

      link.addEventListener("click", event => {

        event.preventDefault();

        showPage(
          link.dataset.pageLink
        );

      });

    });


    $$("[data-go]").forEach(button => {

      button.addEventListener("click", () => {

        showPage(
          button.dataset.go
        );

      });

    });


    // Game modules

    $$("[data-open-module]").forEach(button => {

      button.addEventListener("click", () => {

        openModule(
          button.dataset.openModule
        );

      });

    });


    // AI tools

    $$("[data-ai-mode]").forEach(button => {

      button.addEventListener("click", () => {

        const mode =
          button.dataset.aiMode;

        const titles = {

          chat: "AI Learning Buddy",

          pronunciation: "Smart Pronunciation",

          adaptive: "Adaptive Learning",

          insights: "Learning Insights"

        };

        $("#aiModeTitle").textContent =
          titles[mode] || titles.chat;

        if (mode === "pronunciation") {

          $("#aiInput").placeholder =
            "Type a word to practise saying...";

        } else {

          $("#aiInput").placeholder =
            "Ask your AI learning buddy...";

        }

        if (mode === "adaptive") {

          askAI(
            "Please create one simple learning activity suitable for a preschool beginner. Give one question at a time.",
            "adaptive"
          );

        }

        if (mode === "insights") {

          analyseProgress();

        }

        $("#aiInput").focus();

      });

    });


    // Quick AI prompts

    $$("[data-prompt]").forEach(button => {

      button.addEventListener("click", () => {

        askAI(
          button.dataset.prompt
        );

      });

    });


    // Product selection

    $$("[data-product]").forEach(button => {

      button.addEventListener("click", () => {

        openProduct(
          button.dataset.product
        );

      });

    });


    // Close learning panel

    $("#closeLearningPanel").addEventListener(
      "click",
      () => {

        $("#learningPanel").classList.add("hidden");

      }
    );


    // Speech button

    $("#speakWord").addEventListener(
      "click",
      () => {

        speak(
          $("#learningWord").textContent
        );

      }
    );


    // Complete learning activity

    $("#completeWord").addEventListener(
      "click",
      () => {

        const key =
          $("#learningPanel").dataset.product;

        if (!key) return;

        completeActivity(
          `Word: ${products[key].name}`
        );

        $("#learningPanel").classList.add("hidden");

      }
    );


    // AI chat form

    $("#aiChatForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const input =
          $("#aiInput");

        const message =
          input.value.trim();

        if (message) {

          input.value = "";

          askAI(message);

        }

      }
    );


    // AI progress analysis

    $("#analyseProgress").addEventListener(
      "click",
      analyseProgress
    );


    // BIM learning cards

    $$("[data-sign]").forEach(button => {

      button.addEventListener("click", () => {

        toast(
          `BIM learning card: ${button.dataset.sign}. Please learn the correct sign with a qualified BIM instructor.`
        );

      });

    });


    // Mobile navigation

    $("#mobileMenu").addEventListener(
      "click",
      () => {

        $("#sidebar").classList.toggle("open");

      }
    );


    // Profile

    $("#saveProfile").addEventListener(
      "click",
      saveProfile
    );


    // Save backend API endpoint

    $("#saveApiPath").addEventListener(
      "click",
      () => {

        const path =
          $("#apiPathInput").value.trim();

        if (
          !path.startsWith("/") &&
          !/^https?:\/\//i.test(path)
        ) {

          $("#settingsFeedback").textContent =
            "Enter a path beginning with / or a full http(s) URL.";

          return;

        }

        state.apiPath = path;

        saveState();

        $("#settingsFeedback").textContent =
          "Backend endpoint saved.";

        toast(
          "AI endpoint updated."
        );

      }
    );


    // Reset progress

    $("#resetProgress").addEventListener(
      "click",
      () => {

        if (
          !window.confirm(
            "Reset this browser's Tiny Thinkers demo progress?"
          )
        ) {

          return;

        }

        state = { ...defaultState };

        saveState();

        renderProfile();

        renderRewards();

        toast(
          "Demo progress has been reset."
        );

      }
    );


    // Character shop interactions

    $("#characterShop").addEventListener(
      "click",
      event => {

        const buy =
          event.target.closest(
            "[data-buy-character]"
          );

        const use =
          event.target.closest(
            "[data-use-character]"
          );


        // Purchase character

        if (buy) {

          const emoji =
            buy.dataset.buyCharacter;

          const cost =
            Number(buy.dataset.cost);

          if (state.stickers.length < cost) {

            toast(
              `You need ${cost} stickers to unlock this character.`
            );

            return;

          }

          state.stickers.splice(0, cost);

          state.ownedCharacters.push(emoji);

          state.activeCharacter = emoji;

          saveState();

          renderRewards();

          toast(
            "New character unlocked! 🎉"
          );

        }


        // Select owned character

        if (use) {

          state.activeCharacter =
            use.dataset.useCharacter;

          saveState();

          renderRewards();

          toast(
            "Character selected!"
          );

        }

      }
    );

  }


  // ==========================================
  // 18. INITIALISE APPLICATION
  // ==========================================

  function init() {

    initEvents();

    renderStats();

    renderRewards();

    renderProfile();

    $("#apiPathInput").value =
      state.apiPath;

    setAIStatus(
      false,
      "Ready to test backend"
    );

  }


  // Start application

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();