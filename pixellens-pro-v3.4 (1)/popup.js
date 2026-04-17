const SUPABASE_URL = "https://iltehbidzqrpusfebkcb.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdGVoYmlkenFycHVzZmVia2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzM0OTYsImV4cCI6MjA5MTg0OTQ5Nn0.Z7vomWHsog3Dx7Kwa5A5YzVmNbSkO-fnXOm8g1oj1YA";
const DASHBOARD_URL = "http://localhost:8080"; // or your deployed URL

let designFile = null;
let implDataUrl = null;
let analysisResult = null;
let currentTabUrl = null;

// ── Auto-capture current tab on popup open ──
(async function captureTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabUrl = tab?.url || null;
    document.getElementById("tab-url").textContent = tab?.url ? new URL(tab.url).hostname : "Unknown";
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });
    implDataUrl = dataUrl;
    document.getElementById("tab-preview").src = dataUrl;
    checkReady();
  } catch (e) {
    document.getElementById("tab-url").textContent = "⚠ Could not capture (try a regular webpage)";
    console.error("Capture failed:", e);
  }
})();

// ── Design input handling ──
const designInput = document.getElementById("design-input");
const designBox = document.getElementById("design-box");
const analyzeBtn = document.getElementById("analyze-btn");

designBox.addEventListener("click", () => designInput.click());

designInput.addEventListener("change", (e) => {
  designFile = e.target.files[0];
  if (designFile) {
    showPreview(URL.createObjectURL(designFile));
  }
  checkReady();
});

// ── Dashboard buttons ──
document.getElementById("dashboard-btn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

function showPreview(src) {
  const img = document.getElementById("design-preview");
  const ph = document.getElementById("design-placeholder");
  img.src = src; img.hidden = false; ph.hidden = true;
  designBox.classList.add("has-image");
}

function checkReady() {
  analyzeBtn.disabled = !(designFile && implDataUrl);
}

// ── Analyze ──
analyzeBtn.addEventListener("click", runAnalysis);

async function runAnalysis() {
  const btnText = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const errorEl = document.getElementById("error-msg");
  errorEl.hidden = true;
  btnText.textContent = "Analyzing...";
  btnLoader.hidden = false;
  analyzeBtn.disabled = true;

  try {
    const designB64 = await fileToBase64(designFile);
    const implB64 = implDataUrl.split(",")[1];
    const implDims = await getImageDimsFromUrl(implDataUrl);
    const implImg = await loadImageFromUrl(implDataUrl);
    const designImg = await loadImage(designFile);
    const { diffStats } = await computePixelDiff(designImg, implImg);

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-ui`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}` },
      body: JSON.stringify({ designBase64: designB64, implBase64: implB64, diffStats, imageWidth: implDims.width, imageHeight: implDims.height }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      throw new Error(err.error || `Request failed: ${resp.status}`);
    }

    analysisResult = await resp.json();
    if (analysisResult.error) throw new Error(analysisResult.error);
    renderResults(analysisResult, designImg, implImg, implDims);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.hidden = false;
  } finally {
    btnText.textContent = "Analyze";
    btnLoader.hidden = true;
    checkReady();
  }
}

// ── Utils ──
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function getImageDimsFromUrl(url) {
  return new Promise((res) => { const img = new Image(); img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight }); img.src = url; });
}
function loadImageFromUrl(url) {
  return new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = url; });
}
function loadImage(file) {
  return new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = URL.createObjectURL(file); });
}

async function computePixelDiff(dImg, iImg) {
  const w = Math.min(dImg.naturalWidth, iImg.naturalWidth);
  const h = Math.min(dImg.naturalHeight, iImg.naturalHeight);
  const c1 = new OffscreenCanvas(w, h);
  const c2 = new OffscreenCanvas(w, h);
  const ctx1 = c1.getContext("2d"); ctx1.drawImage(dImg, 0, 0, w, h);
  const ctx2 = c2.getContext("2d"); ctx2.drawImage(iImg, 0, 0, w, h);
  const d1 = ctx1.getImageData(0, 0, w, h).data;
  const d2 = ctx2.getImageData(0, 0, w, h).data;

  let totalDiff = 0, mismatchPx = 0;
  for (let i = 0; i < d1.length; i += 4) {
    const dr = Math.abs(d1[i] - d2[i]);
    const dg = Math.abs(d1[i+1] - d2[i+1]);
    const db = Math.abs(d1[i+2] - d2[i+2]);
    const diff = (dr + dg + db) / 3;
    totalDiff += diff;
    if (diff > 15) mismatchPx++;
  }

  const pixels = (w * h) || 1;
  return {
    diffStats: { matchPercent: ((1 - mismatchPx / pixels) * 100).toFixed(1), avgDiff: (totalDiff / pixels).toFixed(2), mismatchPixels: mismatchPx, totalPixels: pixels },
  };
}

