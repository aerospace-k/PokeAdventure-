type Difficulty = "easy" | "normal" | "hard";
type Mode = "quiz" | "rain" | "mole" | "memory" | "ox" | "balloon" | "space" | "mine" | "knowledge" | "symmetry" | "coordinate" | "history" | "safety" | "snack";

/* Keep game loops fair when a phone locks or the browser moves to the background. */
const nativeSetInterval = window.setInterval.bind(window);
const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
let lifecycleHiddenAt: number | null = document.hidden ? performance.now() : null;
let lifecycleAnimationOffset = 0;
let lifecycleFrameSequence = 0;
const lifecycleFrames = new Map<number,number>();

window.setInterval = ((handler: TimerHandler,timeout?: number,...args: unknown[]): number => nativeSetInterval(() => {
  if (!document.hidden && typeof handler === "function") handler(...args);
},timeout)) as typeof window.setInterval;

window.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
  const frameId = ++lifecycleFrameSequence;
  const run = (timestamp: number): void => {
    if (!lifecycleFrames.has(frameId)) return;
    if (document.hidden) {
      lifecycleFrames.set(frameId,nativeRequestAnimationFrame(run));
      return;
    }
    lifecycleFrames.delete(frameId);
    callback(timestamp - lifecycleAnimationOffset);
  };
  lifecycleFrames.set(frameId,nativeRequestAnimationFrame(run));
  return frameId;
}) as typeof window.requestAnimationFrame;

window.cancelAnimationFrame = ((frameId: number): void => {
  const nativeFrameId = lifecycleFrames.get(frameId);
  if (nativeFrameId !== undefined) nativeCancelAnimationFrame(nativeFrameId);
  lifecycleFrames.delete(frameId);
}) as typeof window.cancelAnimationFrame;

document.addEventListener("visibilitychange",() => {
  document.documentElement.classList.toggle("app-background-paused",document.hidden);
  if (document.hidden) {
    lifecycleHiddenAt = performance.now();
    return;
  }
  if (lifecycleHiddenAt !== null) lifecycleAnimationOffset += performance.now() - lifecycleHiddenAt;
  lifecycleHiddenAt = null;
});

interface Pokemon {
  id: number;
  name: string;
}

interface Problem {
  display: string;
  answer: number;
}

interface RecordEntry {
  name: string;
  mode: Mode;
  grade: number;
  diff: Difficulty;
  score: number;
  stars: number;
  detail: string;
  timestamp: number;
}

interface ModeMeta {
  name: string;
  description: string;
  hint: string;
  colors: [string, string];
  category: "암산·수 연산" | "도형·공간" | "지식탐험" | "미니게임";
}

const POKEMON: Pokemon[] = [
  {id:25,name:"피카츄"}, {id:133,name:"이브이"}, {id:4,name:"파이리"},
  {id:1,name:"이상해씨"}, {id:7,name:"꼬부기"}, {id:151,name:"뮤"},
  {id:143,name:"잠만보"}, {id:37,name:"식스테일"}, {id:54,name:"고라파덕"},
  {id:129,name:"잉어킹"}, {id:131,name:"라프라스"}, {id:132,name:"메타몽"},
  {id:39,name:"푸린"}, {id:52,name:"나옹"}, {id:79,name:"야돈"},
  {id:92,name:"고오스"}, {id:81,name:"코일"}, {id:147,name:"미뇽"},
  {id:137,name:"폴리곤"}, {id:104,name:"탕구리"}, {id:63,name:"캐이시"},
  {id:10,name:"캐터피"}, {id:144,name:"프리져"}, {id:145,name:"썬더"},
  {id:146,name:"파이어"}, {id:150,name:"뮤츠"}, {id:83,name:"파오리"},
  {id:127,name:"쁘사이저"}, {id:123,name:"스라크"}, {id:77,name:"포니타"},
  {id:778,name:"따라큐"}, {id:722,name:"나몰빼미"}, {id:872,name:"누니머기"},
  {id:393,name:"팽도리"}, {id:387,name:"모부기"}, {id:479,name:"로토무"},
  {id:403,name:"꼬링크"}, {id:653,name:"푸호꼬"}, {id:704,name:"미끄메라"},
  {id:677,name:"냐스퍼"}, {id:674,name:"판짱"}, {id:656,name:"개구마르"},
  {id:447,name:"리오르"}, {id:570,name:"조로아"}, {id:885,name:"드라꼰"},
  {id:821,name:"파라꼬"}, {id:328,name:"톱치"}, {id:246,name:"애버라스"},
  {id:280,name:"랄토스"}, {id:607,name:"불켜미"}, {id:679,name:"단칼빙"},
  {id:744,name:"암멍이"}, {id:255,name:"아차모"}, {id:252,name:"나무지기"},
  {id:258,name:"물짱이"}, {id:446,name:"먹고자"}, {id:417,name:"파치리스"},
  {id:399,name:"비버니"}, {id:175,name:"토게피"}, {id:251,name:"세레비"},
  {id:58,name:"가디"}, {id:35,name:"삐삐"}, {id:95,name:"롱스톤"},
  {id:142,name:"프테라"}, {id:113,name:"럭키"}, {id:115,name:"캥카"},
  {id:125,name:"에레브"}, {id:126,name:"마그마"}, {id:50,name:"디그다"},
  {id:128,name:"켄타로"}, {id:66,name:"알통몬"}, {id:74,name:"꼬마돌"},
  {id:120,name:"별가사리"}, {id:116,name:"쏘드라"}, {id:111,name:"뿔카노"},
  {id:100,name:"찌리리공"}, {id:138,name:"암나이트"}, {id:140,name:"투구"},
  {id:43,name:"뚜벅쵸"}, {id:60,name:"발챙이"}
];

const MODE_MASCOTS: Record<Mode,number> = {
  quiz:25,rain:129,mole:50,memory:132,ox:54,balloon:39,space:722,mine:100,knowledge:151,
  symmetry:417,coordinate:137,history:60,safety:7,snack:143
};

interface Window {
  POKE_ALLOWED_TRAINER_NAMES?: readonly string[];
  POKE_LEADERBOARD_SERVER?: {
    enabled?: boolean;
    apiUrl?: string;
  };
}

const GRADES = [
  {name:"유치원", description:"놀이로 만나는 수·모양·생활 기초"},
  {name:"1학년", description:"관찰하고 비교하는 기초 탐험"},
  {name:"2학년", description:"규칙을 찾고 생각을 넓히는 탐험"},
  {name:"3학년", description:"수·공간·지식을 연결하는 탐험"},
  {name:"4학년", description:"논리와 생활 지식을 키우는 탐험"},
  {name:"5학년", description:"여러 영역을 전략적으로 해결하는 탐험"},
  {name:"6학년", description:"배운 내용을 통합하는 종합 탐험"}
] as const;

const MODES: Record<Mode, ModeMeta> = {
  quiz: {
    name:"피카츄 암산퀴즈", description:"주관식과 객관식 10문제",
    hint:"직접 입력과 보기 선택이 섞여 나와요.", colors:["#438fff","#5f62df"], category:"암산·수 연산"
  },
  rain: {
    name:"잉어킹 산성비 챌린지", description:"천천히 떨어지는 문제를 해결해요",
    hint:"땅에 닿기 전에 답을 입력해요. 후반에도 입력 시간이 충분하도록 조정했어요.", colors:["#6f74e8","#4354bc"], category:"암산·수 연산"
  },
  mole: {
    name:"디그다 찾기", description:"정답을 든 디그다를 찾아요",
    hint:"목표 식이 바뀌면 디그다도 모두 새로 나와요.", colors:["#f39a4b","#d96d38"], category:"암산·수 연산"
  },
  memory: {
    name:"메타몽 메모리 게임", description:"변신한 메타몽의 같은 포켓몬 짝을 찾아요",
    hint:"메타몽이 변신한 카드 위치를 기억하고 연속으로 짝을 맞혀 변신 에너지를 채워요.", colors:["#df78c8","#8a5bc2"], category:"미니게임"
  },
  ox: {
    name:"고라파덕 참·거짓 OX", description:"식과 답이 맞는지 판단해요",
    hint:"식을 끝까지 계산한 다음 O 또는 X를 선택해요.", colors:["#f06b8f","#c9466b"], category:"암산·수 연산"
  },
  balloon: {
    name:"푸린 풍선 터뜨리기", description:"정답 풍선을 찾아 터뜨려요",
    hint:"목표 식의 답과 같은 숫자가 적힌 풍선을 선택해요.", colors:["#35b6d2","#2584ae"], category:"암산·수 연산"
  },
  space: {
    name:"나몰빼미의 도형·공간 탐험", description:"회전·위에서 본 모습·쌓기나무·전개도",
    hint:"나몰빼미와 여러 방향에서 관찰하고 접어 보며 공간 감각을 길러요.", colors:["#26a69a","#1565a7"], category:"도형·공간"
  },
  mine: {
    name:"찌리리공 초원 탐색", description:"숫자 단서로 풀숲의 찌리리공 찾기",
    hint:"익숙한 지뢰찾기 규칙에 포켓몬 탐험을 더해 논리와 공간 추론을 길러요.", colors:["#51b86b","#1b7c78"], category:"도형·공간"
  },
  knowledge: {
    name:"뮤와 지식탐험", description:"과학·사회·역사·생활 지식을 탐험해요",
    hint:"학년에 맞는 네 영역을 여행하며 정답과 함께 짧은 해설을 배워요.", colors:["#20a878","#1478a8"], category:"지식탐험"
  },
  symmetry: {
    name:"파치리스의 대칭 연구소",description:"전기 회로의 반쪽을 보고 좌우대칭을 완성해요",
    hint:"대칭축에서 같은 거리의 칸을 연결해 파치리스의 전기 에너지를 채워요.",colors:["#52c8e8","#3976c8"],category:"도형·공간"
  },
  coordinate: {
    name:"폴리곤 좌표 미로",description:"격자와 좌표를 읽어 목표까지 이동해요",
    hint:"장애물을 피하고 방향 버튼으로 폴리곤을 움직여요.",colors:["#2f9cc7","#4965c7"],category:"도형·공간"
  },
  history: {
    name:"발챙이 역사 시간여행",description:"발챙이와 역사 사건을 오래된 순서로 복원해요",
    hint:"가장 오래된 사건부터 고르면 연속 정답 보너스를 받아요.",colors:["#55bce7","#3278c6"],category:"지식탐험"
  },
  safety: {
    name:"꼬부기 생활안전 구조대",description:"생활 속 위기에서 안전한 행동을 찾아요",
    hint:"교통·재난·응급·인터넷 상황에서 가장 안전한 선택을 해요.",colors:["#f2b843","#e27a4c"],category:"지식탐험"
  },
  snack: {
    name:"잠만보 베리 대모험",description:"베리를 모아 피버를 만드는 60초 미니게임",
    hint:"베리와 회복약을 받고, 딱딱한돌은 피해서 10콤보 피버를 만들어요.",colors:["#68b95f","#267d72"],category:"미니게임"
  }
};

const DIFFICULTIES: Record<Difficulty, {name:string; description:string}> = {
  easy:{name:"쉬움",description:"충분히 생각하며 풀어요"},
  normal:{name:"보통",description:"조금 더 빠르고 다양해요"},
  hard:{name:"어려움",description:"큰 수와 빠른 판단에 도전해요"}
};

const TIPS = [
  "틀려도 괜찮아요. 다시 계산하면 실력이 자라요.",
  "곱셈은 같은 수를 여러 번 더하는 빠른 방법이에요.",
  "나눗셈은 똑같은 수만큼 나누는 계산이에요.",
  "식을 한 번 소리 내어 읽으면 실수를 줄일 수 있어요."
];

const HELP: Array<[string,string]> = [
  ["피카츄 암산퀴즈","10문제를 풀어요. 빠르고 연속으로 맞히면 추가 점수를 받아요."],
  ["잉어킹 산성비 챌린지","문제가 땅에 닿기 전에 답을 입력해요. 쉬움은 약 20초의 초기 낙하 시간이 제공돼요."],
  ["디그다 찾기","목표 식의 정답을 든 디그다를 선택해요. 문제 변경 시 화면의 디그다도 함께 바뀌어요."],
  ["짝맞추기","식 카드와 답 카드를 짝지어요. 게임을 나가면 남은 예약 동작도 안전하게 종료돼요."],
  ["고라파덕 참·거짓 OX","제시된 식과 답이 맞는지 판단해요. 오답 감점으로 0초가 되면 즉시 끝나요."],
  ["푸린 풍선 터뜨리기","정답 풍선을 터뜨려 60초 동안 높은 점수에 도전해요."]
  ,["나몰빼미의 도형·공간 탐험","도형 회전, 위에서 내려다본 모습, 쌓기나무, 거울 대칭과 정육면체 전개도를 학년에 맞춰 해결해요."]
  ,["찌리리공 지뢰찾기","숫자 단서를 보고 안전한 칸을 열어요. 오른쪽 클릭이나 표시 모드로 찌리리공 위치에 몬스터볼을 놓아요."]
];

const VALID_MODES = new Set<Mode>(Object.keys(MODES) as Mode[]);
const VALID_DIFFS = new Set<Difficulty>(["easy","normal","hard"]);
const MAX_GAME_SECONDS = 10 * 60;
const STORAGE = {
  name:"amsan_name_v2",
  avatar:"amsan_avatar_v2",
  records:"amsan_records_v2",
  last:"amsan_last_v2",
  lifetimeStars:"amsan_lifetime_stars_v1"
};

type TrainerTier = "starter" | "great" | "ultra" | "master";
interface TrainerLevel {
  level:number; minStars:number; title:string; reward:string; dexBonus:number; tier:TrainerTier;
}
interface TrainerProgress {
  stars:number; current:TrainerLevel; next:TrainerLevel | null; percent:number; remaining:number;
}

const TRAINER_LEVELS: readonly TrainerLevel[] = [
  {level:1,minStars:0,title:"새싹 트레이너",reward:"기본 트레이너 카드",dexBonus:0,tier:"starter"},
  {level:2,minStars:5,title:"포켓볼 트레이너",reward:"도감 보너스 +1",dexBonus:1,tier:"starter"},
  {level:3,minStars:12,title:"호기심 탐험가",reward:"새싹 탐험 배지",dexBonus:1,tier:"starter"},
  {level:4,minStars:21,title:"슈퍼볼 트레이너",reward:"슈퍼볼 카드 테마",dexBonus:2,tier:"great"},
  {level:5,minStars:32,title:"지식 수집가",reward:"도감 보너스 +2",dexBonus:4,tier:"great"},
  {level:6,minStars:45,title:"공간 탐험가",reward:"지식 탐험 배지",dexBonus:4,tier:"great"},
  {level:7,minStars:60,title:"하이퍼볼 트레이너",reward:"하이퍼볼 카드 테마",dexBonus:6,tier:"ultra"},
  {level:8,minStars:78,title:"별빛 연구원",reward:"도감 보너스 +3",dexBonus:9,tier:"ultra"},
  {level:9,minStars:99,title:"챔피언 후보",reward:"별빛 탐험 배지",dexBonus:9,tier:"ultra"},
  {level:10,minStars:123,title:"마스터볼 트레이너",reward:"마스터볼 카드 테마",dexBonus:12,tier:"master"},
  {level:11,minStars:150,title:"배움 챔피언",reward:"도감 보너스 +4",dexBonus:16,tier:"master"},
  {level:12,minStars:180,title:"배움 마스터",reward:"배움 마스터 배지",dexBonus:20,tier:"master"}
];

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error("필수 화면 요소를 찾을 수 없습니다: " + id);
  return element as T;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choose<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)] as T;
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const value = items[i] as T;
    items[i] = items[j] as T;
    items[j] = value;
  }
  return items;
}

function pokemonUrl(id: number): string {
  return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + id + ".png";
}

const TRAINER_SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/trainers/";

function trainerMedia(file: string, name: string, className = ""): HTMLElement {
  const wrapper = document.createElement("span");
  wrapper.className = "trainer-media" + (className ? " " + className : "");
  const fallback = document.createElement("span");
  fallback.className = "trainer-fallback";
  fallback.textContent = name;
  const image = document.createElement("img");
  image.src = TRAINER_SPRITE_BASE + file;
  image.alt = name;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error",() => image.remove(),{once:true});
  wrapper.append(fallback,image);
  return wrapper;
}

function replaceWithTrainer(target: HTMLElement, file: string, name: string): void {
  target.replaceChildren(trainerMedia(file,name));
}

function pokemonCryUrl(id: number): string {
  return "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/" + id + ".ogg";
}

const GAME_POKEMON_NAMES: Record<number,string> = {
  50: "디그다",
  100: "찌리리공",
  113: "럭키"
};

function pokemonById(id: number): Pokemon {
  return POKEMON.find((pokemon) => pokemon.id === id) ?? {
    id,
    name: GAME_POKEMON_NAMES[id] ?? "포켓몬"
  };
}

function pokemonMedia(pokemon: Pokemon, extraClass = ""): HTMLSpanElement {
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
  }, {once:true});
  wrapper.append(fallback, image);
  return wrapper;
}

function replaceWithPokemon(target: HTMLElement, id: number): void {
  target.replaceChildren(pokemonMedia(pokemonById(id)));
}

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* 저장 차단 시 현재 실행만 유지 */ }
}

function safeRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* 저장 차단 시 무시 */ }
}

function getName(): string {
  return (safeGet(STORAGE.name) ?? "").replace(/[<>&]/g, "").slice(0, 6);
}

function setName(value: string): void {
  const clean = value.trim().replace(/[<>&]/g, "").slice(0, 6) || "친구";
  safeSet(STORAGE.name, clean);
}

function normalizeAccessName(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function isAllowedTrainerName(value: string): boolean {
  const normalized = normalizeAccessName(value);
  const allowedNames = window.POKE_ALLOWED_TRAINER_NAMES;
  return normalized.length > 0 && Array.isArray(allowedNames)
    && allowedNames.some((name) => typeof name === "string" && normalizeAccessName(name) === normalized);
}

function clearAccessMessage(): void {
  const input = byId<HTMLInputElement>("nameInput");
  input.removeAttribute("aria-invalid");
  byId("accessMessage").textContent = "";
}

function showAccessDenied(message = "접속할 수 없습니다."): void {
  const input = byId<HTMLInputElement>("nameInput");
  input.setAttribute("aria-invalid", "true");
  byId("accessMessage").textContent = message;
  input.focus();
  input.select();
}

function getAvatarId(): number {
  const parsed = Number(safeGet(STORAGE.avatar));
  if (POKEMON.some((pokemon) => pokemon.id === parsed)) return parsed;
  safeRemove(STORAGE.avatar);
  return 25;
}

function hasSavedAvatar(): boolean {
  const parsed = Number(safeGet(STORAGE.avatar));
  return POKEMON.some((pokemon) => pokemon.id === parsed);
}

function setAvatarId(id: number): void {
  if (POKEMON.some((pokemon) => pokemon.id === id)) safeSet(STORAGE.avatar, String(id));
}

function readRecords(): RecordEntry[] {
  const raw = safeGet(STORAGE.records);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      safeRemove(STORAGE.records);
      return [];
    }
    return parsed.filter((item): item is RecordEntry => {
      if (!item || typeof item !== "object") return false;
      const row = item as Partial<RecordEntry>;
      return typeof row.name === "string"
        && VALID_MODES.has(row.mode as Mode)
        && Number.isInteger(row.grade) && Number(row.grade) >= 0 && Number(row.grade) <= 6
        && VALID_DIFFS.has(row.diff as Difficulty)
        && Number.isFinite(row.score) && Number.isFinite(row.stars)
        && typeof row.detail === "string" && Number.isFinite(row.timestamp);
    }).slice(0, 60);
  } catch {
    safeRemove(STORAGE.records);
    return [];
  }
}

function saveRecord(entry: RecordEntry): void {
  const lifetimeStars = getLifetimeStars() + Math.max(0,Math.min(3,Math.floor(entry.stars)));
  safeSet(STORAGE.lifetimeStars,String(lifetimeStars));
  const records = [entry, ...readRecords()].slice(0, 60);
  safeSet(STORAGE.records, JSON.stringify(records));
  updateSideInfo();
  void uploadSharedRecords([entry]);
}

interface LeaderboardServerConfig {apiUrl:string;}
interface ServerRecordRow {name:unknown;mode:unknown;grade:unknown;diff:unknown;score:unknown;stars:unknown;detail:unknown;timestamp:unknown;}

function leaderboardServerConfig(): LeaderboardServerConfig | null {
  const config = window.POKE_LEADERBOARD_SERVER;
  if (!config?.enabled) return null;
  const apiUrl = String(config.apiUrl ?? "").trim().replace(/\/$/,"");
  if (!/^https?:\/\//i.test(apiUrl)) return null;
  return {apiUrl};
}

function sharedRecordKey(entry: RecordEntry): string {
  const source = [normalizeAccessName(entry.name),entry.mode,entry.grade,entry.score,entry.stars,Math.floor(entry.timestamp)].join("|");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) hash = Math.imul(hash ^ source.charCodeAt(index),16777619);
  return "record-" + (hash >>> 0).toString(36) + "-" + Math.floor(entry.timestamp).toString(36);
}

async function uploadSharedRecords(entries: RecordEntry[]): Promise<boolean> {
  const config = leaderboardServerConfig();
  if (!config || !entries.length) return false;
  const oldestAllowed = Date.now() - 29 * 86400000;
  const rows = entries.filter((entry) => entry.timestamp >= oldestAllowed).map((entry) => ({
    recordKey:sharedRecordKey(entry),name:entry.name.trim().slice(0,20),mode:entry.mode,grade:entry.grade,
    diff:entry.diff,score:Math.max(0,Math.min(10000000,Math.floor(entry.score))),stars:Math.max(0,Math.min(3,Math.floor(entry.stars))),
    detail:entry.detail.slice(0,100),timestamp:Math.floor(entry.timestamp)
  }));
  if (!rows.length) return false;
  try {
    const response = await fetch(config.apiUrl + "/leaderboard",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({records:rows})
    });
    return response.ok;
  } catch { return false; }
}

async function readSharedRecords(mode: Mode | null): Promise<RecordEntry[]> {
  const config = leaderboardServerConfig();
  if (!config) return [];
  const params = new URLSearchParams({limit:"1000"});
  if (mode !== null) params.set("mode",mode);
  const response = await fetch(config.apiUrl + "/leaderboard?" + params.toString());
  if (!response.ok) throw new Error("Shared leaderboard request failed");
  const payload: unknown = await response.json();
  const rows: unknown = payload && typeof payload === "object" && "records" in payload ? (payload as {records:unknown}).records : [];
  if (!Array.isArray(rows)) return [];
  return (rows as ServerRecordRow[]).filter((row) =>
    typeof row.name === "string" && typeof row.mode === "string" && row.mode in MODES
    && Number.isFinite(Number(row.grade)) && ["easy","normal","hard"].includes(String(row.diff))
    && Number.isFinite(Number(row.score)) && Number.isFinite(Number(row.stars)) && typeof row.detail === "string"
    && Number.isFinite(Number(row.timestamp))
  ).map((row) => ({
    name:String(row.name).slice(0,20),mode:String(row.mode) as Mode,grade:Number(row.grade),diff:String(row.diff) as Difficulty,
    score:Number(row.score),stars:Number(row.stars),detail:String(row.detail).slice(0,100),timestamp:Number(row.timestamp)
  }));
}

function getLifetimeStars(): number {
  const recordStars = readRecords().reduce((sum,record) => sum + Math.max(0,Math.min(3,Math.floor(record.stars))),0);
  const stored = Number(safeGet(STORAGE.lifetimeStars));
  const stars = Number.isFinite(stored) && stored >= 0 ? Math.max(Math.floor(stored),recordStars) : recordStars;
  if (String(stars) !== safeGet(STORAGE.lifetimeStars)) safeSet(STORAGE.lifetimeStars,String(stars));
  return stars;
}

function getTrainerProgress(stars = getLifetimeStars()): TrainerProgress {
  let current = TRAINER_LEVELS[0] as TrainerLevel;
  TRAINER_LEVELS.forEach((level) => { if (stars >= level.minStars) current = level; });
  const next = TRAINER_LEVELS.find((level) => level.level === current.level + 1) ?? null;
  const span = next ? next.minStars - current.minStars : 1;
  const percent = next ? Math.max(0,Math.min(100,(stars - current.minStars) / span * 100)) : 100;
  return {stars,current,next,percent,remaining:next ? Math.max(0,next.minStars - stars) : 0};
}

function saveLastPlay(): void {
  if (state.grade === null || state.mode === null) return;
  safeSet(STORAGE.last, JSON.stringify({grade:state.grade, mode:state.mode, diff:state.diff}));
}

function readLastPlay(): {grade:number; mode:Mode; diff:Difficulty} | null {
  const raw = safeGet(STORAGE.last);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const row = value as {grade?:unknown; mode?:unknown; diff?:unknown};
    if (!Number.isInteger(row.grade) || Number(row.grade) < 0 || Number(row.grade) > 6) return null;
    if (!VALID_MODES.has(row.mode as Mode) || !VALID_DIFFS.has(row.diff as Difficulty)) return null;
    return {grade:Number(row.grade), mode:row.mode as Mode, diff:row.diff as Difficulty};
  } catch {
    safeRemove(STORAGE.last);
    return null;
  }
}

let audioContext: AudioContext | null = null;
let sfxEnabled = true;
let musicEnabled = true;
let musicTimer: number | null = null;
let cryAudio: HTMLAudioElement | null = null;

