"use strict";
const nativeSetInterval = window.setInterval.bind(window);
const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
let lifecycleHiddenAt = document.hidden ? performance.now() : null;
let lifecycleAnimationOffset = 0;
let lifecycleFrameSequence = 0;
const lifecycleFrames = new Map();
function lifecycleNow() {
    return performance.now() - lifecycleAnimationOffset;
}
function appSetInterval(handler, timeout, ...args) {
    return nativeSetInterval(() => {
        if (!document.hidden && typeof handler === "function")
            handler(...args);
    }, timeout);
}
function appRequestAnimationFrame(callback) {
    const frameId = ++lifecycleFrameSequence;
    const run = (timestamp) => {
        if (!lifecycleFrames.has(frameId))
            return;
        if (document.hidden) {
            lifecycleFrames.set(frameId, nativeRequestAnimationFrame(run));
            return;
        }
        lifecycleFrames.delete(frameId);
        callback(timestamp - lifecycleAnimationOffset);
    };
    lifecycleFrames.set(frameId, nativeRequestAnimationFrame(run));
    return frameId;
}
function appCancelAnimationFrame(frameId) {
    const nativeFrameId = lifecycleFrames.get(frameId);
    if (nativeFrameId !== undefined)
        nativeCancelAnimationFrame(nativeFrameId);
    lifecycleFrames.delete(frameId);
}
document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("app-background-paused", document.hidden);
    if (document.hidden) {
        lifecycleHiddenAt = performance.now();
        return;
    }
    if (lifecycleHiddenAt !== null)
        lifecycleAnimationOffset += performance.now() - lifecycleHiddenAt;
    lifecycleHiddenAt = null;
});
const POKEMON_CATALOG = [
    { id: 25, name: "피카츄" }, { id: 133, name: "이브이" }, { id: 4, name: "파이리" },
    { id: 1, name: "이상해씨" }, { id: 7, name: "꼬부기" }, { id: 151, name: "뮤" },
    { id: 143, name: "잠만보" }, { id: 37, name: "식스테일" }, { id: 54, name: "고라파덕" },
    { id: 129, name: "잉어킹" }, { id: 131, name: "라프라스" }, { id: 132, name: "메타몽" },
    { id: 39, name: "푸린" }, { id: 52, name: "나옹" }, { id: 79, name: "야돈" },
    { id: 92, name: "고오스" }, { id: 81, name: "코일" }, { id: 147, name: "미뇽" },
    { id: 137, name: "폴리곤" }, { id: 104, name: "탕구리" }, { id: 63, name: "캐이시" },
    { id: 10, name: "캐터피" }, { id: 144, name: "프리져" }, { id: 145, name: "썬더" },
    { id: 146, name: "파이어" }, { id: 150, name: "뮤츠" }, { id: 83, name: "파오리" },
    { id: 127, name: "쁘사이저" }, { id: 123, name: "스라크" }, { id: 77, name: "포니타" },
    { id: 778, name: "따라큐" }, { id: 722, name: "나몰빼미" }, { id: 872, name: "누니머기" },
    { id: 393, name: "팽도리" }, { id: 387, name: "모부기" }, { id: 479, name: "로토무" },
    { id: 403, name: "꼬링크" }, { id: 653, name: "푸호꼬" }, { id: 704, name: "미끄메라" },
    { id: 677, name: "냐스퍼" }, { id: 674, name: "판짱" }, { id: 656, name: "개구마르" },
    { id: 447, name: "리오르" }, { id: 570, name: "조로아" }, { id: 885, name: "드라꼰" },
    { id: 821, name: "파라꼬" }, { id: 328, name: "톱치" }, { id: 27, name: "모래두지" },
    { id: 280, name: "랄토스" }, { id: 607, name: "불켜미" }, { id: 679, name: "단칼빙" },
    { id: 744, name: "암멍이" }, { id: 255, name: "아차모" }, { id: 252, name: "나무지기" },
    { id: 258, name: "물짱이" }, { id: 446, name: "먹고자" }, { id: 417, name: "파치리스" },
    { id: 399, name: "비버니" }, { id: 29, name: "니드런♀" }, { id: 90, name: "셀러" },
    { id: 58, name: "가디" }, { id: 35, name: "삐삐" }, { id: 95, name: "롱스톤" },
    { id: 142, name: "프테라" }, { id: 113, name: "럭키" }, { id: 115, name: "캥카" },
    { id: 125, name: "에레브" }, { id: 126, name: "마그마" }, { id: 50, name: "디그다" },
    { id: 128, name: "켄타로" }, { id: 66, name: "알통몬" }, { id: 74, name: "꼬마돌" },
    { id: 120, name: "별가사리" }, { id: 116, name: "쏘드라" }, { id: 111, name: "뿔카노" },
    { id: 100, name: "찌리리공" }, { id: 138, name: "암나이트" }, { id: 140, name: "투구" },
    { id: 43, name: "뚜벅쵸" }, { id: 60, name: "발챙이" },
    { id: 6, name: "리자몽" }, { id: 94, name: "팬텀" }, { id: 149, name: "망나뇽" },
    { id: 9, name: "거북왕" }, { id: 3, name: "이상해꽃" }, { id: 130, name: "갸라도스" },
    { id: 59, name: "윈디" }, { id: 26, name: "라이츄" }, { id: 65, name: "후딘" },
    { id: 134, name: "샤미드" }, { id: 135, name: "쥬피썬더" }, { id: 136, name: "부스터" },
    { id: 38, name: "나인테일" }, { id: 68, name: "괴력몬" }, { id: 34, name: "니드킹" },
    { id: 36, name: "픽시" }, { id: 40, name: "푸크린" }, { id: 80, name: "야도란" },
    { id: 121, name: "아쿠스타" }, { id: 78, name: "날쌩마" }
];
const POPULAR_POKEMON_IDS = [
    25, 133, 4, 7, 1, 151, 6, 143, 94, 149, 54, 39, 37, 58, 150, 447, 722, 778, 132, 129,
    131, 52, 79, 403, 653, 656, 393, 387, 479, 704, 677, 674, 570, 885, 872, 255, 252, 258, 417, 35
];
const popularPokemonIdSet = new Set(POPULAR_POKEMON_IDS);
const POKEMON = [
    ...POPULAR_POKEMON_IDS.map((id) => POKEMON_CATALOG.find((pokemon) => pokemon.id === id)),
    ...POKEMON_CATALOG.filter((pokemon) => !popularPokemonIdSet.has(pokemon.id))
];
const MODE_MASCOTS = {
    quiz: 25, rain: 129, mole: 50, memory: 132, ox: 54, balloon: 39, space: 722, mine: 100, knowledge: 151,
    symmetry: 417, coordinate: 137, history: 60, safety: 7, snack: 143
};
const GRADES = [
    { name: "유치원", description: "놀이로 만나는 수·모양·생활 기초" },
    { name: "1학년", description: "관찰하고 비교하는 기초 탐험" },
    { name: "2학년", description: "규칙을 찾고 생각을 넓히는 탐험" },
    { name: "3학년", description: "수·공간·지식을 연결하는 탐험" },
    { name: "4학년", description: "논리와 생활 지식을 키우는 탐험" },
    { name: "5학년", description: "여러 영역을 전략적으로 해결하는 탐험" },
    { name: "6학년", description: "배운 내용을 통합하는 종합 탐험" }
];
const MODES = {
    quiz: {
        name: "피카츄 암산퀴즈", description: "주관식과 객관식 10문제",
        hint: "직접 입력과 보기 선택이 섞여 나와요.", colors: ["#438fff", "#5f62df"], category: "암산·수 연산"
    },
    rain: {
        name: "잉어킹 산성비 챌린지", description: "천천히 떨어지는 문제를 해결해요",
        hint: "땅에 닿기 전에 답을 입력해요. 후반에도 입력 시간이 충분하도록 조정했어요.", colors: ["#6f74e8", "#4354bc"], category: "암산·수 연산"
    },
    mole: {
        name: "디그다 찾기", description: "정답을 든 디그다를 찾아요",
        hint: "목표 식이 바뀌면 디그다도 모두 새로 나와요.", colors: ["#f39a4b", "#d96d38"], category: "암산·수 연산"
    },
    memory: {
        name: "메타몽 메모리 게임", description: "변신한 메타몽의 같은 포켓몬 짝을 찾아요",
        hint: "메타몽이 변신한 카드 위치를 기억하고 연속으로 짝을 맞혀 변신 에너지를 채워요.", colors: ["#df78c8", "#8a5bc2"], category: "미니게임"
    },
    ox: {
        name: "고라파덕 오류 탐정 OX", description: "계산 속 실수를 빠르게 찾아요",
        hint: "식을 검산해 맞는 식인지 틀린 식인지 한 번에 판단해요. 5연속 성공하면 시간을 회복해요.", colors: ["#f06b8f", "#c9466b"], category: "암산·수 연산"
    },
    balloon: {
        name: "푸린 풍선 터뜨리기", description: "정답 풍선을 찾아 터뜨려요",
        hint: "목표 식의 답과 같은 숫자가 적힌 풍선을 선택해요.", colors: ["#35b6d2", "#2584ae"], category: "암산·수 연산"
    },
    space: {
        name: "나몰빼미 도형·공간 탐험", description: "회전·위에서 본 모습·쌓기나무·전개도",
        hint: "나몰빼미와 여러 방향에서 관찰하고 접어 보며 공간 감각을 길러요.", colors: ["#26a69a", "#1565a7"], category: "도형·공간"
    },
    mine: {
        name: "찌리리공 초원 탐색", description: "숫자 단서로 풀숲의 찌리리공 찾기",
        hint: "익숙한 지뢰찾기 규칙에 포켓몬 탐험을 더해 논리와 공간 추론을 길러요.", colors: ["#51b86b", "#1b7c78"], category: "도형·공간"
    },
    knowledge: {
        name: "뮤와 지식탐험", description: "과학·사회·역사·생활 지식을 탐험해요",
        hint: "학년에 맞는 네 영역을 여행하며 정답과 함께 짧은 해설을 배워요.", colors: ["#20a878", "#1478a8"], category: "지식탐험"
    },
    symmetry: {
        name: "파치리스 대칭 연구소", description: "전기 회로의 반쪽을 보고 좌우대칭을 완성해요",
        hint: "대칭축에서 같은 거리의 칸을 연결해 파치리스의 전기 에너지를 채워요.", colors: ["#52c8e8", "#3976c8"], category: "도형·공간"
    },
    coordinate: {
        name: "폴리곤 데이터 복구 작전", description: "규칙을 분석해 오류 데이터 패킷을 찾아 복구해요",
        hint: "정상 데이터 규칙을 먼저 읽고 규칙과 다른 카드만 선택해요.", colors: ["#2f9cc7", "#4965c7"], category: "도형·공간"
    },
    history: {
        name: "발챙이 역사 시간여행", description: "발챙이와 역사 사건을 오래된 순서로 복원해요",
        hint: "가장 오래된 사건부터 고르면 연속 정답 보너스를 받아요.", colors: ["#55bce7", "#3278c6"], category: "지식탐험"
    },
    safety: {
        name: "꼬부기 생활안전 구조대", description: "생활 속 위기에서 안전한 행동을 찾아요",
        hint: "교통·재난·응급·인터넷 상황에서 가장 안전한 선택을 해요.", colors: ["#f2b843", "#e27a4c"], category: "지식탐험"
    },
    snack: {
        name: "잠만보 베리 대모험", description: "베리를 모아 피버를 만드는 60초 미니게임",
        hint: "베리와 회복약을 받고, 딱딱한돌은 피해서 10콤보 피버를 만들어요.", colors: ["#68b95f", "#267d72"], category: "미니게임"
    }
};
const DIFFICULTIES = {
    easy: { name: "쉬움", description: "충분히 생각하며 풀어요" },
    normal: { name: "보통", description: "조금 더 빠르고 다양해요" },
    hard: { name: "어려움", description: "큰 수와 빠른 판단에 도전해요" }
};
const TIPS = [
    "틀려도 괜찮아요. 다시 계산하면 실력이 자라요.",
    "곱셈은 같은 수를 여러 번 더하는 빠른 방법이에요.",
    "나눗셈은 똑같은 수만큼 나누는 계산이에요.",
    "식을 한 번 소리 내어 읽으면 실수를 줄일 수 있어요."
];
const HELP = [
    ["피카츄 암산퀴즈", "10문제를 풀어요. 빠르고 연속으로 맞히면 추가 점수를 받아요."],
    ["잉어킹 산성비 챌린지", "일반 문제는 땅에 닿기 전에 풀고, 보라색 로켓단 함정은 입력하지 않고 지나가게 해요."],
    ["디그다 찾기", "목표 식의 정답을 든 디그다를 선택해요. 문제 변경 시 화면의 디그다도 함께 바뀌어요."],
    ["짝맞추기", "식 카드와 답 카드를 짝지어요. 게임을 나가면 남은 예약 동작도 안전하게 종료돼요."],
    ["고라파덕 오류 탐정 OX", "계산 속 실수 유형을 찾아 한 번에 판단해요. 5연속 성공하면 시간이 늘고, 오답이면 3초가 줄어요."],
    ["푸린 풍선 터뜨리기", "정답 풍선을 터뜨려 60초 동안 높은 점수에 도전해요."],
    ["나몰빼미 도형·공간 탐험", "도형 회전, 위에서 내려다본 모습, 쌓기나무, 거울 대칭과 정육면체 전개도를 학년에 맞춰 해결해요."],
    ["찌리리공 지뢰찾기", "숫자 단서를 보고 안전한 칸을 열어요. 오른쪽 클릭이나 표시 모드로 찌리리공 위치에 몬스터볼을 놓아요."]
];
const VALID_MODES = new Set(Object.keys(MODES));
const VALID_DIFFS = new Set(["easy", "normal", "hard"]);
const MAX_GAME_SECONDS = 10 * 60;
const STORAGE = {
    name: "amsan_name_v2",
    avatar: "amsan_avatar_v2",
    trainer: "amsan_trainer_v1",
    records: "amsan_records_v2",
    last: "amsan_last_v2",
    lifetimeStars: "amsan_lifetime_stars_v1",
    progressionStars: "amsan_progression_stars_v2",
    progressionRules: "amsan_progression_rules_v2",
    celebratedPokemon: "amsan_celebrated_pokemon_v1"
};
const PROGRESSION_CUTOVER_AT = Date.parse("2026-07-29T22:18:55+09:00");
const PROGRESSION_RULESET = "popularity-unlocks-v1";
const TRAINER_TITLES = [
    { level: 1, title: "새싹 트레이너" }, { level: 5, title: "포켓볼 트레이너" },
    { level: 10, title: "호기심 탐험가" }, { level: 20, title: "슈퍼볼 트레이너" },
    { level: 30, title: "지식 수집가" }, { level: 40, title: "공간 탐험가" },
    { level: 50, title: "하이퍼볼 트레이너" }, { level: 60, title: "별빛 연구원" },
    { level: 70, title: "챔피언 후보" }, { level: 80, title: "마스터볼 트레이너" },
    { level: 90, title: "배움 챔피언" }, { level: 100, title: "배움 마스터" }
];
function trainerTitleAtLevel(level) {
    return TRAINER_TITLES.reduce((title, milestone) => level >= milestone.level ? milestone.title : title, "새싹 트레이너");
}
function trainerTierAtLevel(level) {
    if (level >= 75)
        return "master";
    if (level >= 50)
        return "ultra";
    if (level >= 25)
        return "great";
    return "starter";
}
const TRAINER_LEVELS = Array.from({ length: 124 }, (_, index) => {
    const level = index + 1;
    const trainerReward = level >= 5 && level <= 95 && level % 5 === 0;
    return {
        level,
        minStars: index * (index + 19) / 2,
        title: trainerTitleAtLevel(level),
        reward: level === 1 ? "피카츄와 지우" : trainerReward ? "새 트레이너" : level % 5 === 0 ? "성장 배지" : "새 포켓몬",
        tier: trainerTierAtLevel(level)
    };
});
function byId(id) {
    const element = document.getElementById(id);
    if (!element)
        throw new Error("필수 화면 요소를 찾을 수 없습니다: " + id);
    return element;
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function choose(items) {
    return items[randomInt(0, items.length - 1)];
}
function shuffle(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
        const j = randomInt(0, i);
        const value = items[i];
        items[i] = items[j];
        items[j] = value;
    }
    return items;
}
function pokemonUrl(id) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + id + ".png";
}
const TRAINER_SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/trainers/";
const TEAM_ROCKET_TRAINER_ASSET = "./assets/team-rocket-jessie-james-modern.png";
const TRAINER_CATALOG = [
    { id: "ash", name: "지우", file: "ash.png", region: "관동" },
    { id: "misty", name: "이슬", file: "misty.png", region: "관동" },
    { id: "brock", name: "웅이", file: "brock.png", region: "관동" },
    { id: "red", name: "레드", file: "red.png", region: "관동" },
    { id: "blue", name: "그린", file: "blue.png", region: "관동" },
    { id: "leaf", name: "리프", file: "leaf-gen3.png", region: "관동" },
    { id: "may", name: "봄이", file: "may.png", region: "호연" },
    { id: "brendan", name: "휘웅", file: "brendan.png", region: "호연" },
    { id: "dawn", name: "빛나", file: "dawn.png", region: "신오" },
    { id: "lucas", name: "광휘", file: "lucas.png", region: "신오" },
    { id: "hilbert", name: "투지", file: "hilbert.png", region: "하나" },
    { id: "hilda", name: "투희", file: "hilda.png", region: "하나" },
    { id: "nate", name: "공명", file: "nate.png", region: "하나" },
    { id: "rosa", name: "명희", file: "rosa.png", region: "하나" },
    { id: "calem", name: "칼름", file: "calem.png", region: "칼로스" },
    { id: "serena", name: "세레나", file: "serena.png", region: "칼로스" },
    { id: "elio", name: "영태", file: "elio.png", region: "알로라" },
    { id: "selene", name: "미월", file: "selene.png", region: "알로라" },
    { id: "lillie", name: "릴리에", file: "lillie.png", region: "알로라" },
    { id: "rocket", name: "로켓단 로사·로이", file: TEAM_ROCKET_TRAINER_ASSET, region: "로켓단" }
];
const POPULAR_TRAINER_IDS = [
    "ash", "red", "misty", "brock", "serena", "dawn", "may", "lillie", "blue", "rocket",
    "leaf", "brendan", "lucas", "hilda", "rosa", "hilbert", "nate", "calem", "selene", "elio"
];
const TRAINER_CHOICES = POPULAR_TRAINER_IDS.map((id) => TRAINER_CATALOG.find((trainer) => trainer.id === id));
function progressionRewardText(previousLevel, newLevel) {
    const rewards = [];
    const previousPokemonCount = unlockedPokemonCountAtLevel(previousLevel);
    const newPokemonCount = unlockedPokemonCountAtLevel(newLevel);
    const newPokemon = POKEMON.slice(previousPokemonCount, newPokemonCount);
    if (newPokemon.length === 1)
        rewards.push(`${newPokemon[0].name} 획득`);
    else if (newPokemon.length > 1)
        rewards.push(`포켓몬 ${newPokemon.length}마리 획득`);
    const previousTrainerCount = unlockedTrainerCountAtLevel(previousLevel);
    const newTrainerCount = unlockedTrainerCountAtLevel(newLevel);
    const newTrainers = TRAINER_CHOICES.slice(previousTrainerCount, newTrainerCount);
    if (newTrainers.length === 1)
        rewards.push(`${newTrainers[0].name} 트레이너 획득`);
    else if (newTrainers.length > 1)
        rewards.push(`트레이너 ${newTrainers.length}명 획득`);
    return rewards.join(" · ") || "성장 보상 획득";
}
function trainerMedia(file, name, className = "") {
    const wrapper = document.createElement("span");
    wrapper.className = "trainer-media" + (className ? " " + className : "");
    const fallback = document.createElement("span");
    fallback.className = "trainer-fallback";
    fallback.textContent = name;
    const image = document.createElement("img");
    image.src = file.startsWith("./assets/") ? file : TRAINER_SPRITE_BASE + file;
    image.alt = name;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    wrapper.append(fallback, image);
    return wrapper;
}
function replaceWithTrainer(target, file, name) {
    target.replaceChildren(trainerMedia(file, name));
}
function pokemonCryUrl(id) {
    return "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/" + id + ".ogg";
}
const GAME_POKEMON_NAMES = {
    50: "디그다",
    100: "찌리리공",
    113: "럭키"
};
function pokemonById(id) {
    return POKEMON.find((pokemon) => pokemon.id === id) ?? {
        id,
        name: GAME_POKEMON_NAMES[id] ?? "포켓몬"
    };
}
function pokemonMedia(pokemon, extraClass = "") {
    const wrapper = document.createElement("span");
    wrapper.className = "pokemon-media " + extraClass;
    const fallback = document.createElement("span");
    fallback.className = "pokemon-fallback";
    fallback.textContent = pokemon.name;
    const image = document.createElement("img");
    image.src = pokemonUrl(pokemon.id);
    image.alt = pokemon.name;
    image.decoding = "async";
    image.loading = "lazy";
    image.addEventListener("error", () => {
        wrapper.classList.add("image-error");
        image.remove();
    }, { once: true });
    wrapper.append(fallback, image);
    return wrapper;
}
function replaceWithPokemon(target, id) {
    target.replaceChildren(pokemonMedia(pokemonById(id)));
}
function safeGet(key) {
    try {
        return localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
function safeSet(key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch { }
}
function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    }
    catch { }
}
function initializeProgressionRules() {
    if (Date.now() < PROGRESSION_CUTOVER_AT || safeGet(STORAGE.progressionRules) === PROGRESSION_RULESET)
        return;
    safeSet(STORAGE.progressionStars, "0");
    safeSet(STORAGE.avatar, "25");
    safeSet(STORAGE.trainer, "ash");
    safeSet(STORAGE.celebratedPokemon, "1");
    safeSet(STORAGE.progressionRules, PROGRESSION_RULESET);
}
function unlockedPokemonCountAtLevel(level) {
    level = Math.max(1, Math.floor(level));
    return Math.min(POKEMON.length, level - Math.floor(level / 5));
}
function trainerUnlockLevel(index) {
    return index === 0 ? 1 : index * 5;
}
function unlockedTrainerCountAtLevel(level) {
    return Math.min(TRAINER_CHOICES.length, 1 + Math.floor(Math.max(0, Math.floor(level)) / 5));
}
function isPokemonUnlocked(id, level = getTrainerProgress().current.level) {
    const index = POKEMON.findIndex((pokemon) => pokemon.id === id);
    return index >= 0 && index < unlockedPokemonCountAtLevel(level);
}
function isTrainerUnlocked(id, level = getTrainerProgress().current.level) {
    const index = TRAINER_CHOICES.findIndex((trainer) => trainer.id === id);
    return index >= 0 && index < unlockedTrainerCountAtLevel(level);
}
async function fetchWithTimeout(input, init = {}, timeoutMs = 9000) {
    const controller = new AbortController();
    const upstreamSignal = init.signal;
    const relayAbort = () => controller.abort(upstreamSignal?.reason);
    if (upstreamSignal?.aborted)
        relayAbort();
    else
        upstreamSignal?.addEventListener("abort", relayAbort, { once: true });
    const timeout = window.setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    }
    finally {
        window.clearTimeout(timeout);
        upstreamSignal?.removeEventListener("abort", relayAbort);
    }
}
function getName() {
    return (safeGet(STORAGE.name) ?? "").replace(/[<>&]/g, "").slice(0, 6);
}
function setName(value) {
    const clean = value.trim().replace(/[<>&]/g, "").slice(0, 6) || "친구";
    safeSet(STORAGE.name, clean);
}
function normalizeAccessName(value) {
    return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}
function isAllowedTrainerName(value) {
    const normalized = normalizeAccessName(value);
    const allowedNames = window.POKE_ALLOWED_TRAINER_NAMES;
    return normalized.length > 0 && Array.isArray(allowedNames)
        && allowedNames.some((name) => typeof name === "string" && normalizeAccessName(name) === normalized);
}
function clearAccessMessage() {
    const input = byId("nameInput");
    input.removeAttribute("aria-invalid");
    byId("accessMessage").textContent = "";
}
function showAccessDenied(message = "접속할 수 없습니다.") {
    const input = byId("nameInput");
    input.setAttribute("aria-invalid", "true");
    byId("accessMessage").textContent = message;
    input.focus();
    input.select();
}
function getAvatarId() {
    const parsed = Number(safeGet(STORAGE.avatar));
    if (isPokemonUnlocked(parsed))
        return parsed;
    safeSet(STORAGE.avatar, "25");
    return 25;
}
function hasSavedAvatar() {
    const parsed = Number(safeGet(STORAGE.avatar));
    return isPokemonUnlocked(parsed);
}
function setAvatarId(id) {
    if (isPokemonUnlocked(id))
        safeSet(STORAGE.avatar, String(id));
}
function getTrainerChoice() {
    const saved = safeGet(STORAGE.trainer);
    return TRAINER_CHOICES.find((trainer) => trainer.id === saved && isTrainerUnlocked(trainer.id)) ?? TRAINER_CHOICES[0];
}
function hasSavedTrainer() {
    const saved = safeGet(STORAGE.trainer);
    return TRAINER_CHOICES.some((trainer) => trainer.id === saved && isTrainerUnlocked(trainer.id));
}
function setTrainerChoice(id) {
    if (isTrainerUnlocked(id))
        safeSet(STORAGE.trainer, id);
}
function readRecords() {
    const raw = safeGet(STORAGE.records);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            safeRemove(STORAGE.records);
            return [];
        }
        const records = parsed.map((item) => sanitizeRecord(item)).filter((item) => item !== null).slice(0, 60);
        const normalized = JSON.stringify(records);
        if (normalized !== raw)
            safeSet(STORAGE.records, normalized);
        return records;
    }
    catch {
        safeRemove(STORAGE.records);
        return [];
    }
}
function saveRecord(entry) {
    const lifetimeStars = getLifetimeStars() + Math.max(0, Math.min(3, Math.floor(entry.stars)));
    safeSet(STORAGE.progressionStars, String(lifetimeStars));
    const records = [entry, ...readRecords()].slice(0, 60);
    safeSet(STORAGE.records, JSON.stringify(records));
    updateSideInfo();
    void uploadSharedRecords([entry]);
}
function sanitizeRecord(value, coerceNumbers = false) {
    if (!value || typeof value !== "object")
        return null;
    const row = value;
    const numberValue = (candidate) => coerceNumbers ? Number(candidate) : typeof candidate === "number" ? candidate : Number.NaN;
    const grade = numberValue(row.grade);
    const score = numberValue(row.score);
    const stars = numberValue(row.stars);
    const timestamp = numberValue(row.timestamp);
    if (typeof row.name !== "string" || !VALID_MODES.has(row.mode) || !VALID_DIFFS.has(row.diff))
        return null;
    if (!Number.isInteger(grade) || grade < 0 || grade > 6 || !Number.isFinite(score) || !Number.isFinite(stars) || !Number.isFinite(timestamp))
        return null;
    if (typeof row.detail !== "string" || timestamp <= 0)
        return null;
    const cleanName = row.name.trim().replace(/[<>&]/g, "").slice(0, 20) || "친구";
    return {
        name: cleanName,
        mode: row.mode,
        grade,
        diff: row.diff,
        score: Math.max(0, Math.min(10000000, Math.floor(score))),
        stars: Math.max(0, Math.min(3, Math.floor(stars))),
        detail: row.detail.slice(0, 100),
        timestamp: Math.min(Date.now() + 86400000, Math.floor(timestamp))
    };
}
function leaderboardServerConfig() {
    const config = window.POKE_LEADERBOARD_SERVER;
    if (!config?.enabled)
        return null;
    const apiUrl = String(config.apiUrl ?? "").trim().replace(/\/$/, "");
    if (!/^https?:\/\//i.test(apiUrl))
        return null;
    return { apiUrl };
}
function sharedRecordKey(entry) {
    const source = [normalizeAccessName(entry.name), entry.mode, entry.grade, entry.score, entry.stars, Math.floor(entry.timestamp)].join("|");
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1)
        hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
    return "record-" + (hash >>> 0).toString(36) + "-" + Math.floor(entry.timestamp).toString(36);
}
async function uploadSharedRecords(entries, signal) {
    const config = leaderboardServerConfig();
    if (!config || !entries.length)
        return false;
    const oldestAllowed = Date.now() - 29 * 86400000;
    const rows = entries.filter((entry) => entry.timestamp >= oldestAllowed).map((entry) => ({
        recordKey: sharedRecordKey(entry), name: entry.name.trim().slice(0, 20), mode: entry.mode, grade: entry.grade,
        diff: entry.diff, score: Math.max(0, Math.min(10000000, Math.floor(entry.score))), stars: Math.max(0, Math.min(3, Math.floor(entry.stars))),
        detail: entry.detail.slice(0, 100), timestamp: Math.floor(entry.timestamp)
    }));
    if (!rows.length)
        return false;
    try {
        const response = await fetchWithTimeout(config.apiUrl + "/leaderboard", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records: rows }), signal
        }, 8000);
        return response.ok;
    }
    catch {
        return false;
    }
}
async function readSharedRecords(mode, signal) {
    const config = leaderboardServerConfig();
    if (!config)
        return [];
    const params = new URLSearchParams({ limit: "1000" });
    if (mode !== null)
        params.set("mode", mode);
    const response = await fetchWithTimeout(config.apiUrl + "/leaderboard?" + params.toString(), { signal }, 8000);
    if (!response.ok)
        throw new Error("Shared leaderboard request failed");
    const payload = await response.json();
    const rows = payload && typeof payload === "object" && "records" in payload ? payload.records : [];
    if (!Array.isArray(rows))
        return [];
    return rows.map((row) => sanitizeRecord(row, true)).filter((row) => row !== null);
}
function getLifetimeStars() {
    const stored = Number(safeGet(STORAGE.progressionStars));
    const stars = Number.isFinite(stored) && stored >= 0 ? Math.floor(stored) : 0;
    if (String(stars) !== safeGet(STORAGE.progressionStars))
        safeSet(STORAGE.progressionStars, String(stars));
    return stars;
}
function getTrainerProgress(stars = getLifetimeStars()) {
    let current = TRAINER_LEVELS[0];
    TRAINER_LEVELS.forEach((level) => { if (stars >= level.minStars)
        current = level; });
    const next = TRAINER_LEVELS.find((level) => level.level === current.level + 1) ?? null;
    const span = next ? next.minStars - current.minStars : 1;
    const percent = next ? Math.max(0, Math.min(100, (stars - current.minStars) / span * 100)) : 100;
    return { stars, current, next, percent, remaining: next ? Math.max(0, next.minStars - stars) : 0 };
}
function saveLastPlay() {
    if (state.grade === null || state.mode === null)
        return;
    safeSet(STORAGE.last, JSON.stringify({ grade: state.grade, mode: state.mode, diff: state.diff }));
}
function readLastPlay() {
    const raw = safeGet(STORAGE.last);
    if (!raw)
        return null;
    try {
        const value = JSON.parse(raw);
        if (!value || typeof value !== "object")
            return null;
        const row = value;
        if (!Number.isInteger(row.grade) || Number(row.grade) < 0 || Number(row.grade) > 6)
            return null;
        if (!VALID_MODES.has(row.mode) || !VALID_DIFFS.has(row.diff))
            return null;
        return { grade: Number(row.grade), mode: row.mode, diff: row.diff };
    }
    catch {
        safeRemove(STORAGE.last);
        return null;
    }
}
let audioContext = null;
let sfxEnabled = true;
let musicEnabled = true;
let musicTimer = null;
let cryAudio = null;
let audioPrimed = false;
function ensureAudio() {
    try {
        if (!audioContext) {
            const AudioContextConstructor = window.AudioContext
                || window.webkitAudioContext;
            if (!AudioContextConstructor)
                return null;
            audioContext = new AudioContextConstructor();
        }
        if (audioContext.state === "suspended")
            void audioContext.resume();
        return audioContext;
    }
    catch {
        return null;
    }
}
function unlockAudioFromGesture() {
    const context = ensureAudio();
    if (!context)
        return;
    const prime = () => {
        if (audioPrimed || context.state !== "running")
            return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        gain.gain.value = .0001;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + .025);
        audioPrimed = true;
    };
    if (context.state === "running")
        prime();
    else
        void context.resume().then(prime).catch(() => undefined);
}
function softNote(frequency, duration = 0.12, volume = 0.018, delay = 0, type = "sine", bypassSfx = false, endFrequency = frequency) {
    if (!bypassSfx && !sfxEnabled)
        return;
    const context = ensureAudio();
    if (!context)
        return;
    const start = context.currentTime + delay;
    const end = start + duration;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), end);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(2200, Math.max(700, frequency * 2.8)), start);
    filter.Q.value = 0.45;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.018, duration * 0.22));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
}
function playNotes(notes, bypassSfx = false) {
    notes.forEach(([frequency, duration, delay, volume, type = "sine"]) => {
        softNote(frequency, duration, volume, delay, type, bypassSfx);
    });
}
function tapSound() {
    playNotes([[392, 0.07, 0, 0.009], [523, 0.075, 0.025, 0.005]]);
}
function selectSound() {
    playNotes([[392, 0.12, 0, 0.015], [587, 0.15, 0.055, 0.014]]);
}
function collectSound(gold = false) {
    playNotes(gold
        ? [[523, 0.13, 0, 0.016], [659, 0.15, 0.05, 0.015], [880, 0.2, 0.11, 0.014]]
        : [[440, 0.12, 0, 0.013], [659, 0.16, 0.055, 0.013]]);
}
function bumpSound() {
    softNote(165, 0.14, 0.012, 0, "sine", false, 118);
}
function moveSound() {
    softNote(330, 0.06, 0.007);
}
function openSound() {
    playNotes([[349, 0.075, 0, 0.009], [440, 0.085, 0.025, 0.007]]);
}
function flagSound(active) {
    playNotes(active
        ? [[440, 0.1, 0, 0.012], [659, 0.13, 0.045, 0.011]]
        : [[523, 0.1, 0, 0.011], [392, 0.13, 0.045, 0.01]]);
}
function modeSound(active) {
    playNotes(active
        ? [[392, 0.1, 0, 0.012], [587, 0.14, 0.05, 0.011]]
        : [[587, 0.1, 0, 0.011], [392, 0.14, 0.05, 0.01]]);
}
function levelUpSound() {
    playNotes([
        [392, 0.2, 0, 0.018],
        [523, 0.22, 0.08, 0.018],
        [659, 0.25, 0.17, 0.017],
        [784, 0.32, 0.27, 0.015],
    ]);
}
function musicNote(frequency) {
    const volumeScale = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 1;
    playNotes([
        [frequency, 0.5, 0, 0.0156 * volumeScale, "triangle"],
        [frequency * 2, 0.34, 0.035, 0.0048 * volumeScale, "sine"],
    ], true);
}
function playPokemonCry(id, volume = .16) {
    if (!sfxEnabled)
        return;
    try {
        if (cryAudio) {
            cryAudio.pause();
            cryAudio.currentTime = 0;
        }
        cryAudio = new Audio(pokemonCryUrl(id));
        cryAudio.volume = volume;
        void cryAudio.play().catch(() => undefined);
    }
    catch { }
}
function correctSound() {
    playNotes([
        [523, 0.17, 0, 0.02],
        [659, 0.19, 0.065, 0.019],
        [784, 0.23, 0.14, 0.017],
    ]);
    if (Math.random() < .24)
        window.setTimeout(() => playPokemonCry(getAvatarId(), .08), 260);
    pokemonSparkBurst(8);
}
function wrongSound() {
    playNotes([
        [294, 0.16, 0, 0.016],
        [220, 0.21, 0.085, 0.014],
    ]);
}
function choiceMistakeCount(containerId) {
    return Number(byId(containerId).dataset.choiceMistakes ?? "0");
}
function resetChoicePenalty(containerId) {
    const container = byId(containerId);
    delete container.dataset.choiceMistakes;
    container.classList.remove("choice-penalty-lock");
}
const FIRST_MISTAKE_HOLD_MS = 1200;
const FINAL_MISTAKE_HOLD_MS = 3200;
const MISTAKE_ENCOUNTER_EXIT_MS = 220;
function prepareTransientMedia(media) {
    const image = media.querySelector("img");
    if (image) {
        image.loading = "eager";
        image.decoding = "async";
        image.fetchPriority = "high";
    }
    return media;
}
function showMistakeEncounter(attempt) {
    document.querySelector(".mistake-encounter")?.remove();
    const encounter = document.createElement("aside");
    encounter.className = "mistake-encounter " + (attempt === 1 ? "gastly-encounter" : "final-encounter");
    encounter.setAttribute("role", "status");
    encounter.setAttribute("aria-live", "assertive");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const message = document.createElement("span");
    if (attempt === 1) {
        title.textContent = "고오스의 방해!";
        message.textContent = "잠깐 멈추고 다시 생각해 봐요.";
        encounter.append(prepareTransientMedia(pokemonMedia(pokemonById(92), "mistake-character")));
        playPokemonCry(92, .12);
    }
    else if (attempt === 3 || Math.random() < .5) {
        title.textContent = "팬텀이 집중을 흐트렸어요";
        message.textContent = "잠깐 숨을 고르고 단서를 다시 살펴봐요.";
        encounter.append(prepareTransientMedia(pokemonMedia(pokemonById(94), "mistake-character")));
        playPokemonCry(94, .13);
    }
    else {
        title.textContent = "로켓단이 콤보를 가져갔어요";
        message.textContent = "정답을 확인하고 다시 출발해요.";
        encounter.append(prepareTransientMedia(trainerMedia(TEAM_ROCKET_TRAINER_ASSET, "로켓단", "mistake-character")));
    }
    copy.append(title, message);
    encounter.append(copy);
    document.body.append(encounter);
    const holdMs = attempt === 1 ? FIRST_MISTAKE_HOLD_MS : FINAL_MISTAKE_HOLD_MS;
    window.setTimeout(() => {
        if (!encounter.isConnected)
            return;
        encounter.classList.add("leaving");
        window.setTimeout(() => encounter.remove(), MISTAKE_ENCOUNTER_EXIT_MS);
    }, holdMs);
}
function applyChoicePenalty(containerId, selector, selected, correctButton, feedback, firstMessage, finalMessage) {
    const container = byId(containerId);
    const attempt = choiceMistakeCount(containerId) + 1;
    container.dataset.choiceMistakes = String(attempt);
    container.classList.add("choice-penalty-lock");
    const buttons = Array.from(container.querySelectorAll(selector));
    buttons.forEach((button) => { button.disabled = true; });
    selected.classList.add("wrong");
    wrongSound();
    showMistakeEncounter(attempt);
    if (attempt === 1) {
        feedback.textContent = firstMessage;
        window.setTimeout(() => {
            if (!container.isConnected)
                return;
            container.classList.remove("choice-penalty-lock");
            buttons.forEach((button) => { if (button !== selected)
                button.disabled = false; });
        }, 2200);
        return true;
    }
    correctButton?.classList.add("correct");
    feedback.textContent = finalMessage;
    return false;
}
function startMusic() {
    if (!musicEnabled || musicTimer !== null)
        return;
    let index = 0;
    const notes = [262, 330, 392, 330, 349, 440, 392, 330];
    const playNextMusicNote = () => {
        if (musicEnabled) {
            musicNote(notes[index % notes.length]);
            index += 1;
        }
    };
    playNextMusicNote();
    musicTimer = appSetInterval(playNextMusicNote, 720);
}
function stopMusic() {
    if (musicTimer !== null)
        window.clearInterval(musicTimer);
    musicTimer = null;
}
function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
}
window.addEventListener("poke-update-ready", () => {
    showToast("새 버전이 준비됐어요. 다음 실행부터 자동으로 적용돼요.");
});
const state = { grade: null, mode: null, diff: "easy" };
function showScreen(name) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    const screen = byId("screen-" + name);
    screen.classList.add("active");
    screen.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { document.scrollingElement.scrollTop = 0; }));
}
function setActiveNav(name) {
    document.querySelectorAll("[data-nav]").forEach((button) => {
        button.classList.toggle("active", button.dataset.nav === name);
    });
    const secondary = new Set(["report", "leaderboard", "records", "help", "about"]);
    const more = byId("sideMoreMenu");
    more.open = false;
    syncMoreMenuAccessibility();
    more.classList.toggle("has-active", secondary.has(name));
}
function syncMoreMenuAccessibility() {
    const more = byId("sideMoreMenu");
    const panel = byId("sideMorePanel");
    const backdrop = byId("moreMenuBackdrop");
    more.querySelector("summary")?.setAttribute("aria-expanded", String(more.open));
    panel?.toggleAttribute("inert", !more.open);
    panel?.setAttribute("aria-hidden", String(!more.open));
    backdrop.toggleAttribute("inert", !more.open);
    backdrop.setAttribute("aria-hidden", String(!more.open));
    document.body.classList.toggle("more-menu-open", more.open);
}
function closeMoreMenu(restoreFocus = false) {
    const more = byId("sideMoreMenu");
    if (!more.open)
        return;
    more.open = false;
    syncMoreMenuAccessibility();
    if (restoreFocus)
        more.querySelector("summary")?.focus();
}
function gradeName(grade) {
    return GRADES[grade]?.name ?? "유치원";
}
function updateSideInfo() {
    const progress = getTrainerProgress();
    const stars = progress.stars;
    const trainerName = getName() || "친구";
    document.body.dataset.trainerTier = progress.current.tier;
    byId("sideName").textContent = trainerName;
    byId("sideLevel").textContent = "Lv." + progress.current.level;
    byId("sideTitle").textContent = progress.current.title;
    byId("sideStars").textContent = progress.next ? "별 " + stars + "개 · 다음 레벨까지 " + progress.remaining + "개" : "별 " + stars + "개 · 최고 레벨 달성";
    replaceWithPokemon(byId("sideMascot"), getAvatarId());
    const selectedTrainer = getTrainerChoice();
    replaceWithTrainer(byId("sideTrainer"), selectedTrainer.file, selectedTrainer.name);
    byId("playerCard").setAttribute("aria-label", trainerName + " · 레벨 " + progress.current.level + " " + progress.current.title + " · 파트너 포켓몬과 " + selectedTrainer.name + " 트레이너 바꾸기");
    const card = byId("levelCard");
    card.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = "Lv." + progress.current.level + " " + progress.current.title;
    const track = document.createElement("div");
    track.className = "level-track";
    const fill = document.createElement("div");
    fill.className = "level-fill";
    fill.style.width = progress.percent + "%";
    track.append(fill);
    const note = document.createElement("small");
    note.textContent = progress.next ? "다음 레벨까지 별 " + progress.remaining + "개" : "최고 레벨을 달성했어요!";
    const reward = document.createElement("small");
    reward.className = "level-card-reward";
    reward.textContent = "획득: " + progress.current.reward;
    card.append(title, track, note, reward);
    byId("cheerCard").textContent = progress.next ? "다음 보상: " + progress.next.reward : "배움 마스터의 모험을 이어가요!";
}
function buildGradeHero() {
    const records = readRecords();
    const best = records.reduce((value, record) => Math.max(value, record.score), 0);
    const progress = getTrainerProgress();
    const stars = progress.stars;
    const hero = byId("gradeHero");
    hero.replaceChildren();
    hero.append(pokemonMedia(pokemonById(getAvatarId())));
    const copy = document.createElement("div");
    copy.className = "hero-copy";
    const heading = document.createElement("h2");
    heading.textContent = (getName() || "친구") + "님, 오늘도 반가워요!";
    const paragraph = document.createElement("p");
    paragraph.textContent = "Lv." + progress.current.level + " " + progress.current.title + " · 학년을 고르고 배움 모험을 시작해요.";
    copy.append(heading, paragraph);
    hero.append(copy, heroStat(String(records.length), "플레이"), heroStat(String(best), "최고 점수"), heroStat(String(stars), "별"));
}
function heroStat(value, label) {
    const stat = document.createElement("span");
    stat.className = "hero-stat";
    const strong = document.createElement("b");
    strong.textContent = value;
    const small = document.createElement("small");
    small.textContent = label;
    stat.append(strong, small);
    return stat;
}
function cardButton(title, description, colors, action, pokemonId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "select-card";
    button.style.setProperty("--card-a", colors[0]);
    button.style.setProperty("--card-b", colors[1]);
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = description;
    button.append(strong, span);
    if (pokemonId !== undefined) {
        button.classList.add("pokemon-card");
        const artwork = pokemonMedia(pokemonById(pokemonId), "menu-pokemon");
        artwork.setAttribute("aria-hidden", "true");
        button.append(artwork);
    }
    button.addEventListener("click", () => {
        action();
    });
    return button;
}
function renderLevelJourney(progress) {
    const host = byId("dashboardLevelJourney");
    host.replaceChildren();
    const head = document.createElement("div");
    head.className = "level-journey-head";
    const badge = document.createElement("strong");
    badge.className = "level-journey-badge";
    badge.textContent = "Lv." + progress.current.level;
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = progress.current.title;
    const count = document.createElement("span");
    count.textContent = progress.next ? "별 " + progress.stars + " / " + progress.next.minStars : "별 " + progress.stars + " · 최고 레벨";
    copy.append(title, count);
    head.append(badge, copy);
    const track = document.createElement("div");
    track.className = "level-journey-track";
    const fill = document.createElement("i");
    fill.style.width = progress.percent + "%";
    track.append(fill);
    const rewards = document.createElement("div");
    rewards.className = "level-journey-rewards";
    const currentReward = document.createElement("div");
    currentReward.className = "level-reward-card earned";
    const currentLabel = document.createElement("small");
    currentLabel.textContent = "현재 보상";
    const currentText = document.createElement("b");
    currentText.textContent = progress.current.reward;
    currentReward.append(currentLabel, currentText);
    const nextReward = document.createElement("div");
    nextReward.className = "level-reward-card next";
    const nextLabel = document.createElement("small");
    nextLabel.textContent = progress.next ? "다음 보상 · 별 " + progress.remaining + "개 남음" : "모든 보상 획득";
    const nextText = document.createElement("b");
    nextText.textContent = progress.next?.reward ?? "배움 마스터 배지";
    nextReward.append(nextLabel, nextText);
    rewards.append(currentReward, nextReward);
    host.append(head, track, rewards);
}
function openDashboard() {
    cleanupGame();
    setActiveNav("dashboard");
    const records = readRecords();
    const progress = getTrainerProgress();
    const stars = progress.stars;
    const level = progress.current.level;
    const todayRecords = records.filter((record) => record.timestamp >= startOfToday());
    const missions = dailyModes();
    const done = missions.filter((mode) => todayRecords.some((record) => record.mode === mode)).length;
    byId("dashboardChansey").replaceChildren(pokemonMedia({ id: 113, name: "럭키" }));
    byId("dashboardGreeting").textContent = (getName() || "친구") + " 트레이너, 어서 와요!";
    const daily = byId("dashboardDaily");
    daily.replaceChildren();
    const dailyStrong = document.createElement("strong");
    dailyStrong.textContent = done === 3 ? "오늘의 임무 완료!" : done + " / 3 완료";
    const dailyText = document.createElement("span");
    dailyText.textContent = done === 3 ? "오늘의 배지를 받았어요" : "조금만 더 힘내요";
    daily.append(dailyStrong, dailyText);
    daily.classList.toggle("complete", done === 3);
    const stats = byId("dashboardStats");
    stats.replaceChildren(reportMetric("Lv." + level, "트레이너 레벨"), reportMetric(String(stars), "모은 별"), reportMetric(String(records.length), "완료 게임"), reportMetric(discoveredPokemonCount() + "/" + POKEMON.length, "발견 도감"));
    renderLevelJourney(progress);
    const recent = byId("dashboardRecent");
    recent.replaceChildren();
    if (!records.length) {
        const empty = document.createElement("p");
        empty.textContent = "아직 기록이 없어요. 첫 모험을 시작해 볼까요?";
        recent.append(empty);
    }
    else
        records.slice(0, 4).forEach((record) => {
            const row = document.createElement("div");
            const info = document.createElement("span");
            const title = document.createElement("b");
            title.textContent = MODES[record.mode].name;
            info.textContent = gradeName(record.grade) + " · " + record.detail;
            const star = document.createElement("strong");
            star.textContent = "★".repeat(record.stars) + "☆".repeat(3 - record.stars);
            row.append(title, info, star);
            recent.append(row);
        });
    const last = readLastPlay();
    byId("dashboardContinue").disabled = !last;
    showScreen("dashboard");
}
function openGrades() {
    cleanupGame();
    setActiveNav("game");
    buildGradeHero();
    const grid = byId("gradeGrid");
    grid.replaceChildren();
    const colors = [
        ["#ff8ebf", "#e5538e"], ["#ff7b72", "#d64a55"], ["#f6a94b", "#db7734"],
        ["#e8bd35", "#c18d16"], ["#37bd7d", "#16855b"], ["#438fff", "#2865c1"], ["#8b6fe8", "#6549bf"]
    ];
    const requestedGradeBalls = [
        { sprite: "poke-ball", name: "몬스터볼", tier: "starter" },
        { sprite: "great-ball", name: "슈퍼볼", tier: "great" },
        { sprite: "ultra-ball", name: "하이퍼볼", tier: "ultra" },
        { sprite: "master-ball", name: "마스터볼", tier: "master" },
        { sprite: "safari-ball", name: "사파리볼", tier: "safari" },
        { sprite: "luxury-ball", name: "럭셔리볼", tier: "luxury" },
        { sprite: "beast-ball", name: "울트라볼", tier: "beast" }
    ];
    GRADES.forEach((grade, index) => {
        const ball = requestedGradeBalls[index];
        const card = cardButton(grade.name, grade.description, colors[index], () => selectGrade(index));
        card.classList.add("grade-ball-card");
        card.dataset.ballTier = ball.tier;
        const media = document.createElement("div");
        media.className = "grade-ball-media";
        const image = document.createElement("img");
        image.className = "grade-ball-image";
        image.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/" + ball.sprite + ".png";
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.loading = "eager";
        const label = document.createElement("small");
        label.className = "grade-ball-name";
        label.textContent = ball.name;
        media.append(image, label);
        card.append(media);
        grid.append(card);
    });
    byId("gradeTip").textContent = "도움말: " + choose(TIPS);
    showScreen("grade");
}
function selectGrade(grade) {
    state.grade = grade;
    buildModes();
}
function buildModes() {
    if (state.grade === null) {
        openGrades();
        return;
    }
    byId("modeChip").textContent = gradeName(state.grade);
    const grid = byId("modeGrid");
    grid.replaceChildren();
    ["암산·수 연산", "도형·공간", "지식탐험", "미니게임"].forEach((category) => {
        const heading = document.createElement("h3");
        heading.className = "mode-section-title";
        heading.textContent = category;
        grid.append(heading);
        Object.entries(MODES).filter((entry) => entry[1].category === category).forEach(([mode, meta]) => {
            grid.append(cardButton(meta.name, meta.description, meta.colors, () => selectMode(mode), mode === "space" ? 722 : MODE_MASCOTS[mode]));
        });
    });
    showScreen("mode");
}
const DAILY_MODE_POOL = ["quiz", "space", "knowledge", "ox", "mole", "balloon", "rain", "snack"];
function dailyModes() {
    const day = Math.floor(Date.now() / 86400000);
    const start = day % DAILY_MODE_POOL.length;
    return [0, 2, 4].map((offset) => DAILY_MODE_POOL[(start + offset) % DAILY_MODE_POOL.length]);
}
function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}
function ensureSelectedGrade() {
    if (state.grade !== null)
        return state.grade;
    const last = readLastPlay();
    state.grade = last?.grade ?? 1;
    return state.grade;
}
function openToday() {
    cleanupGame();
    setActiveNav("today");
    const grade = ensureSelectedGrade();
    const modes = dailyModes();
    const completed = new Set(readRecords().filter((record) => record.timestamp >= startOfToday()).map((record) => record.mode));
    const done = modes.filter((mode) => completed.has(mode)).length;
    byId("todayGrade").textContent = gradeName(grade) + " 임무";
    byId("todayGreeting").textContent = (getName() || "친구") + "님, 오늘도 탐험을 시작해 볼까요?";
    byId("todayBadge").textContent = done === 3 ? "오늘의 배지 획득!" : done + " / 3 완료";
    byId("todayBadge").classList.toggle("complete", done === 3);
    replaceWithTrainer(byId("todayPartner"), "ash.png", "지우");
    replaceWithTrainer(byId("todayRivals"), TEAM_ROCKET_TRAINER_ASSET, "로이와 로사");
    const grid = byId("todayMissionGrid");
    grid.replaceChildren();
    modes.forEach((mode, index) => {
        const meta = MODES[mode];
        const button = cardButton((index + 1) + "번째 임무 · " + meta.name, completed.has(mode) ? "완료했어요! 다시 도전할 수 있어요." : meta.description, meta.colors, () => {
            state.grade = grade;
            state.mode = mode;
            startSelectedGame();
        }, MODE_MASCOTS[mode]);
        button.classList.add("today-mission");
        if (completed.has(mode))
            button.classList.add("mission-complete");
        grid.append(button);
    });
    showScreen("today");
}
const TYPE_NAMES = {
    normal: "노말", fire: "불꽃", water: "물", electric: "전기", grass: "풀", ice: "얼음", fighting: "격투", poison: "독",
    ground: "땅", flying: "비행", psychic: "에스퍼", bug: "벌레", rock: "바위", ghost: "고스트", dragon: "드래곤", dark: "악", steel: "강철", fairy: "페어리"
};
const TYPE_IDS = {
    normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6, bug: 7, ghost: 8, steel: 9,
    fire: 10, water: 11, grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
};
function typeIconUrl(type) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/" + TYPE_IDS[type] + ".png";
}
function spriteUrl(id) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}
function pokemonAvatarMedia(pokemon) {
    const media = pokemonMedia(pokemon);
    const image = media.querySelector("img");
    if (image) {
        image.src = spriteUrl(pokemon.id);
        image.style.imageRendering = "pixelated";
    }
    return media;
}
function discoveredPokemonCountAtStars(stars) {
    const progress = getTrainerProgress(Math.max(0, Math.floor(stars)));
    return unlockedPokemonCountAtLevel(progress.current.level);
}
function discoveredPokemonCount() {
    return discoveredPokemonCountAtStars(getLifetimeStars());
}
function celebratedPokemonCount() {
    const discovered = discoveredPokemonCount();
    const raw = safeGet(STORAGE.celebratedPokemon);
    const stored = raw === null || raw.trim() === "" ? Number.NaN : Number(raw);
    if (Number.isFinite(stored) && stored >= 0)
        return Math.min(discovered, Math.floor(stored));
    const initial = discovered > 1 ? discovered - 1 : discovered;
    safeSet(STORAGE.celebratedPokemon, String(initial));
    return initial;
}
function markPokemonDiscoveryCelebrated(count = discoveredPokemonCount()) {
    safeSet(STORAGE.celebratedPokemon, String(Math.max(0, Math.min(POKEMON.length, Math.floor(count)))));
}
let pokedexFilter = "all";
let pokedexQuery = "";
let trainerAlbumQuery = "";
let collectionView = "pokemon";
let pokedexDetailRequest = 0;
let pokedexDetailController = null;
function syncCollectionFilterButtons() {
    document.querySelectorAll("[data-pokedex-filter]").forEach((button) => {
        const active = button.dataset.pokedexFilter === pokedexFilter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}
function renderPokedexGrid(unlocked) {
    const grid = byId("pokedexGrid");
    grid.classList.remove("trainer-album-grid");
    const query = pokedexQuery.trim().toLocaleLowerCase("ko-KR");
    const visible = POKEMON.map((pokemon, index) => ({ pokemon, index })).filter(({ pokemon, index }) => {
        const discovered = index < unlocked;
        if (pokedexFilter === "discovered" && !discovered)
            return false;
        if (pokedexFilter === "locked" && discovered)
            return false;
        if (!query)
            return true;
        const matchesNumber = String(pokemon.id).includes(query);
        const matchesKnownName = discovered && pokemon.name.toLocaleLowerCase("ko-KR").includes(query);
        return matchesNumber || matchesKnownName;
    });
    grid.replaceChildren();
    visible.forEach(({ pokemon, index }) => {
        const discovered = index < unlocked;
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.pokemonId = String(pokemon.id);
        button.className = "pokedex-entry " + (discovered ? "discovered" : "locked");
        button.disabled = !discovered;
        button.setAttribute("aria-label", discovered ? "No." + pokemon.id + " " + pokemon.name + " 자세히 보기" : "No." + pokemon.id + " 미발견 포켓몬");
        const image = document.createElement("img");
        image.src = spriteUrl(pokemon.id);
        image.alt = discovered ? pokemon.name : "발견하지 않은 포켓몬";
        image.loading = "lazy";
        const number = document.createElement("small");
        number.textContent = "No." + String(pokemon.id).padStart(3, "0");
        const name = document.createElement("strong");
        name.textContent = discovered ? pokemon.name : "???";
        button.append(image, number, name);
        if (discovered && index === unlocked - 1 && unlocked < POKEMON.length) {
            const newBadge = document.createElement("span");
            newBadge.className = "pokedex-new-badge";
            newBadge.textContent = "NEW";
            button.append(newBadge);
        }
        if (discovered)
            button.addEventListener("click", () => loadPokedexDetail(pokemon, button));
        grid.append(button);
    });
    if (!visible.length) {
        const empty = document.createElement("p");
        empty.className = "pokedex-empty";
        empty.textContent = query ? "검색 조건에 맞는 포켓몬이 없어요." : "이 조건에 해당하는 포켓몬이 없어요.";
        grid.append(empty);
    }
    byId("pokedexVisibleCount").textContent = visible.length + "마리 표시";
    grid.setAttribute("aria-label", pokedexFilter === "all" ? "전체 포켓몬 목록" : pokedexFilter === "discovered" ? "발견한 포켓몬 목록" : "미발견 포켓몬 목록");
    syncCollectionFilterButtons();
}
function renderTrainerAlbumGrid(unlocked) {
    const grid = byId("pokedexGrid");
    grid.classList.add("trainer-album-grid");
    const query = trainerAlbumQuery.trim().toLocaleLowerCase("ko-KR");
    const visible = TRAINER_CHOICES.map((trainer, index) => ({ trainer, index })).filter(({ trainer, index }) => {
        const discovered = index < unlocked;
        if (pokedexFilter === "discovered" && !discovered)
            return false;
        if (pokedexFilter === "locked" && discovered)
            return false;
        if (!query)
            return true;
        const requiredLevel = trainerUnlockLevel(index);
        const matchesLevel = String(requiredLevel).includes(query.replace(/\D/g, ""));
        const matchesKnownProfile = discovered && (trainer.name + " " + trainer.region).toLocaleLowerCase("ko-KR").includes(query);
        return matchesKnownProfile || (query.replace(/\D/g, "").length > 0 && matchesLevel);
    });
    grid.replaceChildren();
    visible.forEach(({ trainer, index }) => {
        const discovered = index < unlocked;
        const representative = discovered && trainer.id === getTrainerChoice().id;
        const button = document.createElement("button");
        button.type = "button";
        button.disabled = !discovered;
        button.dataset.trainerId = trainer.id;
        button.className = "pokedex-entry trainer-album-entry " + (discovered ? "discovered" : "locked") + (representative ? " representative" : "");
        const requiredLevel = trainerUnlockLevel(index);
        button.setAttribute("aria-label", discovered ? trainer.name + " 트레이너 자세히 보기 · " + trainer.region : "레벨 " + requiredLevel + "에 획득하는 트레이너");
        const media = trainerMedia(trainer.file, discovered ? trainer.name : "미획득 트레이너", "trainer-album-thumb");
        const unlock = document.createElement("small");
        unlock.textContent = discovered ? trainer.region + " · Lv." + requiredLevel : "Lv." + requiredLevel + " 획득";
        const name = document.createElement("strong");
        name.textContent = discovered ? trainer.name : "???";
        button.append(media, unlock, name);
        if (representative) {
            const badge = document.createElement("span");
            badge.className = "trainer-current-badge";
            badge.textContent = "대표";
            button.append(badge);
        }
        else if (discovered && index === unlocked - 1 && unlocked < TRAINER_CHOICES.length) {
            const badge = document.createElement("span");
            badge.className = "pokedex-new-badge";
            badge.textContent = "NEW";
            button.append(badge);
        }
        if (discovered)
            button.addEventListener("click", () => loadTrainerAlbumDetail(trainer, index, button));
        grid.append(button);
    });
    if (!visible.length) {
        const empty = document.createElement("p");
        empty.className = "pokedex-empty";
        empty.textContent = query ? "검색 조건에 맞는 트레이너가 없어요." : "이 조건에 해당하는 트레이너가 없어요.";
        grid.append(empty);
    }
    byId("pokedexVisibleCount").textContent = visible.length + "명 표시";
    grid.setAttribute("aria-label", pokedexFilter === "all" ? "전체 트레이너 목록" : pokedexFilter === "discovered" ? "획득한 트레이너 목록" : "미획득 트레이너 목록");
    syncCollectionFilterButtons();
}
function renderPokedexIntro(unlocked) {
    const detail = byId("pokedexDetail");
    detail.className = "pokedex-detail pokedex-intro";
    detail.replaceChildren();
    const oak = trainerMedia("oak.png", "오박사", "pokedex-oak");
    const copy = document.createElement("div");
    copy.className = "pokedex-intro-copy";
    const kicker = document.createElement("span");
    kicker.className = "pokedex-intro-kicker";
    kicker.textContent = "OAK'S RESEARCH";
    const title = document.createElement("h3");
    title.textContent = "오박사의 연구 노트";
    const message = document.createElement("p");
    message.textContent = "5배수 레벨 외에는 인기순 새 포켓몬을 발견해요. 보유 포켓몬을 선택해 보세요.";
    const progress = document.createElement("div");
    progress.className = "pokedex-intro-progress";
    const progressLabel = document.createElement("span");
    progressLabel.textContent = "도감 완성도 " + Math.round(unlocked / POKEMON.length * 100) + "%";
    const progressTrack = document.createElement("div");
    const progressFill = document.createElement("i");
    progressFill.style.width = unlocked / POKEMON.length * 100 + "%";
    progressFill.style.minWidth = unlocked > 0 ? ".75rem" : "0";
    progressTrack.append(progressFill);
    const stats = document.createElement("div");
    stats.className = "pokedex-intro-stats";
    [[String(unlocked), "발견"], [String(POKEMON.length - unlocked), "남은 포켓몬"]].forEach(([value, label]) => {
        const stat = document.createElement("span");
        const strong = document.createElement("b");
        strong.textContent = value;
        stat.append(strong, label);
        stats.append(stat);
    });
    const tip = document.createElement("small");
    const nextPokemon = POKEMON[unlocked];
    tip.textContent = unlocked >= POKEMON.length ? "도감을 완성했어요!" : "다음: " + nextPokemon.name + " · Lv." + (unlocked + 1 + Math.floor(unlocked / 4)) + "에 발견";
    progress.append(progressLabel, progressTrack);
    copy.append(kicker, title, message, progress, stats, tip);
    detail.append(oak, copy);
}
function renderTrainerAlbumIntro(unlocked) {
    const detail = byId("pokedexDetail");
    detail.className = "pokedex-detail pokedex-intro trainer-album-detail trainer-album-intro";
    detail.replaceChildren();
    const selectedTrainer = getTrainerChoice();
    const hero = trainerMedia(selectedTrainer.file, selectedTrainer.name, "pokedex-oak trainer-album-hero");
    const copy = document.createElement("div");
    copy.className = "pokedex-intro-copy";
    const kicker = document.createElement("span");
    kicker.className = "pokedex-intro-kicker";
    kicker.textContent = "TRAINER COLLECTION";
    const title = document.createElement("h3");
    title.textContent = "나의 트레이너 앨범";
    const message = document.createElement("p");
    message.textContent = "5레벨마다 인기순으로 새로운 트레이너를 만나며, 획득한 트레이너의 전신 모습을 감상할 수 있어요.";
    const progress = document.createElement("div");
    progress.className = "pokedex-intro-progress";
    const progressLabel = document.createElement("span");
    progressLabel.textContent = "앨범 완성도 " + Math.round(unlocked / TRAINER_CHOICES.length * 100) + "%";
    const progressTrack = document.createElement("div");
    const progressFill = document.createElement("i");
    progressFill.style.width = unlocked / TRAINER_CHOICES.length * 100 + "%";
    progressFill.style.minWidth = unlocked > 0 ? ".75rem" : "0";
    progressTrack.append(progressFill);
    const stats = document.createElement("div");
    stats.className = "pokedex-intro-stats";
    [[String(unlocked), "획득"], [String(TRAINER_CHOICES.length - unlocked), "남은 트레이너"]].forEach(([value, label]) => {
        const stat = document.createElement("span");
        const strong = document.createElement("b");
        strong.textContent = value;
        stat.append(strong, label);
        stats.append(stat);
    });
    const tip = document.createElement("small");
    const nextTrainer = TRAINER_CHOICES[unlocked];
    tip.textContent = unlocked >= TRAINER_CHOICES.length ? "트레이너 앨범을 완성했어요!" : "다음 만남: " + nextTrainer.name + " · Lv." + trainerUnlockLevel(unlocked) + "에 획득";
    progress.append(progressLabel, progressTrack);
    copy.append(kicker, title, message, progress, stats, tip);
    detail.append(hero, copy);
}
function setCollectionView(view) {
    collectionView = view;
    pokedexDetailController?.abort();
    pokedexDetailController = null;
    pokedexDetailRequest += 1;
    const pokemonView = view === "pokemon";
    const pokemonTab = byId("collectionPokemonTab");
    const trainerTab = byId("collectionTrainerTab");
    pokemonTab.classList.toggle("active", pokemonView);
    trainerTab.classList.toggle("active", !pokemonView);
    pokemonTab.setAttribute("aria-selected", String(pokemonView));
    trainerTab.setAttribute("aria-selected", String(!pokemonView));
    byId("collectionEyebrow").textContent = pokemonView ? "POKÉDEX" : "TRAINER ALBUM";
    byId("collectionTitle").textContent = pokemonView ? "나의 포켓몬 도감" : "나의 트레이너 앨범";
    byId("collectionSearchLabel").textContent = pokemonView ? "포켓몬 찾기" : "트레이너 찾기";
    byId("collectionOwnedFilter").textContent = pokemonView ? "발견" : "획득";
    byId("collectionLockedFilter").textContent = pokemonView ? "미발견" : "미획득";
    document.querySelector("#screen-pokedex .pokedex-tools")?.setAttribute("aria-label", pokemonView ? "포켓몬 검색과 필터" : "트레이너 검색과 필터");
    document.querySelector("#screen-pokedex .pokedex-filters")?.setAttribute("aria-label", pokemonView ? "발견 상태 필터" : "획득 상태 필터");
    const search = byId("pokedexSearch");
    search.placeholder = pokemonView ? "이름 또는 도감 번호" : "이름·지역 또는 획득 레벨";
    search.value = pokemonView ? pokedexQuery : trainerAlbumQuery;
    byId("pokedexGrid").classList.toggle("trainer-album-grid", !pokemonView);
    if (pokemonView) {
        const unlocked = discoveredPokemonCount();
        byId("pokedexCount").textContent = unlocked + " / " + POKEMON.length + " 발견";
        renderPokedexGrid(unlocked);
        renderPokedexIntro(unlocked);
    }
    else {
        const unlocked = unlockedTrainerCountAtLevel(getTrainerProgress().current.level);
        byId("pokedexCount").textContent = unlocked + " / " + TRAINER_CHOICES.length + " 획득";
        renderTrainerAlbumGrid(unlocked);
        renderTrainerAlbumIntro(unlocked);
    }
}
function openPokedex() {
    cleanupGame();
    setActiveNav("pokedex");
    showScreen("pokedex");
    setCollectionView(collectionView);
    const unlocked = discoveredPokemonCount();
    const celebrated = celebratedPokemonCount();
    if (collectionView === "pokemon" && unlocked > celebrated) {
        const missedDiscoveries = POKEMON.slice(celebrated, unlocked);
        window.setTimeout(() => showPokemonDiscoveryPopup(missedDiscoveries), 520);
    }
}
function loadTrainerAlbumDetail(trainer, index, selected) {
    document.querySelectorAll(".trainer-album-entry").forEach((entry) => entry.classList.remove("selected"));
    selected.classList.add("selected");
    const detail = byId("pokedexDetail");
    detail.className = "pokedex-detail trainer-album-detail";
    detail.replaceChildren();
    if (window.matchMedia("(max-width: 700px)").matches) {
        window.requestAnimationFrame(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    const hero = trainerMedia(trainer.file, trainer.name, "trainer-album-hero");
    const heading = document.createElement("div");
    heading.className = "trainer-album-copy";
    const number = document.createElement("small");
    number.textContent = "TRAINER " + String(index + 1).padStart(2, "0") + " · 인기 컬렉션";
    const title = document.createElement("h3");
    title.textContent = trainer.name;
    const region = document.createElement("p");
    region.className = "trainer-album-region";
    region.textContent = trainer.region + " 트레이너";
    heading.append(number, title, region);
    const description = document.createElement("p");
    description.className = "pokedex-description trainer-album-description";
    description.textContent = "모험을 함께할 대표 트레이너로 선택하거나, 획득한 전신 모습을 천천히 감상해 보세요.";
    const facts = document.createElement("div");
    facts.className = "pokedex-facts trainer-album-facts";
    [[trainer.region, "활동 지역"], ["Lv." + trainerUnlockLevel(index), "획득 레벨"], [String(index + 1) + "번째", "인기 순서"]].forEach(([value, label]) => {
        const item = document.createElement("span");
        const strong = document.createElement("b");
        strong.textContent = value;
        item.append(strong, label);
        facts.append(item);
    });
    const select = document.createElement("button");
    select.type = "button";
    select.className = "trainer-album-select";
    const selectedTrainer = trainer.id === getTrainerChoice().id;
    select.disabled = selectedTrainer;
    select.textContent = selectedTrainer ? "현재 대표 트레이너" : "대표 트레이너로 설정";
    select.addEventListener("click", () => {
        setTrainerChoice(trainer.id);
        updateSideInfo();
        selectSound();
        showToast(trainer.name + " 트레이너와 함께 모험해요!");
        document.querySelectorAll(".trainer-album-entry").forEach((entry) => {
            const representative = entry.dataset.trainerId === trainer.id;
            entry.classList.toggle("representative", representative);
            entry.querySelector(".trainer-current-badge")?.remove();
            if (representative) {
                entry.querySelector(".pokedex-new-badge")?.remove();
                const badge = document.createElement("span");
                badge.className = "trainer-current-badge";
                badge.textContent = "대표";
                entry.append(badge);
            }
        });
        select.disabled = true;
        select.textContent = "현재 대표 트레이너";
    });
    detail.append(hero, heading, description, facts, select);
}
async function loadPokedexDetail(pokemon, selected) {
    pokedexDetailController?.abort();
    const controller = new AbortController();
    pokedexDetailController = controller;
    const request = ++pokedexDetailRequest;
    document.querySelectorAll(".pokedex-entry").forEach((entry) => entry.classList.remove("selected"));
    selected.classList.add("selected");
    const detail = byId("pokedexDetail");
    detail.replaceChildren();
    detail.className = "pokedex-detail";
    if (window.matchMedia("(max-width: 700px)").matches) {
        window.requestAnimationFrame(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    const loading = document.createElement("p");
    loading.textContent = pokemon.name + "의 도감 정보를 불러오는 중...";
    detail.append(loading);
    playPokemonCry(pokemon.id, .18);
    try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetchWithTimeout("https://pokeapi.co/api/v2/pokemon/" + pokemon.id, { signal: controller.signal }, 10000),
            fetchWithTimeout("https://pokeapi.co/api/v2/pokemon-species/" + pokemon.id, { signal: controller.signal }, 10000)
        ]);
        if (!pokemonResponse.ok || !speciesResponse.ok)
            throw new Error("PokeAPI response error");
        const data = await pokemonResponse.json();
        const species = await speciesResponse.json();
        if (request !== pokedexDetailRequest || controller.signal.aborted)
            return;
        const genus = species.genera.find((entry) => entry.language.name === "ko")?.genus ?? "포켓몬";
        const flavor = species.flavor_text_entries.find((entry) => entry.language.name === "ko")?.flavor_text.replace(/[\n\f]/g, " ") ?? "도감 설명을 준비하고 있어요.";
        detail.replaceChildren();
        const image = document.createElement("img");
        image.src = pokemonUrl(pokemon.id);
        image.alt = pokemon.name;
        const heading = document.createElement("div");
        const number = document.createElement("small");
        number.textContent = "No." + String(pokemon.id).padStart(3, "0") + " · " + genus;
        const title = document.createElement("h3");
        title.textContent = pokemon.name;
        const typeArtwork = document.createElement("div");
        typeArtwork.className = "pokedex-type-artwork";
        typeArtwork.setAttribute("aria-label", data.types.map((entry) => TYPE_NAMES[entry.type.name] ?? entry.type.name).join(", ") + " 타입");
        data.types.forEach((entry) => {
            const typeName = entry.type.name;
            const typeImage = document.createElement("img");
            typeImage.src = typeIconUrl(typeName);
            typeImage.alt = (TYPE_NAMES[typeName] ?? typeName) + " 타입";
            typeImage.loading = "lazy";
            typeImage.addEventListener("error", () => {
                typeImage.replaceWith(Object.assign(document.createElement("span"), { textContent: TYPE_NAMES[typeName] ?? typeName }));
            }, { once: true });
            typeArtwork.append(typeImage);
        });
        const types = document.createElement("p");
        types.className = "pokedex-types";
        types.textContent = data.types.map((entry) => TYPE_NAMES[entry.type.name] ?? entry.type.name).join(" · ");
        heading.append(number, title, types);
        const facts = document.createElement("div");
        facts.className = "pokedex-facts";
        [[(data.height / 10).toFixed(1) + " m", "키"], [(data.weight / 10).toFixed(1) + " kg", "몸무게"], [data.abilities.length + "개", "특성"]].forEach(([value, label]) => {
            const item = document.createElement("span");
            const strong = document.createElement("b");
            strong.textContent = value;
            item.append(strong, label);
            facts.append(item);
        });
        const description = document.createElement("p");
        description.className = "pokedex-description";
        description.textContent = flavor;
        detail.append(typeArtwork, image, heading, description, facts);
    }
    catch {
        if (request !== pokedexDetailRequest || controller.signal.aborted)
            return;
        detail.replaceChildren();
        const fallback = document.createElement("p");
        fallback.textContent = "인터넷 연결이 원활하지 않아 상세 정보를 불러오지 못했어요. 잠시 후 다시 선택해 주세요.";
        detail.append(fallback);
    }
    finally {
        if (request === pokedexDetailRequest)
            pokedexDetailController = null;
    }
}
function reportMetric(value, label) {
    const card = document.createElement("div");
    card.className = "report-metric";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const text = document.createElement("span");
    text.textContent = label;
    card.append(strong, text);
    return card;
}
function openReport() {
    cleanupGame();
    setActiveNav("report");
    const records = readRecords();
    const recent = records.filter((record) => record.timestamp >= Date.now() - 7 * 86400000);
    const stars = getLifetimeStars();
    const summary = byId("reportSummary");
    summary.replaceChildren(reportMetric(String(records.length), "전체 플레이"), reportMetric(String(recent.length), "최근 7일"), reportMetric(String(stars), "모은 별"), reportMetric(String(discoveredPokemonCount()), "발견 포켓몬"));
    const categories = ["암산·수 연산", "도형·공간", "지식탐험", "미니게임"];
    const bars = byId("reportBars");
    bars.replaceChildren();
    let weakest = categories[0];
    let weakestAverage = Number.POSITIVE_INFINITY;
    categories.forEach((category) => {
        const rows = records.filter((record) => MODES[record.mode].category === category);
        const average = rows.length ? rows.reduce((sum, row) => sum + row.stars, 0) / (rows.length * 3) * 100 : 0;
        if (average < weakestAverage) {
            weakestAverage = average;
            weakest = category;
        }
        const row = document.createElement("div");
        row.className = "report-bar-row";
        const label = document.createElement("span");
        label.textContent = category;
        const track = document.createElement("div");
        const fill = document.createElement("i");
        fill.style.width = Math.round(average) + "%";
        track.append(fill);
        const value = document.createElement("b");
        value.textContent = rows.length ? Math.round(average) + "%" : "첫 도전 전";
        row.append(label, track, value);
        bars.append(row);
    });
    const advice = byId("reportAdvice");
    advice.replaceChildren();
    const title = document.createElement("strong");
    const copy = document.createElement("p");
    if (!records.length) {
        title.textContent = "첫 탐험을 시작해 보세요";
        copy.textContent = "오늘의 10분 탐험을 완료하면 영역별 성장 기록이 나타나요.";
    }
    else {
        title.textContent = weakest + " 영역을 연습해 볼까요?";
        copy.textContent = "낮은 점수는 부족함이 아니라 다음에 성장할 위치를 알려 주는 지도예요.";
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "오늘의 탐험으로 연습하기";
    button.addEventListener("click", openToday);
    advice.append(title, copy, button);
    showScreen("report");
}
function selectMode(mode) {
    state.mode = mode;
    if (state.grade === null) {
        openGrades();
        return;
    }
    state.diff = "easy";
    startSelectedGame();
}
function difficultyForProgress(progress) {
    if (progress < 1 / 3)
        return "easy";
    if (progress < 2 / 3)
        return "normal";
    return "hard";
}
function difficultyForElapsed(started, durationSeconds) {
    return difficultyForProgress(Math.min(1, ((performance.now() - started) / 1000) / durationSeconds));
}
function randomOperationProblem(grade, diff) {
    const level = diff === "easy" ? 0 : diff === "normal" ? 1 : 2;
    if (grade === 0) {
        if (Math.random() < .55) {
            const a = randomInt(1, 5 + level * 2);
            const b = randomInt(1, Math.max(1, 10 - a));
            return { display: a + " + " + b, answer: a + b };
        }
        const a = randomInt(3, 10);
        const b = randomInt(1, a);
        return { display: a + " - " + b, answer: a - b };
    }
    if (grade === 1) {
        if (Math.random() < .5) {
            const a = randomInt(2, 10 + level * 6);
            const b = randomInt(1, 9);
            return { display: a + " + " + b, answer: a + b };
        }
        const a = randomInt(8, 20 + level * 5);
        const b = randomInt(1, a);
        return { display: a + " - " + b, answer: a - b };
    }
    if (grade === 2) {
        const roll = Math.random();
        if (roll < .36) {
            const a = randomInt(12, 70 + level * 100);
            const b = randomInt(10, 40 + level * 80);
            return { display: a + " + " + b, answer: a + b };
        }
        if (roll < .7) {
            const a = randomInt(35, 99 + level * 200);
            const b = randomInt(10, a);
            return { display: a + " - " + b, answer: a - b };
        }
        const a = randomInt(2, 5 + level * 2);
        const b = randomInt(2, 9);
        return { display: a + " × " + b, answer: a * b };
    }
    if (grade === 3 || grade === 4) {
        const maxA = grade === 3 ? 49 + level * 50 : 199 + level * 300;
        if (Math.random() < .55) {
            const a = randomInt(11, maxA);
            const b = randomInt(2, grade === 3 ? 9 + level * 10 : 12 + level * 25);
            return { display: a + " × " + b, answer: a * b };
        }
        const divisor = randomInt(2, grade === 3 ? 9 : 25 + level * 20);
        const quotient = randomInt(2, grade === 3 ? 30 + level * 30 : 60 + level * 90);
        return { display: (divisor * quotient) + " ÷ " + divisor, answer: quotient };
    }
    const a = randomInt(3, 20 + level * 20);
    const b = randomInt(2, 12 + level * 12);
    const c = randomInt(2, 9 + level * 5);
    if (grade === 5) {
        if (Math.random() < .5)
            return { display: "(" + a + " + " + b + ") × " + c, answer: (a + b) * c };
        return { display: (a * c) + " ÷ " + c + " + " + b, answer: a + b };
    }
    if (Math.random() < .5)
        return { display: a + " × " + b + " - " + c, answer: a * b - c };
    return { display: "(" + a + " + " + b + ") × " + c + " - " + b, answer: (a + b) * c - b };
}
function newProblem(difficulty = "easy") {
    return randomOperationProblem(state.grade ?? 0, difficulty);
}
function choicesFor(answer) {
    const spread = answer < 20 ? 5 : answer < 100 ? 12 : answer < 1000 ? 45 : 150;
    const values = new Set([answer]);
    while (values.size < 4) {
        const candidate = answer + randomInt(-spread, spread);
        if (candidate >= 0)
            values.add(candidate);
    }
    return shuffle(Array.from(values));
}
function startSelectedGame(reviewCurrentGame = false) {
    if (state.grade === null || state.mode === null) {
        openGrades();
        return;
    }
    cleanupGame();
    state.diff = "easy";
    saveLastPlay();
    startMusic();
    playPokemonCry(MODE_MASCOTS[state.mode], .16);
    pokemonSparkBurst(12);
    if (state.mode === "quiz")
        startQuiz(reviewCurrentGame ? quizReviewProblems ?? undefined : undefined);
    if (state.mode === "rain") {
        replaceWithTrainer(byId("rainTrainer"), "misty.png", "이슬이");
        startRain();
    }
    if (state.mode === "mole")
        startMole();
    if (state.mode === "memory")
        startMemory();
    if (state.mode === "ox")
        startOx();
    if (state.mode === "balloon")
        startBalloon();
    if (state.mode === "space") {
        const spaceMascot = byId("spaceTrainer");
        const rowlet = document.createElement("img");
        rowlet.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png";
        rowlet.alt = "나몰빼미";
        rowlet.loading = "eager";
        spaceMascot.replaceChildren(rowlet);
        startSpace(reviewCurrentGame ? spaceReviewQuestions ?? undefined : undefined);
    }
    if (state.mode === "mine")
        startMine();
    if (state.mode === "knowledge")
        startKnowledge(reviewCurrentGame ? knowledgeReviewQuestions ?? undefined : undefined);
    if (state.mode === "symmetry")
        startSymmetry();
    if (state.mode === "coordinate")
        startCoordinate();
    if (state.mode === "history")
        startHistory(reviewCurrentGame ? historyReviewEvents ?? undefined : undefined);
    if (state.mode === "safety")
        startSafety(reviewCurrentGame ? safetyReviewQuestions ?? undefined : undefined);
    if (state.mode === "snack")
        startSnack();
}
function keypad(onNumber, onDelete, onEnter) {
    const grid = document.createElement("div");
    grid.className = "keypad";
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"].forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "key-button";
        button.textContent = value;
        button.addEventListener("click", () => onNumber(value));
        grid.append(button);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "key-button delete";
    remove.textContent = "⌫";
    remove.setAttribute("aria-label", "한 글자 지우기");
    remove.addEventListener("click", onDelete);
    const zero = document.createElement("button");
    zero.type = "button";
    zero.className = "key-button";
    zero.textContent = "0";
    zero.addEventListener("click", () => onNumber("0"));
    const enter = document.createElement("button");
    enter.type = "button";
    enter.className = "key-button enter";
    enter.textContent = "확인";
    enter.addEventListener("click", onEnter);
    grid.append(remove, zero, enter);
    return grid;
}
let quiz = null;
let quizReviewProblems = null;
function stopQuiz() {
    if (quiz?.timer !== null && quiz?.timer !== undefined)
        window.clearInterval(quiz.timer);
    if (quiz)
        quiz.timer = null;
}
function showThemedGameScene(theme, title, subtitle, duration = 1300) {
    document.querySelector(".themed-game-scene")?.remove();
    const scene = document.createElement("div");
    scene.className = "themed-game-scene";
    scene.dataset.theme = theme;
    scene.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    copy.className = "themed-game-scene-copy";
    const label = document.createElement("span");
    const labels = {
        quiz: "PIKACHU MATH CLASS",
        balloon: "JIGGLYPUFF SKY CONCERT",
        coordinate: "PORYGON DATA LAB",
        ox: "PSYDUCK ERROR LAB",
        mole: "DIGLETT CAVE EXPEDITION",
        mine: "VOLTORB MEADOW SEARCH",
        symmetry: "PACHIRISU SYMMETRY LAB",
        space: "ROWLET FOREST OBSERVATORY",
        memory: "DITTO TRANSFORM LAB"
    };
    label.textContent = labels[theme];
    const heading = document.createElement("strong");
    heading.textContent = title;
    const detail = document.createElement("small");
    detail.textContent = subtitle;
    copy.append(label, heading, detail);
    scene.append(copy);
    document.body.append(scene);
    window.setTimeout(() => scene.remove(), duration);
}
function startQuiz(reviewProblems) {
    const questions = reviewProblems?.length ? reviewProblems.slice() : Array.from({ length: 10 }, (_, index) => newProblem(difficultyForProgress(index / 9)));
    quizReviewProblems = null;
    quiz = { index: 0, score: 0, correct: 0, streak: 0, best: 0, input: "", locked: false, started: Date.now(), questionStarted: Date.now(), current: null, choiceMode: false, results: [], timer: null, questions, answers: [], isReview: Boolean(reviewProblems?.length) };
    replaceWithPokemon(byId("quizMascot"), 25);
    showScreen("quiz");
    showThemedGameScene("quiz", "피카츄 암산 수업", "빈 칠판에 나타나는 문제를 해결해요!", 1200);
    quiz.timer = appSetInterval(updateQuizTimer, 500);
    nextQuizQuestion();
}
function updateQuizTimer() {
    if (!quiz)
        return;
    const seconds = Math.floor((Date.now() - quiz.started) / 1000);
    byId("quizTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    if (seconds >= MAX_GAME_SECONDS)
        finishQuiz();
}
function renderQuizDots() {
    if (!quiz)
        return;
    const dots = byId("quizDots");
    dots.replaceChildren();
    for (let index = 0; index < quiz.questions.length; index += 1) {
        const dot = document.createElement("span");
        dot.className = "quiz-dot";
        if (quiz.results[index] === "c")
            dot.classList.add("correct");
        if (quiz.results[index] === "w")
            dot.classList.add("wrong");
        if (index === quiz.index)
            dot.classList.add("current");
        dots.append(dot);
    }
}
function nextQuizQuestion() {
    if (!quiz)
        return;
    if (quiz.index >= quiz.questions.length) {
        finishQuiz();
        return;
    }
    quiz.current = quiz.questions[quiz.index];
    quiz.input = "";
    quiz.locked = false;
    quiz.choiceMode = Math.random() < (state.grade !== null && state.grade <= 2 ? .6 : .45);
    quiz.questionStarted = Date.now();
    renderQuizCharge();
    byId("quizProblem").textContent = quiz.current.display + " = ?";
    byId("quizAnswer").textContent = "?";
    byId("quizAnswer").className = "answer-display";
    byId("quizFeedback").textContent = "";
    byId("quizScore").textContent = String(quiz.score);
    byId("quizCount").textContent = "문제 " + (quiz.index + 1) + "/" + quiz.questions.length;
    byId("quizStreak").textContent = quiz.streak >= 2 ? quiz.streak + "연속 정답!" : "";
    renderQuizDots();
    const controls = byId("quizControls");
    controls.replaceChildren();
    if (quiz.choiceMode) {
        const list = document.createElement("div");
        list.className = "choice-list";
        choicesFor(quiz.current.answer).forEach((value) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "choice-button";
            button.textContent = String(value);
            button.addEventListener("click", () => answerQuiz(value, button));
            list.append(button);
        });
        controls.append(list);
    }
    else {
        controls.append(keypad((value) => {
            if (!quiz || quiz.locked || quiz.input.length >= 7)
                return;
            quiz.input += value;
            byId("quizAnswer").textContent = quiz.input;
            tapSound();
        }, () => {
            if (!quiz || quiz.locked)
                return;
            quiz.input = quiz.input.slice(0, -1);
            byId("quizAnswer").textContent = quiz.input || "?";
        }, () => {
            if (!quiz || !quiz.input)
                return;
            answerQuiz(Number(quiz.input), null);
        }));
    }
}
function renderQuizCharge() {
    if (!quiz)
        return;
    const charge = Math.min(5, quiz.streak);
    byId("quizChargeBar").style.width = `${charge * 20}%`;
    byId("quizChargeText").textContent = charge >= 5 ? "MAX!" : `${charge} / 5`;
    document.querySelector("#screen-quiz .problem-card")?.classList.toggle("charged", charge >= 5);
}
function answerQuiz(value, selected) {
    if (!quiz || quiz.locked || !quiz.current)
        return;
    const correct = value === quiz.current.answer;
    const answer = byId("quizAnswer");
    quiz.locked = true;
    quiz.answers.push({ problem: quiz.current, selected: value, correct });
    const buttons = Array.from(byId("quizControls").querySelectorAll(".choice-button"));
    buttons.forEach((button) => {
        button.disabled = true;
        if (Number(button.textContent) === quiz?.current?.answer)
            button.classList.add("correct");
    });
    if (correct) {
        const seconds = (Date.now() - quiz.questionStarted) / 1000;
        const baseScore = 100 + (seconds < 7 ? 30 : 0) + quiz.streak * 10;
        const gained = baseScore;
        quiz.score += gained;
        quiz.correct += 1;
        quiz.streak += 1;
        if (quiz.streak === 5) {
            quiz.score += 200;
            pokemonSparkBurst(25);
            playPokemonCry(25);
        }
        renderQuizCharge();
        quiz.best = Math.max(quiz.best, quiz.streak);
        quiz.results[quiz.index] = "c";
        answer.classList.add("correct");
        answer.textContent = String(value);
        byId("quizFeedback").textContent = "정답이에요! +" + gained;
        if (selected)
            selected.classList.add("correct");
        correctSound();
    }
    else {
        quiz.streak = 0;
        quiz.results[quiz.index] = "w";
        answer.classList.add("wrong");
        answer.textContent = String(value);
        byId("quizFeedback").textContent = "정답은 " + quiz.current.answer + "예요.";
        if (selected)
            selected.classList.add("wrong");
        wrongSound();
    }
    renderQuizDots();
    window.setTimeout(() => {
        if (!quiz)
            return;
        quiz.index += 1;
        nextQuizQuestion();
    }, correct ? 850 : 1500);
}
function finishQuiz() {
    if (!quiz || state.grade === null)
        return;
    const game = quiz;
    stopQuiz();
    quiz = null;
    const total = game.questions.length;
    const accuracy = Math.round(game.correct / total * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "quiz", grade: state.grade, diff: state.diff, score: game.score, stars, detail: game.correct + "/" + total + " · " + accuracy + "%", timestamp: Date.now() });
    showThemedGameScene("quiz", "오늘의 수업 완료!", accuracy + "%의 문제를 맞혔어요.", 1800);
    showResult(stars, game.isReview ? "피카츄 오답 복습 완료" : "피카츄 암산퀴즈 완료", accuracy + "%를 맞혔어요.", [[String(game.score), "점수"], [accuracy + "%", "정답률"], [game.correct + "/" + total, "정답"], [String(game.best), "최고 연속"]]);
    renderQuizResultReview(game);
}
function renderQuizResultReview(game) {
    const panel = byId("knowledgeResultReview");
    const missed = game.answers.filter((answer) => !answer.correct);
    quizReviewProblems = missed.length ? missed.map((answer) => answer.problem) : null;
    panel.replaceChildren();
    panel.classList.remove("hidden-panel");
    appendResultReviewHeading(panel, "암산 결과표", missed.length ? "처음 고른 답과 정답을 확인해요." : "모든 문제를 정확하게 해결했어요!");
    appendResultMetricGrid(panel, [[String(game.correct), "정답"], [String(missed.length), "다시 볼 문제"]]);
    if (missed.length) {
        const details = createResultReviewDetails("다시 볼 문제 " + missed.length + "개");
        const list = details.querySelector("ol");
        missed.forEach(({ problem, selected }) => {
            const item = document.createElement("li");
            item.innerHTML = `<strong>${problem.display} = ?</strong><p class="knowledge-review-selected">내 답: ${selected}</p><p class="knowledge-review-correct">정답: ${problem.answer}</p>`;
            list.append(item);
        });
        panel.append(details);
    }
    byId("resultRetry").textContent = missed.length ? "틀린 문제 다시 풀기" : "새로운 10문제";
}
let rain = null;
const RAIN_CONFIG = {
    easy: { speed: .045, gap: 3400, max: 2 },
    normal: { speed: .06, gap: 2900, max: 3 },
    hard: { speed: .075, gap: 2400, max: 4 }
};
function stopRain() {
    if (!rain)
        return;
    rain.running = false;
    if (rain.raf)
        appCancelAnimationFrame(rain.raf);
    if (rain.watchdog)
        window.clearInterval(rain.watchdog);
}
function startRain() {
    const config = RAIN_CONFIG[state.diff];
    const started = lifecycleNow();
    rain = {
        running: true, finished: false, hp: 3, score: 0, popped: 0, input: "", drops: [],
        gap: config.gap, maxDrops: config.max, started,
        lastFrame: started, lastSpawn: started, raf: 0, watchdog: 0, wave: 1, trapsAvoided: 0
    };
    byId("rainField").querySelectorAll(".rain-drop").forEach((drop) => drop.remove());
    setupRainAmbientPokemon();
    const rainPad = keypad(rainNumber, rainDelete, rainSubmit);
    byId("rainKeypad").replaceChildren(...Array.from(rainPad.childNodes));
    renderRainHud();
    showScreen("rain");
    byId("rainSceneIntro").classList.add("show");
    window.setTimeout(() => byId("rainSceneIntro").classList.remove("show"), 1600);
    const session = rain;
    const launchRain = () => {
        if (!rain?.running || rain !== session)
            return;
        const field = byId("rainField");
        if (field.clientWidth < 240 || field.clientHeight < 160) {
            session.lastFrame = lifecycleNow();
            session.raf = appRequestAnimationFrame(launchRain);
            return;
        }
        if (session.drops.length === 0)
            spawnRainDrop();
        const launchedAt = lifecycleNow();
        session.lastSpawn = launchedAt;
        session.lastFrame = launchedAt;
        session.raf = appRequestAnimationFrame(rainFrame);
    };
    rain.raf = appRequestAnimationFrame(launchRain);
    rain.watchdog = appSetInterval(() => {
        if (!rain?.running || document.hidden)
            return;
        const now = lifecycleNow();
        const field = byId("rainField");
        if (field.clientWidth < 240 || field.clientHeight < 160) {
            rain.lastFrame = now;
            return;
        }
        if (rain.drops.length === 0 && now - rain.lastSpawn >= 1200) {
            spawnRainDrop();
            rain.lastSpawn = now;
        }
        if (now - rain.lastFrame >= 1800) {
            if (rain.raf)
                appCancelAnimationFrame(rain.raf);
            rain.lastFrame = now;
            rain.raf = appRequestAnimationFrame(rainFrame);
        }
    }, 750);
}
function rainFrame(now) {
    if (!rain || !rain.running)
        return;
    const field = byId("rainField");
    const height = field.clientHeight;
    if (field.clientWidth < 240 || height < 160) {
        rain.lastFrame = now;
        rain.raf = appRequestAnimationFrame(rainFrame);
        return;
    }
    let delta = (now - rain.lastFrame) / 1000;
    rain.lastFrame = now;
    delta = Math.min(delta, .1);
    const elapsed = (now - rain.started) / 1000;
    if (elapsed >= MAX_GAME_SECONDS) {
        finishRain();
        return;
    }
    const phase = difficultyForProgress(elapsed / MAX_GAME_SECONDS);
    const phaseConfig = RAIN_CONFIG[phase];
    rain.wave = 1 + Math.floor(elapsed / 120);
    const multiplier = Math.min(2.2, 1 + elapsed * .012 + rain.popped * .004);
    const currentGap = Math.max(1300, phaseConfig.gap / (1 + elapsed * .004));
    const emptyFieldNeedsDrop = rain.drops.length === 0 && now - rain.lastSpawn >= 900;
    if ((emptyFieldNeedsDrop || now - rain.lastSpawn >= currentGap) && rain.drops.length < phaseConfig.max) {
        spawnRainDrop();
        rain.lastSpawn = now;
    }
    const velocity = height * phaseConfig.speed * multiplier;
    for (let index = rain.drops.length - 1; index >= 0; index -= 1) {
        const drop = rain.drops[index];
        drop.y += velocity * delta;
        drop.element.style.top = drop.y + "px";
        if (!drop.warning && drop.y > height * .72) {
            drop.warning = true;
            drop.element.classList.add("warning");
        }
        if (drop.y + drop.element.offsetHeight >= height - 20) {
            if (drop.trap) {
                rain.score += 40;
                rain.trapsAvoided += 1;
                showRainDropEffect(drop, "함정 회피! +40", "avoid");
            }
            drop.element.remove();
            rain.drops.splice(index, 1);
            if (!drop.heal && !drop.trap)
                loseRainHp();
            if (!rain.running)
                break;
        }
    }
    renderRainHud();
    if (rain.running)
        rain.raf = appRequestAnimationFrame(rainFrame);
}
function spawnRainDrop() {
    if (!rain?.running)
        return;
    const field = byId("rainField");
    if (field.clientWidth < 240 || field.clientHeight < 160)
        return;
    const elapsed = Math.max(0, (lifecycleNow() - rain.started) / 1000);
    const phase = difficultyForProgress(Math.min(1, elapsed / MAX_GAME_SECONDS));
    let problem = newProblem(phase);
    const trap = elapsed >= 18 && !rain.drops.some((item) => item.trap) && Math.random() < Math.min(.22, .1 + elapsed * .0007);
    for (let attempt = 0; trap && attempt < 4 && rain.drops.some((item) => item.answer === problem.answer); attempt += 1)
        problem = newProblem(phase);
    const heal = !trap && rain.hp < 3 && Math.random() < .14;
    const drop = document.createElement("div");
    drop.className = "rain-drop" + (heal ? " heal" : "") + (trap ? " trap" : "");
    drop.textContent = (heal ? "회복 · " : "") + problem.display + " = ?";
    if (trap)
        drop.setAttribute("aria-label", "로켓단 함정입니다. 답을 입력하지 마세요.");
    const width = field.clientWidth;
    drop.style.left = randomInt(80, Math.max(85, width - 80)) + "px";
    drop.style.top = "-60px";
    field.append(drop);
    rain.drops.push({ element: drop, answer: problem.answer, y: -60, heal, trap, warning: false });
}
function setupRainAmbientPokemon() {
    const field = byId("rainField");
    field.querySelectorAll(".rain-ambient-pokemon").forEach((item) => item.remove());
    const extraFlyer = choose([
        { id: 21, name: "깨비참" }, { id: 83, name: "파오리" }, { id: 41, name: "주뱃" },
        { id: 149, name: "망나뇽" }, { id: 144, name: "프리져" }
    ]);
    const extraWater = choose([
        { id: 60, name: "발챙이" }, { id: 54, name: "고라파덕" }, { id: 7, name: "꼬부기" },
        { id: 116, name: "쏘드라" }, { id: 120, name: "별가사리" }
    ]);
    const ambientPokemon = [
        { pokemon: { id: 17, name: "피죤" }, classes: ["rain-flyer", "rain-flyer-a"], delay: "-3.5s" },
        { pokemon: extraFlyer, classes: ["rain-flyer", "rain-flyer-b"], delay: "-11s" },
        { pokemon: { id: 129, name: "잉어킹" }, classes: ["rain-water", "rain-water-a"], delay: "-1.2s" },
        { pokemon: extraWater, classes: ["rain-water", "rain-water-b"], delay: "-6.5s" }
    ];
    ambientPokemon.forEach(({ pokemon, classes, delay }) => {
        const element = pokemonMedia(pokemon);
        element.classList.add("rain-ambient-pokemon", ...classes);
        element.setAttribute("aria-hidden", "true");
        element.style.setProperty("--rain-ambient-delay", delay);
        field.append(element);
    });
}
function showRainDropEffect(drop, text, kind) {
    const effect = document.createElement("strong");
    effect.className = "rain-drop-effect " + kind;
    effect.textContent = text;
    effect.style.left = drop.element.style.left;
    effect.style.top = drop.element.style.top;
    byId("rainField").append(effect);
    window.setTimeout(() => effect.remove(), 900);
}
function loseRainHp() {
    if (!rain || rain.finished)
        return;
    rain.hp -= 1;
    wrongSound();
    renderRainHud();
    if (rain.hp <= 0)
        finishRain();
}
function rainNumber(value) {
    if (!rain?.running || rain.input.length >= 7)
        return;
    rain.input += value;
    renderRainHud();
}
function rainDelete() {
    if (!rain?.running)
        return;
    rain.input = rain.input.slice(0, -1);
    renderRainHud();
}
function rainSubmit() {
    if (!rain?.running || !rain.input)
        return;
    const value = Number(rain.input);
    let targetIndex = -1;
    let lowest = -Infinity;
    rain.drops.forEach((drop, index) => {
        if (drop.answer === value && drop.y > lowest) {
            targetIndex = index;
            lowest = drop.y;
        }
    });
    if (targetIndex >= 0) {
        const drop = rain.drops[targetIndex];
        rain.drops.splice(targetIndex, 1);
        drop.element.classList.add(drop.trap ? "trap-triggered" : "pop");
        if (drop.trap)
            showRainDropEffect(drop, "함정 발동! -100", "trap");
        window.setTimeout(() => drop.element.remove(), 250);
        if (drop.trap) {
            rain.score = Math.max(0, rain.score - 100);
            loseRainHp();
        }
        else {
            rain.score += 100;
            rain.popped += 1;
            if (drop.heal)
                rain.hp = Math.min(3, rain.hp + 1);
            correctSound();
        }
    }
    else {
        wrongSound();
        showToast("같은 답의 문제가 아직 없어요.");
    }
    rain.input = "";
    renderRainHud();
}
function renderRainHud() {
    if (!rain)
        return;
    byId("rainHp").textContent = "❤️".repeat(Math.max(0, rain.hp)) + "🤍".repeat(Math.max(0, 3 - rain.hp));
    byId("rainScore").textContent = String(rain.score);
    byId("rainWave").textContent = String(rain.wave);
    byId("rainInput").textContent = rain.input || "?";
}
function finishRain() {
    if (!rain || rain.finished || state.grade === null)
        return;
    rain.finished = true;
    rain.running = false;
    if (rain.raf)
        appCancelAnimationFrame(rain.raf);
    const game = rain;
    const seconds = Math.floor((lifecycleNow() - game.started) / 1000);
    const stars = game.popped >= 18 ? 3 : game.popped >= 10 ? 2 : game.popped >= 4 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "rain", grade: state.grade, diff: state.diff, score: game.score, stars, detail: game.popped + "개 · " + seconds + "초", timestamp: Date.now() });
    showRainFinishScene(game.popped);
    showResult(stars, "잉어킹 산성비 챌린지 완료", game.popped + "개의 문제를 막았어요.", [[String(game.score), "점수"], [String(game.popped), "해결"], [seconds + "초", "생존"], [String(game.trapsAvoided), "함정 회피"]]);
}
function showRainFinishScene(popped) {
    document.querySelector(".rain-finish-scene")?.remove();
    const scene = document.createElement("div");
    scene.className = "rain-finish-scene";
    const copy = document.createElement("div");
    copy.className = "rain-finish-copy";
    const label = document.createElement("span");
    label.textContent = "RAIN RESCUE · COMPLETE";
    const title = document.createElement("strong");
    title.textContent = "수식 " + popped + "개로 도시를 지켰어요!";
    copy.append(label, title);
    scene.append(copy);
    document.body.append(scene);
    window.setTimeout(() => scene.remove(), 1800);
}
let mole = null;
const MOLE_CONFIG = {
    easy: { up: 1800, gap: 1150, max: 2 }, normal: { up: 1500, gap: 900, max: 3 }, hard: { up: 1200, gap: 720, max: 4 }
};
function stopMole() {
    if (!mole)
        return;
    mole.running = false;
    if (mole.spawnTimer !== null)
        window.clearTimeout(mole.spawnTimer);
    if (mole.countdown !== null)
        window.clearInterval(mole.countdown);
    mole.holes.forEach((hole) => {
        if (hole.timeout !== null)
            window.clearTimeout(hole.timeout);
    });
}
function startMole() {
    mole = { running: true, score: 0, combo: 0, best: 0, hits: 0, bonusHits: 0, time: 60, target: newProblem("easy"), holes: [], spawnTimer: null, countdown: null, started: performance.now() };
    const grid = byId("moleGrid");
    const celebration = byId("moleCelebration");
    celebration.className = "mole-celebration";
    celebration.replaceChildren();
    grid.replaceChildren();
    for (let index = 0; index < 9; index += 1) {
        const holeElement = document.createElement("div");
        holeElement.className = "mole-hole";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mole-button";
        button.setAttribute("aria-label", "디그다");
        button.append(pokemonMedia({ id: 50, name: "디그다" }));
        const number = document.createElement("span");
        number.className = "mole-number";
        button.append(number);
        button.addEventListener("click", () => hitMole(index));
        holeElement.append(button);
        grid.append(holeElement);
        mole.holes.push({ button, number, active: false, value: 0, bonus: false, timeout: null });
    }
    renderMoleHud();
    showScreen("mole");
    showThemedGameScene("mole", "디그다 동굴 탐험", "정답을 품은 디그다를 빠르게 찾아요!", 900);
    mole.countdown = appSetInterval(moleTick, 1000);
    scheduleMole();
}
function moleSpeedFactor() {
    if (!mole)
        return 1;
    const elapsed = (performance.now() - mole.started) / 1000;
    return Math.max(.72, 1 - elapsed / 180);
}
function scheduleMole() {
    if (!mole?.running)
        return;
    const config = MOLE_CONFIG[difficultyForElapsed(mole.started, 60)];
    mole.spawnTimer = window.setTimeout(() => {
        spawnMole();
        scheduleMole();
    }, config.gap * moleSpeedFactor());
}
function spawnMole() {
    if (!mole?.running)
        return;
    const config = MOLE_CONFIG[difficultyForElapsed(mole.started, 60)];
    if (mole.holes.filter((hole) => hole.active).length >= config.max)
        return;
    const free = mole.holes.map((hole, index) => hole.active ? -1 : index).filter((index) => index >= 0);
    if (!free.length)
        return;
    const index = choose(free);
    const hole = mole.holes[index];
    const correct = Math.random() < .42;
    const bonus = correct && Math.random() < .1;
    hole.bonus = bonus;
    hole.button.classList.toggle("bonus", bonus);
    hole.button.setAttribute("aria-label", bonus ? "보너스 두트리오" : "디그다");
    hole.button.replaceChildren(pokemonMedia({ id: bonus ? 51 : 50, name: bonus ? "두트리오" : "디그다" }), hole.number);
    const wrongOptions = choicesFor(mole.target.answer).filter((value) => value !== mole?.target.answer);
    hole.value = correct ? mole.target.answer : choose(wrongOptions);
    hole.number.textContent = String(hole.value);
    hole.active = true;
    hole.button.classList.add("up");
    hole.timeout = window.setTimeout(() => hideMole(index), config.up * moleSpeedFactor());
}
function hideMole(index) {
    if (!mole)
        return;
    const hole = mole.holes[index];
    if (!hole)
        return;
    hole.active = false;
    hole.button.classList.remove("up", "hit", "miss");
    hole.button.disabled = false;
    hole.button.parentElement?.classList.remove("hit-success", "bonus-success");
    if (hole.timeout !== null)
        window.clearTimeout(hole.timeout);
    hole.timeout = null;
}
function showMoleSuccess(index, gained, bonus, combo) {
    if (!mole)
        return;
    const hole = mole.holes[index];
    if (!hole)
        return;
    const screen = byId("screen-mole");
    const celebration = byId("moleCelebration");
    const scorePop = document.createElement("span");
    scorePop.className = "mole-score-pop" + (bonus ? " bonus" : "");
    scorePop.textContent = "+" + gained;
    hole.button.parentElement?.append(scorePop);
    hole.button.parentElement?.classList.add("hit-success");
    if (bonus)
        hole.button.parentElement?.classList.add("bonus-success");
    celebration.className = "mole-celebration show" + (bonus ? " bonus" : "");
    celebration.innerHTML = "<strong>" + (bonus ? "두트리오 대성공!" : "정답!") + "</strong><span>+" + gained + "점" + (combo >= 2 ? " · " + combo + "연속" : "") + "</span>";
    screen.classList.remove("mole-correct-flash", "mole-bonus-flash");
    void screen.offsetWidth;
    screen.classList.add(bonus ? "mole-bonus-flash" : "mole-correct-flash");
    pokemonSparkBurst(bonus ? 32 : 20);
    if (navigator.vibrate)
        navigator.vibrate(bonus ? [45, 35, 80] : 45);
    window.setTimeout(() => {
        scorePop.remove();
        celebration.className = "mole-celebration";
        celebration.replaceChildren();
        screen.classList.remove("mole-correct-flash", "mole-bonus-flash");
    }, bonus ? 1100 : 900);
}
function clearActiveMoles() {
    if (!mole)
        return;
    mole.holes.forEach((_hole, index) => hideMole(index));
}
function hitMole(index) {
    if (!mole?.running)
        return;
    const hole = mole.holes[index];
    if (!hole?.active)
        return;
    if (hole.value === mole.target.answer) {
        hole.button.classList.add("hit");
        const gained = hole.bonus ? 500 + mole.combo * 25 : 100 + mole.combo * 10;
        mole.score += gained;
        if (hole.bonus)
            mole.bonusHits += 1;
        mole.combo += 1;
        mole.best = Math.max(mole.best, mole.combo);
        mole.hits += 1;
        correctSound();
        showMoleSuccess(index, gained, hole.bonus, mole.combo);
        const currentGame = mole;
        mole.holes.forEach((_other, holeIndex) => { if (holeIndex !== index)
            hideMole(holeIndex); });
        hole.active = false;
        hole.button.disabled = true;
        if (hole.timeout !== null)
            window.clearTimeout(hole.timeout);
        hole.timeout = window.setTimeout(() => {
            if (mole !== currentGame)
                return;
            hideMole(index);
        }, hole.bonus ? 900 : 620);
        mole.target = newProblem(difficultyForElapsed(mole.started, 60));
    }
    else {
        hole.button.classList.add("miss");
        mole.combo = 0;
        mole.time = Math.max(0, mole.time - 2);
        wrongSound();
        hideMole(index);
        if (mole.time <= 0) {
            finishMole();
            return;
        }
    }
    renderMoleHud();
}
function moleTick() {
    if (!mole?.running)
        return;
    mole.time = Math.max(0, mole.time - 1);
    renderMoleHud();
    if (mole.time <= 0)
        finishMole();
}
function renderMoleHud() {
    if (!mole)
        return;
    byId("moleTarget").textContent = mole.target.display;
    byId("moleScore").textContent = String(mole.score);
    byId("moleTime").textContent = String(mole.time);
    byId("moleCombo").textContent = String(mole.combo);
}
function finishMole() {
    if (!mole?.running || state.grade === null)
        return;
    const game = mole;
    stopMole();
    const stars = game.hits >= 24 ? 3 : game.hits >= 14 ? 2 : game.hits >= 6 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "mole", grade: state.grade, diff: state.diff, score: game.score, stars, detail: game.hits + "마리", timestamp: Date.now() });
    showThemedGameScene("mole", "동굴 탐험 완료!", game.hits + "마리의 디그다를 찾았어요.", 1700);
    showResult(stars, "디그다 찾기 완료", game.hits + "번 정답을 찾았어요.", [[String(game.score), "점수"], [String(game.hits), "명중"], [String(game.bonusHits), "두트리오 보너스"], [String(game.best), "최고 연속"]]);
}
let memory = null;
let memorySession = 0;
const MEMORY_TOTAL_PAIRS = 28;
function stopMemory() {
    memorySession += 1;
    if (!memory)
        return;
    memory.running = false;
    memory.timeouts.forEach((timer) => window.clearTimeout(timer));
    memory.timeouts.clear();
    if (memory.countdown !== null)
        window.clearInterval(memory.countdown);
    memory = null;
}
function memoryDelay(callback, delay) {
    if (!memory)
        return;
    const game = memory;
    const session = game.session;
    const timer = window.setTimeout(() => {
        game.timeouts.delete(timer);
        if (!memory || !memory.running || memory.session !== session)
            return;
        callback();
    }, delay);
    game.timeouts.add(timer);
}
function startMemory() {
    const session = ++memorySession;
    const pool = shuffle([...POKEMON]);
    memory = { running: true, session, cards: [], first: null, locked: false, moves: 0, matched: 0, totalMatched: 0, pairs: 4, round: 0, score: 0, combo: 0, bestCombo: 0, mistakes: 0, energy: 3, started: performance.now(), pool, timeouts: new Set(), countdown: null };
    replaceWithPokemon(byId("memoryMascot"), 132);
    buildMemoryRound(0);
    renderMemoryHud();
    showScreen("memory");
    showThemedGameScene("memory", "메타몽 메모리 게임", "변신한 포켓몬의 위치를 기억해 짝을 찾아요!", 900);
    memory.countdown = appSetInterval(() => {
        if (!memory?.running)
            return;
        renderMemoryHud();
        if ((performance.now() - memory.started) / 1000 >= MAX_GAME_SECONDS)
            finishMemory(true);
    }, 1000);
}
function buildMemoryRound(round) {
    if (!memory?.running)
        return;
    const configs = [
        { pairs: 4, columns: 4, difficulty: "easy", offset: 0 },
        { pairs: 6, columns: 4, difficulty: "normal", offset: 4 },
        { pairs: 8, columns: 4, difficulty: "hard", offset: 10 },
        { pairs: 10, columns: 5, difficulty: "hard", offset: 18 }
    ];
    const config = configs[round];
    memory.round = round;
    memory.pairs = config.pairs;
    memory.matched = 0;
    memory.first = null;
    memory.locked = false;
    memory.cards = [];
    byId("memoryRound").textContent = `${round + 1}단계 변신`;
    byId("memoryStatus").textContent = round === 0 ? "먼저 카드를 보고 메타몽의 변신 위치를 기억해요." : `${config.pairs}가지 포켓몬으로 변신했어요. 같은 짝을 찾아요!`;
    const roundPokemon = memory.pool.slice(config.offset, config.offset + config.pairs);
    const rawCards = [];
    roundPokemon.forEach((pokemon, index) => {
        rawCards.push({ key: index, pokemon });
        rawCards.push({ key: index, pokemon });
    });
    const grid = byId("memoryGrid");
    grid.dataset.columns = String(config.columns);
    grid.style.gridTemplateColumns = "repeat(" + config.columns + ",1fr)";
    grid.replaceChildren();
    shuffle(rawCards).forEach((card, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "memory-card";
        button.setAttribute("aria-label", "뒤집지 않은 카드");
        button.addEventListener("click", () => flipMemoryCard(index));
        grid.append(button);
        memory?.cards.push({ key: card.key, pokemon: card.pokemon, matched: false, element: button });
    });
    memory.locked = true;
    memory.cards.forEach((card) => {
        card.element.classList.add("flipped", "preview");
        revealMemoryCard(card);
    });
    showToast("포켓몬의 위치를 기억하세요!");
    memoryDelay(() => {
        if (!memory)
            return;
        memory.cards.forEach((card) => {
            card.element.classList.remove("flipped", "preview");
            concealMemoryCard(card);
        });
        memory.locked = false;
        showToast((round + 1) + "단계 · 짝을 찾아보세요!");
    }, round === 0 ? 1800 : round === 1 ? 1500 : 1250);
    renderMemoryHud();
}
function revealMemoryCard(card) {
    const name = document.createElement("span");
    name.className = "memory-name";
    name.textContent = card.pokemon.name;
    const media = pokemonMedia(card.pokemon);
    media.querySelector(".pokemon-fallback")?.remove();
    card.element.replaceChildren(media, name);
    card.element.setAttribute("aria-label", card.pokemon.name);
}
function concealMemoryCard(card) {
    card.element.replaceChildren();
    card.element.setAttribute("aria-label", "뒤집지 않은 카드");
}
function flipMemoryCard(index) {
    if (!memory?.running || memory.locked)
        return;
    const card = memory.cards[index];
    if (!card || card.matched || card.element.classList.contains("flipped"))
        return;
    card.element.classList.add("flipped");
    revealMemoryCard(card);
    if (memory.first === null) {
        memory.first = index;
        return;
    }
    const firstIndex = memory.first;
    const first = memory.cards[firstIndex];
    memory.first = null;
    memory.moves += 1;
    if (first.key === card.key) {
        first.matched = true;
        card.matched = true;
        first.element.classList.add("matched");
        card.element.classList.add("matched");
        memory.matched += 1;
        memory.totalMatched += 1;
        memory.combo += 1;
        memory.bestCombo = Math.max(memory.bestCombo, memory.combo);
        const transformBonus = memory.combo % 3 === 0;
        memory.score += 100 + memory.combo * 20 + (transformBonus ? 150 : 0);
        byId("memoryStatus").textContent = transformBonus ? "메타몽 변신 보너스! 3연속 매치 +150" : `${card.pokemon.name} 변신 성공! 다음 짝도 이어서 찾아요.`;
        correctSound();
        playPokemonCry(card.pokemon.id, .13);
        pokemonSparkBurst(7);
        if (transformBonus)
            playPokemonCry(132, .15);
        memory.energy = Math.min(3, memory.energy + 1);
        renderMemoryHud();
        if (memory.matched >= memory.pairs) {
            if (memory.round < 3)
                memoryDelay(() => buildMemoryRound((memory?.round ?? 0) + 1), 650);
            else
                memoryDelay(finishMemory, 500);
        }
    }
    else {
        memory.locked = true;
        memory.combo = 0;
        memory.mistakes += 1;
        memory.score = Math.max(0, memory.score - 20);
        memory.energy = Math.max(0, memory.energy - 1);
        const confused = memory.energy === 0;
        if (confused) {
            memory.score = Math.max(0, memory.score - 80);
            memory.energy = 1;
            byId("memoryStatus").textContent = "팬텀의 기억 장난! 100점이 줄었지만 에너지 1칸을 회복했어요.";
            byId("screen-memory").classList.add("memory-confused");
            playPokemonCry(94, .18);
            showMistakeEncounter(3);
        }
        else {
            byId("memoryStatus").textContent = `서로 다른 변신이에요. 기억 에너지 ${memory.energy}칸!`;
        }
        first.element.classList.add("mismatch");
        card.element.classList.add("mismatch");
        wrongSound();
        memoryDelay(() => {
            first.element.classList.remove("mismatch");
            card.element.classList.remove("mismatch");
            byId("screen-memory").classList.remove("memory-confused");
            first.element.classList.remove("flipped");
            card.element.classList.remove("flipped");
            concealMemoryCard(first);
            concealMemoryCard(card);
            if (memory)
                memory.locked = false;
        }, confused ? 1150 : 850);
        renderMemoryHud();
    }
}
function renderMemoryHud() {
    if (!memory)
        return;
    byId("memoryScore").textContent = String(memory.score);
    byId("memoryMoves").textContent = String(memory.moves);
    byId("memoryMatched").textContent = String(memory.totalMatched);
    byId("memoryTotal").textContent = String(MEMORY_TOTAL_PAIRS);
    byId("memoryCombo").textContent = String(memory.combo);
    byId("memoryLives").textContent = "⚡".repeat(memory.energy) + "·".repeat(3 - memory.energy);
    byId("memoryTransformBar").style.width = `${memory.totalMatched / MEMORY_TOTAL_PAIRS * 100}%`;
    byId("memoryTransformText").textContent = `${memory.totalMatched} / ${MEMORY_TOTAL_PAIRS}`;
    const remaining = Math.max(0, MAX_GAME_SECONDS - Math.floor((performance.now() - memory.started) / 1000));
    byId("memoryTime").textContent = Math.floor(remaining / 60) + ":" + String(remaining % 60).padStart(2, "0");
}
function finishMemory(timedOut = false, failed = false) {
    if (!memory?.running || state.grade === null)
        return;
    const game = memory;
    const ratio = game.totalMatched / Math.max(1, game.moves);
    const completion = game.totalMatched / MEMORY_TOTAL_PAIRS;
    const stars = failed ? (completion >= .5 ? 1 : 0) : timedOut ? (completion >= .75 ? 2 : completion >= .4 ? 1 : 0) : ratio >= .7 ? 3 : ratio >= .5 ? 2 : ratio >= .34 ? 1 : 0;
    stopMemory();
    byId("screen-memory").classList.remove("memory-game-over");
    saveRecord({ name: getName() || "친구", mode: "memory", grade: state.grade, diff: state.diff, score: game.score + stars * 100, stars, detail: game.totalMatched + "/" + MEMORY_TOTAL_PAIRS + "쌍 · 오답 " + game.mistakes + "회", timestamp: Date.now() });
    const title = failed ? "메타몽 변신 에너지 소진" : timedOut ? "메타몽 변신 도전 완료" : "메타몽 메모리 완성!";
    const message = failed ? "오답이 3번 누적되어 탐험을 마쳤어요. 카드 위치를 기억하고 다시 도전해요." : timedOut ? game.totalMatched + "쌍의 변신을 찾았어요." : "메타몽의 포켓몬 변신 " + MEMORY_TOTAL_PAIRS + "쌍을 모두 찾았어요!";
    showThemedGameScene("memory", "변신 연구 완료!", "기억한 카드의 짝을 멋지게 찾아냈어요.", 1700);
    showResult(stars, title, message, [[String(game.score + stars * 100), "점수"], [String(game.mistakes) + "/3", "오답"], [String(game.bestCombo), "최고 연속"], [game.totalMatched + "/" + MEMORY_TOTAL_PAIRS, "변신 완성"]]);
}
const OX_TRAP_LABELS = {
    correct: "맞는 식 의심", "one-step": "1 차이 함정", operation: "연산 기호 착각",
    "place-value": "자리값 실수", nearby: "가까운 답 함정"
};
let ox = null;
function stopOx() {
    if (!ox)
        return;
    ox.running = false;
    if (ox.countdown !== null)
        window.clearInterval(ox.countdown);
    if (ox.nextTimer !== null)
        window.clearTimeout(ox.nextTimer);
}
function startOx() {
    ox = {
        running: true, score: 0, combo: 0, best: 0, correct: 0, time: 60, started: performance.now(),
        current: { problem: newProblem("easy"), shown: 0, truth: false, trap: "nearby", started: performance.now() },
        countdown: null, nextTimer: null, trueTotal: 0, trueCorrect: 0, falseTotal: 0, falseCorrect: 0, decisionTotal: 0,
        trapMistakes: { correct: 0, "one-step": 0, operation: 0, "place-value": 0, nearby: 0 }
    };
    replaceWithPokemon(byId("oxPsyduck"), 54);
    nextOx();
    renderOxHud();
    showScreen("ox");
    showThemedGameScene("ox", "고라파덕 오류 탐정", "계산 속에 숨은 실수를 한 번에 찾아내요!", 900);
    ox.countdown = appSetInterval(() => {
        if (!ox?.running)
            return;
        ox.time = Math.max(0, ox.time - 1);
        renderOxHud();
        if (ox.time <= 0)
            finishOx();
    }, 1000);
}
function alternateOperationAnswer(problem) {
    const match = problem.display.match(/^(\d+)\s*([+\-×÷])\s*(\d+)$/);
    if (!match)
        return null;
    const left = Number(match[1]);
    const operator = match[2];
    const right = Number(match[3]);
    if (operator === "+")
        return Math.abs(left - right);
    if (operator === "-")
        return left + right;
    if (operator === "×")
        return left + right;
    if (operator === "÷")
        return left * right;
    return null;
}
function oxWrongAnswers(problem) {
    const candidates = [];
    const add = (trap, shown) => {
        const safe = Math.max(0, Math.round(shown));
        if (safe !== problem.answer && !candidates.some((candidate) => candidate.shown === safe))
            candidates.push({ trap, shown: safe });
    };
    add("one-step", problem.answer + choose([-1, 1]));
    add("nearby", problem.answer + choose([-5, -2, 2, 5]));
    add("place-value", problem.answer + choose(problem.answer >= 10 ? [-10, 10] : [-3, 3]));
    const alternate = alternateOperationAnswer(problem);
    if (alternate !== null)
        add("operation", alternate);
    return candidates.length ? candidates : [{ trap: "nearby", shown: problem.answer + 1 }];
}
function nextOx() {
    if (!ox?.running)
        return;
    const problem = newProblem(difficultyForElapsed(ox.started, 60));
    const truth = ox.trueTotal === ox.falseTotal ? Math.random() < .5 : ox.trueTotal < ox.falseTotal;
    const wrong = choose(oxWrongAnswers(problem));
    const shown = truth ? problem.answer : wrong.shown;
    ox.current = { problem, shown, truth, trap: truth ? "correct" : wrong.trap, started: performance.now() };
    byId("oxProblem").textContent = problem.display + " = " + shown;
    byId("oxPsyduck").className = "ox-mascot thinking";
    byId("oxReaction").textContent = "오류 탐정 모드! 맞는 식인지 살펴봐요.";
    byId("screen-ox").classList.remove("correct-flash", "wrong-flash");
    byId("screen-ox").querySelectorAll(".ox-button").forEach((button) => {
        button.disabled = false;
        button.classList.remove("correct", "wrong");
    });
    renderOxBoost();
}
function reactOx(correct, message) {
    byId("oxPsyduck").className = "ox-mascot " + (correct ? "happy" : "confused");
    byId("oxReaction").textContent = message;
    const screen = byId("screen-ox");
    screen.classList.remove("correct-flash", "wrong-flash");
    void screen.offsetWidth;
    screen.classList.add(correct ? "correct-flash" : "wrong-flash");
}
function renderOxBoost() {
    if (!ox)
        return;
    const remainder = ox.combo % 5;
    const ready = ox.combo > 0 && remainder === 0;
    const value = ready ? 5 : remainder;
    byId("oxBoostBar").style.width = `${value * 20}%`;
    byId("oxBoostText").textContent = ready ? "시간 +4초" : `${value} / 5`;
    document.querySelector("#screen-ox .ox-boost")?.classList.toggle("ready", ready);
}
function answerOx(answer) {
    if (!ox?.running || ox.nextTimer !== null)
        return;
    const round = ox.current;
    const correct = answer === round.truth;
    const decisionTime = Math.max(0, performance.now() - round.started);
    ox.decisionTotal += decisionTime;
    if (round.truth) {
        ox.trueTotal += 1;
        if (correct)
            ox.trueCorrect += 1;
    }
    else {
        ox.falseTotal += 1;
        if (correct)
            ox.falseCorrect += 1;
    }
    const buttons = Array.from(byId("screen-ox").querySelectorAll(".ox-button"));
    const selected = buttons.find((button) => button.classList.contains(answer ? "yes" : "no"));
    const correctButton = buttons.find((button) => button.classList.contains(round.truth ? "yes" : "no"));
    buttons.forEach((button) => { button.disabled = true; });
    selected?.classList.add(correct ? "correct" : "wrong");
    correctButton?.classList.add("correct");
    const explanation = round.truth
        ? "계산하면 " + round.problem.answer + "이므로 맞는 식이에요."
        : "실제 답은 " + round.problem.answer + "이에요. 함정 유형: " + OX_TRAP_LABELS[round.trap] + ".";
    if (correct) {
        ox.combo += 1;
        const boost = ox.combo % 5 === 0;
        const speedBonus = decisionTime < 2000 ? 30 : decisionTime < 3500 ? 15 : 0;
        const gained = 100 + Math.min(10, ox.combo - 1) * 10 + speedBonus;
        ox.score += gained;
        ox.best = Math.max(ox.best, ox.combo);
        ox.correct += 1;
        if (boost) {
            ox.time = Math.min(70, ox.time + 4);
            reactOx(true, "혼란 해소! 시간 +4초 · " + explanation);
            pokemonSparkBurst(54);
            playPokemonCry(54);
        }
        else
            reactOx(true, "정확한 판단! +" + gained + " · " + explanation);
        renderOxBoost();
        correctSound();
    }
    else {
        ox.combo = 0;
        ox.trapMistakes[round.trap] += 1;
        ox.time = Math.max(0, ox.time - 3);
        renderOxBoost();
        reactOx(false, "판단 실수로 3초 감소 · " + explanation);
        wrongSound();
        if (ox.time <= 0) {
            renderOxHud();
            finishOx();
            return;
        }
    }
    renderOxHud();
    ox.nextTimer = window.setTimeout(() => {
        if (!ox?.running)
            return;
        ox.nextTimer = null;
        nextOx();
    }, correct ? 700 : 1200);
}
function renderOxHud() {
    if (!ox)
        return;
    byId("oxScore").textContent = String(ox.score);
    byId("oxTime").textContent = String(ox.time);
    byId("oxCombo").textContent = String(ox.combo);
}
function finishOx() {
    if (!ox?.running || state.grade === null)
        return;
    const game = ox;
    stopOx();
    ox = null;
    const stars = game.correct >= 20 ? 3 : game.correct >= 12 ? 2 : game.correct >= 6 ? 1 : 0;
    const total = game.trueTotal + game.falseTotal;
    const averageSeconds = total ? (game.decisionTotal / total / 1000).toFixed(1) : "0.0";
    const commonTrapEntry = Object.entries(game.trapMistakes).sort((left, right) => right[1] - left[1])[0];
    const commonTrap = commonTrapEntry && commonTrapEntry[1] > 0 ? OX_TRAP_LABELS[commonTrapEntry[0]] : "함정에 속지 않음";
    saveRecord({ name: getName() || "친구", mode: "ox", grade: state.grade, diff: state.diff, score: game.score, stars, detail: game.correct + "개 · 오류 탐정", timestamp: Date.now() });
    showThemedGameScene("ox", "오류 탐정 임무 완료!", game.correct + "개의 식을 정확히 판별했어요.", 1700);
    showResult(stars, "고라파덕 오류 탐정 OX 완료", "가장 주의할 유형: " + commonTrap, [[String(game.score), "점수"], [game.trueCorrect + "/" + game.trueTotal, "맞는 식"], [game.falseCorrect + "/" + game.falseTotal, "틀린 식"], [averageSeconds + "초", "평균 판단"]]);
}
let balloon = null;
const BALLOON_CONFIG = {
    easy: { speed: .055, gap: 1700, max: 4 }, normal: { speed: .075, gap: 1400, max: 5 }, hard: { speed: .095, gap: 1150, max: 6 }
};
function stopBalloon() {
    if (!balloon)
        return;
    balloon.running = false;
    if (balloon.raf)
        appCancelAnimationFrame(balloon.raf);
    if (balloon.countdown !== null)
        window.clearInterval(balloon.countdown);
}
function startBalloon() {
    const started = lifecycleNow();
    balloon = { running: true, score: 0, combo: 0, best: 0, popped: 0, time: 60, target: newProblem("easy"), items: [], started, lastFrame: started, lastSpawn: started, raf: 0, countdown: null, mistakes: 0, inputLocked: false };
    byId("balloonField").replaceChildren();
    byId("balloonFever").textContent = "0 / 8";
    byId("balloonMistakes").textContent = "0 / 3";
    byId("balloonField").classList.remove("fever");
    renderBalloonHud();
    showScreen("balloon");
    const visibleAt = lifecycleNow();
    balloon.started = visibleAt;
    balloon.lastFrame = visibleAt;
    balloon.lastSpawn = visibleAt;
    launchBalloonWave();
    showThemedGameScene("balloon", "푸린 하늘 콘서트", "정답 풍선만 찾아 멋진 노래를 완성해요!", 850);
    balloon.countdown = appSetInterval(() => {
        if (!balloon?.running)
            return;
        balloon.time = Math.max(0, balloon.time - 1);
        renderBalloonHud();
        if (balloon.time <= 0)
            finishBalloon();
    }, 1000);
    balloon.raf = appRequestAnimationFrame(balloonFrame);
}
function balloonFrame(now) {
    if (!balloon?.running)
        return;
    let delta = (now - balloon.lastFrame) / 1000;
    balloon.lastFrame = now;
    delta = Math.min(delta, .1);
    const elapsed = (now - balloon.started) / 1000;
    const config = BALLOON_CONFIG[difficultyForProgress(elapsed / 60)];
    const multiplier = Math.min(2.4, 1 + elapsed * .015 + balloon.popped * .004);
    const gap = Math.max(750, config.gap / (1 + elapsed * .012));
    if (now - balloon.lastSpawn >= gap && balloon.items.length < config.max) {
        spawnBalloon();
        balloon.lastSpawn = now;
    }
    const field = byId("balloonField");
    const velocity = field.clientHeight * config.speed * multiplier;
    for (let index = balloon.items.length - 1; index >= 0; index -= 1) {
        const item = balloon.items[index];
        item.y -= velocity * delta;
        item.element.style.top = item.y + "px";
        if (item.y < -120) {
            item.element.remove();
            balloon.items.splice(index, 1);
        }
    }
    byId("balloonSpeed").textContent = multiplier.toFixed(1);
    balloon.raf = appRequestAnimationFrame(balloonFrame);
}
function spawnBalloon(forceCorrect, laneIndex) {
    if (!balloon)
        return;
    const field = byId("balloonField");
    const correct = forceCorrect ?? Math.random() < .42;
    const wrong = choicesFor(balloon.target.answer).filter((value) => value !== balloon?.target.answer);
    const value = correct ? balloon.target.answer : choose(wrong);
    const bonus = correct && Math.random() < .09;
    const element = document.createElement("button");
    element.type = "button";
    element.className = `balloon${bonus ? " bonus" : ""}`;
    element.style.setProperty("--balloon-accent", choose(["#ff6b7d", "#f39a4b", "#438fff", "#24b47e", "#8b6fe8", "#2ba9c9"]));
    const balloonPokemon = bonus ? { id: 40, name: "푸크린" } : { id: 39, name: "푸린" };
    const artwork = pokemonMedia(balloonPokemon, "balloon-pokemon");
    artwork.setAttribute("aria-hidden", "true");
    const number = document.createElement("span");
    number.className = "balloon-number";
    number.textContent = String(value);
    element.setAttribute("aria-label", balloonPokemon.name + "의 숫자 풍선 " + value + (bonus ? ", 보너스 500점" : ""));
    element.append(artwork, number);
    const sideMargin = bonus ? 82 : 70;
    const fieldWidth = Math.max(field.clientWidth, 320);
    const fieldHeight = Math.max(field.clientHeight, 240);
    const startY = fieldHeight - Math.min(96, fieldHeight * .12);
    const lanePositions = [.2, .5, .8];
    const laneX = laneIndex === undefined
        ? randomInt(sideMargin, Math.max(sideMargin + 1, fieldWidth - sideMargin))
        : Math.round(fieldWidth * (lanePositions[laneIndex] ?? .5) + randomInt(-12, 12));
    element.style.left = Math.max(sideMargin, Math.min(fieldWidth - sideMargin, laneX)) + "px";
    element.style.top = startY + "px";
    const item = { element, value, y: startY, bonus, attempted: false };
    element.addEventListener("click", () => popBalloon(item));
    field.append(element);
    balloon.items.push(item);
}
function launchBalloonWave() {
    if (!balloon?.running)
        return;
    const field = byId("balloonField");
    balloon.items.forEach((item) => item.element.remove());
    balloon.items = [];
    const correctLane = randomInt(0, 2);
    const wrongLanes = [0, 1, 2].filter((lane) => lane !== correctLane);
    spawnBalloon(true, correctLane);
    spawnBalloon(false, wrongLanes[0]);
    spawnBalloon(false, wrongLanes[1]);
    balloon.lastSpawn = lifecycleNow();
    field.classList.remove("rocket-disruption", "wrong-feedback");
}
function popBalloon(item) {
    if (!balloon?.running || balloon.inputLocked || item.attempted)
        return;
    const index = balloon.items.indexOf(item);
    if (index < 0)
        return;
    const correctHit = item.value === balloon.target.answer;
    if (!correctHit) {
        byId("balloonFever").textContent = "0 / 8";
        byId("balloonField").classList.remove("fever");
    }
    if (correctHit) {
        balloonNoteBurst(item.element, item.bonus);
        balloonRewardBurst(item.element, item.bonus ? 500 : 100 + balloon.combo * 10);
        byId("balloonField").classList.add("correct-feedback");
        window.setTimeout(() => byId("balloonField").classList.remove("correct-feedback"), 420);
        balloon.items.splice(index, 1);
        item.element.classList.add("pop");
        window.setTimeout(() => item.element.remove(), 250);
        const nextCombo = balloon.combo + 1;
        const fever = nextCombo >= 8;
        const baseScore = item.bonus ? 500 : 100;
        balloon.score += (baseScore + balloon.combo * 10) * (fever ? 2 : 1);
        balloon.combo = nextCombo;
        balloon.mistakes = 0;
        byId("balloonFever").textContent = fever ? "FEVER x2" : `${nextCombo} / 8`;
        byId("balloonField").classList.toggle("fever", fever);
        if (item.bonus)
            playPokemonCry(40, .16);
        balloon.best = Math.max(balloon.best, balloon.combo);
        balloon.popped += 1;
        const elapsed = Math.max(0, (lifecycleNow() - balloon.started) / 1000);
        balloon.target = newProblem(difficultyForProgress(Math.min(1, elapsed / 60)));
        correctSound();
        balloon.inputLocked = true;
        balloon.items.forEach((remaining) => remaining.element.classList.add("wave-clear"));
        window.setTimeout(() => {
            if (!balloon?.running)
                return;
            launchBalloonWave();
            balloon.inputLocked = false;
        }, 320);
    }
    else {
        item.attempted = true;
        item.element.disabled = true;
        item.element.classList.add("wrong-choice");
        balloon.score = Math.max(0, balloon.score - 50);
        balloon.time = Math.max(0, balloon.time - 3);
        balloon.combo = 0;
        balloon.mistakes += 1;
        const mistakeChip = byId("balloonMistakes").closest(".balloon-mistake-chip");
        mistakeChip?.classList.remove("warning", "danger");
        void mistakeChip?.offsetWidth;
        mistakeChip?.classList.add(balloon.mistakes >= 3 ? "danger" : "warning");
        window.setTimeout(() => mistakeChip?.classList.remove("warning", "danger"), 850);
        balloon.inputLocked = true;
        byId("balloonField").classList.add("wrong-feedback");
        balloonPenaltyBurst(item.element, balloon.mistakes >= 3);
        wrongSound();
        if (balloon.time <= 0) {
            renderBalloonHud();
            finishBalloon();
            return;
        }
        if (balloon.mistakes >= 3) {
            balloon.mistakes = 0;
            const field = byId("balloonField");
            field.classList.add("rocket-disruption");
            balloon.items.forEach((remaining) => remaining.element.classList.add("rocket-sweep"));
            window.setTimeout(() => {
                if (!balloon?.running)
                    return;
                launchBalloonWave();
                balloon.inputLocked = false;
            }, 900);
        }
        else {
            window.setTimeout(() => {
                if (!balloon?.running)
                    return;
                const currentIndex = balloon.items.indexOf(item);
                if (currentIndex >= 0)
                    balloon.items.splice(currentIndex, 1);
                item.element.remove();
                byId("balloonField").classList.remove("wrong-feedback");
                balloon.inputLocked = false;
            }, 1040);
        }
    }
    renderBalloonHud();
}
function balloonPenaltyBurst(origin, severe) {
    const field = byId("balloonField");
    field.querySelector(".balloon-penalty-alert")?.remove();
    const alert = document.createElement("div");
    alert.className = `balloon-penalty-alert${severe ? " severe" : ""}`;
    const ghost = prepareTransientMedia(pokemonMedia(pokemonById(severe ? 94 : 92), "balloon-penalty-pokemon"));
    ghost.setAttribute("aria-hidden", "true");
    const message = document.createElement("strong");
    message.textContent = severe ? "팬텀 방해! 풍선을 다시 섞어요" : "고오스 방해! -50점 · -3초";
    alert.append(ghost, message);
    const originRect = origin.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const alertX = Math.max(105, Math.min(fieldRect.width - 105, originRect.left - fieldRect.left + originRect.width / 2));
    alert.style.setProperty("--penalty-x", `${alertX}px`);
    alert.style.setProperty("--penalty-y", `${Math.max(70, originRect.top - fieldRect.top)}px`);
    field.append(alert);
    window.setTimeout(() => {
        if (!alert.isConnected)
            return;
        alert.classList.add("leaving");
        window.setTimeout(() => alert.remove(), MISTAKE_ENCOUNTER_EXIT_MS);
    }, severe ? 2600 : 950);
}
function balloonRewardBurst(origin, points) {
    const field = byId("balloonField");
    const fieldRect = field.getBoundingClientRect();
    const rect = origin.getBoundingClientRect();
    const reward = document.createElement("strong");
    reward.className = "balloon-reward-pop";
    reward.textContent = `+${points}`;
    reward.style.left = `${rect.left - fieldRect.left + rect.width / 2}px`;
    reward.style.top = `${Math.max(55, rect.top - fieldRect.top + rect.height * .25)}px`;
    field.append(reward);
    window.setTimeout(() => reward.remove(), 1800);
}
function balloonNoteBurst(origin, bonus) {
    const field = byId("balloonField");
    const fieldRect = field.getBoundingClientRect();
    const rect = origin.getBoundingClientRect();
    for (let index = 0; index < (bonus ? 9 : 5); index += 1) {
        const note = document.createElement("span");
        note.className = "balloon-note";
        note.textContent = index % 2 ? "♪" : "♫";
        note.style.left = `${rect.left - fieldRect.left + rect.width / 2}px`;
        note.style.top = `${rect.top - fieldRect.top + rect.height / 2}px`;
        note.style.setProperty("--note-x", `${(Math.random() - .5) * 150}px`);
        note.style.setProperty("--note-y", `${-55 - Math.random() * 120}px`);
        note.style.color = bonus ? "#f4b400" : ["#ef476f", "#4d8dff", "#8b5cf6"][index % 3];
        field.append(note);
        window.setTimeout(() => note.remove(), 850);
    }
}
function renderBalloonHud() {
    if (!balloon)
        return;
    byId("balloonTarget").textContent = balloon.target.display;
    byId("balloonScore").textContent = String(balloon.score);
    byId("balloonTime").textContent = String(balloon.time);
    byId("balloonCombo").textContent = String(balloon.combo);
    byId("balloonMistakes").textContent = `${balloon.mistakes} / 3`;
}
function finishBalloon() {
    if (!balloon?.running || state.grade === null)
        return;
    const game = balloon;
    stopBalloon();
    const stars = game.popped >= 22 ? 3 : game.popped >= 13 ? 2 : game.popped >= 6 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "balloon", grade: state.grade, diff: state.diff, score: game.score, stars, detail: game.popped + "개", timestamp: Date.now() });
    showThemedGameScene("balloon", "하늘 콘서트 완료!", game.popped + "개의 정답 풍선을 터뜨렸어요.", 1800);
    showResult(stars, "푸린 풍선 터뜨리기 완료", game.popped + "개의 정답 풍선을 터뜨렸어요.", [[String(game.score), "점수"], [String(game.popped), "정답"], [String(game.best), "최고 연속"], ["60초", "시간"]]);
}
let space = null;
let spaceReviewQuestions = null;
const SHAPE_LABELS = {
    circle: "원", triangle: "삼각형", square: "정사각형", rectangle: "직사각형",
    diamond: "마름모", trapezoid: "사다리꼴", pentagon: "오각형", hexagon: "육각형"
};
const SHAPE_POINTS = {
    triangle: "60,8 112,92 8,92",
    square: "18,8 102,8 102,92 18,92",
    rectangle: "6,22 114,22 114,82 6,82",
    diamond: "60,5 112,50 60,95 8,50",
    trapezoid: "30,12 90,12 114,90 6,90",
    pentagon: "60,5 112,42 92,95 28,95 8,42",
    hexagon: "32,6 88,6 116,50 88,94 32,94 4,50"
};
function shapeSvg(shape, rotation, color) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 100");
    svg.setAttribute("class", "shape-svg");
    svg.setAttribute("aria-label", SHAPE_LABELS[shape]);
    const gradientId = "shape-gradient-" + Math.random().toString(36).slice(2);
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "1");
    gradient.setAttribute("y2", "1");
    [["0%", "#ffffff", ".72"], ["32%", color, "1"], ["100%", color, ".76"]].forEach(([offset, stopColor, opacity]) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", stopColor);
        stop.setAttribute("stop-opacity", opacity);
        gradient.append(stop);
    });
    defs.append(gradient);
    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    shadow.setAttribute("cx", "60");
    shadow.setAttribute("cy", "94");
    shadow.setAttribute("rx", "39");
    shadow.setAttribute("ry", "4");
    shadow.setAttribute("fill", "#26335f");
    shadow.setAttribute("opacity", ".14");
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", "rotate(" + rotation + " 60 50)");
    const node = shape === "circle"
        ? document.createElementNS("http://www.w3.org/2000/svg", "circle")
        : document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    if (shape === "circle") {
        node.setAttribute("cx", "60");
        node.setAttribute("cy", "50");
        node.setAttribute("r", "43");
    }
    else {
        node.setAttribute("points", SHAPE_POINTS[shape]);
    }
    node.setAttribute("fill", "url(#" + gradientId + ")");
    node.setAttribute("stroke", "#1f477c");
    node.setAttribute("stroke-width", "5");
    node.setAttribute("stroke-linejoin", "round");
    group.append(node);
    svg.append(defs, shadow, group);
    return svg;
}
function makeShapeQuestion(difficulty) {
    const pools = {
        easy: ["circle", "triangle", "square", "rectangle"],
        normal: ["triangle", "rectangle", "diamond", "trapezoid", "pentagon"],
        hard: ["diamond", "trapezoid", "pentagon", "hexagon", "rectangle"]
    };
    const pool = pools[difficulty];
    const answerShape = choose(pool);
    const distractors = shuffle(pool.filter((shape) => shape !== answerShape)).slice(0, 3);
    while (distractors.length < 3) {
        const extra = choose(Object.keys(SHAPE_LABELS).filter((shape) => shape !== answerShape && !distractors.includes(shape)));
        distractors.push(extra);
    }
    const target = document.createElement("div");
    target.append(shapeSvg(answerShape, randomInt(0, 3) * 90, "#26335f"));
    const choices = shuffle([answerShape, ...distractors]).map((shape) => ({
        visual: shapeSvg(shape, randomInt(0, 3) * 90, shape === answerShape ? "#77b7ff" : "#9ec8ef"),
        label: SHAPE_LABELS[shape],
        correct: shape === answerShape
    }));
    return { kind: "shape", title: "회전해도 같은 도형은?", instruction: "위 도형을 머릿속으로 돌려 같은 모양을 찾아보세요.", target, choices };
}
function rotationPuzzleSvg(variant, rotation, mirrored, marker) {
    const paths = [
        "M-47-38H17V-15H45V17H10V41H-27V9H-47Z",
        "M-43-42H7V-23H39V8H20V41H-19V15H-43Z",
        "M-46-31H-18V-45H18V-15H46V18H15V43H-22V12H-46Z",
        "M-45-39H11V-18H43V13H25V42H-12V21H-45Z"
    ];
    const markerPoints = [[-28, -23], [23, -1], [-7, 27]];
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 140 120");
    svg.setAttribute("class", "rotation-composite-svg");
    svg.setAttribute("aria-label", "회전하여 비교하는 비대칭 복합도형");
    const gradientId = "rotation-gradient-" + Math.random().toString(36).slice(2);
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "1");
    gradient.setAttribute("y2", "1");
    [["0%", "#89d8ff"], ["58%", "#469be2"], ["100%", "#2868b5"]].forEach(([offset, color]) => { const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop"); stop.setAttribute("offset", offset); stop.setAttribute("stop-color", color); gradient.append(stop); });
    defs.append(gradient);
    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    shadow.setAttribute("cx", "70");
    shadow.setAttribute("cy", "106");
    shadow.setAttribute("rx", "43");
    shadow.setAttribute("ry", "6");
    shadow.setAttribute("fill", "#17365f");
    shadow.setAttribute("opacity", ".16");
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", "translate(70 57) rotate(" + rotation + ") scale(" + (mirrored ? -1 : 1) + " 1)");
    const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
    body.setAttribute("d", paths[variant % paths.length]);
    body.setAttribute("fill", "url(#" + gradientId + ")");
    body.setAttribute("stroke", "#183f76");
    body.setAttribute("stroke-width", "5");
    body.setAttribute("stroke-linejoin", "round");
    const route = document.createElementNS("http://www.w3.org/2000/svg", "path");
    route.setAttribute("d", "M-31 4H5V25H27");
    route.setAttribute("fill", "none");
    route.setAttribute("stroke", "#d9f4ff");
    route.setAttribute("stroke-width", "7");
    route.setAttribute("stroke-linecap", "round");
    route.setAttribute("stroke-linejoin", "round");
    route.setAttribute("opacity", ".82");
    const point = markerPoints[marker % markerPoints.length];
    const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    badge.setAttribute("cx", String(point[0]));
    badge.setAttribute("cy", String(point[1]));
    badge.setAttribute("r", "10");
    badge.setAttribute("fill", "#ffdb43");
    badge.setAttribute("stroke", "#704d00");
    badge.setAttribute("stroke-width", "4");
    const badgeCore = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    badgeCore.setAttribute("cx", String(point[0] - 2));
    badgeCore.setAttribute("cy", String(point[1] - 2));
    badgeCore.setAttribute("r", "3");
    badgeCore.setAttribute("fill", "#fff8c8");
    const notch = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    notch.setAttribute("points", "31,-14 45,-6 31,2");
    notch.setAttribute("fill", "#ef5862");
    notch.setAttribute("stroke", "#7d2933");
    notch.setAttribute("stroke-width", "3");
    notch.setAttribute("stroke-linejoin", "round");
    group.append(body, route, badge, badgeCore, notch);
    svg.append(defs, shadow, group);
    return svg;
}
function makeAdvancedShapeQuestion(difficulty) {
    const variant = randomInt(0, 3);
    const marker = randomInt(0, 2);
    const angles = difficulty === "hard" ? [0, 45, 90, 135, 180, 225, 270, 315] : [0, 90, 180, 270];
    const targetRotation = choose(angles);
    const target = document.createElement("div");
    target.className = "rotation-puzzle-target";
    target.append(rotationPuzzleSvg(variant, targetRotation, false, marker));
    const optionData = [
        { variant, mirrored: false, marker, correct: true },
        { variant, mirrored: true, marker, correct: false },
        { variant, mirrored: false, marker: (marker + 1) % 3, correct: false },
        { variant: (variant + (difficulty === "easy" ? 2 : 1)) % 4, mirrored: false, marker, correct: false }
    ];
    const choices = shuffle(optionData).map((option, index) => {
        let optionRotation = choose(angles);
        if (option.correct && optionRotation === targetRotation)
            optionRotation = (optionRotation + (difficulty === "hard" ? 135 : 90)) % 360;
        return {
            visual: rotationPuzzleSvg(option.variant, optionRotation, option.mirrored, option.marker),
            label: (index + 1) + "번 회전 조각",
            correct: option.correct
        };
    });
    return {
        kind: "shape",
        title: "돌려서 완전히 겹치는 도형은?",
        instruction: "돌출된 부분, 노란 표식, 빨간 꼭짓점의 위치 관계가 모두 같은 조각을 찾아보세요.",
        target,
        choices
    };
}
function makeRotationQuestion(difficulty) {
    const arrows = ["↑", "→", "↓", "←"];
    const names = ["위쪽", "오른쪽", "아래쪽", "왼쪽"];
    const count = difficulty === "easy" ? 1 : difficulty === "normal" ? 2 : 3;
    const start = randomInt(0, 3);
    let result = start;
    const turns = [];
    for (let index = 0; index < count; index += 1) {
        const turn = choose([
            { label: "오른쪽으로 90°", value: 1 },
            { label: "왼쪽으로 90°", value: -1 },
            { label: "반 바퀴 180°", value: 2 }
        ]);
        turns.push(turn);
        result = (result + turn.value + 4) % 4;
    }
    const target = document.createElement("div");
    const arrow = document.createElement("div");
    arrow.className = "direction-arrow";
    arrow.textContent = arrows[start];
    const sequence = document.createElement("div");
    sequence.className = "turn-sequence";
    turns.forEach((turn) => {
        const chip = document.createElement("span");
        chip.className = "turn-chip";
        chip.dataset.turn = String(turn.value);
        chip.textContent = turn.label;
        sequence.append(chip);
    });
    target.append(arrow, sequence);
    const choices = arrows.map((value, index) => {
        const visual = document.createElement("span");
        visual.className = "direction-arrow";
        visual.textContent = value;
        return { visual, label: names[index], correct: index === result };
    });
    return { kind: "rotation", title: "마지막 방향은 어디일까요?", instruction: "처음 화살표에 회전을 순서대로 적용하세요.", target, choices };
}
function blockBoard(values) {
    const board = document.createElement("div");
    board.className = "block-board";
    board.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
    values.flat().forEach((height) => {
        const cell = document.createElement("span");
        cell.className = "block-cell" + (height === 0 ? " empty" : "");
        cell.setAttribute("aria-label", height + "개 높이");
        for (let level = 0; level < height; level += 1) {
            const cube = document.createElement("i");
            cube.className = "block-cube";
            cube.style.setProperty("--cube-level", String(level));
            cell.append(cube);
        }
        if (height > 0) {
            const label = document.createElement("b");
            label.textContent = String(height);
            cell.append(label);
        }
        board.append(cell);
    });
    return board;
}
function numericChoices(answer, spread) {
    const numbers = new Set([answer]);
    while (numbers.size < 4)
        numbers.add(Math.max(1, answer + randomInt(-spread, spread)));
    return shuffle(Array.from(numbers)).map((value) => {
        const visual = document.createElement("span");
        visual.className = "space-number";
        visual.textContent = String(value);
        return { visual, label: value + "개", correct: value === answer };
    });
}
function makeBlocksQuestion(difficulty) {
    const size = difficulty === "easy" ? 2 : 3;
    const maxHeight = difficulty === "hard" ? 4 : difficulty === "normal" ? 3 : 2;
    const values = [];
    for (let row = 0; row < size; row += 1) {
        const line = [];
        for (let column = 0; column < size; column += 1)
            line.push(randomInt(0, maxHeight));
        values.push(line);
    }
    if (values.flat().every((value) => value === 0))
        values[0][0] = 1;
    const answer = values.flat().reduce((sum, value) => sum + value, 0);
    const target = document.createElement("div");
    target.append(blockBoard(values));
    return {
        kind: "blocks", title: "쌓기나무는 모두 몇 개일까요?", instruction: "각 칸의 숫자는 그 자리에 쌓인 블록의 높이예요.", target,
        choices: numericChoices(answer, Math.max(3, size * 2))
    };
}
function makePatternQuestion(difficulty) {
    const pool = difficulty === "easy"
        ? ["circle", "triangle", "square", "rectangle"]
        : Object.keys(SHAPE_LABELS);
    const baseLength = difficulty === "easy" ? 2 : 3;
    const base = shuffle(pool).slice(0, baseLength);
    const visibleLength = difficulty === "easy" ? 3 : 5;
    const answerShape = base[visibleLength % base.length];
    const target = document.createElement("div");
    target.className = "pattern-strip";
    for (let index = 0; index < visibleLength; index += 1) {
        const item = document.createElement("span");
        item.className = "pattern-item";
        item.append(shapeSvg(base[index % base.length], index * 45, "#70b7ff"));
        target.append(item);
    }
    const missing = document.createElement("span");
    missing.className = "pattern-missing";
    missing.textContent = "?";
    target.append(missing);
    const distractors = shuffle(pool.filter((shape) => shape !== answerShape)).slice(0, 3);
    const choices = shuffle([answerShape, ...distractors]).map((shape) => ({
        visual: shapeSvg(shape, randomInt(0, 3) * 90, shape === answerShape ? "#ffd45f" : "#9bcaff"),
        label: SHAPE_LABELS[shape], correct: shape === answerShape
    }));
    return { kind: "pattern", title: "다음에 올 도형은 무엇일까요?", instruction: "반복되는 도형의 순서를 찾아 빈칸을 완성하세요.", target, choices };
}
function mirrorGrid(values, className = "mirror-grid") {
    const grid = document.createElement("div");
    grid.className = className;
    grid.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
    values.flat().forEach((active) => {
        const cell = document.createElement("span");
        if (active)
            cell.className = "active";
        grid.append(cell);
    });
    return grid;
}
function makeMirrorQuestion(difficulty) {
    const rows = difficulty === "hard" ? 4 : 3;
    const half = [];
    for (let row = 0; row < rows; row += 1)
        half.push([Math.random() > .45, Math.random() > .45]);
    if (half.flat().every((value) => !value))
        half[0][0] = true;
    const correct = half.map((row) => [...row, ...row.slice().reverse()]);
    const target = document.createElement("div");
    target.className = "mirror-prompt";
    target.append(mirrorGrid(half, "mirror-half"));
    const axis = document.createElement("span");
    axis.className = "mirror-axis";
    const unknown = document.createElement("span");
    unknown.className = "mirror-unknown";
    unknown.textContent = "?";
    target.append(axis, unknown);
    const matrices = [correct];
    const used = new Set([JSON.stringify(correct)]);
    while (matrices.length < 4) {
        const altered = correct.map((row) => [...row]);
        const changes = difficulty === "hard" ? 2 : 1;
        for (let change = 0; change < changes; change += 1) {
            const row = randomInt(0, rows - 1);
            const column = randomInt(2, 3);
            altered[row][column] = !altered[row][column];
        }
        const key = JSON.stringify(altered);
        if (!used.has(key)) {
            used.add(key);
            matrices.push(altered);
        }
    }
    return {
        kind: "mirror", title: "거울에 비친 완성 모양은?", instruction: "점선을 기준으로 왼쪽 무늬를 똑같이 뒤집어 보세요.", target,
        choices: shuffle(matrices.map((matrix, index) => ({ visual: mirrorGrid(matrix), label: "대칭 무늬", correct: index === 0 })))
    };
}
function topViewGrid(values) {
    const grid = document.createElement("div");
    grid.className = "topview-grid";
    grid.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
    values.flat().forEach((filled) => {
        const cell = document.createElement("span");
        if (filled)
            cell.className = "filled";
        grid.append(cell);
    });
    return grid;
}
function makeTopViewQuestion(difficulty) {
    const size = difficulty === "easy" ? 2 : 3;
    const maxHeight = difficulty === "hard" ? 4 : 3;
    const values = Array.from({ length: size }, () => Array.from({ length: size }, () => randomInt(0, maxHeight)));
    if (values.flat().every((value) => value === 0))
        values[0][0] = 1;
    const correct = values.map((row) => row.map((height) => height > 0));
    const matrices = [correct];
    const used = new Set([JSON.stringify(correct)]);
    while (matrices.length < 4) {
        const altered = correct.map((row) => [...row]);
        const row = randomInt(0, size - 1);
        const column = randomInt(0, size - 1);
        altered[row][column] = !altered[row][column];
        const key = JSON.stringify(altered);
        if (!used.has(key)) {
            used.add(key);
            matrices.push(altered);
        }
    }
    const target = document.createElement("div");
    target.className = "topview-scene";
    target.append(blockBoard(values));
    const label = document.createElement("span");
    label.textContent = "위에서 내려다보면?";
    target.append(label);
    return {
        kind: "topview", title: "위에서 본 모양을 찾아요", instruction: "높이는 생각하지 말고 블록이 놓인 자리만 살펴보세요.", target,
        choices: shuffle(matrices.map((matrix, index) => ({ visual: topViewGrid(matrix), label: "위에서 본 모양", correct: index === 0 })))
    };
}
const VALID_NETS = [
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [2, 3]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]]
];
const INVALID_NETS = [
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]
];
function netVisual(pattern) {
    const grid = document.createElement("div");
    grid.className = "net-grid";
    pattern.forEach(([column, row]) => {
        const cell = document.createElement("span");
        cell.className = "net-cell";
        cell.style.gridColumn = String(column + 1);
        cell.style.gridRow = String(row + 1);
        grid.append(cell);
    });
    return grid;
}
function makeNetQuestion() {
    const target = document.createElement("div");
    const cube = document.createElement("span");
    cube.className = "space-number";
    cube.textContent = "정육면체";
    target.append(cube);
    const correctPattern = choose(VALID_NETS);
    const options = shuffle([
        { pattern: correctPattern, correct: true },
        ...shuffle(INVALID_NETS).slice(0, 3).map((pattern) => ({ pattern, correct: false }))
    ]);
    return {
        kind: "net", title: "정육면체로 접히는 전개도는?", instruction: "겹치지 않고 여섯 면이 되는 모양을 찾아보세요.", target,
        choices: options.map((option, index) => ({ visual: netVisual(option.pattern), label: String.fromCharCode(65 + index) + "번 전개도", correct: option.correct }))
    };
}
const TOP_VIEW_SOLIDS = [
    { solid: "cone", name: "원뿔", answer: "circle", minDifficulty: "easy" },
    { solid: "cylinder", name: "원기둥", answer: "circle", minDifficulty: "easy" },
    { solid: "cube", name: "정육면체", answer: "square", minDifficulty: "easy" },
    { solid: "rectPrism", name: "직육면체", answer: "rectangle", minDifficulty: "easy" },
    { solid: "sphere", name: "구", answer: "circle", minDifficulty: "normal" },
    { solid: "squarePyramid", name: "사각뿔", answer: "square", minDifficulty: "normal" },
    { solid: "triPyramid", name: "삼각뿔", answer: "triangle", minDifficulty: "normal" },
    { solid: "hexPrism", name: "육각기둥", answer: "hexagon", minDifficulty: "hard" }
];
function topViewSolidSvg(solid, name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 180 165");
    svg.setAttribute("class", "solid-object-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", name + " 입체도형");
    const gradientId = "solid-gradient-" + Math.random().toString(36).slice(2);
    const lightId = gradientId + "-light";
    const common = `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8de1ff"/><stop offset=".55" stop-color="#4b9fe4"/><stop offset="1" stop-color="#2869b7"/></linearGradient><linearGradient id="${lightId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff8ff"/><stop offset="1" stop-color="#73c6ed"/></linearGradient></defs><ellipse cx="90" cy="148" rx="62" ry="10" fill="#183b68" opacity=".14"/>`;
    const drawings = {
        cone: `<path d="M30 126L90 22l60 104Q90 151 30 126Z" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><ellipse cx="90" cy="126" rx="60" ry="19" fill="#63b8eb" stroke="#214d82" stroke-width="5"/><path d="M49 116Q90 132 131 116" fill="none" stroke="#d9f7ff" stroke-width="5" stroke-dasharray="8 7" opacity=".8"/>`,
        cylinder: `<path d="M34 48v78c0 16 112 16 112 0V48Z" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5"/><ellipse cx="90" cy="48" rx="56" ry="20" fill="url(#${lightId})" stroke="#214d82" stroke-width="5"/><ellipse cx="90" cy="126" rx="56" ry="20" fill="#4597dc" stroke="#214d82" stroke-width="5"/><path d="M34 49v77" stroke="#d8f6ff" stroke-width="6" opacity=".55"/>`,
        sphere: `<circle cx="90" cy="82" r="60" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5"/><ellipse cx="71" cy="58" rx="19" ry="28" fill="#dff8ff" opacity=".62" transform="rotate(35 71 58)"/><path d="M43 92Q90 118 137 92" fill="none" stroke="#d7f5ff" stroke-width="4" opacity=".45"/>`,
        cube: `<polygon points="90,19 151,52 90,85 29,52" fill="#b9edff" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="29,52 90,85 90,143 29,108" fill="#4e9ddd" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="151,52 90,85 90,143 151,108" fill="#347fc8" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/>`,
        squarePyramid: `<polygon points="90,18 151,121 90,143 29,121" fill="#54a5e3" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 18L90 143M90 18L29 121M90 18L151 121" fill="none" stroke="#214d82" stroke-width="5"/><path d="M90 18L90 143L29 121Z" fill="#78c8ed" opacity=".72"/>`,
        rectPrism: `<polygon points="74,25 156,61 105,88 23,52" fill="#b8edff" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="23,52 105,88 105,140 23,104" fill="#559fda" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="156,61 105,88 105,140 156,112" fill="#337bc2" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/>`,
        triPyramid: `<polygon points="90,17 151,128 29,128" fill="#54a5e3" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 17L90 128M90 17L29 128M90 17L151 128" stroke="#214d82" stroke-width="5"/><path d="M90 17L90 128L29 128Z" fill="#8bd5f3" opacity=".7"/>`,
        hexPrism: `<path d="M48 39l42-19 42 19 18 34-18 34-42 19-42-19-18-34Z" fill="url(#${lightId})" stroke="#214d82" stroke-width="5"/><path d="M48 39v55l42 31 42-18 18-34v51l-18 25H48l-18-25V73" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 126V74L48 39M90 74l42-35" fill="none" stroke="#214d82" stroke-width="4"/>`
    };
    svg.innerHTML = common + drawings[solid];
    return svg;
}
function topViewAnswer(shape) {
    const answer = document.createElement("div");
    answer.className = "solid-topview-answer";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 100");
    svg.setAttribute("class", "solid-topview-answer-svg");
    const node = shape === "circle" ? document.createElementNS("http://www.w3.org/2000/svg", "circle") : document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    if (shape === "circle") {
        node.setAttribute("cx", "60");
        node.setAttribute("cy", "50");
        node.setAttribute("r", "39");
    }
    else
        node.setAttribute("points", SHAPE_POINTS[shape]);
    node.setAttribute("fill", "#6fc8ec");
    node.setAttribute("stroke", "#23598e");
    node.setAttribute("stroke-width", "5");
    node.setAttribute("stroke-linejoin", "round");
    const shine = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    shine.setAttribute("cx", "45");
    shine.setAttribute("cy", "35");
    shine.setAttribute("r", "8");
    shine.setAttribute("fill", "#dff8ff");
    shine.setAttribute("opacity", ".8");
    svg.append(node, shine);
    const label = document.createElement("span");
    label.textContent = SHAPE_LABELS[shape];
    answer.append(svg, label);
    return answer;
}
function makeSolidTopViewQuestion(difficulty) {
    const rank = { easy: 0, normal: 1, hard: 2 };
    const pool = TOP_VIEW_SOLIDS.filter((item) => rank[item.minDifficulty] <= rank[difficulty]);
    const solid = choose(pool);
    const target = document.createElement("div");
    target.className = "solid-topview-scene";
    const observation = document.createElement("span");
    observation.className = "solid-observation-label";
    observation.textContent = "관찰할 입체도형 · " + solid.name;
    const sight = document.createElement("div");
    sight.className = "solid-sight-line";
    sight.setAttribute("aria-hidden", "true");
    target.append(observation, sight, topViewSolidSvg(solid.solid, solid.name));
    const shapes = Object.keys(SHAPE_LABELS);
    const distractors = shuffle(shapes.filter((shape) => shape !== solid.answer)).slice(0, 3);
    const choices = shuffle([solid.answer, ...distractors]).map((shape) => ({
        visual: topViewAnswer(shape),
        label: SHAPE_LABELS[shape],
        correct: shape === solid.answer
    }));
    return {
        kind: "topview",
        title: "이 입체도형을 위에서 보면?",
        instruction: "천장에서 수직으로 내려다보았을 때 보이는 바깥 윤곽을 찾아보세요.",
        target,
        choices
    };
}
function spaceKindsForGrade(grade) {
    if (grade <= 1)
        return ["shape", "topview", "rotation", "pattern", "mirror"];
    if (grade <= 4)
        return ["shape", "topview", "rotation", "blocks", "mirror", "topview", "pattern"];
    return ["shape", "topview", "rotation", "blocks", "mirror", "net", "topview", "pattern"];
}
function makeSpaceQuestion(index) {
    const kinds = spaceKindsForGrade(state.grade ?? 0);
    const kind = kinds[index % kinds.length];
    const difficulty = difficultyForProgress(index / 9);
    if (kind === "shape")
        return makeAdvancedShapeQuestion(difficulty);
    if (kind === "rotation")
        return makeRotationQuestion(difficulty);
    if (kind === "blocks")
        return makeBlocksQuestion(difficulty);
    if (kind === "pattern")
        return makePatternQuestion(difficulty);
    if (kind === "mirror")
        return makeMirrorQuestion(difficulty);
    if (kind === "topview")
        return makeSolidTopViewQuestion(difficulty);
    return makeNetQuestion();
}
function stopSpace() {
    if (!space)
        return;
    space.running = false;
    if (space.timer !== null)
        window.clearInterval(space.timer);
    if (space.nextTimer !== null)
        window.clearTimeout(space.nextTimer);
}
function startSpace(reviewQuestions) {
    const isReview = Boolean(reviewQuestions?.length);
    const questions = isReview
        ? [...reviewQuestions]
        : Array.from({ length: 10 }, (_, index) => makeSpaceQuestion(index));
    spaceReviewQuestions = null;
    space = { running: true, locked: false, index: 0, score: 0, correct: 0, streak: 0, best: 0, started: Date.now(), timer: null, nextTimer: null, current: null, questions, answers: [], isReview };
    showScreen("space");
    showThemedGameScene("space", "나몰빼미 도형 공간 탐험", "숲의 단서를 관찰하고 공간 문제를 해결해요!", 1000);
    space.timer = appSetInterval(() => {
        if (!space?.running)
            return;
        renderSpaceHud();
        if ((Date.now() - space.started) / 1000 >= MAX_GAME_SECONDS)
            finishSpace();
    }, 500);
    nextSpaceQuestion();
}
function nextSpaceQuestion() {
    if (!space?.running)
        return;
    if (space.index >= space.questions.length) {
        finishSpace();
        return;
    }
    space.locked = false;
    space.current = space.questions[space.index];
    const labels = { shape: "도형 판별", rotation: "공간 회전", blocks: "쌓기나무", net: "전개도", pattern: "도형 규칙", mirror: "거울 대칭", topview: "위에서 본 모양" };
    const hints = {
        shape: "도형을 돌려도 노란 표식과 빨간 꼭짓점의 상대 위치는 바뀌지 않아요.",
        rotation: "첫 방향부터 화살표를 하나씩 돌려 보세요.",
        blocks: "보이지 않는 아래층 나무까지 함께 세어 보세요.",
        net: "맞닿은 면을 머릿속으로 하나씩 접어 보세요.",
        pattern: "반복되는 모양의 가장 짧은 묶음을 찾아보세요.",
        mirror: "가운데 선에서 같은 거리의 칸을 살펴보세요.",
        topview: "입체도형의 가장 높은 곳에서 수직으로 내려다본 바깥 윤곽을 떠올려 보세요."
    };
    byId("spaceKind").textContent = labels[space.current.kind];
    byId("spaceHint").textContent = hints[space.current.kind];
    byId("spaceTitle").textContent = space.current.title;
    byId("spaceInstruction").textContent = space.current.instruction;
    byId("spaceTarget").replaceChildren(space.current.target);
    byId("spaceFeedback").textContent = "";
    const choices = byId("spaceChoices");
    resetChoicePenalty("spaceChoices");
    choices.replaceChildren();
    space.current.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "space-choice";
        button.setAttribute("aria-label", (index + 1) + "번 " + choice.label);
        button.append(choice.visual);
        button.addEventListener("click", () => answerSpace(index, button));
        choices.append(button);
    });
    renderSpaceHud();
}
function answerSpace(selectedIndex, selected) {
    if (!space?.running || space.locked || !space.current)
        return;
    const question = space.current;
    const correctIndex = question.choices.findIndex((choice) => choice.correct);
    const correct = selectedIndex === correctIndex;
    const buttons = Array.from(byId("spaceChoices").querySelectorAll(".space-choice"));
    space.locked = true;
    space.answers.push({ question, selected: selectedIndex, correct });
    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === correctIndex)
            button.classList.add("correct");
    });
    if (correct) {
        const baseScore = 100 + space.streak * 15;
        space.score += baseScore;
        space.correct += 1;
        space.streak += 1;
        space.best = Math.max(space.best, space.streak);
        selected.classList.add("correct");
        byId("spaceFeedback").textContent = "정확해요! 공간을 잘 떠올렸어요. +" + baseScore;
        correctSound();
    }
    else {
        space.streak = 0;
        selected.classList.add("wrong");
        byId("spaceFeedback").textContent = "아쉬워요. 빛나는 정답을 확인하고 다음 문제에서 다시 관찰해 보세요.";
        wrongSound();
    }
    renderSpaceHud();
    space.nextTimer = window.setTimeout(() => {
        if (!space?.running)
            return;
        space.index += 1;
        space.nextTimer = null;
        nextSpaceQuestion();
    }, correct ? 1350 : 1850);
}
function renderSpaceHud() {
    if (!space)
        return;
    const seconds = Math.min(MAX_GAME_SECONDS, Math.floor((Date.now() - space.started) / 1000));
    const total = space.questions.length;
    byId("spaceScore").textContent = String(space.score);
    byId("spaceTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    byId("spaceCount").textContent = "문제 " + Math.min(total, space.index + 1) + "/" + total;
    byId("spaceStreak").textContent = String(space.streak);
}
function finishSpace() {
    if (!space?.running || state.grade === null)
        return;
    const game = space;
    stopSpace();
    const total = game.questions.length;
    const accuracy = Math.round(game.correct / total * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "space", grade: state.grade, diff: "easy", score: game.score, stars, detail: game.correct + "/" + total + " · 공간", timestamp: Date.now() });
    showThemedGameScene("space", "숲속 관찰 완료!", "나몰빼미와 도형·공간 단서를 해결했어요.", 1700);
    showResult(stars, game.isReview ? "도형 오답 복습 완료!" : "도형·공간 탐험 완료", game.correct + "개의 공간 문제를 해결했어요.", [[String(game.score), "점수"], [accuracy + "%", "정답률"], [game.correct + "/" + total, "정답"], [String(game.best), "최고 연속"]]);
    renderSpaceResultReview(game);
}
function renderSpaceResultReview(game) {
    const panel = byId("knowledgeResultReview");
    const missedQuestions = game.questions.filter((_, index) => !game.answers[index]?.correct);
    const kindLabels = { shape: "도형 판별", rotation: "공간 회전", blocks: "쌓기나무", net: "전개도", pattern: "도형 규칙", mirror: "거울 대칭", topview: "위에서 본 모양" };
    spaceReviewQuestions = missedQuestions.length ? missedQuestions : null;
    panel.replaceChildren();
    panel.classList.remove("hidden-panel");
    const heading = document.createElement("h3");
    heading.textContent = "도형·공간 결과표";
    const summary = document.createElement("p");
    summary.className = "knowledge-result-summary";
    summary.textContent = missedQuestions.length
        ? "한 번씩 선택한 결과예요. 다시 볼 문제의 정답과 관찰 팁을 확인해요."
        : "모든 도형·공간 문제를 정확히 해결했어요!";
    panel.append(heading, summary);
    const kindGrid = document.createElement("div");
    kindGrid.className = "knowledge-category-results";
    Object.keys(kindLabels).forEach((kind) => {
        const indexes = game.questions.map((question, index) => question.kind === kind ? index : -1).filter((index) => index >= 0);
        if (!indexes.length)
            return;
        const item = document.createElement("div");
        const label = document.createElement("span");
        label.textContent = kindLabels[kind];
        const value = document.createElement("b");
        value.textContent = indexes.filter((index) => game.answers[index]?.correct).length + " / " + indexes.length;
        item.append(label, value);
        kindGrid.append(item);
    });
    panel.append(kindGrid);
    if (missedQuestions.length) {
        const details = document.createElement("details");
        details.className = "knowledge-missed-review";
        const detailsSummary = document.createElement("summary");
        detailsSummary.textContent = "다시 볼 문제 " + missedQuestions.length + "개";
        const list = document.createElement("ol");
        game.questions.forEach((question, index) => {
            const answer = game.answers[index];
            if (answer?.correct)
                return;
            const correctIndex = question.choices.findIndex((choice) => choice.correct);
            const item = document.createElement("li");
            const prompt = document.createElement("strong");
            prompt.textContent = kindLabels[question.kind] + " · " + question.title;
            const selected = document.createElement("p");
            selected.className = "knowledge-review-selected";
            selected.textContent = answer ? "내가 고른 답: " + question.choices[answer.selected]?.label : "시간 안에 풀지 못한 문제예요.";
            const correctAnswer = document.createElement("p");
            correctAnswer.className = "knowledge-review-correct";
            correctAnswer.textContent = "정답: " + question.choices[correctIndex]?.label;
            const guide = document.createElement("p");
            guide.textContent = question.instruction;
            item.append(prompt, selected, correctAnswer, guide);
            list.append(item);
        });
        details.append(detailsSummary, list);
        panel.append(details);
    }
    byId("resultRetry").textContent = missedQuestions.length ? "틀린 문제 다시 풀기" : "새로운 10문제";
}
let snack = null;
const SNACK_ITEM_IMAGES = {
    gold: "rare-candy", potion: "super-potion", rock: "hard-stone"
};
const SNACK_BERRIES = [
    { image: "oran-berry", label: "오랭열매", points: 80, weight: 25, minProgress: 0 },
    { image: "cheri-berry", label: "버치열매", points: 90, weight: 18, minProgress: 0 },
    { image: "pecha-berry", label: "복슝열매", points: 100, weight: 16, minProgress: 0 },
    { image: "chesto-berry", label: "유루열매", points: 110, weight: 14, minProgress: .1 },
    { image: "leppa-berry", label: "과사열매", points: 120, weight: 12, minProgress: .18 },
    { image: "persim-berry", label: "시몬열매", points: 140, weight: 10, minProgress: .28 },
    { image: "sitrus-berry", label: "자뭉열매", points: 170, weight: 8, minProgress: .38 },
    { image: "lum-berry", label: "리샘열매", points: 210, weight: 6, minProgress: .5 },
    { image: "razz-berry", label: "라즈열매", points: 250, weight: 4, minProgress: .62 },
    { image: "pinap-berry", label: "파인열매", points: 300, weight: 2, minProgress: .74 }
];
function chooseSnackBerry(progress) {
    const available = SNACK_BERRIES.filter((berry) => progress >= berry.minProgress);
    const total = available.reduce((sum, berry) => sum + berry.weight, 0);
    let roll = Math.random() * total;
    for (const berry of available) {
        roll -= berry.weight;
        if (roll <= 0)
            return berry;
    }
    return available[0];
}
function stopSnack() {
    if (!snack)
        return;
    snack.running = false;
    if (snack.startTimer !== null)
        window.clearTimeout(snack.startTimer);
    if (snack.raf !== null)
        appCancelAnimationFrame(snack.raf);
    if (snack.spawnTimer !== null)
        window.clearInterval(snack.spawnTimer);
    if (snack.countdown !== null)
        window.clearInterval(snack.countdown);
    snack.items.forEach((item) => item.element.remove());
    snack.items = [];
}
function startSnack() {
    snack = { running: true, score: 0, combo: 0, best: 0, time: 60, lives: 3, x: 50, items: [], raf: null, spawnTimer: null, countdown: null, startTimer: null, lastFrame: performance.now(), caught: 0, goldCaught: 0 };
    const snackPlayer = byId("snackPlayer");
    snackPlayer.className = "snack-player";
    delete snackPlayer.dataset.eatToken;
    delete snackPlayer.dataset.moveToken;
    snackPlayer.replaceChildren(pokemonMedia({ id: 143, name: "잠만보" }));
    byId("snackField").classList.remove("fever");
    byId("snackSceneIntro").classList.add("show");
    showScreen("snack");
    renderSnackHud();
    positionSnackPlayer();
    snack.startTimer = window.setTimeout(() => {
        if (!snack?.running)
            return;
        snack.startTimer = null;
        byId("snackSceneIntro").classList.remove("show");
        snack.lastFrame = performance.now();
        spawnSnackItem();
        snack.spawnTimer = appSetInterval(spawnSnackItem, 680);
        snack.countdown = appSetInterval(() => { if (!snack?.running)
            return; snack.time = Math.max(0, snack.time - 1); renderSnackHud(); if (snack.time <= 0)
            finishSnack(); }, 1000);
        snack.raf = appRequestAnimationFrame(snackFrame);
    }, 1600);
}
function showSnackFinishScene(outOfLives, caught) {
    document.querySelector(".snack-finish-scene")?.remove();
    const scene = document.createElement("div");
    scene.className = "snack-finish-scene";
    const copy = document.createElement("div");
    copy.className = "snack-finish-copy";
    const label = document.createElement("span");
    label.textContent = outOfLives ? "BERRY HILL · TRY AGAIN" : "BERRY HILL · COMPLETE";
    const title = document.createElement("strong");
    title.textContent = outOfLives ? "잠만보가 다시 기다리고 있어요!" : "열매 " + caught + "개를 받았어요!";
    copy.append(label, title);
    scene.append(copy);
    document.body.append(scene);
    window.setTimeout(() => scene.remove(), 1800);
}
function spawnSnackItem() {
    if (!snack?.running)
        return;
    const progress = 1 - snack.time / 60;
    const roll = Math.random();
    const kind = roll < .06 ? "gold" : roll < .11 ? "potion" : roll < .25 + progress * .1 ? "rock" : "berry";
    const element = document.createElement("div");
    element.className = "snack-item " + kind;
    const berry = kind === "berry" ? chooseSnackBerry(progress) : null;
    const imageName = berry?.image ?? SNACK_ITEM_IMAGES[kind];
    const label = berry?.label ?? (kind === "gold" ? "이상한사탕" : kind === "rock" ? "딱딱한돌" : "회복약");
    const points = berry?.points ?? (kind === "gold" ? 400 : kind === "rock" ? -120 : 150);
    if (berry)
        element.classList.add(points >= 240 ? "rare-berry" : points >= 150 ? "uncommon-berry" : "common-berry");
    const image = document.createElement("img");
    image.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/" + imageName + ".png";
    image.alt = label;
    image.addEventListener("error", () => { element.textContent = kind === "gold" ? "★" : kind === "rock" ? "◆" : kind === "potion" ? "+" : "●"; }, { once: true });
    element.append(image);
    const x = randomInt(7, 93);
    element.style.left = x + "%";
    byId("snackField").append(element);
    const speedScale = kind === "gold" ? .92 : kind === "rock" ? 1.08 : 1;
    snack.items.push({ element, kind, y: -60, x, speed: (85 + progress * 120 + randomInt(0, 45)) * speedScale, points, label });
}
function snackFrame(now) {
    if (!snack?.running)
        return;
    const dt = Math.min(.035, (now - snack.lastFrame) / 1000);
    snack.lastFrame = now;
    const field = byId("snackField");
    const playerRect = byId("snackPlayer").getBoundingClientRect();
    for (let index = snack.items.length - 1; index >= 0; index -= 1) {
        const item = snack.items[index];
        item.y += item.speed * dt;
        item.element.style.top = item.y + "px";
        const rect = item.element.getBoundingClientRect();
        const hit = rect.right > playerRect.left + 8 && rect.left < playerRect.right - 8 && rect.bottom > playerRect.top + 12 && rect.top < playerRect.bottom;
        if (hit) {
            catchSnackItem(item, index);
            continue;
        }
        if (item.y > field.clientHeight + 70) {
            item.element.remove();
            snack.items.splice(index, 1);
        }
    }
    snack.raf = appRequestAnimationFrame(snackFrame);
}
function animateSnackEating(player, item) {
    const token = String(performance.now());
    player.dataset.eatToken = token;
    player.classList.remove("hurt", "happy", "eating", "rare-bite");
    void player.offsetWidth;
    player.classList.add("happy", "eating");
    if (item.kind === "gold" || item.points >= 240)
        player.classList.add("rare-bite");
    window.setTimeout(() => {
        if (player.dataset.eatToken !== token)
            return;
        player.classList.remove("happy", "eating", "rare-bite");
    }, 360);
}
function animateSnackMovement() {
    const player = byId("snackPlayer");
    const token = String(performance.now());
    player.dataset.moveToken = token;
    player.classList.add("moving");
    window.setTimeout(() => {
        if (player.dataset.moveToken === token)
            player.classList.remove("moving");
    }, 180);
}
function catchSnackItem(item, index) {
    if (!snack)
        return;
    const field = byId("snackField");
    const player = byId("snackPlayer");
    const effect = document.createElement("span");
    effect.className = "snack-catch-effect " + item.kind;
    effect.style.left = item.x + "%";
    effect.style.top = Math.max(8, item.y) + "px";
    item.element.remove();
    snack.items.splice(index, 1);
    if (item.kind === "rock") {
        snack.score = Math.max(0, snack.score - 120);
        snack.combo = 0;
        snack.lives -= 1;
        effect.textContent = "-120  ♥-1";
        player.classList.remove("happy");
        player.classList.add("hurt");
        field.classList.remove("fever");
        bumpSound();
        showToast(snack.lives > 0 ? "딱딱한돌이에요! 체력이 줄었어요." : "잠만보가 잠시 쉬어야 해요!");
        window.setTimeout(() => player.classList.remove("hurt"), 500);
    }
    else {
        snack.combo += 1;
        snack.best = Math.max(snack.best, snack.combo);
        snack.caught += 1;
        const fever = snack.combo >= 10;
        const base = item.points;
        const gained = (base + snack.combo * 5) * (fever ? 2 : 1);
        snack.score += gained;
        if (item.kind === "gold")
            snack.goldCaught += 1;
        if (item.kind === "potion")
            snack.lives = Math.min(3, snack.lives + 1);
        effect.textContent = item.label + "  +" + gained + (fever ? "  FEVER ×2" : "");
        animateSnackEating(player, item);
        field.classList.toggle("fever", fever);
        collectSound(item.kind === "gold" || item.points >= 240);
        if (item.kind === "gold" || item.points >= 240 || snack.combo === 10)
            pokemonSparkBurst(item.kind === "gold" ? 9 : 14);
        if (item.kind === "berry" && item.points >= 240)
            showToast(item.label + " 발견! 기본 " + item.points + "점!");
        if (snack.combo === 10)
            showToast("10콤보! 잠만보 피버 ×2!");
    }
    field.append(effect);
    window.setTimeout(() => effect.remove(), 850);
    renderSnackHud();
    if (snack.lives <= 0)
        finishSnack(true);
}
function positionSnackPlayer() { if (snack)
    byId("snackPlayer").style.left = snack.x + "%"; }
function moveSnack(amount) { if (!snack?.running)
    return; snack.x = Math.max(7, Math.min(93, snack.x + amount)); positionSnackPlayer(); animateSnackMovement(); }
function moveSnackTo(clientX) { if (!snack?.running)
    return; const rect = byId("snackField").getBoundingClientRect(); snack.x = Math.max(7, Math.min(93, (clientX - rect.left) / rect.width * 100)); positionSnackPlayer(); animateSnackMovement(); }
function renderSnackHud() { if (!snack)
    return; byId("snackScore").textContent = String(snack.score); byId("snackTime").textContent = String(snack.time); byId("snackCombo").textContent = String(snack.combo); byId("snackLives").textContent = "♥".repeat(snack.lives) + "♡".repeat(3 - snack.lives); byId("snackSpeed").textContent = (1 + (60 - snack.time) / 60 * 1.4).toFixed(1); const feverProgress = Math.min(10, snack.combo); byId("snackFeverBar").style.width = feverProgress * 10 + "%"; byId("snackFeverText").textContent = snack.combo >= 10 ? "FEVER ×2" : feverProgress + "/10"; }
function finishSnack(outOfLives = false) {
    if (!snack?.running || state.grade === null)
        return;
    const game = snack;
    stopSnack();
    const stars = game.score >= 3200 ? 3 : game.score >= 1900 ? 2 : game.score >= 700 ? 1 : 0;
    showSnackFinishScene(outOfLives, game.caught);
    saveRecord({ name: getName() || "친구", mode: "snack", grade: state.grade, diff: "easy", score: game.score, stars, detail: game.caught + "개 열매", timestamp: Date.now() });
    showResult(stars, outOfLives ? "잠만보 휴식 시간" : "베리 대모험 완료!", "잠만보가 아이템 " + game.caught + "개를 맛있게 받았어요.", [[String(game.score), "점수"], [String(game.caught), "획득"], [String(game.goldCaught), "이상한사탕"], [String(game.best), "최고 연속"]]);
}
let symmetry = null;
function stopSymmetry() { if (symmetry)
    symmetry.running = false; }
function startSymmetry() {
    if (state.grade === null)
        return;
    const size = state.grade <= 1 ? 4 : state.grade <= 3 ? 6 : 8;
    symmetry = { running: true, round: 0, score: 0, mistakes: 0, size, source: new Set(), target: new Set(), selected: new Set(), started: Date.now() };
    replaceWithPokemon(byId("symmetryMascot"), 417);
    showScreen("symmetry");
    showThemedGameScene("symmetry", "파치리스 대칭 연구소", "수정 거울을 따라 대칭 회로를 완성해요!", 900);
    setupSymmetryRound();
}
function setupSymmetryRound() {
    if (!symmetry?.running)
        return;
    if (symmetry.round >= 5) {
        finishSymmetry();
        return;
    }
    symmetry.source.clear();
    symmetry.target.clear();
    symmetry.selected.clear();
    const half = symmetry.size / 2;
    for (let row = 0; row < symmetry.size; row += 1) {
        for (let col = 0; col < half; col += 1) {
            if (Math.random() < .38) {
                symmetry.source.add(row + "," + col);
                symmetry.target.add(row + "," + (symmetry.size - 1 - col));
            }
        }
    }
    if (symmetry.source.size < 3) {
        symmetry.source.add("0,0");
        symmetry.source.add("1,1");
        symmetry.source.add((symmetry.size - 1) + ",0");
        symmetry.target.add("0," + (symmetry.size - 1));
        symmetry.target.add("1," + (symmetry.size - 2));
        symmetry.target.add((symmetry.size - 1) + "," + (symmetry.size - 1));
    }
    byId("symmetryStatus").textContent = "왼쪽 전기 무늬를 대칭축 건너편에 똑같이 연결해요.";
    byId("screen-symmetry").classList.remove("circuit-complete", "circuit-error");
    renderSymmetry();
}
function renderSymmetry() {
    if (!symmetry)
        return;
    byId("symmetryScore").textContent = String(symmetry.score);
    byId("symmetryRound").textContent = (symmetry.round + 1) + "/5";
    byId("symmetryMistakes").textContent = String(symmetry.mistakes);
    byId("symmetryChargeBar").style.width = `${symmetry.round / 5 * 100}%`;
    byId("symmetryChargeText").textContent = `${symmetry.round} / 5`;
    const grid = byId("symmetryGrid");
    grid.style.setProperty("--symmetry-size", String(symmetry.size));
    grid.replaceChildren();
    const half = symmetry.size / 2;
    for (let row = 0; row < symmetry.size; row += 1) {
        for (let col = 0; col < symmetry.size; col += 1) {
            const key = row + "," + col;
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "symmetry-cell";
            if (col < half) {
                cell.disabled = true;
                cell.classList.add(symmetry.source.has(key) ? "source" : "given");
            }
            else {
                if (col === half)
                    cell.classList.add("axis-edge");
                if (symmetry.selected.has(key))
                    cell.classList.add("selected");
                cell.addEventListener("click", () => { if (!symmetry?.running)
                    return; symmetry.selected.has(key) ? symmetry.selected.delete(key) : symmetry.selected.add(key); renderSymmetry(); });
            }
            grid.append(cell);
        }
    }
}
function useSymmetryHint() {
    if (!symmetry?.running)
        return;
    const wrong = Array.from(symmetry.selected).find((key) => !symmetry?.target.has(key));
    if (wrong) {
        symmetry.selected.delete(wrong);
        byId("symmetryStatus").textContent = "파치리스가 잘못 연결된 전기 칸 하나를 찾아냈어요!";
    }
    else {
        const missing = Array.from(symmetry.target).find((key) => !symmetry?.selected.has(key));
        if (!missing) {
            byId("symmetryStatus").textContent = "모든 회로가 연결됐어요. 회로 확인을 눌러요!";
            return;
        }
        symmetry.selected.add(missing);
        byId("symmetryStatus").textContent = "파치리스가 정답 칸 하나에 전기를 연결했어요!";
    }
    symmetry.score = Math.max(0, symmetry.score - 50);
    pokemonSparkBurst(6);
    renderSymmetry();
}
function checkSymmetry() {
    if (!symmetry?.running)
        return;
    const correct = symmetry.target.size === symmetry.selected.size && Array.from(symmetry.target).every((key) => symmetry?.selected.has(key));
    if (correct) {
        symmetry.score += 200 + symmetry.round * 40;
        symmetry.round += 1;
        byId("symmetryStatus").textContent = "대칭 회로 연결 성공! 파치리스의 에너지가 충전됐어요.";
        byId("screen-symmetry").classList.add("circuit-complete");
        correctSound();
        pokemonSparkBurst(10);
        if (symmetry.round === 5)
            playPokemonCry(417);
        window.setTimeout(setupSymmetryRound, 650);
    }
    else {
        symmetry.mistakes += 1;
        byId("symmetryStatus").textContent = "회로가 어긋났어요. 대칭축에서 같은 거리인지 다시 살펴봐요.";
        byId("screen-symmetry").classList.add("circuit-error");
        wrongSound();
        showMistakeEncounter(symmetry.mistakes % 2 ? 1 : 3);
        showToast("대칭축을 기준으로 같은 거리를 살펴보세요.");
    }
    renderSymmetry();
}
function finishSymmetry() {
    if (!symmetry?.running || state.grade === null)
        return;
    const game = symmetry;
    stopSymmetry();
    const stars = game.mistakes <= 1 ? 3 : game.mistakes <= 4 ? 2 : game.mistakes <= 8 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "symmetry", grade: state.grade, diff: "easy", score: game.score, stars, detail: "5단계 · 실수 " + game.mistakes, timestamp: Date.now() });
    showThemedGameScene("symmetry", "대칭 연구 완료!", "파치리스의 수정 회로가 환하게 충전됐어요.", 1700);
    showResult(stars, "전기 대칭 연구 완료!", "파치리스의 대칭 회로 5개를 모두 연결했어요.", [[String(game.score), "점수"], [String(game.mistakes), "실수"], [String(game.size) + "×" + game.size, "격자"], ["5/5", "충전"]]);
}
const COORDINATE_PENALTY_HOLD_MS = 2600;
let coordinate = null;
function stopCoordinate() {
    if (!coordinate)
        return;
    coordinate.running = false;
    if (coordinate.timer !== null)
        window.clearInterval(coordinate.timer);
    if (coordinate.penaltyHoldTimer !== null)
        window.clearTimeout(coordinate.penaltyHoldTimer);
    if (coordinate.penaltyExitTimer !== null)
        window.clearTimeout(coordinate.penaltyExitTimer);
    const overlay = document.getElementById("coordinatePenalty");
    if (overlay) {
        overlay.hidden = true;
        overlay.classList.remove("leaving");
    }
}
const coordinateEven = () => randomInt(2, 24) * 2;
const coordinateOdd = () => randomInt(1, 24) * 2 + 1;
const COORDINATE_RULES = [
    { title: "정상 신호는 짝수예요", mission: "홀수 신호를 모두 찾아 복구하세요.", create: (bad) => ({ main: String(bad ? coordinateOdd() : coordinateEven()), sub: "SIGNAL" }) },
    { title: "정상 체크섬은 3의 배수예요", mission: "3으로 나누어떨어지지 않는 체크섬을 찾으세요.", create: (bad) => { const base = randomInt(2, 20) * 3; return { main: String(bad ? base + randomInt(1, 2) : base), sub: "CHECKSUM" }; } },
    { title: "안전 범위는 10부터 30까지예요", mission: "안전 범위를 벗어난 수치를 찾으세요.", create: (bad) => ({ main: String(bad ? (Math.random() < .5 ? randomInt(1, 9) : randomInt(31, 49)) : randomInt(10, 30)), sub: "RANGE" }) },
    { title: "정상 좌표는 X+Y가 짝수예요", mission: "두 좌표의 합이 홀수인 패킷을 찾으세요.", create: (bad) => { const x = randomInt(1, 9); let y = randomInt(1, 9); if (((x + y) % 2 === 1) !== bad)
            y = y === 9 ? y - 1 : y + 1; return { main: `(${x}, ${y})`, sub: "COORDINATE" }; } },
    { title: "정상 좌표의 X와 Y는 홀짝이 같아요", mission: "홀수와 짝수가 섞인 좌표를 모두 찾으세요.", create: (bad) => { const x = randomInt(1, 9); let y = randomInt(1, 9); if (((x % 2) !== (y % 2)) !== bad)
            y = y === 9 ? y - 1 : y + 1; return { main: `X${x} · Y${y}`, sub: "PARITY" }; } },
    { title: "고출력 신호는 20보다 큰 짝수예요", mission: "20 이하이거나 홀수인 고출력 신호를 찾으세요.", create: (bad) => ({ main: String(bad ? (Math.random() < .5 ? randomInt(8, 20) : coordinateOdd() + 20) : randomInt(11, 25) * 2), sub: "HIGH POWER" }) },
    { title: "정상 경로는 X가 Y보다 작아요", mission: "X가 Y보다 크거나 같은 좌표를 찾으세요.", create: (bad) => { const low = randomInt(1, 6); const high = randomInt(low + 1, 9); return { main: bad ? `X${high} → Y${low}` : `X${low} → Y${high}`, sub: "ROUTE" }; } },
    { title: "정상 코드의 끝자리는 0 또는 5예요", mission: "끝자리가 0이나 5가 아닌 코드를 찾으세요.", create: (bad) => ({ main: String(randomInt(10, 89) * 10 + (bad ? randomInt(1, 4) : (Math.random() < .5 ? 0 : 5))), sub: "FINAL CODE" }) }
];
function startCoordinate() {
    if (state.grade === null)
        return;
    coordinate = { running: true, transitioning: false, stage: 0, score: 0, combo: 0, bestCombo: 0, shield: 3, mistakes: 0, timeLeft: 16, timer: null, penaltyHoldTimer: null, penaltyExitTimer: null, packets: [], errorsTotal: 0, errorsRemaining: 0, started: Date.now() };
    replaceWithPokemon(byId("coordinateMascot"), 137);
    replaceWithPokemon(byId("coordinatePenaltyPokemon"), 94);
    showScreen("coordinate");
    showThemedGameScene("coordinate", "폴리곤 데이터 복구 작전", "규칙을 분석하고 오류 패킷을 복구해요!", 1200);
    setupCoordinateStage();
}
function setupCoordinateStage() {
    if (!coordinate?.running)
        return;
    if (coordinate.stage >= COORDINATE_RULES.length) {
        finishCoordinate(true);
        return;
    }
    if (coordinate.timer !== null)
        window.clearInterval(coordinate.timer);
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const count = mobile ? 9 : 12;
    const errorCount = Math.min(4, 2 + Math.floor(coordinate.stage / 3));
    const rule = COORDINATE_RULES[coordinate.stage];
    const flags = shuffle(Array.from({ length: count }, (_, index) => index < errorCount));
    coordinate.packets = flags.map((corrupted, index) => ({ id: index, ...rule.create(corrupted), corrupted, selected: false }));
    coordinate.errorsTotal = errorCount;
    coordinate.errorsRemaining = errorCount;
    coordinate.timeLeft = Math.max(9, 17 - coordinate.stage);
    coordinate.transitioning = false;
    byId("coordinateStatus").textContent = "새 규칙을 확인하고 오류 패킷을 찾아 선택하세요.";
    renderCoordinate();
    armCoordinateTimer();
}
function renderCoordinate() {
    if (!coordinate)
        return;
    const rule = COORDINATE_RULES[coordinate.stage];
    byId("coordinateScore").textContent = String(coordinate.score);
    byId("coordinateStage").textContent = (coordinate.stage + 1) + "/8";
    byId("coordinateCombo").textContent = String(coordinate.combo);
    byId("coordinateShield").textContent = coordinate.shield + "/3";
    byId("coordinateTime").textContent = coordinate.timeLeft + "초";
    byId("coordinateRuleTitle").textContent = rule.title;
    byId("coordinateMission").textContent = rule.mission;
    byId("coordinateProgress").textContent = "오류 데이터 " + (coordinate.errorsTotal - coordinate.errorsRemaining) + "/" + coordinate.errorsTotal;
    const board = byId("coordinateBoard");
    board.replaceChildren();
    coordinate.packets.forEach((packet) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "coordinate-packet";
        if (packet.selected)
            button.classList.add("recovered");
        button.disabled = packet.selected || coordinate?.transitioning === true;
        button.innerHTML = `<i aria-hidden="true"></i><strong>${packet.main}</strong><small>${packet.sub}</small>`;
        button.addEventListener("click", () => chooseCoordinatePacket(packet.id, button));
        board.append(button);
    });
}
function armCoordinateTimer() {
    if (!coordinate)
        return;
    coordinate.timer = appSetInterval(() => {
        if (!coordinate?.running || coordinate.transitioning)
            return;
        coordinate.timeLeft -= 1;
        byId("coordinateTime").textContent = coordinate.timeLeft + "초";
        if (coordinate.timeLeft <= 0)
            failCoordinateStage("시간 초과! 팬텀이 데이터 배열을 바꿨어요.");
    }, 1000);
}
function chooseCoordinatePacket(id, button) {
    if (!coordinate?.running || coordinate.transitioning)
        return;
    const packet = coordinate.packets.find((item) => item.id === id);
    if (!packet || packet.selected)
        return;
    if (packet.corrupted) {
        packet.selected = true;
        coordinate.errorsRemaining -= 1;
        coordinate.combo += 1;
        coordinate.bestCombo = Math.max(coordinate.bestCombo, coordinate.combo);
        coordinate.score += 90 + coordinate.combo * 15 + coordinate.stage * 10;
        button.classList.add("recovered");
        button.disabled = true;
        correctSound();
        pokemonSparkBurst(10);
        byId("coordinateStatus").textContent = "오류 패킷 복구 성공! 남은 데이터를 분석해요.";
        if (coordinate.errorsRemaining <= 0) {
            coordinate.transitioning = true;
            if (coordinate.timer !== null)
                window.clearInterval(coordinate.timer);
            coordinate.score += coordinate.timeLeft * 10;
            coordinate.stage += 1;
            byId("coordinateStatus").textContent = "복구 완료! 다음 데이터 규칙을 불러와요.";
            window.setTimeout(setupCoordinateStage, 800);
        }
        else
            renderCoordinate();
        return;
    }
    coordinate.mistakes += 1;
    coordinate.combo = 0;
    coordinate.shield -= 1;
    coordinate.score = Math.max(0, coordinate.score - 80);
    button.classList.add("wrong");
    wrongSound();
    flashCoordinatePenalty();
    updateCoordinateHud();
    window.setTimeout(() => button.classList.remove("wrong"), 650);
    if (coordinate.shield <= 0)
        window.setTimeout(() => finishCoordinate(false), COORDINATE_PENALTY_HOLD_MS + MISTAKE_ENCOUNTER_EXIT_MS);
}
function updateCoordinateHud() {
    if (!coordinate)
        return;
    byId("coordinateScore").textContent = String(coordinate.score);
    byId("coordinateCombo").textContent = String(coordinate.combo);
    byId("coordinateShield").textContent = coordinate.shield + "/3";
}
function flashCoordinatePenalty() {
    if (!coordinate)
        return;
    if (coordinate.penaltyHoldTimer !== null)
        window.clearTimeout(coordinate.penaltyHoldTimer);
    if (coordinate.penaltyExitTimer !== null)
        window.clearTimeout(coordinate.penaltyExitTimer);
    const overlay = byId("coordinatePenalty");
    overlay.hidden = false;
    overlay.classList.remove("leaving");
    coordinate.transitioning = true;
    byId("coordinateStatus").textContent = "정상 데이터였어요. 규칙을 다시 확인하세요!";
    coordinate.penaltyHoldTimer = window.setTimeout(() => {
        if (!coordinate || !overlay.isConnected)
            return;
        overlay.classList.add("leaving");
        coordinate.penaltyExitTimer = window.setTimeout(() => {
            if (!coordinate)
                return;
            overlay.hidden = true;
            overlay.classList.remove("leaving");
            if (coordinate.running && coordinate.shield > 0)
                coordinate.transitioning = false;
            coordinate.penaltyExitTimer = null;
        }, MISTAKE_ENCOUNTER_EXIT_MS);
        coordinate.penaltyHoldTimer = null;
    }, COORDINATE_PENALTY_HOLD_MS);
}
function failCoordinateStage(message) {
    if (!coordinate?.running || coordinate.transitioning)
        return;
    coordinate.transitioning = true;
    coordinate.shield -= 1;
    coordinate.combo = 0;
    coordinate.mistakes += 1;
    coordinate.score = Math.max(0, coordinate.score - 100);
    if (coordinate.timer !== null)
        window.clearInterval(coordinate.timer);
    wrongSound();
    flashCoordinatePenalty();
    showToast(message);
    updateCoordinateHud();
    const penaltyDelay = COORDINATE_PENALTY_HOLD_MS + MISTAKE_ENCOUNTER_EXIT_MS;
    if (coordinate.shield <= 0)
        window.setTimeout(() => finishCoordinate(false), penaltyDelay);
    else
        window.setTimeout(setupCoordinateStage, penaltyDelay);
}
function finishCoordinate(completed = true) {
    if (!coordinate?.running || state.grade === null)
        return;
    const game = coordinate;
    stopCoordinate();
    const cleared = Math.min(game.stage, 8);
    const stars = completed && game.mistakes <= 1 ? 3 : cleared >= 6 ? 2 : cleared >= 3 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "coordinate", grade: state.grade, diff: "easy", score: game.score, stars, detail: cleared + "단계 · 오답 " + game.mistakes + "회", timestamp: Date.now() });
    showThemedGameScene("coordinate", completed ? "데이터 복구 완료!" : "보호막 소진!", completed ? "폴리곤 연구소의 데이터가 모두 정상화됐어요." : "규칙을 다시 익히고 재도전해요.", 1800);
    showResult(stars, completed ? "폴리곤 데이터 복구 완료!" : "데이터 복구 중단", completed ? "8개의 데이터 규칙을 모두 분석했어요." : "보호막이 모두 사라졌어요. 규칙을 천천히 읽어보세요.", [[String(game.score), "점수"], [String(game.bestCombo), "최고 연속"], [String(game.mistakes), "오답"], [cleared + "/8", "복구"]]);
}
const HISTORY_EVENTS = [
    { year: -70000, label: "사람들이 돌을 다듬어 도구로 사용했어요", yearLabel: "구석기 시대", minGrade: 0 }, { year: -8000, label: "농사를 짓고 한곳에 모여 살기 시작했어요", yearLabel: "신석기 시대", minGrade: 0 },
    { year: -2333, label: "고조선이 세워졌다고 전해져요", yearLabel: "기원전 2333년", minGrade: 1 }, { year: -37, label: "고구려가 세워졌어요", yearLabel: "기원전 37년", minGrade: 2 },
    { year: 676, label: "신라가 삼국 통일을 이루었어요", yearLabel: "676년", minGrade: 3 }, { year: 918, label: "왕건이 고려를 세웠어요", yearLabel: "918년", minGrade: 2 },
    { year: 1392, label: "이성계가 조선을 세웠어요", yearLabel: "1392년", minGrade: 2 }, { year: 1443, label: "세종대왕이 훈민정음을 창제했어요", yearLabel: "1443년", minGrade: 0 },
    { year: 1592, label: "임진왜란이 일어났어요", yearLabel: "1592년", minGrade: 3 }, { year: 1919, label: "3·1 운동이 일어났어요", yearLabel: "1919년", minGrade: 3 },
    { year: 1945, label: "우리나라가 광복을 맞았어요", yearLabel: "1945년", minGrade: 0 }, { year: 1950, label: "6·25 전쟁이 일어났어요", yearLabel: "1950년", minGrade: 4 },
    { year: -2000, label: "청동으로 도구를 만들고 고인돌을 세우기 시작했어요", yearLabel: "청동기 시대", minGrade: 0 },
    { year: 612, label: "을지문덕이 살수대첩에서 수나라 군대를 물리쳤어요", yearLabel: "612년", minGrade: 3 },
    { year: 660, label: "신라와 당의 연합군이 백제를 무너뜨렸어요", yearLabel: "660년", minGrade: 3 },
    { year: 1446, label: "훈민정음이 세상에 반포되었어요", yearLabel: "1446년", minGrade: 0 },
    { year: 1894, label: "동학 농민 운동이 일어났어요", yearLabel: "1894년", minGrade: 4 },
    { year: 1897, label: "고종이 대한제국을 선포했어요", yearLabel: "1897년", minGrade: 4 },
    { year: 1923, label: "어린이를 위한 어린이날 행사가 시작되었어요", yearLabel: "1923년", minGrade: 0 },
    { year: 1988, label: "서울에서 하계 올림픽이 열렸어요", yearLabel: "1988년", minGrade: 0 },
    { year: 372, label: "고구려에 인재를 가르치는 태학이 세워졌어요", yearLabel: "372년", minGrade: 3 },
    { year: 828, label: "장보고가 청해진을 설치해 바닷길을 지켰어요", yearLabel: "828년", minGrade: 2 },
    { year: 1019, label: "강감찬이 귀주대첩에서 거란군을 물리쳤어요", yearLabel: "1019년", minGrade: 3 },
    { year: 1234, label: "고려에서 금속 활자로 책을 인쇄했다는 기록이 남아 있어요", yearLabel: "1234년", minGrade: 4 },
    { year: 1796, label: "정조 때 수원 화성이 완성되었어요", yearLabel: "1796년", minGrade: 2 },
    { year: 1909, label: "안중근 의사가 하얼빈에서 의거를 일으켰어요", yearLabel: "1909년", minGrade: 4 },
    { year: 1948, label: "대한민국 정부가 수립되었어요", yearLabel: "1948년", minGrade: 4 },
    { year: 2002, label: "대한민국과 일본에서 월드컵이 열렸어요", yearLabel: "2002년", minGrade: 0 },
    { year: 427, label: "고구려 장수왕이 수도를 평양으로 옮겼어요", yearLabel: "427년", minGrade: 4 },
    { year: 475, label: "백제가 수도를 웅진으로 옮겼어요", yearLabel: "475년", minGrade: 4 },
    { year: 527, label: "신라가 불교를 공식적으로 받아들였어요", yearLabel: "527년", minGrade: 3 },
    { year: 562, label: "신라가 대가야를 병합했어요", yearLabel: "562년", minGrade: 4 },
    { year: 598, label: "고구려와 수나라의 첫 전쟁이 일어났어요", yearLabel: "598년", minGrade: 4 },
    { year: 645, label: "고구려가 안시성에서 당나라 군대를 막아냈어요", yearLabel: "645년", minGrade: 3 },
    { year: 698, label: "대조영이 발해를 세웠어요", yearLabel: "698년", minGrade: 2 },
    { year: 751, label: "통일 신라에서 불국사를 크게 다시 짓기 시작했어요", yearLabel: "751년", minGrade: 2 },
    { year: 935, label: "신라가 고려에 항복했어요", yearLabel: "935년", minGrade: 4 },
    { year: 936, label: "고려가 후삼국을 통일했어요", yearLabel: "936년", minGrade: 3 },
    { year: 958, label: "고려 광종이 과거제를 실시했어요", yearLabel: "958년", minGrade: 4 },
    { year: 993, label: "서희의 외교 담판으로 강동 6주를 확보했어요", yearLabel: "993년", minGrade: 3 },
    { year: 1107, label: "윤관이 별무반을 이끌고 동북 9성을 쌓았어요", yearLabel: "1107년", minGrade: 4 },
    { year: 1170, label: "고려에서 무신 정변이 일어났어요", yearLabel: "1170년", minGrade: 4 },
    { year: 1232, label: "고려가 몽골에 맞서 수도를 강화도로 옮겼어요", yearLabel: "1232년", minGrade: 3 },
    { year: 1251, label: "고려대장경 판목을 새기는 일이 완성되었어요", yearLabel: "1251년", minGrade: 3 },
    { year: 1270, label: "삼별초가 몽골과의 강화에 반대해 항쟁을 시작했어요", yearLabel: "1270년", minGrade: 5 },
    { year: 1377, label: "현존하는 가장 오래된 금속 활자본 직지가 인쇄되었어요", yearLabel: "1377년", minGrade: 3 },
    { year: 1388, label: "이성계가 위화도에서 군대를 돌렸어요", yearLabel: "1388년", minGrade: 4 },
    { year: 1418, label: "세종이 조선의 왕이 되었어요", yearLabel: "1418년", minGrade: 2 },
    { year: 1485, label: "조선의 기본 법전인 경국대전이 완성되어 시행되었어요", yearLabel: "1485년", minGrade: 4 },
    { year: 1597, label: "이순신 장군이 명량대첩에서 승리했어요", yearLabel: "1597년", minGrade: 2 },
    { year: 1627, label: "후금이 조선을 침략한 정묘호란이 일어났어요", yearLabel: "1627년", minGrade: 4 },
    { year: 1636, label: "청이 조선을 침략한 병자호란이 일어났어요", yearLabel: "1636년", minGrade: 4 },
    { year: 1776, label: "정조가 왕이 되고 규장각을 설치했어요", yearLabel: "1776년", minGrade: 3 },
    { year: 1866, label: "프랑스군이 강화도를 침략한 병인양요가 일어났어요", yearLabel: "1866년", minGrade: 5 },
    { year: 1876, label: "조선이 일본과 강화도 조약을 맺었어요", yearLabel: "1876년", minGrade: 4 },
    { year: 1884, label: "개화파가 갑신정변을 일으켰어요", yearLabel: "1884년", minGrade: 5 },
    { year: 1896, label: "독립협회가 만들어졌어요", yearLabel: "1896년", minGrade: 4 },
    { year: 1905, label: "일본이 을사늑약을 강제로 맺었어요", yearLabel: "1905년", minGrade: 4 },
    { year: 1910, label: "일제에 나라를 빼앗겼어요", yearLabel: "1910년", minGrade: 4 },
    { year: 1920, label: "독립군이 청산리 대첩에서 일본군과 싸워 크게 이겼어요", yearLabel: "1920년", minGrade: 4 }
];
let historyGame = null;
let historyReviewEvents = null;
function stopHistory() { if (historyGame)
    historyGame.running = false; }
function startHistory(reviewEvents) {
    if (state.grade === null)
        return;
    const grade = state.grade;
    const pool = HISTORY_EVENTS.filter((event) => event.minGrade <= grade);
    const isReview = Boolean(reviewEvents?.length);
    const events = isReview ? shuffle([...reviewEvents]) : shuffle([...pool]).slice(0, Math.min(8, pool.length));
    historyReviewEvents = null;
    historyGame = { running: true, events, remaining: new Set(events.map((event) => event.year)), answers: [], score: 0, mistakes: 0, streak: 0, bestStreak: 0, locked: false, started: Date.now(), rewardMilestone: 0, isReview };
    replaceWithPokemon(byId("historyMascot"), 60);
    showScreen("history");
    renderHistory();
}
function renderHistory() {
    if (!historyGame)
        return;
    historyGame.locked = false;
    const completed = historyGame.events.length - historyGame.remaining.size;
    const total = Math.max(1, historyGame.events.length);
    const energy = byId("historyEnergyBar").closest(".history-energy");
    byId("historyScore").textContent = String(historyGame.score);
    byId("historyCount").textContent = completed + "/" + historyGame.events.length;
    byId("historyStreak").textContent = String(historyGame.streak);
    byId("historyMistakes").textContent = String(historyGame.mistakes);
    byId("historyEnergyBar").style.width = String(completed / total * 100) + "%";
    byId("historyEnergyText").textContent = completed + " / " + historyGame.events.length;
    byId("historyEnergyHint").textContent = completed === 0
        ? "사건을 순서대로 연결해 시간 물결을 채워요."
        : completed === historyGame.events.length
            ? "시간 물결 복원 완료! 과거와 현재가 다시 이어졌어요."
            : "앞으로 " + (historyGame.events.length - completed) + "개의 사건을 더 연결하면 복원이 완료돼요.";
    energy?.classList.toggle("is-charged", completed > 0);
    energy?.classList.toggle("is-complete", completed === historyGame.events.length);
    if (completed > 0 && completed % 2 === 0 && completed > historyGame.rewardMilestone) {
        historyGame.rewardMilestone = completed;
        showKnowledgeReward("screen-history", "timeline", "시간 물결 복원!", completed + "개의 역사 사건을 연결했어요.", 60);
    }
    byId("historyMissionText").textContent = completed ? completed + "개의 시대를 연결했어요" : "첫 사건을 찾아보세요";
    const timeline = byId("historyTimeline");
    timeline.replaceChildren();
    historyGame.events.filter((event) => !historyGame?.remaining.has(event.year)).sort((a, b) => a.year - b.year).forEach((event, index) => { const chip = document.createElement("span"); chip.className = "history-era-chip"; chip.innerHTML = "<i>" + String(index + 1).padStart(2, "0") + "</i><b>" + event.yearLabel + "</b>" + event.label; timeline.append(chip); });
    if (!completed) {
        const empty = document.createElement("span");
        empty.className = "history-timeline-empty";
        empty.textContent = "사건을 맞히면 이곳에 시간의 길이 이어져요.";
        timeline.append(empty);
    }
    const cards = byId("historyCards");
    cards.replaceChildren();
    historyGame.events.filter((event) => historyGame?.remaining.has(event.year)).forEach((event, index) => { const button = document.createElement("button"); button.type = "button"; button.className = "history-card"; button.innerHTML = "<span>사건 " + String(index + 1).padStart(2, "0") + "</span><b>" + event.label + "</b>"; button.addEventListener("click", () => chooseHistoryEvent(event, button)); cards.append(button); });
}
function chooseHistoryEvent(event, button) {
    if (!historyGame?.running || historyGame.locked)
        return;
    historyGame.locked = true;
    const earliest = Math.min(...Array.from(historyGame.remaining));
    const expected = historyGame.events.find((item) => item.year === earliest);
    const correct = event.year === earliest;
    const feedback = byId("historyFeedback");
    const buttons = Array.from(byId("historyCards").querySelectorAll(".history-card"));
    historyGame.answers.push({ selected: event, expected, correct });
    historyGame.remaining.delete(earliest);
    buttons.forEach((choice) => {
        choice.disabled = true;
        if (choice.textContent?.includes(expected.label))
            choice.classList.add("correct");
    });
    if (correct) {
        historyGame.streak += 1;
        historyGame.bestStreak = Math.max(historyGame.bestStreak, historyGame.streak);
        const bonus = Math.min(100, (historyGame.streak - 1) * 20);
        historyGame.score += 140 + bonus;
        button.classList.add("correct");
        feedback.dataset.status = "correct";
        feedback.textContent = event.yearLabel + " · 시간 물결 연결!" + (bonus ? " 연속 보너스 +" + bonus : "");
        correctSound();
        pokemonSparkBurst(10);
    }
    else {
        historyGame.mistakes += 1;
        historyGame.streak = 0;
        button.classList.add("wrong");
        feedback.dataset.status = "wrong";
        feedback.textContent = "아쉬워요. 다음 사건은 ‘" + expected.yearLabel + " · " + expected.label + "’이에요.";
        wrongSound();
    }
    byId("historyMistakes").textContent = String(historyGame.mistakes);
    byId("historyStreak").textContent = String(historyGame.streak);
    window.setTimeout(() => {
        if (!historyGame?.running)
            return;
        if (!historyGame.remaining.size)
            finishHistory();
        else
            renderHistory();
    }, correct ? 1250 : 1850);
}
function finishHistory() {
    if (!historyGame?.running || state.grade === null)
        return;
    const game = historyGame;
    stopHistory();
    const correct = game.answers.filter((answer) => answer.correct).length;
    const accuracy = Math.round(correct / game.events.length * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "history", grade: state.grade, diff: "easy", score: game.score, stars, detail: game.events.length + "사건 · 실수 " + game.mistakes, timestamp: Date.now() });
    showResult(stars, game.isReview ? "시간 구간 복습 완료!" : "발챙이 시간 물결 복원!", "발챙이와 과거에서 현재까지 역사의 흐름을 연결했어요.", [[String(game.score), "점수"], [accuracy + "%", "정확도"], [correct + "/" + game.events.length, "정확히 연결"], [String(game.mistakes), "틀린 구간"]]);
    renderHistoryResultReview(game);
}
function renderHistoryResultReview(game) {
    const panel = byId("knowledgeResultReview");
    const wrongAnswers = game.answers.filter((answer) => !answer.correct);
    const reviewYears = new Set();
    wrongAnswers.forEach((answer) => { reviewYears.add(answer.selected.year); reviewYears.add(answer.expected.year); });
    historyReviewEvents = reviewYears.size ? game.events.filter((event) => reviewYears.has(event.year)) : null;
    panel.replaceChildren();
    panel.classList.remove("hidden-panel");
    appendResultReviewHeading(panel, "시간선 결과표", wrongAnswers.length ? "틀린 구간과 올바른 시간 순서를 확인해요." : "모든 역사 사건을 정확한 순서로 연결했어요!");
    appendResultMetricGrid(panel, [[String(game.answers.length - wrongAnswers.length) + " / " + game.events.length, "정확히 연결"], [String(wrongAnswers.length), "틀린 구간"], [String(game.bestStreak), "최고 연속"]]);
    if (wrongAnswers.length) {
        const details = createResultReviewDetails("틀린 시간 구간 " + wrongAnswers.length + "개");
        const list = details.querySelector("ol");
        wrongAnswers.forEach((answer) => {
            const item = document.createElement("li");
            const expected = document.createElement("strong");
            expected.textContent = answer.expected.yearLabel + " · " + answer.expected.label;
            const selected = document.createElement("p");
            selected.className = "knowledge-review-selected";
            selected.textContent = "내가 먼저 고른 사건: " + answer.selected.yearLabel + " · " + answer.selected.label;
            const guide = document.createElement("p");
            guide.className = "knowledge-review-correct";
            guide.textContent = "이 단계의 올바른 사건";
            item.append(guide, expected, selected);
            list.append(item);
        });
        panel.append(details);
    }
    byId("resultRetry").textContent = wrongAnswers.length ? "틀린 시간 구간 다시 연결하기" : "새로운 시간여행";
}
const SAFETY_QUESTIONS = [
    { category: "교통안전", prompt: "횡단보도 신호가 초록불로 바뀌었어요. 가장 먼저 할 일은?", choices: ["좌우를 살피고 차가 멈췄는지 확인하기", "바로 뛰어가기", "휴대전화를 보며 걷기"], answer: 0, explanation: "초록불이어도 좌우를 보고 차량이 완전히 멈췄는지 확인해요.", minGrade: 0 },
    { category: "화재안전", prompt: "건물에서 불이 나 연기가 보여요. 어떻게 해야 할까요?", choices: ["몸을 낮추고 계단으로 대피하기", "엘리베이터 타기", "물건을 챙기러 돌아가기"], answer: 0, explanation: "연기 아래로 몸을 낮추고 엘리베이터가 아닌 계단으로 대피해요.", minGrade: 0 },
    { category: "생활안전", prompt: "모르는 사람이 선물을 주며 따라오라고 해요.", choices: ["따라가지 않고 안전한 어른에게 알리기", "선물만 받고 따라가기", "아무에게도 말하지 않기"], answer: 0, explanation: "낯선 사람을 따라가지 말고 보호자나 경찰 등 믿을 수 있는 어른에게 알려요.", minGrade: 0 },
    { category: "응급상황", prompt: "친구가 크게 다쳐 움직이지 못해요. 무엇을 해야 할까요?", choices: ["119에 신고하고 안내를 따르기", "억지로 일으켜 세우기", "혼자 두고 가기"], answer: 0, explanation: "주변 안전을 확인하고 119에 신고한 뒤 상담원의 지시를 따라요.", minGrade: 0 },
    { category: "지진안전", prompt: "교실에서 갑자기 땅이 흔들려요.", choices: ["책상 아래에서 머리를 보호하기", "창문 밖으로 뛰어내리기", "엘리베이터로 이동하기"], answer: 0, explanation: "흔들림이 멈출 때까지 튼튼한 책상 아래에서 머리와 몸을 보호해요.", minGrade: 1 },
    { category: "물놀이", prompt: "물에 빠진 사람을 발견했지만 수영에 자신이 없어요.", choices: ["어른에게 알리고 119에 신고하기", "바로 물에 뛰어들기", "모른 척하기"], answer: 0, explanation: "직접 뛰어들면 함께 위험해질 수 있어 주변에 알리고 구조를 요청해요.", minGrade: 1 },
    { category: "식품안전", prompt: "냄새가 이상하고 유통기한이 지난 음식을 발견했어요.", choices: ["먹지 않고 어른에게 알리기", "조금만 맛보기", "친구에게 주기"], answer: 0, explanation: "상한 것으로 의심되는 음식은 먹지 말고 보호자에게 확인해요.", minGrade: 1 },
    { category: "인터넷", prompt: "게임에서 만난 사람이 집 주소를 알려 달라고 해요.", choices: ["알려주지 않고 보호자에게 말하기", "정확한 주소 보내기", "사진과 전화번호도 보내기"], answer: 0, explanation: "주소·전화번호·학교 같은 개인정보는 온라인 친구에게 공개하지 않아요.", minGrade: 2 },
    { category: "인터넷", prompt: "친구 사진을 인터넷에 올리고 싶어요.", choices: ["친구에게 먼저 허락받기", "몰래 올리기", "이름만 지우고 바로 올리기"], answer: 0, explanation: "사진에는 초상권과 개인정보가 있으므로 당사자의 동의를 받아야 해요.", minGrade: 3 },
    { category: "재난안전", prompt: "태풍 때문에 하천 물이 빠르게 불어나고 있어요.", choices: ["하천에서 멀리 떨어진 안전한 곳으로 이동하기", "가까이 가서 촬영하기", "다리를 건너 확인하기"], answer: 0, explanation: "불어난 물은 매우 위험하므로 하천과 지하 공간에서 즉시 멀어져요.", minGrade: 2 },
    { category: "전기안전", prompt: "콘센트 근처에 물이 쏟아졌어요.", choices: ["손대지 말고 어른에게 알리기", "젖은 손으로 닦기", "금속 물건을 넣어보기"], answer: 0, explanation: "감전 위험이 있으므로 젖은 손으로 만지지 말고 어른의 도움을 받아요.", minGrade: 0 },
    { category: "약물안전", prompt: "정체를 모르는 약이 책상 위에 놓여 있어요.", choices: ["먹지 않고 어른에게 알리기", "맛을 보기", "친구와 나누기"], answer: 0, explanation: "약은 보호자나 의료인의 안내 없이 함부로 먹으면 안 돼요.", minGrade: 0 },
    { category: "자전거안전", prompt: "자전거를 타고 공원에 나가려고 해요. 꼭 먼저 해야 할 일은?", choices: ["안전모와 보호 장비 착용하기", "속도를 최대한 높이기", "이어폰을 크게 듣기"], answer: 0, explanation: "자전거를 탈 때는 안전모를 쓰고 주변 소리를 들으며 안전하게 이동해요.", minGrade: 0 },
    { category: "폭염안전", prompt: "무더운 날 야외에서 친구가 어지럽다고 해요.", choices: ["그늘로 이동해 쉬고 어른에게 알리기", "계속 뛰게 하기", "두꺼운 옷을 입히기"], answer: 0, explanation: "시원한 곳으로 이동해 쉬게 하고 증상이 계속되면 즉시 도움을 요청해요.", minGrade: 1 },
    { category: "승강기안전", prompt: "엘리베이터 문이 닫히려 할 때 장난감이 안에 떨어졌어요.", choices: ["문에 손을 넣지 않고 어른에게 알리기", "손으로 문을 막기", "문 사이로 뛰어들기"], answer: 0, explanation: "닫히는 문에 손이나 물건을 넣지 말고 관리인이나 어른에게 도움을 요청해요.", minGrade: 1 },
    { category: "개인정보", prompt: "친구가 보낸 것처럼 보이는 링크에서 비밀번호를 입력하래요.", choices: ["누르지 않고 보호자에게 확인하기", "바로 비밀번호 입력하기", "친구들에게 다시 보내기"], answer: 0, explanation: "의심스러운 링크는 열지 말고 보낸 사람이나 보호자에게 먼저 확인해요.", minGrade: 2 },
    { category: "학교안전", prompt: "계단을 내려갈 때 가장 안전한 행동은 무엇일까요?", choices: ["난간을 잡고 한 칸씩 천천히 내려가기", "친구와 밀치며 빨리 내려가기", "계단에서 뛰어내리기"], answer: 0, explanation: "계단에서는 난간을 잡고 앞을 보며 한 칸씩 이동해야 넘어지지 않아요.", minGrade: 0 },
    { category: "교통안전", prompt: "통학버스에 타면 가장 먼저 무엇을 해야 할까요?", choices: ["자리에 앉아 안전띠 매기", "버스 안을 돌아다니기", "창문 밖으로 손 내밀기"], answer: 0, explanation: "버스가 출발하기 전에 자리에 바르게 앉아 안전띠를 매야 해요.", minGrade: 0 },
    { category: "생활안전", prompt: "가위를 친구에게 건넬 때 안전한 방법은 무엇일까요?", choices: ["손잡이가 친구 쪽을 향하도록 건네기", "날 끝을 친구 쪽으로 향해 건네기", "멀리서 던져 주기"], answer: 0, explanation: "가위 날을 닫아 잡고 손잡이가 받는 사람 쪽을 향하도록 천천히 건네요.", minGrade: 0 },
    { category: "생활안전", prompt: "마트에서 보호자를 잃어버렸을 때 어떻게 해야 할까요?", choices: ["안내 데스크나 직원에게 도움 요청하기", "혼자 밖으로 나가 찾기", "모르는 사람의 차를 타기"], answer: 0, explanation: "그 자리를 함부로 벗어나지 말고 이름표를 단 직원이나 안내 데스크에 도움을 요청해요.", minGrade: 0 },
    { category: "재난안전", prompt: "밖에서 천둥과 번개가 칠 때 안전한 행동은 무엇일까요?", choices: ["튼튼한 건물 안으로 들어가기", "큰 나무 바로 아래 숨기", "우산을 높이 들고 들판에 서 있기"], answer: 0, explanation: "번개가 칠 때는 나무나 열린 공간에서 벗어나 튼튼한 건물 안으로 이동해요.", minGrade: 1 },
    { category: "응급상황", prompt: "뜨거운 물에 손을 데었을 때 먼저 해야 할 일은 무엇일까요?", choices: ["흐르는 시원한 물로 식히고 어른에게 알리기", "얼음을 피부에 오래 붙이기", "치약을 바르기"], answer: 0, explanation: "화상 부위를 흐르는 시원한 물로 충분히 식힌 뒤 보호자나 선생님에게 알려요.", minGrade: 1 },
    { category: "인터넷안전", prompt: "온라인 단체방에서 친구를 놀리는 글이 계속 올라와요.", choices: ["함께 놀리지 않고 증거를 남겨 믿을 만한 어른에게 알리기", "재미있으니 같이 놀리기", "다른 방에도 퍼뜨리기"], answer: 0, explanation: "온라인 괴롭힘에 참여하지 말고 화면을 보관해 보호자나 선생님에게 도움을 요청해요.", minGrade: 2 },
    { category: "학교안전", prompt: "과학실에서 이름을 모르는 약품을 발견했어요.", choices: ["만지거나 냄새 맡지 않고 선생님께 알리기", "조금 맛보기", "친구 가방에 넣기"], answer: 0, explanation: "과학실 약품은 위험할 수 있으므로 직접 확인하지 말고 선생님의 안내를 받아요.", minGrade: 3 },
    { category: "놀이안전", prompt: "친구가 그네를 타고 있을 때 안전한 행동은 무엇일까요?", choices: ["그네가 멈출 때까지 떨어져 기다리기", "움직이는 그네 앞으로 지나가기", "그네 줄을 갑자기 잡기"], answer: 0, explanation: "움직이는 그네와 충분히 거리를 두고 완전히 멈춘 뒤 차례를 지켜요.", minGrade: 0 },
    { category: "승강기안전", prompt: "에스컬레이터를 이용할 때 바른 행동은 무엇일까요?", choices: ["노란 선 안에 서서 손잡이를 잡기", "계단에서 뛰어다니기", "신발 끈을 길게 늘어뜨리기"], answer: 0, explanation: "노란 안전선 안에 서서 손잡이를 잡고, 신발 끈이나 옷자락이 끼지 않게 살펴요.", minGrade: 0 },
    { category: "생활안전", prompt: "길에서 모르는 동물이 다가올 때 어떻게 해야 할까요?", choices: ["만지지 않고 천천히 거리를 두며 어른에게 알리기", "갑자기 소리치며 쫓아가기", "먹이를 손으로 바로 주기"], answer: 0, explanation: "낯선 동물은 놀라 공격할 수 있으므로 자극하지 말고 안전한 거리를 유지해요.", minGrade: 0 },
    { category: "가스안전", prompt: "집에서 가스 냄새가 강하게 날 때 어떻게 해야 할까요?", choices: ["전기 스위치를 만지지 말고 밖으로 나가 어른에게 알리기", "불을 켜서 확인하기", "휴대전화 충전기를 꽂기"], answer: 0, explanation: "불꽃이나 전기 스파크가 위험하므로 스위치를 조작하지 말고 안전한 곳에서 도움을 요청해요.", minGrade: 0 },
    { category: "재난안전", prompt: "폭우로 지하차도에 물이 차오르고 있어요.", choices: ["들어가지 않고 높은 안전한 곳으로 이동하기", "물이 얕아 보이면 건너가기", "사진을 찍으러 가까이 가기"], answer: 0, explanation: "침수된 지하 공간은 물이 빠르게 불어날 수 있으므로 접근하지 말고 높은 곳으로 이동해요.", minGrade: 1 },
    { category: "생활안전", prompt: "미세먼지가 매우 나쁜 날 외출해야 한다면 어떻게 할까요?", choices: ["보건용 마스크를 바르게 쓰고 오래 밖에 있지 않기", "창문을 모두 열고 달리기", "마스크를 턱에 걸치기"], answer: 0, explanation: "미세먼지가 심한 날에는 외출을 줄이고 필요하면 자신에게 맞는 보건용 마스크를 바르게 써요.", minGrade: 1 },
    { category: "개인정보", prompt: "모르는 사람이 휴대전화 인증번호를 알려 달라고 해요.", choices: ["절대 알려주지 않고 보호자에게 알리기", "한 번만 알려주기", "온라인 게시판에 올리기"], answer: 0, explanation: "인증번호는 계정이나 결제에 사용될 수 있는 중요한 정보이므로 누구에게도 알려주지 않아요.", minGrade: 2 },
    { category: "응급상황", prompt: "사람이 쓰러져 불러도 반응하지 않아요. 가장 먼저 할 일은?", choices: ["주변 어른에게 도움을 청하고 119에 신고하기", "물부터 억지로 먹이기", "혼자 옮겨 세우기"], answer: 0, explanation: "반응이 없으면 즉시 주변에 도움을 요청하고 119 상담원의 안내에 따라 행동해요.", minGrade: 3 }
];
const SAFETY_EXTRA_SEEDS = [
    ["학교안전", "교실 바닥에 물이 쏟아져 미끄러워요.", "친구들이 오지 못하게 알리고 선생님과 함께 닦기", "그대로 두고 뛰어다니기", "물 위에서 미끄럼 놀이하기", "미끄러운 곳을 다른 사람에게 알리고 어른의 도움을 받아 안전하게 정리해요.", 0],
    ["학교안전", "문을 닫을 때 친구의 손이 문틈 가까이에 있어요.", "잠시 멈추고 손을 치운 뒤 천천히 닫기", "세게 밀어 닫기", "장난으로 여러 번 여닫기", "문틈에 손가락이 끼지 않도록 주변을 확인하고 손잡이를 잡아 천천히 닫아요.", 0],
    ["학교안전", "높은 책장 위의 물건이 필요해요.", "선생님이나 어른에게 꺼내 달라고 부탁하기", "바퀴 달린 의자 위에 올라가기", "책장을 타고 올라가기", "불안정한 가구에 올라가지 말고 어른에게 도움을 요청해요.", 0],
    ["운동안전", "체육 활동을 시작하기 전 가장 먼저 할 일은?", "준비운동으로 몸을 천천히 풀기", "바로 가장 빠르게 달리기", "친구를 밀어 출발하기", "준비운동은 근육과 관절을 풀어 운동 중 다칠 위험을 줄여 줘요.", 0],
    ["놀이안전", "미끄럼틀을 안전하게 이용하는 방법은?", "한 명씩 앉아서 앞을 보고 내려가기", "거꾸로 기어 올라가기", "친구와 동시에 밀며 내려가기", "미끄럼틀에서는 차례를 지키고 정해진 방향으로 한 명씩 이용해요.", 0],
    ["생활안전", "바닥에서 깨진 유리 조각을 발견했어요.", "손대지 말고 주변에 알린 뒤 어른을 부르기", "맨손으로 바로 줍기", "발로 구석에 밀어 넣기", "깨진 유리는 작은 조각도 위험하므로 가까이 가지 말고 어른에게 알려요.", 0],
    ["학교안전", "스테이플러를 사용할 때 바른 행동은?", "손가락을 찍는 부분에서 떼고 책상 위에서 누르기", "친구 쪽으로 겨누기", "심이 나오는 곳에 손 넣기", "스테이플러의 심이 나오는 부분에 손을 대지 않고 안정된 곳에서 사용해요.", 1],
    ["생활안전", "세제와 표백제가 놓여 있어요. 어떻게 해야 할까요?", "서로 섞지 말고 보호자의 안내대로 사용하기", "냄새가 좋게 여러 세제를 섞기", "음료수병에 옮겨 담기", "세제를 섞으면 유독한 기체가 생길 수 있고 다른 용기에 담으면 오인할 수 있어요.", 2],
    ["주방안전", "전자레인지에 넣으면 안 되는 물건은 무엇일까요?", "금속으로 된 그릇이나 포일", "전자레인지용 그릇", "사용 가능 표시가 있는 용기", "금속은 전자레인지 안에서 불꽃과 화재를 일으킬 수 있어요.", 2],
    ["주방안전", "냄비를 가스레인지 위에 놓을 때 손잡이는 어떻게 할까요?", "몸이 부딪히지 않도록 안쪽으로 돌려 놓기", "통로 쪽으로 길게 내놓기", "불꽃 바로 위에 놓기", "냄비 손잡이를 안쪽으로 두면 지나가다 부딪혀 뜨거운 내용물이 쏟아지는 사고를 줄여요.", 1],
    ["전기안전", "전선의 겉이 벗겨져 안쪽이 보여요.", "사용하지 말고 플러그를 만지지 않은 채 어른에게 알리기", "테이프 없이 계속 사용하기", "젖은 손으로 확인하기", "손상된 전선은 감전이나 화재 위험이 있으므로 전원을 다룰 수 있는 어른에게 알려요.", 1],
    ["전기안전", "하나의 멀티탭에 전열 기구를 많이 꽂으면 왜 위험할까요?", "과열되어 화재가 날 수 있어서", "전기가 더 깨끗해져서", "기구가 가벼워져서", "허용 용량을 넘기면 전선과 멀티탭이 과열될 수 있으므로 문어발식 사용을 피해야 해요.", 3],
    ["화재안전", "옷에 불이 붙었을 때 알맞은 행동은?", "멈추고 바닥에 엎드려 몸을 굴리기", "바람을 맞으며 뛰기", "옷장 안에 숨기", "뛰면 불길이 더 커질 수 있어 멈추고 엎드려 구르며 불을 꺼야 해요.", 1],
    ["화재안전", "비상벨을 장난으로 누르면 안 되는 까닭은?", "실제 위험 알림을 방해하고 사람들이 다칠 수 있어서", "소리가 작아져서", "벨 색이 변해서", "거짓 경보는 대피와 구조를 방해하므로 실제 비상 상황에서만 사용해요.", 1],
    ["화재안전", "낯선 건물에 들어갔을 때 확인하면 좋은 것은?", "비상구와 대피로의 위치", "엘리베이터 장식", "가장 비싼 물건", "미리 비상구 위치를 알아 두면 화재나 재난 때 더 빠르고 안전하게 대피할 수 있어요.", 2],
    ["교통안전", "주차된 차가 많은 골목길을 걸을 때 어떻게 할까요?", "차가 움직이는지 살피며 가장자리로 천천히 걷기", "차 사이에서 갑자기 뛰어나오기", "휴대전화를 보며 가운데로 걷기", "골목에서는 운전자의 시야가 가릴 수 있어 차의 움직임과 소리를 살펴야 해요.", 0],
    ["자전거안전", "자전거를 타고 횡단보도를 건널 때 안전한 방법은?", "자전거에서 내려 끌고 건너기", "사람 사이를 빠르게 달리기", "신호가 바뀌기 전에 질주하기", "보행자 횡단보도에서는 자전거에서 내려 주변을 살피며 끌고 건너요.", 1],
    ["교통안전", "자동차 뒷좌석에 앉았을 때 해야 할 일은?", "몸에 맞게 안전띠를 매기", "누워서 안전띠 풀기", "차가 움직일 때 자리 바꾸기", "앞좌석과 뒷좌석 모두 안전띠를 올바르게 매야 충돌 때 몸을 보호할 수 있어요.", 0],
    ["교통안전", "버스에서 내린 뒤 길을 건너려면 어떻게 해야 할까요?", "버스가 떠난 뒤 시야가 확보된 곳에서 신호를 확인하기", "버스 바로 앞에서 뛰어 건너기", "버스 뒤에 붙어 건너기", "버스 앞뒤에서는 차량이 서로를 보기 어려우므로 버스가 떠난 뒤 안전하게 건너요.", 1],
    ["교통안전", "철길 건널목의 경보음이 울리고 차단기가 내려와요.", "멈춰 서서 열차가 지나고 차단기가 올라갈 때까지 기다리기", "차단기 아래로 들어가기", "선로 위에서 사진 찍기", "열차는 빨리 멈출 수 없으므로 경보가 울리면 절대 선로에 들어가지 않아요.", 2],
    ["겨울안전", "길이 얼어 미끄러울 때 안전하게 걷는 방법은?", "보폭을 줄이고 주머니에서 손을 빼 천천히 걷기", "손을 주머니에 넣고 뛰기", "얼음 위에서 미끄럼 타기", "작은 보폭으로 천천히 걷고 손을 자유롭게 두면 넘어질 때 균형을 잡기 쉬워요.", 0],
    ["폭염안전", "더운 날 주차된 자동차 안에 혼자 남게 되었어요.", "즉시 차 밖의 안전한 어른에게 도움 요청하기", "창문을 닫고 기다리기", "담요를 덮고 잠자기", "차 안 온도는 매우 빠르게 오르므로 혼자 남아 있지 말고 즉시 도움을 요청해야 해요.", 1],
    ["지진안전", "운동장처럼 건물 밖에서 지진이 나면 어떻게 할까요?", "건물과 담장에서 떨어져 머리를 보호하기", "건물 벽에 붙어 서기", "전봇대 아래로 가기", "밖에서는 떨어지는 물건을 피해 건물·담장·전봇대에서 멀리 이동해요.", 1],
    ["재난안전", "바닷가에서 강한 지진을 느낀 뒤 해야 할 행동은?", "해안에서 멀리 떨어진 높은 곳으로 대피하기", "파도를 보러 물가로 가기", "모래사장에 앉아 기다리기", "지진 뒤에는 지진해일이 올 수 있으므로 안내를 기다리지 말고 높은 곳으로 이동해요.", 3],
    ["재난안전", "큰비가 계속 내리는 산비탈에서 돌이 굴러내려요.", "산비탈과 계곡에서 벗어나 지정된 안전한 곳으로 이동하기", "가까이 가서 살펴보기", "계곡 아래에서 기다리기", "산사태 징후가 보이면 비탈과 계곡을 피해 신속히 대피하고 신고해요.", 3],
    ["겨울안전", "지붕 끝에 큰 고드름이 매달려 있어요.", "아래로 지나가지 않고 관리하는 어른에게 알리기", "막대기로 바로 떨어뜨리기", "고드름 아래에서 놀기", "고드름이 갑자기 떨어질 수 있으므로 주변을 피하고 안전하게 제거할 수 있는 어른에게 알려요.", 0],
    ["물놀이", "구명조끼를 바르게 입는 방법은?", "몸에 맞는 크기를 골라 모든 버클과 다리 끈을 잠그기", "큰 것을 걸치기만 하기", "지퍼와 버클을 모두 풀기", "구명조끼가 벗겨지지 않도록 몸에 맞게 조절하고 잠금장치를 모두 채워요.", 1],
    ["물놀이", "깊이를 모르는 물에 들어가기 전에 해야 할 일은?", "들어가지 말고 안전요원과 깊이 표시를 확인하기", "머리부터 뛰어들기", "친구를 먼저 밀어 넣기", "물의 깊이와 바닥 상태를 모르면 다칠 수 있으므로 반드시 먼저 확인해요.", 1],
    ["물놀이", "바다에서 물살에 밀려 해변에서 멀어지고 있어요.", "침착하게 구조를 요청하고 물살과 나란한 방향으로 벗어나기", "물살을 정면으로 거슬러 힘껏 헤엄치기", "소리 내지 않고 혼자 버티기", "이안류가 의심되면 체력을 아끼며 구조를 알리고 해안과 평행한 방향으로 빠져나와요.", 4],
    ["산행안전", "산에서 길을 잃었을 때 알맞은 행동은?", "함부로 이동하지 말고 위치를 알리며 구조 요청하기", "어두워져도 아무 방향으로 달리기", "휴대전화 전원을 계속 켜 둔 채 영상 보기", "위치를 더 잃지 않도록 안전한 곳에 머물며 119에 구조를 요청하고 배터리를 아껴요.", 3],
    ["식품안전", "음식 알레르기가 있다면 포장 식품에서 무엇을 확인할까요?", "알레르기 유발 성분 표시", "포장 색깔만", "광고 모델 이름", "알레르기 유발 재료가 들어 있는지 성분 표시를 확인하고 모르면 먹지 않아요.", 2],
    ["약물안전", "처방받은 약을 먹을 때 지켜야 할 것은?", "정해진 사람과 시간과 용량에 맞게 먹기", "증상이 비슷한 친구와 나누기", "효과를 빨리 보려고 두 배로 먹기", "약은 처방받은 사람이 안내된 시간과 용량에 맞게 복용해야 해요.", 2],
    ["응급상황", "코피가 날 때 바른 응급 처치는?", "고개를 조금 숙이고 콧방울을 눌러 지혈하기", "고개를 뒤로 젖혀 피를 삼키기", "코를 세게 풀기", "몸을 앞으로 약간 숙이고 부드러운 코 부분을 일정 시간 눌러요.", 2],
    ["응급상황", "친구가 음식을 먹다 목을 잡고 숨쉬기 힘들어해요.", "즉시 주변에 알리고 119에 신고해 안내를 따르기", "물을 억지로 많이 먹이기", "혼자 조용히 기다리기", "기도가 막힌 것으로 보이면 즉시 도움과 119를 요청하고 안내에 따라 응급 처치를 해요.", 3],
    ["응급상황", "동물에게 물려 피부에 상처가 났어요.", "안전한 곳에서 흐르는 물로 씻고 어른과 의료기관에 알리기", "흙을 바르기", "상처를 숨기기", "동물에게 물린 상처는 감염 위험이 있어 씻은 뒤 반드시 어른과 의료진에게 알려요.", 2],
    ["인터넷안전", "온라인에서 알게 된 사람이 직접 만나자고 해요.", "혼자 만나지 말고 보호자에게 알리기", "아무도 모르게 약속 장소에 가기", "집 주소부터 보내기", "온라인 상대의 신원을 확신할 수 없으므로 혼자 만나지 않고 보호자와 상의해요.", 2],
    ["인터넷안전", "길에 붙은 출처를 모르는 QR 코드를 발견했어요.", "함부로 스캔하지 않고 공식 안내인지 확인하기", "바로 스캔해 앱 설치하기", "개인정보를 모두 입력하기", "출처가 불분명한 QR 코드는 악성 사이트로 연결될 수 있어 확인 없이 열지 않아요.", 3],
    ["인터넷안전", "공공 와이파이에서 중요한 결제를 해야 해요.", "안전한 개인 통신망에서 나중에 이용하기", "보안 표시 없이 바로 결제하기", "비밀번호를 메모장에 공개하기", "공공 와이파이는 정보가 노출될 수 있어 금융 거래와 중요한 로그인을 피하는 것이 안전해요.", 4],
    ["학교안전", "친구가 괴롭힘을 당하는 모습을 보았어요.", "안전하게 도움을 요청하고 선생님에게 사실대로 알리기", "함께 놀리기", "영상만 찍어 퍼뜨리기", "혼자 위험하게 개입하기보다 믿을 만한 어른에게 즉시 알려 피해 친구를 도와요.", 1],
    ["과학실안전", "실험 중 유리 기구가 깨졌어요.", "손대지 말고 친구들이 접근하지 않게 한 뒤 선생님께 알리기", "맨손으로 조각을 모으기", "깨진 조각을 가방에 넣기", "깨진 실험 기구는 날카롭거나 약품이 묻었을 수 있어 선생님이 안전하게 처리해야 해요.", 2]
];
SAFETY_QUESTIONS.push(...SAFETY_EXTRA_SEEDS.map(([category, prompt, correct, wrong1, wrong2, explanation, minGrade]) => ({ category, prompt, choices: [correct, wrong1, wrong2], answer: 0, explanation, minGrade })));
let safety = null;
let safetyReviewQuestions = null;
function stopSafety() { if (safety)
    safety.running = false; }
function startSafety(reviewQuestions) {
    if (state.grade === null)
        return;
    const grade = state.grade;
    const isReview = Boolean(reviewQuestions?.length);
    const questions = isReview ? shuffle([...reviewQuestions]) : shuffle(SAFETY_QUESTIONS.filter((question) => question.minGrade <= grade)).slice(0, 10);
    safetyReviewQuestions = null;
    safety = { running: true, questions, answers: [], index: 0, score: 0, correct: 0, streak: 0, locked: false, started: Date.now(), rewardMilestone: 0, isReview };
    replaceWithPokemon(byId("safetyMascot"), 7);
    showScreen("safety");
    nextSafety();
}
function nextSafety() {
    if (!safety?.running)
        return;
    if (safety.index >= safety.questions.length) {
        finishSafety();
        return;
    }
    safety.locked = false;
    const question = safety.questions[safety.index];
    byId("safetyScore").textContent = String(safety.score);
    byId("safetyCount").textContent = "상황 " + (safety.index + 1) + "/" + safety.questions.length;
    byId("safetyStreak").textContent = String(safety.streak);
    const category = byId("safetyCategory");
    category.textContent = question.category;
    category.dataset.icon = safetyCategoryIcon(question.category);
    byId("safetyQuestion").textContent = question.prompt;
    byId("safetyExplanation").replaceChildren();
    byId("safetyReaction").textContent = "꼬부기가 안전 순찰 중이에요. 가장 안전한 행동을 골라요!";
    byId("screen-safety").classList.remove("rescue-success", "rescue-alert");
    renderSafetyShield();
    const indexed = shuffle(question.choices.map((label, index) => ({ label, correct: index === question.answer })));
    const choices = byId("safetyChoices");
    choices.replaceChildren();
    indexed.forEach((item) => { const button = document.createElement("button"); button.type = "button"; button.className = "safety-choice"; button.textContent = item.label; button.addEventListener("click", () => answerSafety(item.correct, button, indexed)); choices.append(button); });
}
function safetyCategoryIcon(category) {
    if (category.includes("교통") || category.includes("자전거"))
        return "🚦";
    if (category.includes("화재"))
        return "🔥";
    if (category.includes("물") || category.includes("폭염"))
        return "💧";
    if (category.includes("인터넷") || category.includes("개인정보"))
        return "🔒";
    if (category.includes("응급") || category.includes("약물"))
        return "✚";
    if (category.includes("지진") || category.includes("재난"))
        return "⛑";
    if (category.includes("전기") || category.includes("승강기"))
        return "⚠";
    return "🛡";
}
function renderSafetyShield() {
    if (!safety)
        return;
    const total = Math.max(1, safety.questions.length);
    byId("safetyShieldBar").style.width = `${safety.correct / total * 100}%`;
    byId("safetyShieldText").textContent = `${safety.correct} / ${total}`;
    const progress = byId("safetyProgress");
    progress.replaceChildren();
    progress.style.gridTemplateColumns = `repeat(${total},minmax(0,1fr))`;
    for (let index = 0; index < total; index += 1) {
        const dot = document.createElement("span");
        const answer = safety.answers[index];
        dot.className = answer ? answer.correct ? "complete" : "incorrect" : index === safety.index && !safety.locked ? "current" : "";
        dot.textContent = answer ? answer.correct ? "✓" : "×" : String(index + 1);
        progress.append(dot);
    }
    document.querySelector("#screen-safety .safety-shield")?.classList.toggle("charged", safety.correct === total);
    if (safety.correct > 0 && safety.correct % 3 === 0 && safety.correct > safety.rewardMilestone) {
        safety.rewardMilestone = safety.correct;
        showKnowledgeReward("screen-safety", "rescue", "구조대 연속 임무 성공!", "안전한 선택을 3번 연속으로 해냈어요. 보너스 방패를 획득했어요.", 7);
    }
}
function answerSafety(correct, selected, indexed) {
    if (!safety?.running || safety.locked)
        return;
    const question = safety.questions[safety.index];
    const buttons = Array.from(byId("safetyChoices").querySelectorAll("button"));
    const answerIndex = indexed.findIndex((item) => item.correct);
    const correctLabel = indexed[answerIndex]?.label ?? question.choices[question.answer];
    safety.locked = true;
    buttons.forEach((button, index) => { button.disabled = true; if (indexed[index]?.correct)
        button.classList.add("correct"); });
    safety.answers.push({ question, selectedLabel: selected.textContent ?? "", correctLabel, correct });
    if (correct) {
        safety.correct += 1;
        safety.streak += 1;
        const patrolBonus = safety.streak % 3 === 0;
        const gained = 120 + safety.streak * 10 + (patrolBonus ? 100 : 0);
        safety.score += gained;
        selected.classList.add("correct");
        byId("safetyReaction").textContent = patrolBonus ? "꼬부기 구조 보너스! 3연속 안전 선택 +100" : "안전 선택 성공! 꼬부기가 힘차게 물방울 방패를 채웠어요.";
        byId("screen-safety").classList.add("rescue-success");
        if (patrolBonus) {
            pokemonSparkBurst(7);
            playPokemonCry(7);
        }
        correctSound();
    }
    else {
        safety.streak = 0;
        selected.classList.add("wrong");
        byId("screen-safety").classList.add("rescue-alert");
        byId("safetyReaction").textContent = "아쉬워요. 가장 안전한 행동은 ‘" + correctLabel + "’이에요.";
        wrongSound();
    }
    byId("safetyExplanation").textContent = question.explanation;
    byId("safetyScore").textContent = String(safety.score);
    byId("safetyStreak").textContent = String(safety.streak);
    renderSafetyShield();
    window.setTimeout(() => { if (!safety?.running)
        return; safety.index += 1; nextSafety(); }, correct ? 1400 : 2000);
}
function finishSafety() {
    if (!safety?.running || state.grade === null)
        return;
    const game = safety;
    stopSafety();
    const accuracy = Math.round(game.correct / game.questions.length * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    saveRecord({ name: getName() || "친구", mode: "safety", grade: state.grade, diff: "easy", score: game.score, stars, detail: game.correct + "/" + game.questions.length + " · 안전", timestamp: Date.now() });
    showResult(stars, game.isReview ? "안전 문제 복습 완료!" : "꼬부기 안전 순찰 완료!", "꼬부기와 " + game.correct + "개의 안전한 행동을 찾아 물방울 방패를 완성했어요.", [[String(game.score), "점수"], [accuracy + "%", "정답률"], [game.correct + "/" + game.questions.length, "구조 성공"], [String(game.questions.length - game.correct), "다시 볼 상황"]]);
    renderSafetyResultReview(game);
}
function safetyResultArea(category) {
    if (/교통|자전거|승강기/.test(category))
        return "이동 안전";
    if (/화재|지진|재난|폭염/.test(category))
        return "재난 대응";
    if (/인터넷|개인정보/.test(category))
        return "온라인 안전";
    if (/응급/.test(category))
        return "응급 도움";
    return "생활 건강";
}
function renderSafetyResultReview(game) {
    const panel = byId("knowledgeResultReview");
    const wrongAnswers = game.answers.filter((answer) => !answer.correct);
    safetyReviewQuestions = wrongAnswers.length ? wrongAnswers.map((answer) => answer.question) : null;
    panel.replaceChildren();
    panel.classList.remove("hidden-panel");
    appendResultReviewHeading(panel, "안전 순찰 결과표", wrongAnswers.length ? "잘 알고 있는 안전 분야와 다시 볼 상황을 확인해요." : "모든 상황에서 가장 안전한 행동을 선택했어요!");
    const areas = Array.from(new Set(game.questions.map((question) => safetyResultArea(question.category))));
    const areaStats = areas.map((area) => {
        const answers = game.answers.filter((answer) => safetyResultArea(answer.question.category) === area);
        return [answers.filter((answer) => answer.correct).length + " / " + answers.length, area];
    });
    appendResultMetricGrid(panel, areaStats);
    if (wrongAnswers.length) {
        const details = createResultReviewDetails("다시 볼 안전 상황 " + wrongAnswers.length + "개");
        const list = details.querySelector("ol");
        wrongAnswers.forEach((answer) => {
            const item = document.createElement("li");
            const prompt = document.createElement("strong");
            prompt.textContent = answer.question.prompt;
            const selected = document.createElement("p");
            selected.className = "knowledge-review-selected";
            selected.textContent = "내가 고른 행동: " + answer.selectedLabel;
            const correctAnswer = document.createElement("p");
            correctAnswer.className = "knowledge-review-correct";
            correctAnswer.textContent = "안전한 행동: " + answer.correctLabel;
            const explanation = document.createElement("p");
            explanation.textContent = answer.question.explanation;
            item.append(prompt, selected, correctAnswer, explanation);
            list.append(item);
        });
        panel.append(details);
    }
    byId("resultRetry").textContent = wrongAnswers.length ? "틀린 안전 문제 다시 풀기" : "새로운 안전 순찰";
}
const KNOWLEDGE_QUESTIONS = [
    { category: "과학", prompt: "식물이 건강하게 자라는 데 가장 필요한 것은 무엇일까요?", choices: ["햇빛과 물", "장난감", "연필", "모래시계"], answer: 0, explanation: "식물은 햇빛을 받아 양분을 만들고 뿌리로 물을 흡수해요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "사회", prompt: "길을 건널 때 가장 안전한 곳은 어디일까요?", choices: ["횡단보도", "차도 가운데", "주차장 사이", "아무 곳"], answer: 0, explanation: "신호를 확인하고 횡단보도로 건너야 운전자도 우리를 쉽게 볼 수 있어요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "역사", prompt: "옛날 사람들이 사용한 물건을 볼 수 있는 곳은 어디일까요?", choices: ["박물관", "수영장", "놀이터", "주차장"], answer: 0, explanation: "박물관은 옛 물건과 기록을 보존하고 전시하는 곳이에요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "생활", prompt: "밥을 먹기 전에 먼저 해야 할 일은 무엇일까요?", choices: ["손 씻기", "달리기", "신발 신기", "불 끄기"], answer: 0, explanation: "비누로 손을 씻으면 손에 묻은 세균과 오염물을 줄일 수 있어요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "과학", prompt: "얼음을 따뜻한 곳에 두면 어떻게 될까요?", choices: ["물이 돼요", "더 단단해져요", "나무가 돼요", "빛이 돼요"], answer: 0, explanation: "고체인 얼음은 열을 받으면 녹아서 액체인 물이 돼요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "사회", prompt: "우리 동네의 모습을 작게 나타낸 그림은 무엇일까요?", choices: ["지도", "일기", "동화책", "악보"], answer: 0, explanation: "지도는 장소의 위치와 길을 약속된 기호로 나타내요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "역사", prompt: "한글을 만든 왕은 누구일까요?", choices: ["세종대왕", "이순신", "장영실", "김홍도"], answer: 0, explanation: "세종대왕은 백성이 쉽게 읽고 쓰도록 훈민정음을 만들었어요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "생활", prompt: "불이 크게 났을 때 신고할 전화번호는 무엇일까요?", choices: ["119", "112", "120", "114"], answer: 0, explanation: "화재와 구조·응급 상황은 119에 신고해요. 안전한 곳으로 먼저 대피해야 해요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "과학", prompt: "낮에 생긴 그림자가 움직이는 가장 큰 까닭은 무엇일까요?", choices: ["태양이 보이는 위치가 달라져서", "나무가 걸어서", "땅이 줄어들어서", "바람이 색을 바꿔서"], answer: 0, explanation: "시간이 지나며 태양이 보이는 방향이 달라져 그림자의 방향과 길이도 변해요.", minGrade: 0, maxGrade: 2, tier: 3 },
    { category: "사회", prompt: "도서관에서 지켜야 할 행동은 무엇일까요?", choices: ["작은 목소리로 이용하기", "책에 낙서하기", "큰 소리로 뛰기", "책을 숨기기"], answer: 0, explanation: "공공장소에서는 다른 사람도 편히 이용하도록 약속을 지켜요.", minGrade: 0, maxGrade: 2, tier: 3 },
    { category: "역사", prompt: "과거에 있었던 일을 날짜 순서로 정리한 것은 무엇일까요?", choices: ["연표", "지도", "악보", "시간표"], answer: 0, explanation: "연표를 보면 여러 역사적 사건의 앞뒤 순서를 쉽게 알 수 있어요.", minGrade: 0, maxGrade: 2, tier: 3 },
    { category: "생활", prompt: "모르는 사람이 따라오라고 할 때 가장 알맞은 행동은 무엇일까요?", choices: ["따라가지 않고 믿을 만한 어른에게 알리기", "조용히 따라가기", "비밀로 하기", "선물을 받기"], answer: 0, explanation: "낯선 사람을 따라가지 말고 사람이 많은 곳이나 안전한 어른에게 도움을 요청해요.", minGrade: 0, maxGrade: 2, tier: 3 },
    { category: "과학", prompt: "자석에 가장 잘 붙는 물질은 무엇일까요?", choices: ["철", "나무", "유리", "고무"], answer: 0, explanation: "자석은 철처럼 자석의 힘에 반응하는 물질을 끌어당겨요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "사회", prompt: "동서남북을 찾을 때 사용하는 도구는 무엇일까요?", choices: ["나침반", "온도계", "저울", "돋보기"], answer: 0, explanation: "나침반의 자침은 남북 방향을 가리켜 방위를 찾도록 도와줘요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "역사", prompt: "문화유산을 보호해야 하는 까닭은 무엇일까요?", choices: ["과거의 생활과 지혜를 전해 주기 때문에", "새것이 아니기 때문에", "값을 숨기기 위해", "사용하지 못하게 하려고"], answer: 0, explanation: "문화유산에는 과거 사람들의 삶과 생각이 담겨 있어 다음 세대에 전할 가치가 있어요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "생활", prompt: "개인정보에 해당하는 것은 무엇일까요?", choices: ["집 주소와 전화번호", "좋아하는 색", "오늘 날씨", "교실 벽 색깔"], answer: 0, explanation: "주소와 전화번호 같은 개인정보는 함부로 공개하지 않아야 해요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "과학", prompt: "물이 수증기가 되어 공기 중으로 올라가는 현상은 무엇일까요?", choices: ["증발", "응결", "결빙", "침전"], answer: 0, explanation: "액체인 물이 열을 받아 기체인 수증기로 변하는 현상을 증발이라고 해요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "사회", prompt: "생산자가 물건을 만들어 소비자에게 전하는 활동을 무엇이라 할까요?", choices: ["경제 활동", "기상 관측", "문화유산", "자연 현상"], answer: 0, explanation: "사람들은 생산·유통·소비 같은 경제 활동으로 필요한 것을 주고받아요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "역사", prompt: "이순신 장군이 바다에서 나라를 지킬 때 사용한 배는 무엇일까요?", choices: ["거북선", "황포돛배", "뗏목", "증기선"], answer: 0, explanation: "이순신 장군은 조선 수군을 이끌었고 거북선을 전투에 활용했어요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "생활", prompt: "인터넷에서 다른 사람의 사진을 올리기 전에 해야 할 일은 무엇일까요?", choices: ["당사자의 허락 받기", "이름을 바꾸기", "몰래 올리기", "친구에게만 숨기기"], answer: 0, explanation: "사진에도 개인정보와 초상권이 있으므로 당사자의 동의를 받아야 해요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "과학", prompt: "하루 동안 낮과 밤이 생기는 주된 까닭은 무엇일까요?", choices: ["지구의 자전", "달의 공전", "계절의 변화", "구름의 이동"], answer: 0, explanation: "지구가 스스로 회전하면서 태양을 향한 쪽은 낮, 반대쪽은 밤이 돼요.", minGrade: 3, maxGrade: 4, tier: 3 },
    { category: "사회", prompt: "지역의 중요한 일을 주민이 함께 결정하는 모습과 가장 가까운 것은?", choices: ["주민 회의와 투표", "혼자 명령하기", "규칙 숨기기", "의견 말하지 않기"], answer: 0, explanation: "민주적인 의사 결정은 서로 의견을 나누고 정해진 절차에 따라 결정해요.", minGrade: 3, maxGrade: 4, tier: 3 },
    { category: "역사", prompt: "역사 자료를 살필 때 가장 먼저 확인하면 좋은 것은 무엇일까요?", choices: ["누가 언제 왜 만들었는지", "종이의 크기만", "글자 수만", "가격만"], answer: 0, explanation: "자료의 만든 사람·시기·목적을 확인해야 당시 상황과 의미를 바르게 판단할 수 있어요.", minGrade: 3, maxGrade: 4, tier: 3 },
    { category: "생활", prompt: "지진으로 교실이 흔들릴 때 우선 해야 할 행동은 무엇일까요?", choices: ["책상 아래에서 머리 보호하기", "창문으로 달려가기", "엘리베이터 타기", "밖으로 바로 뛰기"], answer: 0, explanation: "흔들릴 때는 책상 아래에서 머리와 몸을 보호하고, 멈춘 뒤 안내에 따라 이동해요.", minGrade: 3, maxGrade: 4, tier: 3 },
    { category: "과학", prompt: "식물이 빛을 이용해 양분을 만드는 작용은 무엇일까요?", choices: ["광합성", "증발", "소화", "마찰"], answer: 0, explanation: "식물은 빛에너지를 이용해 이산화탄소와 물로 양분을 만들어요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "사회", prompt: "국민이 대표를 뽑아 나라의 일을 맡기는 제도는 무엇일까요?", choices: ["대의 민주제", "절대 군주제", "신분제", "봉건제"], answer: 0, explanation: "대의 민주제에서는 국민이 선거로 대표를 뽑고 대표가 공적인 결정을 해요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "역사", prompt: "삼국을 통일한 뒤 한반도 남쪽 대부분을 다스린 나라는?", choices: ["통일 신라", "고조선", "조선", "대한제국"], answer: 0, explanation: "신라는 당과 연합해 백제와 고구려를 멸망시킨 뒤 삼국 통일을 이루었어요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "생활", prompt: "온라인 정보가 사실인지 판단할 때 가장 좋은 방법은?", choices: ["여러 믿을 만한 출처와 비교하기", "제목만 믿기", "조회 수만 보기", "친구 말만 믿기"], answer: 0, explanation: "작성자와 근거, 작성 날짜를 확인하고 공신력 있는 여러 출처와 비교해야 해요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "과학", prompt: "계절이 생기는 주된 까닭은 무엇일까요?", choices: ["기울어진 지구가 태양 주위를 공전해서", "태양의 크기가 변해서", "달이 지구를 가려서", "바람 방향만 변해서"], answer: 0, explanation: "지구의 자전축이 기울어진 채 공전해 계절마다 햇빛을 받는 각도와 시간이 달라져요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "사회", prompt: "수요가 늘고 공급이 그대로일 때 일반적으로 가격은 어떻게 될까요?", choices: ["오르는 경향이 있어요", "항상 0원이 돼요", "반드시 절반이 돼요", "변할 수 없어요"], answer: 0, explanation: "사려는 양이 늘지만 물건의 양이 같다면 경쟁이 생겨 가격이 오르는 경향이 있어요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "역사", prompt: "조선 후기에 실생활에 도움이 되는 학문을 강조한 사상은?", choices: ["실학", "성리학", "불교", "도교"], answer: 0, explanation: "실학자들은 농업·상공업·제도 등 현실 문제를 연구하고 개선하려 했어요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "생활", prompt: "심하게 다친 사람을 발견했을 때 가장 알맞은 행동은?", choices: ["119에 신고하고 안내를 따르기", "무조건 일으켜 세우기", "음식을 먹이기", "혼자 두고 가기"], answer: 0, explanation: "주변 안전을 확인하고 119에 신고한 뒤 상담원의 지시에 따라 도와야 해요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "과학", prompt: "생태계에서 생산자에 해당하는 것은 무엇일까요?", choices: ["풀", "토끼", "매", "버섯"], answer: 0, explanation: "풀과 같은 식물은 광합성으로 스스로 양분을 만드는 생산자예요.", minGrade: 5, maxGrade: 6, tier: 3 },
    { category: "사회", prompt: "정부의 권력을 입법·행정·사법으로 나누는 까닭은 무엇일까요?", choices: ["권력의 집중과 남용을 막기 위해", "결정을 모두 늦추기 위해", "선거를 없애기 위해", "법을 비밀로 하기 위해"], answer: 0, explanation: "삼권 분립은 국가 기관이 서로 견제하고 균형을 이루도록 해 국민의 권리를 보호해요.", minGrade: 5, maxGrade: 6, tier: 3 },
    { category: "역사", prompt: "서로 다른 역사 자료의 설명이 다를 때 바람직한 태도는?", choices: ["여러 자료의 관점과 근거를 비교하기", "먼저 본 것만 믿기", "모두 거짓이라 하기", "유명한 사람 말만 믿기"], answer: 0, explanation: "자료마다 만든 사람과 목적이 다를 수 있으므로 여러 근거를 교차 확인해야 해요.", minGrade: 5, maxGrade: 6, tier: 3 },
    { category: "생활", prompt: "저작권을 지키며 인터넷 자료를 사용하는 방법은?", choices: ["이용 조건을 확인하고 출처를 밝히기", "검색되면 마음대로 쓰기", "만든 사람 이름 지우기", "유료 자료를 공유하기"], answer: 0, explanation: "자료의 라이선스와 이용 범위를 확인하고 필요한 경우 허락을 받은 뒤 출처를 표시해요.", minGrade: 5, maxGrade: 6, tier: 3 },
    { category: "과학", prompt: "빈 컵을 물속에 거꾸로 넣으면 컵 안에 물이 잘 들어가지 않는 까닭은?", choices: ["컵 안의 공기가 자리를 차지하고 있어서", "컵이 물을 무서워해서", "물이 항상 아래로만 가서", "컵이 너무 가벼워서"], answer: 0, explanation: "눈에 보이지 않는 공기도 공간을 차지하므로 물이 들어갈 자리를 막아요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "과학", prompt: "씨앗이 싹트는 데 필요한 조건으로 가장 알맞은 것은?", choices: ["알맞은 물과 공기와 온도", "아주 밝은 전등만", "색종이와 풀", "차가운 얼음만"], answer: 0, explanation: "씨앗이 싹트려면 알맞은 양의 물과 공기, 적당한 온도가 필요해요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "사회", prompt: "우리 동네에서 위험한 일을 막고 질서를 지키는 곳은 어디일까요?", choices: ["경찰서", "미술관", "빵집", "문구점"], answer: 0, explanation: "경찰서는 주민의 안전을 지키고 범죄나 사고에 대응하는 공공 기관이에요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "사회", prompt: "공원에서 차례와 규칙을 지켜야 하는 까닭은 무엇일까요?", choices: ["모두가 안전하고 즐겁게 이용하려고", "혼자만 먼저 놀려고", "놀이기구를 숨기려고", "공원을 빨리 닫으려고"], answer: 0, explanation: "공공장소의 약속은 여러 사람이 안전하고 편리하게 이용하도록 도와줘요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "역사", prompt: "오래된 사진과 일기가 소중한 까닭은 무엇일까요?", choices: ["옛날 사람들의 생활을 알려 주어서", "항상 새것이어서", "그림이 모두 같아서", "날씨를 바꾸어 주어서"], answer: 0, explanation: "옛 사진과 일기는 당시 사람들의 생활과 생각을 살펴볼 수 있는 역사 자료예요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "역사", prompt: "문화유산을 관람할 때 바른 행동은 무엇일까요?", choices: ["만지지 않고 안내에 따라 살펴보기", "이름을 새겨 두기", "몰래 가져오기", "큰 소리로 뛰어다니기"], answer: 0, explanation: "문화유산이 훼손되지 않도록 관람 규칙을 지키며 소중히 살펴봐야 해요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "생활", prompt: "종이 상자를 재활용함에 넣기 전에 하면 좋은 일은?", choices: ["테이프와 이물질을 떼고 펼치기", "음식물을 넣어 접기", "물을 가득 묻히기", "비닐봉지에 섞어 넣기"], answer: 0, explanation: "종이는 테이프와 이물질을 제거하고 펼쳐서 종류에 맞게 분리배출해요.", minGrade: 0, maxGrade: 2, tier: 1 },
    { category: "생활", prompt: "기침이나 재채기가 나올 때 바른 행동은 무엇일까요?", choices: ["옷소매로 입과 코 가리기", "친구 얼굴 쪽으로 하기", "손으로 막고 바로 악수하기", "아무 데나 침 뱉기"], answer: 0, explanation: "옷소매로 입과 코를 가리면 침방울이 주변으로 퍼지는 것을 줄일 수 있어요.", minGrade: 0, maxGrade: 2, tier: 2 },
    { category: "과학", prompt: "전구에 불이 켜지게 하려면 전지와 전구를 어떻게 연결해야 할까요?", choices: ["전기가 흐르는 닫힌 회로로 연결하기", "전선 한쪽만 연결하기", "전지를 멀리 놓기", "전구를 종이로 감싸기"], answer: 0, explanation: "전지의 양쪽 극과 전구가 끊김 없는 닫힌 회로로 연결되어야 전류가 흘러요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "과학", prompt: "차가운 컵의 바깥쪽에 물방울이 생기는 까닭은 무엇일까요?", choices: ["공기 중 수증기가 차가워져 물이 되어서", "컵 안의 물이 유리를 통과해서", "컵이 물을 만들어서", "햇빛이 얼음으로 변해서"], answer: 0, explanation: "공기 중의 수증기가 차가운 컵 표면에서 식어 액체 물방울로 응결해요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "사회", prompt: "동네에 새 도서관을 지을 장소를 정하는 바람직한 방법은?", choices: ["주민의 의견을 듣고 함께 논의하기", "한 사람이 몰래 정하기", "의견을 말한 사람을 혼내기", "규칙 없이 제비만 뽑기"], answer: 0, explanation: "지역의 공공 문제는 다양한 주민의 의견을 듣고 민주적인 절차로 결정해야 해요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "사회", prompt: "필요한 물건을 알맞게 고르는 소비 습관은 무엇일까요?", choices: ["필요성과 가격과 품질을 비교하기", "광고만 보고 바로 사기", "가장 비싼 것만 고르기", "친구가 산 것은 모두 사기"], answer: 0, explanation: "물건이 정말 필요한지 생각하고 가격과 품질을 비교하면 합리적으로 소비할 수 있어요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "역사", prompt: "금속 활자가 책을 만드는 데 준 도움은 무엇일까요?", choices: ["글자를 다시 사용해 여러 책을 찍기 편리해졌어요", "책을 모두 손으로만 쓰게 했어요", "글자를 읽지 못하게 했어요", "종이를 사용하지 않게 했어요"], answer: 0, explanation: "금속으로 만든 활자는 오래 쓰고 다시 배열할 수 있어 책을 인쇄하는 데 도움이 되었어요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "역사", prompt: "조선왕조실록에는 주로 무엇이 기록되어 있을까요?", choices: ["조선 왕과 나라에서 있었던 중요한 일", "미래의 날씨만", "외국 동화만", "요리 재료만"], answer: 0, explanation: "조선왕조실록은 조선 시대 왕의 활동과 정치·사회에서 있었던 일을 기록한 자료예요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "생활", prompt: "안전한 비밀번호를 만드는 방법은 무엇일까요?", choices: ["개인정보를 피하고 문자·숫자·기호를 섞기", "생일 네 자리만 쓰기", "모든 사이트에 1234 쓰기", "친구에게 알려 주기"], answer: 0, explanation: "추측하기 어려운 비밀번호를 만들고 서비스마다 다르게 사용해야 계정을 보호할 수 있어요.", minGrade: 3, maxGrade: 4, tier: 1 },
    { category: "생활", prompt: "상품에 당첨되었다며 주소를 입력하라는 낯선 링크가 왔어요.", choices: ["링크를 누르지 않고 공식 연락처로 확인하기", "주소와 비밀번호 입력하기", "친구에게 바로 전달하기", "앱을 모두 설치하기"], answer: 0, explanation: "뜻밖의 당첨 메시지는 사기일 수 있으므로 링크를 열지 말고 공식 채널에서 확인해요.", minGrade: 3, maxGrade: 4, tier: 2 },
    { category: "과학", prompt: "계속 사용할 수 있는 재생 가능 에너지는 무엇일까요?", choices: ["태양 에너지와 바람 에너지", "석탄과 석유", "휘발유와 경유", "천연가스와 석탄"], answer: 0, explanation: "태양과 바람은 자연에서 다시 얻을 수 있어 재생 가능 에너지원으로 활용돼요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "과학", prompt: "걸을 때 미끄러지지 않고 앞으로 나아갈 수 있게 돕는 힘은?", choices: ["발과 땅 사이의 마찰력", "중력만", "자기력만", "부력만"], answer: 0, explanation: "발이 땅을 뒤로 밀 때 마찰력이 발을 앞으로 밀어 주어 걸을 수 있어요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "사회", prompt: "국민이 낸 세금은 주로 어디에 사용될까요?", choices: ["학교·도로·소방 같은 공공 서비스", "한 사람의 장난감 구입", "비밀 선물 구입", "개인의 용돈 지급"], answer: 0, explanation: "세금은 교육, 교통, 안전 등 사회 구성원에게 필요한 공공 서비스를 운영하는 데 쓰여요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "사회", prompt: "헌법에 대한 설명으로 가장 알맞은 것은?", choices: ["국민의 기본권과 국가 운영 원칙을 정한 가장 높은 법", "학교 한 반의 약속만 정한 글", "가게 가격표를 정한 규칙", "운동 경기의 점수표"], answer: 0, explanation: "헌법은 국민의 기본권을 보장하고 국가 기관의 구성과 운영 원칙을 정하는 최고 법이에요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "역사", prompt: "698년에 발해를 세운 인물은 누구일까요?", choices: ["대조영", "왕건", "이성계", "장보고"], answer: 0, explanation: "대조영은 고구려 유민과 말갈인들을 이끌어 발해를 세웠어요.", minGrade: 5, maxGrade: 6, tier: 1 },
    { category: "역사", prompt: "독립운동 당시의 편지와 신문을 연구하는 까닭은 무엇일까요?", choices: ["그 시대 사람들의 생각과 상황을 이해하려고", "글씨 크기만 재려고", "종이 가격만 알려고", "미래 사건을 맞히려고"], answer: 0, explanation: "당시에 만든 편지와 신문은 독립운동가와 사람들의 생각, 시대 상황을 보여 주는 1차 자료예요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "생활", prompt: "사실처럼 보이는 의심스러운 영상이 빠르게 퍼지고 있어요.", choices: ["원본과 출처를 확인한 뒤 공유 여부를 판단하기", "제목만 보고 바로 퍼뜨리기", "조회 수가 많으니 믿기", "친구 이름으로 다시 올리기"], answer: 0, explanation: "조작된 영상일 수 있으므로 공식 자료와 원본 출처를 확인하기 전에는 공유하지 않아요.", minGrade: 5, maxGrade: 6, tier: 2 },
    { category: "생활", prompt: "새 앱이 사진·위치·연락처 권한을 모두 요구해요.", choices: ["기능에 꼭 필요한 권한인지 확인하고 최소한만 허용하기", "모든 권한을 무조건 허용하기", "비밀번호도 함께 보내기", "사용하지 않아도 계속 위치를 공유하기"], answer: 0, explanation: "앱의 기능과 관계없는 권한은 거부하고 개인정보 접근 권한을 주기적으로 확인해요.", minGrade: 5, maxGrade: 6, tier: 2 }
];
const KNOWLEDGE_EXTRA_SEEDS = [
    ["과학", "자석에 붙는 물건은 무엇일까요?", "철로 만든 클립", "나무젓가락", "고무지우개", "종이컵", "철로 된 물체는 자석에 잘 붙어요.", 0, 2, 1],
    ["과학", "낮에 주변을 밝게 비추는 것은 무엇일까요?", "태양", "달", "별똥별", "가로등만", "태양은 낮 동안 지구에 빛과 열을 보내요.", 0, 2, 1],
    ["과학", "달이 밤에 밝게 보이는 까닭은?", "태양빛을 반사해서", "스스로 불타서", "전구가 들어 있어서", "별빛을 먹어서", "달은 태양빛을 받아 반사해 밝게 보여요.", 0, 2, 2],
    ["과학", "소리를 들을 때 사용하는 감각 기관은?", "귀", "코", "혀", "피부", "귀는 공기의 떨림인 소리를 느껴요.", 0, 2, 1],
    ["과학", "물고기가 살기에 알맞은 곳은?", "물속", "마른 사막", "나무 꼭대기", "구름 위", "물고기는 아가미로 물속의 산소를 얻어요.", 0, 2, 1],
    ["과학", "물이 얼면 무엇이 될까요?", "얼음", "수증기", "모래", "바람", "물은 차가워져 어는점에 이르면 고체인 얼음이 돼요.", 0, 2, 1],
    ["과학", "구름 속 작은 물방울이 무거워져 떨어지는 것은?", "비", "바람", "햇빛", "안개만", "구름의 물방울이 커지고 무거워지면 비로 내려요.", 0, 2, 2],
    ["과학", "그림자가 생기려면 필요한 것은?", "빛과 빛을 막는 물체", "소리와 냄새", "물과 설탕", "바람과 모래", "물체가 빛을 막으면 반대쪽에 그림자가 생겨요.", 0, 2, 2],
    ["과학", "문을 앞으로 밀어 여는 것은 어떤 힘일까요?", "미는 힘", "당기는 힘", "자기력만", "부력", "물체를 멀어지게 움직일 때 미는 힘을 사용해요.", 0, 2, 1],
    ["과학", "추운 겨울에 알맞은 옷은 무엇일까요?", "두꺼운 외투", "얇은 수영복", "민소매 한 장", "물에 젖은 옷", "두꺼운 옷은 몸의 열이 빠져나가는 것을 줄여요.", 0, 2, 1],
    ["사회", "우리 지역의 여러 일을 맡아보는 곳은?", "시청이나 군청", "영화관", "놀이공원", "빵집", "시청과 군청은 주민 생활에 필요한 행정 업무를 해요.", 0, 2, 2],
    ["사회", "편지와 소포를 보내고 받는 곳은?", "우체국", "소방서", "박물관", "체육관", "우체국은 우편물과 소포를 전달해요.", 0, 2, 1],
    ["사회", "아픈 사람을 진료하고 치료하는 곳은?", "병원", "도서관", "시장", "공원", "병원에서는 의료진이 환자를 진료하고 치료해요.", 0, 2, 1],
    ["사회", "물건을 사고파는 일이 이루어지는 곳은?", "시장", "교실", "놀이터", "수영장", "시장에서는 생산자와 소비자가 물건과 서비스를 거래해요.", 0, 2, 1],
    ["사회", "교실 규칙을 함께 정하면 좋은 점은?", "모두가 지키기 쉬워요", "한 명만 편해요", "규칙이 없어져요", "의견을 말할 수 없어요", "함께 의견을 내어 정한 규칙은 이유를 이해하고 실천하기 쉬워요.", 0, 2, 2],
    ["사회", "지도에서 기호의 뜻을 알려 주는 것은?", "범례", "제목만", "사진", "페이지 번호", "범례는 지도에 쓰인 색과 기호의 뜻을 설명해요.", 0, 2, 2],
    ["사회", "빨간 교통 신호가 켜지면 어떻게 해야 할까요?", "멈춰서 기다려요", "빨리 건너요", "뒤로 뛰어요", "차도로 걸어요", "빨간불은 멈춤을 뜻하므로 안전선 뒤에서 기다려요.", 0, 2, 1],
    ["사회", "공원 벤치 같은 공공 물건은 어떻게 써야 할까요?", "깨끗하고 조심히 함께 써요", "낙서해요", "혼자 가져가요", "일부러 망가뜨려요", "공공시설은 모두의 것이므로 아껴 써야 해요.", 0, 2, 1],
    ["사회", "가족이 집안일을 나누어 하면 좋은 점은?", "서로 돕고 함께 책임질 수 있어요", "한 명만 계속 힘들어요", "집안일이 늘어나요", "대화를 못 해요", "가족 구성원이 역할을 나누면 서로 배려하고 협력할 수 있어요.", 0, 2, 2],
    ["사회", "거리를 깨끗하게 관리하는 일을 하는 분은?", "환경미화원", "우주비행사", "화가", "마술사", "환경미화원은 거리의 쓰레기를 수거하고 환경을 깨끗하게 지켜요.", 0, 2, 1],
    ["역사", "일어난 일을 가장 먼저부터 차례로 나타내는 것은?", "시간의 순서", "자리의 크기", "색깔의 순서", "키의 순서", "역사는 사건이 일어난 앞뒤 순서를 살피는 것이 중요해요.", 0, 2, 1],
    ["역사", "옛날 물건을 안전하게 보관하고 보여 주는 곳은?", "박물관", "동물원", "수영장", "정류장", "박물관은 역사 자료와 유물을 보존하고 전시해요.", 0, 2, 1],
    ["역사", "옛사람이 남긴 그릇이나 도구를 무엇이라 할까요?", "유물", "날씨", "약속", "동화", "유물은 과거 사람들이 만들고 사용한 물건이에요.", 0, 2, 2],
    ["역사", "옛날 왕이 살며 나라의 일을 보던 곳은?", "궁궐", "공항", "아파트", "운동장", "궁궐은 왕과 왕실이 생활하고 정치를 하던 곳이에요.", 0, 2, 1],
    ["역사", "우리 조상이 명절에 입던 전통 옷은?", "한복", "우주복", "잠수복", "교복", "한복은 우리나라의 대표적인 전통 의복이에요.", 0, 2, 1],
    ["역사", "옛날 농기구를 살펴보면 알 수 있는 것은?", "당시 농사짓던 모습", "내일의 날씨", "미래의 자동차", "다른 별의 크기", "생활 도구는 당시 사람들의 일과 기술을 보여 줘요.", 0, 2, 2],
    ["역사", "할머니와 할아버지의 어린 시절을 알아보는 방법은?", "이야기를 듣고 사진을 살펴보기", "상상만 하기", "오늘 뉴스만 보기", "미래 달력 보기", "경험자의 이야기와 옛 사진은 가까운 과거를 알려 주는 자료예요.", 0, 2, 2],
    ["역사", "광복절은 무엇을 기념하는 날일까요?", "나라를 되찾은 날", "한글을 만든 날", "새해 첫날", "어린이날", "8월 15일 광복절은 일제의 지배에서 벗어난 것을 기념해요.", 0, 2, 2],
    ["역사", "우리나라를 나타내는 국기의 이름은?", "태극기", "무궁화", "애국가", "한글", "태극기는 우리나라의 국기이며 역사 속에서 나라를 나타내 왔어요.", 0, 2, 1],
    ["역사", "세종대왕이 만든 새 글자의 처음 이름은?", "훈민정음", "삼국사기", "팔만대장경", "동의보감", "훈민정음은 백성을 가르치는 바른 소리라는 뜻이에요.", 0, 2, 2],
    ["생활", "손을 깨끗이 씻는 가장 좋은 방법은?", "비누로 손바닥과 손가락 사이까지 씻기", "물에 손끝만 대기", "옷에 닦기", "흙으로 문지르기", "비누로 손의 여러 부분을 꼼꼼히 씻으면 오염물을 줄일 수 있어요.", 0, 2, 1],
    ["생활", "이를 건강하게 지키는 습관은?", "식사 뒤 꼼꼼히 양치하기", "사탕을 먹고 바로 자기", "칫솔을 함께 쓰기", "이를 닦지 않기", "올바른 양치는 충치를 일으키는 음식 찌꺼기와 세균막을 없애요.", 0, 2, 1],
    ["생활", "건강한 식사 방법은 무엇일까요?", "여러 종류의 음식을 골고루 먹기", "과자만 먹기", "채소는 모두 빼기", "한 가지 음식만 먹기", "다양한 식품을 골고루 먹어야 필요한 영양소를 얻을 수 있어요.", 0, 2, 1],
    ["생활", "몸과 뇌가 충분히 쉬려면 필요한 것은?", "규칙적이고 충분한 잠", "밤새 게임하기", "매일 늦게 자기", "잠을 계속 줄이기", "충분한 수면은 성장과 기억, 건강에 도움을 줘요.", 0, 2, 1],
    ["생활", "화면을 오래 본 뒤 눈을 쉬게 하는 방법은?", "먼 곳을 보며 잠시 쉬기", "화면을 더 가까이 보기", "불을 끄고 계속 보기", "눈을 비비며 보기", "중간중간 먼 곳을 바라보면 가까운 곳을 보던 눈의 피로를 줄여요.", 0, 2, 2],
    ["생활", "빈 페트병을 분리배출하기 전에 할 일은?", "내용물을 비우고 깨끗이 헹구기", "음식물을 채우기", "종이와 섞기", "뚜껑을 열어 둔 채 길에 놓기", "재활용품은 내용물을 비우고 헹군 뒤 지역 기준에 맞게 분리해요.", 0, 2, 2],
    ["생활", "양치할 때 물을 아끼는 방법은?", "컵을 쓰고 수도꼭지를 잠그기", "물을 계속 틀어 두기", "물을 바닥에 뿌리기", "수도꼭지를 더 크게 열기", "사용하지 않는 동안 물을 잠그면 소중한 물을 아낄 수 있어요.", 0, 2, 1],
    ["생활", "친구에게 실수했을 때 바른 행동은?", "잘못을 인정하고 진심으로 사과하기", "모른 척하기", "친구 탓만 하기", "소문내기", "자신의 행동을 설명하고 사과한 뒤 고치려는 태도가 필요해요.", 0, 2, 2],
    ["생활", "온라인에서 이름과 주소를 물으면 어떻게 할까요?", "알려주지 않고 보호자에게 묻기", "모두 공개하기", "사진까지 보내기", "비밀번호도 알려주기", "개인정보는 믿을 수 있는 보호자의 확인 없이 공개하면 안 돼요.", 0, 2, 1],
    ["생활", "위험한 일을 당해 경찰의 도움이 필요할 때 전화번호는?", "112", "119", "114", "120", "범죄 신고와 긴급한 경찰 도움은 112로 요청해요.", 0, 2, 1],
    ["과학", "물이 얼어 얼음이 되는 상태 변화는?", "응고", "융해", "증발", "응결", "액체가 고체로 변하는 현상을 응고라고 해요.", 3, 4, 1],
    ["과학", "젖은 빨래가 마르는 까닭은?", "물이 증발해서", "물이 얼어서", "천이 물을 먹어서", "바람이 색을 지워서", "빨래의 물이 수증기로 변해 공기 중으로 이동해요.", 3, 4, 1],
    ["과학", "소리의 높낮이를 바꾸는 것과 관계 깊은 것은?", "물체의 진동 빠르기", "물체의 색", "방의 넓이만", "냄새의 세기", "빠르게 진동할수록 일반적으로 높은 소리가 나요.", 3, 4, 2],
    ["과학", "거울에 모습이 보이는 까닭은?", "빛이 반사되어 눈에 들어와서", "거울이 그림을 그려서", "소리가 튕겨서", "공기가 멈춰서", "물체의 빛이 거울에서 반사되어 눈에 도달해요.", 3, 4, 1],
    ["과학", "막대자석의 같은 극끼리 가까이 하면?", "서로 밀어내요", "서로 붙어요", "모두 녹아요", "빛이 나요", "자석의 같은 극은 밀어내고 다른 극은 끌어당겨요.", 3, 4, 1],
    ["과학", "먹이사슬에서 풀을 먹는 토끼는?", "초식 동물", "생산자", "분해자만", "무생물", "토끼는 식물을 먹어 에너지를 얻는 초식 동물이에요.", 3, 4, 2],
    ["과학", "식물의 줄기가 하는 일은?", "물질을 운반하고 몸을 지탱해요", "흙을 만들어요", "소리를 들어요", "씨앗을 먹어요", "줄기는 뿌리와 잎 사이에서 물질을 운반하고 식물을 세워요.", 3, 4, 2],
    ["과학", "달 표면에 둥근 구덩이가 많은 까닭은?", "운석이 충돌해서", "비가 많이 내려서", "나무뿌리가 파서", "바닷물이 흘러서", "대기가 거의 없는 달에는 충돌 흔적인 크레이터가 오래 남아요.", 3, 4, 2],
    ["과학", "풍선을 누르면 모양이 변하는 까닭은?", "공기가 압력을 전달해서", "공기가 사라져서", "고무가 물이 돼서", "빛이 밀어서", "갇힌 공기는 힘을 받으면 압력을 여러 방향으로 전달해요.", 3, 4, 2],
    ["과학", "모래와 물을 분리할 때 알맞은 방법은?", "거름 장치로 거르기", "자석만 사용하기", "모두 끓여 태우기", "설탕 넣기", "물에 녹지 않는 모래는 거름종이로 걸러낼 수 있어요.", 3, 4, 2],
    ["사회", "우리나라의 가장 큰 행정 구역 단위에 해당하는 것은?", "특별시·광역시·도", "반", "모둠", "번지", "우리나라는 특별시, 광역시, 특별자치시, 도 등으로 나뉘어요.", 3, 4, 1],
    ["사회", "해가 뜨는 쪽을 나타내는 방위는?", "동쪽", "서쪽", "남쪽", "북쪽", "해는 대체로 동쪽에서 떠서 서쪽으로 져요.", 3, 4, 1],
    ["사회", "지도에서 실제 거리를 줄인 정도는?", "축척", "범례", "등고선", "제목", "축척을 이용하면 지도 위 거리와 실제 거리의 관계를 알 수 있어요.", 3, 4, 2],
    ["사회", "주민등록이나 복지 업무를 가까이서 처리하는 곳은?", "행정복지센터", "놀이공원", "백화점", "극장", "행정복지센터는 주민에게 필요한 여러 행정 서비스를 제공해요.", 3, 4, 1],
    ["사회", "물건을 만들어 파는 사람은?", "생산자", "소비자만", "관람객", "승객", "생산자는 재화나 서비스를 만들어 시장에 제공해요.", 3, 4, 1],
    ["사회", "용돈을 계획적으로 쓰려면 먼저 할 일은?", "수입과 지출 계획 세우기", "원하는 것을 모두 사기", "기록하지 않기", "저축을 모두 쓰기", "예산을 세우면 필요한 지출과 저축을 미리 정할 수 있어요.", 3, 4, 2],
    ["사회", "지역 축제를 조사하면 알 수 있는 것은?", "지역의 문화와 특색", "지구의 자전 속도", "바닷물 깊이만", "외국의 법만", "축제에는 지역의 역사, 산업, 생활 모습이 담겨 있어요.", 3, 4, 2],
    ["사회", "사람이 만든 다리와 도로는 어떤 환경일까요?", "인문 환경", "자연 환경", "우주 환경", "기후만", "건물과 도로처럼 사람이 만든 환경을 인문 환경이라고 해요.", 3, 4, 1],
    ["사회", "비밀 투표를 하는 까닭은?", "다른 압력 없이 뜻을 표현하려고", "결과를 숨기려고", "한 명이 두 번 뽑으려고", "후보를 없애려고", "비밀 투표는 유권자가 자유롭게 선택하도록 보호해요.", 3, 4, 2],
    ["사회", "권리와 함께 책임도 필요한 까닭은?", "서로의 권리를 존중해야 해서", "나만 편하면 되어서", "규칙을 없애려고", "의견을 막으려고", "자신의 권리를 누릴 때 다른 사람의 권리도 존중해야 해요.", 3, 4, 2],
    ["역사", "고인돌이 많이 만들어진 시대는?", "청동기 시대", "구석기 시대", "조선 시대", "현대", "고인돌은 청동기 시대의 대표적인 무덤이에요.", 3, 4, 1],
    ["역사", "고구려·백제·신라를 함께 부르는 말은?", "삼국", "후삼국", "남북국", "열국", "세 나라가 경쟁하며 성장한 시기를 삼국 시대라고 해요.", 3, 4, 1],
    ["역사", "고구려 고분 벽화로 알 수 있는 것은?", "고구려 사람들의 생활과 믿음", "미래의 생활", "현대 교통만", "외국 날씨만", "무덤 벽화에는 당시의 옷, 놀이, 종교 등이 표현되어 있어요.", 3, 4, 2],
    ["역사", "석굴암이 만들어진 나라는?", "통일 신라", "고조선", "조선", "대한제국", "석굴암은 통일 신라의 뛰어난 불교 문화유산이에요.", 3, 4, 1],
    ["역사", "푸른빛으로 유명한 고려의 도자기는?", "고려청자", "백제 금동대향로", "신라 금관", "조선 백자만", "고려청자는 맑은 비취색과 섬세한 무늬로 유명해요.", 3, 4, 1],
    ["역사", "고려대장경을 나무판에 새긴 까닭은?", "불교의 힘으로 위기를 이겨내길 바라서", "놀이판을 만들려고", "집을 지으려고", "돈을 만들려고", "몽골 침입기에 나라의 안녕을 바라며 불교 경전을 새겼어요.", 3, 4, 2],
    ["역사", "세종이 훈민정음을 만든 가장 큰 까닭은?", "백성이 쉽게 글을 쓰게 하려고", "한자를 없애려고만", "왕만 읽게 하려고", "외국어를 만들려고", "어려운 한자를 익히지 못한 백성도 뜻을 표현하도록 만들었어요.", 3, 4, 1],
    ["역사", "거북선을 활용해 바다를 지킨 인물은?", "이순신", "세종", "정약용", "김정호", "이순신은 조선 수군을 이끌어 일본군의 침략에 맞섰어요.", 3, 4, 1],
    ["역사", "조선 후기 현실 문제 해결을 강조한 학문은?", "실학", "주술", "신화", "점성술", "실학자들은 농업과 상공업 등 실제 생활의 개선을 연구했어요.", 3, 4, 2],
    ["역사", "문화유산의 만든 시기와 쓰임을 조사하는 까닭은?", "역사적 의미를 바르게 이해하려고", "가격만 정하려고", "새것으로 바꾸려고", "모두 버리려고", "배경과 용도를 알아야 문화유산이 전하는 역사를 이해할 수 있어요.", 3, 4, 2],
    ["생활", "온라인 댓글을 쓸 때 바른 태도는?", "상대방을 존중하는 말 쓰기", "욕설 쓰기", "확인 없이 소문 퍼뜨리기", "개인정보 공개하기", "온라인에서도 실제 사람과 대화하듯 예의를 지켜야 해요.", 3, 4, 1],
    ["생활", "친구가 만든 그림을 과제에 쓰려면?", "허락받고 출처 밝히기", "이름 지우기", "내 작품이라 하기", "몰래 판매하기", "창작물은 만든 사람의 권리를 존중해 이용해야 해요.", 3, 4, 2],
    ["생활", "계정마다 다른 비밀번호를 쓰는 까닭은?", "한 계정 유출이 다른 계정으로 번지는 것을 막으려고", "외우기 어렵게 하려고", "로그인을 못 하게 하려고", "친구와 공유하려고", "비밀번호 재사용을 피하면 연쇄적인 계정 피해를 줄일 수 있어요.", 3, 4, 2],
    ["생활", "화재 대피 때 젖은 수건을 찾느라 늦어지고 있어요.", "물건을 찾지 말고 즉시 안전한 길로 대피하기", "방으로 돌아가기", "엘리베이터 기다리기", "숨기", "화재 때는 대피가 우선이며 물건을 챙기느라 시간을 지체하면 안 돼요.", 3, 4, 1],
    ["생활", "작은 상처에서 피가 날 때 먼저 할 일은?", "깨끗한 거즈로 눌러 지혈하기", "흙 바르기", "상처 계속 만지기", "더 크게 벌리기", "깨끗한 재료로 압박하고 어른에게 알려 상처를 씻고 보호해요.", 3, 4, 1],
    ["생활", "식품 포장에서 꼭 확인하면 좋은 것은?", "유통기한과 원재료 표시", "포장 그림만", "광고 문구만", "글자 색만", "기한과 성분을 확인하면 안전하고 알맞은 식품을 고를 수 있어요.", 3, 4, 1],
    ["생활", "화가 날 때 갈등을 줄이는 방법은?", "잠시 진정한 뒤 자신의 마음을 말하기", "물건 던지기", "소리 지르기", "대화 피하기", "감정을 가라앉히고 이유와 바람을 말하면 해결에 도움이 돼요.", 3, 4, 2],
    ["생활", "학교폭력을 알게 되었을 때 할 일은?", "믿을 만한 어른에게 알리고 도움받기", "숨기기", "함께 놀리기", "영상 퍼뜨리기", "혼자 견디지 말고 보호자와 선생님 등에게 도움을 요청해야 해요.", 3, 4, 1],
    ["생활", "사용하지 않는 교실의 전등은 어떻게 할까요?", "끄고 나와 전기를 아껴요", "계속 켜 둬요", "모두 더 켜요", "전구를 만져요", "필요 없는 전기를 끄면 에너지와 자원을 절약할 수 있어요.", 3, 4, 1],
    ["생활", "자전거 방향을 바꾸기 전 해야 할 일은?", "주변을 확인하고 손 신호로 알려요", "눈을 감고 돌아요", "갑자기 꺾어요", "이어폰 소리를 높여요", "주변 차량과 보행자에게 움직임을 미리 알리면 사고를 줄여요.", 3, 4, 2],
    ["과학", "광합성에 식물이 공기에서 사용하는 기체는?", "이산화탄소", "질소만", "수소", "헬륨", "식물은 이산화탄소와 물을 이용해 양분을 만들어요.", 5, 6, 1],
    ["과학", "사람이 호흡으로 받아들이는 기체는?", "산소", "이산화탄소만", "메테인", "수소", "산소는 세포가 양분에서 에너지를 얻는 데 필요해요.", 5, 6, 1],
    ["과학", "물체를 지구 중심 쪽으로 끌어당기는 힘은?", "중력", "부력", "탄성력", "마찰력만", "지구의 중력 때문에 물체가 아래로 떨어지고 땅에 머물러요.", 5, 6, 1],
    ["과학", "병렬회로에서 전구 하나가 끊어져도 다른 전구가 켜지는 까닭은?", "전류가 흐르는 길이 따로 있어서", "전지가 없어져서", "전선이 모두 끊겨서", "빛이 이동해서", "병렬회로는 갈래마다 독립된 전류 경로가 있어요.", 5, 6, 2],
    ["과학", "볼록렌즈로 가까운 물체를 보면 어떻게 보일 수 있나요?", "크게 보일 수 있어요", "항상 사라져요", "소리로 들려요", "온도가 내려가요", "초점 안쪽의 물체는 볼록렌즈를 통해 확대된 바로 선 상으로 보여요.", 5, 6, 2],
    ["과학", "계절마다 태양의 남중 고도가 달라지는 까닭은?", "지구 자전축이 기울어진 채 공전해서", "달이 매일 커져서", "태양이 지구를 돌아서", "구름 수만 달라서", "기울어진 지구가 공전하며 햇빛을 받는 각도가 달라져요.", 5, 6, 2],
    ["과학", "일식이 일어날 때 천체의 배열은?", "태양-달-지구", "달-지구-태양", "지구-태양-달", "태양-지구-달만", "달이 태양과 지구 사이에서 태양빛을 가리면 일식이 일어나요.", 5, 6, 2],
    ["과학", "생태계에서 곰팡이와 세균의 중요한 역할은?", "죽은 생물을 분해해 물질을 돌려보내요", "햇빛을 만들어요", "중력을 없애요", "비를 멈춰요", "분해자는 유기물을 작은 물질로 분해해 생태계 순환을 도와요.", 5, 6, 2],
    ["과학", "같은 양의 물에 설탕을 더 많이 녹이면?", "용액의 농도가 높아져요", "농도가 낮아져요", "물이 고체가 돼요", "질량이 사라져요", "용매 양이 같을 때 용질이 많아지면 농도가 높아져요.", 5, 6, 1],
    ["과학", "온실가스가 지나치게 늘면 생길 수 있는 현상은?", "지구 평균 기온 상승", "중력 소멸", "낮과 밤 소멸", "달의 공전 정지", "온실가스 증가는 지구가 내보내는 열을 더 많이 붙잡아요.", 5, 6, 2],
    ["사회", "국가 권력을 여러 기관에 나누는 원리는?", "권력 분립", "신분제", "세습제", "봉건제", "권력 분립은 기관들이 서로 견제해 권력 남용을 막아요.", 5, 6, 1],
    ["사회", "민주 선거의 기본 원칙에 해당하는 것은?", "보통·평등·직접·비밀 선거", "공개 강제 투표", "신분별 차등 투표", "대리인만 투표", "민주 선거는 모든 유권자의 자유롭고 동등한 선택을 보장해야 해요.", 5, 6, 2],
    ["사회", "공급이 줄고 수요가 그대로라면 가격은 일반적으로?", "오르는 경향이 있어요", "반드시 0원이 돼요", "항상 절반이 돼요", "변하지 않아요", "원하는 양에 비해 물건이 부족해지면 가격이 오르는 경향이 있어요.", 5, 6, 2],
    ["사회", "한 선택 때문에 포기한 것 중 가장 가치 있는 것은?", "기회비용", "이자", "세금", "환율", "기회비용은 선택으로 포기한 대안 중 가치가 가장 큰 것이에요.", 5, 6, 2],
    ["사회", "국제 연합이 만들어진 중요한 목적은?", "국제 평화와 협력", "한 나라의 영토 확대", "모든 문화를 같게 만들기", "무역 중단", "국제 연합은 평화, 인권, 개발 등 공동 문제 해결을 위해 협력해요.", 5, 6, 1],
    ["사회", "인권에 대한 설명으로 알맞은 것은?", "사람이라면 누구나 가지는 기본 권리", "어른만 가지는 특권", "돈으로 사는 상품", "국가가 마음대로 없애는 선물", "인권은 인간의 존엄을 위해 누구에게나 보장되어야 해요.", 5, 6, 1],
    ["사회", "지방자치가 필요한 까닭은?", "지역 주민의 필요를 지역에서 반영하려고", "모든 지역을 똑같게 만들려고", "주민 의견을 막으려고", "선거를 없애려고", "지방자치는 주민이 지역 문제 해결에 참여하도록 해요.", 5, 6, 2],
    ["사회", "나라들이 서로 무역하는 주된 까닭은?", "필요한 자원과 상품을 효율적으로 얻으려고", "모든 생산을 멈추려고", "화폐를 없애려고", "교류를 막으려고", "지역마다 자원과 기술이 달라 교환하면 선택의 폭을 넓힐 수 있어요.", 5, 6, 1],
    ["사회", "적도 부근에 열대 기후가 나타나는 주된 까닭은?", "연중 태양 에너지를 많이 받아서", "항상 겨울이어서", "달과 가까워서", "바다가 없어서", "적도 부근은 햇빛을 비교적 수직으로 받아 기온이 높아요.", 5, 6, 2],
    ["사회", "지속 가능한 발전이 뜻하는 것은?", "미래 세대의 필요도 해치지 않는 발전", "자원을 한꺼번에 쓰는 발전", "환경을 고려하지 않는 성장", "현재만 생각하는 소비", "환경·사회·경제를 함께 고려해 미래에도 이어질 수 있어야 해요.", 5, 6, 2],
    ["역사", "고조선의 법 조항으로 알 수 있는 것은?", "생명과 재산을 중요하게 여겼어요", "바다 무역만 했어요", "한글을 사용했어요", "과거제를 실시했어요", "전해지는 8조법에는 생명과 재산을 보호하려는 내용이 있어요.", 5, 6, 2],
    ["역사", "고구려 영토를 크게 넓힌 왕은?", "광개토대왕", "의자왕", "문무왕", "공민왕", "광개토대왕은 적극적인 정복 활동으로 고구려 영토를 넓혔어요.", 5, 6, 1],
    ["역사", "신라의 골품제가 영향을 준 것은?", "관직 진출과 생활 범위", "날씨 변화", "농작물 종류만", "문자 발명", "골품에 따라 오를 수 있는 관직과 생활 모습에 제한이 있었어요.", 5, 6, 2],
    ["역사", "발해가 고구려 계승 의식을 보인 근거는?", "고구려 유민이 건국에 참여했어요", "조선 법전을 썼어요", "한글을 창제했어요", "수도를 한양에 두었어요", "대조영과 고구려 유민들이 발해 건국의 중심 세력이었어요.", 5, 6, 2],
    ["역사", "고려 광종이 과거제를 실시한 목적은?", "능력 있는 인재를 뽑고 왕권을 강화하려고", "무신만 뽑으려고", "농사를 금지하려고", "신분제를 더 세분하려고", "시험으로 관리를 선발해 새로운 인재를 등용했어요.", 5, 6, 2],
    ["역사", "몽골 침입 때 고려가 강화도로 수도를 옮긴 까닭은?", "수전에 약한 몽골에 오래 맞서려고", "바다를 메우려고", "일본과 가까워지려고", "농토를 버리려고", "섬의 지형을 이용해 몽골군에 항전하려 했어요.", 5, 6, 2],
    ["역사", "조선이 유교를 통치 이념으로 삼으며 강조한 것은?", "충효와 예에 따른 사회 질서", "불교 사원만의 정치", "신분 없는 사회", "해외 식민지 건설", "조선은 성리학을 바탕으로 정치와 생활 제도를 정비했어요.", 5, 6, 2],
    ["역사", "임진왜란 때 조선 수군의 승리가 중요했던 까닭은?", "일본군의 보급로를 막는 데 도움을 줘서", "농사를 모두 멈춰서", "수도를 옮겨서", "과거제를 시작해서", "바닷길을 지키며 일본군의 병력과 물자 운송을 어렵게 했어요.", 5, 6, 2],
    ["역사", "동학 농민 운동에서 농민들이 요구한 것은?", "탐관오리 처벌과 사회 개혁", "일제 식민 통치 강화", "신분 차별 확대", "외세의 자유로운 침략", "농민들은 부패한 정치와 외세 침략에 맞서 개혁을 요구했어요.", 5, 6, 2],
    ["역사", "1919년에 대한민국 임시정부가 세워진 곳은?", "중국 상하이", "서울", "평양", "도쿄", "3·1 운동 뒤 상하이에 통합된 대한민국 임시정부가 수립되었어요.", 5, 6, 1],
    ["생활", "온라인 정보의 신뢰도를 확인하는 핵심 방법은?", "작성자·근거·날짜를 여러 출처와 비교하기", "조회 수만 보기", "제목만 믿기", "친구 말만 따르기", "출처와 증거를 교차 확인해야 잘못된 정보를 가려낼 수 있어요.", 5, 6, 1],
    ["생활", "기관을 사칭해 송금을 재촉하는 연락을 받았어요.", "전화를 끊고 공식 번호로 직접 확인하기", "상대가 준 계좌로 즉시 보내기", "인증번호 알려주기", "앱 설치하기", "사칭 사기는 판단할 시간을 주지 않으므로 별도 공식 경로로 확인해요.", 5, 6, 2],
    ["생활", "사용하지 않는 온라인 계정을 안전하게 관리하려면?", "개인정보를 지우고 공식 절차로 탈퇴하기", "그대로 방치하기", "비밀번호 공개하기", "친구에게 넘기기", "오래된 계정도 정보 유출 경로가 될 수 있어 정리하는 것이 좋아요.", 5, 6, 2],
    ["생활", "인공지능의 도움으로 과제를 작성했다면 바른 태도는?", "내용을 검증하고 사용 사실과 출처를 밝혀요", "그대로 베껴 자신의 글이라 해요", "틀려도 확인하지 않아요", "친구 이름으로 내요", "도구가 만든 내용도 사실 확인과 정직한 사용 표시가 필요해요.", 5, 6, 2],
    ["생활", "자동심장충격기가 도착하면 어떻게 해야 할까요?", "전원을 켜고 음성 안내에 따라 사용하기", "물에 담그기", "아무 버튼이나 계속 누르기", "환자에게 숨기기", "AED는 음성 안내에 따라 패드를 붙이고 주변 안전을 확인하며 사용해요.", 5, 6, 2],
    ["생활", "재난 대비 가방에 알맞은 물품은?", "물·비상식량·손전등·구급품", "무거운 장식품", "유리병만", "게임기만", "대피에 필요한 가볍고 필수적인 물품을 미리 준비해요.", 5, 6, 1],
    ["생활", "생활 속 탄소 배출을 줄이는 행동은?", "가까운 거리는 걷고 전기를 아껴요", "빈방 전등을 켜 둬요", "일회용품을 매번 써요", "음식을 계속 버려요", "에너지와 자원 사용을 줄이면 온실가스 배출 감소에 도움이 돼요.", 5, 6, 1],
    ["생활", "영양성분표에서 나트륨을 확인하는 까닭은?", "지나친 섭취를 조절하려고", "단맛만 알아보려고", "포장 크기만 보려고", "가격을 정하려고", "영양 표시를 비교하면 나트륨 같은 성분의 섭취량을 관리할 수 있어요.", 5, 6, 2],
    ["생활", "갈등 상황에서 나 전달법을 쓰는 방법은?", "상황과 내 느낌과 바람을 차분히 말해요", "상대를 비난해요", "과장된 소문을 내요", "대화를 끊어요", "비난 대신 자신의 느낌과 원하는 변화를 말하면 대화가 쉬워져요.", 5, 6, 2],
    ["생활", "높은 수익을 보장한다는 낯선 투자 제안을 받았어요.", "보호자와 상의하고 공식 기관 정보를 확인해요", "급히 돈을 보내요", "신분증 사진을 보내요", "친구 돈도 모아요", "수익 보장과 송금 재촉은 금융 사기의 신호일 수 있어 신중히 확인해야 해요.", 5, 6, 2]
];
KNOWLEDGE_QUESTIONS.push(...KNOWLEDGE_EXTRA_SEEDS.map(([category, prompt, correct, wrong1, wrong2, wrong3, explanation, minGrade, maxGrade, tier]) => ({ category, prompt, choices: [correct, wrong1, wrong2, wrong3], answer: 0, explanation, minGrade, maxGrade, tier })));
let knowledge = null;
let knowledgeReviewQuestions = null;
function showKnowledgeReward(screenId, kind, title, detail, pokemonId) {
    const screen = byId(screenId);
    screen.querySelector(".knowledge-reward-burst")?.remove();
    const reward = document.createElement("div");
    reward.className = "knowledge-reward-burst " + kind;
    reward.setAttribute("role", "status");
    reward.setAttribute("aria-live", "polite");
    const mascot = document.createElement("div");
    mascot.className = "knowledge-reward-pokemon";
    replaceWithPokemon(mascot, pokemonId);
    const copy = document.createElement("div");
    const label = kind === "timeline" ? "TIME RESTORED" : "RESCUE BONUS";
    copy.innerHTML = "<span>" + label + "</span><strong>" + title + "</strong><small>" + detail + "</small>";
    reward.append(mascot, copy);
    screen.append(reward);
    window.setTimeout(() => reward.classList.add("leaving"), 1250);
    window.setTimeout(() => reward.remove(), 1650);
}
function knowledgeQuestionsForGrade(grade) {
    const available = KNOWLEDGE_QUESTIONS.filter((question) => grade >= question.minGrade && grade <= question.maxGrade);
    const categoryOrder = shuffle(["과학", "사회", "역사", "생활"]);
    const selected = [];
    categoryOrder.forEach((category, index) => {
        const targetCount = index < 2 ? 3 : 2;
        const categoryQuestions = shuffle(available.filter((question) => question.category === category));
        selected.push(...categoryQuestions.slice(0, targetCount));
    });
    if (selected.length < 10) {
        const remaining = shuffle(available.filter((question) => !selected.includes(question)));
        selected.push(...remaining.slice(0, 10 - selected.length));
    }
    return shuffle(selected).slice(0, 10).map(shuffleKnowledgeChoices);
}
function shuffleKnowledgeChoices(question) {
    const indexed = question.choices.map((label, index) => ({ label, correct: index === question.answer }));
    const mixed = shuffle(indexed);
    return { ...question, choices: mixed.map((item) => item.label), answer: mixed.findIndex((item) => item.correct) };
}
function startKnowledge(reviewQuestions) {
    if (state.grade === null)
        return;
    const isReview = Boolean(reviewQuestions?.length);
    const questions = isReview
        ? reviewQuestions.map(shuffleKnowledgeChoices)
        : knowledgeQuestionsForGrade(state.grade);
    knowledgeReviewQuestions = null;
    knowledge = {
        questions, answers: [], index: 0, score: 0, correct: 0, streak: 0, best: 0,
        locked: false, started: Date.now(), running: true, timer: null, isReview
    };
    replaceWithPokemon(byId("knowledgePartner"), 151);
    showScreen("knowledge");
    nextKnowledgeQuestion();
    knowledge.timer = appSetInterval(() => {
        if (!knowledge?.running)
            return;
        renderKnowledgeHud();
    }, 1000);
}
function nextKnowledgeQuestion() {
    if (!knowledge?.running)
        return;
    if (knowledge.index >= knowledge.questions.length) {
        finishKnowledge();
        return;
    }
    knowledge.locked = false;
    const question = knowledge.questions[knowledge.index];
    byId("knowledgeCategory").textContent = question.category;
    byId("knowledgeCategory").dataset.category = question.category;
    byId("knowledgeLevel").textContent = question.tier === 1 ? "발견" : question.tier === 2 ? "탐구" : "도전";
    byId("knowledgeQuestion").textContent = question.prompt;
    byId("knowledgeExplanation").replaceChildren();
    const choices = byId("knowledgeChoices");
    choices.replaceChildren();
    question.choices.forEach((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "knowledge-choice";
        const number = document.createElement("b");
        number.textContent = String(index + 1);
        const text = document.createElement("span");
        text.textContent = label;
        button.append(number, text);
        button.addEventListener("click", () => answerKnowledge(index, button));
        choices.append(button);
    });
    document.querySelectorAll(".knowledge-route [data-zone]").forEach((zone) => {
        zone.classList.toggle("active", zone.dataset.zone === question.category);
    });
    renderKnowledgeHud();
}
function answerKnowledge(index, selected) {
    if (!knowledge?.running || knowledge.locked)
        return;
    const question = knowledge.questions[knowledge.index];
    const correct = index === question.answer;
    const buttons = Array.from(byId("knowledgeChoices").querySelectorAll(".knowledge-choice"));
    knowledge.locked = true;
    knowledge.answers.push({ question, selected: index, correct });
    buttons.forEach((button, buttonIndex) => {
        button.disabled = true;
        if (buttonIndex === question.answer)
            button.classList.add("correct");
    });
    if (correct) {
        knowledge.correct += 1;
        knowledge.streak += 1;
        knowledge.best = Math.max(knowledge.best, knowledge.streak);
        const baseScore = 100 + knowledge.streak * 15 + question.tier * 20;
        knowledge.score += baseScore;
        selected.classList.add("correct");
        byId("knowledgeExplanation").className = "knowledge-explanation correct";
        byId("knowledgeExplanation").textContent = "정답! " + question.explanation;
        correctSound();
        pokemonSparkBurst(10);
    }
    else {
        knowledge.streak = 0;
        selected.classList.add("wrong");
        byId("knowledgeExplanation").className = "knowledge-explanation wrong";
        byId("knowledgeExplanation").textContent = "아쉬워요. 정답은 ‘" + question.choices[question.answer] + "’예요. " + question.explanation;
        wrongSound();
    }
    renderKnowledgeHud();
    window.setTimeout(() => {
        if (!knowledge?.running)
            return;
        knowledge.index += 1;
        nextKnowledgeQuestion();
    }, correct ? 1350 : 1850);
}
function renderKnowledgeHud() {
    if (!knowledge)
        return;
    const seconds = Math.floor((Date.now() - knowledge.started) / 1000);
    const total = knowledge.questions.length;
    byId("knowledgeScore").textContent = String(knowledge.score);
    byId("knowledgeTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    byId("knowledgeCount").textContent = "탐험 " + Math.min(total, knowledge.index + 1) + "/" + total;
    byId("knowledgeStreak").textContent = String(knowledge.streak);
    const progress = byId("knowledgeProgress");
    progress.replaceChildren();
    for (let index = 0; index < total; index += 1) {
        const dot = document.createElement("span");
        const answer = knowledge.answers[index];
        dot.className = answer ? answer.correct ? "complete" : "incorrect" : !knowledge.locked && index === knowledge.index ? "current" : "";
        dot.textContent = answer ? answer.correct ? "✓" : "×" : String(index + 1);
        progress.append(dot);
    }
}
function stopKnowledge() {
    if (!knowledge)
        return;
    knowledge.running = false;
    if (knowledge.timer !== null)
        window.clearInterval(knowledge.timer);
}
function finishKnowledge() {
    if (!knowledge?.running || state.grade === null)
        return;
    const game = knowledge;
    const seconds = Math.floor((Date.now() - game.started) / 1000);
    const total = game.questions.length;
    const accuracy = Math.round(game.correct / total * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    stopKnowledge();
    saveRecord({ name: getName() || "친구", mode: "knowledge", grade: state.grade, diff: "easy", score: game.score, stars, detail: game.correct + "/" + total + " · 지식", timestamp: Date.now() });
    showResult(stars, game.isReview ? "오답 복습 완료!" : "지식탐험 완료!", game.correct + "개의 지식 보물을 찾았어요.", [[String(game.score), "점수"], [accuracy + "%", "정답률"], [game.correct + "/" + total, "정답"], [Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0"), "시간"]]);
    renderKnowledgeResultReview(game);
}
function renderKnowledgeResultReview(game) {
    const panel = byId("knowledgeResultReview");
    const categories = ["과학", "사회", "역사", "생활"];
    const missedQuestions = game.questions.filter((_, index) => !game.answers[index]?.correct);
    knowledgeReviewQuestions = missedQuestions.length ? missedQuestions : null;
    panel.replaceChildren();
    panel.classList.remove("hidden-panel");
    const heading = document.createElement("h3");
    heading.textContent = "탐험 결과표";
    const summary = document.createElement("p");
    summary.className = "knowledge-result-summary";
    summary.textContent = missedQuestions.length
        ? "맞힌 문제와 다시 볼 문제를 한눈에 확인해요."
        : "모든 문제를 정확히 맞혔어요! 새로운 탐험에도 도전해 보세요.";
    panel.append(heading, summary);
    const categoryGrid = document.createElement("div");
    categoryGrid.className = "knowledge-category-results";
    categories.forEach((category) => {
        const indexes = game.questions.map((question, index) => question.category === category ? index : -1).filter((index) => index >= 0);
        if (!indexes.length)
            return;
        const correct = indexes.filter((index) => game.answers[index]?.correct).length;
        const item = document.createElement("div");
        item.dataset.category = category;
        const label = document.createElement("span");
        label.textContent = category;
        const value = document.createElement("b");
        value.textContent = correct + " / " + indexes.length;
        item.append(label, value);
        categoryGrid.append(item);
    });
    panel.append(categoryGrid);
    if (missedQuestions.length) {
        const details = document.createElement("details");
        details.className = "knowledge-missed-review";
        const detailsSummary = document.createElement("summary");
        detailsSummary.textContent = "다시 볼 문제 " + missedQuestions.length + "개";
        const list = document.createElement("ol");
        game.questions.forEach((question, index) => {
            const answer = game.answers[index];
            if (answer?.correct)
                return;
            const item = document.createElement("li");
            const prompt = document.createElement("strong");
            prompt.textContent = question.prompt;
            const selected = document.createElement("p");
            selected.className = "knowledge-review-selected";
            selected.textContent = answer ? "내가 고른 답: " + question.choices[answer.selected] : "시간 안에 풀지 못한 문제예요.";
            const correctAnswer = document.createElement("p");
            correctAnswer.className = "knowledge-review-correct";
            correctAnswer.textContent = "정답: " + question.choices[question.answer];
            const explanation = document.createElement("p");
            explanation.textContent = question.explanation;
            item.append(prompt, selected, correctAnswer, explanation);
            list.append(item);
        });
        details.append(detailsSummary, list);
        panel.append(details);
    }
    byId("resultRetry").textContent = missedQuestions.length ? "틀린 문제 다시 풀기" : "새로운 10문제";
}
function appendResultReviewHeading(panel, title, description) {
    const heading = document.createElement("h3");
    heading.textContent = title;
    const summary = document.createElement("p");
    summary.className = "knowledge-result-summary";
    summary.textContent = description;
    panel.append(heading, summary);
}
function appendResultMetricGrid(panel, metrics) {
    const grid = document.createElement("div");
    grid.className = "knowledge-category-results result-review-metrics";
    metrics.forEach(([value, label]) => {
        const item = document.createElement("div");
        const labelElement = document.createElement("span");
        labelElement.textContent = label;
        const valueElement = document.createElement("b");
        valueElement.textContent = value;
        item.append(labelElement, valueElement);
        grid.append(item);
    });
    panel.append(grid);
}
function createResultReviewDetails(summaryText) {
    const details = document.createElement("details");
    details.className = "knowledge-missed-review";
    const summary = document.createElement("summary");
    summary.textContent = summaryText;
    const list = document.createElement("ol");
    details.append(summary, list);
    return details;
}
const MINE_STAGES = [
    { rows: 8, columns: 8, mines: 8 },
    { rows: 10, columns: 10, mines: 15 },
    { rows: 12, columns: 12, mines: 24 }
];
const MOBILE_MINE_STAGES = [
    { rows: 6, columns: 6, mines: 6 },
    { rows: 7, columns: 7, mines: 9 },
    { rows: 8, columns: 8, mines: 13 }
];
function mineStageConfig(stage) {
    const mobile = window.matchMedia("(max-width: 700px) and (pointer: coarse)").matches;
    return (mobile ? MOBILE_MINE_STAGES : MINE_STAGES)[stage];
}
let mine = null;
function stopMine() {
    if (!mine)
        return;
    mine.running = false;
    if (mine.timer !== null)
        window.clearInterval(mine.timer);
    if (mine.nextTimer !== null)
        window.clearTimeout(mine.nextTimer);
}
function startMine() {
    const first = mineStageConfig(0);
    if (!first)
        return;
    mine = {
        running: true, stage: 0, rows: first.rows, columns: first.columns, mineCount: first.mines,
        flags: 0, revealed: 0, score: 0, started: Date.now(), firstClick: true, markMode: false, cells: [], timer: null, nextTimer: null
    };
    setupMineStage(0);
    showScreen("mine");
    showThemedGameScene("mine", "찌리리공 초원 수색", "안전한 칸을 열고 숨은 찌리리공을 표시해요!", 1100);
    mine.timer = appSetInterval(() => {
        if (!mine?.running)
            return;
        renderMineHud();
        if ((Date.now() - mine.started) / 1000 >= MAX_GAME_SECONDS)
            finishMine(false);
    }, 500);
}
function setupMineStage(stage) {
    if (!mine)
        return;
    const config = mineStageConfig(stage);
    if (!config)
        return;
    mine.stage = stage;
    mine.rows = config.rows;
    mine.columns = config.columns;
    mine.mineCount = config.mines;
    mine.flags = 0;
    mine.revealed = 0;
    mine.firstClick = true;
    mine.markMode = false;
    mine.cells = [];
    const board = byId("mineBoard");
    board.style.setProperty("--mine-cols", String(config.columns));
    board.style.setProperty("--voltorb-board-columns", String(config.columns));
    board.setAttribute("aria-rowcount", String(config.rows));
    board.setAttribute("aria-colcount", String(config.columns));
    board.dataset.size = String(config.columns);
    board.replaceChildren();
    for (let index = 0; index < config.rows * config.columns; index += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mine-cell";
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-label", "열지 않은 칸");
        let longPressTimer = null;
        let longPressHandled = false;
        const cancelLongPress = () => {
            if (longPressTimer !== null)
                window.clearTimeout(longPressTimer);
            longPressTimer = null;
            button.classList.remove("touching");
        };
        button.addEventListener("pointerdown", (event) => {
            button.classList.add("touching");
            if (event.pointerType !== "touch" || mine?.markMode)
                return;
            longPressTimer = window.setTimeout(() => {
                longPressTimer = null;
                if (!mine?.running)
                    return;
                longPressHandled = true;
                button.classList.remove("touching");
                toggleMineFlag(index);
                if (navigator.vibrate)
                    navigator.vibrate(35);
            }, 460);
        });
        button.addEventListener("pointerup", () => {
            cancelLongPress();
            if (longPressHandled)
                window.setTimeout(() => { longPressHandled = false; }, 0);
        });
        button.addEventListener("pointercancel", () => { cancelLongPress(); longPressHandled = false; });
        button.addEventListener("pointerleave", cancelLongPress);
        button.addEventListener("click", () => {
            if (longPressHandled)
                return;
            openMineCell(index);
        });
        button.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            toggleMineFlag(index);
        });
        board.append(button);
        mine.cells.push({ mine: false, revealed: false, flagged: false, adjacent: 0, element: button });
    }
    byId("mineReset").textContent = "🙂";
    renderMineHud();
    showToast((stage + 1) + "번 루트 · " + config.rows + "×" + config.columns);
}
function mineNeighbors(index) {
    if (!mine)
        return [];
    const row = Math.floor(index / mine.columns);
    const column = index % mine.columns;
    const result = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0)
                continue;
            const nextRow = row + rowOffset;
            const nextColumn = column + columnOffset;
            if (nextRow >= 0 && nextRow < mine.rows && nextColumn >= 0 && nextColumn < mine.columns) {
                result.push(nextRow * mine.columns + nextColumn);
            }
        }
    }
    return result;
}
function placeVoltorbs(firstIndex) {
    if (!mine)
        return;
    const safe = new Set([firstIndex, ...mineNeighbors(firstIndex)]);
    const candidates = shuffle(mine.cells.map((_cell, index) => index).filter((index) => !safe.has(index)));
    candidates.slice(0, mine.mineCount).forEach((index) => {
        const cell = mine?.cells[index];
        if (cell)
            cell.mine = true;
    });
    mine.cells.forEach((cell, index) => {
        cell.adjacent = mineNeighbors(index).filter((neighbor) => mine?.cells[neighbor]?.mine).length;
    });
    mine.firstClick = false;
}
function openMineCell(index) {
    if (!mine?.running)
        return;
    if (mine.markMode) {
        toggleMineFlag(index);
        return;
    }
    const cell = mine.cells[index];
    if (!cell || cell.revealed || cell.flagged)
        return;
    if (mine.firstClick)
        placeVoltorbs(index);
    if (cell.mine) {
        cell.revealed = true;
        cell.element.classList.add("revealed", "mine-hit");
        appendVoltorb(cell.element);
        revealAllVoltorbs();
        byId("mineReset").textContent = "😵";
        playPokemonCry(100, .24);
        wrongSound();
        mine.nextTimer = window.setTimeout(() => finishMine(false), 1000);
        return;
    }
    floodOpenMine(index);
    openSound();
    renderMineHud();
    checkMineStageClear();
}
function floodOpenMine(startIndex) {
    if (!mine)
        return;
    const queue = [startIndex];
    const visited = new Set();
    while (queue.length) {
        const index = queue.shift();
        if (index === undefined || visited.has(index))
            continue;
        visited.add(index);
        const cell = mine.cells[index];
        if (!cell || cell.revealed || cell.flagged || cell.mine)
            continue;
        cell.revealed = true;
        mine.revealed += 1;
        mine.score += 10;
        cell.element.classList.add("revealed");
        cell.element.setAttribute("aria-label", cell.adjacent ? "주변 찌리리공 " + cell.adjacent + "마리" : "안전한 빈칸");
        if (cell.adjacent > 0) {
            cell.element.textContent = String(cell.adjacent);
            cell.element.classList.add("n" + cell.adjacent);
        }
        else {
            mineNeighbors(index).forEach((neighbor) => queue.push(neighbor));
        }
    }
}
function toggleMineFlag(index) {
    if (!mine?.running)
        return;
    const cell = mine.cells[index];
    if (!cell || cell.revealed)
        return;
    if (!cell.flagged && mine.flags >= mine.mineCount) {
        showToast("몬스터볼을 모두 사용했어요.");
        return;
    }
    cell.flagged = !cell.flagged;
    mine.flags += cell.flagged ? 1 : -1;
    cell.element.classList.toggle("flagged", cell.flagged);
    cell.element.setAttribute("aria-label", cell.flagged ? "몬스터볼로 표시한 칸" : "열지 않은 칸");
    flagSound(cell.flagged);
    renderMineHud();
}
function appendVoltorb(target) {
    const image = document.createElement("img");
    image.src = pokemonUrl(100);
    image.alt = "찌리리공";
    image.addEventListener("error", () => {
        image.remove();
        target.textContent = "⚡";
    }, { once: true });
    target.replaceChildren(image);
}
function revealAllVoltorbs() {
    if (!mine)
        return;
    mine.cells.forEach((cell) => {
        if (!cell.mine)
            return;
        cell.element.classList.add("revealed");
        appendVoltorb(cell.element);
    });
}
function checkMineStageClear() {
    if (!mine?.running)
        return;
    const safeCells = mine.rows * mine.columns - mine.mineCount;
    if (mine.revealed < safeCells)
        return;
    mine.score += 500 * (mine.stage + 1);
    byId("mineReset").textContent = "😎";
    correctSound();
    playPokemonCry(getAvatarId(), .15);
    pokemonSparkBurst(20);
    if (mine.stage >= MINE_STAGES.length - 1) {
        mine.nextTimer = window.setTimeout(() => finishMine(true), 900);
    }
    else {
        mine.nextTimer = window.setTimeout(() => {
            if (!mine?.running)
                return;
            setupMineStage(mine.stage + 1);
        }, 900);
    }
}
function renderMineHud() {
    if (!mine)
        return;
    const elapsed = Math.min(999, Math.floor((Date.now() - mine.started) / 1000));
    const remaining = Math.max(0, mine.mineCount - mine.flags);
    byId("mineCounter").textContent = String(remaining);
    byId("mineTime").textContent = Math.floor(elapsed / 60) + ":" + String(elapsed % 60).padStart(2, "0");
    byId("mineStage").textContent = (mine.stage + 1) + "/3";
    byId("mineScore").textContent = String(mine.score);
    byId("mineLedCount").textContent = String(remaining).padStart(3, "0");
    byId("mineLedTime").textContent = String(elapsed).padStart(3, "0");
    const mode = byId("mineMode");
    mode.textContent = mine.markMode ? "◓ 표시 모드" : "🔎 열기 모드";
    mode.classList.toggle("marking", mine.markMode);
    mode.setAttribute("aria-pressed", String(mine.markMode));
}
function resetMineStage() {
    if (!mine)
        return;
    if (mine.nextTimer !== null)
        window.clearTimeout(mine.nextTimer);
    mine.nextTimer = null;
    setupMineStage(mine.stage);
    selectSound();
}
function toggleMineMode() {
    if (!mine?.running)
        return;
    mine.markMode = !mine.markMode;
    renderMineHud();
    modeSound(mine.markMode);
}
function finishMine(won) {
    if (!mine?.running || state.grade === null)
        return;
    const game = mine;
    const seconds = Math.floor((Date.now() - game.started) / 1000);
    const completed = won ? 3 : game.stage;
    const stars = won ? 3 : completed >= 2 ? 2 : completed >= 1 ? 1 : 0;
    stopMine();
    saveRecord({ name: getName() || "친구", mode: "mine", grade: state.grade, diff: "easy", score: game.score, stars, detail: completed + "/3 루트", timestamp: Date.now() });
    showThemedGameScene("mine", won ? "초원 수색 성공!" : "다시 도전해요!", "안전한 길을 차근차근 찾아보세요.", 1700);
    showResult(stars, won ? "찌리리공 탐색 완료!" : "찌리리공을 만났어요", won ? "세 개의 루트를 모두 안전하게 통과했어요." : "숫자 단서를 다시 살펴보면 다음에는 피할 수 있어요.", [[String(game.score), "점수"], [completed + "/3", "완료 루트"], [seconds + "초", "시간"], [String(game.flags), "표시"]]);
}
function cleanupGame() {
    pokedexDetailController?.abort();
    pokedexDetailController = null;
    pokedexDetailRequest += 1;
    leaderboardController?.abort();
    leaderboardController = null;
    leaderboardRequest += 1;
    stopQuiz();
    stopRain();
    stopMole();
    stopMemory();
    stopOx();
    stopBalloon();
    stopSpace();
    stopMine();
    stopKnowledge();
    stopSymmetry();
    stopCoordinate();
    stopHistory();
    stopSafety();
    stopSnack();
    quiz = null;
    rain = null;
    mole = null;
    memory = null;
    ox = null;
    balloon = null;
    space = null;
    mine = null;
    knowledge = null;
    symmetry = null;
    coordinate = null;
    historyGame = null;
    safety = null;
    snack = null;
}
let levelUpPopupTimer = null;
let pokemonDiscoveryPopupTimer = null;
let pokemonDiscoveryAfterClose = null;
function closePokemonDiscoveryPopup() {
    if (pokemonDiscoveryPopupTimer !== null)
        window.clearTimeout(pokemonDiscoveryPopupTimer);
    pokemonDiscoveryPopupTimer = null;
    const overlay = document.querySelector(".pokemon-discovery-overlay");
    if (!overlay)
        return;
    const afterClose = pokemonDiscoveryAfterClose;
    pokemonDiscoveryAfterClose = null;
    overlay.classList.add("leaving");
    window.setTimeout(() => {
        overlay.remove();
        afterClose?.();
    }, 280);
}
function showPokemonDiscoveryPopup(pokemonList, afterClose) {
    if (!pokemonList.length) {
        afterClose?.();
        return;
    }
    if (pokemonDiscoveryPopupTimer !== null)
        window.clearTimeout(pokemonDiscoveryPopupTimer);
    document.querySelector(".pokemon-discovery-overlay")?.remove();
    pokemonDiscoveryAfterClose = afterClose ?? null;
    markPokemonDiscoveryCelebrated();
    const overlay = document.createElement("div");
    overlay.className = "pokemon-discovery-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "pokemonDiscoveryTitle");
    const panel = document.createElement("section");
    panel.className = "pokemon-discovery-popup";
    if (pokemonList.length === 1)
        panel.classList.add("single");
    const rays = document.createElement("div");
    rays.className = "pokemon-discovery-rays";
    rays.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "pokemon-discovery-label";
    label.textContent = "NEW POKÉMON DISCOVERED";
    const heading = document.createElement("h2");
    heading.id = "pokemonDiscoveryTitle";
    heading.textContent = pokemonList.length === 1 ? "새로운 친구를 발견했어요!" : `새로운 친구 ${pokemonList.length}마리를 발견했어요!`;
    const message = document.createElement("p");
    message.textContent = "모험에서 모은 별빛이 반짝이며 포켓몬 도감에 새 기록이 추가됐어요.";
    const grid = document.createElement("div");
    grid.className = "pokemon-discovery-grid";
    pokemonList.forEach((pokemon, index) => {
        const card = document.createElement("article");
        card.className = "pokemon-discovery-card";
        card.style.setProperty("--discovery-index", String(index));
        const newMark = document.createElement("span");
        newMark.textContent = "NEW";
        const image = document.createElement("img");
        image.src = spriteUrl(pokemon.id);
        image.alt = pokemon.name;
        const number = document.createElement("small");
        number.textContent = "No." + String(pokemon.id).padStart(3, "0");
        const name = document.createElement("strong");
        name.textContent = pokemon.name;
        card.append(newMark, image, number, name);
        grid.append(card);
    });
    const discovered = discoveredPokemonCount();
    const progress = document.createElement("div");
    progress.className = "pokemon-discovery-progress";
    const progressCopy = document.createElement("span");
    progressCopy.innerHTML = `<b>${discovered}</b> / ${POKEMON.length} 도감 등록`;
    const progressTrack = document.createElement("div");
    const progressFill = document.createElement("i");
    progressFill.style.width = discovered / POKEMON.length * 100 + "%";
    progressTrack.append(progressFill);
    progress.append(progressCopy, progressTrack);
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "pokemon-discovery-continue";
    closeButton.textContent = "도감에 기록했어요!";
    closeButton.addEventListener("click", closePokemonDiscoveryPopup);
    overlay.addEventListener("click", (event) => { if (event.target === overlay)
        closePokemonDiscoveryPopup(); });
    overlay.addEventListener("keydown", (event) => { if (event.key === "Escape")
        closePokemonDiscoveryPopup(); });
    for (let index = 0; index < 18; index += 1) {
        const confetti = document.createElement("i");
        confetti.className = "pokemon-discovery-confetti";
        confetti.style.setProperty("--confetti-angle", `${index * 20}deg`);
        confetti.style.setProperty("--confetti-delay", `${(index % 6) * .07}s`);
        confetti.style.setProperty("--confetti-color", ["#ffd83d", "#ef4650", "#4aa7e8", "#5bc58a"][index % 4]);
        panel.append(confetti);
    }
    panel.append(rays, label, heading, message, grid, progress, closeButton);
    overlay.append(panel);
    document.body.append(overlay);
    window.requestAnimationFrame(() => overlay.classList.add("show"));
    window.setTimeout(() => {
        correctSound();
        playPokemonCry(pokemonList[0].id, .22);
        pokemonSparkBurst(42);
    }, 260);
    window.setTimeout(() => closeButton.focus(), 380);
    pokemonDiscoveryPopupTimer = window.setTimeout(closePokemonDiscoveryPopup, 7200);
}
function closeLevelUpPopup() {
    if (levelUpPopupTimer !== null)
        window.clearTimeout(levelUpPopupTimer);
    levelUpPopupTimer = null;
    const overlay = document.querySelector(".level-up-overlay");
    if (!overlay)
        return;
    overlay.classList.add("leaving");
    window.setTimeout(() => overlay.remove(), 260);
}
function showLevelUpPopup(previousLevel, newLevel, title, reward) {
    document.querySelector(".level-up-overlay")?.remove();
    const overlay = document.createElement("div");
    overlay.className = "level-up-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "levelUpTitle");
    const panel = document.createElement("section");
    panel.className = "level-up-popup";
    const label = document.createElement("span");
    label.className = "level-up-label";
    label.textContent = "TRAINER LEVEL UP";
    const heading = document.createElement("h2");
    heading.id = "levelUpTitle";
    heading.textContent = "레벨 업을 축하해요!";
    const message = document.createElement("p");
    message.textContent = `${getName() || "친구"} 트레이너가 한 단계 더 성장했어요.`;
    const hero = document.createElement("div");
    hero.className = "level-up-hero";
    const pokemon = document.createElement("div");
    pokemon.className = "level-up-pokemon";
    replaceWithPokemon(pokemon, getAvatarId());
    const badge = document.createElement("div");
    badge.className = "level-up-badge";
    const levelFlow = document.createElement("small");
    levelFlow.textContent = `Lv.${previousLevel} → Lv.${newLevel}`;
    const levelNumber = document.createElement("strong");
    levelNumber.textContent = `Lv.${newLevel}`;
    const rank = document.createElement("b");
    rank.textContent = title;
    badge.append(levelFlow, levelNumber, rank);
    hero.append(pokemon, badge);
    const rewardBox = document.createElement("div");
    rewardBox.className = "level-up-reward-box";
    const rewardLabel = document.createElement("span");
    rewardLabel.textContent = "새로운 성장 보상";
    const rewardText = document.createElement("strong");
    rewardText.textContent = reward;
    rewardBox.append(rewardLabel, rewardText);
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "level-up-continue";
    closeButton.textContent = "계속 모험하기";
    closeButton.addEventListener("click", closeLevelUpPopup);
    overlay.addEventListener("click", (event) => { if (event.target === overlay)
        closeLevelUpPopup(); });
    overlay.addEventListener("keydown", (event) => { if (event.key === "Escape")
        closeLevelUpPopup(); });
    for (let index = 0; index < 12; index += 1) {
        const spark = document.createElement("i");
        spark.className = "level-up-spark";
        spark.style.setProperty("--spark-angle", `${index * 30}deg`);
        spark.style.setProperty("--spark-delay", `${(index % 4) * .08}s`);
        panel.append(spark);
    }
    panel.append(label, heading, message, hero, rewardBox, closeButton);
    overlay.append(panel);
    document.body.append(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    window.setTimeout(() => closeButton.focus(), 280);
    levelUpPopupTimer = window.setTimeout(closeLevelUpPopup, 7000);
}
function showResult(stars, title, speech, stats) {
    const progress = getTrainerProgress();
    const previousStars = Math.max(0, progress.stars - stars);
    const previous = getTrainerProgress(previousStars);
    const leveledUp = progress.current.level > previous.current.level;
    const levelReward = leveledUp ? progressionRewardText(previous.current.level, progress.current.level) : "";
    const previouslyDiscovered = discoveredPokemonCountAtStars(previousStars);
    const newlyDiscovered = POKEMON.slice(previouslyDiscovered, discoveredPokemonCount());
    replaceWithPokemon(byId("resultMascot"), getAvatarId());
    byId("resultStars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    byId("resultTitle").textContent = title;
    byId("resultSpeech").textContent = leveledUp ? speech + " 트레이너 레벨이 올랐어요!" : speech;
    const reward = byId("resultReward");
    reward.classList.toggle("hidden-panel", !leveledUp);
    reward.textContent = leveledUp ? "LEVEL UP · Lv." + progress.current.level + " " + progress.current.title + " · " + levelReward : "";
    const container = byId("resultStats");
    container.replaceChildren();
    stats.forEach(([value, label]) => container.append(heroStat(value, label)));
    const knowledgeReview = byId("knowledgeResultReview");
    knowledgeReview.replaceChildren();
    knowledgeReview.classList.add("hidden-panel");
    byId("resultRetry").textContent = "다시 도전";
    showScreen("result");
    window.setTimeout(() => playPokemonCry(getAvatarId(), .18), 220);
    pokemonSparkBurst(leveledUp ? 48 : stars >= 2 ? 30 : 14);
    const showLevelUp = () => {
        levelUpSound();
        showLevelUpPopup(previous.current.level, progress.current.level, progress.current.title, levelReward);
    };
    if (newlyDiscovered.length) {
        window.setTimeout(() => showPokemonDiscoveryPopup(newlyDiscovered, leveledUp ? showLevelUp : undefined), 380);
    }
    else if (leveledUp) {
        window.setTimeout(showLevelUp, 380);
    }
}
function openRecords() {
    cleanupGame();
    setActiveNav("records");
    const records = readRecords();
    const best = records.reduce((value, record) => Math.max(value, record.score), 0);
    const stars = getLifetimeStars();
    const summary = byId("recordSummary");
    const playedModes = new Set(records.map((record) => record.mode)).size;
    summary.replaceChildren(heroStat(String(records.length), "총 플레이"), heroStat(String(best), "최고 점수"), heroStat(String(stars), "모은 별"), heroStat(String(playedModes), "도전한 게임"));
    const highlights = byId("recordHighlights");
    const modeGrid = byId("recordModeGrid");
    highlights.replaceChildren();
    modeGrid.replaceChildren();
    if (records.length) {
        const latest = records.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
        const personalBest = records.reduce((a, b) => a.score >= b.score ? a : b);
        const makeHighlight = (label, value, detail, kind) => {
            const card = document.createElement("article");
            card.className = `record-highlight ${kind}`;
            const eyebrow = document.createElement("span");
            eyebrow.textContent = label;
            const strong = document.createElement("strong");
            strong.textContent = value;
            const paragraph = document.createElement("p");
            paragraph.textContent = detail;
            card.append(eyebrow, strong, paragraph);
            return card;
        };
        const nextGoal = Math.max(5, Math.ceil((stars + 1) / 5) * 5);
        highlights.append(makeHighlight("개인 최고", personalBest.score + "점", MODES[personalBest.mode].name, "best"), makeHighlight("최근 모험", MODES[latest.mode].name, new Date(latest.timestamp).toLocaleDateString("ko-KR"), "latest"), makeHighlight("다음 성장 목표", nextGoal + "개 별", "앞으로 " + (nextGoal - stars) + "개 더 모으면 달성!", "goal"));
        const grouped = new Map();
        records.forEach((record) => grouped.set(record.mode, [...(grouped.get(record.mode) ?? []), record]));
        Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length).forEach(([mode, items]) => {
            const meta = MODES[mode];
            if (!meta)
                return;
            const card = document.createElement("article");
            card.className = "record-mode-card";
            const media = pokemonMedia({ id: MODE_MASCOTS[mode], name: meta.name }, "record-mode-pokemon");
            const copy = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = meta.name;
            const category = document.createElement("small");
            category.textContent = meta.category;
            copy.append(title, category);
            const modeBest = Math.max(...items.map((item) => item.score));
            const modeStars = items.reduce((total, item) => total + item.stars, 0);
            const stats = document.createElement("div");
            stats.className = "record-mode-stats";
            stats.innerHTML = `<span><b>${items.length}</b>회 플레이</span><span><b>${modeBest}</b>최고 점수</span><span><b>★ ${modeStars}</b>모은 별</span>`;
            card.append(media, copy, stats);
            modeGrid.append(card);
        });
    }
    else {
        const guide = document.createElement("article");
        guide.className = "record-empty-guide";
        guide.innerHTML = "<strong>첫 모험을 시작해 보세요!</strong><p>게임을 완료하면 최고 점수와 별이 이곳에 자동으로 기록돼요.</p>";
        highlights.append(guide);
    }
    const wrapper = byId("recordTable");
    wrapper.replaceChildren();
    if (!records.length) {
        const empty = document.createElement("p");
        empty.textContent = "아직 기록이 없어요.";
        empty.style.padding = "2rem";
        empty.style.textAlign = "center";
        wrapper.append(empty);
    }
    else {
        const table = document.createElement("table");
        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["날짜", "게임", "학년", "점수", "성과", "별"].forEach((label) => {
            const cell = document.createElement("th");
            cell.textContent = label;
            headRow.append(cell);
        });
        head.append(headRow);
        const body = document.createElement("tbody");
        records.forEach((record) => {
            const row = document.createElement("tr");
            const date = new Date(record.timestamp);
            const values = [
                String(date.getMonth() + 1).padStart(2, "0") + "/" + String(date.getDate()).padStart(2, "0"),
                MODES[record.mode].name, gradeName(record.grade), String(record.score),
                record.detail, "★".repeat(record.stars)
            ];
            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            body.append(row);
        });
        table.append(head, body);
        wrapper.append(table);
    }
    showScreen("records");
}
let leaderboardRequest = 0;
let localLeaderboardSynced = false;
let leaderboardController = null;
function rankingAvatarPokemon(name) {
    let hash = 0;
    for (let index = 0; index < name.length; index += 1)
        hash = (Math.imul(hash, 31) + name.charCodeAt(index)) | 0;
    return POKEMON[Math.abs(hash) % POKEMON.length];
}
function rankingRows(mode, records = readRecords()) {
    const grouped = new Map();
    records.filter((record) => mode === null || record.mode === mode).forEach((record) => {
        const row = grouped.get(record.name) ?? { name: record.name, score: 0, stars: 0, games: 0, best: 0 };
        row.score += record.score;
        row.stars += record.stars;
        row.games += 1;
        row.best = Math.max(row.best, record.score);
        grouped.set(record.name, row);
    });
    if (!grouped.size)
        grouped.set(getName() || "친구", { name: getName() || "친구", score: 0, stars: 0, games: 0, best: 0 });
    return Array.from(grouped.values()).sort((a, b) => mode === null ? b.stars - a.stars || b.score - a.score : b.best - a.best || b.stars - a.stars).slice(0, 20);
}
function paintLeaderboard(rows, mode) {
    const summary = byId("rankingSummary");
    summary.replaceChildren();
    const totals = [
        [String(rows.length), "참가 트레이너"],
        [String(rows.reduce((sum, row) => sum + row.games, 0)), "총 플레이"],
        ["★ " + rows.reduce((sum, row) => sum + row.stars, 0), "모은 별"]
    ];
    totals.forEach(([value, label]) => {
        const item = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = value;
        const span = document.createElement("span");
        span.textContent = label;
        item.append(strong, span);
        summary.append(item);
    });
    const podium = byId("rankingPodium");
    podium.replaceChildren();
    rows.slice(0, 3).forEach((row, index) => {
        const card = document.createElement("article");
        card.className = "ranking-place place-" + (index + 1);
        if (row.name === (getName() || "친구"))
            card.classList.add("current");
        const tier = document.createElement("small");
        tier.className = "ranking-tier";
        tier.textContent = ["LEAGUE CHAMPION", "ELITE TRAINER", "ACE TRAINER"][index] ?? "TRAINER";
        const medal = document.createElement("span");
        medal.className = "ranking-medal";
        medal.textContent = String(index + 1);
        const avatar = document.createElement("div");
        avatar.className = "ranking-avatar";
        avatar.append(pokemonAvatarMedia(rankingAvatarPokemon(row.name)));
        const name = document.createElement("strong");
        name.textContent = row.name;
        const score = document.createElement("b");
        score.textContent = mode === null ? row.stars + "개 별" : row.best + "점";
        const detail = document.createElement("small");
        detail.textContent = row.games + "회 플레이 · 누적 " + row.score + "점";
        card.append(tier, medal, avatar, name, score, detail);
        podium.append(card);
    });
    const table = byId("rankingTable");
    table.replaceChildren();
    const header = document.createElement("div");
    header.className = "ranking-table-head";
    ["순위", "트레이너", "플레이", "별", "기록"].forEach((label) => { const span = document.createElement("span"); span.textContent = label; header.append(span); });
    table.append(header);
    rows.forEach((row, index) => {
        const item = document.createElement("div");
        if (row.name === (getName() || "친구"))
            item.classList.add("current");
        const rank = document.createElement("b");
        rank.className = "ranking-row-rank";
        rank.textContent = "#" + (index + 1);
        const name = document.createElement("strong");
        name.textContent = row.name;
        if (row.name === (getName() || "친구")) {
            const me = document.createElement("em");
            me.textContent = "ME";
            name.append(me);
        }
        const games = document.createElement("span");
        games.textContent = row.games + "회";
        const stars = document.createElement("span");
        stars.textContent = "★ " + row.stars;
        const score = document.createElement("span");
        score.textContent = mode === null ? row.score + "점" : "최고 " + row.best + "점";
        item.append(rank, name, games, stars, score);
        table.append(item);
    });
}
async function renderLeaderboard() {
    leaderboardController?.abort();
    const controller = new AbortController();
    leaderboardController = controller;
    const request = ++leaderboardRequest;
    const refresh = byId("rankingRefresh");
    refresh.disabled = true;
    refresh.classList.add("loading");
    const value = byId("rankingMode").value;
    const mode = value === "all" ? null : value;
    const note = byId("rankingNote");
    paintLeaderboard(rankingRows(mode), mode);
    if (!leaderboardServerConfig()) {
        note.textContent = "공용 순위표 설정 전이에요. 현재는 이 브라우저의 기록을 표시합니다.";
        refresh.disabled = false;
        refresh.classList.remove("loading");
        leaderboardController = null;
        return;
    }
    note.textContent = "다른 기기의 트레이너 기록을 불러오고 있어요...";
    try {
        if (!localLeaderboardSynced) {
            localLeaderboardSynced = await uploadSharedRecords(readRecords(), controller.signal);
        }
        const sharedRecords = await readSharedRecords(mode, controller.signal);
        if (request !== leaderboardRequest)
            return;
        paintLeaderboard(rankingRows(mode, sharedRecords), mode);
        note.textContent = "공용 순위표 · 여러 기기에서 등록된 최근 기록 " + sharedRecords.length + "개를 반영했어요.";
    }
    catch {
        if (request !== leaderboardRequest)
            return;
        note.textContent = "공용 순위표에 연결하지 못해 이 브라우저의 기록을 표시합니다.";
    }
    finally {
        if (request === leaderboardRequest) {
            refresh.disabled = false;
            refresh.classList.remove("loading");
            leaderboardController = null;
        }
    }
}
function openLeaderboard() {
    cleanupGame();
    setActiveNav("leaderboard");
    const select = byId("rankingMode");
    if (select.options.length === 1)
        Object.entries(MODES).forEach(([mode, meta]) => { const option = document.createElement("option"); option.value = mode; option.textContent = meta.name; select.append(option); });
    renderLeaderboard();
    showScreen("leaderboard");
}
const HELP_CONTROLS = {
    quiz: "숫자판·보기 선택", rain: "숫자판 입력", mole: "디그다 터치", memory: "카드 뒤집기", ox: "O·X 선택", balloon: "푸린 터치", space: "도형 보기 선택", mine: "칸 열기·몬스터볼 표시", knowledge: "보기 선택", symmetry: "대칭 칸 채우기", coordinate: "오류 데이터 선택", history: "사건 순서 선택", safety: "안전 행동 선택", snack: "터치·좌우 이동"
};
const HELP_DURATIONS = {
    quiz: "약 3~5분", rain: "최대 10분", mole: "60초", memory: "최대 10분", ox: "60초", balloon: "60초", space: "약 4~7분", mine: "약 5~10분", knowledge: "약 3~5분", symmetry: "약 3~6분", coordinate: "약 3~5분", history: "약 3~5분", safety: "약 3~5분", snack: "60초"
};
let activeHelpCategory = "all";
function renderHelpCards() {
    const query = byId("helpSearch").value.trim().toLocaleLowerCase("ko-KR");
    const entries = Object.entries(MODES).filter(([, meta]) => {
        const categoryMatch = activeHelpCategory === "all" || meta.category === activeHelpCategory;
        const searchMatch = !query || `${meta.name} ${meta.description} ${meta.hint} ${meta.category}`.toLocaleLowerCase("ko-KR").includes(query);
        return categoryMatch && searchMatch;
    });
    byId("helpResultCount").textContent = `${entries.length}개 게임`;
    const grid = byId("helpCards");
    grid.replaceChildren();
    if (!entries.length) {
        const empty = document.createElement("article");
        empty.className = "help-empty";
        empty.innerHTML = "<strong>일치하는 게임을 찾지 못했어요.</strong><p>다른 포켓몬 이름이나 학습 영역으로 검색해 보세요.</p>";
        grid.append(empty);
        return;
    }
    entries.forEach(([mode, meta], index) => {
        const card = document.createElement("article");
        card.className = "help-card help-game-card";
        card.style.setProperty("--help-accent", meta.colors[0]);
        const number = document.createElement("span");
        number.className = "help-card-number";
        number.textContent = String(index + 1).padStart(2, "0");
        const mascot = document.createElement("div");
        mascot.className = "help-mascot";
        mascot.append(pokemonAvatarMedia({ id: MODE_MASCOTS[mode], name: meta.name }));
        const copy = document.createElement("div");
        copy.className = "help-card-copy";
        const category = document.createElement("span");
        category.className = "help-category";
        category.textContent = meta.category;
        const heading = document.createElement("h3");
        heading.textContent = meta.name;
        const goal = document.createElement("p");
        goal.className = "help-goal";
        goal.innerHTML = `<b>목표</b>${meta.description}`;
        const tip = document.createElement("p");
        tip.className = "help-tip";
        tip.innerHTML = `<b>TIP</b>${meta.hint}`;
        copy.append(category, heading, goal, tip);
        const chips = document.createElement("div");
        chips.className = "help-chips";
        [["조작", HELP_CONTROLS[mode]], ["시간", HELP_DURATIONS[mode]], ["난이도", "자동 조절"]].forEach(([label, value]) => { const chip = document.createElement("span"); chip.innerHTML = `<small>${label}</small>${value}`; chips.append(chip); });
        const play = document.createElement("button");
        play.type = "button";
        play.className = "help-play";
        play.textContent = "게임 선택으로";
        play.addEventListener("click", openGrades);
        card.append(number, mascot, copy, chips, play);
        grid.append(card);
    });
}
function openHelp(category = "all") {
    cleanupGame();
    setActiveNav("help");
    activeHelpCategory = category;
    document.querySelectorAll("[data-help-category]").forEach((button) => button.classList.toggle("active", button.dataset.helpCategory === category));
    byId("helpSearch").value = "";
    renderHelpCards();
    showScreen("help");
}
function openAbout() {
    cleanupGame();
    setActiveNav("about");
    showScreen("about");
}
let avatarChanging = false;
let nameChanging = false;
let identityPickerStep = "pokemon";
function renderIdentityPicker() {
    const pokemonStep = identityPickerStep === "pokemon";
    const currentLevel = getTrainerProgress().current.level;
    const pokemonOwned = unlockedPokemonCountAtLevel(currentLevel);
    const trainerOwned = unlockedTrainerCountAtLevel(currentLevel);
    const pokemonTab = byId("pokemonPickerTab");
    const trainerTab = byId("trainerPickerTab");
    pokemonTab.classList.toggle("active", pokemonStep);
    trainerTab.classList.toggle("active", !pokemonStep);
    pokemonTab.setAttribute("aria-selected", String(pokemonStep));
    trainerTab.setAttribute("aria-selected", String(!pokemonStep));
    trainerTab.disabled = !avatarChanging && !hasSavedAvatar();
    byId("avatarPickerTitle").textContent = pokemonStep
        ? "보유한 파트너 포켓몬을 골라요"
        : "보유한 트레이너를 골라요";
    byId("avatarCountText").textContent = pokemonStep
        ? "선택 가능 " + pokemonOwned + "마리 · 전체 보유 포켓몬"
        : "선택 가능 " + trainerOwned + "명 · 전체 보유 트레이너";
    byId("identityPickerHint").textContent = avatarChanging
        ? "두 탭을 오가며 원하는 조합을 선택한 뒤 선택 완료를 눌러요."
        : pokemonStep
            ? "파트너 포켓몬을 선택하면 트레이너 선택으로 이어져요."
            : "마음에 드는 트레이너를 선택하면 모험이 시작돼요.";
    const grid = byId("avatarGrid");
    grid.replaceChildren();
    if (pokemonStep)
        POKEMON.slice(0, pokemonOwned).forEach((pokemon) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "avatar-button" + (pokemon.id === getAvatarId() ? " selected" : "");
            button.setAttribute("aria-label", pokemon.name + " 선택");
            button.append(pokemonAvatarMedia(pokemon));
            const label = document.createElement("small");
            label.textContent = pokemon.name;
            button.append(label);
            button.addEventListener("click", () => {
                setAvatarId(pokemon.id);
                selectSound();
                playPokemonCry(pokemon.id, .18);
                if (avatarChanging)
                    renderIdentityPicker();
                else
                    setIdentityPickerStep("trainer");
            });
            grid.append(button);
        });
    if (!pokemonStep)
        TRAINER_CHOICES.slice(0, trainerOwned).forEach((trainer) => {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.trainerId = trainer.id;
            button.className = "avatar-button trainer-choice-button" + (trainer.id === getTrainerChoice().id ? " selected" : "");
            button.setAttribute("aria-label", trainer.name + " 트레이너 선택 · " + trainer.region);
            button.append(trainerMedia(trainer.file, trainer.name, "trainer-choice-media"));
            const label = document.createElement("small");
            const name = document.createElement("b");
            name.textContent = trainer.name;
            const region = document.createElement("em");
            region.textContent = trainer.region;
            label.append(name, region);
            button.append(label);
            button.addEventListener("click", () => {
                setTrainerChoice(trainer.id);
                selectSound();
                if (avatarChanging)
                    renderIdentityPicker();
                else
                    enterApp();
            });
            grid.append(button);
        });
}
function setIdentityPickerStep(step) {
    if (step === "trainer" && !avatarChanging && !hasSavedAvatar())
        return;
    identityPickerStep = step;
    renderIdentityPicker();
    byId("avatarGrid").scrollTop = 0;
}
function showAvatarPicker(changing, step = "pokemon") {
    avatarChanging = changing;
    identityPickerStep = step;
    byId("introStage").classList.add("hidden-panel");
    byId("nameEntry").classList.add("hidden-panel");
    byId("avatarPick").classList.remove("hidden-panel");
    const close = byId("closeAvatar");
    close.classList.toggle("hidden-panel", !changing);
    renderIdentityPicker();
}
function closeAvatarPicker() {
    avatarChanging = false;
    byId("introOverlay").classList.add("hidden-panel");
    byId("app").classList.remove("hidden-panel");
    updateSideInfo();
    buildGradeHero();
}
function showNameForm(changing = false) {
    nameChanging = changing;
    byId("introStage").classList.add("hidden-panel");
    byId("avatarPick").classList.add("hidden-panel");
    byId("nameEntry").classList.remove("hidden-panel");
    byId("nameEntryLabel").textContent = changing ? "변경할 이름을 알려주세요" : "이름을 알려주세요";
    byId("cancelNameChange").classList.toggle("hidden-panel", !changing);
    byId("nameInput").value = getName();
    clearAccessMessage();
    byId("nameInput").focus();
}
function enterApp() {
    if (!isAllowedTrainerName(getName())) {
        byId("app").classList.add("hidden-panel");
        byId("introOverlay").classList.remove("hidden-panel");
        showNameForm(false);
        showAccessDenied();
        return;
    }
    byId("introOverlay").classList.add("hidden-panel");
    byId("app").classList.remove("hidden-panel");
    updateSideInfo();
    openDashboard();
    startMusic();
}
function startIntro() {
    replaceWithPokemon(byId("introMascot"), 25);
    byId("introOverlay").classList.remove("hidden-panel");
    byId("introStage").classList.remove("hidden-panel");
    byId("nameEntry").classList.add("hidden-panel");
    byId("avatarPick").classList.add("hidden-panel");
    const savedName = getName();
    const name = isAllowedTrainerName(savedName) ? savedName : "";
    if (savedName && !name)
        safeRemove(STORAGE.name);
    byId("dlgText").textContent = name
        ? name + " 트레이너, 다시 만나서 반가워요! 오늘의 배움 모험을 출발해 볼까요?"
        : "포켓몬과 함께 배우고, 탐험하고, 도전하는 모험이 시작돼요. 먼저 트레이너 이름을 알려주세요.";
    byId("introNext").textContent = name ? "모험 출발" : "이름 정하기";
}
function buildBackground() {
    const deco = byId("bgDeco");
    ["◓", "＋", "★", "◒", "×", "✦", "◓", "÷", "★", "◒"].forEach((value, index) => {
        const span = document.createElement("span");
        span.textContent = value;
        span.style.left = randomInt(2, 92) + "%";
        span.style.top = randomInt(3, 90) + "%";
        span.style.animationDelay = index * .55 + "s";
        deco.append(span);
    });
}
function pokemonSparkBurst(count) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    const limit = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches ? 12 : 32;
    count = Math.max(0, Math.min(limit - document.querySelectorAll(".poke-spark").length, Math.floor(count)));
    for (let index = 0; index < count; index += 1) {
        const spark = document.createElement("span");
        spark.className = "poke-spark";
        spark.textContent = index % 4 === 0 ? "◓" : index % 3 === 0 ? "✦" : "★";
        spark.style.left = randomInt(15, 85) + "vw";
        spark.style.setProperty("--spark-x", randomInt(-110, 110) + "px");
        spark.style.animationDelay = Math.random() * .18 + "s";
        document.body.append(spark);
        window.setTimeout(() => spark.remove(), 1600);
    }
}
function decorateGameScreens() {
    const screenPokemon = {
        "screen-quiz": 25, "screen-rain": 129, "screen-mole": 50, "screen-memory": 132,
        "screen-ox": 54, "screen-balloon": 39, "screen-mine": 100
    };
    Object.entries(screenPokemon).forEach(([screenId, pokemonId]) => {
        const screen = byId(screenId);
        const decoration = pokemonMedia(pokemonById(pokemonId), "battle-pokemon");
        decoration.classList.add("battle-decoration");
        decoration.setAttribute("aria-hidden", "true");
        screen.append(decoration);
    });
}
function bindEvents() {
    document.addEventListener("pointerdown", unlockAudioFromGesture, { capture: true, passive: true });
    document.addEventListener("touchend", unlockAudioFromGesture, { capture: true, passive: true });
    document.addEventListener("keydown", unlockAudioFromGesture, { capture: true });
    byId("introNext").addEventListener("click", () => {
        unlockAudioFromGesture();
        if (isAllowedTrainerName(getName())) {
            if (hasSavedAvatar() && hasSavedTrainer())
                enterApp();
            else
                showAvatarPicker(false, hasSavedAvatar() ? "trainer" : "pokemon");
        }
        else
            showNameForm(false);
    });
    byId("nameEntry").addEventListener("submit", (event) => {
        event.preventDefault();
        const enteredName = byId("nameInput").value;
        if (!isAllowedTrainerName(enteredName)) {
            showAccessDenied(nameChanging ? "허용되지 않은 이름이라 변경할 수 없습니다." : "접속할 수 없습니다.");
            return;
        }
        clearAccessMessage();
        nameChanging = false;
        setName(enteredName);
        if (hasSavedAvatar() && hasSavedTrainer())
            enterApp();
        else
            showAvatarPicker(false, hasSavedAvatar() ? "trainer" : "pokemon");
    });
    byId("nameInput").addEventListener("input", clearAccessMessage);
    byId("cancelNameChange").addEventListener("click", () => {
        nameChanging = false;
        clearAccessMessage();
        byId("nameEntry").classList.add("hidden-panel");
        byId("introOverlay").classList.add("hidden-panel");
        byId("app").classList.remove("hidden-panel");
        updateSideInfo();
        openDashboard();
    });
    byId("playerCard").addEventListener("click", () => {
        cleanupGame();
        byId("app").classList.add("hidden-panel");
        byId("introOverlay").classList.remove("hidden-panel");
        showAvatarPicker(true, "pokemon");
    });
    byId("pokemonPickerTab").addEventListener("click", () => setIdentityPickerStep("pokemon"));
    byId("trainerPickerTab").addEventListener("click", () => setIdentityPickerStep("trainer"));
    byId("closeAvatar").addEventListener("click", closeAvatarPicker);
    const sideMoreMenu = byId("sideMoreMenu");
    const sideMoreSummary = sideMoreMenu.querySelector("summary");
    const sideMorePanel = byId("sideMorePanel");
    const sideMoreBackdrop = byId("moreMenuBackdrop");
    document.body.append(sideMoreBackdrop, sideMorePanel);
    sideMoreSummary?.addEventListener("click", (event) => {
        event.preventDefault();
        sideMoreMenu.open = !sideMoreMenu.open;
        syncMoreMenuAccessibility();
    });
    sideMoreMenu.addEventListener("toggle", syncMoreMenuAccessibility);
    syncMoreMenuAccessibility();
    byId("closeMoreMenu").addEventListener("click", () => closeMoreMenu(true));
    const closeMoreFromBackdrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMoreMenu(false);
    };
    sideMoreBackdrop.addEventListener("pointerup", closeMoreFromBackdrop);
    sideMoreBackdrop.addEventListener("click", closeMoreFromBackdrop);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && byId("sideMoreMenu").open)
            closeMoreMenu(true);
    });
    byId("changeNameButton").addEventListener("click", () => {
        cleanupGame();
        byId("app").classList.add("hidden-panel");
        byId("introOverlay").classList.remove("hidden-panel");
        showNameForm(true);
    });
    document.querySelectorAll("[data-nav]").forEach((button) => {
        button.addEventListener("click", () => {
            const nav = button.dataset.nav;
            if (nav === "dashboard")
                openDashboard();
            if (nav === "game")
                openGrades();
            if (nav === "today")
                openToday();
            if (nav === "pokedex")
                openPokedex();
            if (nav === "report")
                openReport();
            if (nav === "records")
                openRecords();
            if (nav === "help")
                openHelp();
            if (nav === "about")
                openAbout();
        });
    });
    byId("dashboardContinue").addEventListener("click", () => {
        const last = readLastPlay();
        if (!last) {
            openGrades();
            return;
        }
        state.grade = last.grade;
        state.mode = last.mode;
        state.diff = last.diff;
        startSelectedGame();
    });
    byId("dashboardGames").addEventListener("click", openGrades);
    byId("dashboardToday").addEventListener("click", openToday);
    byId("dashboardDex").addEventListener("click", openPokedex);
    byId("collectionPokemonTab").addEventListener("click", () => setCollectionView("pokemon"));
    byId("collectionTrainerTab").addEventListener("click", () => setCollectionView("trainer"));
    document.querySelectorAll("[data-help-category]").forEach((button) => button.addEventListener("click", () => openHelp((button.dataset.helpCategory ?? "all"))));
    byId("helpSearch").addEventListener("input", renderHelpCards);
    byId("pokedexSearch").addEventListener("input", (event) => {
        const value = event.currentTarget.value;
        if (collectionView === "pokemon") {
            pokedexQuery = value;
            renderPokedexGrid(discoveredPokemonCount());
        }
        else {
            trainerAlbumQuery = value;
            renderTrainerAlbumGrid(unlockedTrainerCountAtLevel(getTrainerProgress().current.level));
        }
    });
    document.querySelectorAll("[data-pokedex-filter]").forEach((button) => button.addEventListener("click", () => {
        pokedexFilter = (button.dataset.pokedexFilter ?? "all");
        if (collectionView === "pokemon")
            renderPokedexGrid(discoveredPokemonCount());
        else
            renderTrainerAlbumGrid(unlockedTrainerCountAtLevel(getTrainerProgress().current.level));
    }));
    document.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            if (action === "grades")
                openGrades();
            if (action === "modes") {
                cleanupGame();
                buildModes();
            }
            if (action === "retry") {
                const reviewAvailable = state.mode === "quiz" ? Boolean(quizReviewProblems?.length)
                    : state.mode === "space" ? Boolean(spaceReviewQuestions?.length)
                        : state.mode === "knowledge" ? Boolean(knowledgeReviewQuestions?.length)
                            : state.mode === "history" ? Boolean(historyReviewEvents?.length)
                                : state.mode === "safety" ? Boolean(safetyReviewQuestions?.length)
                                    : false;
                startSelectedGame(reviewAvailable);
            }
        });
    });
    document.querySelectorAll("[data-quit]").forEach((button) => {
        button.addEventListener("click", () => {
            cleanupGame();
            buildModes();
        });
    });
    document.querySelectorAll("[data-ox]").forEach((button) => {
        button.addEventListener("click", () => answerOx(button.dataset.ox === "true"));
    });
    byId("symmetryCheck").addEventListener("click", checkSymmetry);
    byId("symmetryHint").addEventListener("click", useSymmetryHint);
    document.querySelectorAll("[data-snack-move]").forEach((button) => button.addEventListener("click", () => moveSnack(button.dataset.snackMove === "left" ? -12 : 12)));
    byId("snackField").addEventListener("pointerdown", (event) => moveSnackTo(event.clientX));
    byId("snackField").addEventListener("pointermove", (event) => { if (event.buttons === 1 || event.pointerType === "touch")
        moveSnackTo(event.clientX); });
    byId("mineReset").addEventListener("click", resetMineStage);
    byId("mineMode").addEventListener("click", toggleMineMode);
    byId("clearRecords").addEventListener("click", () => {
        if (window.confirm("모든 기록을 지울까요?")) {
            safeRemove(STORAGE.records);
            safeRemove(STORAGE.lifetimeStars);
            safeSet(STORAGE.progressionStars, "0");
            safeSet(STORAGE.avatar, "25");
            safeSet(STORAGE.trainer, "ash");
            safeSet(STORAGE.celebratedPokemon, "1");
            updateSideInfo();
            openRecords();
        }
    });
    byId("musicButton").addEventListener("click", () => {
        unlockAudioFromGesture();
        musicEnabled = !musicEnabled;
        const button = byId("musicButton");
        button.setAttribute("aria-pressed", String(musicEnabled));
        button.textContent = musicEnabled ? "음악 켜짐" : "음악 꺼짐";
        if (musicEnabled)
            startMusic();
        else
            stopMusic();
    });
    byId("sfxButton").addEventListener("click", () => {
        sfxEnabled = !sfxEnabled;
        const button = byId("sfxButton");
        button.setAttribute("aria-pressed", String(sfxEnabled));
        button.textContent = sfxEnabled ? "효과음 켜짐" : "효과음 꺼짐";
    });
    document.addEventListener("keydown", (event) => {
        if (snack?.running && event.key === "ArrowLeft") {
            event.preventDefault();
            moveSnack(-8);
        }
        if (snack?.running && event.key === "ArrowRight") {
            event.preventDefault();
            moveSnack(8);
        }
        if (event.key === "Escape" && !byId("app").classList.contains("hidden-panel")) {
            cleanupGame();
            buildModes();
        }
        if (quiz?.current && !quiz.choiceMode && !quiz.locked) {
            if (/^[0-9]$/.test(event.key) && quiz.input.length < 7) {
                quiz.input += event.key;
                byId("quizAnswer").textContent = quiz.input;
            }
            else if (event.key === "Backspace") {
                event.preventDefault();
                quiz.input = quiz.input.slice(0, -1);
                byId("quizAnswer").textContent = quiz.input || "?";
            }
            else if (event.key === "Enter" && quiz.input)
                answerQuiz(Number(quiz.input), null);
        }
        else if (rain?.running) {
            if (/^[0-9]$/.test(event.key))
                rainNumber(event.key);
            else if (event.key === "Backspace") {
                event.preventDefault();
                rainDelete();
            }
            else if (event.key === "Enter")
                rainSubmit();
        }
        if (ox?.running) {
            if (event.key.toLowerCase() === "o" || event.key === "ArrowLeft")
                answerOx(true);
            if (event.key.toLowerCase() === "x" || event.key === "ArrowRight")
                answerOx(false);
        }
        if (mine?.running && event.key.toLowerCase() === "f")
            toggleMineMode();
    });
}
function restoreLastPlay() {
    const last = readLastPlay();
    if (!last)
        return;
    state.grade = last.grade;
    state.mode = last.mode;
    state.diff = last.diff;
}
initializeProgressionRules();
buildBackground();
decorateGameScreens();
bindEvents();
restoreLastPlay();
startIntro();
window.addEventListener("pagehide", () => { cleanupGame(); stopMusic(); cryAudio?.pause(); if (audioContext?.state === "running")
    void audioContext.suspend(); });
window.addEventListener("pageshow", () => {
    if (musicEnabled && !byId("app").classList.contains("hidden-panel"))
        startMusic();
});
const installCoordinateRuleDock = () => {
    let updateQueued = false;
    const syncRuleDock = () => {
        updateQueued = false;
        const screen = document.querySelector("#screen-coordinate");
        if (!screen)
            return;
        const packets = Array.from(screen.querySelectorAll(".coordinate-packet"));
        const packetGrid = packets[0]?.parentElement;
        if (!packetGrid)
            return;
        const ruleTitle = screen.querySelector("#coordinateRuleTitle");
        const ruleMission = screen.querySelector("#coordinateMission");
        if (!ruleTitle || !ruleMission)
            return;
        let dock = packetGrid.querySelector("[data-coordinate-rule-dock]");
        if (!dock) {
            dock = document.createElement("aside");
            dock.dataset.coordinateRuleDock = "true";
            dock.setAttribute("aria-live", "polite");
            dock.innerHTML = `
        <span class="coordinate-rule-dock__label">판별 규칙</span>
        <strong class="coordinate-rule-dock__value"></strong>
        <span class="coordinate-rule-dock__hint">조건과 다른 데이터를 선택하세요</span>
      `;
            packetGrid.insertBefore(dock, packetGrid.firstChild);
        }
        const value = dock.querySelector(".coordinate-rule-dock__value");
        const hint = dock.querySelector(".coordinate-rule-dock__hint");
        const nextTitle = ruleTitle.textContent?.trim() ?? "";
        const nextMission = ruleMission.textContent?.trim() ?? "";
        if (value && value.textContent !== nextTitle)
            value.textContent = nextTitle;
        if (hint && hint.textContent !== nextMission)
            hint.textContent = nextMission;
        const sourcePanel = ruleTitle.closest(".coordinate-rule-card");
        if (sourcePanel)
            sourcePanel.dataset.coordinateRuleSource = "true";
    };
    const queueRuleDockUpdate = () => {
        if (updateQueued)
            return;
        updateQueued = true;
        window.requestAnimationFrame(syncRuleDock);
    };
    const coordinateScreen = document.querySelector("#screen-coordinate");
    if (!coordinateScreen)
        return;
    const observer = new MutationObserver(queueRuleDockUpdate);
    observer.observe(coordinateScreen, { childList: true, subtree: true, characterData: true });
    queueRuleDockUpdate();
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installCoordinateRuleDock, { once: true });
}
else {
    installCoordinateRuleDock();
}
const installCodexPikachuQuizPolish = () => {
    let scanQueued = false;
    const quizScreen = document.querySelector("#screen-quiz");
    if (!quizScreen)
        return;
    const queueScan = () => {
        if (scanQueued)
            return;
        scanQueued = true;
        requestAnimationFrame(() => {
            scanQueued = false;
            const marker = Array.from(quizScreen.querySelectorAll("*")).find((element) => {
                const text = (element.textContent || "").trim();
                return element.children.length === 0 && /PIKACHU POWER TRAINING/i.test(text);
            });
            if (!marker)
                return;
            let root = marker.closest('[class*="pikachu"], [class*="mental"], [class*="quiz-game"], [class*="game-stage"], [class*="game-play"]');
            if (!root) {
                let candidate = marker.parentElement;
                for (let depth = 0; candidate && depth < 7; depth += 1, candidate = candidate.parentElement) {
                    if (candidate.querySelectorAll("button").length >= 4) {
                        root = candidate;
                        break;
                    }
                }
            }
            if (!root)
                return;
            root.dataset.pikachuPolished = "true";
            Array.from(root.querySelectorAll("*")).forEach((element) => {
                if (element.children.length > 0)
                    return;
                const text = (element.textContent || "").trim();
                if (/^-?\d+\s*[+\-xX×÷]\s*-?\d+\s*=\s*\?$/.test(text)) {
                    element.classList.add("codex-pika-equation");
                }
                if (/다시 생각|잠깐 생각|정답|충전|잘했|아쉬워/.test(text)) {
                    element.classList.add("codex-pika-feedback");
                }
            });
            root.querySelectorAll("button").forEach((button) => {
                const label = (button.textContent || "").trim();
                if (!/^-?\d+$/.test(label))
                    return;
                button.classList.add("codex-pika-choice");
                if (button.dataset.pikachuGuard === "true")
                    return;
                button.dataset.pikachuGuard = "true";
                button.addEventListener("click", (event) => {
                    if (root?.dataset.pikachuInputLock === "true") {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        return;
                    }
                    if (!root)
                        return;
                    root.dataset.pikachuInputLock = "true";
                    window.setTimeout(() => {
                        if (root)
                            delete root.dataset.pikachuInputLock;
                    }, 380);
                }, true);
            });
            const mascot = Array.from(root.querySelectorAll("img")).find((image) => {
                const source = `${image.src} ${image.alt}`.toLowerCase();
                return /pikachu|\/25(?:\D|$)|\/025(?:\D|$)/.test(source);
            });
            mascot?.classList.add("codex-pika-mascot");
        });
    };
    const observer = new MutationObserver(queueScan);
    observer.observe(quizScreen, { childList: true, subtree: true, characterData: true });
    queueScan();
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installCodexPikachuQuizPolish, { once: true });
}
else {
    installCodexPikachuQuizPolish();
}
