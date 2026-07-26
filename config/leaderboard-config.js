// Supabase 프로젝트를 만든 뒤 아래 두 값만 입력하세요.
// publishableKey에는 공개용 Publishable key 또는 legacy anon key만 사용합니다.
// service_role / secret key는 GitHub에 절대 올리지 마세요.
window.POKE_LEADERBOARD_CONFIG = Object.freeze({
  enabled: false,
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "YOUR_PUBLISHABLE_KEY",
  table: "trainer_scores"
});
