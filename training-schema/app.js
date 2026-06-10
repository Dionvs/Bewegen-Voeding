const muscles = [
  "Rug",
  "Borst",
  "Schouders",
  "Triceps",
  "Biceps",
  "Core",
  "Bil",
  "Quadriceps",
  "Hamstring",
  "Kuiten",
  "Cardio",
];

const progressionRules = [
  ["manual", "Handmatig"],
  ["lastSet", "Min/max sets -> verhogen/verlagen"],
  ["double", "Reps omhoog, daarna gewicht"],
  ["plus25", "+2,5 kg als alles gehaald is"],
  ["plus5", "+5 kg compound"],
  ["rir", "RIR/RPE gestuurd"],
];

const defaultDatabase = {
  Rug: ["Pull-up", "Lat pulldown", "Barbell row", "Seated cable row", "Romanian deadlift"],
  Borst: ["Bench press", "Incline dumbbell press", "Cable fly", "Push-up"],
  Schouders: ["Overhead press", "Lateral raise", "Rear delt fly", "Arnold press"],
  Triceps: ["Cable pushdown", "Skull crusher", "Dips", "Overhead triceps extension"],
  Biceps: ["Barbell curl", "Incline dumbbell curl", "Hammer curl", "Cable curl"],
  Core: ["Plank", "Cable crunch", "Hanging leg raise", "Dead bug"],
  Bil: ["Hip thrust", "Glute bridge", "Bulgarian split squat", "Cable kickback"],
  Quadriceps: ["Back squat", "Leg press", "Leg extension", "Front squat"],
  Hamstring: ["Romanian deadlift", "Lying leg curl", "Seated leg curl", "Good morning"],
  Kuiten: ["Standing calf raise", "Seated calf raise", "Leg press calf raise"],
  Cardio: ["Fiets", "Loopband", "Roeier", "Crosstrainer"],
};

const defaultState = {
  programName: "Nieuw trainingsschema",
  trainingSplit: "Push / Pull / Legs",
  blockLength: 8,
  defaultRule: "double",
  defaultRepRange: "6-12",
  defaultRest: "2-3 min",
  replacePanelOpen: false,
  selectedWeek: 1,
  selectedDay: 0,
  selectedExercise: null,
  clients: [],
  manualOneRms: [
    { id: "rm-bench", exercise: "Bench press", muscle: "Borst", weight: 100 },
    { id: "rm-squat", exercise: "Back squat", muscle: "Quadriceps", weight: 140 },
    { id: "rm-row", exercise: "Barbell row", muscle: "Rug", weight: 100 },
  ],
  database: defaultDatabase,
  days: [
    {
      name: "Dag 1 - Push",
      exercises: [
        exercise("Bench press", "Borst", 4, "6-8", 80, "RIR 2", "2-3 min", "double", false, "Focus op vaste pauze onderin."),
        exercise("Overhead press", "Schouders", 3, "6-10", 45, "RIR 2", "2 min", "plus25", false, ""),
        exercise("Cable pushdown", "Triceps", 3, "10-15", 25, "RPE 8", "75 sec", "double", false, ""),
      ],
    },
    {
      name: "Dag 2 - Pull",
      exercises: [
        exercise("Pull-up", "Rug", 4, "6-10", 10, "RIR 1", "2 min", "double", false, "Gewicht is extra belasting."),
        exercise("Barbell row", "Rug", 3, "8-10", 70, "RIR 2", "2 min", "plus25", false, ""),
        exercise("Barbell curl", "Biceps", 3, "8-12", 30, "RPE 8", "90 sec", "double", false, ""),
      ],
    },
    {
      name: "Dag 3 - Legs",
      exercises: [
        exercise("Back squat", "Quadriceps", 4, "5-8", 100, "RIR 2", "3 min", "plus5", false, ""),
        exercise("Romanian deadlift", "Hamstring", 3, "8-10", 90, "RIR 2", "2-3 min", "plus25", false, ""),
        exercise("Standing calf raise", "Kuiten", 4, "10-15", 60, "RPE 8", "75 sec", "double", false, ""),
      ],
    },
  ],
};

let state = loadState();

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  render();
  applyHashState();
});