// ── Location description helper ──
function describeLocation(x, y, w, h, imgW, imgH) {
  const cx = x + w / 2, cy = y + h / 2;
  let vPos = "middle", hPos = "center";
  if (cy < imgH * 0.33) vPos = "top";
  else if (cy > imgH * 0.66) vPos = "bottom";
  if (cx < imgW * 0.33) hPos = "left";
  else if (cx > imgW * 0.66) hPos = "right";

  const region = vPos === "middle" ? (hPos === "center" ? "center" : `center-${hPos}`) : (hPos === "center" ? vPos : `${vPos}-${hPos}`);
  const pctX = Math.round((cx / imgW) * 100);
  const pctY = Math.round((cy / imgH) * 100);
  return { region, pctX, pctY, description: `${region.replace(/-/g, " ")} area — ${pctX}% from left, ${pctY}% from top` };
}

// ══════════════════════════════════════
// ── Render Results ──
// ══════════════════════════════════════
function renderResults(result, designImg, implImg, dims) {
  document.getElementById("results-section").hidden = false;

  const score = result.overallScore || 0;
  document.getElementById("score-value").textContent = score;
  document.getElementById("score-circle").className = "score-circle " + (score >= 80 ? "good" : score >= 50 ? "ok" : "bad");

  const scores = result.scores || {};
  document.getElementById("s-layout").textContent = scores.layout ?? "--";
  document.getElementById("s-typo").textContent = scores.typography ?? "--";
  document.getElementById("s-colors").textContent = scores.colors ?? "--";
  document.getElementById("s-spacing").textContent = scores.spacing ?? "--";
  document.getElementById("summary").textContent = result.summary || "";

  const annotations = result.annotations || [];

  // Visual: side-by-side + slider
  drawSideBySide(designImg, implImg, dims);
  setupSlider(designImg, implImg, dims);

  // Developer: annotated canvas + issue cards
  drawAnnotatedCanvas(implImg, annotations, dims);
  renderIssueCards(annotations, dims);
  renderA11y(result.accessibilityIssues || []);

  setupModeToggle();
  setupFilters(annotations);
}

// ── Visual: Side-by-Side ──
function drawSideBySide(designImg, implImg, dims) {
  const w = dims.width, h = dims.height;
  const dc = document.getElementById("design-display");
  dc.width = w; dc.height = h;
  dc.getContext("2d").drawImage(designImg, 0, 0, w, h);
  const ic = document.getElementById("impl-display");
  ic.width = w; ic.height = h;
  ic.getContext("2d").drawImage(implImg, 0, 0, w, h);
}

// ── Visual: Slider ──
function setupSlider(designImg, implImg, dims) {
  const canvas = document.getElementById("slider-canvas");
  const w = dims.width, h = dims.height;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("slider-range");

  function draw(pct) {
    const split = Math.round(w * pct / 100);
    ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, split, h); ctx.clip();
    ctx.drawImage(designImg, 0, 0, w, h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(split, 0, w - split, h); ctx.clip();
    ctx.drawImage(implImg, 0, 0, w, h); ctx.restore();
    // Divider
    ctx.strokeStyle = "#818cf8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(split, 0); ctx.lineTo(split, h); ctx.stroke();
    // Handle
    ctx.fillStyle = "#818cf8";
    ctx.beginPath(); ctx.roundRect(split - 12, h / 2 - 16, 24, 32, 6); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif";
    ctx.fillText("⇔", split - 8, h / 2 + 5);
  }
  slider.addEventListener("input", (e) => draw(Number(e.target.value)));
  draw(50);
}

