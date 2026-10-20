/* ==========================================================================
   === STATO INIZIALE DELL'APPLICAZIONE ===
   ========================================================================== */
// Array con l'elenco delle medicine della giornata
let doses = [
  {
    id: 1,
    name: "Vitamina C + Zinco",
    time: "08:30",
    spec: "Dose: 500mg • Formato: Compressa idrosolubile",
    instruction: "Da assumere con la prima colazione in un bicchiere d'acqua abbondante.",
    icon: "pill",
    status: "pending" // Valori possibili: 'pending' (in attesa), 'taken' (presa), 'skipped' (saltata)
  },
  {
    id: 2,
    name: "Collagene & Biotina",
    time: "14:30",
    spec: "Dose: 2500mg • Formato: Bustina orosolubile",
    instruction: "Sciogliere la bustina in mezzo bicchiere di latte o bevanda vegetale dopo pranzo.",
    icon: "medication",
    status: "pending"
  },
  {
    id: 3,
    name: "Omega 3 Skincare",
    time: "20:00",
    spec: "Dose: 1000mg EPA/DHA • Formato: Perla softgel",
    instruction: "Assumere a inizio cena con liquidi freschi per favorire l'assorbimento.",
    icon: "healing",
    status: "pending"
  },
  {
    id: 4,
    name: "Magnesio Notte",
    time: "22:15",
    spec: "Dose: 300mg • Formato: Polvere solubile calda",
    instruction: "Assumere 30 minuti prima di coricarsi sciolto in acqua tiepida.",
    icon: "bedtime",
    status: "pending"
  }
];

// Indice dell'elemento correntemente selezionato
let selectedDoseIndex = 0;

// Timer per la chiusura automatica del banner notifica
let notificationTimer = null;

/* ==========================================================================
   === SELETTORI DEGLI ELEMENTI DOM ===
   ========================================================================== */
const rhombusContainer = document.querySelector("#rhombusContainer");
const plannedCounterBadge = document.querySelector("#plannedCounterBadge");
const nextDoseBadge = document.querySelector("#nextDoseBadge");

const activeMedName = document.querySelector("#activeMedName");
const activeMedSpec = document.querySelector("#activeMedSpec");
const activeMedInstruction = document.querySelector("#activeMedInstruction");
const activeMedIcon = document.querySelector("#activeMedIcon");

const btnTakeNow = document.querySelector("#btnTakeNow");
const btnSkipDose = document.querySelector("#btnSkipDose");

const progressFractionBadge = document.querySelector("#progressFractionBadge");
const summaryStatusMessage = document.querySelector("#summaryStatusMessage");
const progressBarContainer = document.querySelector("#progressBarContainer");
const syncTimestamp = document.querySelector("#syncTimestamp");

// Elementi notifica stile smartphone
const phoneNotification = document.querySelector("#phoneNotification");
const notifTime = document.querySelector("#notifTime");
const notifTitle = document.querySelector("#notifTitle");
const notifDesc = document.querySelector("#notifDesc");

// Elementi finestra modale "Aggiungi"
const addModalOverlay = document.querySelector("#addModalOverlay");
const btnCloseAddModal = document.querySelector("#btnCloseAddModal");
const btnCancelAdd = document.querySelector("#btnCancelAdd");
const addMedForm = document.querySelector("#addMedForm");

// Elementi finestra modale "Modifica"
const editModalOverlay = document.querySelector("#editModalOverlay");
const btnOpenEditModal = document.querySelector("#btnOpenEditModal");
const btnCloseEditModal = document.querySelector("#btnCloseEditModal");
const btnCancelEdit = document.querySelector("#btnCancelEdit");
const editMedForm = document.querySelector("#editMedForm");

/* ==========================================================================
   === FUNZIONE: NOTIFICA TELEFONO (PROMEMORIA ORARIO SVEGLIA) ===
   ========================================================================== */
