// --- CONSTANTES THÉORIQUES ---
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const INTERVAL_NAMES = ["1", "2b", "2", "3b", "3", "4", "5b", "5", "5#", "6", "7b", "7"];

const CHORD_FORMULAS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  9: [0, 4, 7, 10, 2],
  m9: [0, 3, 7, 10, 2],
  maj9: [0, 4, 7, 11, 2],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
};

// Vaste liste d'accordages classés par popularité et familles
const TUNINGS = {
  // Guitares - Standard & Variations communes
  guitar_standard: [40, 45, 50, 55, 59, 64], // E A D G B E
  guitar_drop_d: [38, 45, 50, 55, 59, 64], // D A D G B E
  guitar_eb: [39, 44, 49, 54, 58, 63], // Eb Ab Db Gb Bb Eb (1/2 ton plus bas)
  guitar_d: [38, 43, 48, 53, 57, 62], // D G C F A D (1 ton plus bas)
  guitar_drop_c: [36, 43, 48, 53, 57, 62], // C G C F A D

  // Guitares - Open Tunings (Très populaires)
  guitar_dadgad: [38, 45, 50, 55, 57, 62], // D A D G A D (Celtique / Folk)
  guitar_open_g: [38, 43, 50, 55, 59, 62], // D G D G B D (Blues / Rolling Stones)
  guitar_open_d: [38, 45, 50, 54, 57, 62], // D A D F# A D
  guitar_open_e: [40, 47, 52, 56, 59, 64], // E B E G# B E

  // Guitares - Étendues
  guitar_7_string: [35, 40, 45, 50, 55, 59, 64], // B E A D G B E
  guitar_baritone: [35, 40, 45, 50, 54, 59], // B E A D F# B

  // Ukulélés
  ukulele_standard: [67, 60, 64, 69], // G C E A (High G)
  ukulele_low_g: [55, 60, 64, 69], // G C E A (Low G)
  ukulele_baritone: [50, 55, 59, 64], // D G B E

  // Basses
  bass_standard: [28, 33, 38, 43], // E A D G
  bass_drop_d: [26, 33, 38, 43], // D A D G
  bass_5_string: [23, 28, 33, 38, 43], // B E A D G
  bass_6_string: [23, 28, 33, 38, 43, 48], // B E A D G C

  // Autres instruments traditionnels
  mandolin: [55, 62, 69, 76], // G D A E
  banjo_open_g: [67, 62, 67, 71, 74], // g D G B D (5 cordes)
};

const TUNING_LABELS = {
  guitar_standard: "Guitare Standard",
  guitar_drop_d: "Guitare Drop D",
  guitar_eb: "Guitare Eb (1/2 ton bas)",
  guitar_d: "Guitare D Standard",
  guitar_drop_c: "Guitare Drop C",
  guitar_dadgad: "Guitare DADGAD",
  guitar_open_g: "Guitare Open G",
  guitar_open_d: "Guitare Open D",
  guitar_open_e: "Guitare Open E",
  guitar_7_string: "Guitare 7 Cordes",
  guitar_baritone: "Guitare Baryton",
  ukulele_standard: "Ukulélé (High G)",
  ukulele_low_g: "Ukulélé (Low G)",
  ukulele_baritone: "Ukulélé Baryton",
  bass_standard: "Basse 4 Cordes",
  bass_drop_d: "Basse Drop D",
  bass_5_string: "Basse 5 Cordes",
  bass_6_string: "Basse 6 Cordes",
  mandolin: "Mandoline",
  banjo_open_g: "Banjo (5 cordes)",
  piano: "Piano / Clavier",
};

class ChordGenerator {
  constructor(container, chordSequence, options = {}) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    this.chordSequence = chordSequence;

    this.options = Object.assign(
      {
        tuning: "guitar_standard", // String (clé) OU Array (ex: [40, 45, ...])
        customTuningName: null, // Nom optionnel si tuning est un Array
        renderType: "instrument", // 'instrument' ou 'staff'
        displayMode: "notes", // 'notes' ou 'intervals'
        size: 200,
      },
      options,
    );