function ensureAudio(): AudioContext | null {
  try {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

type SoundNote = readonly [
  frequency: number,
  duration: number,
  delay: number,
  volume: number,
  type?: OscillatorType,
];

function softNote(
  frequency: number,
  duration = 0.12,
  volume = 0.018,
  delay = 0,
  type: OscillatorType = "sine",
  bypassSfx = false,
  endFrequency = frequency,
): void {
  if (!bypassSfx && !sfxEnabled) return;
  const context = ensureAudio();
  if (!context) return;
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

function playNotes(notes: readonly SoundNote[], bypassSfx = false): void {
  notes.forEach(([frequency, duration, delay, volume, type = "sine"]) => {
    softNote(frequency, duration, volume, delay, type, bypassSfx);
  });
}

function tapSound(): void {
  playNotes([[392, 0.07, 0, 0.009], [523, 0.075, 0.025, 0.005]]);
}

function selectSound(): void {
  playNotes([[392, 0.12, 0, 0.015], [587, 0.15, 0.055, 0.014]]);
}

function collectSound(gold = false): void {
  playNotes(gold
    ? [[523, 0.13, 0, 0.016], [659, 0.15, 0.05, 0.015], [880, 0.2, 0.11, 0.014]]
    : [[440, 0.12, 0, 0.013], [659, 0.16, 0.055, 0.013]]);
}

function bumpSound(): void {
  softNote(165, 0.14, 0.012, 0, "sine", false, 118);
}

function moveSound(): void {
  softNote(330, 0.06, 0.007);
}

function openSound(): void {
  playNotes([[349, 0.075, 0, 0.009], [440, 0.085, 0.025, 0.007]]);
}

function flagSound(active: boolean): void {
  playNotes(active
    ? [[440, 0.1, 0, 0.012], [659, 0.13, 0.045, 0.011]]
    : [[523, 0.1, 0, 0.011], [392, 0.13, 0.045, 0.01]]);
}

function modeSound(active: boolean): void {
  playNotes(active
    ? [[392, 0.1, 0, 0.012], [587, 0.14, 0.05, 0.011]]
    : [[587, 0.1, 0, 0.011], [392, 0.14, 0.05, 0.01]]);
}

function levelUpSound(): void {
  playNotes([
    [392, 0.2, 0, 0.018],
    [523, 0.22, 0.08, 0.018],
    [659, 0.25, 0.17, 0.017],
    [784, 0.32, 0.27, 0.015],
  ]);
}

function musicNote(frequency: number): void {
  playNotes([
    [frequency, 0.48, 0, 0.0075],
    [frequency * 2, 0.3, 0.035, 0.0022],
  ], true);
}

function playPokemonCry(id: number, volume = .16): void {
  if (!sfxEnabled) return;
  try {
    if (cryAudio) {
      cryAudio.pause();
      cryAudio.currentTime = 0;
    }
    cryAudio = new Audio(pokemonCryUrl(id));
    cryAudio.volume = volume;
    void cryAudio.play().catch(() => undefined);
  } catch { /* 네트워크 또는 자동 재생 차단 시 합성 효과음만 사용 */ }
}

function correctSound(): void {
  playNotes([
    [523, 0.17, 0, 0.02],
    [659, 0.19, 0.065, 0.019],
    [784, 0.23, 0.14, 0.017],
  ]);
  if (Math.random() < .24) window.setTimeout(() => playPokemonCry(getAvatarId(),.08),260);
  pokemonSparkBurst(8);
}

function wrongSound(): void {
  playNotes([
    [294, 0.16, 0, 0.016],
    [220, 0.21, 0.085, 0.014],
  ]);
}

function startMusic(): void {
  if (!musicEnabled || musicTimer !== null) return;
  let index = 0;
  const notes = [262,330,392,330,349,440,392,330];
  musicTimer = window.setInterval(() => {
    if (musicEnabled) {
      musicNote(notes[index % notes.length] as number);
      index += 1;
    }
  }, 720);
}

function stopMusic(): void {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
}

function showToast(message: string): void {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

interface AppState {
  grade: number | null;
  mode: Mode | null;
  diff: Difficulty;
}

const state: AppState = {grade:null, mode:null, diff:"easy"};

function showScreen(name: string): void {
  document.querySelectorAll<HTMLElement>(".screen").forEach((screen) => screen.classList.remove("active"));
  byId("screen-" + name).classList.add("active");
}

function setActiveNav(name: string): void {
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === name);
  });
  const secondary = new Set(["report","leaderboard","records","help","about"]);
  const more = byId<HTMLDetailsElement>("sideMoreMenu");
  more.open = false;
  more.classList.toggle("has-active",secondary.has(name));
}

function closeMoreMenu(restoreFocus = false): void {
  const more = byId<HTMLDetailsElement>("sideMoreMenu");
  if (!more.open) return;
  more.open = false;
  if (restoreFocus) more.querySelector<HTMLElement>("summary")?.focus();
}

function gradeName(grade: number): string {
  return GRADES[grade]?.name ?? "유치원";
}

function updateSideInfo(): void {
  const records = readRecords();
  const progress = getTrainerProgress();
  const stars = progress.stars;
  document.body.dataset.trainerTier = progress.current.tier;
  byId("sideName").textContent = getName() || "친구";
  byId("sideStars").textContent = "별 " + stars + "개";
  replaceWithPokemon(byId("sideMascot"), getAvatarId());
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

function buildGradeHero(): void {
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
  hero.append(copy, heroStat(String(records.length),"플레이"), heroStat(String(best),"최고 점수"), heroStat(String(stars),"별"));
}

function heroStat(value: string, label: string): HTMLElement {
  const stat = document.createElement("span");
  stat.className = "hero-stat";
  const strong = document.createElement("b");
  strong.textContent = value;
  const small = document.createElement("small");
  small.textContent = label;
  stat.append(strong, small);
  return stat;
}

function cardButton(title: string, description: string, colors: [string,string], action: () => void, pokemonId?: number): HTMLButtonElement {
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
    const artwork = pokemonMedia(pokemonById(pokemonId),"menu-pokemon");
    artwork.setAttribute("aria-hidden","true");
    button.append(artwork);
  }
  button.addEventListener("click", () => {
    action();
  });
  return button;
}

function renderLevelJourney(progress: TrainerProgress): void {
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
  copy.append(title,count);
  head.append(badge,copy);

  const track = document.createElement("div");
  track.className = "level-journey-track";
  const fill = document.createElement("i");
  fill.style.width = progress.percent + "%";
  track.append(fill);

  const rewards = document.createElement("div");
  rewards.className = "level-journey-rewards";
  const currentReward = document.createElement("div");
  currentReward.className = "level-reward-card earned";
  const currentLabel = document.createElement("small"); currentLabel.textContent = "현재 보상";
  const currentText = document.createElement("b"); currentText.textContent = progress.current.reward;
  currentReward.append(currentLabel,currentText);
  const nextReward = document.createElement("div");
  nextReward.className = "level-reward-card next";
  const nextLabel = document.createElement("small"); nextLabel.textContent = progress.next ? "다음 보상 · 별 " + progress.remaining + "개 남음" : "모든 보상 획득";
  const nextText = document.createElement("b"); nextText.textContent = progress.next?.reward ?? "배움 마스터 배지";
  nextReward.append(nextLabel,nextText);
  rewards.append(currentReward,nextReward);
  host.append(head,track,rewards);
}

function openDashboard(): void {
  cleanupGame();
  setActiveNav("dashboard");
  const records = readRecords();
  const progress = getTrainerProgress();
  const stars = progress.stars;
  const level = progress.current.level;
  const todayRecords = records.filter((record) => record.timestamp >= startOfToday());
  const missions = dailyModes();
  const done = missions.filter((mode) => todayRecords.some((record) => record.mode === mode)).length;
  byId("dashboardChansey").replaceChildren(pokemonMedia({id:113,name:"럭키"}));
  byId("dashboardGreeting").textContent = (getName() || "친구") + " 트레이너, 어서 와요!";
  const daily = byId("dashboardDaily");
  daily.replaceChildren();
  const dailyStrong = document.createElement("strong"); dailyStrong.textContent = done === 3 ? "오늘의 임무 완료!" : done + " / 3 완료";
  const dailyText = document.createElement("span"); dailyText.textContent = done === 3 ? "오늘의 배지를 받았어요" : "조금만 더 힘내요";
  daily.append(dailyStrong,dailyText); daily.classList.toggle("complete",done === 3);
  const stats = byId("dashboardStats"); stats.replaceChildren(
    reportMetric("Lv." + level,"트레이너 레벨"),reportMetric(String(stars),"모은 별"),
    reportMetric(String(records.length),"완료 게임"),reportMetric(discoveredPokemonCount() + "/" + POKEMON.length,"발견 도감")
  );
  renderLevelJourney(progress);
  const recent = byId("dashboardRecent"); recent.replaceChildren();
  if (!records.length) { const empty = document.createElement("p"); empty.textContent = "아직 기록이 없어요. 첫 모험을 시작해 볼까요?"; recent.append(empty); }
  else records.slice(0,4).forEach((record) => {
    const row = document.createElement("div"); const info = document.createElement("span"); const title = document.createElement("b");
    title.textContent = MODES[record.mode].name; info.textContent = gradeName(record.grade) + " · " + record.detail;
    const star = document.createElement("strong"); star.textContent = "★".repeat(record.stars) + "☆".repeat(3 - record.stars);
    row.append(title,info,star); recent.append(row);
  });
  const last = readLastPlay();
  byId<HTMLButtonElement>("dashboardContinue").disabled = !last;
  showScreen("dashboard");
}

function openGrades(): void {
  cleanupGame();
  setActiveNav("game");
  buildGradeHero();
  const grid = byId("gradeGrid");
  grid.replaceChildren();
  const colors: [string,string][] = [
    ["#ff8ebf","#e5538e"],["#ff7b72","#d64a55"],["#f6a94b","#db7734"],
    ["#e8bd35","#c18d16"],["#37bd7d","#16855b"],["#438fff","#2865c1"],["#8b6fe8","#6549bf"]
  ];
  const gradeBalls = [
    {sprite:"poke-ball",name:"몬스터볼",tier:"starter"},
    {sprite:"poke-ball",name:"몬스터볼",tier:"starter"},
    {sprite:"great-ball",name:"슈퍼볼",tier:"great"},
    {sprite:"ultra-ball",name:"하이퍼볼",tier:"ultra"},
    {sprite:"ultra-ball",name:"하이퍼볼",tier:"ultra"},
    {sprite:"master-ball",name:"마스터볼",tier:"master"},
    {sprite:"master-ball",name:"마스터볼",tier:"master"}
  ] as const;
  const requestedGradeBalls = [
    {sprite:"poke-ball",name:"몬스터볼",tier:"starter"},
    {sprite:"great-ball",name:"슈퍼볼",tier:"great"},
    {sprite:"ultra-ball",name:"하이퍼볼",tier:"ultra"},
    {sprite:"master-ball",name:"마스터볼",tier:"master"},
    {sprite:"safari-ball",name:"사파리볼",tier:"safari"},
    {sprite:"luxury-ball",name:"럭셔리볼",tier:"luxury"},
    {sprite:"beast-ball",name:"울트라볼",tier:"beast"}
  ] as const;
  GRADES.forEach((grade, index) => {
    const ball = requestedGradeBalls[index] as typeof requestedGradeBalls[number];
    const card = cardButton(grade.name, grade.description, colors[index] as [string,string], () => selectGrade(index));
    card.classList.add("grade-ball-card");
    card.dataset.ballTier = ball.tier;
    const media = document.createElement("div");
    media.className = "grade-ball-media";
    const image = document.createElement("img");
    image.className = "grade-ball-image";
    image.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/" + ball.sprite + ".png";
    image.alt = ball.name;
    image.loading = "eager";
    const label = document.createElement("small");
    label.className = "grade-ball-name";
    label.textContent = ball.name;
    media.append(image,label); card.append(media); grid.append(card);
  });
  byId("gradeTip").textContent = "도움말: " + choose(TIPS);
  showScreen("grade");
}

function selectGrade(grade: number): void {
  state.grade = grade;
  buildModes();
}

function buildModes(): void {
  if (state.grade === null) {
    openGrades();
    return;
  }
  byId("modeChip").textContent = gradeName(state.grade);
  const grid = byId("modeGrid");
  grid.replaceChildren();
  (["암산·수 연산","도형·공간","지식탐험","미니게임"] as const).forEach((category) => {
    const heading = document.createElement("h3");
    heading.className = "mode-section-title";
    heading.textContent = category;
    grid.append(heading);
    (Object.entries(MODES) as Array<[Mode,ModeMeta]>).filter((entry) => entry[1].category === category).forEach(([mode, meta]) => {
      grid.append(cardButton(meta.name, meta.description, meta.colors, () => selectMode(mode),mode === "space" ? 722 : MODE_MASCOTS[mode]));
    });
  });
  showScreen("mode");
}

const DAILY_MODE_POOL: Mode[] = ["quiz","space","knowledge","ox","mole","balloon","rain","snack"];

function dailyModes(): Mode[] {
  const day = Math.floor(Date.now() / 86400000);
  const start = day % DAILY_MODE_POOL.length;
  return [0,2,4].map((offset) => DAILY_MODE_POOL[(start + offset) % DAILY_MODE_POOL.length] as Mode);
}

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
}

function ensureSelectedGrade(): number {
  if (state.grade !== null) return state.grade;
  const last = readLastPlay();
  state.grade = last?.grade ?? 1;
  return state.grade;
}

function openToday(): void {
  cleanupGame();
  setActiveNav("today");
  const grade = ensureSelectedGrade();
  const modes = dailyModes();
  const completed = new Set(readRecords().filter((record) => record.timestamp >= startOfToday()).map((record) => record.mode));
  const done = modes.filter((mode) => completed.has(mode)).length;
  byId("todayGrade").textContent = gradeName(grade) + " 임무";
  byId("todayGreeting").textContent = (getName() || "친구") + "님, 오늘도 탐험을 시작해 볼까요?";
  byId("todayBadge").textContent = done === 3 ? "오늘의 배지 획득!" : done + " / 3 완료";
  byId("todayBadge").classList.toggle("complete",done === 3);
  replaceWithTrainer(byId("todayPartner"),"ash.png","지우");
  replaceWithTrainer(byId("todayRivals"),"jessiejames-gen1.png","로이와 로사");
  const grid = byId("todayMissionGrid");
  grid.replaceChildren();
  modes.forEach((mode,index) => {
    const meta = MODES[mode];
    const button = cardButton((index + 1) + "번째 임무 · " + meta.name,completed.has(mode) ? "완료했어요! 다시 도전할 수 있어요." : meta.description,meta.colors,() => {
      state.grade = grade;
      state.mode = mode;
      startSelectedGame();
    },MODE_MASCOTS[mode]);
    button.classList.add("today-mission");
    if (completed.has(mode)) button.classList.add("mission-complete");
    grid.append(button);
  });
  showScreen("today");
}

const TYPE_NAMES: Record<string,string> = {
  normal:"노말",fire:"불꽃",water:"물",electric:"전기",grass:"풀",ice:"얼음",fighting:"격투",poison:"독",
  ground:"땅",flying:"비행",psychic:"에스퍼",bug:"벌레",rock:"바위",ghost:"고스트",dragon:"드래곤",dark:"악",steel:"강철",fairy:"페어리"
};

const TYPE_IDS: Record<string,number> = {
  normal:1,fighting:2,flying:3,poison:4,ground:5,rock:6,bug:7,ghost:8,steel:9,
  fire:10,water:11,grass:12,electric:13,psychic:14,ice:15,dragon:16,dark:17,fairy:18
};

function typeIconUrl(type: string): string {
  return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/" + TYPE_IDS[type] + ".png";
}

interface PokeApiDetail {
  height:number;
  weight:number;
  types:Array<{type:{name:string}}>;
  abilities:Array<{ability:{name:string}}>;
}

interface PokeApiSpecies {
  genera:Array<{genus:string;language:{name:string}}>;
  flavor_text_entries:Array<{flavor_text:string;language:{name:string}}>;
}

function spriteUrl(id: number): string {
  return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

function pokemonAvatarMedia(pokemon: Pokemon): HTMLElement {
  const media = pokemonMedia(pokemon);
  const image = media.querySelector<HTMLImageElement>("img");
  if (image) { image.src = spriteUrl(pokemon.id); image.style.imageRendering = "pixelated"; }
  return media;
}

function discoveredPokemonCount(): number {
  const progress = getTrainerProgress();
  return Math.min(POKEMON.length,5 + progress.stars + progress.current.dexBonus);
}

function openPokedex(): void {
  cleanupGame();
  setActiveNav("pokedex");
  const unlocked = discoveredPokemonCount();
  byId("pokedexCount").textContent = unlocked + " / " + POKEMON.length + " 발견";
  const grid = byId("pokedexGrid");
  grid.replaceChildren();
  POKEMON.forEach((pokemon,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pokedex-entry" + (index < unlocked ? " discovered" : " locked");
    button.disabled = index >= unlocked;
    const image = document.createElement("img");
    image.src = spriteUrl(pokemon.id);
    image.alt = index < unlocked ? pokemon.name : "발견하지 않은 포켓몬";
    image.loading = "lazy";
    const number = document.createElement("small");
    number.textContent = "No." + String(pokemon.id).padStart(3,"0");
    const name = document.createElement("strong");
    name.textContent = index < unlocked ? pokemon.name : "???";
    button.append(image,number,name);
    if (index < unlocked) button.addEventListener("click",() => loadPokedexDetail(pokemon,button));
    grid.append(button);
  });
  const detail = byId("pokedexDetail");
  detail.replaceChildren();
  detail.classList.add("pokedex-intro");
  const oak = trainerMedia("oak.png","오박사","pokedex-oak");
  const copy = document.createElement("div");
  copy.className = "pokedex-intro-copy";
  const kicker = document.createElement("span");
  kicker.className = "pokedex-intro-kicker";
  kicker.textContent = "OAK'S RESEARCH";
  const title = document.createElement("h3");
  title.textContent = "오박사의 연구 노트";
  const message = document.createElement("p");
  message.textContent = "게임에서 별을 모으면 새로운 포켓몬을 발견해요. 포켓몬을 선택해 보세요.";
  const progress = document.createElement("div");
  progress.className = "pokedex-intro-progress";
  const progressLabel = document.createElement("span");
  progressLabel.textContent = "도감 완성도 " + Math.round(unlocked / POKEMON.length * 100) + "%";
  const progressTrack = document.createElement("div");
  const progressFill = document.createElement("i");
  progressFill.style.width = unlocked / POKEMON.length * 100 + "%";
  progressTrack.append(progressFill);
  const stats = document.createElement("div");
  stats.className = "pokedex-intro-stats";
  [[String(unlocked),"발견"],[String(POKEMON.length - unlocked),"남은 포켓몬"]].forEach(([value,label]) => {
    const stat = document.createElement("span");
    const strong = document.createElement("b");
    strong.textContent = value;
    stat.append(strong,label);
    stats.append(stat);
  });
  const tip = document.createElement("small");
  tip.textContent = unlocked >= POKEMON.length ? "도감을 완성했어요!" : "별을 모을 때마다 새로운 연구가 열려요.";
  progress.append(progressLabel,progressTrack);
  copy.append(kicker,title,message,progress,stats,tip);
  detail.append(oak,copy);
  showScreen("pokedex");
}

async function loadPokedexDetail(pokemon: Pokemon, selected: HTMLButtonElement): Promise<void> {
  document.querySelectorAll(".pokedex-entry").forEach((entry) => entry.classList.remove("selected"));
  selected.classList.add("selected");
  const detail = byId("pokedexDetail");
  detail.replaceChildren();
  detail.classList.remove("pokedex-intro");
  if (window.matchMedia("(max-width: 700px)").matches) {
    window.requestAnimationFrame(() => detail.scrollIntoView({behavior:"smooth",block:"start"}));
  }
  const loading = document.createElement("p");
  loading.textContent = pokemon.name + "의 도감 정보를 불러오는 중...";
  detail.append(loading);
  playPokemonCry(pokemon.id,.18);
  try {
    const [pokemonResponse,speciesResponse] = await Promise.all([
      fetch("https://pokeapi.co/api/v2/pokemon/" + pokemon.id),
      fetch("https://pokeapi.co/api/v2/pokemon-species/" + pokemon.id)
    ]);
    if (!pokemonResponse.ok || !speciesResponse.ok) throw new Error("PokeAPI response error");
    const data = await pokemonResponse.json() as PokeApiDetail;
    const species = await speciesResponse.json() as PokeApiSpecies;
    const genus = species.genera.find((entry) => entry.language.name === "ko")?.genus ?? "포켓몬";
    const flavor = species.flavor_text_entries.find((entry) => entry.language.name === "ko")?.flavor_text.replace(/[\n\f]/g," ") ?? "도감 설명을 준비하고 있어요.";
    detail.replaceChildren();
    const image = document.createElement("img");
    image.src = pokemonUrl(pokemon.id);
    image.alt = pokemon.name;
    const heading = document.createElement("div");
    const number = document.createElement("small");
    number.textContent = "No." + String(pokemon.id).padStart(3,"0") + " · " + genus;
    const title = document.createElement("h3");
    title.textContent = pokemon.name;
    const typeArtwork = document.createElement("div");
    typeArtwork.className = "pokedex-type-artwork";
    typeArtwork.setAttribute("aria-label",data.types.map((entry) => TYPE_NAMES[entry.type.name] ?? entry.type.name).join(", ") + " 타입");
    data.types.forEach((entry) => {
      const typeName = entry.type.name;
      const typeImage = document.createElement("img");
      typeImage.src = typeIconUrl(typeName);
      typeImage.alt = (TYPE_NAMES[typeName] ?? typeName) + " 타입";
      typeImage.loading = "lazy";
      typeImage.addEventListener("error",() => {
        typeImage.replaceWith(Object.assign(document.createElement("span"),{textContent:TYPE_NAMES[typeName] ?? typeName}));
      },{once:true});
      typeArtwork.append(typeImage);
    });
    const types = document.createElement("p");
    types.className = "pokedex-types";
    types.textContent = data.types.map((entry) => TYPE_NAMES[entry.type.name] ?? entry.type.name).join(" · ");
    heading.append(number,title,types);
    const facts = document.createElement("div");
    facts.className = "pokedex-facts";
    [[(data.height / 10).toFixed(1) + " m","키"],[(data.weight / 10).toFixed(1) + " kg","몸무게"],[data.abilities.length + "개","특성"]].forEach(([value,label]) => {
      const item = document.createElement("span");
      const strong = document.createElement("b");
      strong.textContent = value;
      item.append(strong,label);
      facts.append(item);
    });
    const description = document.createElement("p");
    description.className = "pokedex-description";
    description.textContent = flavor;
    detail.append(typeArtwork,image,heading,facts,description);
  } catch {
    detail.replaceChildren();
    const fallback = document.createElement("p");
    fallback.textContent = "인터넷 연결이 원활하지 않아 상세 정보를 불러오지 못했어요. 잠시 후 다시 선택해 주세요.";
    detail.append(fallback);
  }
}

function reportMetric(value: string, label: string): HTMLElement {
  const card = document.createElement("div");
  card.className = "report-metric";
  const strong = document.createElement("strong");
  strong.textContent = value;
  const text = document.createElement("span");
  text.textContent = label;
  card.append(strong,text);
  return card;
}

function openReport(): void {
  cleanupGame();
  setActiveNav("report");
  const records = readRecords();
  const recent = records.filter((record) => record.timestamp >= Date.now() - 7 * 86400000);
  const stars = getLifetimeStars();
  const summary = byId("reportSummary");
  summary.replaceChildren(
    reportMetric(String(records.length),"전체 플레이"),
    reportMetric(String(recent.length),"최근 7일"),
    reportMetric(String(stars),"모은 별"),
    reportMetric(String(discoveredPokemonCount()),"발견 포켓몬")
  );
  const categories: ModeMeta["category"][] = ["암산·수 연산","도형·공간","지식탐험","미니게임"];
  const bars = byId("reportBars");
  bars.replaceChildren();
  let weakest = categories[0] as ModeMeta["category"];
  let weakestAverage = Number.POSITIVE_INFINITY;
  categories.forEach((category) => {
    const rows = records.filter((record) => MODES[record.mode].category === category);
    const average = rows.length ? rows.reduce((sum,row) => sum + row.stars,0) / (rows.length * 3) * 100 : 0;
    if (average < weakestAverage) { weakestAverage = average; weakest = category; }
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
    row.append(label,track,value);
    bars.append(row);
  });
  const advice = byId("reportAdvice");
  advice.replaceChildren();
  const title = document.createElement("strong");
  const copy = document.createElement("p");
  if (!records.length) {
    title.textContent = "첫 탐험을 시작해 보세요";
    copy.textContent = "오늘의 10분 탐험을 완료하면 영역별 성장 기록이 나타나요.";
  } else {
    title.textContent = weakest + " 영역을 연습해 볼까요?";
    copy.textContent = "낮은 점수는 부족함이 아니라 다음에 성장할 위치를 알려 주는 지도예요.";
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary-button";
  button.textContent = "오늘의 탐험으로 연습하기";
  button.addEventListener("click",openToday);
  advice.append(title,copy,button);
  showScreen("report");
}

function selectMode(mode: Mode): void {
  state.mode = mode;
  if (state.grade === null) {
    openGrades();
    return;
  }
  state.diff = "easy";
  startSelectedGame();
}

function difficultyForProgress(progress: number): Difficulty {
  if (progress < 1 / 3) return "easy";
  if (progress < 2 / 3) return "normal";
  return "hard";
}

function difficultyForElapsed(started: number, durationSeconds: number): Difficulty {
  return difficultyForProgress(Math.min(1, ((performance.now() - started) / 1000) / durationSeconds));
}

function randomOperationProblem(grade: number, diff: Difficulty): Problem {
  const level = diff === "easy" ? 0 : diff === "normal" ? 1 : 2;
  if (grade === 0) {
    if (Math.random() < .55) {
      const a = randomInt(1, 5 + level * 2);
      const b = randomInt(1, Math.max(1, 10 - a));
      return {display:a + " + " + b, answer:a + b};
    }
    const a = randomInt(3, 10);
    const b = randomInt(1, a);
    return {display:a + " - " + b, answer:a - b};
  }
  if (grade === 1) {
    if (Math.random() < .5) {
      const a = randomInt(2, 10 + level * 6);
      const b = randomInt(1, 9);
      return {display:a + " + " + b, answer:a + b};
    }
    const a = randomInt(8, 20 + level * 5);
    const b = randomInt(1, a);
    return {display:a + " - " + b, answer:a - b};
  }
  if (grade === 2) {
    const roll = Math.random();
    if (roll < .36) {
      const a = randomInt(12, 70 + level * 100);
      const b = randomInt(10, 40 + level * 80);
      return {display:a + " + " + b, answer:a + b};
    }
    if (roll < .7) {
      const a = randomInt(35, 99 + level * 200);
      const b = randomInt(10, a);
      return {display:a + " - " + b, answer:a - b};
    }
    const a = randomInt(2, 5 + level * 2);
    const b = randomInt(2, 9);
    return {display:a + " × " + b, answer:a * b};
  }
  if (grade === 3 || grade === 4) {
    const maxA = grade === 3 ? 49 + level * 50 : 199 + level * 300;
    if (Math.random() < .55) {
      const a = randomInt(11, maxA);
      const b = randomInt(2, grade === 3 ? 9 + level * 10 : 12 + level * 25);
      return {display:a + " × " + b, answer:a * b};
    }
    const divisor = randomInt(2, grade === 3 ? 9 : 25 + level * 20);
    const quotient = randomInt(2, grade === 3 ? 30 + level * 30 : 60 + level * 90);
    return {display:(divisor * quotient) + " ÷ " + divisor, answer:quotient};
  }
  const a = randomInt(3, 20 + level * 20);
  const b = randomInt(2, 12 + level * 12);
  const c = randomInt(2, 9 + level * 5);
  if (grade === 5) {
    if (Math.random() < .5) return {display:"(" + a + " + " + b + ") × " + c, answer:(a + b) * c};
    return {display:(a * c) + " ÷ " + c + " + " + b, answer:a + b};
  }
  if (Math.random() < .5) return {display:a + " × " + b + " - " + c, answer:a * b - c};
  return {display:"(" + a + " + " + b + ") × " + c + " - " + b, answer:(a + b) * c - b};
}

function newProblem(difficulty: Difficulty = "easy"): Problem {
  return randomOperationProblem(state.grade ?? 0, difficulty);
}

function choicesFor(answer: number): number[] {
  const spread = answer < 20 ? 5 : answer < 100 ? 12 : answer < 1000 ? 45 : 150;
  const values = new Set<number>([answer]);
  while (values.size < 4) {
    const candidate = answer + randomInt(-spread, spread);
    if (candidate >= 0) values.add(candidate);
  }
  return shuffle(Array.from(values));
}

function startSelectedGame(): void {
  if (state.grade === null || state.mode === null) {
    openGrades();
    return;
  }
  cleanupGame();
  state.diff = "easy";
  saveLastPlay();
  startMusic();
  playPokemonCry(MODE_MASCOTS[state.mode],.16);
  pokemonSparkBurst(12);
  if (state.mode === "quiz") startQuiz();
  if (state.mode === "rain") {
    replaceWithTrainer(byId("rainTrainer"),"misty.png","이슬이");
    startRain();
  }
  if (state.mode === "mole") startMole();
  if (state.mode === "memory") startMemory();
  if (state.mode === "ox") startOx();
  if (state.mode === "balloon") startBalloon();
  if (state.mode === "space") {
    const spaceMascot = byId("spaceTrainer");
    const rowlet = document.createElement("img");
    rowlet.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png";
    rowlet.alt = "나몰빼미";
    rowlet.loading = "eager";
    spaceMascot.replaceChildren(rowlet);
    startSpace();
  }
  if (state.mode === "mine") startMine();
  if (state.mode === "knowledge") startKnowledge();
  if (state.mode === "symmetry") startSymmetry();
  if (state.mode === "coordinate") startCoordinate();
  if (state.mode === "history") startHistory();
  if (state.mode === "safety") startSafety();
  if (state.mode === "snack") startSnack();
}

function keypad(onNumber: (value:string) => void, onDelete: () => void, onEnter: () => void): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "keypad";
  ["1","2","3","4","5","6","7","8","9"].forEach((value) => {
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
  remove.setAttribute("aria-label","한 글자 지우기");
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

interface QuizState {
  index:number; score:number; correct:number; streak:number; best:number;
  input:string; locked:boolean; started:number; questionStarted:number;
  current:Problem | null; choiceMode:boolean; results:Array<"c"|"w">; timer:number | null;
}

let quiz: QuizState | null = null;

function stopQuiz(): void {
  if (quiz?.timer !== null && quiz?.timer !== undefined) window.clearInterval(quiz.timer);
  if (quiz) quiz.timer = null;
}

function startQuiz(): void {
  quiz = {index:0,score:0,correct:0,streak:0,best:0,input:"",locked:false,started:Date.now(),questionStarted:Date.now(),current:null,choiceMode:false,results:[],timer:null};
  replaceWithPokemon(byId("quizMascot"), 25);
  showScreen("quiz");
  quiz.timer = window.setInterval(updateQuizTimer, 500);
  nextQuizQuestion();
}

function updateQuizTimer(): void {
  if (!quiz) return;
  const seconds = Math.floor((Date.now() - quiz.started) / 1000);
  byId("quizTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2,"0");
  if (seconds >= MAX_GAME_SECONDS) finishQuiz();
}

function renderQuizDots(): void {
  if (!quiz) return;
  const dots = byId("quizDots");
  dots.replaceChildren();
  for (let index = 0; index < 10; index += 1) {
    const dot = document.createElement("span");
    dot.className = "quiz-dot";
    if (quiz.results[index] === "c") dot.classList.add("correct");
    if (quiz.results[index] === "w") dot.classList.add("wrong");
    if (index === quiz.index) dot.classList.add("current");
    dots.append(dot);
  }
}

function nextQuizQuestion(): void {
  if (!quiz) return;
  if (quiz.index >= 10) {
    finishQuiz();
    return;
  }
  quiz.current = newProblem(difficultyForProgress(quiz.index / 9));
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
  byId("quizCount").textContent = "문제 " + (quiz.index + 1) + "/10";
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
  } else {
    controls.append(keypad(
      (value) => {
        if (!quiz || quiz.locked || quiz.input.length >= 7) return;
        quiz.input += value;
        byId("quizAnswer").textContent = quiz.input;
        tapSound();
      },
      () => {
        if (!quiz || quiz.locked) return;
        quiz.input = quiz.input.slice(0,-1);
        byId("quizAnswer").textContent = quiz.input || "?";
      },
      () => {
        if (!quiz || !quiz.input) return;
        answerQuiz(Number(quiz.input), null);
      }
    ));
  }
}

function renderQuizCharge(): void {
  if (!quiz) return;
  const charge = Math.min(5,quiz.streak);
  (byId("quizChargeBar") as HTMLElement).style.width = `${charge * 20}%`;
  byId("quizChargeText").textContent = charge >= 5 ? "MAX!" : `${charge} / 5`;
  document.querySelector("#screen-quiz .problem-card")?.classList.toggle("charged",charge >= 5);
}

function answerQuiz(value: number, selected: HTMLButtonElement | null): void {
  if (!quiz || quiz.locked || !quiz.current) return;
  quiz.locked = true;
  const correct = value === quiz.current.answer;
  const answer = byId("quizAnswer");
  if (correct) {
    const seconds = (Date.now() - quiz.questionStarted) / 1000;
    const gained = 100 + (seconds < 7 ? 30 : 0) + quiz.streak * 10;
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
    if (selected) selected.classList.add("correct");
    correctSound();
  } else {
    quiz.streak = 0;
    quiz.results[quiz.index] = "w";
    answer.classList.add("wrong");
    answer.textContent = String(value);
    byId("quizFeedback").textContent = "정답은 " + quiz.current.answer + "예요.";
    if (selected) selected.classList.add("wrong");
    wrongSound();
  }
  renderQuizDots();
  window.setTimeout(() => {
    if (!quiz) return;
    quiz.index += 1;
    nextQuizQuestion();
  }, correct ? 850 : 1350);
}

function finishQuiz(): void {
  if (!quiz || state.grade === null) return;
  const game = quiz;
  stopQuiz();
  quiz = null;
  const accuracy = Math.round(game.correct / 10 * 100);
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"quiz",grade:state.grade,diff:state.diff,score:game.score,stars,detail:game.correct + "/10 · " + accuracy + "%",timestamp:Date.now()});
  showResult(stars,"피카츄 암산퀴즈 완료",accuracy + "%를 맞혔어요.",[[String(game.score),"점수"],[accuracy + "%","정답률"],[game.correct + "/10","정답"],[String(game.best),"최고 연속"]]);
}

interface RainDrop {
  element:HTMLElement; answer:number; y:number; heal:boolean; warning:boolean;
}

interface RainState {
  running:boolean; finished:boolean; hp:number; score:number; popped:number; input:string;
  drops:RainDrop[]; speed:number; gap:number; maxDrops:number; started:number; lastFrame:number;
  lastSpawn:number; raf:number; wave:number;
}

let rain: RainState | null = null;

const RAIN_CONFIG: Record<Difficulty,{speed:number;gap:number;max:number}> = {
  easy:{speed:.045,gap:3400,max:2},
  normal:{speed:.06,gap:2900,max:3},
  hard:{speed:.075,gap:2400,max:4}
};

function stopRain(): void {
  if (!rain) return;
  rain.running = false;
  if (rain.raf) cancelAnimationFrame(rain.raf);
}

function startRain(): void {
  const config = RAIN_CONFIG[state.diff];
  rain = {
    running:true,finished:false,hp:5,score:0,popped:0,input:"",drops:[],
    speed:config.speed,gap:config.gap,maxDrops:config.max,started:performance.now(),
    lastFrame:performance.now(),lastSpawn:performance.now() - config.gap,raf:0,wave:1
  };
  byId("rainField").querySelectorAll(".rain-drop").forEach((drop) => drop.remove());
  const rainPad = keypad(rainNumber,rainDelete,rainSubmit);
  byId("rainKeypad").replaceChildren(...Array.from(rainPad.childNodes));
  renderRainHud();
  showScreen("rain");
  rain.raf = requestAnimationFrame(rainFrame);
}

function rainFrame(now: number): void {
  if (!rain || !rain.running) return;
  let delta = (now - rain.lastFrame) / 1000;
  rain.lastFrame = now;
  delta = Math.min(delta,.1);
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
  if (now - rain.lastSpawn >= currentGap && rain.drops.length < phaseConfig.max) {
    spawnRainDrop();
    rain.lastSpawn = now;
  }
  const field = byId("rainField");
  const height = field.clientHeight;
  const velocity = height * phaseConfig.speed * multiplier;
  for (let index = rain.drops.length - 1; index >= 0; index -= 1) {
    const drop = rain.drops[index] as RainDrop;
    drop.y += velocity * delta;
    drop.element.style.top = drop.y + "px";
    if (!drop.warning && drop.y > height * .72) {
      drop.warning = true;
      drop.element.classList.add("warning");
    }
    if (drop.y + drop.element.offsetHeight >= height - 20) {
      drop.element.remove();
      rain.drops.splice(index,1);
      if (!drop.heal) loseRainHp();
      if (!rain.running) break;
    }
  }
  byId("rainSpeed").textContent = multiplier.toFixed(1);
  renderRainHud();
  if (rain.running) rain.raf = requestAnimationFrame(rainFrame);
}

function spawnRainDrop(): void {
  if (!rain) return;
  const field = byId("rainField");
  const problem = newProblem(difficultyForElapsed(rain.started,MAX_GAME_SECONDS));
  const heal = rain.hp < 5 && Math.random() < .14;
  const drop = document.createElement("div");
  drop.className = "rain-drop" + (heal ? " heal" : "");
  drop.textContent = (heal ? "회복 · " : "") + problem.display + " = ?";
  const width = field.clientWidth;
  drop.style.left = randomInt(80, Math.max(85,width - 80)) + "px";
  drop.style.top = "-60px";
  field.append(drop);
  rain.drops.push({element:drop,answer:problem.answer,y:-60,heal,warning:false});
}

function loseRainHp(): void {
  if (!rain || rain.finished) return;
  rain.hp -= 1;
  wrongSound();
  renderRainHud();
  if (rain.hp <= 0) finishRain();
}

function rainNumber(value: string): void {
  if (!rain?.running || rain.input.length >= 7) return;
  rain.input += value;
  renderRainHud();
}

function rainDelete(): void {
  if (!rain?.running) return;
  rain.input = rain.input.slice(0,-1);
  renderRainHud();
}

function rainSubmit(): void {
  if (!rain?.running || !rain.input) return;
  const value = Number(rain.input);
  let targetIndex = -1;
  let lowest = -Infinity;
  rain.drops.forEach((drop,index) => {
    if (drop.answer === value && drop.y > lowest) {
      targetIndex = index;
      lowest = drop.y;
    }
  });
  if (targetIndex >= 0) {
    const drop = rain.drops[targetIndex] as RainDrop;
    rain.drops.splice(targetIndex,1);
    drop.element.classList.add("pop");
    window.setTimeout(() => drop.element.remove(),250);
    rain.score += 100;
    rain.popped += 1;
    if (drop.heal) rain.hp = Math.min(5,rain.hp + 1);
    correctSound();
  } else {
    wrongSound();
    showToast("같은 답의 문제가 아직 없어요.");
  }
  rain.input = "";
  renderRainHud();
}

function renderRainHud(): void {
  if (!rain) return;
  byId("rainHp").textContent = "❤️".repeat(Math.max(0,rain.hp)) + "🤍".repeat(Math.max(0,5-rain.hp));
  byId("rainScore").textContent = String(rain.score);
  byId("rainWave").textContent = String(rain.wave);
  byId("rainInput").textContent = rain.input || "?";
}

function finishRain(): void {
  if (!rain || rain.finished || state.grade === null) return;
  rain.finished = true;
  rain.running = false;
  if (rain.raf) cancelAnimationFrame(rain.raf);
  const game = rain;
  const seconds = Math.floor((performance.now() - game.started) / 1000);
  const stars = game.popped >= 18 ? 3 : game.popped >= 10 ? 2 : game.popped >= 4 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"rain",grade:state.grade,diff:state.diff,score:game.score,stars,detail:game.popped + "개 · " + seconds + "초",timestamp:Date.now()});
  showResult(stars,"잉어킹 산성비 챌린지 완료",game.popped + "개의 문제를 막았어요.",[[String(game.score),"점수"],[String(game.popped),"해결"],[seconds + "초","생존"],[String(game.wave),"단계"]]);
}