function showPhoneNotification(title, message, timeText) {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }

  notifTitle.textContent = title;
  notifDesc.textContent = message;
  notifTime.textContent = timeText || "ADESSO";

  phoneNotification.classList.add("show");

  // Vibrazione se supportata dal dispositivo
  if ("vibrate" in navigator) {
    navigator.vibrate([100, 50, 100]);
  }

  // Rimozione automatica dopo 3.5 secondi
  notificationTimer = setTimeout(function() {
    phoneNotification.classList.remove("show");
  }, 3500);
}

phoneNotification.addEventListener("click", function() {
  phoneNotification.classList.remove("show");
});

/* ==========================================================================
   === FUNZIONE: SFONDO ANIMATO CON PASTIGLIE CADENTI (TRIGGER TASTO "+") ===
   ========================================================================== */
function triggerFallingPills() {
  const container = document.querySelector("#pillsBgContainer");
  if (!container) return;

  const pillVariants = [
    { type: "capsule", styleClass: "capsule-coral" },
    { type: "capsule", styleClass: "capsule-amber" },
    { type: "capsule", styleClass: "capsule-teal" },
    { type: "capsule", styleClass: "capsule-berry" },
    { type: "capsule", styleClass: "capsule-gold" },
    { type: "round",   styleClass: "round-white" },
    { type: "round",   styleClass: "round-peach" },
    { type: "round",   styleClass: "round-cyan" },
    { type: "round",   styleClass: "round-yellow" },
    { type: "softgel", styleClass: "softgel-gold" },
    { type: "softgel", styleClass: "softgel-ruby" }
  ];

  const pillCount = 32; // Numero di pastiglie per ogni cascata scenografica

  for (let i = 0; i < pillCount; i++) {
    const pill = document.createElement("div");
    const chosen = pillVariants[Math.floor(Math.random() * pillVariants.length)];

    pill.className = `falling-pill pill-${chosen.type} ${chosen.styleClass}`;

    // Linea/punto luce 3D per effetto lucido e realistico
    const shine = document.createElement("span");
    shine.className = "pill-shine";
    pill.appendChild(shine);

    // Valori fisici e geometrici casuali
    const startX = (Math.random() * 94 + 3).toFixed(1); // 3vw - 97vw
    const driftX = (Math.random() * 120 - 60).toFixed(0); // da -60px a +60px
    const scale = (Math.random() * 0.55 + 0.75).toFixed(2); // dimensione 0.75x - 1.30x
    const duration = (Math.random() * 1.8 + 2.7).toFixed(2); // tempo caduta 2.7s - 4.5s
    const delay = (Math.random() * 1.4).toFixed(2); // ritardo scaglionato 0s - 1.4s
    const rotStart = (Math.random() * 360 - 180).toFixed(0);
    const rotEnd = (parseInt(rotStart, 10) + (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)).toFixed(0);
    const rotX = (Math.random() * 540 - 270).toFixed(0);
    const rotY = (Math.random() * 540 - 270).toFixed(0);

    pill.style.setProperty("--start-x", `${startX}vw`);
    pill.style.setProperty("--drift-x", `${driftX}px`);
    pill.style.setProperty("--pill-scale", scale);
    pill.style.setProperty("--rot-start", `${rotStart}deg`);
    pill.style.setProperty("--rot-end", `${rotEnd}deg`);
    pill.style.setProperty("--rot-x", `${rotX}deg`);
    pill.style.setProperty("--rot-y", `${rotY}deg`);
    pill.style.setProperty("--fall-duration", `${duration}s`);
    pill.style.setProperty("--fall-delay", `${delay}s`);

    // Rimozione dal DOM a fine animazione
    pill.addEventListener("animationend", function() {
      pill.remove();
    });

    // Pulizia di sicurezza
    setTimeout(function() {
      if (pill.parentNode) {
        pill.remove();
      }
    }, (parseFloat(duration) + parseFloat(delay) + 0.8) * 1000);

    container.appendChild(pill);
  }
}

/* ==========================================================================
   === FUNZIONE: RENDER DELLA TIMELINE DELLE MEDICINE (ROMBI) ===
   ========================================================================== */
