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
  thickness: 1,         // now 1–3
  strokeColor: "#ffffff" // default bright for dark background
};

const svg = document.getElementById("previewSvg");
const svgNS = "http://www.w3.org/2000/svg";

// ---------- VIEWBOX / PANNING / ZOOM ----------

let viewBox = { x: 0, y: 0, w: 640, h: 640 };
let isPanning = false;
let panStart = { x: 0, y: 0 };

const MIN_VIEWBOX_SIZE = 80;
const MAX_VIEWBOX_SIZE = 5000;
const ZOOM_FACTOR = 1.1;

function applyViewBox() {
  svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}

function initPanning() {
  svg.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    svg.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    const dxPx = e.clientX - panStart.x;
    const dyPx = e.clientY - panStart.y;

    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;

    viewBox.x -= dxPx * scaleX;
    viewBox.y -= dyPx * scaleY;

    panStart.x = e.clientX;
    panStart.y = e.clientY;

    applyViewBox();
  });

  window.addEventListener("mouseup", () => {
    if (!isPanning) return;
    isPanning = false;
    svg.style.cursor = "grab";
  });

  window.addEventListener("mouseleave", () => {
    if (!isPanning) return;
    isPanning = false;
    svg.style.cursor = "grab";
  });
}

function initZoom() {
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const relX = mouseX / rect.width;
      const relY = mouseY / rect.height;

      const worldX = viewBox.x + relX * viewBox.w;
      const worldY = viewBox.y + relY * viewBox.h;

      const zoomIn = e.deltaY < 0;
      let factor = zoomIn ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

      let newW = viewBox.w * factor;
      let newH = viewBox.h * factor;

      const size = Math.max(newW, newH);
      if (size < MIN_VIEWBOX_SIZE) {
        const ratio = MIN_VIEWBOX_SIZE / size;
        newW *= ratio;
        newH *= ratio;
      } else if (size > MAX_VIEWBOX_SIZE) {
        const ratio = MAX_VIEWBOX_SIZE / size;
        newW *= ratio;
        newH *= ratio;
      }

      viewBox.w = newW;
      viewBox.h = newH;

      viewBox.x = worldX - relX * viewBox.w;
      viewBox.y = worldY - relY * viewBox.h;

      applyViewBox();
    },
    { passive: false }
  );
}

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
      strokeColor: "#99ddff"
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
      strokeColor: "#88ff88"
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
      strokeColor: "#ff8888"
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
  inputs.forEach((input) => {
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
  inputs.forEach((input) => {
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
  initPanning();
  initZoom();
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

  viewBox = { x: 0, y: 0, w: 640, h: 640 };
  applyViewBox();

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

  // thickness now bounded 1–3
  state.thickness = randomInt(1, 3);

  const linePalette = ["#99ddff", "#ff8888", "#88ff88", "#ffc966", "#ddb3ff", "#66ffff"];
  state.strokeColor = randomChoice(linePalette);

  viewBox = { x: 0, y: 0, w: 640, h: 640 };
  applyViewBox();
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

// ---------- DOWNLOAD (TIGHT BBOX, NO BG) ----------

function initDownloadButton() {
  const button = document.getElementById("downloadSvg");
  if (!button) return;
  button.addEventListener("click", downloadSVG);
}

function downloadSVG() {
  const serializer = new XMLSerializer();

  const patternGroup = svg.querySelector("#patternGroup");
  let clone = svg.cloneNode(true);

  if (patternGroup) {
    const bbox = patternGroup.getBBox();
    const maxThickness = Math.max(state.thickness, 1);

    const minX = bbox.x - maxThickness;
    const minY = bbox.y - maxThickness;
    const maxX = bbox.x + bbox.width + maxThickness;
    const maxY = bbox.y + bbox.height + maxThickness;

    const vbX = minX;
    const vbY = minY;
    const vbW = maxX - minX;
    const vbH = maxY - minY;

    clone.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
    clone.removeAttribute("width");
    clone.removeAttribute("height");
  }

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

    const sx = xxxx;
    const sy = yyyy;

    pts.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
  }

  return "M " + pts.join(" ") + " Z";
}

function render() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("id", "patternGroup");
  group.setAttribute("transform", "translate(320 320)");
  svg.appendChild(group);

  const repeatCount = state.repeatCount;
  const maxThickness = state.thickness;
  const strokeColor = state.strokeColor || "#ffffff";

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

applyViewBox();
initControls();
render();