interface MoleHole {
  button:HTMLButtonElement; number:HTMLElement; active:boolean; value:number; bonus:boolean; timeout:number | null;
}

interface MoleState {
  running:boolean;score:number;combo:number;best:number;hits:number;bonusHits:number;time:number;
  target:Problem;holes:MoleHole[];spawnTimer:number | null;countdown:number | null;started:number;
}

let mole: MoleState | null = null;
const MOLE_CONFIG: Record<Difficulty,{up:number;gap:number;max:number}> = {
  easy:{up:1800,gap:1150,max:2},normal:{up:1500,gap:900,max:3},hard:{up:1200,gap:720,max:4}
};

function stopMole(): void {
  if (!mole) return;
  mole.running = false;
  if (mole.spawnTimer !== null) window.clearTimeout(mole.spawnTimer);
  if (mole.countdown !== null) window.clearInterval(mole.countdown);
  mole.holes.forEach((hole) => {
    if (hole.timeout !== null) window.clearTimeout(hole.timeout);
  });
}

function startMole(): void {
  const config = MOLE_CONFIG[state.diff];
  mole = {running:true,score:0,combo:0,best:0,hits:0,bonusHits:0,time:60,target:newProblem("easy"),holes:[],spawnTimer:null,countdown:null,started:performance.now()};
  const grid = byId("moleGrid");
  grid.replaceChildren();
  for (let index = 0; index < 9; index += 1) {
    const holeElement = document.createElement("div");
    holeElement.className = "mole-hole";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mole-button";
    button.setAttribute("aria-label","디그다");
    button.append(pokemonMedia({id:50,name:"디그다"}));
    const number = document.createElement("span");
    number.className = "mole-number";
    button.append(number);
    button.addEventListener("click", () => hitMole(index));
    holeElement.append(button);
    grid.append(holeElement);
    mole.holes.push({button,number,active:false,value:0,bonus:false,timeout:null});
  }
  renderMoleHud();
  showScreen("mole");
  mole.countdown = window.setInterval(moleTick,1000);
  scheduleMole();
}

function moleSpeedFactor(): number {
  if (!mole) return 1;
  const elapsed = (performance.now() - mole.started) / 1000;
  return Math.max(.72,1 - elapsed / 180);
}

function scheduleMole(): void {
  if (!mole?.running) return;
  const config = MOLE_CONFIG[difficultyForElapsed(mole.started,60)];
  mole.spawnTimer = window.setTimeout(() => {
    spawnMole();
    scheduleMole();
  }, config.gap * moleSpeedFactor());
}

function spawnMole(): void {
  if (!mole?.running) return;
  const config = MOLE_CONFIG[difficultyForElapsed(mole.started,60)];
  if (mole.holes.filter((hole) => hole.active).length >= config.max) return;
  const free = mole.holes.map((hole,index) => hole.active ? -1 : index).filter((index) => index >= 0);
  if (!free.length) return;
  const index = choose(free);
  const hole = mole.holes[index] as MoleHole;
  const correct = Math.random() < .42;
  const bonus = correct && Math.random() < .1;
  hole.bonus = bonus;
  hole.button.classList.toggle("bonus",bonus);
  hole.button.setAttribute("aria-label",bonus ? "보너스 두트리오" : "디그다");
  hole.button.replaceChildren(pokemonMedia({id:bonus ? 51 : 50,name:bonus ? "두트리오" : "디그다"}),hole.number);
  const wrongOptions = choicesFor(mole.target.answer).filter((value) => value !== mole?.target.answer);
  hole.value = correct ? mole.target.answer : choose(wrongOptions);
  hole.number.textContent = String(hole.value);
  hole.active = true;
  hole.button.classList.add("up");
  hole.timeout = window.setTimeout(() => hideMole(index), config.up * moleSpeedFactor());
}

function hideMole(index: number): void {
  if (!mole) return;
  const hole = mole.holes[index];
  if (!hole) return;
  hole.active = false;
  hole.button.classList.remove("up","hit","miss");
  hole.button.disabled = false;
  hole.button.parentElement?.classList.remove("hit-success","bonus-success");
  if (hole.timeout !== null) window.clearTimeout(hole.timeout);
  hole.timeout = null;
}

function showMoleSuccess(index: number,gained: number,bonus: boolean,combo: number): void {
  if (!mole) return;
  const hole = mole.holes[index];
  if (!hole) return;
  const screen = byId("screen-mole");
  const celebration = byId("moleCelebration");
  const scorePop = document.createElement("span");
  scorePop.className = "mole-score-pop" + (bonus ? " bonus" : "");
  scorePop.textContent = "+" + gained;
  hole.button.parentElement?.append(scorePop);
  hole.button.parentElement?.classList.add("hit-success");
  if (bonus) hole.button.parentElement?.classList.add("bonus-success");
  celebration.className = "mole-celebration show" + (bonus ? " bonus" : "");
  celebration.innerHTML = "<strong>" + (bonus ? "두트리오 대성공!" : "정답!") + "</strong><span>+" + gained + "점" + (combo >= 2 ? " · " + combo + "연속" : "") + "</span>";
  screen.classList.remove("mole-correct-flash","mole-bonus-flash");
  void screen.offsetWidth;
  screen.classList.add(bonus ? "mole-bonus-flash" : "mole-correct-flash");
  pokemonSparkBurst(bonus ? 32 : 20);
  if (navigator.vibrate) navigator.vibrate(bonus ? [45,35,80] : 45);
  window.setTimeout(() => {
    scorePop.remove();
    celebration.classList.remove("show","bonus");
    screen.classList.remove("mole-correct-flash","mole-bonus-flash");
  },bonus ? 1000 : 760);
}

function clearActiveMoles(): void {
  if (!mole) return;
  mole.holes.forEach((_hole,index) => hideMole(index));
}

function hitMole(index: number): void {
  if (!mole?.running) return;
  const hole = mole.holes[index];
  if (!hole?.active) return;
  if (hole.value === mole.target.answer) {
    hole.button.classList.add("hit");
    const gained = hole.bonus ? 500 + mole.combo * 25 : 100 + mole.combo * 10;
    mole.score += gained;
    if (hole.bonus) mole.bonusHits += 1;
    mole.combo += 1;
    mole.best = Math.max(mole.best,mole.combo);
    mole.hits += 1;
    correctSound();
    showMoleSuccess(index,gained,hole.bonus,mole.combo);
    const currentGame = mole;
    mole.holes.forEach((_other,holeIndex) => { if (holeIndex !== index) hideMole(holeIndex); });
    hole.active = false;
    hole.button.disabled = true;
    if (hole.timeout !== null) window.clearTimeout(hole.timeout);
    hole.timeout = window.setTimeout(() => {
      if (mole !== currentGame) return;
      hideMole(index);
    },hole.bonus ? 900 : 620);
    mole.target = newProblem(difficultyForElapsed(mole.started,60));
  } else {
    hole.button.classList.add("miss");
    mole.combo = 0;
    mole.time = Math.max(0,mole.time - 2);
    wrongSound();
    hideMole(index);
    if (mole.time <= 0) {
      finishMole();
      return;
    }
  }
  renderMoleHud();
}

function moleTick(): void {
  if (!mole?.running) return;
  mole.time = Math.max(0,mole.time - 1);
  renderMoleHud();
  if (mole.time <= 0) finishMole();
}

function renderMoleHud(): void {
  if (!mole) return;
  byId("moleTarget").textContent = mole.target.display;
  byId("moleScore").textContent = String(mole.score);
  byId("moleTime").textContent = String(mole.time);
  byId("moleCombo").textContent = String(mole.combo);
}

function finishMole(): void {
  if (!mole?.running || state.grade === null) return;
  const game = mole;
  stopMole();
  const stars = game.hits >= 24 ? 3 : game.hits >= 14 ? 2 : game.hits >= 6 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"mole",grade:state.grade,diff:state.diff,score:game.score,stars,detail:game.hits + "마리",timestamp:Date.now()});
  showResult(stars,"디그다 찾기 완료",game.hits + "번 정답을 찾았어요.",[[String(game.score),"점수"],[String(game.hits),"명중"],[String(game.bonusHits),"두트리오 보너스"],[String(game.best),"최고 연속"]]);
}

interface MemoryCardData {
  key:number; pokemon:Pokemon; matched:boolean; element:HTMLButtonElement;
}

interface MemoryState {
  running:boolean;session:number;cards:MemoryCardData[];first:number | null;locked:boolean;
  moves:number;matched:number;totalMatched:number;pairs:number;round:number;score:number;combo:number;bestCombo:number;started:number;pool:Pokemon[];timeouts:Set<number>;countdown:number | null;
}

let memory: MemoryState | null = null;
let memorySession = 0;
const MEMORY_POKEMON_IDS = [25,133,4,7,1,151,143,37,54,129,131,132,39,52,79,92,147] as const;

function stopMemory(): void {
  memorySession += 1;
  if (!memory) return;
  memory.running = false;
  memory.timeouts.forEach((timer) => window.clearTimeout(timer));
  memory.timeouts.clear();
  if (memory.countdown !== null) window.clearInterval(memory.countdown);
  memory = null;
}

function memoryDelay(callback: () => void, delay: number): void {
  if (!memory) return;
  const game = memory;
  const session = game.session;
  const timer = window.setTimeout(() => {
    game.timeouts.delete(timer);
    if (!memory || !memory.running || memory.session !== session) return;
    callback();
  },delay);
  game.timeouts.add(timer);
}

function startMemory(): void {
  const session = ++memorySession;
  const pool = shuffle(MEMORY_POKEMON_IDS.map((id) => pokemonById(id)));
  memory = {running:true,session,cards:[],first:null,locked:false,moves:0,matched:0,totalMatched:0,pairs:3,round:0,score:0,combo:0,bestCombo:0,started:performance.now(),pool,timeouts:new Set(),countdown:null};
  replaceWithPokemon(byId("memoryMascot"),132);
  buildMemoryRound(0);
  renderMemoryHud();
  showScreen("memory");
  memory.countdown = window.setInterval(() => {
    if (!memory?.running) return;
    renderMemoryHud();
    if ((performance.now() - memory.started) / 1000 >= MAX_GAME_SECONDS) finishMemory(true);
  },1000);
}

function buildMemoryRound(round: number): void {
  if (!memory?.running) return;
  const configs: Array<{pairs:number;columns:number;difficulty:Difficulty;offset:number}> = [
    {pairs:3,columns:3,difficulty:"easy",offset:0},
    {pairs:6,columns:4,difficulty:"normal",offset:3},
    {pairs:8,columns:4,difficulty:"hard",offset:9}
  ];
  const config = configs[round] as {pairs:number;columns:number;difficulty:Difficulty;offset:number};
  memory.round = round;
  memory.pairs = config.pairs;
  memory.matched = 0;
  memory.first = null;
  memory.locked = false;
  memory.cards = [];
  byId("memoryRound").textContent = `${round + 1}단계 변신`;
  byId("memoryStatus").textContent = round === 0 ? "먼저 카드를 보고 메타몽의 변신 위치를 기억해요." : `${config.pairs}가지 포켓몬으로 변신했어요. 같은 짝을 찾아요!`;
  const roundPokemon = memory.pool.slice(config.offset,config.offset + config.pairs);
  const rawCards: Array<{key:number;pokemon:Pokemon}> = [];
  roundPokemon.forEach((pokemon,index) => {
    rawCards.push({key:index,pokemon});
    rawCards.push({key:index,pokemon});
  });
  const grid = byId("memoryGrid");
  grid.style.gridTemplateColumns = "repeat(" + config.columns + ",1fr)";
  grid.replaceChildren();
  shuffle(rawCards).forEach((card,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.setAttribute("aria-label","뒤집지 않은 카드");
    button.addEventListener("click", () => flipMemoryCard(index));
    grid.append(button);
    memory?.cards.push({key:card.key,pokemon:card.pokemon,matched:false,element:button});
  });
  memory.locked = true;
  memory.cards.forEach((card) => {
    card.element.classList.add("flipped","preview");
    revealMemoryCard(card);
  });
  showToast("포켓몬의 위치를 기억하세요!");
  memoryDelay(() => {
    if (!memory) return;
    memory.cards.forEach((card) => {
      card.element.classList.remove("flipped","preview");
      concealMemoryCard(card);
    });
    memory.locked = false;
    showToast((round + 1) + "단계 · 짝을 찾아보세요!");
  },round === 0 ? 1800 : round === 1 ? 1500 : 1250);
  renderMemoryHud();
}

function revealMemoryCard(card: MemoryCardData): void {
  const name = document.createElement("span");
  name.className = "memory-name";
  name.textContent = card.pokemon.name;
  card.element.replaceChildren(pokemonMedia(card.pokemon),name);
  card.element.setAttribute("aria-label",card.pokemon.name);
}

function concealMemoryCard(card: MemoryCardData): void {
  card.element.replaceChildren();
  card.element.setAttribute("aria-label","뒤집지 않은 카드");
}

function flipMemoryCard(index: number): void {
  if (!memory?.running || memory.locked) return;
  const card = memory.cards[index];
  if (!card || card.matched || card.element.classList.contains("flipped")) return;
  card.element.classList.add("flipped");
  revealMemoryCard(card);
  if (memory.first === null) {
    memory.first = index;
    return;
  }
  const firstIndex = memory.first;
  const first = memory.cards[firstIndex] as MemoryCardData;
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
    memory.bestCombo = Math.max(memory.bestCombo,memory.combo);
    const transformBonus = memory.combo % 3 === 0;
    memory.score += 100 + memory.combo * 20 + (transformBonus ? 150 : 0);
    byId("memoryStatus").textContent = transformBonus ? "메타몽 변신 보너스! 3연속 매치 +150" : `${card.pokemon.name} 변신 성공! 다음 짝도 이어서 찾아요.`;
    correctSound();
    playPokemonCry(card.pokemon.id,.13);
    pokemonSparkBurst(7);
    if (transformBonus) playPokemonCry(132,.15);
    renderMemoryHud();
    if (memory.matched >= memory.pairs) {
      if (memory.round < 2) memoryDelay(() => buildMemoryRound((memory?.round ?? 0) + 1),650);
      else memoryDelay(finishMemory,500);
    }
  } else {
    memory.locked = true;
    memory.combo = 0;
    byId("memoryStatus").textContent = "서로 다른 변신이에요. 두 카드의 위치를 기억해요!";
    first.element.classList.add("mismatch");
    card.element.classList.add("mismatch");
    wrongSound();
    memoryDelay(() => {
      first.element.classList.remove("mismatch");
      card.element.classList.remove("mismatch");
      first.element.classList.remove("flipped");
      card.element.classList.remove("flipped");
      concealMemoryCard(first);
      concealMemoryCard(card);
      if (memory) memory.locked = false;
    },850);
    renderMemoryHud();
  }
}

function renderMemoryHud(): void {
  if (!memory) return;
  byId("memoryScore").textContent = String(memory.score);
  byId("memoryMoves").textContent = String(memory.moves);
  byId("memoryMatched").textContent = String(memory.totalMatched);
  byId("memoryTotal").textContent = "17";
  byId("memoryCombo").textContent = String(memory.combo);
  (byId("memoryTransformBar") as HTMLElement).style.width = `${memory.totalMatched / 17 * 100}%`;
  byId("memoryTransformText").textContent = `${memory.totalMatched} / 17`;
  const remaining = Math.max(0,MAX_GAME_SECONDS - Math.floor((performance.now() - memory.started) / 1000));
  byId("memoryTime").textContent = Math.floor(remaining / 60) + ":" + String(remaining % 60).padStart(2,"0");
}

