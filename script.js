/* === STATO INIZIALE DELL'APPLICAZIONE (ARRAY MEDICINE) === */
// Ogni medicina ha un orario, nome, dettagli, icona e uno stato:
// 'pending' (non ancora presa), 'taken' (presa), 'skipped' (saltata)
const medicines = [
  {
    id: 1,
    time: "12:45",
    name: "Vitamina C + Zinco",
    spec: "Dose: 500mg • Formato: Compressa idrosolubile",
    instruction: "Da assumere dopo il pranzo con un bicchiere d'acqua. Evitare a stomaco vuoto.",
    icon: "pill",
    interval: "3 ore dal pasto",
    stock: "24 dosi rimanenti",
    status: "pending"
  },
  {
    id: 2,
    time: "14:30",
    name: "Collagene & Biotina",
    spec: "Dose: 2500mg • Formato: Bustina orosolubile",
    instruction: "Sciogliere la bustina in mezzo bicchiere di liquido subito dopo il pasto.",
    icon: "medication",
    interval: "2 ore dal pasto",
    stock: "12 bustine rimanenti",
    status: "pending"
  },
  {
    id: 3,
    time: "20:00",
    name: "Omega 3 Skincare",
    spec: "Dose: 1000mg EPA/DHA • Formato: Perla softgel",
    instruction: "Assumere a inizio cena con acqua fresca per un migliore assorbimento lipidico.",
    icon: "healing",
    interval: "Durante la cena",
    stock: "30 perle rimanenti",
    status: "pending"
  },
  {
    id: 4,
    time: "22:15",
    name: "Magnesio Notte",
    spec: "Dose: 300mg • Formato: Polvere solubile calda",
    instruction: "Assumere 30 minuti prima di coricarsi in acqua tiepida per favorire il riposo.",
    icon: "bedtime",
    interval: "4 ore dal pasto",
    stock: "18 dosi rimanenti",
    status: "pending"
  }
];

// Indice della medicina attualmente selezionata
let selectedIndex = 0;

// Set per memorizzare le notifiche già inviate per evitare duplicati nello stesso minuto
const sentNotifications = new Set();

/* === ELEMENTI DOM PRINCIPALI === */
const timelineStrip = document.querySelector("#timeline-scroll-strip");
const timelineCountBadge = document.querySelector("#timeline-count-badge");
const detailTargetBadge = document.querySelector("#detail-target-badge");
const detailMedName = document.querySelector("#detail-med-name");
const detailMedSpec = document.querySelector("#detail-med-spec");
const detailMedIcon = document.querySelector("#detail-med-icon");
const detailMedInstruction = document.querySelector("#detail-med-instruction");
const detailMedInterval = document.querySelector("#detail-med-interval");
const detailMedStock = document.querySelector("#detail-med-stock");

const btnTakeNow = document.querySelector("#btn-take-now");
const takeBtnText = document.querySelector("#take-btn-text");
const takeBtnIcon = document.querySelector("#take-btn-icon");
const btnSkipDose = document.querySelector("#btn-skip-dose");
const skipBtnText = document.querySelector("#skip-btn-text");

const progressFractionBadge = document.querySelector("#progress-fraction-badge");
const progressMessage = document.querySelector("#progress-message");
const segmentedProgressBar = document.querySelector("#segmented-progress-bar");
const syncTimestamp = document.querySelector("#sync-timestamp");

// Elementi di Notifica
const phoneNotification = document.querySelector("#phone-notification");
const notifBody = document.querySelector("#notif-body");
const notifTime = document.querySelector("#notif-time");
const btnTriggerNotification = document.querySelector("#btn-trigger-notification");

// Modali
const addModal = document.querySelector("#add-modal");
const addForm = document.querySelector("#add-form");
const btnCancelAdd = document.querySelector("#btn-cancel-add");

const editModal = document.querySelector("#edit-modal");
const editForm = document.querySelector("#edit-form");
const btnOpenEditModal = document.querySelector("#btn-open-edit-modal");
const btnCancelEdit = document.querySelector("#btn-cancel-edit");