// ══════════════════════════════════════
// ── Developer: Annotated Canvas ──
// ══════════════════════════════════════
const SEV_COLORS = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };

let currentAnnotations = [];
let currentDims = {};

function drawAnnotatedCanvas(implImg, annotations, dims) {
  currentAnnotations = annotations;
  currentDims = dims;

  const canvas = document.getElementById("dev-annotated-canvas");
  const w = dims.width, h = dims.height;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  // Draw implementation screenshot
  ctx.drawImage(implImg, 0, 0, w, h);

  // Dim overlay
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, w, h);

  annotations.forEach((a, i) => {
    const color = SEV_COLORS[a.severity] || "#818cf8";

    // Highlight fill
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fillRect(a.x, a.y, a.width, a.height);
    ctx.restore();

    // Dashed border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(a.x, a.y, a.width, a.height);
    ctx.setLineDash([]);

    // Numbered badge at top-left of region
    const label = `${i + 1}`;
    ctx.font = "bold 11px system-ui, sans-serif";
    const tw = ctx.measureText(label).width + 10;
    const bh = 18;
    const bx = a.x, by = Math.max(a.y - bh - 2, 2);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw, bh, 4);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText(label, bx + 5, by + 13);
  });

  // Tooltip on hover
  const tooltip = document.getElementById("dev-tooltip");
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width, scaleY = h / rect.height;
    const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
    const hit = annotations.find(a => mx >= a.x && mx <= a.x + a.width && my >= a.y && my <= a.y + a.height);
    if (hit) {
      const loc = describeLocation(hit.x, hit.y, hit.width, hit.height, w, h);
      const color = SEV_COLORS[hit.severity] || "#818cf8";
      tooltip.innerHTML = `
        <div class="tt-title">${hit.element}</div>
        <span class="tt-sev" style="background:${color}30;color:${color}">${hit.category} · ${hit.severity}</span>
        <div class="tt-row"><strong>Issue:</strong> ${hit.issue}</div>
        <div class="tt-row"><strong>Expected:</strong> ${hit.expected}</div>
        <div class="tt-row"><strong>Found:</strong> ${hit.found}</div>
        <div class="tt-location">📍 ${loc.description}</div>
        ${hit.fix ? `<div class="tt-fix">💡 ${hit.fix}</div>` : ""}
      `;
      tooltip.hidden = false;
      tooltip.style.left = Math.min(e.clientX - rect.left + 12, rect.width - 270) + "px";
      tooltip.style.top = (e.clientY - rect.top + 12) + "px";
    } else {
      tooltip.hidden = true;
    }
  };
  canvas.onmouseleave = () => { tooltip.hidden = true; };
}

// ── Developer: Issue Cards ──
function renderIssueCards(annotations, dims) {
  const list = document.getElementById("issues-list");
  list.innerHTML = "";

  annotations.forEach((a, i) => {
    const loc = describeLocation(a.x, a.y, a.width, a.height, dims.width, dims.height);
    const card = document.createElement("div");
    card.className = `issue-card ${a.severity}`;
    card.dataset.severity = a.severity;
    card.dataset.index = i;
    card.innerHTML = `
      <div class="ic-header">
        <div style="display:flex;align-items:center">
          <span class="ic-num ${a.severity}">${i + 1}</span>
          <span class="ic-element">${a.element}</span>
        </div>
        <span class="ic-badge ${a.severity}">${a.severity}</span>
      </div>
      <div class="ic-issue">${a.issue}</div>
      <div class="ic-location">
        <span class="ic-location-icon">📍</span>
        ${loc.description}
        <span class="ic-location-dims">${a.width}×${a.height}px</span>
      </div>
      <div class="ic-detail">
        <div class="ic-detail-row">
          <span class="ic-detail-label">Expected</span>
          <span class="ic-detail-val">${a.expected}</span>
        </div>
        <div class="ic-detail-row">
          <span class="ic-detail-label">Found</span>
          <span class="ic-detail-val">${a.found}</span>
        </div>
      </div>
      ${a.fix ? `
        <div class="ic-fix-wrap">
          <div class="ic-fix-label">💡 Suggested Fix</div>
          <div class="ic-fix-text">${a.fix}</div>
        </div>
      ` : ""}
    `;

    // Click to highlight on annotated canvas
    card.addEventListener("click", () => {
      document.querySelectorAll(".issue-card").forEach(c => c.classList.remove("highlighted"));
      card.classList.add("highlighted");
      highlightAnnotation(i, a);
    });

    list.appendChild(card);
  });
}