function exercise(name, muscle, sets, reps, weight, effort, rest, rule, done, notes) {
  return {
    id: makeId(),
    name,
    muscle,
    sets,
    reps,
    weight,
    effort,
    rest,
    rule,
    progressMinReps: repsMin(reps) || repsMax(reps) || 8,
    progressTargetReps: repsMax(reps) || 10,
    progressIncreaseType: "percent",
    progressIncreaseValue: 2.5,
    progressDecreaseType: "percent",
    progressDecreaseValue: 5,
    actualSets: [],
    done,
    notes,
  };
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function bindElements() {
  [
    "programName",
    "trainingSplit",
    "dashboardSplit",
    "blockLength",
    "weekSelect",
    "dashboardWeekSelect",
    "defaultRule",
    "defaultRepRange",
    "defaultRest",
    "weekVolume",
    "weekSets",
    "completionRate",
    "activeDays",
    "oneRmList",
    "muscleVolume",
    "dayTabs",
    "dayName",
    "exerciseRows",
    "replaceMuscle",
    "replaceExercise",
    "replaceSelected",
    "replaceModal",
    "closeReplaceModal",
    "suggestionList",
    "progressAdvice",
    "databaseMuscle",
    "databaseExercise",
    "databaseForm",
    "databaseList",
    "oneRmForm",
    "oneRmExercise",
    "oneRmMuscle",
    "oneRmWeight",
    "oneRmCalcWeight",
    "oneRmCalcReps",
    "calculateOneRm",
    "manualOneRmList",
    "clientForm",
    "clientName",
    "clientEmail",
    "clientPhone",
    "clientGoal",
    "clientShareLink",
    "clientNotes",
    "clientList",
    "printPreview",
    "printSheet",
    "saveStatus",
    "exportData",
    "importData",
    "importDataFile",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  document.getElementById("addDay").addEventListener("click", () => {
    state.days.push({ name: `Dag ${state.days.length + 1}`, exercises: [] });
    state.selectedDay = state.days.length - 1;
    saveAndRender();
  });

  document.getElementById("removeDay").addEventListener("click", () => {
    if (state.days.length <= 1) return;
    state.days.splice(state.selectedDay, 1);
    state.selectedDay = Math.max(0, state.selectedDay - 1);
    state.selectedExercise = null;
    saveAndRender();
  });

  document.getElementById("addExercise").addEventListener("click", () => {
    const day = currentDay();
    day.exercises.push(exercise("Nieuwe oefening", "Borst", 3, state.defaultRepRange, 0, "RIR 2", state.defaultRest, state.defaultRule, false, ""));
    state.selectedExercise = day.exercises[day.exercises.length - 1].id;
    saveAndRender();
  });

  document.getElementById("printButton").addEventListener("click", () => {
    renderPrint();
    window.print();
  });

  els.exportData.addEventListener("click", exportData);
  els.importData.addEventListener("click", () => els.importDataFile.click());
  els.importDataFile.addEventListener("change", importData);

  document.getElementById("resetDemo").addEventListener("click", () => {
    if (!confirm("Weet je zeker dat je opnieuw wilt beginnen?")) return;
    localStorage.removeItem("trainingSchemaDashboard");
    state = structuredClone(defaultState);
    saveAndRender();
  });

  els.programName.addEventListener("input", (event) => updateField("programName", event.target.value));
  els.trainingSplit.addEventListener("input", (event) => updateField("trainingSplit", event.target.value));
  els.dashboardSplit.addEventListener("input", (event) => updateField("trainingSplit", event.target.value));
  els.blockLength.addEventListener("change", (event) => {
    state.blockLength = Number(event.target.value);
    state.selectedWeek = Math.min(state.selectedWeek, state.blockLength);
    saveAndRender();
  });
  els.weekSelect.addEventListener("change", (event) => {
    state.selectedWeek = Number(event.target.value);
    saveAndRender();
  });
  els.dashboardWeekSelect.addEventListener("change", (event) => {
    state.selectedWeek = Number(event.target.value);
    saveAndRender();
  });
  els.defaultRule.addEventListener("change", (event) => updateField("defaultRule", event.target.value));
  els.defaultRepRange.addEventListener("input", (event) => updateField("defaultRepRange", event.target.value));
  els.defaultRest.addEventListener("input", (event) => updateField("defaultRest", event.target.value));
  els.dayName.addEventListener("input", (event) => {
    currentDay().name = event.target.value;
    saveAndRender(false);
  });

  els.replaceMuscle.addEventListener("change", updateSelectedMuscleFromPanel);
  els.replaceSelected.addEventListener("click", replaceSelectedExercise);
  els.closeReplaceModal.addEventListener("click", closeReplaceModal);
  els.replaceModal.addEventListener("click", (event) => {
    if (event.target === els.replaceModal) closeReplaceModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.replacePanelOpen) closeReplaceModal();
  });
  els.databaseForm.addEventListener("submit", addDatabaseExercise);
  els.oneRmMuscle.addEventListener("change", renderOneRmExerciseOptions);
  els.calculateOneRm.addEventListener("click", calculateOneRmFromInputs);
  els.oneRmForm.addEventListener("submit", addManualOneRm);
  els.clientForm.addEventListener("submit", addClient);
}

function switchSection(sectionId) {
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.section === sectionId));
  document.querySelectorAll(".section").forEach((section) => section.classList.toggle("active-section", section.id === sectionId));
  if (sectionId === "print") renderPrint();
  if (sectionId !== "planner" && state.replacePanelOpen) closeReplaceModal(false);
}

function applyHashState() {
  const sectionFromHash = window.location.hash.replace("#", "").split("&")[0];
  const directSections = ["dashboard", "planner", "oneRepMax", "database", "print"];
  if (directSections.includes(sectionFromHash)) {
    switchSection(sectionFromHash);
    return;
  }

  const match = window.location.hash.match(/persoon=([^&]+)/);
  if (!match) return;
  const client = findClient(decodeURIComponent(match[1]));
  if (!client) return;
  client.expanded = true;
  switchSection("clients");
  renderClients();
}

function render() {
  renderControls();
  renderDashboard();
  renderPlanner();
  renderDatabase();
  renderManualOneRms();
  renderClients();
  renderPrint();
  renderSaveStatus();
}

function renderControls() {
  els.programName.value = state.programName;
  els.trainingSplit.value = state.trainingSplit;
  els.dashboardSplit.value = state.trainingSplit;
  els.blockLength.innerHTML = range(4, 16)
    .map((week) => option(week, `${week} weken`, state.blockLength === week))
    .join("");
  const weekOptions = range(1, state.blockLength)
    .map((week) => option(week, `Week ${week}`, state.selectedWeek === week))
    .join("");
  els.weekSelect.innerHTML = weekOptions;
  els.dashboardWeekSelect.innerHTML = weekOptions;
  els.defaultRule.innerHTML = progressionRules.map(([value, label]) => option(value, label, state.defaultRule === value)).join("");
  els.defaultRepRange.value = state.defaultRepRange;
  els.defaultRest.value = state.defaultRest;
  const selected = findExercise(state.selectedExercise);
  fillMuscleSelect(els.replaceMuscle, selected?.exercise.muscle || els.replaceMuscle.value || muscles[0]);
  fillMuscleSelect(els.databaseMuscle, els.databaseMuscle.value || muscles[0]);
  fillMuscleSelect(els.oneRmMuscle, els.oneRmMuscle.value || muscles[0]);
  renderOneRmExerciseOptions();
  renderReplaceExercises();
  renderSuggestionList();
  renderReplaceModal();
}