/* ==========================================================================
   FUNZIONI AUSILIARIE PER ANIMAZIONI E FEEDBACK VISIVO (INTERATTIVITÀ)
   ========================================================================== */

// Crea l'effetto onda (ripple) nel punto esatto del click
function createRipple(event, element) {
  const rect = element.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  const clickX = (event.clientX && event.clientX > 0) ? (event.clientX - rect.left) : (rect.width / 2);
  const clickY = (event.clientY && event.clientY > 0) ? (event.clientY - rect.top) : (rect.height / 2);

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${clickX - radius}px`;
  circle.style.top = `${clickY - radius}px`;
  circle.classList.add("ripple-circle");

  const existingRipple = element.querySelector(".ripple-circle");
  if (existingRipple) {
    existingRipple.remove();
  }

  element.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

// Innesca il rimbalzo elastico (micro-bounce) su qualunque pulsante
function triggerButtonBounce(element) {
  element.classList.remove("btn-bouncing");
  void element.offsetWidth; // forza il reflow
  element.classList.add("btn-bouncing");
  setTimeout(() => element.classList.remove("btn-bouncing"), 400);
}

// Innesca il fascio di luce Shimmer sopra la scheda dettaglio
function triggerCardShimmer() {
  const shimmer = document.querySelector("#card-shimmer");
  if (!shimmer) return;
  shimmer.classList.remove("trigger-shimmer");
  void shimmer.offsetWidth; // forza il reflow per riavviare l'animazione
  shimmer.classList.add("trigger-shimmer");
}

// Suono delicato di notifica smartphone tramite Web Audio API nativo
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Suono a due toni caldo e delicato tipico degli smartphone (Re5 -> La5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.55);
  } catch (error) {
    // Gestione silenziosa se l'audio è bloccato dal browser
  }
}

/* ==========================================================================
   SISTEMA DI NOTIFICA ORARIA AUTOMATICA
   ========================================================================== */

// Mostra il banner della notifica sul telefono
function showPhoneNotification(medName, medTime) {
  playNotificationSound();
  notifTime.textContent = medTime;
  notifBody.textContent = "È ora di prendere: " + medName;
  phoneNotification.classList.add("show");

  // Chiudi la notifica automaticamente dopo 5 secondi
  setTimeout(function() {
    phoneNotification.classList.remove("show");
  }, 5000);

  // Supporto opzionale per la notifica nativa del sistema operativo/telefono
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("VITAPP Promemoria", {
      body: medTime + " - È ora di assumere: " + medName,
      icon: ""
    });
  }
}

// Controlla ogni secondo l'orario reale del dispositivo
// Le notifiche partono SOLO ed ESCLUSIVAMENTE quando l'orario corrisponde a quello prefissato
function checkScheduledNotifications() {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  medicines.forEach(function(med, index) {
    // Chiave univoca per non ripetere la notifica nello stesso minuto
    const notificationKey = `${med.id}-${currentTime}`;

    // La notifica scatta SOLO se l'orario è esattamente uguale e la medicina non è ancora stata presa
    if (med.time === currentTime && med.status === "pending" && !sentNotifications.has(notificationKey)) {
      sentNotifications.add(notificationKey);
      showPhoneNotification(med.name, med.time);

      // Seleziona automaticamente la medicina che sta suonando
      selectDose(index);
    }
  });
}

// Avvia il monitoraggio dell'orario ogni 1000 millisecondi (1 secondo)
setInterval(checkScheduledNotifications, 1000);

/* === FUNZIONE: AGGIORNA LA SCHEDA DETTAGLIO DELLA MEDICINA SELEZIONATA === */
function renderDetailCard() {
  const currentMed = medicines[selectedIndex];
  if (!currentMed) return;

  detailMedName.textContent = currentMed.name;
  detailMedSpec.textContent = currentMed.spec || "Dose standard personalizzata";
  detailMedInstruction.textContent = currentMed.instruction || "Assumere secondo prescrizione.";
  detailMedIcon.textContent = currentMed.icon || "pill";
  detailTargetBadge.textContent = "ORARIO TARGET: " + currentMed.time;
  detailMedInterval.textContent = currentMed.interval || "Non specificato";
  detailMedStock.textContent = currentMed.stock || "In corso";

  // Aggiorna lo stato visivo del pulsante "PRENDI ORA"
  if (currentMed.status === "taken") {
    takeBtnText.textContent = "GIÀ PRESA (CLICCA PER ANNULLARE)";
    if (takeBtnIcon) takeBtnIcon.textContent = "done_all";
    btnTakeNow.classList.add("already-taken");
  } else {
    takeBtnText.textContent = "PRENDI ORA";
    if (takeBtnIcon) takeBtnIcon.textContent = "check_circle";
    btnTakeNow.classList.remove("already-taken");
  }
}

/* === FUNZIONE: AGGIORNA LA BARRA DI AVANZAMENTO E I MESSAGGI === */
function renderProgress() {
  const total = medicines.length;
  // Conta quante medicine sono state effettivamente prese
  let takenCount = 0;
  for (let i = 0; i < medicines.length; i++) {
    if (medicines[i].status === "taken") {
      takenCount++;
    }
  }

  // Aggiorna badge frazione (es. "2 / 4 COMPLETATO")
  progressFractionBadge.textContent = takenCount + " / " + total + " COMPLETATO";

  // Verifica se la giornata è completata (tutte le medicine prese)
  if (takenCount === total && total > 0) {
    progressMessage.textContent = "OBIETTIVI RAGGIUNTI!";
    progressMessage.classList.add("goals-completed");
  } else {
    progressMessage.classList.remove("goals-completed");
    const remaining = total - takenCount;
    if (remaining === 1) {
      progressMessage.textContent = "Ti manca solo 1 medicina per completare il piano di oggi!";
    } else {
      progressMessage.textContent = "Ti mancano " + remaining + " medicine da assumere oggi!";
    }
  }

  // Ricrea i segmenti della barra di avanzamento con animazione fluida
  segmentedProgressBar.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const segment = document.createElement("div");
    segment.className = "progress-segment";

    const fill = document.createElement("div");
    fill.className = "progress-segment-fill";

    // Se la medicina i-esima è stata presa, riempi il segmento al 100%
    if (medicines[i].status === "taken") {
      segment.classList.add("is-filled");
      setTimeout(() => {
        fill.style.width = "100%";
      }, 50);
    } else {
      fill.style.width = "0%";
    }

    segment.appendChild(fill);
    segmentedProgressBar.appendChild(segment);
  }
}

/* === FUNZIONE: SELEZIONE FLUIDA DI UNA MEDICINA CON TRANSIZIONE === */
// NOTA: il semplice click di selezione NON fa scattare la notifica (arriva solo all'orario prefissato)
function selectDose(index) {
  if (index === selectedIndex) {
    triggerCardShimmer();
    return;
  }
  selectedIndex = index;

  const cardBody = document.querySelector("#detail-card-body");
  if (cardBody) {
    // Sfumatura di uscita
    cardBody.classList.add("content-hidden");

    setTimeout(() => {
      renderApp();
      // Sfumatura di entrata e fascio di luce
      cardBody.classList.remove("content-hidden");
      triggerCardShimmer();
    }, 150);
  } else {
    renderApp();
    triggerCardShimmer();
  }
}

/* === FUNZIONE: RENDERIZZA LA TIMELINE DELLE MEDICINE CON I ROMBI === */
function renderTimeline() {
  timelineStrip.innerHTML = "";
  timelineCountBadge.textContent = medicines.length + " PIANIFICATE";

  // Crea ogni singolo slot medicina
  medicines.forEach(function(med, index) {
    const slotBtn = document.createElement("button");
    slotBtn.type = "button";
    slotBtn.className = "medicine-slot-btn btn-ripple";
    
    // Assegna classi di stato
    if (index === selectedIndex) {
      slotBtn.classList.add("is-active");
    }
    if (med.status === "taken") {
      slotBtn.classList.add("is-taken");
    } else if (med.status === "skipped") {
      slotBtn.classList.add("is-skipped");
    }

    // Determina testo di stato
    let statusText = "In programma";
    if (med.status === "taken") statusText = "Presa ✓";
    if (med.status === "skipped") statusText = "Saltata";
    if (index === selectedIndex && med.status === "pending") statusText = "Attiva";

    slotBtn.innerHTML = `
      <div class="rhombus-wrapper">
        <div class="rhombus-shape"></div>
        <span class="material-symbols-rounded rhombus-icon">${med.icon || 'pill'}</span>
      </div>
      <span class="slot-time-badge">${med.time}</span>
      <span class="slot-medicine-name">${med.name}</span>
      <span class="slot-status-label">${statusText}</span>
    `;

    // Interazione 1: Cliccando la medicina viene selezionata con ripple e bounce
    slotBtn.addEventListener("click", function(event) {
      createRipple(event, slotBtn);
      triggerButtonBounce(slotBtn);
      selectDose(index);
    });

    timelineStrip.appendChild(slotBtn);
  });

  // Interazione 7: Aggiungi pulsante "+" in fondo se ci sono meno di 6 medicine
  if (medicines.length < 6) {
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "add-slot-btn btn-ripple";
    addBtn.setAttribute("aria-label", "Aggiungi medicina");
    addBtn.innerHTML = `
      <div class="rhombus-wrapper">
        <div class="rhombus-shape"></div>
        <span class="material-symbols-rounded rhombus-icon">add</span>
      </div>
      <span class="slot-time-badge">+ AGGIUNGI</span>
      <span class="slot-medicine-name">Nuova</span>
      <span class="slot-status-label">Max 6</span>
    `;

    addBtn.addEventListener("click", function(event) {
      createRipple(event, addBtn);
      triggerButtonBounce(addBtn);
      addModal.classList.add("is-open");
    });

    timelineStrip.appendChild(addBtn);
  }
}

/* === FUNZIONE GENERALE DI AGGIORNAMENTO DELL'APP === */
function renderApp() {
  renderTimeline();
  renderDetailCard();
  renderProgress();
}

/* === GESTIONE EVENTI: PULSANTI "PRENDI ORA" & "SALTA QUESTA DOSE" === */
// Interazione 2 & 3: Prendere la medicina riempie la barra; tornando indietro si può modificare
btnTakeNow.addEventListener("click", function(event) {
  createRipple(event, btnTakeNow);
  triggerButtonBounce(btnTakeNow);

  const currentMed = medicines[selectedIndex];
  if (!currentMed) return;

  // Se era già presa, consente di annullare (tornando indietro e modificando)
  if (currentMed.status === "taken") {
    currentMed.status = "pending";
    renderApp();
    triggerCardShimmer();
  } else {
    currentMed.status = "taken";

    // Registra timestamp
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    syncTimestamp.textContent = "Oggi, " + hrs + ":" + mins;

    // Feedback visivo immediato di successo
    if (takeBtnIcon) takeBtnIcon.textContent = "done_all";
    takeBtnText.textContent = "REGISTRATO CON SUCCESSO!";
    triggerCardShimmer();

    setTimeout(() => {
      renderApp();
    }, 800);
    return;
  }
});

// Se clicco salta, la medicina viene marcata come saltata e la barra non si riempie
btnSkipDose.addEventListener("click", function(event) {
  createRipple(event, btnSkipDose);
  triggerButtonBounce(btnSkipDose);

  const currentMed = medicines[selectedIndex];
  if (!currentMed) return;

  const originalText = skipBtnText ? skipBtnText.textContent : "SALTA QUESTA DOSE";
  if (skipBtnText) skipBtnText.textContent = "DOSE RIMANDATA";

  currentMed.status = "skipped";
  renderProgress();
  renderTimeline();

  setTimeout(() => {
    if (skipBtnText) skipBtnText.textContent = originalText;
    // Passa comodamente alla prossima medicina con transizione fluida
    if (selectedIndex < medicines.length - 1) {
      selectDose(selectedIndex + 1);
    } else {
      selectDose(0);
    }
  }, 450);
});

/* === GESTIONE EVENTI: PULSANTE CAMPANELLA NOTIFICA DALL'HEADER === */
btnTriggerNotification.addEventListener("click", function(event) {
  createRipple(event, btnTriggerNotification);
  triggerButtonBounce(btnTriggerNotification);

  // Chiedi i permessi browser se l'utente desidera notifiche reali di sistema
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Mostra un avviso informativo che spiega l'orario della prossima medicina
  const currentMed = medicines[selectedIndex];
  notifTime.textContent = currentMed.time;
  notifBody.textContent = "Notifica attiva alle " + currentMed.time + " per " + currentMed.name;
  phoneNotification.classList.add("show");

  setTimeout(() => {
    phoneNotification.classList.remove("show");
  }, 3500);
});

// Chiudi la notifica toccandola
phoneNotification.addEventListener("click", function() {
  phoneNotification.classList.remove("show");
});

/* === GESTIONE EVENTI: AGGIUNTA NUOVA MEDICINA (FINO A 6) === */
btnCancelAdd.addEventListener("click", function(event) {
  triggerButtonBounce(btnCancelAdd);
  addModal.classList.remove("is-open");
});

addForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (medicines.length >= 6) {
    alert("Puoi inserire un massimo di 6 medicine.");
    addModal.classList.remove("is-open");
    return;
  }

  const newName = document.querySelector("#add-name").value.trim();
  const newTime = document.querySelector("#add-time").value;
  const newSpec = document.querySelector("#add-spec").value.trim() || "Dose standard";
  const newInstruction = document.querySelector("#add-instruction").value.trim() || "Assumere con regolarità.";

  // Aggiungi nuova medicina all'array
  medicines.push({
    id: Date.now(),
    time: newTime,
    name: newName,
    spec: newSpec,
    instruction: newInstruction,
    icon: "medication",
    interval: "Come da indicazioni",
    stock: "Nuova scorta",
    status: "pending"
  });

  // Seleziona la medicina appena aggiunta
  selectedIndex = medicines.length - 1;

  addForm.reset();
  addModal.classList.remove("is-open");
  renderApp();
  triggerCardShimmer();
});

/* === GESTIONE EVENTI: MODIFICA MEDICINA ESISTENTE === */
// Interazione 6: i nomi, descrizioni e orari possono essere modificati
btnOpenEditModal.addEventListener("click", function(event) {
  createRipple(event, btnOpenEditModal);
  triggerButtonBounce(btnOpenEditModal);

  const currentMed = medicines[selectedIndex];
  if (!currentMed) return;

  document.querySelector("#edit-name").value = currentMed.name;
  document.querySelector("#edit-time").value = currentMed.time;
  document.querySelector("#edit-spec").value = currentMed.spec;
  document.querySelector("#edit-instruction").value = currentMed.instruction;

  editModal.classList.add("is-open");
});

btnCancelEdit.addEventListener("click", function() {
  triggerButtonBounce(btnCancelEdit);
  editModal.classList.remove("is-open");
});

editForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const currentMed = medicines[selectedIndex];
  if (!currentMed) return;

  currentMed.name = document.querySelector("#edit-name").value.trim();
  currentMed.time = document.querySelector("#edit-time").value;
  currentMed.spec = document.querySelector("#edit-spec").value.trim();
  currentMed.instruction = document.querySelector("#edit-instruction").value.trim();

  editModal.classList.remove("is-open");
  renderApp();
  triggerCardShimmer();
});

// Chiudi modali cliccando sullo sfondo oscurato
addModal.addEventListener("click", function(e) {
  if (e.target === addModal) addModal.classList.remove("is-open");
});

editModal.addEventListener("click", function(e) {
  if (e.target === editModal) editModal.classList.remove("is-open");
});

/* === AVVIO INIZIALE ALL'APERTURA DELLA PAGINA === */
window.addEventListener("DOMContentLoaded", function() {
  renderApp();
  triggerCardShimmer();
  // Controlla subito se c'è una notifica programmata per l'orario attuale
  checkScheduledNotifications();
});
