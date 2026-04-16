/* ─── Syllabridge · Dashboard script2.js ─────────────────── */
'use strict';

// ══════════════════════════════════════════════════════════════
//  DATA ENGINE — reads payload from localStorage (set by page 1)
//  Falls back to demo data so the page works standalone too.
// ══════════════════════════════════════════════════════════════

function loadPayload() {
  try {
    const raw = localStorage.getItem('syllabridge_payload');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Demo fallback
  return {
    goal: 'Full Stack Web Development',
    level: 'Intermediate',
    duration: '12 Weeks',
    hours: '10',
    styles: ['Video Lectures', 'Hands-on Projects'],
    email: 'user@example.com'
  };
}

// ──────────────────────────────────────────────────────────────
//  COURSE DATA GENERATOR (topic-aware)
// ──────────────────────────────────────────────────────────────

const TOPIC_DB = {
  default: {
    videos: [
      { title: 'Introduction & Roadmap', duration: '18 min', week: 1, ytId: 'ysEN5RaKOlA', desc: 'Overview of the learning path, tools needed, and what you'll build by the end.', lc: [] },
      { title: 'Core Concepts — Part 1', duration: '32 min', week: 1, ytId: 'PkZNo7MFNFg', desc: 'Foundational theory and concepts explained clearly with examples.', lc: [{ label: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' }] },
      { title: 'Core Concepts — Part 2', duration: '28 min', week: 1, ytId: 'W6NZfCO5SIk', desc: 'Continuing with advanced aspects of the core ideas.', lc: [] },
      { title: 'Hands-On Project Setup', duration: '24 min', week: 2, ytId: 'Ke90Tje7VS0', desc: 'Setting up your dev environment and scaffolding your first project.', lc: [] },
      { title: 'Building Your First Feature', duration: '41 min', week: 2, ytId: 'mU6anWqZJcc', desc: 'Step-by-step walkthrough building a core feature from scratch.', lc: [{ label: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/' }] },
      { title: 'Deep Dive: Advanced Patterns', duration: '35 min', week: 3, ytId: 'rfscVS0vtbw', desc: 'Advanced design patterns and best practices used in real production code.', lc: [{ label: 'Best Time to Buy Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' }] },
      { title: 'Testing & Debugging', duration: '27 min', week: 3, ytId: 'FgnxcUQ5vho', desc: 'Unit testing, debugging strategies, and catching edge cases.', lc: [] },
      { title: 'Performance Optimisation', duration: '31 min', week: 4, ytId: 'x2RNw4M6cME', desc: 'Profiling, optimisation techniques, and measuring improvement.', lc: [{ label: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/' }] },
      { title: 'Deployment & CI/CD', duration: '22 min', week: 4, ytId: 'eB0nUzAI7M8', desc: 'Deploying your project to the cloud and setting up a CI/CD pipeline.', lc: [] },
      { title: 'Capstone Project Walkthrough', duration: '55 min', week: 5, ytId: 'pTFZFxd5uri', desc: 'Full capstone project built live — tie everything you've learnt together.', lc: [{ label: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/' }] },
    ],
    weeks: [
      { title: 'Foundations & Setup', focus: 'Core concepts, environment setup, first code', lc: 'https://leetcode.com/tag/array/' },
      { title: 'Core Building Blocks', focus: 'Project structure, feature development, data flow', lc: 'https://leetcode.com/tag/string/' },
      { title: 'Advanced Patterns', focus: 'Design patterns, testing, debugging', lc: 'https://leetcode.com/tag/dynamic-programming/' },
      { title: 'Optimisation & Deployment', focus: 'Performance, CI/CD, cloud deployment', lc: 'https://leetcode.com/tag/greedy/' },
      { title: 'Capstone & Review', focus: 'End-to-end project, code review, portfolio polish', lc: 'https://leetcode.com/tag/backtracking/' },
    ],
    resources: [
      { name: 'Official Documentation', type: 'doc', icon: '📖', desc: 'The primary reference. Read it alongside videos.', url: 'https://developer.mozilla.org', label: 'Visit Docs →' },
      { name: 'Roadmap.sh', type: 'web', icon: '🗺️', desc: 'Open-source visual learning roadmap for your topic.', url: 'https://roadmap.sh', label: 'View Roadmap →' },
      { name: 'GitHub Awesome List', type: 'gh', icon: '⭐', desc: 'Community-curated list of the best repos, libraries and tools.', url: 'https://github.com/sindresorhus/awesome', label: 'Browse GitHub →' },
      { name: 'YouTube Playlist', type: 'yt', icon: '▶', desc: 'Curated YouTube playlist matching your course content.', url: 'https://youtube.com', label: 'Watch Videos →' },
      { name: 'LeetCode Study Plan', type: 'lc', icon: '🧩', desc: 'Structured problem sets ordered from easy → medium → hard.', url: 'https://leetcode.com/study-plan/', label: 'Practice Now →' },
      { name: 'freeCodeCamp', type: 'web', icon: '🏕', desc: 'Free certifications and interactive challenges.', url: 'https://freecodecamp.org', label: 'Start Free →' },
    ]
  }
};

// Topic keyword matching
function getTopicData(goal = '') {
  // All topics share the same structure; in a real app you'd swap video IDs per topic
  return TOPIC_DB.default;
}

// Generate week lectures from topic weeks data + duration
function generatePlannerWeeks(topicData, durationWeeks) {
  const baseWeeks = topicData.weeks;
  const weeks = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const base = baseWeeks[(w - 1) % baseWeeks.length];
    weeks.push({
      week: w,
      title: base.title,
      focus: base.focus,
      lcUrl: base.lc,
      lectures: generateLecturesForWeek(w, base)
    });
  }
  return weeks;
}

function generateLecturesForWeek(week, base) {
  const templates = [
    { title: `Introduction to ${base.title}`, tags: ['video'] },
    { title: `${base.focus.split(',')[0]} — Theory`, tags: ['reading', 'video'] },
    { title: `Hands-on Exercise: ${base.focus.split(',')[0]}`, tags: ['project'] },
    { title: `LeetCode Practice Set`, tags: ['leetcode'] },
    { title: `Weekly Quiz & Reflection`, tags: ['quiz'] },
  ];
  return templates.map((t, i) => ({
    id: `w${week}-l${i + 1}`,
    title: t.title,
    tags: t.tags,
    done: false
  }));
}

// ══════════════════════════════════════════════════════════════
//  GRID CANVAS BACKGROUND
// ══════════════════════════════════════════════════════════════
function initCanvas() {
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const step = 52;
  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}
initCanvas();
window.addEventListener('resize', initCanvas);

// ══════════════════════════════════════════════════════════════
//  APP STATE
// ══════════════════════════════════════════════════════════════
const state = {
  payload: loadPayload(),
  topicData: null,
  plannerWeeks: [],
  currentVideoIndex: 0,
  completedVideos: new Set(),
  completedLectures: new Set(),
  activeTab: 'videos',
  sidebarOpen: true,
  get totalLectures() {
    return this.plannerWeeks.reduce((s, w) => s + w.lectures.length, 0);
  },
  get doneCount() { return this.completedLectures.size; }
};

// Persist to localStorage
function persist() {
  try {
    localStorage.setItem('sb_completed_videos', JSON.stringify([...state.completedVideos]));
    localStorage.setItem('sb_completed_lectures', JSON.stringify([...state.completedLectures]));
  } catch (_) {}
}
function restoreProgress() {
  try {
    const cv = localStorage.getItem('sb_completed_videos');
    const cl = localStorage.getItem('sb_completed_lectures');
    if (cv) JSON.parse(cv).forEach(v => state.completedVideos.add(v));
    if (cl) JSON.parse(cl).forEach(l => state.completedLectures.add(l));
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════
//  LANDING SCREEN
// ══════════════════════════════════════════════════════════════
function initLanding() {
  const p = state.payload;
  document.getElementById('metaGoal').textContent     = `🎯 ${p.goal || 'Your Course'}`;
  document.getElementById('metaLevel').textContent    = `🌿 ${p.level || 'Beginner'}`;
  document.getElementById('metaDuration').textContent = `📅 ${p.duration || '8 Weeks'}`;
  document.getElementById('metaHours').textContent    = `⏱ ${p.hours || '8'} hrs/week`;

  document.getElementById('continueBtn').addEventListener('click', launchDashboard);
}

// ══════════════════════════════════════════════════════════════
//  LAUNCH DASHBOARD
// ══════════════════════════════════════════════════════════════
function launchDashboard() {
  // Hide landing
  const landing = document.getElementById('landingScreen');
  landing.style.animation = 'fadeOut 0.4s ease forwards';
  setTimeout(() => {
    landing.classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    bootstrapDashboard();
  }, 380);
}

function bootstrapDashboard() {
  const p = state.payload;
  state.topicData = getTopicData(p.goal);

  // Parse duration weeks
  const durWeeks = parseInt(p.duration) || 8;

  state.plannerWeeks = generatePlannerWeeks(state.topicData, durWeeks);

  restoreProgress();

  // Populate sidebar info
  document.getElementById('sidebarTopic').textContent  = p.goal || 'Your Course';
  document.getElementById('sidebarLevel').textContent  = p.level || 'Beginner';
  document.getElementById('sidebarDuration').textContent = p.duration || '8 Weeks';
  document.getElementById('topbarMeta').textContent    = `${p.goal} · ${p.level}`;

  buildPlaylist();
  buildMiniPlaylist();
  buildPlannerWeeks();
  buildResources();
  updateProgress();

  // Select first video
  selectVideo(0);

  // Wire tabs
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('plannerQuickBtn').addEventListener('click', () => switchTab('planner'));

  // Sidebar toggle
  document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarClose').addEventListener('click', toggleSidebar);

  // Vid nav
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (state.currentVideoIndex > 0) selectVideo(state.currentVideoIndex - 1);
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    const vids = state.topicData.videos;
    if (state.currentVideoIndex < vids.length - 1) selectVideo(state.currentVideoIndex + 1);
  });

  // Mark done
  document.getElementById('markDoneBtn').addEventListener('click', () => {
    const idx = state.currentVideoIndex;
    const vid = state.topicData.videos[idx];
    if (state.completedVideos.has(idx)) {
      state.completedVideos.delete(idx);
    } else {
      state.completedVideos.add(idx);
    }
    persist();
    refreshPlaylistItem(idx);
    refreshMiniPlaylistItem(idx);
    updateVideoMeta(idx);
    updateProgress();
  });

  // Open YT
  document.getElementById('openYTBtn').addEventListener('click', () => {
    const vid = state.topicData.videos[state.currentVideoIndex];
    window.open(`https://www.youtube.com/watch?v=${vid.ytId}`, '_blank');
  });
}

// ══════════════════════════════════════════════════════════════
//  SIDEBAR PLAYLIST
// ══════════════════════════════════════════════════════════════
function buildPlaylist() {
  const container = document.getElementById('playlist');
  const videos = state.topicData.videos;
  let lastWeek = null;
  let html = '';

  videos.forEach((v, i) => {
    if (v.week !== lastWeek) {
      html += `<div class="pl-week-label">Week ${v.week}</div>`;
      lastWeek = v.week;
    }
    const done = state.completedVideos.has(i);
    html += `
      <div class="pl-item${done ? ' done' : ''}" data-idx="${i}" id="pl-${i}">
        <div class="pl-num">${done ? '✓' : i + 1}</div>
        <div class="pl-info">
          <div class="pl-title">${v.title}</div>
          <div class="pl-meta">${v.duration}</div>
        </div>
      </div>`;
  });
  container.innerHTML = html;

  container.addEventListener('click', e => {
    const item = e.target.closest('.pl-item');
    if (item) selectVideo(+item.dataset.idx);
  });
}

function refreshPlaylistItem(idx) {
  const el = document.getElementById(`pl-${idx}`);
  if (!el) return;
  const done = state.completedVideos.has(idx);
  el.classList.toggle('done', done);
  el.querySelector('.pl-num').textContent = done ? '✓' : idx + 1;
}

// ══════════════════════════════════════════════════════════════
//  MINI PLAYLIST (right panel)
// ══════════════════════════════════════════════════════════════
function buildMiniPlaylist() {
  const list = document.getElementById('mpList');
  const count = document.getElementById('mpCount');
  const videos = state.topicData.videos;
  count.textContent = `${videos.length} lectures`;
  let html = '';
  videos.forEach((v, i) => {
    const done = state.completedVideos.has(i);
    html += `
      <div class="pl-item${done ? ' done' : ''}" data-idx="${i}" id="mp-${i}" style="margin-bottom:3px">
        <div class="pl-num">${done ? '✓' : i + 1}</div>
        <div class="pl-info">
          <div class="pl-title" style="font-size:12px">${v.title}</div>
          <div class="pl-meta">${v.duration}</div>
        </div>
      </div>`;
  });
  list.innerHTML = html;
  list.addEventListener('click', e => {
    const item = e.target.closest('.pl-item');
    if (item) selectVideo(+item.dataset.idx);
  });
}

function refreshMiniPlaylistItem(idx) {
  const el = document.getElementById(`mp-${idx}`);
  if (!el) return;
  const done = state.completedVideos.has(idx);
  el.classList.toggle('done', done);
  el.querySelector('.pl-num').textContent = done ? '✓' : idx + 1;
}

// ══════════════════════════════════════════════════════════════
//  VIDEO SELECTION & PLAYER
// ══════════════════════════════════════════════════════════════
function selectVideo(idx) {
  const videos = state.topicData.videos;
  if (idx < 0 || idx >= videos.length) return;

  // Deactivate old
  document.querySelectorAll('.pl-item.active').forEach(el => el.classList.remove('active'));

  state.currentVideoIndex = idx;
  const vid = videos[idx];

  // Activate playlist items
  const plEl = document.getElementById(`pl-${idx}`);
  const mpEl = document.getElementById(`mp-${idx}`);
  plEl?.classList.add('active');
  mpEl?.classList.add('active');
  plEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Embed YouTube
  const embedWrap  = document.getElementById('youtubeEmbed');
  const placeholder = document.getElementById('playerPlaceholder');
  embedWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid.ytId}?autoplay=1&rel=0&modestbranding=1"
    allowfullscreen allow="autoplay; encrypted-media" loading="lazy"></iframe>`;
  embedWrap.classList.remove('hidden');
  placeholder.classList.add('hidden');

  updateVideoMeta(idx);

  // Nav counts
  document.getElementById('vidNavCount').textContent = `${idx + 1} / ${videos.length}`;
  document.getElementById('prevBtn').disabled = idx === 0;
  document.getElementById('nextBtn').disabled = idx === videos.length - 1;

  // Switch to videos tab if not already
  if (state.activeTab !== 'videos') switchTab('videos');
}

function updateVideoMeta(idx) {
  const vid = state.topicData.videos[idx];
  const done = state.completedVideos.has(idx);

  document.getElementById('viTitle').textContent = vid.title;
  document.getElementById('viMeta').textContent  = `Week ${vid.week} · ${vid.duration}`;
  document.getElementById('viDesc').textContent  = vid.desc;

  const markBtn = document.getElementById('markDoneBtn');
  markBtn.textContent = done ? '✓ Done!' : '✓ Mark Done';
  markBtn.classList.toggle('done-btn', done);

  // LeetCode
  const lcRow = document.getElementById('lcRow');
  lcRow.innerHTML = vid.lc.length
    ? `<span style="font-size:11px;color:var(--text-muted);margin-right:4px">🧩 Practice:</span>`
      + vid.lc.map(l => `<a class="lc-tag" href="${l.url}" target="_blank">⚡ ${l.label}</a>`).join('')
    : '';
}

// ══════════════════════════════════════════════════════════════
//  PLANNER
// ══════════════════════════════════════════════════════════════
function buildPlannerWeeks() {
  const container = document.getElementById('weekGrid');
  const plannerSub = document.getElementById('plannerSub');
  plannerSub.textContent = `${state.plannerWeeks.length}-week personalised study schedule · ${state.payload.hours} hrs/week`;

  container.innerHTML = state.plannerWeeks.map(w => buildWeekCard(w)).join('');

  // Expand first week by default
  const first = container.querySelector('.week-card');
  if (first) first.classList.add('expanded');

  // Toggle expand
  container.addEventListener('click', e => {
    const head = e.target.closest('.week-head');
    if (head) {
      head.closest('.week-card').classList.toggle('expanded');
    }
    // Lecture check
    const check = e.target.closest('.lec-check');
    if (check) {
      const row = check.closest('.lecture-row');
      const lid = row.dataset.lid;
      if (state.completedLectures.has(lid)) {
        state.completedLectures.delete(lid);
        row.classList.remove('lec-done');
        check.textContent = '';
      } else {
        state.completedLectures.add(lid);
        row.classList.add('lec-done');
        check.textContent = '✓';
      }
      persist();
      refreshWeekProgress(row.closest('.week-card'));
      updateProgress();
    }
  });
}

function buildWeekCard(w) {
  const lectures = w.lectures.map(l => {
    const done = state.completedLectures.has(l.id);
    const tags = l.tags.map(t => `<span class="lec-tag tag-${t}">${t}</span>`).join('');
    return `
      <div class="lecture-row${done ? ' lec-done' : ''}" data-lid="${l.id}">
        <div class="lec-check">${done ? '✓' : ''}</div>
        <div class="lec-info">
          <div class="lec-title">${l.title}</div>
          <div class="lec-tags">${tags}</div>
        </div>
      </div>`;
  }).join('');

  const doneCount = w.lectures.filter(l => state.completedLectures.has(l.id)).length;
  const pct = w.lectures.length ? Math.round((doneCount / w.lectures.length) * 100) : 0;
  const weekDone = pct === 100 ? ' week-done' : '';

  return `
    <div class="week-card${weekDone}" data-week="${w.week}">
      <div class="week-head">
        <div class="week-head-left">
          <span class="week-badge">Week ${w.week}</span>
          <span class="week-title">${w.title}</span>
        </div>
        <span class="week-toggle">▼</span>
      </div>
      <div class="week-body">
        <div class="lecture-list">${lectures}</div>
        <div class="week-footer">
          <div class="week-progress-row">
            <div class="week-prog-track">
              <div class="week-prog-fill" style="width:${pct}%"></div>
            </div>
            <span class="week-prog-label">${pct}%</span>
          </div>
          <a class="week-lc-btn" href="${w.lcUrl}" target="_blank">🧩 LeetCode</a>
        </div>
      </div>
    </div>`;
}

function refreshWeekProgress(card) {
  const rows = card.querySelectorAll('.lecture-row');
  const done = card.querySelectorAll('.lecture-row.lec-done').length;
  const pct  = rows.length ? Math.round((done / rows.length) * 100) : 0;
  card.querySelector('.week-prog-fill').style.width = pct + '%';
  card.querySelector('.week-prog-label').textContent = pct + '%';
  card.classList.toggle('week-done', pct === 100);
}

// ══════════════════════════════════════════════════════════════
//  RESOURCES
// ══════════════════════════════════════════════════════════════
function buildResources() {
  const grid = document.getElementById('resGrid');
  const typeClass = { yt:'res-type-yt', gh:'res-type-gh', doc:'res-type-doc', lc:'res-type-lc', web:'res-type-web' };

  grid.innerHTML = state.topicData.resources.map(r => `
    <a class="res-card" href="${r.url}" target="_blank" rel="noopener">
      <div class="res-card-top">
        <div class="res-type-icon ${typeClass[r.type] || 'res-type-web'}">${r.icon}</div>
        <span class="res-name">${r.name}</span>
      </div>
      <p class="res-desc">${r.desc}</p>
      <span class="res-link">${r.label}</span>
    </a>`
  ).join('');
}

// ══════════════════════════════════════════════════════════════
//  PROGRESS
// ══════════════════════════════════════════════════════════════
function updateProgress() {
  const total = state.totalLectures;
  const done  = state.doneCount;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressLabel').textContent = `${pct}% Complete`;

  // Ring
  const circumference = 113;
  const offset = circumference - (circumference * pct / 100);
  document.getElementById('ringProgress').style.strokeDashoffset = offset;
  document.getElementById('ringPct').textContent = pct + '%';
}

// ══════════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════════
function switchTab(tab) {
  state.activeTab = tab;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== `tab-${tab}`);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    if (!p.classList.contains('hidden')) p.classList.add('active');
    else p.classList.remove('active');
  });

  const titles = { videos: 'Video Lectures', planner: 'Lecture Planner', resources: 'Resources' };
  document.getElementById('topbarTitle').textContent = titles[tab] || tab;

  // Playlist only visible in videos tab
  document.getElementById('playlist').style.display = tab === 'videos' ? '' : 'none';
}

// ══════════════════════════════════════════════════════════════
//  SIDEBAR TOGGLE
// ══════════════════════════════════════════════════════════════
function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !state.sidebarOpen);
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', initLanding);

// fadeOut keyframe (injected at runtime)
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = '@keyframes fadeOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}';
document.head.appendChild(fadeOutStyle);