function finishMemory(timedOut = false): void {
  if (!memory?.running || state.grade === null) return;
  const game = memory;
  const seconds = Math.floor((performance.now() - game.started) / 1000);
  const ratio = game.pairs / Math.max(1,game.moves);
  const completion = game.totalMatched / 17;
  const stars = timedOut ? (completion >= .75 ? 2 : completion >= .4 ? 1 : 0) : ratio >= .7 ? 3 : ratio >= .5 ? 2 : ratio >= .34 ? 1 : 0;
  stopMemory();
  saveRecord({name:getName() || "친구",mode:"memory",grade:state.grade,diff:state.diff,score:game.score + stars * 100,stars,detail:game.totalMatched + "/17쌍 · " + game.moves + "번",timestamp:Date.now()});
  showResult(stars,timedOut ? "메타몽 변신 도전 완료" : "메타몽 메모리 완성!",timedOut ? game.totalMatched + "쌍의 변신을 찾았어요." : "메타몽의 포켓몬 변신 17쌍을 모두 찾았어요!",[[String(game.score + stars * 100),"점수"],[String(game.moves),"뒤집기"],[String(game.bestCombo),"최고 연속"],[game.totalMatched + "/17","변신 완성"]]);
}

interface OxState {
  running:boolean;score:number;combo:number;best:number;correct:number;time:number;
  current:{problem:Problem;shown:number;truth:boolean};countdown:number | null;nextTimer:number | null;
}

let ox: OxState | null = null;

function stopOx(): void {
  if (!ox) return;
  ox.running = false;
  if (ox.countdown !== null) window.clearInterval(ox.countdown);
  if (ox.nextTimer !== null) window.clearTimeout(ox.nextTimer);
}

function startOx(): void {
  ox = {running:true,score:0,combo:0,best:0,correct:0,time:60,current:{problem:newProblem("easy"),shown:0,truth:false},countdown:null,nextTimer:null};
  replaceWithPokemon(byId("oxPsyduck"),54);
  nextOx();
  renderOxHud();
  showScreen("ox");
  ox.countdown = window.setInterval(() => {
    if (!ox?.running) return;
    ox.time = Math.max(0,ox.time - 1);
    renderOxHud();
    if (ox.time <= 0) finishOx();
  },1000);
}

function nextOx(): void {
  if (!ox?.running) return;
  const problem = newProblem(difficultyForElapsed(performance.now() - (60 - ox.time) * 1000,60));
  const truth = Math.random() < .5;
  let shown = problem.answer;
  if (!truth) {
    const offset = choose([-10,-5,-2,-1,1,2,5,10]);
    shown = Math.max(0,problem.answer + offset);
    if (shown === problem.answer) shown += 1;
  }
  ox.current = {problem,shown,truth:shown === problem.answer};
  byId("oxProblem").textContent = problem.display + " = " + shown;
  byId("oxPsyduck").className = "ox-mascot thinking";
  byId("oxReaction").textContent = "고라파덕도 고민 중...";
  renderOxBoost();
}

function reactOx(correct: boolean): void {
  byId("oxPsyduck").className = "ox-mascot " + (correct ? "happy" : "confused");
  byId("oxReaction").textContent = correct ? "정답이야! 정말 멋져!" : "앗, 다시 생각해 보자!";
  const screen = byId("screen-ox");
  screen.classList.remove("correct-flash","wrong-flash");
  void screen.offsetWidth;
  screen.classList.add(correct ? "correct-flash" : "wrong-flash");
}

function renderOxBoost(): void {
  if (!ox) return;
  const remainder = ox.combo % 5;
  const ready = ox.combo > 0 && remainder === 0;
  const value = ready ? 5 : remainder;
  (byId("oxBoostBar") as HTMLElement).style.width = `${value * 20}%`;
  byId("oxBoostText").textContent = ready ? "보너스!" : `${value} / 5`;
  document.querySelector("#screen-ox .ox-boost")?.classList.toggle("ready",ready);
}

function answerOx(answer: boolean): void {
  if (!ox?.running || ox.nextTimer !== null) return;
  if (answer === ox.current.truth) {
    ox.combo += 1;
    const boost = ox.combo % 5 === 0;
    ox.score += 100 + (ox.combo - 1) * 10 + (boost ? 250 : 0);
    ox.best = Math.max(ox.best,ox.combo);
    ox.correct += 1;
    reactOx(true);
    renderOxBoost();
    if (boost) {
      byId("oxReaction").textContent = "판단 게이지 완성! 고라파덕 보너스 +250";
      pokemonSparkBurst(54);
      playPokemonCry(54);
    }
    correctSound();
  } else {
    ox.combo = 0;
    renderOxBoost();
    ox.time = Math.max(0,ox.time - 3);
    reactOx(false);
    wrongSound();
    if (ox.time <= 0) {
      renderOxHud();
      finishOx();
      return;
    }
  }
  renderOxHud();
  ox.nextTimer = window.setTimeout(() => {
    if (!ox?.running) return;
    ox.nextTimer = null;
    nextOx();
  },350);
}

function renderOxHud(): void {
  if (!ox) return;
  byId("oxScore").textContent = String(ox.score);
  byId("oxTime").textContent = String(ox.time);
  byId("oxCombo").textContent = String(ox.combo);
}

function finishOx(): void {
  if (!ox?.running || state.grade === null) return;
  const game = ox;
  stopOx();
  const stars = game.correct >= 20 ? 3 : game.correct >= 12 ? 2 : game.correct >= 6 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"ox",grade:state.grade,diff:state.diff,score:game.score,stars,detail:game.correct + "개",timestamp:Date.now()});
  showResult(stars,"고라파덕 참·거짓 OX 완료",game.correct + "개를 맞혔어요.",[[String(game.score),"점수"],[String(game.correct),"정답"],[String(game.best),"최고 연속"],["60초","시간"]]);
}

interface BalloonItem {
  element:HTMLButtonElement;value:number;y:number;bonus:boolean;
}

interface BalloonState {
  running:boolean;score:number;combo:number;best:number;popped:number;time:number;target:Problem;
  items:BalloonItem[];started:number;lastFrame:number;lastSpawn:number;raf:number;countdown:number | null;
}

let balloon: BalloonState | null = null;
const BALLOON_CONFIG: Record<Difficulty,{speed:number;gap:number;max:number}> = {
  easy:{speed:.055,gap:1700,max:4},normal:{speed:.075,gap:1400,max:5},hard:{speed:.095,gap:1150,max:6}
};

function stopBalloon(): void {
  if (!balloon) return;
  balloon.running = false;
  if (balloon.raf) cancelAnimationFrame(balloon.raf);
  if (balloon.countdown !== null) window.clearInterval(balloon.countdown);
}

function startBalloon(): void {
  balloon = {running:true,score:0,combo:0,best:0,popped:0,time:60,target:newProblem("easy"),items:[],started:performance.now(),lastFrame:performance.now(),lastSpawn:performance.now()-2000,raf:0,countdown:null};
  byId("balloonField").replaceChildren();
  byId("balloonFever").textContent = "0 / 8";
  byId("balloonField").classList.remove("fever");
  renderBalloonHud();
  showScreen("balloon");
  balloon.countdown = window.setInterval(() => {
    if (!balloon?.running) return;
    balloon.time = Math.max(0,balloon.time - 1);
    renderBalloonHud();
    if (balloon.time <= 0) finishBalloon();
  },1000);
  balloon.raf = requestAnimationFrame(balloonFrame);
}

function balloonFrame(now: number): void {
  if (!balloon?.running) return;
  let delta = (now - balloon.lastFrame) / 1000;
  balloon.lastFrame = now;
  delta = Math.min(delta,.1);
  const elapsed = (now - balloon.started) / 1000;
  const config = BALLOON_CONFIG[difficultyForProgress(elapsed / 60)];
  const multiplier = Math.min(2.4,1 + elapsed * .015 + balloon.popped * .004);
  const gap = Math.max(750,config.gap / (1 + elapsed * .012));
  if (now - balloon.lastSpawn >= gap && balloon.items.length < config.max) {
    spawnBalloon();
    balloon.lastSpawn = now;
  }
  const field = byId("balloonField");
  const velocity = field.clientHeight * config.speed * multiplier;
  for (let index = balloon.items.length - 1; index >= 0; index -= 1) {
    const item = balloon.items[index] as BalloonItem;
    item.y -= velocity * delta;
    item.element.style.top = item.y + "px";
    if (item.y < -120) {
      item.element.remove();
      balloon.items.splice(index,1);
    }
  }
  byId("balloonSpeed").textContent = multiplier.toFixed(1);
  balloon.raf = requestAnimationFrame(balloonFrame);
}

function spawnBalloon(): void {
  if (!balloon) return;
  const field = byId("balloonField");
  const correct = Math.random() < .42;
  const wrong = choicesFor(balloon.target.answer).filter((value) => value !== balloon?.target.answer);
  const value = correct ? balloon.target.answer : choose(wrong);
  const bonus = correct && Math.random() < .09;
  const element = document.createElement("button");
  element.type = "button";
  element.className = `balloon${bonus ? " bonus" : ""}`;
  element.style.setProperty("--balloon-accent",choose(["#ff6b7d","#f39a4b","#438fff","#24b47e","#8b6fe8","#2ba9c9"]));
  const balloonPokemon = bonus ? {id:40,name:"푸크린"} : {id:39,name:"푸린"};
  const artwork = pokemonMedia(balloonPokemon,"balloon-pokemon");
  artwork.setAttribute("aria-hidden","true");
  const number = document.createElement("span");
  number.className = "balloon-number";
  number.textContent = String(value);
  element.setAttribute("aria-label",balloonPokemon.name + "의 숫자 풍선 " + value + (bonus ? ", 보너스 500점" : ""));
  element.append(artwork,number);
  const sideMargin = bonus ? 82 : 70;
  element.style.left = randomInt(sideMargin,Math.max(sideMargin + 1,field.clientWidth - sideMargin)) + "px";
  element.style.top = field.clientHeight + "px";
  const item: BalloonItem = {element,value,y:field.clientHeight,bonus};
  element.addEventListener("click", () => popBalloon(item));
  field.append(element);
  balloon.items.push(item);
}

function popBalloon(item: BalloonItem): void {
  if (!balloon?.running) return;
  const index = balloon.items.indexOf(item);
  if (index < 0) return;
  const correctHit = item.value === balloon.target.answer;
  if (!correctHit) {
    byId("balloonFever").textContent = "0 / 8";
    byId("balloonField").classList.remove("fever");
  }
  if (correctHit) {
    balloonNoteBurst(item.element,item.bonus);
    balloon.items.splice(index,1);
    item.element.classList.add("pop");
    window.setTimeout(() => item.element.remove(),250);
    const nextCombo = balloon.combo + 1;
    const fever = nextCombo >= 8;
    const baseScore = item.bonus ? 500 : 100;
    balloon.score += (baseScore + balloon.combo * 10) * (fever ? 2 : 1);
    balloon.combo = nextCombo;
    byId("balloonFever").textContent = fever ? "FEVER x2" : `${nextCombo} / 8`;
    byId("balloonField").classList.toggle("fever",fever);
    if (item.bonus) playPokemonCry(40,.16);
    balloon.best = Math.max(balloon.best,balloon.combo);
    balloon.popped += 1;
    balloon.target = newProblem(difficultyForElapsed(balloon.started,60));
    correctSound();
  } else {
    balloon.combo = 0;
    wrongSound();
  }
  renderBalloonHud();
}

function balloonNoteBurst(origin: HTMLElement,bonus: boolean): void {
  const field = byId("balloonField");
  const fieldRect = field.getBoundingClientRect();
  const rect = origin.getBoundingClientRect();
  for (let index = 0; index < (bonus ? 9 : 5); index += 1) {
    const note = document.createElement("span");
    note.className = "balloon-note";
    note.textContent = index % 2 ? "♪" : "♫";
    note.style.left = `${rect.left - fieldRect.left + rect.width / 2}px`;
    note.style.top = `${rect.top - fieldRect.top + rect.height / 2}px`;
    note.style.setProperty("--note-x",`${(Math.random() - .5) * 150}px`);
    note.style.setProperty("--note-y",`${-55 - Math.random() * 120}px`);
    note.style.color = bonus ? "#f4b400" : ["#ef476f","#4d8dff","#8b5cf6"][index % 3];
    field.append(note);
    window.setTimeout(() => note.remove(),850);
  }
}

function renderBalloonHud(): void {
  if (!balloon) return;
  byId("balloonTarget").textContent = balloon.target.display;
  byId("balloonScore").textContent = String(balloon.score);
  byId("balloonTime").textContent = String(balloon.time);
  byId("balloonCombo").textContent = String(balloon.combo);
}

function finishBalloon(): void {
  if (!balloon?.running || state.grade === null) return;
  const game = balloon;
  stopBalloon();
  const stars = game.popped >= 22 ? 3 : game.popped >= 13 ? 2 : game.popped >= 6 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"balloon",grade:state.grade,diff:state.diff,score:game.score,stars,detail:game.popped + "개",timestamp:Date.now()});
  showResult(stars,"푸린 풍선 터뜨리기 완료",game.popped + "개의 정답 풍선을 터뜨렸어요.",[[String(game.score),"점수"],[String(game.popped),"정답"],[String(game.best),"최고 연속"],["60초","시간"]]);
}

type SpaceKind = "shape" | "rotation" | "blocks" | "net" | "pattern" | "mirror" | "topview";
type ShapeName = "circle" | "triangle" | "square" | "rectangle" | "diamond" | "trapezoid" | "pentagon" | "hexagon";

interface SpaceChoiceData {
  visual: HTMLElement | SVGElement;
  label: string;
  correct: boolean;
}

interface SpaceQuestion {
  kind: SpaceKind;
  title: string;
  instruction: string;
  target: HTMLElement;
  choices: SpaceChoiceData[];
}

interface SpaceState {
  running:boolean;locked:boolean;index:number;score:number;correct:number;streak:number;best:number;
  started:number;timer:number | null;nextTimer:number | null;current:SpaceQuestion | null;
}

let space: SpaceState | null = null;

const SHAPE_LABELS: Record<ShapeName,string> = {
  circle:"원",triangle:"삼각형",square:"정사각형",rectangle:"직사각형",
  diamond:"마름모",trapezoid:"사다리꼴",pentagon:"오각형",hexagon:"육각형"
};

const SHAPE_POINTS: Record<Exclude<ShapeName,"circle">,string> = {
  triangle:"60,8 112,92 8,92",
  square:"18,8 102,8 102,92 18,92",
  rectangle:"6,22 114,22 114,82 6,82",
  diamond:"60,5 112,50 60,95 8,50",
  trapezoid:"30,12 90,12 114,90 6,90",
  pentagon:"60,5 112,42 92,95 28,95 8,42",
  hexagon:"32,6 88,6 116,50 88,94 32,94 4,50"
};

function shapeSvg(shape: ShapeName, rotation: number, color: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 120 100");
  svg.setAttribute("class","shape-svg");
  svg.setAttribute("aria-label",SHAPE_LABELS[shape]);
  const gradientId = "shape-gradient-" + Math.random().toString(36).slice(2);
  const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
  const gradient = document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
  gradient.setAttribute("id",gradientId);
  gradient.setAttribute("x1","0");
  gradient.setAttribute("y1","0");
  gradient.setAttribute("x2","1");
  gradient.setAttribute("y2","1");
  [["0%","#ffffff",".72"],["32%",color,"1"],["100%",color,".76"]].forEach(([offset,stopColor,opacity]) => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg","stop");
    stop.setAttribute("offset",offset as string);
    stop.setAttribute("stop-color",stopColor as string);
    stop.setAttribute("stop-opacity",opacity as string);
    gradient.append(stop);
  });
  defs.append(gradient);
  const shadow = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
  shadow.setAttribute("cx","60");
  shadow.setAttribute("cy","94");
  shadow.setAttribute("rx","39");
  shadow.setAttribute("ry","4");
  shadow.setAttribute("fill","#26335f");
  shadow.setAttribute("opacity",".14");
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
  group.setAttribute("transform","rotate(" + rotation + " 60 50)");
  const node = shape === "circle"
    ? document.createElementNS("http://www.w3.org/2000/svg","circle")
    : document.createElementNS("http://www.w3.org/2000/svg","polygon");
  if (shape === "circle") {
    node.setAttribute("cx","60");
    node.setAttribute("cy","50");
    node.setAttribute("r","43");
  } else {
    node.setAttribute("points",SHAPE_POINTS[shape]);
  }
  node.setAttribute("fill","url(#" + gradientId + ")");
  node.setAttribute("stroke","#1f477c");
  node.setAttribute("stroke-width","5");
  node.setAttribute("stroke-linejoin","round");
  group.append(node);
  svg.append(defs,shadow,group);
  return svg;
}

function makeShapeQuestion(difficulty: Difficulty): SpaceQuestion {
  const pools: Record<Difficulty,ShapeName[]> = {
    easy:["circle","triangle","square","rectangle"],
    normal:["triangle","rectangle","diamond","trapezoid","pentagon"],
    hard:["diamond","trapezoid","pentagon","hexagon","rectangle"]
  };
  const pool = pools[difficulty];
  const answerShape = choose(pool);
  const distractors = shuffle(pool.filter((shape) => shape !== answerShape)).slice(0,3);
  while (distractors.length < 3) {
    const extra = choose((Object.keys(SHAPE_LABELS) as ShapeName[]).filter((shape) => shape !== answerShape && !distractors.includes(shape)));
    distractors.push(extra);
  }
  const target = document.createElement("div");
  target.append(shapeSvg(answerShape,randomInt(0,3) * 90,"#26335f"));
  const choices = shuffle([answerShape,...distractors]).map((shape) => ({
    visual:shapeSvg(shape,randomInt(0,3) * 90,shape === answerShape ? "#77b7ff" : "#9ec8ef"),
    label:SHAPE_LABELS[shape],
    correct:shape === answerShape
  }));
  return {kind:"shape",title:"회전해도 같은 도형은?",instruction:"위 도형을 머릿속으로 돌려 같은 모양을 찾아보세요.",target,choices};
}

function rotationPuzzleSvg(variant: number,rotation: number,mirrored: boolean,marker: number): SVGSVGElement {
  const paths = [
    "M-47-38H17V-15H45V17H10V41H-27V9H-47Z",
    "M-43-42H7V-23H39V8H20V41H-19V15H-43Z",
    "M-46-31H-18V-45H18V-15H46V18H15V43H-22V12H-46Z",
    "M-45-39H11V-18H43V13H25V42H-12V21H-45Z"
  ];
  const markerPoints: Array<[number,number]> = [[-28,-23],[23,-1],[-7,27]];
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 140 120");
  svg.setAttribute("class","rotation-composite-svg");
  svg.setAttribute("aria-label","회전하여 비교하는 비대칭 복합도형");
  const gradientId = "rotation-gradient-" + Math.random().toString(36).slice(2);
  const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
  const gradient = document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
  gradient.setAttribute("id",gradientId); gradient.setAttribute("x1","0"); gradient.setAttribute("y1","0"); gradient.setAttribute("x2","1"); gradient.setAttribute("y2","1");
  [["0%","#89d8ff"],["58%","#469be2"],["100%","#2868b5"]].forEach(([offset,color]) => { const stop = document.createElementNS("http://www.w3.org/2000/svg","stop"); stop.setAttribute("offset",offset as string); stop.setAttribute("stop-color",color as string); gradient.append(stop); });
  defs.append(gradient);
  const shadow = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
  shadow.setAttribute("cx","70"); shadow.setAttribute("cy","106"); shadow.setAttribute("rx","43"); shadow.setAttribute("ry","6"); shadow.setAttribute("fill","#17365f"); shadow.setAttribute("opacity",".16");
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
  group.setAttribute("transform","translate(70 57) rotate(" + rotation + ") scale(" + (mirrored ? -1 : 1) + " 1)");
  const body = document.createElementNS("http://www.w3.org/2000/svg","path");
  body.setAttribute("d",paths[variant % paths.length] as string); body.setAttribute("fill","url(#" + gradientId + ")"); body.setAttribute("stroke","#183f76"); body.setAttribute("stroke-width","5"); body.setAttribute("stroke-linejoin","round");
  const route = document.createElementNS("http://www.w3.org/2000/svg","path");
  route.setAttribute("d","M-31 4H5V25H27"); route.setAttribute("fill","none"); route.setAttribute("stroke","#d9f4ff"); route.setAttribute("stroke-width","7"); route.setAttribute("stroke-linecap","round"); route.setAttribute("stroke-linejoin","round"); route.setAttribute("opacity",".82");
  const point = markerPoints[marker % markerPoints.length] as [number,number];
  const badge = document.createElementNS("http://www.w3.org/2000/svg","circle");
  badge.setAttribute("cx",String(point[0])); badge.setAttribute("cy",String(point[1])); badge.setAttribute("r","10"); badge.setAttribute("fill","#ffdb43"); badge.setAttribute("stroke","#704d00"); badge.setAttribute("stroke-width","4");
  const badgeCore = document.createElementNS("http://www.w3.org/2000/svg","circle");
  badgeCore.setAttribute("cx",String(point[0] - 2)); badgeCore.setAttribute("cy",String(point[1] - 2)); badgeCore.setAttribute("r","3"); badgeCore.setAttribute("fill","#fff8c8");
  const notch = document.createElementNS("http://www.w3.org/2000/svg","polygon");
  notch.setAttribute("points","31,-14 45,-6 31,2"); notch.setAttribute("fill","#ef5862"); notch.setAttribute("stroke","#7d2933"); notch.setAttribute("stroke-width","3"); notch.setAttribute("stroke-linejoin","round");
  group.append(body,route,badge,badgeCore,notch);
  svg.append(defs,shadow,group);
  return svg;
}

function makeAdvancedShapeQuestion(difficulty: Difficulty): SpaceQuestion {
  const variant = randomInt(0,3);
  const marker = randomInt(0,2);
  const angles = difficulty === "hard" ? [0,45,90,135,180,225,270,315] : [0,90,180,270];
  const targetRotation = choose(angles);
  const target = document.createElement("div");
  target.className = "rotation-puzzle-target";
  target.append(rotationPuzzleSvg(variant,targetRotation,false,marker));
  const optionData = [
    {variant,mirrored:false,marker,correct:true},
    {variant,mirrored:true,marker,correct:false},
    {variant,mirrored:false,marker:(marker + 1) % 3,correct:false},
    {variant:(variant + (difficulty === "easy" ? 2 : 1)) % 4,mirrored:false,marker,correct:false}
  ];
  const choices = shuffle(optionData).map((option,index) => {
    let optionRotation = choose(angles);
    if (option.correct && optionRotation === targetRotation) optionRotation = (optionRotation + (difficulty === "hard" ? 135 : 90)) % 360;
    return {
      visual:rotationPuzzleSvg(option.variant,optionRotation,option.mirrored,option.marker),
      label:(index + 1) + "번 회전 조각",
      correct:option.correct
    };
  });
  return {
    kind:"shape",
    title:"돌려서 완전히 겹치는 도형은?",
    instruction:"돌출된 부분, 노란 표식, 빨간 꼭짓점의 위치 관계가 모두 같은 조각을 찾아보세요.",
    target,
    choices
  };
}

function makeRotationQuestion(difficulty: Difficulty): SpaceQuestion {
  const arrows = ["↑","→","↓","←"];
  const names = ["위쪽","오른쪽","아래쪽","왼쪽"];
  const count = difficulty === "easy" ? 1 : difficulty === "normal" ? 2 : 3;
  const start = randomInt(0,3);
  let result = start;
  const turns: Array<{label:string;value:number}> = [];
  for (let index = 0; index < count; index += 1) {
    const turn = choose([
      {label:"오른쪽으로 90°",value:1},
      {label:"왼쪽으로 90°",value:-1},
      {label:"반 바퀴 180°",value:2}
    ]);
    turns.push(turn);
    result = (result + turn.value + 4) % 4;
  }
  const target = document.createElement("div");
  const arrow = document.createElement("div");
  arrow.className = "direction-arrow";
  arrow.textContent = arrows[start] as string;
  const sequence = document.createElement("div");
  sequence.className = "turn-sequence";
  turns.forEach((turn) => {
    const chip = document.createElement("span");
    chip.className = "turn-chip";
    chip.dataset.turn = String(turn.value);
    chip.textContent = turn.label;
    sequence.append(chip);
  });
  target.append(arrow,sequence);
  const choices = arrows.map((value,index) => {
    const visual = document.createElement("span");
    visual.className = "direction-arrow";
    visual.textContent = value;
    return {visual,label:names[index] as string,correct:index === result};
  });
  return {kind:"rotation",title:"마지막 방향은 어디일까요?",instruction:"처음 화살표에 회전을 순서대로 적용하세요.",target,choices};
}