function renderTimeline() {
  rhombusContainer.innerHTML = "";

  // Generazione dei rombi per ciascuna medicina registrata
  doses.forEach(function(dose, index) {
    const isSelected = (index === selectedDoseIndex);
    const isTaken = (dose.status === "taken");
    const isSkipped = (dose.status === "skipped");

    const itemBtn = document.createElement("button");
    itemBtn.type = "button";
    itemBtn.className = "rhombus-item";

    if (isSelected) {
      itemBtn.classList.add("selected");
    }
    if (isTaken) {
      itemBtn.classList.add("taken");
    }

    let statusLabel = "IN ATTESA";
    if (isTaken) {
      statusLabel = "PRESA";
    } else if (isSkipped) {
      statusLabel = "SALTATA";
    } else if (isSelected) {
      statusLabel = "IN CORSO";
    }

    itemBtn.innerHTML = `
      <div class="rhombus-box">
        <div class="rhombus-diamond"></div>
        <div class="rhombus-icon-wrapper">
          <span class="material-symbols-rounded">${dose.icon || 'pill'}</span>
        </div>
      </div>
      <span class="rhombus-time">${dose.time}</span>
      <p class="rhombus-name">${dose.name}</p>
      <span class="rhombus-status-tag">${statusLabel}</span>
    `;

    // Click sulla medicina: la seleziona e fa comparire la notifica del suo orario
    itemBtn.addEventListener("click", function() {
      selectDose(index);
      showPhoneNotification(
        "Promemoria: " + dose.name,
        "Orario programmato: " + dose.time + ". Tocca 'Prendi Ora' per registrare.",
        dose.time
      );
    });

    rhombusContainer.appendChild(itemBtn);
  });

  // Se ci sono meno di 6 medicine, mostra il pulsante a rombo "+" in fondo a destra
  if (doses.length < 6) {
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "rhombus-item add-new-btn";
    addBtn.innerHTML = `
      <div class="rhombus-box">
        <div class="rhombus-diamond"></div>
        <div class="rhombus-icon-wrapper">
          <span class="material-symbols-rounded">add</span>
        </div>
      </div>
      <span class="rhombus-time">NUOVA</span>
      <p class="rhombus-name">Aggiungi</p>
      <span class="rhombus-status-tag">+ MEDICINA</span>
    `;
    addBtn.addEventListener("click", openAddModal);
    rhombusContainer.appendChild(addBtn);
  }

  plannedCounterBadge.textContent = doses.length + " PIANIFICATE";
}

/* ==========================================================================
   === FUNZIONE: SELEZIONE E AGGIORNAMENTO SCHEDA DETTAGLIO ===
   ========================================================================== */
function selectDose(index) {
  if (index < 0 || index >= doses.length) return;
  selectedDoseIndex = index;
  const currentDose = doses[selectedDoseIndex];

  activeMedName.textContent = currentDose.name;
  activeMedSpec.textContent = currentDose.spec || "Dose personalizzata per oggi";
  activeMedInstruction.textContent = currentDose.instruction || "Assumere secondo le indicazioni mediche.";
  activeMedIcon.textContent = currentDose.icon || "pill";

  updateNextDoseBadge();
  renderTimeline();
}

function updateNextDoseBadge() {
  const allCompleted = doses.length > 0 && doses.every(function(d) {
    return d.status === "taken";
  });

  if (allCompleted) {
    nextDoseBadge.textContent = "OBIETTIVO RAGGIUNTO!";
    nextDoseBadge.style.background = "linear-gradient(135deg, var(--color-primary-container), var(--color-primary))";
    nextDoseBadge.style.color = "#ffffff";
    return;
  }

  nextDoseBadge.style.background = "";
  nextDoseBadge.style.color = "";

  const nextPending = doses.find(function(d) {
    return d.status !== "taken";
  });

  if (nextPending) {
    nextDoseBadge.textContent = "PROSSIMA DOSE: " + nextPending.time;
  } else {
    nextDoseBadge.textContent = "DOSI COMPLETATE";
  }
}

nextDoseBadge.addEventListener("click", function() {
  const currentDose = doses[selectedDoseIndex];
  showPhoneNotification(
    "Promemoria: " + currentDose.name,
    "Orario di assunzione: " + currentDose.time,
    currentDose.time
  );
});

