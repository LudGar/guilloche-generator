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
  strokeColor: "#000000",
  strokeAlpha: 1,
  bgColor: "#ffffff",
  bgAlpha: 1
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
      strokeColor: "#004488",
      strokeAlpha: 1,
      bgColor: "#ffffff",
      bgAlpha: 1
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
      strokeColor: "#008800",
      strokeAlpha: 0.9,
      bgColor: "#f3f7ff",
      bgAlpha: 1
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
      strokeColor: "#880000",
      strokeAlpha: 1,
      bgColor: "#ffffff",
      bgAlpha: 1
    }
  }
];

let customPresets = [];

// ---------- HELPERS ----------

function hexToRgb(hex) {
  let h = hex.trim();
  if (h[0] === "#") h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return { r, g, b };
}

function rgbaFromState(colorKey, alphaKey) {
  const { r, g, b } = hexToRgb(state[colorKey] || "#000000");
  let a = Number(state[alphaKey]);
  if (Number.isNaN(a)) a = 1;
  if (a < 0) a = 0;
  if (a > 1) a = 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ---------- UI INIT ----------

function updateLabel(id) {
  const span = document.querySelector(`.value[data-for="${id}"]`);
  if (!span) return;
  span.textContent = state[id];
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
      } else {
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
    if (Array.isArray(parsed)) {
      customPresets = parsed;
    } else {
      customPresets = [];
    }
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
  if (kind === "built") {
    return builtInPresets[idx] || null;
  }
  if (kind === "custom") {
    return customPresets[idx] || null;
  }
  return null;
}

function applyPreset(preset) {
  if (!preset || !preset.state) return;
  const newState = JSON.parse(JSON.stringify(preset.state));
  Object.assign(state, newState);

  const inputs = document.querySelectorAll('input[type="range"], input[type="color"]');
  inputs.forEach(input => {
    const id = input.id;
    if (state.hasOwnProperty(id)) {
      input.value = state[id];
      updateLabel(id);
    }
  });

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
      if (kind === "custom") {
        if (idx >= 0 && idx < customPresets.length) {
          const [removed] = customPresets.splice(idx, 1);
          saveCustomPresets();
          repopulatePresetSelect();
          alert(`Deleted preset: ${removed.name}`);
        }
      }
    });
  }
}

// ---------- DOWNLOAD ----------

function initDownloadButton() {
  const button = document.getElementById("downloadSvg");
  if (!button) return;
  button.addEventListener("click", downloadSVG);
}

function downloadSVG() {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
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
  const preview = document.querySelector(".preview");
  const bgCss = rgbaFromState("bgColor", "bgAlpha");

  // Fill whole right side with background color (with alpha)
  if (preview) {
    preview.style.background = bgCss;
  }

  // Clear SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Background rect inside SVG (also with alpha)
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", "640");
  rect.setAttribute("height", "640");
  rect.setAttribute("fill", bgCss);
  svg.appendChild(rect);

  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("transform", "translate(320 320)");
  svg.appendChild(group);

  const repeatCount = state.repeatCount;
  const maxThickness = state.thickness;
  const strokeCss = rgbaFromState("strokeColor", "strokeAlpha");

  for (let step = 0; step <= repeatCount; step++) {
    const pathElem = document.createElementNS(svgNS, "path");
    pathElem.setAttribute("d", createPathData(step));
    pathElem.setAttribute("fill", "none");
    pathElem.setAttribute("stroke", strokeCss);

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
