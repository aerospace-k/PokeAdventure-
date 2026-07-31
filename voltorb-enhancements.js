(() => {
  const DOCUMENT_FLAG = "voltorbEnhancementReady";
  const ROOT_CLASS = "voltorb-explorer-enhanced";
  const BOARD_CLASS = "voltorb-explorer-board";
  const CELL_CLASS = "voltorb-explorer-cell";
  const BEST_COMBO_KEY = "pokeAdventure.voltorb.bestCombo";
  const GUIDE_KEY = "pokeAdventure.voltorb.guideSeen";

  if (document.documentElement.dataset[DOCUMENT_FLAG] === "1") return;
  document.documentElement.dataset[DOCUMENT_FLAG] = "1";

  const safeGet = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* storage may be unavailable */ }
  };

  let currentRoot = null;
  let currentBoard = null;
  let combo = 0;
  const storedBestCombo = Number(safeGet(BEST_COMBO_KEY) || 0);
  let bestCombo = Number.isFinite(storedBestCombo) && storedBestCombo >= 0 ? Math.floor(storedBestCombo) : 0;
  let refreshTimer = 0;

  function findGameRoot() {
    const root = document.getElementById("screen-mine");
    return root?.classList.contains("active") ? root : null;
  }

  function findBoard(root) {
    if (!root) return null;
    const board = root.querySelector("#mineBoard");
    if (!board) return null;
    const cells = [...board.children].filter((child) => child.matches("button.mine-cell"));
    return cells.length >= 25 ? board : null;
  }

  function boardCells(board) {
    if (!board) return [];
    return [...board.children].filter((child) => child.matches("button.mine-cell"));
  }

  function showToast(message, kind = "info", anchor = null) {
    if (!currentRoot) return;
    currentRoot.querySelectorAll(".voltorb-feedback-toast").forEach((toast) => toast.remove());
    const toast = document.createElement("div");
    toast.className = `voltorb-feedback-toast is-${kind}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span class="voltorb-feedback-icon" aria-hidden="true">${kind === "success" ? "⚡" : kind === "danger" ? "!" : "◎"}</span><strong>${message}</strong>`;
    currentRoot.appendChild(toast);

    const canAnchor = anchor && window.matchMedia("(min-width: 681px) and (pointer: fine)").matches;
    if (canAnchor) {
      const rect = anchor.getBoundingClientRect();
      const toastWidth = Math.min(toast.offsetWidth || 280, window.innerWidth - 28);
      const edge = toastWidth / 2 + 14;
      toast.style.setProperty("--voltorb-toast-x", `${Math.min(window.innerWidth - edge, Math.max(edge, rect.left + rect.width / 2))}px`);
      toast.style.setProperty("--voltorb-toast-y", `${Math.max(90, rect.top - 12)}px`);
      toast.classList.add("is-anchored");
    }

    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, kind === "danger" ? 1500 : 1050);
  }

  function updateHud() {
    const hud = currentRoot?.querySelector(".voltorb-enhancement-hud");
    if (!hud) return;
    const values = [
      ["[data-voltorb-combo]", String(combo)],
      ["[data-voltorb-best]", String(bestCombo)],
      ["[data-voltorb-marked]", String(currentBoard?.querySelectorAll(".mine-cell.flagged").length || 0)]
    ];
    values.forEach(([selector, value]) => {
      const output = hud.querySelector(selector);
      if (output && output.textContent !== value) output.textContent = value;
    });
    hud.classList.toggle("has-combo", combo >= 3);
  }

  function ensureHud(root, board) {
    let hud = root.querySelector(".voltorb-enhancement-hud");
    if (!hud) {
      hud = document.createElement("div");
      hud.className = "voltorb-enhancement-hud";
      hud.setAttribute("aria-label", "찌리리공 탐색 상태");
      hud.innerHTML = `
        <span class="voltorb-hud-chip is-combo">⚡ 콤보 <b data-voltorb-combo>0</b></span>
        <span class="voltorb-hud-chip">최고 <b data-voltorb-best>${bestCombo}</b></span>
        <span class="voltorb-hud-chip">표식 <b data-voltorb-marked>0</b></span>
        <span class="voltorb-touch-guide">탭: 열기 · 길게: 전기 표식</span>
      `;
      const frame = board.parentElement;
      frame?.parentElement?.insertBefore(hud, frame);
    }
    updateHud();

    if (!safeGet(GUIDE_KEY)) {
      safeSet(GUIDE_KEY, "1");
      window.setTimeout(() => showToast("탭으로 열고, 길게 눌러 위험 칸을 표시해요", "info"), 350);
    }
  }

  function prepareCell(cell, index) {
    cell.classList.add(CELL_CLASS);
    if (!cell.getAttribute("aria-label")) cell.setAttribute("aria-label", `${index + 1}번 탐색 칸`);
  }

  function handleBoardClick(event) {
    const cell = event.target.closest(`.${CELL_CLASS}`);
    if (!cell || !currentBoard?.contains(cell)) return;

    const before = `${cell.className}|${cell.disabled}|${cell.innerHTML}`;
    window.setTimeout(() => {
      if (!document.contains(cell)) return;
      const after = `${cell.className}|${cell.disabled}|${cell.innerHTML}`;
      if (before === after) return;
      const hitVoltorb = cell.classList.contains("mine-hit");
      const safeOpened = cell.classList.contains("revealed") && !hitVoltorb;

      if (hitVoltorb) {
        combo = 0;
        navigator.vibrate?.([70, 45, 85]);
      } else if (safeOpened) {
        combo += 1;
        bestCombo = Math.max(bestCombo, combo);
        safeSet(BEST_COMBO_KEY, String(bestCombo));
        cell.classList.add("is-voltorb-success");
        window.setTimeout(() => cell.classList.remove("is-voltorb-success"), 520);
        navigator.vibrate?.(combo >= 3 ? [18, 24, 18] : 16);
        showToast(combo >= 3 ? `전기 콤보 ${combo}! 탐색 흐름이 좋아요` : "안전한 칸이에요", "success", cell);
      }
      updateHud();
    }, 80);
  }

  function enhance() {
    const root = findGameRoot();
    const board = findBoard(root);
    if (!root || !board) return;

    if (currentRoot !== root || currentBoard !== board) {
      currentRoot = root;
      currentBoard = board;
      combo = 0;
      board.addEventListener("click", handleBoardClick, true);
    }

    root.classList.add(ROOT_CLASS);
    board.classList.add(BOARD_CLASS);
    const cells = boardCells(board);
    const columns = Math.max(5, Math.round(Math.sqrt(cells.length)));
    board.style.setProperty("--voltorb-board-columns", String(columns));
    board.dataset.voltorbCells = String(cells.length);
    cells.forEach(prepareCell);
    ensureHud(root, board);
  }

  function scheduleEnhance() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(enhance, 70);
  }

  const observationRoot = document.getElementById("screen-mine") || document.body;
  new MutationObserver(scheduleEnhance).observe(observationRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", scheduleEnhance, { passive: true });
  scheduleEnhance();
})();