/* ==========================================================================
   === FUNZIONE: AZIONI "PRENDI ORA" E "SALTA QUESTA DOSE" ===
   ========================================================================== */
function handleTakeDose() {
  if (doses.length === 0) return;

  const currentDose = doses[selectedDoseIndex];
  // Registra lo stato come 'taken': la barra si riempirà
  currentDose.status = "taken";

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  syncTimestamp.textContent = "Oggi, " + hours + ":" + minutes;

  updateProgress();
  updateNextDoseBadge();

  showPhoneNotification(
    "Dose Registrata!",
    currentDose.name + " è stata segnata come assunta.",
    hours + ":" + minutes
  );

  // Avanzamento automatico alla medicina successiva non ancora assunta
  const nextPendingIndex = doses.findIndex(function(d, idx) {
    return idx > selectedDoseIndex && d.status !== "taken";
  });

  if (nextPendingIndex !== -1) {
    selectedDoseIndex = nextPendingIndex;
  }

  selectDose(selectedDoseIndex);
}

function handleSkipDose() {
  if (doses.length === 0) return;

  const currentDose = doses[selectedDoseIndex];
  // Registra lo stato come 'skipped': la barra di avanzamento non si riempie
  currentDose.status = "skipped";

  updateProgress();
  updateNextDoseBadge();

  showPhoneNotification(
    "Dose Rimandata",
    currentDose.name + " è stata saltata per oggi.",
    currentDose.time
  );

  if (selectedDoseIndex < doses.length - 1) {
    selectDose(selectedDoseIndex + 1);
  } else {
    renderTimeline();
  }
}

btnTakeNow.addEventListener("click", handleTakeDose);
btnSkipDose.addEventListener("click", handleSkipDose);

/* ==========================================================================
   === FUNZIONE: CALCOLO PROGRESSO E BARRA DINAMICA ===
   ========================================================================== */
function updateProgress() {
  const totalCount = doses.length;
  // Conta quante medicine hanno lo stato 'taken'
  const takenCount = doses.filter(function(d) {
    return d.status === "taken";
  }).length;

  progressFractionBadge.textContent = takenCount + " / " + totalCount + " COMPLETATO";

  // Rigenera i segmenti della barra
  progressBarContainer.innerHTML = "";
  for (let i = 0; i < totalCount; i++) {
    const segment = document.createElement("div");
    segment.className = "progress-segment";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    segment.appendChild(fill);

    // Se la medicina è stata presa, il segmento si colora
    if (doses[i].status === "taken") {
      segment.classList.add("filled");
    }

    progressBarContainer.appendChild(segment);
  }

  const remainingCount = totalCount - takenCount;

  if (totalCount === 0) {
    summaryStatusMessage.textContent = "Nessuna medicina registrata.";
    summaryStatusMessage.classList.remove("celebrate");
  } else if (remainingCount === 0) {
    // A giornata completata compare OBIETTIVI RAGGIUNTI!
    summaryStatusMessage.innerHTML = `
      <span class="material-symbols-rounded" style="color: var(--color-primary); font-size: 20px;">emoji_events</span>
      <span>OBIETTIVI RAGGIUNTI!</span>
    `;
    summaryStatusMessage.classList.add("celebrate");

    showPhoneNotification(
      "OBIETTIVI RAGGIUNTI!",
      "Complimenti! Tutte le medicine di oggi sono state assunte con successo.",
      "OGGI"
    );
  } else if (remainingCount === 1) {
    summaryStatusMessage.textContent = "Ti manca solo 1 medicina per completare il piano di oggi!";
    summaryStatusMessage.classList.remove("celebrate");
  } else if (takenCount === 0) {
    summaryStatusMessage.textContent = "Ti mancano tutte e " + totalCount + " le medicine da assumere!";
    summaryStatusMessage.classList.remove("celebrate");
  } else {
    summaryStatusMessage.textContent = "Ti mancano ancora " + remainingCount + " medicine da assumere!";
    summaryStatusMessage.classList.remove("celebrate");
  }
}

