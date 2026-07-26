import { readFileSync, statSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path,import.meta.url),"utf8");
const main = read("dist/main.js");
const css = read("dist/styles.css");
const html = read("index.html");
const pkg = JSON.parse(read("package.json"));
const failures = [];

const requireText = (source,text,label) => {
  if (!source.includes(text)) failures.push(label);
};

requireText(main,"발챙이 역사 시간여행","발챙이 역사 게임이 배포 파일에 없습니다.");
requireText(main,"꼬부기 생활안전 구조대","생활안전 구조대가 배포 파일에 없습니다.");
requireText(main,"Math.min(48","반짝이 생성 안전 상한이 없습니다.");
requireText(css,"prefers-reduced-motion","모션 감소 대응 CSS가 없습니다.");
requireText(html,"serviceWorker.register","서비스 워커 등록 코드가 없습니다.");

if (pkg.version !== "1.0.0") failures.push("package.json 버전이 1.0.0이 아닙니다.");
if (statSync(new URL("../dist/main.js",import.meta.url)).size > 350_000) failures.push("main.js가 350KB를 초과했습니다.");
if (statSync(new URL("../dist/styles.css",import.meta.url)).size > 300_000) failures.push("styles.css가 300KB를 초과했습니다.");

if (failures.length) {
  console.error("배포 점검 실패\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("포켓몬 배움 탐험대 v1.0 배포 점검을 통과했습니다.");