    this.init();
  }

  init() {
    if (!this.container || !this.chordSequence.trim()) return;
    this.container.innerHTML = "";

    this.renderSummaryTitle();

    const gridWrapper = document.createElement("div");
    let minSize = this.options.size;
    if (this.options.renderType === "staff") minSize = this.options.size * 1.2;
    else if (this.options.tuning === "piano") minSize = this.options.size * 1.5;

    gridWrapper.style.display = "grid";
    gridWrapper.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minSize}px, 1fr))`;
    gridWrapper.style.gap = "1.5rem";
    this.container.appendChild(gridWrapper);

    const chords = this.chordSequence.split(",").map((s) => this.parseChordString(s));

    chords.forEach((chordData) => {
      if (!chordData) return;
      const voicings = this.generateVoicings(
        this.options.tuning,
        chordData.rootNote,
        chordData.chordType,
        chordData.bassNote,
      );
      if (voicings.length === 0) return;

      const state = {
        voicings: voicings,
        currentIndex: 0,
        rootNote: chordData.rootNote,
        tuningKey: this.options.tuning,
      };

      this.buildCard(gridWrapper, chordData, state);
    });
  }

  renderSummaryTitle() {
    const titleDiv = document.createElement("div");
    titleDiv.className =
      "text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wider flex flex-wrap gap-3";

    let modeLabel;
    if (this.options.renderType === "staff") {
      modeLabel = "Partition";
    } else if (Array.isArray(this.options.tuning)) {
      // Traitement pour l'accordage Custom (Array)
      const notesStr = this.options.tuning.map((m) => NOTE_NAMES[m % 12]).join("-");
      modeLabel = this.options.customTuningName || `Accordage Custom (${notesStr})`;
    } else {
      modeLabel = TUNING_LABELS[this.options.tuning] || this.options.tuning;
    }

    const displayLabel = this.options.displayMode === "notes" ? "Notes" : "Intervalles";

    titleDiv.innerHTML = `
            <span>🎸 Instrument/Vue: <span class="text-gray-600 dark:text-gray-300">${modeLabel}</span></span>
            <span>🏷️ Affichage: <span class="text-gray-600 dark:text-gray-300">${displayLabel}</span></span>
        `;
    this.container.appendChild(titleDiv);
  }

  buildCard(wrapper, chordData, state) {
    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 pb-1 flex flex-col items-center shadow-sm transition-all duration-300 hover:shadow-md relative group";

    let cWidth = 400;
    let cHeight = 350;
    if (this.options.renderType === "staff") {
      cWidth = 450;
      cHeight = 300;
    } else if (this.options.tuning === "piano") {
      cWidth = 600;
      cHeight = 220;
    }

    card.innerHTML = `
            <span class="card-counter absolute top-2 left-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-1 rounded z-0 pointer-events-none transition-colors"></span>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0 leading-none mt-1 z-10">${chordData.original}</h3>
            <div class="relative w-full mt-1 z-10">
                <button class="card-prev absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-8 rounded bg-white/90 dark:bg-gray-700/90 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm font-bold transition flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 focus:opacity-100">&lt;</button>
                <canvas class="w-full h-auto" width="${cWidth}" height="${cHeight}"></canvas>
                <button class="card-next absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-8 rounded bg-white/90 dark:bg-gray-700/90 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm font-bold transition flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 focus:opacity-100">&gt;</button>
            </div>
        `;
    wrapper.appendChild(card);

    const canvas = card.querySelector("canvas");
    const prevBtn = card.querySelector(".card-prev");
    const nextBtn = card.querySelector(".card-next");
    const counter = card.querySelector(".card-counter");

    const renderContext = () => {
      this.renderCardCanvas(state, canvas);
      counter.innerText = `${state.currentIndex + 1}/${state.voicings.length}`;
      prevBtn.disabled = state.currentIndex === 0;
      prevBtn.style.opacity = state.currentIndex === 0 ? "0" : "";
      prevBtn.style.cursor = state.currentIndex === 0 ? "default" : "pointer";
      nextBtn.disabled = state.currentIndex === state.voicings.length - 1;
      nextBtn.style.opacity = state.currentIndex === state.voicings.length - 1 ? "0" : "";
      nextBtn.style.cursor = state.currentIndex === state.voicings.length - 1 ? "default" : "pointer";
    };

    prevBtn.addEventListener("click", () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        renderContext();
      }
    });
    nextBtn.addEventListener("click", () => {
      if (state.currentIndex < state.voicings.length - 1) {
        state.currentIndex++;
        renderContext();
      }
    });
    renderContext();
  }

  renderCardCanvas(state, canvas) {
    if (this.options.renderType === "staff") {
      this.drawStaff(state.voicings[state.currentIndex], canvas);
    } else {
      if (state.tuningKey === "piano")
        this.drawPiano(state.voicings[state.currentIndex], canvas, state.rootNote, this.options.displayMode);
      else
        this.drawChord(
          state.voicings[state.currentIndex],
          state.tuningKey,
          canvas,
          state.rootNote,
          this.options.displayMode,
        );
    }
  }

  parseChordString(str) {
    let parts = str.trim().split("/");
    let mainPart = parts[0].trim();
    let bassPart = parts.length > 1 ? parts[1].trim() : null;

    const match = mainPart.match(/^([CDEFGAB][#b]?)(.*)$/i);
    if (!match) return null;

    let rootStr = match[1].toUpperCase();
    let typeStr = match[2].trim().toLowerCase();

    const noteMap = {
      C: 0,
      "C#": 1,
      DB: 1,
      D: 2,
      "D#": 3,
      EB: 3,
      E: 4,
      F: 5,
      "F#": 6,
      GB: 6,
      G: 7,
      "G#": 8,
      AB: 8,
      A: 9,
      "A#": 10,
      BB: 10,
      B: 11,
    };
    let rootNote = noteMap[rootStr];

    const typeMap = {
      "": "major",
      m: "minor",
      min: "minor",
      7: "7",
      m7: "m7",
      min7: "m7",
      maj7: "maj7",
      M7: "maj7",
      9: "9",
      m9: "m9",
      maj9: "maj9",
      sus4: "sus4",
      sus: "sus4",
      dim: "dim",
    };
    let chordType = typeMap[typeStr];

    if (rootNote === undefined || !chordType) return null;

    let bassNote = undefined;
    if (bassPart) {
      let cleanBass = bassPart.toUpperCase().replace(/B$/, "B");
      bassNote = noteMap[cleanBass];
      if (bassNote === undefined) return null;
    }
    return { rootNote, chordType, bassNote, original: str.trim() };
  }

  getChordNotes(rootNote, formulaName) {
    return CHORD_FORMULAS[formulaName].map((interval) => (rootNote + interval) % 12);
  }
  getLabel(noteIndex, rootNote, mode) {
    return mode === "intervals" ? INTERVAL_NAMES[(noteIndex - rootNote + 12) % 12] : NOTE_NAMES[noteIndex % 12];
  }

  generatePianoVoicings(rootNote, chordType, bassNote = undefined) {
    let voicings = [];
    let baseMidi = 60 + rootNote;
    let formula = CHORD_FORMULAS[chordType];
    let targetNotes = formula.map((interval) => baseMidi + interval);

    if (bassNote !== undefined) {
      let actualNotes = targetNotes.map((n) => n % 12);
      if (!actualNotes.includes(bassNote)) {
        let bMidi = 48 + bassNote;
        targetNotes.unshift(bMidi);
      } else {
        while (targetNotes[0] % 12 !== bassNote) targetNotes.push(targetNotes.shift() + 12);
      }
      voicings.push({
        isPiano: true,
        notes: targetNotes,
        actualNotes: targetNotes.map((n) => n % 12),
        absoluteNotes: targetNotes,
        score: 0,
      });
      return voicings;
    }

    voicings.push({
      isPiano: true,
      notes: targetNotes,
      actualNotes: targetNotes.map((n) => n % 12),
      absoluteNotes: targetNotes,
      score: 0,
    });
    if (targetNotes.length >= 3) {
      let v2 = [...targetNotes];
      v2.push(v2.shift() + 12);
      voicings.push({ isPiano: true, notes: v2, actualNotes: v2.map((n) => n % 12), absoluteNotes: v2, score: 1 });
    }
    if (targetNotes.length >= 3) {
      let v3 = [...voicings[1].notes];
      v3.push(v3.shift() + 12);
      voicings.push({ isPiano: true, notes: v3, actualNotes: v3.map((n) => n % 12), absoluteNotes: v3, score: 2 });
    }
    return voicings;
  }

  generateVoicings(tuningKey, rootNote, chordType, bassNote = undefined) {
    if (tuningKey === "piano") return this.generatePianoVoicings(rootNote, chordType, bassNote);

    // Résolution dynamique du tuning (String ou Array custom)
    const tuning = Array.isArray(tuningKey) ? tuningKey : TUNINGS[tuningKey];
    if (!tuning) return []; // Sécurité

    const targetNotes = this.getChordNotes(rootNote, chordType);
    if (bassNote !== undefined && !targetNotes.includes(bassNote)) targetNotes.push(bassNote);

    const numStrings = tuning.length;
    const maxFret = 14;
    const maxFretSpan = 3;
    let voicings = [];

    for (let baseFret = 0; baseFret <= maxFret - maxFretSpan; baseFret++) {
      let possibleFretsPerString = [];
      for (let s = 0; s < numStrings; s++) {
        let openNote = tuning[s] % 12;
        let validFretsForString = [-1];
        for (let f = 0; f <= maxFret; f++) {
          if (f === 0 || (f >= baseFret && f <= baseFret + maxFretSpan)) {
            let noteAtFret = (openNote + f) % 12;
            if (targetNotes.includes(noteAtFret)) validFretsForString.push(f);
          }
        }
        possibleFretsPerString.push(validFretsForString);
      }

      let combinations = [[]];
      for (let s = 0; s < numStrings; s++) {
        let temp = [];
        for (let c of combinations) {
          for (let f of possibleFretsPerString[s]) temp.push([...c, f]);
        }
        combinations = temp;
      }

      for (let voicing of combinations) {
        let evaluated = this.evaluateFingering(voicing, targetNotes, rootNote, tuning, tuningKey, chordType, bassNote);
        if (evaluated.valid && !voicings.some((v) => v.frets.join(",") === voicing.join(","))) {
          voicings.push({ frets: voicing, ...evaluated });
        }
      }
    }
    voicings.sort((a, b) => a.score - b.score);
    return voicings;
  }

  evaluateFingering(frets, targetNotes, rootNote, tuning, tuningKey, chordType, bassNote) {
    let playedFrets = frets.filter((f) => f > -1);
    if (playedFrets.length === 0) return { valid: false };

    let presentNotes = new Set();
    let actualNotes = [];
    let absoluteNotes = [];
    let lowestStringPlayed = -1;
    let lowestNotePlayed = -1;

    for (let i = 0; i < frets.length; i++) {
      if (frets[i] > -1) {
        let note = (tuning[i] + frets[i]) % 12;
        presentNotes.add(note);
        actualNotes.push(note);
        absoluteNotes.push(tuning[i] + frets[i]);
        if (lowestStringPlayed === -1) {
          lowestStringPlayed = i;
          lowestNotePlayed = note;
        }
      } else {
        actualNotes.push(-1);
        absoluteNotes.push(-1);
      }
    }

    let missingNotes = targetNotes.filter((n) => !presentNotes.has(n));
    let isValidNotes = missingNotes.length === 0;

    if (!isValidNotes && targetNotes.length >= 5) {
      let perfectFifth = (rootNote + 7) % 12;
      if (missingNotes.length === 1 && missingNotes[0] === perfectFifth) isValidNotes = true;
    }
    if (!isValidNotes) return { valid: false };

    let playingStarted = false;
    let hasInsideMute = false;
    let lastPlayedIndex = -1;
    for (let i = 0; i < frets.length; i++) if (frets[i] > -1) lastPlayedIndex = i;
    for (let i = 0; i < frets.length; i++) {
      if (frets[i] > -1) playingStarted = true;
      if (playingStarted && frets[i] === -1 && i < lastPlayedIndex) hasInsideMute = true;
    }
    if (hasInsideMute) return { valid: false };

    let fretsNotOpen = playedFrets.filter((f) => f > 0);
    if (fretsNotOpen.length === 0)
      return {
        valid: true,
        score: 0,
        fingering: frets.map((f) => (f > 0 ? 0 : 0)),
        barre: null,
        actualNotes,
        absoluteNotes,
      };

    let minFret = Math.min(...fretsNotOpen);
    let maxFret = Math.max(...fretsNotOpen);
    let span = maxFret - minFret;
    if (span > 3) return { valid: false };

    let barre = null;
    let fingerCountRequired = 0;
    let fingers = new Array(frets.length).fill(0);
    let stringsAtMinFret = [];
    for (let i = 0; i < frets.length; i++) if (frets[i] === minFret) stringsAtMinFret.push(i);

    if (stringsAtMinFret.length > 1) {
      let firstStr = stringsAtMinFret[0];
      let lastStr = stringsAtMinFret[stringsAtMinFret.length - 1];
      let validBarre = true;
      for (let i = firstStr; i <= lastStr; i++) if (frets[i] === 0) validBarre = false;
      if (validBarre) {
        barre = { fret: minFret, startString: firstStr, endString: lastStr };
        for (let i = firstStr; i <= lastStr; i++) if (frets[i] === minFret) fingers[i] = 1;
        fingerCountRequired = 1;
      }
    }

    let remainingNotesToFinger = [];
    for (let i = 0; i < frets.length; i++)
      if (frets[i] > 0 && fingers[i] === 0) remainingNotesToFinger.push({ string: i, fret: frets[i] });
    remainingNotesToFinger.sort((a, b) => {
      if (a.fret !== b.fret) return a.fret - b.fret;
      return a.string - b.string;
    });

    let currentFinger = barre ? 2 : 1;
    for (let note of remainingNotesToFinger) {
      fingers[note.string] = currentFinger;
      currentFinger++;
      fingerCountRequired++;
    }
    if (fingerCountRequired > 4) return { valid: false };

    let score = minFret * 0.5 + span * 1;
    if (barre) score += 2;

    if (bassNote !== undefined) {
      if (lowestNotePlayed !== bassNote) return { valid: false };
    } else {
      if (lowestNotePlayed !== rootNote) score += 4;
    }

    score += frets.filter((f) => f === -1).length * 1.5;
    score -= frets.filter((f) => f === 0).length * 1.0;

    const fretSignature = frets.join(",");
    const chordId = `${rootNote}_${chordType}`;

    if (bassNote === undefined) {
      // Ces contraintes ne s'appliquent que si ce n'est PAS un accordage custom
      if (tuningKey === "guitar_standard") {
        const classicShapes = {
          "0_major": "-1,3,2,0,1,0",
          "9_major": "-1,0,2,2,2,0",
          "7_major": "3,2,0,0,0,3",
          "4_major": "0,2,2,1,0,0",
          "2_major": "-1,-1,0,2,3,2",
          "9_minor": "-1,0,2,2,1,0",
          "4_minor": "0,2,2,0,0,0",
          "2_minor": "-1,-1,0,2,3,1",
          "5_major": "1,3,3,2,1,1",
          "5_maj7": "-1,-1,3,2,1,0",
          "0_maj7": "-1,3,2,0,0,0",
        };
        if (classicShapes[chordId] === fretSignature) score -= 100;
        else if (chordId === "7_major" && fretSignature === "3,2,0,0,3,3") score -= 99;
      } else if (tuningKey === "ukulele_standard") {
        const ukeShapes = {
          "0_major": "0,0,0,3",
          "7_major": "0,2,3,2",
          "5_major": "2,0,1,0",
          "9_minor": "2,0,0,0",
          "9_major": "2,1,0,0",
          "4_minor": "0,4,3,2",
          "2_major": "2,2,2,0",
        };
        if (ukeShapes[chordId] === fretSignature) score -= 100;
      }
    }
    return { valid: true, score: score.toFixed(1), fingering: fingers, barre: barre, actualNotes, absoluteNotes };
  }

  getCanvasColors() {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark
      ? {
          bg: "#1f2937",
          fret: "#4b5563",
          fretNum: "#9ca3af",
          nut: "#d1d5db",
          string: "#4b5563",
          stringText: "#9ca3af",
          barre: "rgba(156, 163, 175, 0.3)",
          marker: "#f3f4f6",
          markerText: "#1f2937",
          noteText: "#d1d5db",
          pianoWhite: "#374151",
          pianoStroke: "#1f2937",
          pianoBlack: "#111827",
          staffLine: "#4b5563",
          staffClef: "#9ca3af",
        }
      : {
          bg: "#fafafa",
          fret: "#9ca3af",
          fretNum: "#4b5563",
          nut: "#374151",
          string: "#d1d5db",
          stringText: "#9ca3af",
          barre: "rgba(75, 85, 99, 0.4)",
          marker: "#1f2937",
          markerText: "white",
          noteText: "#374151",
          pianoWhite: "white",
          pianoStroke: "#4b5563",
          pianoBlack: "#1f2937",
          staffLine: "#9ca3af",
          staffClef: "#6b7280",
        };
  }

  drawStaff(chordData, canvas) {
    const ctx = canvas.getContext("2d");
    const cols = this.getCanvasColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padX = 40;
    const width = canvas.width;
    const halfSpace = 8;
    const centerY = canvas.height / 2;

    ctx.fillStyle = cols.bg;
    ctx.fillRect(padX - 20, 10, width - 2 * padX + 40, canvas.height - 20);
    ctx.strokeStyle = cols.staffLine;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let d of [2, 4, 6, 8, 10]) {
      let y = centerY - d * halfSpace;
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
    }
    for (let d of [-2, -4, -6, -8, -10]) {
      let y = centerY - d * halfSpace;
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
    }
    ctx.moveTo(padX, centerY - 10 * halfSpace);
    ctx.lineTo(padX, centerY - -10 * halfSpace);
    ctx.stroke();

    ctx.fillStyle = cols.staffClef;
    ctx.font = "50px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("𝄞", padX + 20, centerY - 6 * halfSpace);
    ctx.fillText("𝄢", padX + 20, centerY + 6 * halfSpace);

    if (!chordData || !chordData.absoluteNotes) return;
    let uniqueNotes = [...new Set(chordData.absoluteNotes.filter((n) => n > -1))].sort((a, b) => a - b);
    let diatonicMap = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
    let startX = width / 2;
    let previousD = -999;
    let currentX = startX;

    ctx.fillStyle = cols.marker;
    ctx.strokeStyle = cols.marker;
    ctx.lineWidth = 2.5;
    uniqueNotes.forEach((midi) => {
      let octave = Math.floor(midi / 12) - 5;
      let noteClass = midi % 12;
      let d = octave * 7 + diatonicMap[noteClass];
      let y = centerY - d * halfSpace;

      if (Math.abs(d - previousD) <= 1) currentX += 18;
      else currentX = startX;
      previousD = d;

      ctx.beginPath();
      ctx.ellipse(currentX, y, 9, 6.5, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();

      let drawLedger = (lineD) => {
        let ly = centerY - lineD * halfSpace;
        ctx.beginPath();
        ctx.moveTo(currentX - 16, ly);
        ctx.lineTo(currentX + 16, ly);
        ctx.stroke();
      };
      if (d === 0) drawLedger(0);
      if (d >= 12) for (let ld = 12; ld <= d; ld += 2) drawLedger(ld);
      if (d <= -12) for (let ld = -12; ld >= d; ld -= 2) drawLedger(ld);

      if ([1, 3, 6, 8, 10].includes(noteClass)) {
        ctx.font = "20px sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText("♯", currentX - 14, y);
      }
    });
  }

  drawPiano(chordData, canvas, rootNote, displayMode) {
    const ctx = canvas.getContext("2d");
    const cols = this.getCanvasColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const minNote = Math.min(...chordData.notes);
    const maxNote = Math.max(...chordData.notes);
    const baseC = Math.floor(minNote / 12) * 12;
    let topC = Math.ceil((maxNote + 1) / 12) * 12;
    let numOctaves = Math.max(2, (topC - baseC) / 12);
    const padX = 20;
    const keyWidth = (canvas.width - 2 * padX) / (numOctaves * 7 + 1);
    const keyHeight = 160;
    const startY = (canvas.height - keyHeight) / 2;

    ctx.fillStyle = cols.pianoWhite;
    ctx.strokeStyle = cols.pianoStroke;
    ctx.lineWidth = 2;
    for (let i = 0; i < numOctaves * 7 + 1; i++) {
      ctx.fillRect(padX + i * keyWidth, startY, keyWidth, keyHeight);
      ctx.strokeRect(padX + i * keyWidth, startY, keyWidth, keyHeight);
    }

    const bkW = keyWidth * 0.55;
    const bkH = keyHeight * 0.6;
    ctx.fillStyle = cols.pianoBlack;
    for (let oct = 0; oct < numOctaves; oct++) {
      [1, 2, 4, 5, 6].forEach((border) => {
        let x = padX + (oct * 7 + border) * keyWidth - bkW / 2;
        ctx.fillRect(x, startY, bkW, bkH);
      });
    }

    const keyCenters = [0.5, 1, 1.5, 2, 2.5, 3.5, 4, 4.5, 5, 5.5, 6, 6.5];
    chordData.notes.forEach((note) => {
      let noteInOct = (note - baseC) % 12;
      let cx = padX + Math.floor((note - baseC) / 12) * 7 * keyWidth + keyCenters[noteInOct] * keyWidth;
      let cy = [1, 3, 6, 8, 10].includes(noteInOct) ? startY + bkH - 24 : startY + keyHeight - 32;

      ctx.fillStyle = cols.marker;
      ctx.beginPath();
      if (note % 12 === rootNote) {
        if (ctx.roundRect) ctx.roundRect(cx - 14, cy - 14, 28, 28, 4);
        else ctx.rect(cx - 14, cy - 14, 28, 28);
      } else ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cols.markerText;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.getLabel(note % 12, rootNote, displayMode), cx, cy + 1);
    });
  }

  drawChord(chordData, tuningKey, canvas, rootNote, displayMode) {
    const ctx = canvas.getContext("2d");
    const cols = this.getCanvasColors();

    // Résolution dynamique du Tuning (String ou Custom Array)
    const tuning = Array.isArray(tuningKey) ? tuningKey : TUNINGS[tuningKey];
    const frets = chordData.frets;
    const numStrings = tuning.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padX = canvas.width > 300 ? 50 : 30;
    const padTop = canvas.height > 300 ? 75 : 55;
    const padBottom = 45;
    const stringSpacing = (canvas.width - 2 * padX) / Math.max(1, numStrings - 1);
    let playedFrets = frets.filter((f) => f > 0);
    let minFretDisplay = 1;
    let numFretsDisplay = 4;

    if (playedFrets.length > 0) {
      let actualMin = Math.min(...playedFrets);
      let actualMax = Math.max(...playedFrets);
      if (actualMin > 2) {
        minFretDisplay = actualMin;
        numFretsDisplay = Math.max(4, actualMax - actualMin + 1);
      }
    }
    const fretSpacing = (canvas.height - padTop - padBottom) / numFretsDisplay;

    ctx.fillStyle = cols.bg;
    ctx.fillRect(padX - 10, padTop, canvas.width - 2 * padX + 20, canvas.height - padTop - padBottom);
    ctx.strokeStyle = cols.fret;
    ctx.lineWidth = 4;
    for (let i = 0; i <= numFretsDisplay; i++) {
      let y = padTop + i * fretSpacing;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(canvas.width - padX, y);
      ctx.stroke();
      if (i > 0) {
        ctx.fillStyle = cols.fretNum;
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(minFretDisplay + i - 1, padX - 12, y - fretSpacing / 2);
      }
    }

    if (minFretDisplay === 1) {
      ctx.strokeStyle = cols.nut;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(padX, padTop);
      ctx.lineTo(canvas.width - padX, padTop);
      ctx.stroke();
    }

    for (let i = 0; i < numStrings; i++) {
      let x = padX + i * stringSpacing;
      let st = 1 + (numStrings - i) * 0.5;
      if (tuningKey === "ukulele_standard") st = 2;
      ctx.strokeStyle = cols.string;
      ctx.lineWidth = st;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, canvas.height - padBottom);
      ctx.stroke();
      ctx.fillStyle = cols.stringText;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(NOTE_NAMES[tuning[i] % 12], x, canvas.height - 15);
    }

    if (chordData.barre && chordData.barre.fret >= minFretDisplay) {
      let b = chordData.barre;
      let startX = padX + b.startString * stringSpacing;
      let endX = padX + b.endString * stringSpacing;
      let y = padTop + (b.fret - minFretDisplay) * fretSpacing + fretSpacing / 2;
      ctx.fillStyle = cols.barre;
      ctx.beginPath();
      ctx.moveTo(startX, y - 22);
      ctx.lineTo(endX, y - 22);
      ctx.arc(endX, y, 22, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(startX, y + 22);
      ctx.arc(startX, y, 22, Math.PI / 2, -Math.PI / 2);
      ctx.fill();
    }

    for (let i = 0; i < numStrings; i++) {
      let fret = frets[i];
      let x = padX + i * stringSpacing;
      if (fret === -1) {
        ctx.strokeStyle = cols.marker;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        let y = padTop - 24;
        ctx.moveTo(x - 7, y - 7);
        ctx.lineTo(x + 7, y + 7);
        ctx.moveTo(x + 7, y - 7);
        ctx.lineTo(x - 7, y + 7);
        ctx.stroke();
        ctx.lineCap = "butt";
      } else if (fret === 0) {
        ctx.strokeStyle = cols.marker;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, padTop - 24, 7, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fret >= minFretDisplay) {
        let y = padTop + (fret - minFretDisplay) * fretSpacing + fretSpacing / 2;
        ctx.fillStyle = cols.marker;
        ctx.beginPath();
        if (chordData.actualNotes[i] === rootNote) {
          if (ctx.roundRect) ctx.roundRect(x - 22, y - 22, 44, 44, 8);
          else ctx.rect(x - 22, y - 22, 44, 44);
        } else ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        if (chordData.fingering[i] > 0) {
          ctx.fillStyle = cols.markerText;
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(chordData.fingering[i], x, y + 2);
        }
      }
      if (fret > -1) {
        ctx.fillStyle = cols.noteText;
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.getLabel(chordData.actualNotes[i], rootNote, displayMode), x, canvas.height - 20);
      }
    }
  }
}

window.ChordGenerator = ChordGenerator;
