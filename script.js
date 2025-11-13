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
  scale: 100
};

const svg = document.getElementById("previewSvg");
const svgNS = "http://www.w3.org/2000/svg";

function updateLabel(id) {
  const span = document.querySelector(`.value[data-for="${id}"]`);
  if (!span) return;
  span.textContent = state[id];
}

function initControls() {
  const inputs = document.querySelectorAll('input[type="range"]');
  inputs.forEach(input => {
    const id = input.id;
    if (state.hasOwnProperty(id)) {
      input.value = state[id];
    } else {
      state[id] = parseInt(input.value, 10);
    }
    updateLabel(id);

    input.addEventListener("input", () => {
      state[id] = parseInt(input.value, 10);
      updateLabel(id);
      render();
    });
  });
}

function createPathData(stepIndex) {
  const count = 360 * 8;
  const rad = Math.PI / 180;
  const offset = state.offset / 500 * stepIndex;
  const repeatOffset = state.repeatOffset / 50 * stepIndex;

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
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", "640");
  rect.setAttribute("height", "640");
  rect.setAttribute("fill", "#ffffff");
  svg.appendChild(rect);

  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("transform", "translate(320 320)");
  svg.appendChild(group);

  const repeatCount = state.repeatCount;
  const maxThickness = state.thickness;

  for (let step = 0; step <= repeatCount; step++) {
    const pathElem = document.createElementNS(svgNS, "path");
    pathElem.setAttribute("d", createPathData(step));
    pathElem.setAttribute("fill", "none");
    pathElem.setAttribute("stroke", "#000");

    let lineThickness = 1;
    if (maxThickness > 0 && repeatCount > 0) {
      lineThickness = (step * maxThickness) / repeatCount;
    }

    pathElem.setAttribute("stroke-width", lineThickness.toString());
    group.appendChild(pathElem);
  }
}

initControls();
render();
