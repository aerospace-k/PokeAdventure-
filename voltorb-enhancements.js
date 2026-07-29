(() => {
  const DOCUMENT_FLAG = "voltorbEnhancementReady";
  const ROOT_CLASS = "voltorb-explorer-enhanced";
  const BOARD_CLASS = "voltorb-explorer-board";
  const CELL_CLASS = "voltorb-explorer-cell";
  const BEST_COMBO_KEY = "pokeAdventure.voltorb.bestCombo";
  const GUIDE_KEY = "pokeAdventure.voltorb.guideSeen";

  if (document.documentElement.dataset[DOCUMENT_FLAG] === "1") return;
  document.documentElement.dataset[DOCUMENT_FLAG] = "1";

  let currentRoot = null;
  let currentBoard = null;
  let combo = 0;
  let bestCombo = Number(localStorage.getItem(BEST_COMBO_KEY) || 0);
  let openCount = 0;
  let markedCount = 0;
  let refreshTimer = 0;
  const preparedCells = new WeakSet();
  const locallyMarked = new WeakSet();
  const pressTimers = new WeakMap();
  const suppressClickUntil = new WeakMap();

  const compactText = (element) => (element?.textContent || "").replace(/\s+/g, " ").trim();

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

    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      toast.style.setProperty("--voltorb-toast-x", `${Math.min(window.innerWidth - 24, Math.max(24, rect.left + rect.width / 2))}px`);
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
    hud.querySelector("[data-voltorb-combo]").textContent = String(combo);
    hud.querySelector("[data-voltorb-best]").textContent = String(bestCombo);
    hud.querySelector("[data-voltorb-marked]").textContent = String(markedCount);
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
      board.parentElement?.insertBefore(hud, board);
    }
    updateHud();

    if (!localStorage.getItem(GUIDE_KEY)) {
      localStorage.setItem(GUIDE_KEY, "1");
      window.setTimeout(() => showToast("탭으로 열고, 길게 눌러 위험 칸을 표시해요", "info"), 350);
    }
  }

  function isFailureCell(cell) {
    const value = `${cell.className} ${cell.getAttribute("aria-label") || ""} ${compactText(cell)}`.toLowerCase();
    return /mine|bomb|voltorb|찌리리공|폭발|실패/.test(value) && !/남은/.test(value);
  }

  function isOpenedCell(cell) {
    const value = `${cell.className} ${cell.getAttribute("aria-pressed") || ""}`.toLowerCase();
    return cell.disabled || /open|reveal|clear|safe|active/.test(value);
  }

  function toggleLocalMark(cell) {
    if (locallyMarked.has(cell)) {
      locallyMarked.delete(cell);
      cell.classList.remove("is-voltorb-marked");
      cell.removeAttribute("data-voltorb-mark");
      markedCount = Math.max(0, markedCount - 1);
      showToast("전기 표식을 해제했어요", "info", cell);
    } else {
      locallyMarked.add(cell);
      cell.classList.add("is-voltorb-marked");
      cell.dataset.voltorbMark = "위험 칸 표시";
      markedCount += 1;
      showToast("위험 칸에 전기 표식을 남겼어요", "success", cell);
      navigator.vibrate?.(22);
    }
    updateHud();
  }

  function prepareCell(cell, index) {
    cell.classList.add(CELL_CLASS);
    if (!cell.getAttribute("aria-label")) cell.setAttribute("aria-label", `${index + 1}번 탐색 칸`);
    if (preparedCells.has(cell)) return;
    preparedCells.add(cell);

    const cancelPress = () => {
      const timer = pressTimers.get(cell);
      if (timer) window.clearTimeout(timer);
      pressTimers.delete(cell);
      cell.classList.remove("is-pressing");
    };

    cell.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      cancelPress();
      cell.classList.add("is-pressing");
      const timer = window.setTimeout(() => {
        pressTimers.delete(cell);
        suppressClickUntil.set(cell, Date.now() + 650);
        cell.classList.remove("is-pressing");
        toggleLocalMark(cell);
      }, 520);
      pressTimers.set(cell, timer);
    }, { passive: true });

    cell.addEventListener("pointerup", cancelPress, { passive: true });
    cell.addEventListener("pointercancel", cancelPress, { passive: true });
    cell.addEventListener("pointerleave", cancelPress, { passive: true });
  }

  function handleBoardClick(event) {
    const cell = event.target.closest(`.${CELL_CLASS}`);
    if (!cell || !currentBoard?.contains(cell)) return;

    if (locallyMarked.has(cell) || Date.now() < (suppressClickUntil.get(cell) || 0)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showToast("표식 칸은 길게 눌러 해제한 뒤 열 수 있어요", "info", cell);
      return;
    }

    const before = `${cell.className}|${cell.disabled}|${cell.innerHTML}`;
    window.setTimeout(() => {
      if (!document.contains(cell)) return;
      const after = `${cell.className}|${cell.disabled}|${cell.innerHTML}`;
      if (before === after) return;

      if (isFailureCell(cell)) {
        combo = 0;
        currentRoot?.classList.add("voltorb-danger-pulse");
        window.setTimeout(() => currentRoot?.classList.remove("voltorb-danger-pulse"), 430);
        navigator.vibrate?.([70, 45, 85]);
        showToast("찌리리공 발견! 다음 칸은 단서를 보고 골라요", "danger", cell);
      } else if (isOpenedCell(cell)) {
        combo += 1;
        openCount += 1;
        bestCombo = Math.max(bestCombo, combo);
        localStorage.setItem(BEST_COMBO_KEY, String(bestCombo));
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
      openCount = 0;
      markedCount = 0;
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

  new MutationObserver(scheduleEnhance).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleEnhance, { passive: true });
  scheduleEnhance();
})();