function highlightAnnotation(index, annotation) {
  const canvas = document.getElementById("dev-annotated-canvas");
  const ctx = canvas.getContext("2d");
  // Flash highlight
  ctx.save();
  ctx.strokeStyle = "#818cf8";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.strokeRect(annotation.x - 3, annotation.y - 3, annotation.width + 6, annotation.height + 6);
  ctx.fillStyle = "rgba(129, 140, 248, 0.2)";
  ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
  ctx.restore();
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Accessibility ──
function renderA11y(issues) {
  const list = document.getElementById("a11y-list");
  list.innerHTML = "";
  if (!issues.length) {
    list.innerHTML = '<p style="font-size:12px;color:#52525b;padding:8px">✅ No accessibility issues detected</p>';
    return;
  }
  issues.forEach((a) => {
    const card = document.createElement("div");
    card.className = `issue-card ${a.severity || "medium"}`;
    card.innerHTML = `
      <div class="ic-header">
        <span class="ic-element">♿ ${a.element || "Element"}</span>
        <span class="ic-badge ${a.severity || "medium"}">${a.severity || "medium"}</span>
      </div>
      <div class="ic-issue">${a.issue}</div>
      ${a.fix ? `<div class="ic-fix-wrap"><div class="ic-fix-label">💡 Suggested Fix</div><div class="ic-fix-text">${a.fix}</div></div>` : ""}
    `;
    list.appendChild(card);
  });
}

// ── Mode toggle & filters ──
function setupModeToggle() {
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.dataset.mode;
      document.getElementById("visual-view").hidden = mode !== "visual";
      document.getElementById("developer-view").hidden = mode !== "developer";
    });
  });
}

function setupFilters(annotations) {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      document.querySelectorAll(".issue-card").forEach(card => {
        card.style.display = (filter === "all" || card.dataset.severity === filter) ? "" : "none";
      });
    });
  });
}

// ── Export ──
document.getElementById("export-json")?.addEventListener("click", () => {
  if (!analysisResult) return;
  const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: "application/json" });
  downloadBlob(blob, "pixellens-report.json");
});
document.getElementById("export-csv")?.addEventListener("click", () => {
  if (!analysisResult?.annotations) return;
  const rows = [["#","Element","Category","Severity","Issue","Expected","Found","Fix","Location","X","Y","W","H"]];
  analysisResult.annotations.forEach((a, i) => {
    const loc = describeLocation(a.x, a.y, a.width, a.height, 1280, 800);
    rows.push([i+1, a.element, a.category, a.severity, a.issue, a.expected, a.found, a.fix||"", loc.description, a.x, a.y, a.width, a.height]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), "pixellens-report.csv");
});

document.getElementById("export-dashboard-btn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

document.getElementById("add-dashboard-btn")?.addEventListener("click", () => {
  if (!analysisResult) return;
  const pending = {
    ...analysisResult,
    createdAt: Date.now(),
    pageUrl: currentTabUrl || undefined,
    domain: (() => {
      try {
        return currentTabUrl ? new URL(currentTabUrl).hostname : undefined;
      } catch {
        return undefined;
      }
    })(),
  };

  chrome.tabs.create({ url: `${DASHBOARD_URL}/add-scan` }, (tab) => {
    const tabId = tab?.id;
    if (!tabId) return;

    const onUpdated = (updatedTabId, info) => {
      if (updatedTabId !== tabId) return;
      if (info.status !== "complete") return;
      chrome.tabs.onUpdated.removeListener(onUpdated);

      chrome.scripting.executeScript({
        target: { tabId },
        func: (data) => {
          localStorage.setItem("pixellens_pending_analysis", JSON.stringify(data));
        },
        args: [pending],
      });
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
});

function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