function renderDashboard() {
  const rows = allExercises();
  const totalVolume = rows.reduce((sum, item) => sum + volume(item.exercise), 0);
  const totalSets = rows.reduce((sum, item) => sum + toNumber(item.exercise.sets), 0);
  const done = rows.filter((item) => item.exercise.done).length;
  els.weekVolume.textContent = `${round(totalVolume)} kg`;
  els.weekSets.textContent = totalSets;
  els.completionRate.textContent = rows.length ? `${Math.round((done / rows.length) * 100)}%` : "0%";
  els.activeDays.textContent = state.days.filter((day) => day.exercises.length).length;

  const oneRms = (state.manualOneRms || [])
    .filter((item) => toNumber(item.weight) > 0)
    .sort((a, b) => toNumber(b.weight) - toNumber(a.weight));
  const maxOneRm = Math.max(1, ...oneRms.map((item) => toNumber(item.weight)));
  els.oneRmList.innerHTML =
    oneRms
      .map(
        (item) => `
          <div class="one-rm-row">
            <div>
              <strong>${escapeHtml(item.exercise)}</strong>
              <small>${escapeHtml(item.muscle)} | handmatig uit 1RM tab</small>
              <div class="bar"><span style="width:${Math.min(100, (toNumber(item.weight) / maxOneRm) * 100)}%"></span></div>
            </div>
            <strong>${round(item.weight)} kg</strong>
          </div>`
      )
      .join("") || emptyState("Nog geen handmatige 1RM's ingevuld.");

  const byMuscle = Object.fromEntries(muscles.map((muscle) => [muscle, 0]));
  rows.forEach((item) => {
    byMuscle[item.exercise.muscle] = (byMuscle[item.exercise.muscle] || 0) + toNumber(item.exercise.sets);
  });
  const maxSets = Math.max(1, ...Object.values(byMuscle));
  els.muscleVolume.innerHTML = muscles
    .map(
      (muscle) => `
        <div class="volume-row">
          <div>
            <strong>${muscle}</strong>
            <div class="bar"><span style="width:${(byMuscle[muscle] / maxSets) * 100}%"></span></div>
          </div>
          <strong>${byMuscle[muscle]}</strong>
        </div>`
    )
    .join("");
}

function renderPlanner() {
  els.dayTabs.innerHTML = state.days
    .map((day, index) => `<button class="day-tab ${index === state.selectedDay ? "active" : ""}" data-index="${index}" type="button">${escapeHtml(day.name)}</button>`)
    .join("");
  els.dayTabs.querySelectorAll(".day-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDay = Number(button.dataset.index);
      state.selectedExercise = null;
      saveAndRender();
    });
  });

  els.dayName.value = currentDay().name;
  els.exerciseRows.innerHTML =
    currentDay()
      .exercises.map((item) => renderExerciseRow(normalizeExercise(item)))
      .join("") || `<tr><td colspan="11">${emptyState("Voeg je eerste oefening toe.")}</td></tr>`;

  els.exerciseRows.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("input, select, button")) return;
      if (state.selectedExercise !== row.dataset.id) state.replacePanelOpen = false;
      state.selectedExercise = row.dataset.id;
      saveAndRender();
    });
  });

  els.exerciseRows.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("focus", () => {
      if (state.selectedExercise !== input.dataset.id) state.replacePanelOpen = false;
      state.selectedExercise = input.dataset.id;
      saveState();
      renderSuggestionList();
    });
    input.addEventListener("input", (event) => {
      const item = findExercise(input.dataset.id);
      if (!item) return;
      const field = input.dataset.field;
      item.exercise[field] = input.type === "checkbox" ? input.checked : input.value;
      if (field === "name") state.selectedExercise = item.exercise.id;
      if (field === "muscle") {
        els.replaceMuscle.value = item.exercise.muscle;
        renderReplaceExercises();
        renderSuggestionList();
      }
      saveAndRender(false);
      renderDashboard();
      renderProgressAdvice();
      renderPrint();
    });
    input.addEventListener("change", (event) => {
      const item = findExercise(input.dataset.id);
      if (!item) return;
      item.exercise[input.dataset.field] = input.type === "checkbox" ? input.checked : input.value;
      saveAndRender();
    });
  });

  els.exerciseRows.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const day = currentDay();
      day.exercises = day.exercises.filter((exerciseItem) => exerciseItem.id !== button.dataset.delete);
      state.selectedExercise = null;
      saveAndRender();
    });
  });

  els.exerciseRows.querySelectorAll("[data-open-replace]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedExercise = button.dataset.openReplace;
      state.replacePanelOpen = true;
      saveAndRender();
    });
  });

  els.exerciseRows.querySelectorAll("[data-set-field]").forEach((input) => {
    input.addEventListener("focus", () => {
      if (state.selectedExercise !== input.dataset.id) state.replacePanelOpen = false;
      state.selectedExercise = input.dataset.id;
      saveState();
      renderSuggestionList();
    });
    input.addEventListener("input", () => {
      const item = findExercise(input.dataset.id);
      if (!item) return;
      normalizeExercise(item.exercise);
      const setIndex = Number(input.dataset.setIndex);
      item.exercise.actualSets[setIndex][input.dataset.setField] = input.value;
      state.selectedExercise = item.exercise.id;
      saveState();
      renderDashboard();
      renderProgressAdvice();
    });
  });

  renderProgressAdvice();
}

