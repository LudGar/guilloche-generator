// ---------- STATE ----------

const state = {
  angleA: -8,
  angleB: 17,
  angleC: 7,
  angleD: 0,
  scaleA: 82,
  scaleB: 41,
  scaleC: 144,
  scaleD: 0,
  offset: 0,
  repeatOffset: 45,
  repeatCount: 5,
  thickness: 1,
  scale: 100,
  strokeColor: "#000000"
};

const svg = document.getElementById("previewSvg");
const svgNS = "http://www.w3.org/2000/svg";

// ---------- PRESETS ----------

const LS_KEY = "guillocheCustomPresetsV1";

const builtInPresets = [
  {
    name: "Default",
    state: { ...state }
  },
  {
    name: "Fine Rosette",
    state: {
      angleA: 6,
      angleB: -13,
      angleC: 22,
      angleD: 0,
      scaleA: 120,
      scaleB: 48,
      scaleC: 64,
      scaleD: 0,
      offset: 0,
      repeatOffset: 40,
      repeatCount: 18,
      thickness: 2,
      scale: 80,
      strokeColor: "#004488"
    }
  },
  {
    name: "Dense Net",
    state: {
      angleA: 11,
      angleB: 19,
      angleC: -23,
      angleD: 3,
      scaleA: 96,
      scaleB: 72,
      scaleC: 50,
      scaleD: 12,
      offset: 10,
      repeatOffset: 120,
      repeatCount: 30,
      thickness: 3,
      scale: 70,
      strokeColor: "#008800"
    }
  },
  {
    name: "Starburst",
    state: {
      angleA: 3,
      angleB: 21,
      angleC: 7,
      angleD: 0,
      scaleA: 180,
      scaleB: 72,
      scaleC: 40,
      scaleD: 0,
      offset: 0,
      repeatOffset: 220,
      repeatCount: 10,
      thickness: 1,
      scale: 100,
      strokeColor: "#880000"
    }
  }
];

let customPresets = [];

// ---------- HELPERS ----------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- UI INIT ----------

function updateLabel(id) {
  const span = document.querySelector(`.value[data-for="${id}"]`);
  if (!span) return;
  span.textContent = state[id];
}

function syncInputsFromState() {
  const inputs = document.querySelectorAll('input[type="range"], input[type="color"]');
  inputs.forEach(input => {
    const id = input.id;
    const type = input.type;
    if (!state.hasOwnProperty(id)) return;

    if (type === "color" || type === "range") {
      input.value = state[id];
      updateLabel(id);
    }
  });
}

function initControls() {
  const inputs = document.querySelectorAll('input[type="range"], input[type="color"]');
  inputs.forEach(input => {
    const id = input.id;
    const type = input.type;

    if (state.hasOwnProperty(id)) {
      input.value = state[id];
    } else {
      if (type === "range") {
        state[id] = Number(input.value);
      } else if (type === "color") {
        state[id] = input.value;
      }
    }
    updateLabel(id);

    input.addEventListener("input", () => {
      if (type === "range") {
        state[id] = Number(input.value);
      } else {
        state[id] = input.value;
      }
      updateLabel(id);
      render();
    });
  });

  initPresetsUI();
  initDownloadButton();
  initRandomButton();
}

// ---------- PRESET HANDLING ----------

function loadCustomPresets() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      customPresets = [];
      return;
    }
    const parsed = JSON.parse(raw);
    customPresets = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to parse custom presets:", e);
    customPresets = [];
  }
}

function saveCustomPresets() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(customPresets));
  } catch (e) {
    console.warn("Failed to save custom presets:", e);
  }
}

function repopulatePresetSelect() {
  const select = document.getElementById("presetSelect");
  if (!select) return;
  select.innerHTML = "";

  const builtGroup = document.createElement("optgroup");
  builtGroup.label = "Built-in";
  builtInPresets.forEach((p, index) => {
    const opt = document.createElement("option");
    opt.value = `built:${index}`;
    opt.textContent = p.name;
    builtGroup.appendChild(opt);
  });
  select.appendChild(builtGroup);

  const customGroup = document.createElement("optgroup");
  customGroup.label = "Custom";
  customPresets.forEach((p, index) => {
    const opt = document.createElement("option");
    opt.value = `custom:${index}`;
    opt.textContent = p.name;
    customGroup.appendChild(opt);
  });
  select.appendChild(customGroup);

  select.value = "built:0";
}

function getSelectedPreset() {
  const select = document.getElementById("presetSelect");
  if (!select || !select.value) return null;
  const [kind, idxStr] = select.value.split(":");
  const idx = Number(idxStr);
  if (kind === "built") return builtInPresets[idx] || null;
  if (kind === "custom") return customPresets[idx] || null;
  return null;
}

function applyPreset(preset) {
  if (!preset || !preset.state) return;
  const newState = JSON.parse(JSON.stringify(preset.state));
  Object.assign(state, newState);
  syncInputsFromState();
  render();
}