function blockBoard(values: number[][]): HTMLElement {
  const board = document.createElement("div");
  board.className = "block-board";
  board.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
  values.flat().forEach((height) => {
    const cell = document.createElement("span");
    cell.className = "block-cell" + (height === 0 ? " empty" : "");
    cell.setAttribute("aria-label",height + "개 높이");
    for (let level = 0; level < height; level += 1) {
      const cube = document.createElement("i");
      cube.className = "block-cube";
      cube.style.setProperty("--cube-level",String(level));
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

function numericChoices(answer: number, spread: number): SpaceChoiceData[] {
  const numbers = new Set<number>([answer]);
  while (numbers.size < 4) numbers.add(Math.max(1,answer + randomInt(-spread,spread)));
  return shuffle(Array.from(numbers)).map((value) => {
    const visual = document.createElement("span");
    visual.className = "space-number";
    visual.textContent = String(value);
    return {visual,label:value + "개",correct:value === answer};
  });
}

function makeBlocksQuestion(difficulty: Difficulty): SpaceQuestion {
  const size = difficulty === "easy" ? 2 : 3;
  const maxHeight = difficulty === "hard" ? 4 : difficulty === "normal" ? 3 : 2;
  const values: number[][] = [];
  for (let row = 0; row < size; row += 1) {
    const line: number[] = [];
    for (let column = 0; column < size; column += 1) line.push(randomInt(0,maxHeight));
    values.push(line);
  }
  if (values.flat().every((value) => value === 0)) (values[0] as number[])[0] = 1;
  const answer = values.flat().reduce((sum,value) => sum + value,0);
  const target = document.createElement("div");
  target.append(blockBoard(values));
  return {
    kind:"blocks",title:"쌓기나무는 모두 몇 개일까요?",instruction:"각 칸의 숫자는 그 자리에 쌓인 블록의 높이예요.",target,
    choices:numericChoices(answer,Math.max(3,size * 2))
  };
}

function makePatternQuestion(difficulty: Difficulty): SpaceQuestion {
  const pool = difficulty === "easy"
    ? (["circle","triangle","square","rectangle"] as ShapeName[])
    : (Object.keys(SHAPE_LABELS) as ShapeName[]);
  const baseLength = difficulty === "easy" ? 2 : 3;
  const base = shuffle(pool).slice(0,baseLength);
  const visibleLength = difficulty === "easy" ? 3 : 5;
  const answerShape = base[visibleLength % base.length] as ShapeName;
  const target = document.createElement("div");
  target.className = "pattern-strip";
  for (let index = 0; index < visibleLength; index += 1) {
    const item = document.createElement("span");
    item.className = "pattern-item";
    item.append(shapeSvg(base[index % base.length] as ShapeName,index * 45,"#70b7ff"));
    target.append(item);
  }
  const missing = document.createElement("span");
  missing.className = "pattern-missing";
  missing.textContent = "?";
  target.append(missing);
  const distractors = shuffle(pool.filter((shape) => shape !== answerShape)).slice(0,3);
  const choices = shuffle([answerShape,...distractors]).map((shape) => ({
    visual:shapeSvg(shape,randomInt(0,3) * 90,shape === answerShape ? "#ffd45f" : "#9bcaff"),
    label:SHAPE_LABELS[shape],correct:shape === answerShape
  }));
  return {kind:"pattern",title:"다음에 올 도형은 무엇일까요?",instruction:"반복되는 도형의 순서를 찾아 빈칸을 완성하세요.",target,choices};
}

function mirrorGrid(values: boolean[][], className = "mirror-grid"): HTMLElement {
  const grid = document.createElement("div");
  grid.className = className;
  grid.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
  values.flat().forEach((active) => {
    const cell = document.createElement("span");
    if (active) cell.className = "active";
    grid.append(cell);
  });
  return grid;
}

function makeMirrorQuestion(difficulty: Difficulty): SpaceQuestion {
  const rows = difficulty === "hard" ? 4 : 3;
  const half: boolean[][] = [];
  for (let row = 0; row < rows; row += 1) half.push([Math.random() > .45,Math.random() > .45]);
  if (half.flat().every((value) => !value)) (half[0] as boolean[])[0] = true;
  const correct = half.map((row) => [...row,...row.slice().reverse()]);
  const target = document.createElement("div");
  target.className = "mirror-prompt";
  target.append(mirrorGrid(half,"mirror-half"));
  const axis = document.createElement("span");
  axis.className = "mirror-axis";
  const unknown = document.createElement("span");
  unknown.className = "mirror-unknown";
  unknown.textContent = "?";
  target.append(axis,unknown);
  const matrices: boolean[][][] = [correct];
  const used = new Set([JSON.stringify(correct)]);
  while (matrices.length < 4) {
    const altered = correct.map((row) => [...row]);
    const changes = difficulty === "hard" ? 2 : 1;
    for (let change = 0; change < changes; change += 1) {
      const row = randomInt(0,rows - 1);
      const column = randomInt(2,3);
      (altered[row] as boolean[])[column] = !(altered[row] as boolean[])[column];
    }
    const key = JSON.stringify(altered);
    if (!used.has(key)) { used.add(key); matrices.push(altered); }
  }
  return {
    kind:"mirror",title:"거울에 비친 완성 모양은?",instruction:"점선을 기준으로 왼쪽 무늬를 똑같이 뒤집어 보세요.",target,
    choices:shuffle(matrices.map((matrix,index) => ({visual:mirrorGrid(matrix),label:"대칭 무늬",correct:index === 0})))
  };
}

function topViewGrid(values: boolean[][]): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "topview-grid";
  grid.style.gridTemplateColumns = "repeat(" + values[0]?.length + ",1fr)";
  values.flat().forEach((filled) => {
    const cell = document.createElement("span");
    if (filled) cell.className = "filled";
    grid.append(cell);
  });
  return grid;
}

function makeTopViewQuestion(difficulty: Difficulty): SpaceQuestion {
  const size = difficulty === "easy" ? 2 : 3;
  const maxHeight = difficulty === "hard" ? 4 : 3;
  const values = Array.from({length:size},() => Array.from({length:size},() => randomInt(0,maxHeight)));
  if (values.flat().every((value) => value === 0)) (values[0] as number[])[0] = 1;
  const correct = values.map((row) => row.map((height) => height > 0));
  const matrices: boolean[][][] = [correct];
  const used = new Set([JSON.stringify(correct)]);
  while (matrices.length < 4) {
    const altered = correct.map((row) => [...row]);
    const row = randomInt(0,size - 1);
    const column = randomInt(0,size - 1);
    (altered[row] as boolean[])[column] = !(altered[row] as boolean[])[column];
    const key = JSON.stringify(altered);
    if (!used.has(key)) { used.add(key); matrices.push(altered); }
  }
  const target = document.createElement("div");
  target.className = "topview-scene";
  target.append(blockBoard(values));
  const label = document.createElement("span");
  label.textContent = "위에서 내려다보면?";
  target.append(label);
  return {
    kind:"topview",title:"위에서 본 모양을 찾아요",instruction:"높이는 생각하지 말고 블록이 놓인 자리만 살펴보세요.",target,
    choices:shuffle(matrices.map((matrix,index) => ({visual:topViewGrid(matrix),label:"위에서 본 모양",correct:index === 0})))
  };
}

type NetPattern = Array<[number,number]>;

const VALID_NETS: NetPattern[] = [
  [[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]],
  [[0,0],[0,1],[1,1],[2,1],[2,2],[2,3]],
  [[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]]
];

const INVALID_NETS: NetPattern[] = [
  [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],
  [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]],
  [[0,0],[1,0],[0,1],[1,1],[2,1],[2,2]],
  [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]
];

function netVisual(pattern: NetPattern): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "net-grid";
  pattern.forEach(([column,row]) => {
    const cell = document.createElement("span");
    cell.className = "net-cell";
    cell.style.gridColumn = String(column + 1);
    cell.style.gridRow = String(row + 1);
    grid.append(cell);
  });
  return grid;
}

function makeNetQuestion(): SpaceQuestion {
  const target = document.createElement("div");
  const cube = document.createElement("span");
  cube.className = "space-number";
  cube.textContent = "정육면체";
  target.append(cube);
  const correctPattern = choose(VALID_NETS);
  const options = shuffle([
    {pattern:correctPattern,correct:true},
    ...shuffle(INVALID_NETS).slice(0,3).map((pattern) => ({pattern,correct:false}))
  ]);
  return {
    kind:"net",title:"정육면체로 접히는 전개도는?",instruction:"겹치지 않고 여섯 면이 되는 모양을 찾아보세요.",target,
    choices:options.map((option,index) => ({visual:netVisual(option.pattern),label:String.fromCharCode(65 + index) + "번 전개도",correct:option.correct}))
  };
}

type TopViewSolid = "cone" | "cylinder" | "sphere" | "cube" | "squarePyramid" | "rectPrism" | "triPyramid" | "hexPrism";

interface TopViewSolidInfo {
  solid: TopViewSolid;
  name: string;
  answer: ShapeName;
  minDifficulty: Difficulty;
}

const TOP_VIEW_SOLIDS: TopViewSolidInfo[] = [
  {solid:"cone",name:"원뿔",answer:"circle",minDifficulty:"easy"},
  {solid:"cylinder",name:"원기둥",answer:"circle",minDifficulty:"easy"},
  {solid:"cube",name:"정육면체",answer:"square",minDifficulty:"easy"},
  {solid:"rectPrism",name:"직육면체",answer:"rectangle",minDifficulty:"easy"},
  {solid:"sphere",name:"구",answer:"circle",minDifficulty:"normal"},
  {solid:"squarePyramid",name:"사각뿔",answer:"square",minDifficulty:"normal"},
  {solid:"triPyramid",name:"삼각뿔",answer:"triangle",minDifficulty:"normal"},
  {solid:"hexPrism",name:"육각기둥",answer:"hexagon",minDifficulty:"hard"}
];

function topViewSolidSvg(solid: TopViewSolid,name: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 180 165");
  svg.setAttribute("class","solid-object-svg");
  svg.setAttribute("role","img");
  svg.setAttribute("aria-label",name + " 입체도형");
  const gradientId = "solid-gradient-" + Math.random().toString(36).slice(2);
  const lightId = gradientId + "-light";
  const common = `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8de1ff"/><stop offset=".55" stop-color="#4b9fe4"/><stop offset="1" stop-color="#2869b7"/></linearGradient><linearGradient id="${lightId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff8ff"/><stop offset="1" stop-color="#73c6ed"/></linearGradient></defs><ellipse cx="90" cy="148" rx="62" ry="10" fill="#183b68" opacity=".14"/>`;
  const drawings: Record<TopViewSolid,string> = {
    cone:`<path d="M30 126L90 22l60 104Q90 151 30 126Z" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><ellipse cx="90" cy="126" rx="60" ry="19" fill="#63b8eb" stroke="#214d82" stroke-width="5"/><path d="M49 116Q90 132 131 116" fill="none" stroke="#d9f7ff" stroke-width="5" stroke-dasharray="8 7" opacity=".8"/>`,
    cylinder:`<path d="M34 48v78c0 16 112 16 112 0V48Z" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5"/><ellipse cx="90" cy="48" rx="56" ry="20" fill="url(#${lightId})" stroke="#214d82" stroke-width="5"/><ellipse cx="90" cy="126" rx="56" ry="20" fill="#4597dc" stroke="#214d82" stroke-width="5"/><path d="M34 49v77" stroke="#d8f6ff" stroke-width="6" opacity=".55"/>`,
    sphere:`<circle cx="90" cy="82" r="60" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5"/><ellipse cx="71" cy="58" rx="19" ry="28" fill="#dff8ff" opacity=".62" transform="rotate(35 71 58)"/><path d="M43 92Q90 118 137 92" fill="none" stroke="#d7f5ff" stroke-width="4" opacity=".45"/>`,
    cube:`<polygon points="90,19 151,52 90,85 29,52" fill="#b9edff" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="29,52 90,85 90,143 29,108" fill="#4e9ddd" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="151,52 90,85 90,143 151,108" fill="#347fc8" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/>`,
    squarePyramid:`<polygon points="90,18 151,121 90,143 29,121" fill="#54a5e3" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 18L90 143M90 18L29 121M90 18L151 121" fill="none" stroke="#214d82" stroke-width="5"/><path d="M90 18L90 143L29 121Z" fill="#78c8ed" opacity=".72"/>`,
    rectPrism:`<polygon points="74,25 156,61 105,88 23,52" fill="#b8edff" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="23,52 105,88 105,140 23,104" fill="#559fda" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><polygon points="156,61 105,88 105,140 156,112" fill="#337bc2" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/>`,
    triPyramid:`<polygon points="90,17 151,128 29,128" fill="#54a5e3" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 17L90 128M90 17L29 128M90 17L151 128" stroke="#214d82" stroke-width="5"/><path d="M90 17L90 128L29 128Z" fill="#8bd5f3" opacity=".7"/>`,
    hexPrism:`<path d="M48 39l42-19 42 19 18 34-18 34-42 19-42-19-18-34Z" fill="url(#${lightId})" stroke="#214d82" stroke-width="5"/><path d="M48 39v55l42 31 42-18 18-34v51l-18 25H48l-18-25V73" fill="url(#${gradientId})" stroke="#214d82" stroke-width="5" stroke-linejoin="round"/><path d="M90 126V74L48 39M90 74l42-35" fill="none" stroke="#214d82" stroke-width="4"/>`
  };
  svg.innerHTML = common + drawings[solid];
  return svg;
}

function topViewAnswer(shape: ShapeName): HTMLElement {
  const answer = document.createElement("div");
  answer.className = "solid-topview-answer";
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 120 100");
  svg.setAttribute("class","solid-topview-answer-svg");
  const node = shape === "circle" ? document.createElementNS("http://www.w3.org/2000/svg","circle") : document.createElementNS("http://www.w3.org/2000/svg","polygon");
  if (shape === "circle") { node.setAttribute("cx","60"); node.setAttribute("cy","50"); node.setAttribute("r","39"); }
  else node.setAttribute("points",SHAPE_POINTS[shape]);
  node.setAttribute("fill","#6fc8ec"); node.setAttribute("stroke","#23598e"); node.setAttribute("stroke-width","5"); node.setAttribute("stroke-linejoin","round");
  const shine = document.createElementNS("http://www.w3.org/2000/svg","circle");
  shine.setAttribute("cx","45"); shine.setAttribute("cy","35"); shine.setAttribute("r","8"); shine.setAttribute("fill","#dff8ff"); shine.setAttribute("opacity",".8");
  svg.append(node,shine);
  const label = document.createElement("span"); label.textContent = SHAPE_LABELS[shape];
  answer.append(svg,label);
  return answer;
}

function makeSolidTopViewQuestion(difficulty: Difficulty): SpaceQuestion {
  const rank: Record<Difficulty,number> = {easy:0,normal:1,hard:2};
  const pool = TOP_VIEW_SOLIDS.filter((item) => rank[item.minDifficulty] <= rank[difficulty]);
  const solid = choose(pool);
  const target = document.createElement("div");
  target.className = "solid-topview-scene";
  const observation = document.createElement("span"); observation.className = "solid-observation-label"; observation.textContent = "관찰할 입체도형 · " + solid.name;
  const sight = document.createElement("div"); sight.className = "solid-sight-line"; sight.setAttribute("aria-hidden","true");
  target.append(observation,sight,topViewSolidSvg(solid.solid,solid.name));
  const shapes = Object.keys(SHAPE_LABELS) as ShapeName[];
  const distractors = shuffle(shapes.filter((shape) => shape !== solid.answer)).slice(0,3);
  const choices = shuffle([solid.answer,...distractors]).map((shape) => ({
    visual:topViewAnswer(shape),
    label:SHAPE_LABELS[shape],
    correct:shape === solid.answer
  }));
  return {
    kind:"topview",
    title:"이 입체도형을 위에서 보면?",
    instruction:"천장에서 수직으로 내려다보았을 때 보이는 바깥 윤곽을 찾아보세요.",
    target,
    choices
  };
}

function spaceKindsForGrade(grade: number): SpaceKind[] {
  if (grade <= 1) return ["shape","topview","rotation","pattern","mirror"];
  if (grade <= 4) return ["shape","topview","rotation","blocks","mirror","topview","pattern"];
  return ["shape","topview","rotation","blocks","mirror","net","topview","pattern"];
}

function makeSpaceQuestion(index: number): SpaceQuestion {
  const kinds = spaceKindsForGrade(state.grade ?? 0);
  const kind = kinds[index % kinds.length] as SpaceKind;
  const difficulty = difficultyForProgress(index / 9);
  if (kind === "shape") return makeAdvancedShapeQuestion(difficulty);
  if (kind === "rotation") return makeRotationQuestion(difficulty);
  if (kind === "blocks") return makeBlocksQuestion(difficulty);
  if (kind === "pattern") return makePatternQuestion(difficulty);
  if (kind === "mirror") return makeMirrorQuestion(difficulty);
  if (kind === "topview") return makeSolidTopViewQuestion(difficulty);
  return makeNetQuestion();
}

function stopSpace(): void {
  if (!space) return;
  space.running = false;
  if (space.timer !== null) window.clearInterval(space.timer);
  if (space.nextTimer !== null) window.clearTimeout(space.nextTimer);
}

function startSpace(): void {
  space = {running:true,locked:false,index:0,score:0,correct:0,streak:0,best:0,started:Date.now(),timer:null,nextTimer:null,current:null};
  showScreen("space");
  space.timer = window.setInterval(() => {
    if (!space?.running) return;
    renderSpaceHud();
    if ((Date.now() - space.started) / 1000 >= MAX_GAME_SECONDS) finishSpace();
  },500);
  nextSpaceQuestion();
}

function nextSpaceQuestion(): void {
  if (!space?.running) return;
  if (space.index >= 10) {
    finishSpace();
    return;
  }
  space.locked = false;
  space.current = makeSpaceQuestion(space.index);
  const labels: Record<SpaceKind,string> = {shape:"도형 판별",rotation:"공간 회전",blocks:"쌓기나무",net:"전개도",pattern:"도형 규칙",mirror:"거울 대칭",topview:"위에서 본 모양"};
  const hints: Record<SpaceKind,string> = {
    shape:"도형을 돌려도 노란 표식과 빨간 꼭짓점의 상대 위치는 바뀌지 않아요.",
    rotation:"첫 방향부터 화살표를 하나씩 돌려 보세요.",
    blocks:"보이지 않는 아래층 나무까지 함께 세어 보세요.",
    net:"맞닿은 면을 머릿속으로 하나씩 접어 보세요.",
    pattern:"반복되는 모양의 가장 짧은 묶음을 찾아보세요.",
    mirror:"가운데 선에서 같은 거리의 칸을 살펴보세요.",
    topview:"입체도형의 가장 높은 곳에서 수직으로 내려다본 바깥 윤곽을 떠올려 보세요."
  };
  byId("spaceKind").textContent = labels[space.current.kind];
  byId("spaceHint").textContent = hints[space.current.kind];
  byId("spaceTitle").textContent = space.current.title;
  byId("spaceInstruction").textContent = space.current.instruction;
  byId("spaceTarget").replaceChildren(space.current.target);
  byId("spaceFeedback").textContent = "";
  const choices = byId("spaceChoices");
  choices.replaceChildren();
  space.current.choices.forEach((choice,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "space-choice";
    button.setAttribute("aria-label",(index + 1) + "번 " + choice.label);
    button.append(choice.visual);
    button.addEventListener("click", () => answerSpace(choice.correct,button));
    choices.append(button);
  });
  renderSpaceHud();
}

function answerSpace(correct: boolean, selected: HTMLButtonElement): void {
  if (!space?.running || space.locked || !space.current) return;
  space.locked = true;
  if (correct) {
    const gained = 100 + space.streak * 15;
    space.score += gained;
    space.correct += 1;
    space.streak += 1;
    space.best = Math.max(space.best,space.streak);
    selected.classList.add("correct");
    byId("spaceFeedback").textContent = "정확해요! 공간을 잘 떠올렸어요. +" + gained;
    correctSound();
  } else {
    space.streak = 0;
    selected.classList.add("wrong");
    const buttons = Array.from(byId("spaceChoices").querySelectorAll<HTMLButtonElement>(".space-choice"));
    const answerIndex = space.current.choices.findIndex((choice) => choice.correct);
    buttons[answerIndex]?.classList.add("correct");
    byId("spaceFeedback").textContent = "정답 모양을 천천히 돌려서 비교해 보세요.";
    wrongSound();
  }
  renderSpaceHud();
  space.nextTimer = window.setTimeout(() => {
    if (!space?.running) return;
    space.index += 1;
    space.nextTimer = null;
    nextSpaceQuestion();
  },correct ? 850 : 1350);
}

function renderSpaceHud(): void {
  if (!space) return;
  const seconds = Math.min(MAX_GAME_SECONDS,Math.floor((Date.now() - space.started) / 1000));
  byId("spaceScore").textContent = String(space.score);
  byId("spaceTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2,"0");
  byId("spaceCount").textContent = "문제 " + Math.min(10,space.index + 1) + "/10";
  byId("spaceStreak").textContent = String(space.streak);
}

function finishSpace(): void {
  if (!space?.running || state.grade === null) return;
  const game = space;
  stopSpace();
  const accuracy = Math.round(game.correct / 10 * 100);
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"space",grade:state.grade,diff:"easy",score:game.score,stars,detail:game.correct + "/10 · 공간",timestamp:Date.now()});
  showResult(stars,"도형·공간 탐험 완료",game.correct + "개의 공간 문제를 해결했어요.",[[String(game.score),"점수"],[accuracy + "%","정답률"],[game.correct + "/10","정답"],[String(game.best),"최고 연속"]]);
}

type SnackKind = "berry" | "gold" | "rock" | "potion";
interface SnackItem {element:HTMLElement;kind:SnackKind;y:number;x:number;speed:number;}
interface SnackState {running:boolean;score:number;combo:number;best:number;time:number;lives:number;x:number;items:SnackItem[];raf:number|null;spawnTimer:number|null;countdown:number|null;lastFrame:number;caught:number;goldCaught:number;}
let snack: SnackState | null = null;
const SNACK_ITEM_IMAGES = {
  berry:["oran-berry","sitrus-berry","pecha-berry","cheri-berry","lum-berry"],
  gold:["rare-candy"],potion:["super-potion"],rock:["hard-stone"]
} as const;

function stopSnack(): void {
  if (!snack) return;
  snack.running = false;
  if (snack.raf !== null) cancelAnimationFrame(snack.raf);
  if (snack.spawnTimer !== null) window.clearInterval(snack.spawnTimer);
  if (snack.countdown !== null) window.clearInterval(snack.countdown);
  snack.items.forEach((item) => item.element.remove());
  snack.items = [];
}

function startSnack(): void {
  snack = {running:true,score:0,combo:0,best:0,time:60,lives:3,x:50,items:[],raf:null,spawnTimer:null,countdown:null,lastFrame:performance.now(),caught:0,goldCaught:0};
  byId("snackPlayer").replaceChildren(pokemonMedia({id:143,name:"잠만보"}));
  byId("snackField").classList.remove("fever");
  showScreen("snack"); renderSnackHud(); positionSnackPlayer();
  spawnSnackItem();
  snack.spawnTimer = window.setInterval(spawnSnackItem,680);
  snack.countdown = window.setInterval(() => { if (!snack?.running) return; snack.time = Math.max(0,snack.time - 1); renderSnackHud(); if (snack.time <= 0) finishSnack(); },1000);
  snack.raf = requestAnimationFrame(snackFrame);
}

function spawnSnackItem(): void {
  if (!snack?.running) return;
  const progress = 1 - snack.time / 60;
  const roll = Math.random();
  const kind: SnackKind = roll < .06 ? "gold" : roll < .11 ? "potion" : roll < .25 + progress * .1 ? "rock" : "berry";
  const element = document.createElement("div");
  element.className = "snack-item " + kind;
  const imageName = choose([...SNACK_ITEM_IMAGES[kind]]);
  const image = document.createElement("img");
  image.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/" + imageName + ".png";
  image.alt = kind === "gold" ? "이상한사탕" : kind === "rock" ? "딱딱한돌" : kind === "potion" ? "회복약" : "나무열매";
  image.addEventListener("error",() => { element.textContent = kind === "gold" ? "★" : kind === "rock" ? "◆" : kind === "potion" ? "+" : "●"; },{once:true});
  element.append(image);
  const x = randomInt(7,93);
  element.style.left = x + "%";
  byId("snackField").append(element);
  const speedScale = kind === "gold" ? .92 : kind === "rock" ? 1.08 : 1;
  snack.items.push({element,kind,y:-60,x,speed:(85 + progress * 120 + randomInt(0,45)) * speedScale});
}

function snackFrame(now: number): void {
  if (!snack?.running) return;
  const dt = Math.min(.035,(now - snack.lastFrame) / 1000);
  snack.lastFrame = now;
  const field = byId("snackField");
  const playerRect = byId("snackPlayer").getBoundingClientRect();
  for (let index = snack.items.length - 1; index >= 0; index -= 1) {
    const item = snack.items[index] as SnackItem;
    item.y += item.speed * dt;
    item.element.style.top = item.y + "px";
    const rect = item.element.getBoundingClientRect();
    const hit = rect.right > playerRect.left + 8 && rect.left < playerRect.right - 8 && rect.bottom > playerRect.top + 12 && rect.top < playerRect.bottom;
    if (hit) { catchSnackItem(item,index); continue; }
    if (item.y > field.clientHeight + 70) { item.element.remove(); snack.items.splice(index,1); }
  }
  snack.raf = requestAnimationFrame(snackFrame);
}

function catchSnackItem(item: SnackItem, index: number): void {
  if (!snack) return;
  const field = byId("snackField");
  const player = byId("snackPlayer");
  const effect = document.createElement("span");
  effect.className = "snack-catch-effect " + item.kind;
  effect.style.left = item.x + "%";
  effect.style.top = Math.max(8,item.y) + "px";
  item.element.remove(); snack.items.splice(index,1);
  if (item.kind === "rock") {
    snack.score = Math.max(0,snack.score - 120); snack.combo = 0; snack.lives -= 1;
    effect.textContent = "-120  ♥-1"; player.classList.remove("happy"); player.classList.add("hurt");
    field.classList.remove("fever"); bumpSound(); showToast(snack.lives > 0 ? "딱딱한돌이에요! 체력이 줄었어요." : "잠만보가 잠시 쉬어야 해요!");
    window.setTimeout(() => player.classList.remove("hurt"),500);
  } else {
    snack.combo += 1; snack.best = Math.max(snack.best,snack.combo); snack.caught += 1;
    const fever = snack.combo >= 10;
    const base = item.kind === "gold" ? 300 : item.kind === "potion" ? 150 : 100;
    const gained = (base + snack.combo * 5) * (fever ? 2 : 1);
    snack.score += gained;
    if (item.kind === "gold") snack.goldCaught += 1;
    if (item.kind === "potion") snack.lives = Math.min(3,snack.lives + 1);
    effect.textContent = "+" + gained + (fever ? "  FEVER ×2" : "");
    player.classList.remove("hurt"); player.classList.add("happy");
    field.classList.toggle("fever",fever); collectSound(item.kind === "gold");
    if (item.kind === "gold" || snack.combo === 10) pokemonSparkBurst(item.kind === "gold" ? 9 : 14);
    if (snack.combo === 10) showToast("10콤보! 잠만보 피버 ×2!");
    window.setTimeout(() => player.classList.remove("happy"),420);
  }
  field.append(effect);
  window.setTimeout(() => effect.remove(),850);
  renderSnackHud();
  if (snack.lives <= 0) finishSnack(true);
}

function positionSnackPlayer(): void { if (snack) byId("snackPlayer").style.left = snack.x + "%"; }
function moveSnack(amount: number): void { if (!snack?.running) return; snack.x = Math.max(7,Math.min(93,snack.x + amount)); positionSnackPlayer(); }
function moveSnackTo(clientX: number): void { if (!snack?.running) return; const rect = byId("snackField").getBoundingClientRect(); snack.x = Math.max(7,Math.min(93,(clientX - rect.left) / rect.width * 100)); positionSnackPlayer(); }
function renderSnackHud(): void { if (!snack) return; byId("snackScore").textContent = String(snack.score); byId("snackTime").textContent = String(snack.time); byId("snackCombo").textContent = String(snack.combo); byId("snackLives").textContent = "♥".repeat(snack.lives) + "♡".repeat(3-snack.lives); byId("snackSpeed").textContent = (1 + (60 - snack.time) / 60 * 1.4).toFixed(1); const feverProgress = Math.min(10,snack.combo); byId("snackFeverBar").style.width = feverProgress * 10 + "%"; byId("snackFeverText").textContent = snack.combo >= 10 ? "FEVER ×2" : feverProgress + "/10"; }

function finishSnack(outOfLives = false): void {
  if (!snack?.running || state.grade === null) return;
  const game = snack; stopSnack(); const stars = game.score >= 3200 ? 3 : game.score >= 1900 ? 2 : game.score >= 700 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"snack",grade:state.grade,diff:"easy",score:game.score,stars,detail:game.caught + "개 열매",timestamp:Date.now()});
  showResult(stars,outOfLives ? "잠만보 휴식 시간" : "베리 대모험 완료!","잠만보가 아이템 " + game.caught + "개를 맛있게 받았어요.",[[String(game.score),"점수"],[String(game.caught),"획득"],[String(game.goldCaught),"이상한사탕"],[String(game.best),"최고 연속"]]);
}

interface SymmetryState {
  running:boolean;round:number;score:number;mistakes:number;size:number;
  source:Set<string>;target:Set<string>;selected:Set<string>;started:number;
}

let symmetry: SymmetryState | null = null;

function stopSymmetry(): void { if (symmetry) symmetry.running = false; }

function startSymmetry(): void {
  if (state.grade === null) return;
  const size = state.grade <= 1 ? 4 : state.grade <= 3 ? 6 : 8;
  symmetry = {running:true,round:0,score:0,mistakes:0,size,source:new Set(),target:new Set(),selected:new Set(),started:Date.now()};
  replaceWithPokemon(byId("symmetryMascot"),417);
  showScreen("symmetry");
  setupSymmetryRound();
}