function renderExerciseRow(item) {
  const selected = state.selectedExercise === item.id ? "selected-row" : "";
  return `
    <tr class="exercise-main-row ${selected}" data-id="${item.id}">
      <td><input data-id="${item.id}" data-field="name" value="${escapeAttr(item.name)}" /></td>
      <td>
        <div class="muscle-cell">
          <select data-id="${item.id}" data-field="muscle">${muscles.map((muscle) => option(muscle, muscle, item.muscle === muscle)).join("")}</select>
          <button class="replace-icon-button" data-open-replace="${item.id}" type="button" aria-label="Vervang oefening" title="Vervang oefening">↻</button>
        </div>
      </td>
      <td><input data-id="${item.id}" data-field="sets" type="number" min="0" step="1" value="${escapeAttr(item.sets)}" /></td>
      <td><input data-id="${item.id}" data-field="reps" value="${escapeAttr(item.reps)}" /></td>
      <td><input data-id="${item.id}" data-field="weight" type="number" min="0" step="0.5" value="${escapeAttr(item.weight)}" /></td>
      <td><input data-id="${item.id}" data-field="effort" value="${escapeAttr(item.effort)}" /></td>
      <td><input data-id="${item.id}" data-field="rest" value="${escapeAttr(item.rest)}" /></td>
      <td><select data-id="${item.id}" data-field="rule">${progressionRules.map(([value, label]) => option(value, label, item.rule === value)).join("")}</select></td>
      <td><input data-id="${item.id}" data-field="done" type="checkbox" ${item.done ? "checked" : ""} /></td>
      <td>
        <div class="row-actions">
          <button class="icon-button" data-delete="${item.id}" type="button" aria-label="Verwijder oefening">x</button>
        </div>
      </td>
      <td class="notes-card-cell" rowspan="2">
        <textarea data-id="${item.id}" data-field="notes" placeholder="Opmerkingen">${escapeHtml(item.notes)}</textarea>
      </td>
    </tr>
    <tr class="set-log-row">
      <td colspan="10">
        <div class="set-log">
          <div class="set-log-header">
            <strong>Set registratie</strong>
            <label>Min reps
              <input data-id="${item.id}" data-field="progressMinReps" type="number" min="1" step="1" value="${escapeAttr(item.progressMinReps)}" />
            </label>
            <label>Max reps
              <input data-id="${item.id}" data-field="progressTargetReps" type="number" min="1" step="1" value="${escapeAttr(item.progressTargetReps)}" />
            </label>
            <label>Omhoog
              <select data-id="${item.id}" data-field="progressIncreaseType">
                ${option("percent", "%", item.progressIncreaseType === "percent")}
                ${option("kg", "kg", item.progressIncreaseType === "kg")}
              </select>
            </label>
            <label>+ waarde
              <input data-id="${item.id}" data-field="progressIncreaseValue" type="number" min="0" step="0.5" value="${escapeAttr(item.progressIncreaseValue)}" />
            </label>
            <label>Omlaag
              <select data-id="${item.id}" data-field="progressDecreaseType">
                ${option("percent", "%", item.progressDecreaseType === "percent")}
                ${option("kg", "kg", item.progressDecreaseType === "kg")}
              </select>
            </label>
            <label>- waarde
              <input data-id="${item.id}" data-field="progressDecreaseValue" type="number" min="0" step="0.5" value="${escapeAttr(item.progressDecreaseValue)}" />
            </label>
          </div>
          <div class="set-log-grid">
            ${item.actualSets
              .map(
                (setItem, index) => {
                  const suggestion = suggestedWeightForSet(item, setItem) || suggestedWeightForExerciseTarget(item);
                  return `
                  <div class="set-log-card">
                    <span>Set ${index + 1}</span>
                    <label>kg
                      <input data-id="${item.id}" data-set-index="${index}" data-set-field="weight" type="number" min="0" step="0.5" value="${escapeAttr(setItem.weight)}" placeholder="${suggestion ? escapeAttr(formatKg(suggestion)) : ""}" />
                    </label>
                    <label>reps
                      <input data-id="${item.id}" data-set-index="${index}" data-set-field="reps" type="number" min="0" step="1" value="${escapeAttr(setItem.reps)}" />
                    </label>
                    ${suggestion ? `<small class="weight-suggestion">Suggestie: ${formatKg(suggestion)}</small>` : ""}
                  </div>`;
                }
              )
              .join("")}
          </div>
        </div>
      </td>
    </tr>
    <tr class="exercise-spacer-row" aria-hidden="true">
      <td colspan="11"></td>
    </tr>`;
}

function renderReplaceExercises() {
  const muscle = els.replaceMuscle.value || muscles[0];
  els.replaceExercise.innerHTML = (state.database[muscle] || []).map((name) => option(name, name, false)).join("");
}

function renderSuggestionList() {
  const selected = findExercise(state.selectedExercise);
  if (!state.replacePanelOpen || !selected) {
    els.suggestionList.innerHTML = "";
    return;
  }
  const muscle = selected.exercise.muscle;
  if (els.replaceMuscle.value !== muscle) {
    els.replaceMuscle.value = muscle;
    renderReplaceExercises();
  }
  const suggestions = state.database[muscle] || [];
  els.suggestionList.innerHTML =
    suggestions
      .map(
        (name) => `
          <button class="suggestion-button" data-suggestion="${escapeAttr(name)}" type="button">
            ${escapeHtml(name)}
          </button>`
      )
      .join("") || emptyState(`Geen oefeningen voor ${muscle}.`);

  els.suggestionList.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = findExercise(state.selectedExercise);
      if (!current) return;
      current.exercise.name = button.dataset.suggestion;
      state.replacePanelOpen = false;
      saveAndRender();
    });
  });
}