/* ==========================================================================
   === GESTIONE MODALE: AGGIUNTA MEDICINA (MASSIMO 6) ===
   ========================================================================== */
function openAddModal() {
  // Cascata di pastiglie sullo sfondo all'apertura tramite tasto "+"
  triggerFallingPills();

  if (doses.length >= 6) {
    alert("Hai raggiunto il limite massimo di 6 medicine!");
    return;
  }
  addModalOverlay.classList.add("active");
  document.querySelector("#addMedName").focus();
}

function closeAddModal() {
  addModalOverlay.classList.remove("active");
  addMedForm.reset();
}

btnCloseAddModal.addEventListener("click", closeAddModal);
btnCancelAdd.addEventListener("click", closeAddModal);

addMedForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (doses.length >= 6) {
    alert("Limite massimo di 6 medicine già raggiunto.");
    closeAddModal();
    return;
  }

  const nameVal = document.querySelector("#addMedName").value.trim();
  const timeVal = document.querySelector("#addMedTime").value.trim();
  const specVal = document.querySelector("#addMedSpec").value.trim();
  const instructionVal = document.querySelector("#addMedInstruction").value.trim();

  const newMedicine = {
    id: Date.now(),
    name: nameVal || "Nuova Medicina",
    time: timeVal || "12:00",
    spec: specVal || "Dose personalizzata",
    instruction: instructionVal || "Assumere secondo le indicazioni mediche.",
    icon: "medication",
    status: "pending"
  };

  doses.push(newMedicine);

  // Ordina le medicine per orario cronologico
  doses.sort(function(a, b) {
    return a.time.localeCompare(b.time);
  });

  selectedDoseIndex = doses.findIndex(function(d) {
    return d.id === newMedicine.id;
  });

  closeAddModal();
  selectDose(selectedDoseIndex);
  updateProgress();

  // Pioggia celebrativa di pastiglie all'avvenuta aggiunta
  triggerFallingPills();

  showPhoneNotification(
    "Medicina Aggiunta!",
    newMedicine.name + " programmata per le ore " + newMedicine.time,
    newMedicine.time
  );
});

/* ==========================================================================
   === GESTIONE MODALE: MODIFICA NOME E ISTRUZIONI ===
   ========================================================================== */
function openEditModal() {
  const currentDose = doses[selectedDoseIndex];
  document.querySelector("#editMedName").value = currentDose.name;
  document.querySelector("#editMedTime").value = currentDose.time;
  document.querySelector("#editMedSpec").value = currentDose.spec;
  document.querySelector("#editMedInstruction").value = currentDose.instruction;

  editModalOverlay.classList.add("active");
}

function closeEditModal() {
  editModalOverlay.classList.remove("active");
}

btnOpenEditModal.addEventListener("click", openEditModal);
btnCloseEditModal.addEventListener("click", closeEditModal);
btnCancelEdit.addEventListener("click", closeEditModal);

editMedForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const currentDose = doses[selectedDoseIndex];
  currentDose.name = document.querySelector("#editMedName").value.trim() || currentDose.name;
  currentDose.time = document.querySelector("#editMedTime").value.trim() || currentDose.time;
  currentDose.spec = document.querySelector("#editMedSpec").value.trim() || currentDose.spec;
  currentDose.instruction = document.querySelector("#editMedInstruction").value.trim() || currentDose.instruction;

  closeEditModal();
  selectDose(selectedDoseIndex);
  updateProgress();

  showPhoneNotification(
    "Modifiche Salvate",
    "I dettagli di " + currentDose.name + " sono stati aggiornati.",
    currentDose.time
  );
});

/* ==========================================================================
   === AVVIO APPLICAZIONE AL CARICAMENTO DELLA PAGINA ===
   ========================================================================== */
window.addEventListener("DOMContentLoaded", function() {
  selectDose(0);
  updateProgress();

  // Notifica iniziale simulata per la prima dose della giornata
  setTimeout(function() {
    showPhoneNotification(
      "Promemoria VITAPP",
      "Prima medicina programmata: " + doses[0].name + " alle " + doses[0].time,
      doses[0].time
    );
  }, 500);
});
