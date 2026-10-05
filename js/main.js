/* ===== Configuração do convite — edite aqui ===== */
const CONFIG = {
  // Número do WhatsApp com DDI + DDD, só dígitos (ex.: "5511999998888").
  // Vazio: o WhatsApp abre com a mensagem pronta e a pessoa escolhe o contato.
  whatsapp: "",
  rsvpMessage:
    "Olá, confirmo a minha presença nos 15 anos da Marcela. Até lá!\n\nMeu nome completo:",
  rsvpDeadline: "Confirme até 31 de outubro",
  mapsQuery: "Buffet Castelo, R. Amazonas, 1320 - Oswaldo Cruz, São Caetano do Sul - SP",
};

const $ = (sel) => document.querySelector(sel);

/* ----- Links ----- */
const waBase = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : "https://wa.me/";
$("#rsvpLink").href = `${waBase}?text=${encodeURIComponent(CONFIG.rsvpMessage)}`;
$("#rsvpDeadline").textContent = CONFIG.rsvpDeadline;

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
$("#mapLink").href = mapsUrl;
$("#placeLink").href = mapsUrl;

/* ----- Música ----- */
const audio = $("#music");
const vinyl = $("#musicToggle");

function setPlaying(on) {
  vinyl.classList.toggle("is-playing", on);
  vinyl.setAttribute("aria-pressed", String(on));
}

function playMusic() {
  const p = audio.play();
  if (p) p.then(() => setPlaying(true)).catch(() => setPlaying(false));
}

audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("play", () => setPlaying(true));

vinyl.addEventListener("click", () => {
  if (audio.paused) playMusic();
  else audio.pause();
});

/* ----- Envelope ----- */
const envelope = $("#envelope");
const invite = $("#invite");

function openInvite() {
  if (envelope.classList.contains("is-opening")) return;
  // o toque no envelope libera o áudio no celular
  playMusic();
  envelope.classList.add("is-opening");
  setTimeout(() => {
    envelope.classList.add("is-open");
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-open");
    invite.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);
  }, 650);
}

$("#openInvite").addEventListener("click", openInvite);

/* ----- Painéis: manual e presentes ----- */
let lastTrigger = null;

function openPanel(id, push = true) {
  const panel = document.getElementById(id);
  if (!panel) return;
  lastTrigger = document.activeElement;
  panel.hidden = false;
  panel.scrollTop = 0;
  document.body.classList.add("is-locked");
  requestAnimationFrame(() => panel.classList.add("is-visible"));
  panel.querySelector(".panel__close").focus({ preventScroll: true });
  if (push) history.pushState({ panel: id }, "", `#${id}`);
}

function closePanels(pop = true) {
  document.querySelectorAll(".panel:not([hidden])").forEach((panel) => {
    panel.classList.remove("is-visible");
    setTimeout(() => (panel.hidden = true), 450);
  });
  document.body.classList.remove("is-locked");
  if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  if (pop && location.hash) history.back();
}

document.querySelectorAll("[data-panel]").forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openPanel(el.dataset.panel);
  })
);

document.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", () => closePanels())
);

// botão "voltar" do celular fecha o painel em vez de sair do site
window.addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  if (id === "manual" || id === "presentes") openPanel(id, false);
  else closePanels(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector(".panel:not([hidden])")) closePanels();
});

// link direto para #manual ou #presentes: abre o convite e o painel
if (location.hash === "#manual" || location.hash === "#presentes") {
  const id = location.hash.slice(1);
  history.replaceState(null, "", location.pathname);
  envelope.classList.add("is-open");
  document.body.classList.add("is-open");
  invite.removeAttribute("aria-hidden");
  openPanel(id);
}