function updateSelectedMuscleFromPanel() {
  const selected = findExercise(state.selectedExercise);
  if (selected) selected.exercise.muscle = els.replaceMuscle.value;
  state.replacePanelOpen = true;
  renderReplaceExercises();
  renderSuggestionList();
  saveAndRender();
}

function renderReplaceModal() {
  els.replaceModal.hidden = !state.replacePanelOpen;
  if (!state.replacePanelOpen) return;
  const selected = findExercise(state.selectedExercise);
  if (!selected) {
    closeReplaceModal(false);
    return;
  }
  document.getElementById("replaceModalTitle").textContent = `${selected.exercise.name} vervangen`;
}

function closeReplaceModal(shouldRender = true) {
  state.replacePanelOpen = false;
  els.replaceModal.hidden = true;
  saveState();
  if (shouldRender) render();
}

function renderProgressAdvice() {
  const rows = allExercises();
  els.progressAdvice.innerHTML =
    rows
      .map((item) => {
        const next = nextProgression(item.exercise);
        return `
          <div class="advice-row">
            <div>
              <strong>${escapeHtml(item.exercise.name)}</strong>
              <small>${escapeHtml(item.day.name)} | ${escapeHtml(ruleLabel(item.exercise.rule))}</small>
            </div>
            <span>${escapeHtml(next)}</span>
          </div>`;
      })
      .join("") || emptyState("Nog geen oefeningen.");
}

function renderDatabase() {
  els.databaseList.innerHTML = muscles
    .map((muscle) => {
      const items = state.database[muscle] || [];
      return `
        <div class="database-group">
          <h3>${muscle}</h3>
          <div class="exercise-chip-list">
            ${items
              .map(
                (name) => `
                  <span class="exercise-chip">
                    ${escapeHtml(name)}
                    <button type="button" data-db-muscle="${muscle}" data-db-name="${escapeAttr(name)}" aria-label="Verwijder ${escapeAttr(name)}">x</button>
                  </span>`
              )
              .join("") || "<small>Geen oefeningen.</small>"}
          </div>
        </div>`;
    })
    .join("");

  els.databaseList.querySelectorAll("[data-db-muscle]").forEach((button) => {
    button.addEventListener("click", () => {
      const list = state.database[button.dataset.dbMuscle] || [];
      state.database[button.dataset.dbMuscle] = list.filter((name) => name !== button.dataset.dbName);
      saveAndRender();
    });
  });
}

function renderManualOneRms() {
  const items = state.manualOneRms || [];
  els.manualOneRmList.innerHTML =
    items
      .map(
        (item) => `
          <div class="manual-rm-row">
            <div>
              <strong>${escapeHtml(item.exercise)}</strong>
              <small>${escapeHtml(item.muscle)}</small>
            </div>
            <div class="rm-calc-pair">
              <label>kg
                <input data-rm-field="calcWeight" data-rm-id="${item.id}" type="number" min="0" step="0.5" placeholder="kg" />
              </label>
              <label>reps
                <input data-rm-field="calcReps" data-rm-id="${item.id}" type="number" min="1" step="1" placeholder="reps" />
              </label>
            </div>
            <button class="secondary-button" data-rm-calc="${item.id}" type="button">Bereken</button>
            <div class="rm-result-cell">
              <span>1RM</span>
              <strong>${round(item.weight)} kg</strong>
              <input data-rm-field="weight" data-rm-id="${item.id}" type="number" min="0" step="0.5" value="${escapeAttr(item.weight)}" aria-label="1RM handmatig aanpassen" />
            </div>
            <button class="icon-button" data-rm-delete="${item.id}" type="button" aria-label="Verwijder 1RM">x</button>
          </div>`
      )
      .join("") || emptyState("Nog geen handmatige 1RM's.");

  els.manualOneRmList.querySelectorAll("[data-rm-field='weight']").forEach((input) => {
    input.addEventListener("input", () => {
      const item = (state.manualOneRms || []).find((entry) => entry.id === input.dataset.rmId);
      if (!item) return;
      item.weight = toNumber(input.value);
      saveState();
      renderDashboard();
    });
  });

  els.manualOneRmList.querySelectorAll("[data-rm-calc]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".manual-rm-row");
      const item = (state.manualOneRms || []).find((entry) => entry.id === button.dataset.rmCalc);
      if (!item || !row) return;
      const weight = toNumber(row.querySelector("[data-rm-field='calcWeight']").value);
      const reps = toNumber(row.querySelector("[data-rm-field='calcReps']").value);
      if (!weight || !reps) return;
      const epley = weight * (1 + reps / 30);
      const percent = percentageForReps(reps);
      const pyramid = percent ? weight / percent : epley;
      item.weight = round((epley + pyramid) / 2);
      saveAndRender();
    });
  });

  els.manualOneRmList.querySelectorAll("[data-rm-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.manualOneRms = (state.manualOneRms || []).filter((item) => item.id !== button.dataset.rmDelete);
      saveAndRender();
    });
  });
}

