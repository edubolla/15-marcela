/* ===== Configuração do convite — edite aqui ===== */
const CONFIG = {
  // Número do WhatsApp com DDI + DDD, só dígitos (ex.: "5511999998888").
  // Vazio: o WhatsApp abre com a mensagem pronta e a pessoa escolhe o contato.
  whatsapp: "5511985283358",
  rsvpMessage: "Olá! Passando para confirmar minha presença na festa!",
  rsvpDeadline: "Confirme até 20 de outubro",
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
const player = $("#player");
const playerBtn = $("#playerToggle");

function setPlaying(on) {
  vinyl.classList.toggle("is-playing", on);
  vinyl.setAttribute("aria-pressed", String(on));
  player.classList.toggle("is-playing", on);
  playerBtn.setAttribute("aria-label", on ? "Pausar a música" : "Tocar a música");
}

function toggleMusic() {
  if (audio.paused) playMusic();
  else audio.pause();
}

function playMusic() {
  const p = audio.play();
  if (p) p.then(() => setPlaying(true)).catch(() => setPlaying(false));
}

audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("play", () => setPlaying(true));

vinyl.addEventListener("click", toggleMusic);
playerBtn.addEventListener("click", toggleMusic);

// controle do rodapé: aparece 7s depois que a música começa a tocar
const PLAYER_DELAY = 7000;
let playerTimer = null;

audio.addEventListener("playing", () => {
  if (playerTimer) return;
  playerTimer = setTimeout(() => {
    player.hidden = false;
    requestAnimationFrame(() => player.classList.add("is-visible"));
  }, PLAYER_DELAY);
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