function setupSymmetryRound(): void {
  if (!symmetry?.running) return;
  if (symmetry.round >= 5) { finishSymmetry(); return; }
  symmetry.source.clear(); symmetry.target.clear(); symmetry.selected.clear();
  const half = symmetry.size / 2;
  for (let row = 0; row < symmetry.size; row += 1) {
    for (let col = 0; col < half; col += 1) {
      if (Math.random() < .38) {
        symmetry.source.add(row + "," + col);
        symmetry.target.add(row + "," + (symmetry.size - 1 - col));
      }
    }
  }
  if (symmetry.source.size < 3) { symmetry.source.add("0,0"); symmetry.source.add("1,1"); symmetry.source.add((symmetry.size - 1) + ",0"); symmetry.target.add("0," + (symmetry.size - 1)); symmetry.target.add("1," + (symmetry.size - 2)); symmetry.target.add((symmetry.size - 1) + "," + (symmetry.size - 1)); }
  byId("symmetryStatus").textContent = "왼쪽 전기 무늬를 대칭축 건너편에 똑같이 연결해요.";
  byId("screen-symmetry").classList.remove("circuit-complete","circuit-error");
  renderSymmetry();
}

function renderSymmetry(): void {
  if (!symmetry) return;
  byId("symmetryScore").textContent = String(symmetry.score);
  byId("symmetryRound").textContent = (symmetry.round + 1) + "/5";
  byId("symmetryMistakes").textContent = String(symmetry.mistakes);
  (byId("symmetryChargeBar") as HTMLElement).style.width = `${symmetry.round / 5 * 100}%`;
  byId("symmetryChargeText").textContent = `${symmetry.round} / 5`;
  const grid = byId("symmetryGrid");
  grid.style.setProperty("--symmetry-size",String(symmetry.size));
  grid.replaceChildren();
  const half = symmetry.size / 2;
  for (let row = 0; row < symmetry.size; row += 1) {
    for (let col = 0; col < symmetry.size; col += 1) {
      const key = row + "," + col;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "symmetry-cell";
      if (col < half) { cell.disabled = true; cell.classList.add(symmetry.source.has(key) ? "source" : "given"); }
      else {
        if (col === half) cell.classList.add("axis-edge");
        if (symmetry.selected.has(key)) cell.classList.add("selected");
        cell.addEventListener("click",() => { if (!symmetry?.running) return; symmetry.selected.has(key) ? symmetry.selected.delete(key) : symmetry.selected.add(key); renderSymmetry(); });
      }
      grid.append(cell);
    }
  }
}

function useSymmetryHint(): void {
  if (!symmetry?.running) return;
  const wrong = Array.from(symmetry.selected).find((key) => !symmetry?.target.has(key));
  if (wrong) {
    symmetry.selected.delete(wrong);
    byId("symmetryStatus").textContent = "파치리스가 잘못 연결된 전기 칸 하나를 찾아냈어요!";
  } else {
    const missing = Array.from(symmetry.target).find((key) => !symmetry?.selected.has(key));
    if (!missing) { byId("symmetryStatus").textContent = "모든 회로가 연결됐어요. 회로 확인을 눌러요!"; return; }
    symmetry.selected.add(missing);
    byId("symmetryStatus").textContent = "파치리스가 정답 칸 하나에 전기를 연결했어요!";
  }
  symmetry.score = Math.max(0,symmetry.score - 50);
  pokemonSparkBurst(417);
  renderSymmetry();
}

function checkSymmetry(): void {
  if (!symmetry?.running) return;
  const correct = symmetry.target.size === symmetry.selected.size && Array.from(symmetry.target).every((key) => symmetry?.selected.has(key));
  if (correct) {
    symmetry.score += 200 + symmetry.round * 40;
    symmetry.round += 1;
    byId("symmetryStatus").textContent = "대칭 회로 연결 성공! 파치리스의 에너지가 충전됐어요.";
    byId("screen-symmetry").classList.add("circuit-complete");
    correctSound(); pokemonSparkBurst(417); if (symmetry.round === 5) playPokemonCry(417);
    window.setTimeout(setupSymmetryRound,650);
  } else {
    symmetry.mistakes += 1;
    byId("symmetryStatus").textContent = "회로가 어긋났어요. 대칭축에서 같은 거리인지 다시 살펴봐요.";
    byId("screen-symmetry").classList.add("circuit-error");
    wrongSound(); showToast("대칭축을 기준으로 같은 거리를 살펴보세요.");
  }
  renderSymmetry();
}

function finishSymmetry(): void {
  if (!symmetry?.running || state.grade === null) return;
  const game = symmetry; stopSymmetry();
  const stars = game.mistakes <= 1 ? 3 : game.mistakes <= 4 ? 2 : game.mistakes <= 8 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"symmetry",grade:state.grade,diff:"easy",score:game.score,stars,detail:"5단계 · 실수 " + game.mistakes,timestamp:Date.now()});
  showResult(stars,"전기 대칭 연구 완료!","파치리스의 대칭 회로 5개를 모두 연결했어요.",[[String(game.score),"점수"],[String(game.mistakes),"실수"],[String(game.size) + "×" + game.size,"격자"],["5/5","충전"]]);
}

interface CoordinateState { running:boolean;stage:number;score:number;moves:number;size:number;x:number;y:number;goalX:number;goalY:number;obstacles:Set<string>;started:number; }
let coordinate: CoordinateState | null = null;
function stopCoordinate(): void { if (coordinate) coordinate.running = false; }

function startCoordinate(): void {
  if (state.grade === null) return;
  const size = state.grade <= 1 ? 5 : state.grade <= 3 ? 6 : 7;
  coordinate = {running:true,stage:0,score:0,moves:0,size,x:0,y:size-1,goalX:size-1,goalY:0,obstacles:new Set(),started:Date.now()};
  replaceWithPokemon(byId("coordinateMascot"),137);
  showScreen("coordinate"); setupCoordinateStage();
}

function setupCoordinateStage(): void {
  if (!coordinate?.running) return;
  if (coordinate.stage >= 5) { finishCoordinate(); return; }
  const size = coordinate.size;
  coordinate.x = 0; coordinate.y = size - 1; coordinate.goalX = size - 1; coordinate.goalY = coordinate.stage % 2 === 0 ? 0 : randomInt(0,size - 2); coordinate.obstacles.clear();
  const safe = new Set<string>();
  for (let x = 0; x < size; x += 1) safe.add(x + "," + (size - 1));
  for (let y = coordinate.goalY; y < size; y += 1) safe.add((size - 1) + "," + y);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) if (!safe.has(x + "," + y) && Math.random() < .2) coordinate.obstacles.add(x + "," + y);
  renderCoordinate();
}

function renderCoordinate(): void {
  if (!coordinate) return;
  byId("coordinateScore").textContent = String(coordinate.score); byId("coordinateStage").textContent = (coordinate.stage + 1) + "/5"; byId("coordinateMoves").textContent = String(coordinate.moves);
  byId("coordinateMission").textContent = "폴리곤을 목표 좌표 (" + (coordinate.goalX + 1) + ", " + (coordinate.size - coordinate.goalY) + ")까지 옮겨요.";
  const board = byId("coordinateBoard"); board.style.setProperty("--coordinate-size",String(coordinate.size)); board.replaceChildren();
  for (let y = 0; y < coordinate.size; y += 1) for (let x = 0; x < coordinate.size; x += 1) {
    const cell = document.createElement("div"); cell.className = "coordinate-cell"; cell.title = "(" + (x + 1) + ", " + (coordinate.size - y) + ")";
    if (coordinate.obstacles.has(x + "," + y)) { cell.classList.add("obstacle"); cell.textContent = "◆"; }
    if (x === coordinate.goalX && y === coordinate.goalY) { cell.classList.add("goal"); cell.textContent = "★"; }
    if (x === coordinate.x && y === coordinate.y) { cell.classList.add("player"); const image = document.createElement("img"); image.src = spriteUrl(137); image.alt = "폴리곤"; cell.replaceChildren(image); }
    const label = document.createElement("small"); label.textContent = (x + 1) + "," + (coordinate.size - y); cell.append(label); board.append(cell);
  }
}

function moveCoordinate(direction: string): void {
  if (!coordinate?.running) return;
  const delta: Record<string,[number,number]> = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const [dx,dy] = delta[direction] ?? [0,0]; const nx = coordinate.x + dx; const ny = coordinate.y + dy;
  if (nx < 0 || ny < 0 || nx >= coordinate.size || ny >= coordinate.size || coordinate.obstacles.has(nx + "," + ny)) { wrongSound(); showToast("그 방향은 지나갈 수 없어요."); return; }
  coordinate.x = nx; coordinate.y = ny; coordinate.moves += 1; moveSound();
  if (nx === coordinate.goalX && ny === coordinate.goalY) { coordinate.score += Math.max(80,260 - coordinate.moves * 4); coordinate.stage += 1; correctSound(); window.setTimeout(setupCoordinateStage,600); }
  renderCoordinate();
}

function finishCoordinate(): void {
  if (!coordinate?.running || state.grade === null) return;
  const game = coordinate; stopCoordinate(); const stars = game.moves <= game.size * 7 ? 3 : game.moves <= game.size * 10 ? 2 : 1;
  saveRecord({name:getName() || "친구",mode:"coordinate",grade:state.grade,diff:"easy",score:game.score,stars,detail:"5지도 · " + game.moves + "이동",timestamp:Date.now()});
  showResult(stars,"좌표 미로 탈출!","폴리곤과 다섯 개 지도를 통과했어요.",[[String(game.score),"점수"],[String(game.moves),"이동"],[String(game.size) + "×" + game.size,"지도"],["5/5","완료"]]);
}

interface HistoryEvent { year:number;label:string;yearLabel:string;minGrade:number; }
const HISTORY_EVENTS: HistoryEvent[] = [
  {year:-70000,label:"사람들이 돌을 다듬어 도구로 사용했어요",yearLabel:"구석기 시대",minGrade:0},{year:-8000,label:"농사를 짓고 한곳에 모여 살기 시작했어요",yearLabel:"신석기 시대",minGrade:0},
  {year:-2333,label:"고조선이 세워졌다고 전해져요",yearLabel:"기원전 2333년",minGrade:1},{year:-37,label:"고구려가 세워졌어요",yearLabel:"기원전 37년",minGrade:2},
  {year:676,label:"신라가 삼국 통일을 이루었어요",yearLabel:"676년",minGrade:3},{year:918,label:"왕건이 고려를 세웠어요",yearLabel:"918년",minGrade:2},
  {year:1392,label:"이성계가 조선을 세웠어요",yearLabel:"1392년",minGrade:2},{year:1443,label:"세종대왕이 훈민정음을 창제했어요",yearLabel:"1443년",minGrade:0},
  {year:1592,label:"임진왜란이 일어났어요",yearLabel:"1592년",minGrade:3},{year:1919,label:"3·1 운동이 일어났어요",yearLabel:"1919년",minGrade:3},
  {year:1945,label:"우리나라가 광복을 맞았어요",yearLabel:"1945년",minGrade:0},{year:1950,label:"6·25 전쟁이 일어났어요",yearLabel:"1950년",minGrade:4}
];
interface HistoryState {running:boolean;events:HistoryEvent[];remaining:Set<number>;score:number;mistakes:number;streak:number;bestStreak:number;lastWrongYear:number | null;started:number;}
let historyGame: HistoryState | null = null;
function stopHistory(): void { if (historyGame) historyGame.running = false; }

function startHistory(): void {
  if (state.grade === null) return;
  const grade = state.grade;
  const pool = HISTORY_EVENTS.filter((event) => event.minGrade <= grade);
  const events = shuffle([...pool]).slice(0,Math.min(8,pool.length));
  historyGame = {running:true,events,remaining:new Set(events.map((event) => event.year)),score:0,mistakes:0,streak:0,bestStreak:0,lastWrongYear:null,started:Date.now()};
  replaceWithPokemon(byId("historyMascot"),60); showScreen("history"); renderHistory();
}

function renderHistory(): void {
  if (!historyGame) return;
  const completed = historyGame.events.length - historyGame.remaining.size;
  byId("historyScore").textContent = String(historyGame.score); byId("historyCount").textContent = completed + "/" + historyGame.events.length; byId("historyStreak").textContent = String(historyGame.streak); byId("historyMistakes").textContent = String(historyGame.mistakes);
  byId("historyMissionText").textContent = completed ? completed + "개의 시대를 연결했어요" : "첫 사건을 찾아보세요";
  const timeline = byId("historyTimeline"); timeline.replaceChildren();
  historyGame.events.filter((event) => !historyGame?.remaining.has(event.year)).sort((a,b) => a.year - b.year).forEach((event,index) => { const chip = document.createElement("span"); chip.className = "history-era-chip"; chip.innerHTML = "<i>" + String(index + 1).padStart(2,"0") + "</i><b>" + event.yearLabel + "</b>" + event.label; timeline.append(chip); });
  if (!completed) { const empty = document.createElement("span"); empty.className = "history-timeline-empty"; empty.textContent = "사건을 맞히면 이곳에 시간의 길이 이어져요."; timeline.append(empty); }
  const cards = byId("historyCards"); cards.replaceChildren();
  historyGame.events.filter((event) => historyGame?.remaining.has(event.year)).forEach((event,index) => { const button = document.createElement("button"); button.type = "button"; button.className = "history-card"; if (historyGame?.lastWrongYear === event.year) button.classList.add("history-card-retry"); button.innerHTML = "<span>사건 " + String(index + 1).padStart(2,"0") + "</span><b>" + event.label + "</b>"; button.addEventListener("click",() => chooseHistoryEvent(event,button)); cards.append(button); });
}

function chooseHistoryEvent(event: HistoryEvent, button: HTMLButtonElement): void {
  if (!historyGame?.running) return;
  const earliest = Math.min(...Array.from(historyGame.remaining));
  const feedback = byId("historyFeedback");
  if (event.year === earliest) { historyGame.remaining.delete(event.year); historyGame.streak += 1; historyGame.bestStreak = Math.max(historyGame.bestStreak,historyGame.streak); historyGame.lastWrongYear = null; const bonus = Math.min(100,(historyGame.streak - 1) * 20); historyGame.score += 140 + bonus; button.classList.add("correct"); correctSound(); pokemonSparkBurst(10); feedback.dataset.status = "correct"; feedback.textContent = event.yearLabel + " · 시간 물결 연결!" + (bonus ? " 연속 보너스 +" + bonus : ""); if (!historyGame.remaining.size) { window.setTimeout(finishHistory,700); return; } }
  else { historyGame.mistakes += 1; historyGame.streak = 0; historyGame.lastWrongYear = event.year; button.classList.add("wrong"); wrongSound(); feedback.dataset.status = "wrong"; const earliestEvent = historyGame.events.find((item) => item.year === earliest); feedback.textContent = "조금 더 과거로 가야 해요. 단서: " + (earliestEvent?.yearLabel ?? "더 오래된 시대"); }
  renderHistory();
}

function finishHistory(): void {
  if (!historyGame?.running || state.grade === null) return;
  const game = historyGame; stopHistory(); const stars = game.mistakes <= 1 ? 3 : game.mistakes <= 4 ? 2 : game.mistakes <= 7 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"history",grade:state.grade,diff:"easy",score:game.score,stars,detail:game.events.length + "사건 · 실수 " + game.mistakes,timestamp:Date.now()});
  showResult(stars,"발챙이 시간 물결 복원!","발챙이와 과거에서 현재까지 역사의 흐름을 연결했어요.",[[String(game.score),"점수"],[String(game.events.length),"복원 사건"],[String(game.bestStreak),"최고 연속"],[String(game.mistakes),"실수"]]);
}

interface SafetyQuestion {category:string;prompt:string;choices:[string,string,string];answer:number;explanation:string;minGrade:number;}
const SAFETY_QUESTIONS: SafetyQuestion[] = [
  {category:"교통안전",prompt:"횡단보도 신호가 초록불로 바뀌었어요. 가장 먼저 할 일은?",choices:["좌우를 살피고 차가 멈췄는지 확인하기","바로 뛰어가기","휴대전화를 보며 걷기"],answer:0,explanation:"초록불이어도 좌우를 보고 차량이 완전히 멈췄는지 확인해요.",minGrade:0},
  {category:"화재안전",prompt:"건물에서 불이 나 연기가 보여요. 어떻게 해야 할까요?",choices:["몸을 낮추고 계단으로 대피하기","엘리베이터 타기","물건을 챙기러 돌아가기"],answer:0,explanation:"연기 아래로 몸을 낮추고 엘리베이터가 아닌 계단으로 대피해요.",minGrade:0},
  {category:"생활안전",prompt:"모르는 사람이 선물을 주며 따라오라고 해요.",choices:["따라가지 않고 안전한 어른에게 알리기","선물만 받고 따라가기","아무에게도 말하지 않기"],answer:0,explanation:"낯선 사람을 따라가지 말고 보호자나 경찰 등 믿을 수 있는 어른에게 알려요.",minGrade:0},
  {category:"응급상황",prompt:"친구가 크게 다쳐 움직이지 못해요. 무엇을 해야 할까요?",choices:["119에 신고하고 안내를 따르기","억지로 일으켜 세우기","혼자 두고 가기"],answer:0,explanation:"주변 안전을 확인하고 119에 신고한 뒤 상담원의 지시를 따라요.",minGrade:0},
  {category:"지진안전",prompt:"교실에서 갑자기 땅이 흔들려요.",choices:["책상 아래에서 머리를 보호하기","창문 밖으로 뛰어내리기","엘리베이터로 이동하기"],answer:0,explanation:"흔들림이 멈출 때까지 튼튼한 책상 아래에서 머리와 몸을 보호해요.",minGrade:1},
  {category:"물놀이",prompt:"물에 빠진 사람을 발견했지만 수영에 자신이 없어요.",choices:["어른에게 알리고 119에 신고하기","바로 물에 뛰어들기","모른 척하기"],answer:0,explanation:"직접 뛰어들면 함께 위험해질 수 있어 주변에 알리고 구조를 요청해요.",minGrade:1},
  {category:"식품안전",prompt:"냄새가 이상하고 유통기한이 지난 음식을 발견했어요.",choices:["먹지 않고 어른에게 알리기","조금만 맛보기","친구에게 주기"],answer:0,explanation:"상한 것으로 의심되는 음식은 먹지 말고 보호자에게 확인해요.",minGrade:1},
  {category:"인터넷",prompt:"게임에서 만난 사람이 집 주소를 알려 달라고 해요.",choices:["알려주지 않고 보호자에게 말하기","정확한 주소 보내기","사진과 전화번호도 보내기"],answer:0,explanation:"주소·전화번호·학교 같은 개인정보는 온라인 친구에게 공개하지 않아요.",minGrade:2},
  {category:"인터넷",prompt:"친구 사진을 인터넷에 올리고 싶어요.",choices:["친구에게 먼저 허락받기","몰래 올리기","이름만 지우고 바로 올리기"],answer:0,explanation:"사진에는 초상권과 개인정보가 있으므로 당사자의 동의를 받아야 해요.",minGrade:3},
  {category:"재난안전",prompt:"태풍 때문에 하천 물이 빠르게 불어나고 있어요.",choices:["하천에서 멀리 떨어진 안전한 곳으로 이동하기","가까이 가서 촬영하기","다리를 건너 확인하기"],answer:0,explanation:"불어난 물은 매우 위험하므로 하천과 지하 공간에서 즉시 멀어져요.",minGrade:2},
  {category:"전기안전",prompt:"콘센트 근처에 물이 쏟아졌어요.",choices:["손대지 말고 어른에게 알리기","젖은 손으로 닦기","금속 물건을 넣어보기"],answer:0,explanation:"감전 위험이 있으므로 젖은 손으로 만지지 말고 어른의 도움을 받아요.",minGrade:0},
  {category:"약물안전",prompt:"정체를 모르는 약이 책상 위에 놓여 있어요.",choices:["먹지 않고 어른에게 알리기","맛을 보기","친구와 나누기"],answer:0,explanation:"약은 보호자나 의료인의 안내 없이 함부로 먹으면 안 돼요.",minGrade:0},
  {category:"자전거안전",prompt:"자전거를 타고 공원에 나가려고 해요. 꼭 먼저 해야 할 일은?",choices:["안전모와 보호 장비 착용하기","속도를 최대한 높이기","이어폰을 크게 듣기"],answer:0,explanation:"자전거를 탈 때는 안전모를 쓰고 주변 소리를 들으며 안전하게 이동해요.",minGrade:0},
  {category:"폭염안전",prompt:"무더운 날 야외에서 친구가 어지럽다고 해요.",choices:["그늘로 이동해 쉬고 어른에게 알리기","계속 뛰게 하기","두꺼운 옷을 입히기"],answer:0,explanation:"시원한 곳으로 이동해 쉬게 하고 증상이 계속되면 즉시 도움을 요청해요.",minGrade:1},
  {category:"승강기안전",prompt:"엘리베이터 문이 닫히려 할 때 장난감이 안에 떨어졌어요.",choices:["문에 손을 넣지 않고 어른에게 알리기","손으로 문을 막기","문 사이로 뛰어들기"],answer:0,explanation:"닫히는 문에 손이나 물건을 넣지 말고 관리인이나 어른에게 도움을 요청해요.",minGrade:1},
  {category:"개인정보",prompt:"친구가 보낸 것처럼 보이는 링크에서 비밀번호를 입력하래요.",choices:["누르지 않고 보호자에게 확인하기","바로 비밀번호 입력하기","친구들에게 다시 보내기"],answer:0,explanation:"의심스러운 링크는 열지 말고 보낸 사람이나 보호자에게 먼저 확인해요.",minGrade:2}
];
interface SafetyState {running:boolean;questions:SafetyQuestion[];index:number;score:number;correct:number;streak:number;locked:boolean;started:number;}
let safety: SafetyState | null = null;
function stopSafety(): void { if (safety) safety.running = false; }

function startSafety(): void {
  if (state.grade === null) return;
  const grade = state.grade;
  const questions = shuffle(SAFETY_QUESTIONS.filter((question) => question.minGrade <= grade)).slice(0,10);
  safety = {running:true,questions,index:0,score:0,correct:0,streak:0,locked:false,started:Date.now()}; replaceWithPokemon(byId("safetyMascot"),7); showScreen("safety"); nextSafety();
}

function nextSafety(): void {
  if (!safety?.running) return;
  if (safety.index >= safety.questions.length) { finishSafety(); return; }
  safety.locked = false; const question = safety.questions[safety.index] as SafetyQuestion;
  byId("safetyScore").textContent = String(safety.score); byId("safetyCount").textContent = "상황 " + (safety.index + 1) + "/" + safety.questions.length; byId("safetyStreak").textContent = String(safety.streak);
  const category = byId("safetyCategory"); category.textContent = question.category; category.dataset.icon = safetyCategoryIcon(question.category);
  byId("safetyQuestion").textContent = question.prompt; byId("safetyExplanation").replaceChildren(); byId("safetyReaction").textContent = "꼬부기가 안전 순찰 중이에요. 가장 안전한 행동을 골라요!";
  byId("screen-safety").classList.remove("rescue-success","rescue-alert");
  renderSafetyShield();
  const indexed = shuffle(question.choices.map((label,index) => ({label,correct:index === question.answer}))); const choices = byId("safetyChoices"); choices.replaceChildren();
  indexed.forEach((item,index) => { const button = document.createElement("button"); button.type = "button"; button.className = "safety-choice"; button.textContent = item.label; button.addEventListener("click",() => answerSafety(item.correct,button,indexed)); choices.append(button); });
}

function safetyCategoryIcon(category: string): string {
  if (category.includes("교통") || category.includes("자전거")) return "🚦";
  if (category.includes("화재")) return "🔥";
  if (category.includes("물") || category.includes("폭염")) return "💧";
  if (category.includes("인터넷") || category.includes("개인정보")) return "🔒";
  if (category.includes("응급") || category.includes("약물")) return "✚";
  if (category.includes("지진") || category.includes("재난")) return "⛑";
  if (category.includes("전기") || category.includes("승강기")) return "⚠";
  return "🛡";
}

function renderSafetyShield(): void {
  if (!safety) return;
  const total = Math.max(1,safety.questions.length);
  (byId("safetyShieldBar") as HTMLElement).style.width = `${safety.correct / total * 100}%`;
  byId("safetyShieldText").textContent = `${safety.correct} / ${total}`;
  document.querySelector("#screen-safety .safety-shield")?.classList.toggle("charged",safety.correct === total);
}

function answerSafety(correct: boolean, selected: HTMLButtonElement, indexed: Array<{label:string;correct:boolean}>): void {
  if (!safety?.running || safety.locked) return; safety.locked = true; const question = safety.questions[safety.index] as SafetyQuestion;
  Array.from(byId("safetyChoices").querySelectorAll<HTMLButtonElement>("button")).forEach((button,index) => { button.disabled = true; if (indexed[index]?.correct) button.classList.add("correct"); });
  if (correct) { safety.correct += 1; safety.streak += 1; const patrolBonus = safety.streak % 3 === 0; safety.score += 120 + safety.streak * 10 + (patrolBonus ? 100 : 0); selected.classList.add("correct"); byId("safetyReaction").textContent = patrolBonus ? "꼬부기 구조 보너스! 3연속 안전 선택 +100" : "안전 선택 성공! 꼬부기가 힘차게 물방울 방패를 채웠어요."; byId("screen-safety").classList.add("rescue-success"); if (patrolBonus) { pokemonSparkBurst(7); playPokemonCry(7); } correctSound(); }
  else { safety.streak = 0; selected.classList.add("wrong"); byId("safetyReaction").textContent = "꼬부기가 위험 신호를 발견했어요. 설명을 보고 안전 행동을 기억해요."; byId("screen-safety").classList.add("rescue-alert"); wrongSound(); }
  byId("safetyExplanation").textContent = question.explanation; byId("safetyScore").textContent = String(safety.score); byId("safetyStreak").textContent = String(safety.streak); renderSafetyShield();
  window.setTimeout(() => { if (!safety?.running) return; safety.index += 1; nextSafety(); },correct ? 1400 : 2300);
}

function finishSafety(): void {
  if (!safety?.running || state.grade === null) return; const game = safety; stopSafety(); const accuracy = Math.round(game.correct / game.questions.length * 100); const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  saveRecord({name:getName() || "친구",mode:"safety",grade:state.grade,diff:"easy",score:game.score,stars,detail:game.correct + "/" + game.questions.length + " · 안전",timestamp:Date.now()});
  showResult(stars,"꼬부기 안전 순찰 완료!","꼬부기와 " + game.correct + "개의 안전한 행동을 찾아 물방울 방패를 완성했어요.",[[String(game.score),"점수"],[accuracy + "%","정답률"],[game.correct + "/" + game.questions.length,"구조 성공"],[String(game.streak),"마지막 연속"]]);
}

type KnowledgeCategory = "과학" | "사회" | "역사" | "생활";

interface KnowledgeQuestion {
  category: KnowledgeCategory;
  prompt: string;
  choices: [string,string,string,string];
  answer: number;
  explanation: string;
  minGrade: number;
  maxGrade: number;
  tier: 1 | 2 | 3;
}

interface KnowledgeState {
  questions: KnowledgeQuestion[];
  index: number;
  score: number;
  correct: number;
  streak: number;
  best: number;
  locked: boolean;
  started: number;
  running: boolean;
  timer: number | null;
}

const KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  {category:"과학",prompt:"식물이 건강하게 자라는 데 가장 필요한 것은 무엇일까요?",choices:["햇빛과 물","장난감","연필","모래시계"],answer:0,explanation:"식물은 햇빛을 받아 양분을 만들고 뿌리로 물을 흡수해요.",minGrade:0,maxGrade:2,tier:1},
  {category:"사회",prompt:"길을 건널 때 가장 안전한 곳은 어디일까요?",choices:["횡단보도","차도 가운데","주차장 사이","아무 곳"],answer:0,explanation:"신호를 확인하고 횡단보도로 건너야 운전자도 우리를 쉽게 볼 수 있어요.",minGrade:0,maxGrade:2,tier:1},
  {category:"역사",prompt:"옛날 사람들이 사용한 물건을 볼 수 있는 곳은 어디일까요?",choices:["박물관","수영장","놀이터","주차장"],answer:0,explanation:"박물관은 옛 물건과 기록을 보존하고 전시하는 곳이에요.",minGrade:0,maxGrade:2,tier:1},
  {category:"생활",prompt:"밥을 먹기 전에 먼저 해야 할 일은 무엇일까요?",choices:["손 씻기","달리기","신발 신기","불 끄기"],answer:0,explanation:"비누로 손을 씻으면 손에 묻은 세균과 오염물을 줄일 수 있어요.",minGrade:0,maxGrade:2,tier:1},
  {category:"과학",prompt:"얼음을 따뜻한 곳에 두면 어떻게 될까요?",choices:["물이 돼요","더 단단해져요","나무가 돼요","빛이 돼요"],answer:0,explanation:"고체인 얼음은 열을 받으면 녹아서 액체인 물이 돼요.",minGrade:0,maxGrade:2,tier:2},
  {category:"사회",prompt:"우리 동네의 모습을 작게 나타낸 그림은 무엇일까요?",choices:["지도","일기","동화책","악보"],answer:0,explanation:"지도는 장소의 위치와 길을 약속된 기호로 나타내요.",minGrade:0,maxGrade:2,tier:2},
  {category:"역사",prompt:"한글을 만든 왕은 누구일까요?",choices:["세종대왕","이순신","장영실","김홍도"],answer:0,explanation:"세종대왕은 백성이 쉽게 읽고 쓰도록 훈민정음을 만들었어요.",minGrade:0,maxGrade:2,tier:2},
  {category:"생활",prompt:"불이 크게 났을 때 신고할 전화번호는 무엇일까요?",choices:["119","112","120","114"],answer:0,explanation:"화재와 구조·응급 상황은 119에 신고해요. 안전한 곳으로 먼저 대피해야 해요.",minGrade:0,maxGrade:2,tier:2},
  {category:"과학",prompt:"낮에 생긴 그림자가 움직이는 가장 큰 까닭은 무엇일까요?",choices:["태양이 보이는 위치가 달라져서","나무가 걸어서","땅이 줄어들어서","바람이 색을 바꿔서"],answer:0,explanation:"시간이 지나며 태양이 보이는 방향이 달라져 그림자의 방향과 길이도 변해요.",minGrade:0,maxGrade:2,tier:3},
  {category:"사회",prompt:"도서관에서 지켜야 할 행동은 무엇일까요?",choices:["작은 목소리로 이용하기","책에 낙서하기","큰 소리로 뛰기","책을 숨기기"],answer:0,explanation:"공공장소에서는 다른 사람도 편히 이용하도록 약속을 지켜요.",minGrade:0,maxGrade:2,tier:3},
  {category:"역사",prompt:"과거에 있었던 일을 날짜 순서로 정리한 것은 무엇일까요?",choices:["연표","지도","악보","시간표"],answer:0,explanation:"연표를 보면 여러 역사적 사건의 앞뒤 순서를 쉽게 알 수 있어요.",minGrade:0,maxGrade:2,tier:3},
  {category:"생활",prompt:"모르는 사람이 따라오라고 할 때 가장 알맞은 행동은 무엇일까요?",choices:["따라가지 않고 믿을 만한 어른에게 알리기","조용히 따라가기","비밀로 하기","선물을 받기"],answer:0,explanation:"낯선 사람을 따라가지 말고 사람이 많은 곳이나 안전한 어른에게 도움을 요청해요.",minGrade:0,maxGrade:2,tier:3},

  {category:"과학",prompt:"자석에 가장 잘 붙는 물질은 무엇일까요?",choices:["철","나무","유리","고무"],answer:0,explanation:"자석은 철처럼 자석의 힘에 반응하는 물질을 끌어당겨요.",minGrade:3,maxGrade:4,tier:1},
  {category:"사회",prompt:"동서남북을 찾을 때 사용하는 도구는 무엇일까요?",choices:["나침반","온도계","저울","돋보기"],answer:0,explanation:"나침반의 자침은 남북 방향을 가리켜 방위를 찾도록 도와줘요.",minGrade:3,maxGrade:4,tier:1},
  {category:"역사",prompt:"문화유산을 보호해야 하는 까닭은 무엇일까요?",choices:["과거의 생활과 지혜를 전해 주기 때문에","새것이 아니기 때문에","값을 숨기기 위해","사용하지 못하게 하려고"],answer:0,explanation:"문화유산에는 과거 사람들의 삶과 생각이 담겨 있어 다음 세대에 전할 가치가 있어요.",minGrade:3,maxGrade:4,tier:1},
  {category:"생활",prompt:"개인정보에 해당하는 것은 무엇일까요?",choices:["집 주소와 전화번호","좋아하는 색","오늘 날씨","교실 벽 색깔"],answer:0,explanation:"주소와 전화번호 같은 개인정보는 함부로 공개하지 않아야 해요.",minGrade:3,maxGrade:4,tier:1},
  {category:"과학",prompt:"물이 수증기가 되어 공기 중으로 올라가는 현상은 무엇일까요?",choices:["증발","응결","결빙","침전"],answer:0,explanation:"액체인 물이 열을 받아 기체인 수증기로 변하는 현상을 증발이라고 해요.",minGrade:3,maxGrade:4,tier:2},
  {category:"사회",prompt:"생산자가 물건을 만들어 소비자에게 전하는 활동을 무엇이라 할까요?",choices:["경제 활동","기상 관측","문화유산","자연 현상"],answer:0,explanation:"사람들은 생산·유통·소비 같은 경제 활동으로 필요한 것을 주고받아요.",minGrade:3,maxGrade:4,tier:2},
  {category:"역사",prompt:"이순신 장군이 바다에서 나라를 지킬 때 사용한 배는 무엇일까요?",choices:["거북선","황포돛배","뗏목","증기선"],answer:0,explanation:"이순신 장군은 조선 수군을 이끌었고 거북선을 전투에 활용했어요.",minGrade:3,maxGrade:4,tier:2},
  {category:"생활",prompt:"인터넷에서 다른 사람의 사진을 올리기 전에 해야 할 일은 무엇일까요?",choices:["당사자의 허락 받기","이름을 바꾸기","몰래 올리기","친구에게만 숨기기"],answer:0,explanation:"사진에도 개인정보와 초상권이 있으므로 당사자의 동의를 받아야 해요.",minGrade:3,maxGrade:4,tier:2},
  {category:"과학",prompt:"하루 동안 낮과 밤이 생기는 주된 까닭은 무엇일까요?",choices:["지구의 자전","달의 공전","계절의 변화","구름의 이동"],answer:0,explanation:"지구가 스스로 회전하면서 태양을 향한 쪽은 낮, 반대쪽은 밤이 돼요.",minGrade:3,maxGrade:4,tier:3},
  {category:"사회",prompt:"지역의 중요한 일을 주민이 함께 결정하는 모습과 가장 가까운 것은?",choices:["주민 회의와 투표","혼자 명령하기","규칙 숨기기","의견 말하지 않기"],answer:0,explanation:"민주적인 의사 결정은 서로 의견을 나누고 정해진 절차에 따라 결정해요.",minGrade:3,maxGrade:4,tier:3},
  {category:"역사",prompt:"역사 자료를 살필 때 가장 먼저 확인하면 좋은 것은 무엇일까요?",choices:["누가 언제 왜 만들었는지","종이의 크기만","글자 수만","가격만"],answer:0,explanation:"자료의 만든 사람·시기·목적을 확인해야 당시 상황과 의미를 바르게 판단할 수 있어요.",minGrade:3,maxGrade:4,tier:3},
  {category:"생활",prompt:"지진으로 교실이 흔들릴 때 우선 해야 할 행동은 무엇일까요?",choices:["책상 아래에서 머리 보호하기","창문으로 달려가기","엘리베이터 타기","밖으로 바로 뛰기"],answer:0,explanation:"흔들릴 때는 책상 아래에서 머리와 몸을 보호하고, 멈춘 뒤 안내에 따라 이동해요.",minGrade:3,maxGrade:4,tier:3},

  {category:"과학",prompt:"식물이 빛을 이용해 양분을 만드는 작용은 무엇일까요?",choices:["광합성","증발","소화","마찰"],answer:0,explanation:"식물은 빛에너지를 이용해 이산화탄소와 물로 양분을 만들어요.",minGrade:5,maxGrade:6,tier:1},
  {category:"사회",prompt:"국민이 대표를 뽑아 나라의 일을 맡기는 제도는 무엇일까요?",choices:["대의 민주제","절대 군주제","신분제","봉건제"],answer:0,explanation:"대의 민주제에서는 국민이 선거로 대표를 뽑고 대표가 공적인 결정을 해요.",minGrade:5,maxGrade:6,tier:1},
  {category:"역사",prompt:"삼국을 통일한 뒤 한반도 남쪽 대부분을 다스린 나라는?",choices:["통일 신라","고조선","조선","대한제국"],answer:0,explanation:"신라는 당과 연합해 백제와 고구려를 멸망시킨 뒤 삼국 통일을 이루었어요.",minGrade:5,maxGrade:6,tier:1},
  {category:"생활",prompt:"온라인 정보가 사실인지 판단할 때 가장 좋은 방법은?",choices:["여러 믿을 만한 출처와 비교하기","제목만 믿기","조회 수만 보기","친구 말만 믿기"],answer:0,explanation:"작성자와 근거, 작성 날짜를 확인하고 공신력 있는 여러 출처와 비교해야 해요.",minGrade:5,maxGrade:6,tier:1},
  {category:"과학",prompt:"계절이 생기는 주된 까닭은 무엇일까요?",choices:["기울어진 지구가 태양 주위를 공전해서","태양의 크기가 변해서","달이 지구를 가려서","바람 방향만 변해서"],answer:0,explanation:"지구의 자전축이 기울어진 채 공전해 계절마다 햇빛을 받는 각도와 시간이 달라져요.",minGrade:5,maxGrade:6,tier:2},
  {category:"사회",prompt:"수요가 늘고 공급이 그대로일 때 일반적으로 가격은 어떻게 될까요?",choices:["오르는 경향이 있어요","항상 0원이 돼요","반드시 절반이 돼요","변할 수 없어요"],answer:0,explanation:"사려는 양이 늘지만 물건의 양이 같다면 경쟁이 생겨 가격이 오르는 경향이 있어요.",minGrade:5,maxGrade:6,tier:2},
  {category:"역사",prompt:"조선 후기에 실생활에 도움이 되는 학문을 강조한 사상은?",choices:["실학","성리학","불교","도교"],answer:0,explanation:"실학자들은 농업·상공업·제도 등 현실 문제를 연구하고 개선하려 했어요.",minGrade:5,maxGrade:6,tier:2},
  {category:"생활",prompt:"심하게 다친 사람을 발견했을 때 가장 알맞은 행동은?",choices:["119에 신고하고 안내를 따르기","무조건 일으켜 세우기","음식을 먹이기","혼자 두고 가기"],answer:0,explanation:"주변 안전을 확인하고 119에 신고한 뒤 상담원의 지시에 따라 도와야 해요.",minGrade:5,maxGrade:6,tier:2},
  {category:"과학",prompt:"생태계에서 생산자에 해당하는 것은 무엇일까요?",choices:["풀","토끼","매","버섯"],answer:0,explanation:"풀과 같은 식물은 광합성으로 스스로 양분을 만드는 생산자예요.",minGrade:5,maxGrade:6,tier:3},
  {category:"사회",prompt:"정부의 권력을 입법·행정·사법으로 나누는 까닭은 무엇일까요?",choices:["권력의 집중과 남용을 막기 위해","결정을 모두 늦추기 위해","선거를 없애기 위해","법을 비밀로 하기 위해"],answer:0,explanation:"삼권 분립은 국가 기관이 서로 견제하고 균형을 이루도록 해 국민의 권리를 보호해요.",minGrade:5,maxGrade:6,tier:3},
  {category:"역사",prompt:"서로 다른 역사 자료의 설명이 다를 때 바람직한 태도는?",choices:["여러 자료의 관점과 근거를 비교하기","먼저 본 것만 믿기","모두 거짓이라 하기","유명한 사람 말만 믿기"],answer:0,explanation:"자료마다 만든 사람과 목적이 다를 수 있으므로 여러 근거를 교차 확인해야 해요.",minGrade:5,maxGrade:6,tier:3},
  {category:"생활",prompt:"저작권을 지키며 인터넷 자료를 사용하는 방법은?",choices:["이용 조건을 확인하고 출처를 밝히기","검색되면 마음대로 쓰기","만든 사람 이름 지우기","유료 자료를 공유하기"],answer:0,explanation:"자료의 라이선스와 이용 범위를 확인하고 필요한 경우 허락을 받은 뒤 출처를 표시해요.",minGrade:5,maxGrade:6,tier:3}
];

let knowledge: KnowledgeState | null = null;

function knowledgeQuestionsForGrade(grade: number): KnowledgeQuestion[] {
  const available = KNOWLEDGE_QUESTIONS.filter((question) => grade >= question.minGrade && grade <= question.maxGrade);
  const selected: KnowledgeQuestion[] = [];
  ([1,2,3] as const).forEach((tier) => {
    const count = tier === 1 ? 4 : 3;
    selected.push(...shuffle(available.filter((question) => question.tier === tier)).slice(0,count));
  });
  return selected.map((question) => {
    const indexed = question.choices.map((label,index) => ({label,correct:index === question.answer}));
    const mixed = shuffle(indexed);
    return {...question,choices:mixed.map((item) => item.label) as [string,string,string,string],answer:mixed.findIndex((item) => item.correct)};
  });
}

function startKnowledge(): void {
  if (state.grade === null) return;
  knowledge = {
    questions:knowledgeQuestionsForGrade(state.grade),index:0,score:0,correct:0,streak:0,best:0,
    locked:false,started:Date.now(),running:true,timer:null
  };
  replaceWithTrainer(byId("knowledgePartner"),"oak.png","오박사");
  showScreen("knowledge");
  nextKnowledgeQuestion();
  knowledge.timer = window.setInterval(() => {
    if (!knowledge?.running) return;
    if (Date.now() - knowledge.started >= MAX_GAME_SECONDS * 1000) finishKnowledge();
    else renderKnowledgeHud();
  },1000);
}

function nextKnowledgeQuestion(): void {
  if (!knowledge?.running) return;
  if (knowledge.index >= knowledge.questions.length) {
    finishKnowledge();
    return;
  }
  knowledge.locked = false;
  const question = knowledge.questions[knowledge.index] as KnowledgeQuestion;
  byId("knowledgeCategory").textContent = question.category;
  byId("knowledgeCategory").dataset.category = question.category;
  byId("knowledgeLevel").textContent = question.tier === 1 ? "발견" : question.tier === 2 ? "탐구" : "도전";
  byId("knowledgeQuestion").textContent = question.prompt;
  byId("knowledgeExplanation").replaceChildren();
  const choices = byId("knowledgeChoices");
  choices.replaceChildren();
  question.choices.forEach((label,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "knowledge-choice";
    const number = document.createElement("b");
    number.textContent = String(index + 1);
    const text = document.createElement("span");
    text.textContent = label;
    button.append(number,text);
    button.addEventListener("click",() => answerKnowledge(index,button));
    choices.append(button);
  });
  document.querySelectorAll<HTMLElement>(".knowledge-route [data-zone]").forEach((zone) => {
    zone.classList.toggle("active",zone.dataset.zone === question.category);
  });
  renderKnowledgeHud();
}

function answerKnowledge(index: number, selected: HTMLButtonElement): void {
  if (!knowledge?.running || knowledge.locked) return;
  knowledge.locked = true;
  const question = knowledge.questions[knowledge.index] as KnowledgeQuestion;
  const correct = index === question.answer;
  const buttons = Array.from(byId("knowledgeChoices").querySelectorAll<HTMLButtonElement>(".knowledge-choice"));
  buttons.forEach((button,buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answer) button.classList.add("correct");
  });
  if (correct) {
    knowledge.correct += 1;
    knowledge.streak += 1;
    knowledge.best = Math.max(knowledge.best,knowledge.streak);
    knowledge.score += 100 + knowledge.streak * 15 + question.tier * 20;
    selected.classList.add("correct");
    byId("knowledgeExplanation").className = "knowledge-explanation correct";
    byId("knowledgeExplanation").textContent = "정답! " + question.explanation;
    correctSound();
    pokemonSparkBurst(8);
  } else {
    knowledge.streak = 0;
    selected.classList.add("wrong");
    byId("knowledgeExplanation").className = "knowledge-explanation wrong";
    byId("knowledgeExplanation").textContent = "배움 획득! " + question.explanation;
    wrongSound();
  }
  renderKnowledgeHud();
  window.setTimeout(() => {
    if (!knowledge?.running) return;
    knowledge.index += 1;
    nextKnowledgeQuestion();
  },correct ? 1300 : 2200);
}

function renderKnowledgeHud(): void {
  if (!knowledge) return;
  const seconds = Math.min(MAX_GAME_SECONDS,Math.floor((Date.now() - knowledge.started) / 1000));
  byId("knowledgeScore").textContent = String(knowledge.score);
  byId("knowledgeTime").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2,"0");
  byId("knowledgeCount").textContent = "탐험 " + Math.min(10,knowledge.index + 1) + "/10";
  byId("knowledgeStreak").textContent = String(knowledge.streak);
  const progress = byId("knowledgeProgress");
  progress.replaceChildren();
  for (let index = 0; index < 10; index += 1) {
    const dot = document.createElement("span");
    dot.className = index < knowledge.index ? "complete" : index === knowledge.index ? "current" : "";
    dot.textContent = index < knowledge.index ? "✓" : String(index + 1);
    progress.append(dot);
  }
}

function stopKnowledge(): void {
  if (!knowledge) return;
  knowledge.running = false;
  if (knowledge.timer !== null) window.clearInterval(knowledge.timer);
}

function finishKnowledge(): void {
  if (!knowledge?.running || state.grade === null) return;
  const game = knowledge;
  const seconds = Math.floor((Date.now() - game.started) / 1000);
  const accuracy = Math.round(game.correct / 10 * 100);
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  stopKnowledge();
  saveRecord({name:getName() || "친구",mode:"knowledge",grade:state.grade,diff:"easy",score:game.score,stars,detail:game.correct + "/10 · 지식",timestamp:Date.now()});
  showResult(stars,"지식탐험 완료!",game.correct + "개의 지식 보물을 찾았어요.",[[String(game.score),"점수"],[accuracy + "%","정답률"],[game.correct + "/10","정답"],[String(game.best),"최고 연속"]]);
}

interface MineCellData {
  mine:boolean;revealed:boolean;flagged:boolean;adjacent:number;element:HTMLButtonElement;
}

interface MineState {
  running:boolean;stage:number;rows:number;columns:number;mineCount:number;flags:number;revealed:number;
  score:number;started:number;firstClick:boolean;markMode:boolean;cells:MineCellData[];
  timer:number | null;nextTimer:number | null;
}

const MINE_STAGES = [
  {rows:8,columns:8,mines:8},
  {rows:10,columns:10,mines:15},
  {rows:12,columns:12,mines:24}
] as const;

const MOBILE_MINE_STAGES = [
  {rows:6,columns:6,mines:6},
  {rows:7,columns:7,mines:9},
  {rows:8,columns:8,mines:13}
] as const;

function mineStageConfig(stage: number): {rows:number;columns:number;mines:number} | undefined {
  const mobile = window.matchMedia("(max-width: 700px) and (pointer: coarse)").matches;
  return (mobile ? MOBILE_MINE_STAGES : MINE_STAGES)[stage];
}

let mine: MineState | null = null;

function stopMine(): void {
  if (!mine) return;
  mine.running = false;
  if (mine.timer !== null) window.clearInterval(mine.timer);
  if (mine.nextTimer !== null) window.clearTimeout(mine.nextTimer);
}

function startMine(): void {
  const first = mineStageConfig(0);
  if (!first) return;
  mine = {
    running:true,stage:0,rows:first.rows,columns:first.columns,mineCount:first.mines,
    flags:0,revealed:0,score:0,started:Date.now(),firstClick:true,markMode:false,cells:[],timer:null,nextTimer:null
  };
  setupMineStage(0);
  showScreen("mine");
  mine.timer = window.setInterval(() => {
    if (!mine?.running) return;
    renderMineHud();
    if ((Date.now() - mine.started) / 1000 >= MAX_GAME_SECONDS) finishMine(false);
  },500);
}

function setupMineStage(stage: number): void {
  if (!mine) return;
  const config = mineStageConfig(stage);
  if (!config) return;
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
  board.style.setProperty("--mine-cols",String(config.columns));
  board.setAttribute("aria-rowcount",String(config.rows));
  board.setAttribute("aria-colcount",String(config.columns));
  board.dataset.size = String(config.columns);
  board.replaceChildren();
  for (let index = 0; index < config.rows * config.columns; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mine-cell";
    button.setAttribute("role","gridcell");
    button.setAttribute("aria-label","열지 않은 칸");
    let longPressTimer: number | null = null;
    let longPressHandled = false;
    const cancelLongPress = (): void => {
      if (longPressTimer !== null) window.clearTimeout(longPressTimer);
      longPressTimer = null;
      button.classList.remove("touching");
    };
    button.addEventListener("pointerdown",(event) => {
      button.classList.add("touching");
      if (event.pointerType !== "touch" || mine?.markMode) return;
      longPressTimer = window.setTimeout(() => {
        longPressTimer = null;
        if (!mine?.running) return;
        longPressHandled = true;
        button.classList.remove("touching");
        toggleMineFlag(index);
        if (navigator.vibrate) navigator.vibrate(35);
      },460);
    });
    button.addEventListener("pointerup",() => {
      cancelLongPress();
      if (longPressHandled) window.setTimeout(() => { longPressHandled = false; },0);
    });
    button.addEventListener("pointercancel",() => { cancelLongPress(); longPressHandled = false; });
    button.addEventListener("pointerleave",cancelLongPress);
    button.addEventListener("click", () => {
      if (longPressHandled) return;
      openMineCell(index);
    });
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleMineFlag(index);
    });
    board.append(button);
    mine.cells.push({mine:false,revealed:false,flagged:false,adjacent:0,element:button});
  }
  byId("mineReset").textContent = "🙂";
  renderMineHud();
  showToast((stage + 1) + "번 루트 · " + config.rows + "×" + config.columns);
}

function mineNeighbors(index: number): number[] {
  if (!mine) return [];
  const row = Math.floor(index / mine.columns);
  const column = index % mine.columns;
  const result: number[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (nextRow >= 0 && nextRow < mine.rows && nextColumn >= 0 && nextColumn < mine.columns) {
        result.push(nextRow * mine.columns + nextColumn);
      }
    }
  }
  return result;
}

function placeVoltorbs(firstIndex: number): void {
  if (!mine) return;
  const safe = new Set<number>([firstIndex,...mineNeighbors(firstIndex)]);
  const candidates = shuffle(mine.cells.map((_cell,index) => index).filter((index) => !safe.has(index)));
  candidates.slice(0,mine.mineCount).forEach((index) => {
    const cell = mine?.cells[index];
    if (cell) cell.mine = true;
  });
  mine.cells.forEach((cell,index) => {
    cell.adjacent = mineNeighbors(index).filter((neighbor) => mine?.cells[neighbor]?.mine).length;
  });
  mine.firstClick = false;
}

function openMineCell(index: number): void {
  if (!mine?.running) return;
  if (mine.markMode) {
    toggleMineFlag(index);
    return;
  }
  const cell = mine.cells[index];
  if (!cell || cell.revealed || cell.flagged) return;
  if (mine.firstClick) placeVoltorbs(index);
  if (cell.mine) {
    cell.revealed = true;
    cell.element.classList.add("revealed","mine-hit");
    appendVoltorb(cell.element);
    revealAllVoltorbs();
    byId("mineReset").textContent = "😵";
    playPokemonCry(100,.24);
    wrongSound();
    mine.nextTimer = window.setTimeout(() => finishMine(false),1000);
    return;
  }
  floodOpenMine(index);
  openSound();
  renderMineHud();
  checkMineStageClear();
}

function floodOpenMine(startIndex: number): void {
  if (!mine) return;
  const queue = [startIndex];
  const visited = new Set<number>();
  while (queue.length) {
    const index = queue.shift();
    if (index === undefined || visited.has(index)) continue;
    visited.add(index);
    const cell = mine.cells[index];
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    mine.revealed += 1;
    mine.score += 10;
    cell.element.classList.add("revealed");
    cell.element.setAttribute("aria-label",cell.adjacent ? "주변 찌리리공 " + cell.adjacent + "마리" : "안전한 빈칸");
    if (cell.adjacent > 0) {
      cell.element.textContent = String(cell.adjacent);
      cell.element.classList.add("n" + cell.adjacent);
    } else {
      mineNeighbors(index).forEach((neighbor) => queue.push(neighbor));
    }
  }
}

function toggleMineFlag(index: number): void {
  if (!mine?.running) return;
  const cell = mine.cells[index];
  if (!cell || cell.revealed) return;
  if (!cell.flagged && mine.flags >= mine.mineCount) {
    showToast("몬스터볼을 모두 사용했어요.");
    return;
  }
  cell.flagged = !cell.flagged;
  mine.flags += cell.flagged ? 1 : -1;
  cell.element.classList.toggle("flagged",cell.flagged);
  cell.element.setAttribute("aria-label",cell.flagged ? "몬스터볼로 표시한 칸" : "열지 않은 칸");
  flagSound(cell.flagged);
  renderMineHud();
}

function appendVoltorb(target: HTMLElement): void {
  const image = document.createElement("img");
  image.src = pokemonUrl(100);
  image.alt = "찌리리공";
  image.addEventListener("error", () => {
    image.remove();
    target.textContent = "⚡";
  },{once:true});
  target.replaceChildren(image);
}

function revealAllVoltorbs(): void {
  if (!mine) return;
  mine.cells.forEach((cell) => {
    if (!cell.mine) return;
    cell.element.classList.add("revealed");
    appendVoltorb(cell.element);
  });
}

function checkMineStageClear(): void {
  if (!mine?.running) return;
  const safeCells = mine.rows * mine.columns - mine.mineCount;
  if (mine.revealed < safeCells) return;
  mine.score += 500 * (mine.stage + 1);
  byId("mineReset").textContent = "😎";
  correctSound();
  playPokemonCry(getAvatarId(),.15);
  pokemonSparkBurst(20);
  if (mine.stage >= MINE_STAGES.length - 1) {
    mine.nextTimer = window.setTimeout(() => finishMine(true),900);
  } else {
    mine.nextTimer = window.setTimeout(() => {
      if (!mine?.running) return;
      setupMineStage(mine.stage + 1);
    },900);
  }
}