function renderClients() {
  const clients = state.clients || [];
  els.clientList.innerHTML =
    clients
      .map(
        (client) => `
          <article class="client-card" data-client-id="${client.id}">
            <div class="client-row" data-client-toggle="${client.id}">
              <label>Naam
                <input data-client-field="name" value="${escapeAttr(client.name)}" />
              </label>
              <label>E-mail
                <input data-client-field="email" type="email" value="${escapeAttr(client.email)}" />
              </label>
              <label>Telefoon
                <input data-client-field="phone" value="${escapeAttr(client.phone)}" />
              </label>
              <label>Doel
                <input data-client-field="goal" value="${escapeAttr(client.goal)}" />
              </label>
              <button class="secondary-button client-toggle-button" data-client-toggle-button="${client.id}" type="button">${client.expanded ? "Sluit" : "Open"}</button>
              <button class="danger-button" data-client-delete="${client.id}" type="button">Verwijder</button>
            </div>
            ${
              client.expanded
                ? `<div class="client-details">
                    <label>Deellink / document
                      <div class="client-link-row">
                        <input data-client-field="shareLink" type="url" value="${escapeAttr(client.shareLink)}" placeholder="Voeg link toe of maak lokale link" />
                        <button class="secondary-button" data-client-make-link="${client.id}" type="button">Maak link</button>
                        <button class="secondary-button" data-client-copy-link="${client.id}" type="button">Kopieer</button>
                      </div>
                    </label>
                    <label>Notities
                      <textarea data-client-field="notes" placeholder="Extra gegevens">${escapeHtml(client.notes)}</textarea>
                    </label>
                    <div class="client-card-actions">
                      ${client.shareLink ? `<a class="secondary-button link-button" href="${escapeAttr(client.shareLink)}" target="_blank" rel="noreferrer">Open link</a>` : ""}
                    </div>
                  </div>`
                : ""
            }
          </article>`
      )
      .join("") || emptyState("Nog geen personen toegevoegd.");

  els.clientList.querySelectorAll("[data-client-toggle]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target.closest("input, textarea, button, a") && !event.target.closest("[data-client-toggle-button]")) return;
      const client = findClient(element.dataset.clientToggle);
      if (!client) return;
      client.expanded = !client.expanded;
      saveAndRender();
    });
  });

  els.clientList.querySelectorAll("[data-client-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const client = findClient(input.closest("[data-client-id]")?.dataset.clientId);
      if (!client) return;
      client[input.dataset.clientField] = input.value;
      saveState();
      renderSaveStatus();
    });
    input.addEventListener("change", () => saveAndRender());
  });

  els.clientList.querySelectorAll("[data-client-make-link]").forEach((button) => {
    button.addEventListener("click", () => {
      const client = findClient(button.dataset.clientMakeLink);
      if (!client) return;
      client.shareLink = buildClientShareLink(client.id);
      saveAndRender();
    });
  });

  els.clientList.querySelectorAll("[data-client-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      const client = findClient(button.dataset.clientCopyLink);
      if (!client?.shareLink) return;
      try {
        await navigator.clipboard.writeText(client.shareLink);
        els.saveStatus.textContent = "Link gekopieerd";
      } catch {
        prompt("Kopieer deze link:", client.shareLink);
      }
    });
  });

  els.clientList.querySelectorAll("[data-client-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.clients = (state.clients || []).filter((client) => client.id !== button.dataset.clientDelete);
      saveAndRender();
    });
  });
}

function renderOneRmExerciseOptions() {
  const muscle = els.oneRmMuscle.value || muscles[0];
  const current = els.oneRmExercise.value;
  const options = state.database[muscle] || [];
  els.oneRmExercise.innerHTML = options.map((name) => option(name, name, current === name)).join("");
}

function calculateOneRmFromInputs() {
  const weight = toNumber(els.oneRmCalcWeight.value);
  const reps = toNumber(els.oneRmCalcReps.value);
  if (!weight || !reps) return;
  const epley = weight * (1 + reps / 30);
  const percent = percentageForReps(reps);
  const pyramid = percent ? weight / percent : epley;
  els.oneRmWeight.value = round((epley + pyramid) / 2);
}

function addManualOneRm(event) {
  event.preventDefault();
  const exerciseName = els.oneRmExercise.value;
  const weight = toNumber(els.oneRmWeight.value);
  if (!exerciseName || !weight) return;
  const existing = (state.manualOneRms || []).find((item) => item.exercise.toLowerCase() === exerciseName.toLowerCase());
  if (existing) {
    existing.muscle = els.oneRmMuscle.value;
    existing.weight = weight;
  } else {
    state.manualOneRms = [
      ...(state.manualOneRms || []),
      { id: makeId(), exercise: exerciseName, muscle: els.oneRmMuscle.value, weight },
    ];
  }
  els.oneRmExercise.value = "";
  els.oneRmWeight.value = "";
  saveAndRender();
}

function addClient(event) {
  event.preventDefault();
  const name = els.clientName.value.trim();
  if (!name) return;
  state.clients = [
    ...(state.clients || []),
    {
      id: makeId(),
      name,
      email: els.clientEmail.value.trim(),
      phone: els.clientPhone.value.trim(),
      goal: els.clientGoal.value.trim(),
      shareLink: els.clientShareLink.value.trim(),
      notes: els.clientNotes.value.trim(),
      expanded: true,
    },
  ];
  els.clientForm.reset();
  saveAndRender();
}

function findClient(id) {
  return (state.clients || []).find((client) => client.id === id);
}

function buildClientShareLink(id) {
  return `${window.location.href.split("#")[0]}#persoon=${encodeURIComponent(id)}`;
}