function initPresetsUI() {
  loadCustomPresets();
  repopulatePresetSelect();

  const applyBtn = document.getElementById("applyPreset");
  const saveBtn = document.getElementById("savePreset");
  const delBtn = document.getElementById("deletePreset");

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const preset = getSelectedPreset();
      if (preset) applyPreset(preset);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const name = prompt("Preset name:");
      if (!name) return;
      const stateCopy = JSON.parse(JSON.stringify(state));
      customPresets.push({ name, state: stateCopy });
      saveCustomPresets();
      repopulatePresetSelect();
    });
  }

  if (delBtn) {
    delBtn.addEventListener("click", () => {
      const select = document.getElementById("presetSelect");
      if (!select || !select.value) return;
      const [kind, idxStr] = select.value.split(":");
      const idx = Number(idxStr);

      if (kind === "built") {
        alert("Built-in presets cannot be deleted.");
        return;
      }
      if (kind === "custom" && idx >= 0 && idx < customPresets.length) {
        const [removed] = customPresets.splice(idx, 1);
        saveCustomPresets();
        repopulatePresetSelect();
        alert(`Deleted preset: ${removed.name}`);
      }
    });
  }
}

// ---------- RANDOMIZE ----------

function randomizeState() {
  state.angleA = randomInt(-24, 24);
  state.angleB = randomInt(-24, 24);
  state.angleC = randomInt(-24, 24);
  state.angleD = randomInt(-10, 10);

  state.scaleA = randomInt(60, 200);
  state.scaleB = randomInt(20, 120);
  state.scaleC = randomInt(20, 160);
  state.scaleD = randomInt(0, 80);

  state.offset = randomInt(-30, 30);
  state.repeatOffset = randomInt(0, 360);
  state.repeatCount = randomInt(5, 35);

  state.thickness = randomInt(1, 4);
  state.scale = randomInt(60, 120);

  const linePalette = ["#004488", "#880000", "#008800", "#884400", "#553388", "#006666"];
  state.strokeColor = randomChoice(linePalette);
}

function initRandomButton() {
  const btn = document.getElementById("randomize");
  if (!btn) return;
  btn.addEventListener("click", () => {
    randomizeState();
    syncInputsFromState();
    render();
  });
}

// ---------- DOWNLOAD ----------

function initDownloadButton() {
  const button = document.getElementById("downloadSvg");
  if (!button) return;
  button.addEventListener("click", downloadSVG);
}

function downloadSVG() {
  const serializer = new XMLSerializer();
  // Clone SVG as-is; there's no background rect, just paths
  const clone = svg.cloneNode(true);

  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = url;
  a.download = `guilloche-${timestamp}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- DRAWING ----------

function createPathData(stepIndex) {
  const count = 360 * 8;
  const rad = Math.PI / 180;
  const offset = (state.offset / 500) * stepIndex;
  const repeatOffset = (state.repeatOffset / 50) * stepIndex;

  const { angleA, angleB, angleC, angleD } = state;
  const { scaleA, scaleB, scaleC, scaleD } = state;
  const globalScale = state.scale / 100;

  const pts = [];

  for (let i = 0; i <= count; i++) {
    const degrees = (i / count) * 360;

    const x = Math.sin(degrees * rad * angleA) * scaleA;
    const y = Math.cos(degrees * rad * angleA) * scaleA;

    const xx = x + Math.sin(degrees * rad * angleB + offset) * scaleB;
    const yy = y + Math.cos(degrees * rad * angleB + offset) * scaleB;

    const xxx = xx + Math.sin(degrees * rad * angleC) * scaleC;
    const yyy = yy + Math.cos(degrees * rad * angleC) * scaleC;

    const xxxx = xxx + Math.sin(degrees * rad * angleD) * (scaleD + repeatOffset);
    const yyyy = yyy + Math.cos(degrees * rad * angleD) * (scaleD + repeatOffset);

    const sx = xxxx * globalScale;
    const sy = yyyy * globalScale;

    pts.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
  }

  return "M " + pts.join(" ") + " Z";
}

function render() {
  // Clear SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("transform", "translate(320 320)");
  svg.appendChild(group);

  const repeatCount = state.repeatCount;
  const maxThickness = state.thickness;
  const strokeColor = state.strokeColor || "#000000";

  for (let step = 0; step <= repeatCount; step++) {
    const pathElem = document.createElementNS(svgNS, "path");
    pathElem.setAttribute("d", createPathData(step));
    pathElem.setAttribute("fill", "none");
    pathElem.setAttribute("stroke", strokeColor);

    let lineThickness = 1;
    if (maxThickness > 0 && repeatCount > 0) {
      lineThickness = (step * maxThickness) / repeatCount;
    }
    pathElem.setAttribute("stroke-width", lineThickness.toString());

    group.appendChild(pathElem);
  }
}

// ---------- BOOT ----------

initControls();
render();