function renderMineHud(): void {
  if (!mine) return;
  const elapsed = Math.min(999,Math.floor((Date.now() - mine.started) / 1000));
  const remaining = Math.max(0,mine.mineCount - mine.flags);
  byId("mineCounter").textContent = String(remaining);
  byId("mineTime").textContent = Math.floor(elapsed / 60) + ":" + String(elapsed % 60).padStart(2,"0");
  byId("mineStage").textContent = (mine.stage + 1) + "/3";
  byId("mineScore").textContent = String(mine.score);
  byId("mineLedCount").textContent = String(remaining).padStart(3,"0");
  byId("mineLedTime").textContent = String(elapsed).padStart(3,"0");
  const mode = byId<HTMLButtonElement>("mineMode");
  mode.textContent = mine.markMode ? "◓ 표시 모드" : "🔎 열기 모드";
  mode.classList.toggle("marking",mine.markMode);
  mode.setAttribute("aria-pressed",String(mine.markMode));
}

function resetMineStage(): void {
  if (!mine) return;
  if (mine.nextTimer !== null) window.clearTimeout(mine.nextTimer);
  mine.nextTimer = null;
  setupMineStage(mine.stage);
  selectSound();
}

function toggleMineMode(): void {
  if (!mine?.running) return;
  mine.markMode = !mine.markMode;
  renderMineHud();
  modeSound(mine.markMode);
}

function finishMine(won: boolean): void {
  if (!mine?.running || state.grade === null) return;
  const game = mine;
  const seconds = Math.floor((Date.now() - game.started) / 1000);
  const completed = won ? 3 : game.stage;
  const stars = won ? 3 : completed >= 2 ? 2 : completed >= 1 ? 1 : 0;
  stopMine();
  saveRecord({name:getName() || "친구",mode:"mine",grade:state.grade,diff:"easy",score:game.score,stars,detail:completed + "/3 루트",timestamp:Date.now()});
  showResult(stars,won ? "찌리리공 탐색 완료!" : "찌리리공을 만났어요",won ? "세 개의 루트를 모두 안전하게 통과했어요." : "숫자 단서를 다시 살펴보면 다음에는 피할 수 있어요.",[[String(game.score),"점수"],[completed + "/3","완료 루트"],[seconds + "초","시간"],[String(game.flags),"표시"]]);
}

function cleanupGame(): void {
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
  knowledge = null;
}

function showResult(stars: number, title: string, speech: string, stats: Array<[string,string]>): void {
  const progress = getTrainerProgress();
  const previous = getTrainerProgress(Math.max(0,progress.stars - stars));
  const leveledUp = progress.current.level > previous.current.level;
  replaceWithPokemon(byId("resultMascot"), getAvatarId());
  byId("resultStars").textContent = "★".repeat(stars) + "☆".repeat(3-stars);
  byId("resultTitle").textContent = title;
  byId("resultSpeech").textContent = leveledUp ? speech + " 트레이너 레벨이 올랐어요!" : speech;
  const reward = byId("resultReward");
  reward.classList.toggle("hidden-panel",!leveledUp);
  reward.textContent = leveledUp ? "LEVEL UP · Lv." + progress.current.level + " " + progress.current.title + " · " + progress.current.reward + " 획득" : "";
  const container = byId("resultStats");
  container.replaceChildren();
  stats.forEach(([value,label]) => container.append(heroStat(value,label)));
  showScreen("result");
  window.setTimeout(() => playPokemonCry(getAvatarId(),.18),220);
  pokemonSparkBurst(leveledUp ? 48 : stars >= 2 ? 30 : 14);
  if (leveledUp) levelUpSound();
}

function openRecords(): void {
  cleanupGame();
  setActiveNav("records");
  const records = readRecords();
  const best = records.reduce((value,record) => Math.max(value,record.score),0);
  const stars = getLifetimeStars();
  const summary = byId("recordSummary");
  const playedModes = new Set(records.map((record) => record.mode)).size;
  summary.replaceChildren(heroStat(String(records.length),"총 플레이"),heroStat(String(best),"최고 점수"),heroStat(String(stars),"모은 별"),heroStat(String(playedModes),"도전한 게임"));
  const highlights = byId("recordHighlights");
  const modeGrid = byId("recordModeGrid");
  highlights.replaceChildren();
  modeGrid.replaceChildren();
  if (records.length) {
    const latest = records.reduce((a,b) => a.timestamp > b.timestamp ? a : b);
    const personalBest = records.reduce((a,b) => a.score >= b.score ? a : b);
    const makeHighlight = (label: string,value: string,detail: string,kind: string): HTMLElement => {
      const card = document.createElement("article");
      card.className = `record-highlight ${kind}`;
      const eyebrow = document.createElement("span"); eyebrow.textContent = label;
      const strong = document.createElement("strong"); strong.textContent = value;
      const paragraph = document.createElement("p"); paragraph.textContent = detail;
      card.append(eyebrow,strong,paragraph);
      return card;
    };
    const nextGoal = Math.max(5,Math.ceil((stars + 1) / 5) * 5);
    highlights.append(
      makeHighlight("개인 최고",personalBest.score + "점",MODES[personalBest.mode].name,"best"),
      makeHighlight("최근 모험",MODES[latest.mode].name,new Date(latest.timestamp).toLocaleDateString("ko-KR"),"latest"),
      makeHighlight("다음 성장 목표",nextGoal + "개 별","앞으로 " + (nextGoal - stars) + "개 더 모으면 달성!","goal")
    );
    const grouped = new Map<Mode,RecordEntry[]>();
    records.forEach((record) => grouped.set(record.mode,[...(grouped.get(record.mode) ?? []),record]));
    Array.from(grouped.entries()).sort((a,b) => b[1].length - a[1].length).forEach(([mode,items]) => {
      const meta = MODES[mode];
      if (!meta) return;
      const card = document.createElement("article"); card.className = "record-mode-card";
      const media = pokemonMedia({id:MODE_MASCOTS[mode],name:meta.name},"record-mode-pokemon");
      const copy = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = meta.name;
      const category = document.createElement("small"); category.textContent = meta.category;
      copy.append(title,category);
      const modeBest = Math.max(...items.map((item) => item.score));
      const modeStars = items.reduce((total,item) => total + item.stars,0);
      const stats = document.createElement("div"); stats.className = "record-mode-stats";
      stats.innerHTML = `<span><b>${items.length}</b>회 플레이</span><span><b>${modeBest}</b>최고 점수</span><span><b>★ ${modeStars}</b>모은 별</span>`;
      card.append(media,copy,stats); modeGrid.append(card);
    });
  } else {
    const guide = document.createElement("article"); guide.className = "record-empty-guide";
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
  } else {
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["날짜","게임","학년","점수","성과","별"].forEach((label) => {
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
        String(date.getMonth()+1).padStart(2,"0") + "/" + String(date.getDate()).padStart(2,"0"),
        MODES[record.mode].name,gradeName(record.grade),String(record.score),
        record.detail,"★".repeat(record.stars)
      ];
      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
    table.append(head,body);
    wrapper.append(table);
  }
  showScreen("records");
}

interface RankingRow {name:string;score:number;stars:number;games:number;best:number;}
let leaderboardRequest = 0;
let localLeaderboardSynced = false;

function rankingAvatarPokemon(name: string): Pokemon {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (Math.imul(hash,31) + name.charCodeAt(index)) | 0;
  return POKEMON[Math.abs(hash) % POKEMON.length] as Pokemon;
}

function rankingRows(mode: Mode | null, records: RecordEntry[] = readRecords()): RankingRow[] {
  const grouped = new Map<string,RankingRow>();
  records.filter((record) => mode === null || record.mode === mode).forEach((record) => {
    const row = grouped.get(record.name) ?? {name:record.name,score:0,stars:0,games:0,best:0};
    row.score += record.score; row.stars += record.stars; row.games += 1; row.best = Math.max(row.best,record.score); grouped.set(record.name,row);
  });
  if (!grouped.size) grouped.set(getName() || "친구",{name:getName() || "친구",score:0,stars:0,games:0,best:0});
  return Array.from(grouped.values()).sort((a,b) => mode === null ? b.stars - a.stars || b.score - a.score : b.best - a.best || b.stars - a.stars).slice(0,20);
}

function paintLeaderboard(rows: RankingRow[], mode: Mode | null): void {
  const summary = byId("rankingSummary"); summary.replaceChildren();
  const totals: Array<[string,string]> = [
    [String(rows.length),"참가 트레이너"],
    [String(rows.reduce((sum,row) => sum + row.games,0)),"총 플레이"],
    ["★ " + rows.reduce((sum,row) => sum + row.stars,0),"모은 별"]
  ];
  totals.forEach(([value,label]) => {
    const item = document.createElement("div");
    const strong = document.createElement("strong"); strong.textContent = value;
    const span = document.createElement("span"); span.textContent = label;
    item.append(strong,span); summary.append(item);
  });
  const podium = byId("rankingPodium"); podium.replaceChildren();
  rows.slice(0,3).forEach((row,index) => {
    const card = document.createElement("article"); card.className = "ranking-place place-" + (index + 1);
    if (row.name === (getName() || "친구")) card.classList.add("current");
    const tier = document.createElement("small"); tier.className = "ranking-tier"; tier.textContent = ["LEAGUE CHAMPION","ELITE TRAINER","ACE TRAINER"][index] ?? "TRAINER";
    const medal = document.createElement("span"); medal.className = "ranking-medal"; medal.textContent = String(index + 1);
    const avatar = document.createElement("div"); avatar.className = "ranking-avatar"; avatar.append(pokemonAvatarMedia(rankingAvatarPokemon(row.name)));
    const name = document.createElement("strong"); name.textContent = row.name;
    const score = document.createElement("b"); score.textContent = mode === null ? row.stars + "개 별" : row.best + "점";
    const detail = document.createElement("small"); detail.textContent = row.games + "회 플레이 · 누적 " + row.score + "점";
    card.append(tier,medal,avatar,name,score,detail); podium.append(card);
  });
  const table = byId("rankingTable"); table.replaceChildren();
  const header = document.createElement("div"); header.className = "ranking-table-head";
  ["순위","트레이너","플레이","별","기록"].forEach((label) => { const span = document.createElement("span"); span.textContent = label; header.append(span); });
  table.append(header);
  rows.forEach((row,index) => {
    const item = document.createElement("div"); if (row.name === (getName() || "친구")) item.classList.add("current");
    const rank = document.createElement("b"); rank.className = "ranking-row-rank"; rank.textContent = "#" + (index + 1);
    const name = document.createElement("strong"); name.textContent = row.name;
    if (row.name === (getName() || "친구")) { const me = document.createElement("em"); me.textContent = "ME"; name.append(me); }
    const games = document.createElement("span"); games.textContent = row.games + "회";
    const stars = document.createElement("span"); stars.textContent = "★ " + row.stars;
    const score = document.createElement("span"); score.textContent = mode === null ? row.score + "점" : "최고 " + row.best + "점";
    item.append(rank,name,games,stars,score); table.append(item);
  });
}

async function renderLeaderboard(): Promise<void> {
  const request = ++leaderboardRequest;
  const refresh = byId<HTMLButtonElement>("rankingRefresh");
  refresh.disabled = true; refresh.classList.add("loading");
  const value = byId<HTMLSelectElement>("rankingMode").value;
  const mode = value === "all" ? null : value as Mode;
  const note = byId("rankingNote");
  paintLeaderboard(rankingRows(mode),mode);
  if (!leaderboardServerConfig()) {
    note.textContent = "공용 순위표 설정 전이에요. 현재는 이 브라우저의 기록을 표시합니다.";
    refresh.disabled = false; refresh.classList.remove("loading");
    return;
  }
  note.textContent = "다른 기기의 트레이너 기록을 불러오고 있어요...";
  try {
    if (!localLeaderboardSynced) {
      localLeaderboardSynced = await uploadSharedRecords(readRecords());
    }
    const sharedRecords = await readSharedRecords(mode);
    if (request !== leaderboardRequest) return;
    paintLeaderboard(rankingRows(mode,sharedRecords),mode);
    note.textContent = "공용 순위표 · 여러 기기에서 등록된 최근 기록 " + sharedRecords.length + "개를 반영했어요.";
  } catch {
    if (request !== leaderboardRequest) return;
    note.textContent = "공용 순위표에 연결하지 못해 이 브라우저의 기록을 표시합니다.";
  }
  if (request === leaderboardRequest) { refresh.disabled = false; refresh.classList.remove("loading"); }
}

function openLeaderboard(): void {
  cleanupGame(); setActiveNav("leaderboard");
  const select = byId<HTMLSelectElement>("rankingMode");
  if (select.options.length === 1) (Object.entries(MODES) as Array<[Mode,ModeMeta]>).forEach(([mode,meta]) => { const option = document.createElement("option"); option.value = mode; option.textContent = meta.name; select.append(option); });
  renderLeaderboard(); showScreen("leaderboard");
}

const HELP_CONTROLS: Record<Mode,string> = {
  quiz:"숫자판·보기 선택",rain:"숫자판 입력",mole:"디그다 터치",memory:"카드 뒤집기",ox:"O·X 선택",balloon:"푸린 터치",space:"도형 보기 선택",mine:"칸 열기·몬스터볼 표시",knowledge:"보기 선택",symmetry:"대칭 칸 채우기",coordinate:"방향 버튼",history:"사건 순서 선택",safety:"안전 행동 선택",snack:"터치·좌우 이동"
};

const HELP_DURATIONS: Record<Mode,string> = {
  quiz:"약 3~5분",rain:"최대 10분",mole:"60초",memory:"최대 10분",ox:"60초",balloon:"60초",space:"약 4~7분",mine:"약 5~10분",knowledge:"약 3~5분",symmetry:"약 3~6분",coordinate:"약 3~7분",history:"약 3~5분",safety:"약 3~5분",snack:"60초"
};

let activeHelpCategory: ModeMeta["category"] | "all" = "all";

function renderHelpCards(): void {
  const query = byId<HTMLInputElement>("helpSearch").value.trim().toLocaleLowerCase("ko-KR");
  const entries = (Object.entries(MODES) as Array<[Mode,ModeMeta]>).filter(([,meta]) => {
    const categoryMatch = activeHelpCategory === "all" || meta.category === activeHelpCategory;
    const searchMatch = !query || `${meta.name} ${meta.description} ${meta.hint} ${meta.category}`.toLocaleLowerCase("ko-KR").includes(query);
    return categoryMatch && searchMatch;
  });
  byId("helpResultCount").textContent = `${entries.length}개 게임`;
  const grid = byId("helpCards");
  grid.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("article"); empty.className = "help-empty";
    empty.innerHTML = "<strong>일치하는 게임을 찾지 못했어요.</strong><p>다른 포켓몬 이름이나 학습 영역으로 검색해 보세요.</p>";
    grid.append(empty);
    return;
  }
  entries.forEach(([mode,meta],index) => {
    const card = document.createElement("article");
    card.className = "help-card help-game-card";
    card.style.setProperty("--help-accent",meta.colors[0]);
    const number = document.createElement("span"); number.className = "help-card-number"; number.textContent = String(index + 1).padStart(2,"0");
    const mascot = document.createElement("div"); mascot.className = "help-mascot"; mascot.append(pokemonAvatarMedia({id:MODE_MASCOTS[mode],name:meta.name}));
    const copy = document.createElement("div"); copy.className = "help-card-copy";
    const category = document.createElement("span"); category.className = "help-category"; category.textContent = meta.category;
    const heading = document.createElement("h3"); heading.textContent = meta.name;
    const goal = document.createElement("p"); goal.className = "help-goal"; goal.innerHTML = `<b>목표</b>${meta.description}`;
    const tip = document.createElement("p"); tip.className = "help-tip"; tip.innerHTML = `<b>TIP</b>${meta.hint}`;
    copy.append(category,heading,goal,tip);
    const chips = document.createElement("div"); chips.className = "help-chips";
    [["조작",HELP_CONTROLS[mode]],["시간",HELP_DURATIONS[mode]],["난이도","자동 조절"]].forEach(([label,value]) => { const chip = document.createElement("span"); chip.innerHTML = `<small>${label}</small>${value}`; chips.append(chip); });
    const play = document.createElement("button"); play.type = "button"; play.className = "help-play"; play.textContent = "게임 선택으로"; play.addEventListener("click",openGrades);
    card.append(number,mascot,copy,chips,play);
    grid.append(card);
  });
}

function openHelp(category: ModeMeta["category"] | "all" = "all"): void {
  cleanupGame();
  setActiveNav("help");
  activeHelpCategory = category;
  document.querySelectorAll<HTMLButtonElement>("[data-help-category]").forEach((button) => button.classList.toggle("active",button.dataset.helpCategory === category));
  byId<HTMLInputElement>("helpSearch").value = "";
  renderHelpCards();
  showScreen("help");
}

function openAbout(): void {
  cleanupGame();
  setActiveNav("about");
  showScreen("about");
}

let avatarChanging = false;
let nameChanging = false;

function showAvatarPicker(changing: boolean): void {
  avatarChanging = changing;
  byId("avatarCountText").textContent = "진화형을 제외한 인기 포켓몬 " + POKEMON.length + "종";
  byId("introStage").classList.add("hidden-panel");
  byId("nameEntry").classList.add("hidden-panel");
  byId("avatarPick").classList.remove("hidden-panel");
  const close = byId<HTMLButtonElement>("closeAvatar");
  close.classList.toggle("hidden-panel", !changing && !hasSavedAvatar());
  const grid = byId("avatarGrid");
  grid.replaceChildren();
  POKEMON.forEach((pokemon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-button" + (pokemon.id === getAvatarId() ? " selected" : "");
    button.setAttribute("aria-label",pokemon.name + " 선택");
    button.append(pokemonAvatarMedia(pokemon));
    const label = document.createElement("small");
    label.textContent = pokemon.name;
    button.append(label);
    button.addEventListener("click", () => {
      setAvatarId(pokemon.id);
      selectSound();
      playPokemonCry(pokemon.id,.18);
      if (avatarChanging) closeAvatarPicker();
      else enterApp();
    });
    grid.append(button);
  });
}

function closeAvatarPicker(): void {
  avatarChanging = false;
  byId("introOverlay").classList.add("hidden-panel");
  byId("app").classList.remove("hidden-panel");
  updateSideInfo();
  buildGradeHero();
}

function showNameForm(changing = false): void {
  nameChanging = changing;
  byId("introStage").classList.add("hidden-panel");
  byId("avatarPick").classList.add("hidden-panel");
  byId("nameEntry").classList.remove("hidden-panel");
  byId("nameEntryLabel").textContent = changing ? "변경할 이름을 알려주세요" : "이름을 알려주세요";
  byId("cancelNameChange").classList.toggle("hidden-panel", !changing);
  byId<HTMLInputElement>("nameInput").value = getName();
  clearAccessMessage();
  byId<HTMLInputElement>("nameInput").focus();
}

function enterApp(): void {
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

function startIntro(): void {
  replaceWithPokemon(byId("introMascot"),25);
  byId("introOverlay").classList.remove("hidden-panel");
  byId("introStage").classList.remove("hidden-panel");
  byId("nameEntry").classList.add("hidden-panel");
  byId("avatarPick").classList.add("hidden-panel");
  const savedName = getName();
  const name = isAllowedTrainerName(savedName) ? savedName : "";
  if (savedName && !name) safeRemove(STORAGE.name);
  byId("dlgText").textContent = name
    ? name + " 트레이너, 다시 만나서 반가워요! 오늘의 배움 모험을 출발해 볼까요?"
    : "포켓몬과 함께 배우고, 탐험하고, 도전하는 모험이 시작돼요. 먼저 트레이너 이름을 알려주세요.";
  byId("introNext").textContent = name ? "모험 출발" : "이름 정하기";
}

function buildBackground(): void {
  const deco = byId("bgDeco");
  ["◓","＋","★","◒","×","✦","◓","÷","★","◒"].forEach((value,index) => {
    const span = document.createElement("span");
    span.textContent = value;
    span.style.left = randomInt(2,92) + "%";
    span.style.top = randomInt(3,90) + "%";
    span.style.animationDelay = index * .55 + "s";
    deco.append(span);
  });
}

function pokemonSparkBurst(count: number): void {
  count = Math.max(0,Math.min(48,Math.floor(count)));
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let index = 0; index < count; index += 1) {
    const spark = document.createElement("span");
    spark.className = "poke-spark";
    spark.textContent = index % 4 === 0 ? "◓" : index % 3 === 0 ? "✦" : "★";
    spark.style.left = randomInt(15,85) + "vw";
    spark.style.setProperty("--spark-x",randomInt(-110,110) + "px");
    spark.style.animationDelay = Math.random() * .18 + "s";
    document.body.append(spark);
    window.setTimeout(() => spark.remove(),1600);
  }
}

function decorateGameScreens(): void {
  const screenPokemon: Record<string,number> = {
    "screen-quiz":25,"screen-rain":129,"screen-mole":50,"screen-memory":132,
    "screen-ox":54,"screen-balloon":39,"screen-mine":100
  };
  Object.entries(screenPokemon).forEach(([screenId,pokemonId]) => {
    const screen = byId(screenId);
    const decoration = pokemonMedia(pokemonById(pokemonId),"battle-pokemon");
    decoration.classList.add("battle-decoration");
    decoration.setAttribute("aria-hidden","true");
    screen.append(decoration);
  });
}

function bindEvents(): void {
  byId("introNext").addEventListener("click", () => {
    ensureAudio();
    if (isAllowedTrainerName(getName())) {
      if (hasSavedAvatar()) enterApp();
      else showAvatarPicker(false);
    } else showNameForm(false);
  });
  byId<HTMLFormElement>("nameEntry").addEventListener("submit", (event) => {
    event.preventDefault();
    const enteredName = byId<HTMLInputElement>("nameInput").value;
    if (!isAllowedTrainerName(enteredName)) {
      showAccessDenied(nameChanging ? "허용되지 않은 이름이라 변경할 수 없습니다." : "접속할 수 없습니다.");
      return;
    }
    clearAccessMessage();
    nameChanging = false;
    setName(enteredName);
    if (hasSavedAvatar()) enterApp();
    else showAvatarPicker(false);
  });
  byId<HTMLInputElement>("nameInput").addEventListener("input", clearAccessMessage);
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
    showAvatarPicker(true);
  });
  byId("closeAvatar").addEventListener("click", closeAvatarPicker);
  byId("closeMoreMenu").addEventListener("click", () => closeMoreMenu(true));
  byId("moreMenuBackdrop").addEventListener("click", () => closeMoreMenu(true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && byId<HTMLDetailsElement>("sideMoreMenu").open) closeMoreMenu(true);
  });
  byId("changeNameButton").addEventListener("click", () => {
    cleanupGame();
    byId("app").classList.add("hidden-panel");
    byId("introOverlay").classList.remove("hidden-panel");
    showNameForm(true);
  });
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const nav = button.dataset.nav;
      if (nav === "dashboard") openDashboard();
      if (nav === "game") openGrades();
      if (nav === "today") openToday();
      if (nav === "pokedex") openPokedex();
      if (nav === "report") openReport();
      if (nav === "records") openRecords();
      if (nav === "help") openHelp();
      if (nav === "about") openAbout();
    });
  });
  byId("dashboardContinue").addEventListener("click",() => {
    const last = readLastPlay();
    if (!last) { openGrades(); return; }
    state.grade = last.grade; state.mode = last.mode; state.diff = last.diff; startSelectedGame();
  });
  byId("dashboardGames").addEventListener("click",openGrades);
  byId("dashboardToday").addEventListener("click",openToday);
  byId("dashboardDex").addEventListener("click",openPokedex);
  document.querySelectorAll<HTMLButtonElement>("[data-help-category]").forEach((button) => button.addEventListener("click",() => openHelp((button.dataset.helpCategory ?? "all") as ModeMeta["category"] | "all")));
  byId<HTMLInputElement>("helpSearch").addEventListener("input",renderHelpCards);
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "grades") openGrades();
      if (action === "modes") {
        cleanupGame();
        buildModes();
      }
      if (action === "retry") startSelectedGame();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-quit]").forEach((button) => {
    button.addEventListener("click", () => {
      cleanupGame();
      buildModes();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-ox]").forEach((button) => {
    button.addEventListener("click", () => answerOx(button.dataset.ox === "true"));
  });
  byId("symmetryCheck").addEventListener("click",checkSymmetry);
  byId("symmetryHint").addEventListener("click",useSymmetryHint);
  document.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((button) => button.addEventListener("click",() => moveCoordinate(button.dataset.move ?? "")));
  document.querySelectorAll<HTMLButtonElement>("[data-snack-move]").forEach((button) => button.addEventListener("click",() => moveSnack(button.dataset.snackMove === "left" ? -12 : 12)));
  byId("snackField").addEventListener("pointerdown",(event) => moveSnackTo(event.clientX));
  byId("snackField").addEventListener("pointermove",(event) => { if (event.buttons === 1 || event.pointerType === "touch") moveSnackTo(event.clientX); });
  byId("mineReset").addEventListener("click", resetMineStage);
  byId("mineMode").addEventListener("click", toggleMineMode);
  byId("clearRecords").addEventListener("click", () => {
    if (window.confirm("모든 기록을 지울까요?")) {
      safeRemove(STORAGE.records);
      safeRemove(STORAGE.lifetimeStars);
      updateSideInfo();
      openRecords();
    }
  });
  byId<HTMLButtonElement>("musicButton").addEventListener("click", () => {
    musicEnabled = !musicEnabled;
    const button = byId<HTMLButtonElement>("musicButton");
    button.setAttribute("aria-pressed",String(musicEnabled));
    button.textContent = musicEnabled ? "음악 켜짐" : "음악 꺼짐";
    if (musicEnabled) startMusic(); else stopMusic();
  });
  byId<HTMLButtonElement>("sfxButton").addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    const button = byId<HTMLButtonElement>("sfxButton");
    button.setAttribute("aria-pressed",String(sfxEnabled));
    button.textContent = sfxEnabled ? "효과음 켜짐" : "효과음 꺼짐";
  });
  document.addEventListener("keydown", (event) => {
    if (snack?.running && event.key === "ArrowLeft") { event.preventDefault(); moveSnack(-8); }
    if (snack?.running && event.key === "ArrowRight") { event.preventDefault(); moveSnack(8); }
    if (event.key === "Escape" && !byId("app").classList.contains("hidden-panel")) {
      cleanupGame();
      buildModes();
    }
    if (quiz?.current && !quiz.choiceMode && !quiz.locked) {
      if (/^[0-9]$/.test(event.key) && quiz.input.length < 7) {
        quiz.input += event.key;
        byId("quizAnswer").textContent = quiz.input;
      } else if (event.key === "Backspace") {
        event.preventDefault();
        quiz.input = quiz.input.slice(0,-1);
        byId("quizAnswer").textContent = quiz.input || "?";
      } else if (event.key === "Enter" && quiz.input) answerQuiz(Number(quiz.input),null);
    } else if (rain?.running) {
      if (/^[0-9]$/.test(event.key)) rainNumber(event.key);
      else if (event.key === "Backspace") {
        event.preventDefault();
        rainDelete();
      } else if (event.key === "Enter") rainSubmit();
    }
    if (ox?.running) {
      if (event.key.toLowerCase() === "o" || event.key === "ArrowLeft") answerOx(true);
      if (event.key.toLowerCase() === "x" || event.key === "ArrowRight") answerOx(false);
    }
    if (mine?.running && event.key.toLowerCase() === "f") toggleMineMode();
  });
}

function restoreLastPlay(): void {
  const last = readLastPlay();
  if (!last) return;
  state.grade = last.grade;
  state.mode = last.mode;
  state.diff = last.diff;
}

buildBackground();
decorateGameScreens();
bindEvents();
restoreLastPlay();
startIntro();
