(() => {
  "use strict";

  const trainers = [
    ["레드","red.png","관동"],["이슬","misty.png","관동"],["웅이","brock.png","관동"],
    ["세레나","serena.png","칼로스"],["빛나","dawn.png","신오"],["봄이","may.png","호연"],
    ["릴리에","lillie.png","알로라"],["그린","blue.png","관동"],["로켓단 로사·로이","./assets/team-rocket-jessie-james-modern.png","로켓단"],
    ["리프","leaf-gen3.png","관동"],["휘웅","brendan.png","호연"],["광휘","lucas.png","신오"],
    ["투희","hilda.png","하나"],["명희","rosa.png","하나"],["투지","hilbert.png","하나"],
    ["공명","nate.png","하나"],["칼름","calem.png","칼로스"],["미월","selene.png","알로라"],
    ["영태","elio.png","알로라"]
  ];
  const spriteBase = "https://play.pokemonshowdown.com/sprites/trainers/";

  function enhance(overlay) {
    if (!(overlay instanceof HTMLElement) || overlay.dataset.trainerUnlockEnhanced === "true") return;
    const levelText = overlay.querySelector(".level-up-badge strong")?.textContent || "";
    const level = Number(levelText.replace(/\D/g,""));
    const trainer = level % 5 === 0 ? trainers[level / 5 - 1] : undefined;
    if (!trainer) return;
    overlay.dataset.trainerUnlockEnhanced = "true";
    const panel = overlay.querySelector(".level-up-popup");
    panel?.classList.add("trainer-unlock-popup");
    const label = overlay.querySelector(".level-up-label");
    const heading = overlay.querySelector(".level-up-popup h2");
    const message = overlay.querySelector(".level-up-popup > p");
    if (label) label.textContent = "NEW TRAINER";
    if (heading) heading.textContent = trainer[0] + " 트레이너 획득!";
    if (message) message.textContent = "Lv." + level + " 달성 보상으로 새로운 동료를 만났어요.";

    const hero = overlay.querySelector(".level-up-pokemon");
    if (hero) {
      const media = document.createElement("span");
      media.className = "trainer-discovery-media";
      const fallback = document.createElement("span");
      fallback.textContent = trainer[0];
      const image = document.createElement("img");
      image.src = trainer[1].startsWith("./assets/") ? trainer[1] : spriteBase + trainer[1];
      image.alt = trainer[0] + " 트레이너";
      image.loading = "eager";
      image.decoding = "async";
      image.addEventListener("error",() => image.remove(),{once:true});
      media.append(fallback,image);
      hero.replaceChildren(media);
    }
    const rewardLabel = overlay.querySelector(".level-up-reward-box span");
    const rewardText = overlay.querySelector(".level-up-reward-box strong");
    if (rewardLabel) rewardLabel.textContent = "새로운 트레이너";
    if (rewardText) rewardText.textContent = trainer[0] + " · " + trainer[2];
    const close = overlay.querySelector(".level-up-continue");
    if (close) close.textContent = "새 동료와 모험하기";
  }

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(".level-up-overlay")) enhance(node);
      node.querySelectorAll(".level-up-overlay").forEach(enhance);
    }));
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll(".level-up-overlay").forEach(enhance);
})();