function renderPrint() {
  const html = `
    <div class="print-week">
      <div>
        <h1>${escapeHtml(state.programName)}</h1>
        <div class="print-meta">${escapeHtml(state.trainingSplit)} | Week ${state.selectedWeek} van ${state.blockLength}</div>
      </div>
      ${state.days
        .map(
          (day) => `
            <section class="print-day">
              <h3>${escapeHtml(day.name)}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Oefening</th><th>Sets</th><th>Reps</th><th>Gewicht</th><th>RIR/RPE</th><th>Rust</th><th>Opmerkingen</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    day.exercises
                      .map(
                        (item) => `
                          <tr>
                            <td>${escapeHtml(item.name)}</td>
                            <td>${escapeHtml(item.sets)}</td>
                            <td>${escapeHtml(item.reps)}</td>
                            <td>${escapeHtml(item.weight)} kg</td>
                            <td>${escapeHtml(item.effort)}</td>
                            <td>${escapeHtml(item.rest)}</td>
                            <td>${escapeHtml(item.notes || "")}</td>
                          </tr>`
                      )
                      .join("") || `<tr><td colspan="7">Geen oefeningen gepland.</td></tr>`
                  }
                </tbody>
              </table>
            </section>`
        )
        .join("")}
    </div>`;
  els.printPreview.innerHTML = html;
  els.printSheet.innerHTML = html;
}

function addDatabaseExercise(event) {
  event.preventDefault();
  const muscle = els.databaseMuscle.value;
  const name = els.databaseExercise.value.trim();
  if (!name) return;
  state.database[muscle] = [...new Set([...(state.database[muscle] || []), name])].sort();
  els.databaseExercise.value = "";
  saveAndRender();
}

function replaceSelectedExercise() {
  const item = findExercise(state.selectedExercise);
  if (!item) return;
  item.exercise.muscle = els.replaceMuscle.value;
  item.exercise.name = els.replaceExercise.value || item.exercise.name;
  state.replacePanelOpen = false;
  saveAndRender();
}

function updateField(field, value) {
  state[field] = value;
  saveAndRender(false);
  renderPrint();
}

function currentDay() {
  return state.days[state.selectedDay] || state.days[0];
}

function allExercises() {
  return state.days.flatMap((day) => day.exercises.map((exerciseItem) => ({ day, exercise: exerciseItem })));
}

function findExercise(id) {
  return allExercises().find((item) => item.exercise.id === id);
}

function normalizeExercise(item) {
  item.progressMinReps = toNumber(item.progressMinReps) || repsMin(item.reps) || repsMax(item.reps) || 8;
  item.progressTargetReps = toNumber(item.progressTargetReps) || repsMax(item.reps) || 10;
  item.progressIncreaseType = item.progressIncreaseType || "percent";
  item.progressIncreaseValue = toNumber(item.progressIncreaseValue) || 2.5;
  item.progressDecreaseType = item.progressDecreaseType || item.progressIncreaseType || "percent";
  item.progressDecreaseValue = toNumber(item.progressDecreaseValue) || 5;
  item.actualSets = Array.isArray(item.actualSets) ? item.actualSets : [];
  const targetSets = Math.max(0, toNumber(item.sets));
  while (item.actualSets.length < targetSets) {
    item.actualSets.push({ weight: item.weight || 0, reps: "" });
  }
  if (item.actualSets.length > targetSets) {
    item.actualSets = item.actualSets.slice(0, targetSets);
  }
  return item;
}

function estimateOneRm(item) {
  const weight = toNumber(item.weight);
  const reps = repsAverage(item.reps);
  const epley = weight * (1 + reps / 30);
  const percent = percentageForReps(reps);
  const pyramid = percent ? weight / percent : epley;
  return (epley + pyramid) / 2;
}

function getOneRmForExercise(item) {
  const manual = state.manualOneRms || [];
  const exact = manual.find((entry) => entry.exercise.toLowerCase() === String(item.name).toLowerCase());
  if (exact) return toNumber(exact.weight);
  const sameMuscle = manual.filter((entry) => entry.muscle === item.muscle).sort((a, b) => toNumber(b.weight) - toNumber(a.weight))[0];
  return sameMuscle ? toNumber(sameMuscle.weight) : 0;
}

function suggestedWeightForSet(item, setItem) {
  const reps = toNumber(setItem.reps);
  if (!reps) return 0;
  const oneRm = getOneRmForExercise(item);
  if (!oneRm) return 0;
  return roundToNearest(oneRm * percentageForReps(reps), 2.5);
}

function suggestedWeightForExerciseTarget(item) {
  const targetReps = repsMax(item.reps) || repsAverage(item.reps);
  const oneRm = getOneRmForExercise(item);
  if (!targetReps || !oneRm) return 0;
  return roundToNearest(oneRm * percentageForReps(targetReps), 2.5);
}

function percentageForReps(reps) {
  const table = {
    1: 1,
    2: 0.95,
    3: 0.93,
    4: 0.9,
    5: 0.87,
    6: 0.85,
    7: 0.83,
    8: 0.8,
    9: 0.77,
    10: 0.75,
    11: 0.73,
    12: 0.7,
    13: 0.68,
    14: 0.65,
    15: 0.63,
  };
  return table[Math.round(reps)] || Math.max(0.5, 1 - reps * 0.025);
}

