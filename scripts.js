document.addEventListener("DOMContentLoaded", function () {
  
  updateYear();
  setupModal();
  setupSuggestionForm();

});

// automatically update the year in the footer
function updateYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function setupModal() {
  const modal = document.getElementById("place-modal");
  if (!modal) return;

  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalClose = document.getElementById("modal-close");
  const modalPrev = document.getElementById("modal-prev");
  const modalNext = document.getElementById("modal-next");
  const modalCounter = document.getElementById("modal-counter");

  let images = [];
  let captions = [];
  let index = 0;
  let lastFocusedCard = null;

  function openModal(card) {
    lastFocusedCard = card;

    const title = card.querySelector("h3").textContent;
    const defaultCaption = card.querySelector("p").textContent;

    images = card.dataset.images.split(",").map(s => s.trim());
    captions = card.dataset.imageCaptions.split(",").map(s => s.trim());

    modalTitle.textContent = title;

    showImage(0, defaultCaption);

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedCard) lastFocusedCard.focus();
  }

  function showImage(i, fallbackText) {
    index = (i + images.length) % images.length;
    modalImg.src = images[index];

    modalCounter.textContent = `${index + 1} / ${images.length}`;

    const caption = captions[index] || fallbackText;
    modalDesc.textContent = caption;
  }

  modalPrev.addEventListener("click", () => showImage(index - 1));
  modalNext.addEventListener("click", () => showImage(index + 1));
  modalClose.addEventListener("click", closeModal);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", e => {
    if (modal.getAttribute("aria-hidden") === "false") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showImage(index - 1);
      if (e.key === "ArrowRight") showImage(index + 1);
    }
  });

  const cards = document.querySelectorAll(".place-card");
  cards.forEach(card => {
    card.addEventListener("click", () => openModal(card));

    card.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        openModal(card);
      }
    });
  });
}

function setupSuggestionForm() {
  const form = document.getElementById("suggest-form");
  const listBox = document.getElementById("submissions");
  const msg = document.getElementById("form-message");

  if (!form || !listBox) return;

  const STORAGE_KEY = "suggestions";

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderList(list) {
    listBox.innerHTML = "";
    if (list.length === 0) {
      listBox.innerHTML = `<p class="no-submissions">No suggestions yet.</p>`;
      return;
    }

    list.forEach(item => {
      const div = document.createElement("div");
      div.className = "submission";
      div.innerHTML = `
        <div class="submission-header"><strong>${item.name}</strong> — ${item.destination}</div>
        <div class="submission-meta">${item.timeframe} • ${new Date(item.created).toLocaleString()}</div>
        <div class="submission-notes">${item.notes || ""}</div>
      `;
      listBox.appendChild(div);
    });
  }

  let suggestions = load();
  renderList(suggestions.slice().reverse());

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const destination = formData.get("destination").trim();
    const timeframe = formData.get("timeframe");
    const notes = formData.get("notes").trim();

    if (!name || !email || !destination) {
      msg.textContent = "Please fill out required fields.";
      return;
    }

    const newItem = {
      name,
      email,
      destination,
      timeframe,
      notes,
      created: Date.now()
    };

    suggestions.push(newItem);
    save(suggestions);

    msg.textContent = "Thanks! Your suggestion was added.";
    form.reset();

    renderList(suggestions.slice().reverse());
  });
}