function nextProgression(item) {
  normalizeExercise(item);
  if (item.rule === "lastSet") return nextLastSetProgression(item);
  const weight = toNumber(item.weight);
  const reps = item.reps;
  if (item.rule === "manual") return "Handmatig";
  if (!item.done) return "Herhaal huidige target";
  if (item.rule === "plus25") return `${formatKg(weight + 2.5)} volgende week`;
  if (item.rule === "plus5") return `${formatKg(weight + 5)} volgende week`;
  if (item.rule === "rir") {
    const rirMatch = String(item.effort).match(/rir\s*(\d+)/i);
    if (rirMatch && Number(rirMatch[1]) >= 3) return `${formatKg(weight + 2.5)} door hoge RIR`;
    return "Behouden of +1 rep";
  }
  if (item.rule === "double") {
    const rangeMatch = String(reps).match(/(\d+)\s*-\s*(\d+)/);
    if (!rangeMatch) return "+1 rep of kleine gewichtsstap";
    return `Werk naar ${rangeMatch[2]} reps, daarna ${formatKg(weight + 2.5)}`;
  }
  return "Handmatig";
}

function nextLastSetProgression(item) {
  const targetSets = Math.max(0, toNumber(item.sets));
  const loggedSets = item.actualSets.slice(0, targetSets).filter((setItem) => toNumber(setItem.reps));
  if (!loggedSets.length) return "Vul je sets in voor advies";
  if (targetSets && loggedSets.length < targetSets) return `Vul alle ${targetSets} sets in voor volledig advies`;

  const minReps = toNumber(item.progressMinReps) || repsMin(item.reps);
  const maxReps = toNumber(item.progressTargetReps) || repsMax(item.reps);
  const baseWeight = progressionBaseWeight(item, loggedSets);

  if (minReps && loggedSets.some((setItem) => toNumber(setItem.reps) < minReps)) {
    const decrease = toNumber(item.progressDecreaseValue);
    const nextWeight = applyProgressionStep(baseWeight, item.progressDecreaseType, decrease, -1);
    const label = item.progressDecreaseType === "percent" ? `-${decrease}%` : `-${decrease} kg`;
    return `${label}: ${formatKg(nextWeight)} volgende week`;
  }

  if (maxReps && loggedSets.every((setItem) => toNumber(setItem.reps) >= maxReps)) {
    const increase = toNumber(item.progressIncreaseValue);
    const nextWeight = applyProgressionStep(baseWeight, item.progressIncreaseType, increase, 1);
    const label = item.progressIncreaseType === "percent" ? `+${increase}%` : `+${increase} kg`;
    return `${label}: ${formatKg(nextWeight)} volgende week`;
  }

  return minReps && maxReps ? `Herhaal gewicht tot alle sets ${maxReps} reps halen` : "Herhaal huidige gewicht";
}

function progressionBaseWeight(item, loggedSets) {
  const lastWeight = [...loggedSets].reverse().map((setItem) => toNumber(setItem.weight)).find(Boolean);
  return lastWeight || toNumber(item.weight);
}

function applyProgressionStep(weight, type, value, direction) {
  const next = type === "percent" ? weight * (1 + direction * value / 100) : weight + direction * value;
  return Math.max(0, next);
}

function volume(item) {
  return toNumber(item.sets) * repsAverage(item.reps) * toNumber(item.weight);
}

function repsAverage(value) {
  const text = String(value || "");
  const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
  if (rangeMatch) return (toNumber(rangeMatch[1]) + toNumber(rangeMatch[2])) / 2;
  const match = text.match(/\d+(?:[.,]\d+)?/);
  return match ? toNumber(match[0]) : 0;
}

function repsMax(value) {
  const text = String(value || "");
  const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
  if (rangeMatch) return toNumber(rangeMatch[2]);
  const matches = [...text.matchAll(/\d+(?:[.,]\d+)?/g)];
  return matches.length ? toNumber(matches[matches.length - 1][0]) : 0;
}

function repsMin(value) {
  const text = String(value || "");
  const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
  if (rangeMatch) return toNumber(rangeMatch[1]);
  const match = text.match(/\d+(?:[.,]\d+)?/);
  return match ? toNumber(match[0]) : 0;
}

function toNumber(value) {
  return Number(String(value ?? 0).replace(",", ".")) || 0;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function formatKg(value) {
  return `${round(value)} kg`;
}

function ruleLabel(value) {
  return progressionRules.find((rule) => rule[0] === value)?.[1] || "Handmatig";
}

function fillMuscleSelect(select, selected) {
  select.innerHTML = muscles.map((muscle) => option(muscle, muscle, selected === muscle)).join("");
}

function option(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function emptyState(text) {
  return `<div class="one-rm-row"><span>${escapeHtml(text)}</span></div>`;
}

function saveAndRender(shouldRender = true) {
  saveState();
  renderSaveStatus();
  if (shouldRender) render();
}

function renderSaveStatus() {
  els.saveStatus.textContent = `Lokaal opgeslagen | ${new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
}

function saveState() {
  localStorage.setItem("trainingSchemaDashboard", JSON.stringify(state));
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `trainingsschema-${date}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  els.saveStatus.textContent = "Data geexporteerd";
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result || "{}"));
      if (!Array.isArray(imported.days) || !imported.database) throw new Error("Ongeldig bestand");
      state = mergeState(defaultState, imported);
      saveAndRender();
      els.saveStatus.textContent = "Data geimporteerd";
    } catch (error) {
      alert("Dit bestand kon niet worden ingelezen als trainingsschema.");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function loadState() {
  try {
    const raw = localStorage.getItem("trainingSchemaDashboard");
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return mergeState(defaultState, parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, incoming) {
  const merged = { ...structuredClone(base), ...incoming };
  merged.manualOneRms = Array.isArray(incoming.manualOneRms) ? incoming.manualOneRms : structuredClone(base.manualOneRms);
  merged.clients = Array.isArray(incoming.clients) ? incoming.clients : [];
  merged.database = incoming.database || structuredClone(base.database);
  merged.days = Array.isArray(incoming.days) ? incoming.days : structuredClone(base.days);
  return merged;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
