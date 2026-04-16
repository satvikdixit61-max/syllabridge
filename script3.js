/* ─── Syllabridge · AI Course Intelligence · script3.js ──── */
'use strict';

// ══════════════════════════════════════════════════════════════
//  CANVAS GRID BACKGROUND
// ══════════════════════════════════════════════════════════════
function initCanvas() {
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 1;
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
//  LOAD PAYLOAD
// ══════════════════════════════════════════════════════════════
function loadPayload() {
  try {
    const raw = localStorage.getItem('syllabridge_payload');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    goal:     'Full Stack Web Development',
    level:    'Intermediate',
    duration: '12 Weeks',
    hours:    '10',
    styles:   ['Video Lectures', 'Hands-on Projects'],
    email:    'user@example.com'
  };
}

const payload = loadPayload();
const durationWeeks = parseInt(payload.duration) || 8;

// ══════════════════════════════════════════════════════════════
//  FILL HEADER & STATS
// ══════════════════════════════════════════════════════════════
function initUI() {
  // Header
  document.getElementById('headerGoal').textContent     = payload.goal     || 'Your Course';
  document.getElementById('headerLevel').textContent    = payload.level    || '—';
  document.getElementById('headerDuration').textContent = payload.duration || '—';

  // Stats
  document.getElementById('statWeeksVal').textContent = durationWeeks;
  document.getElementById('statHoursVal').textContent = (payload.hours || '—') + ' hrs';
  document.getElementById('statLevelVal').textContent = payload.level || '—';
}
initUI();

// ══════════════════════════════════════════════════════════════
//  ANTHROPIC API CALL
// ══════════════════════════════════════════════════════════════
async function callClaude(messages, systemPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system:     systemPrompt,
      messages:   messages
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }
  const data = await response.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

// ══════════════════════════════════════════════════════════════
//  ROADMAP GENERATION
// ══════════════════════════════════════════════════════════════
const generateBtn   = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const roadmapEmpty  = document.getElementById('roadmapEmpty');
const roadmapLoading= document.getElementById('roadmapLoading');
const roadmapWeeks  = document.getElementById('roadmapWeeks');
const roadmapError  = document.getElementById('roadmapError');
const roadmapErrorMsg = document.getElementById('roadmapErrorMsg');
const termCmd       = document.getElementById('termCmd');
const termStream    = document.getElementById('termStream');
const retryBtn      = document.getElementById('retryBtn');

const termSteps = [
  'analyzing learning goal…',
  'calibrating difficulty for your level…',
  'mapping topic dependencies…',
  'curating week-by-week schedule…',
  'adding milestones & resources…',
  'finalizing your roadmap…'
];

let termStepIndex = 0;
let termInterval  = null;

function startTerminalAnimation() {
  termStepIndex = 0;
  termStream.textContent = '';
  termCmd.textContent = termSteps[0];
  termInterval = setInterval(() => {
    termStepIndex = (termStepIndex + 1) % termSteps.length;
    termCmd.textContent = termSteps[termStepIndex];
    termStream.textContent += `> ${termSteps[termStepIndex]}\n`;
  }, 900);
}

function stopTerminalAnimation() {
  clearInterval(termInterval);
}

function setRoadmapState(state) {
  roadmapEmpty.classList.add('hidden');
  roadmapLoading.classList.add('hidden');
  roadmapWeeks.classList.add('hidden');
  roadmapError.classList.add('hidden');
  if (state === 'empty')   roadmapEmpty.classList.remove('hidden');
  if (state === 'loading') roadmapLoading.classList.remove('hidden');
  if (state === 'weeks')   roadmapWeeks.classList.remove('hidden');
  if (state === 'error')   roadmapError.classList.remove('hidden');
}

generateBtn.addEventListener('click', generateRoadmap);
retryBtn.addEventListener('click', generateRoadmap);

async function generateRoadmap() {
  generateBtn.disabled  = true;
  generateBtnText.textContent = 'Generating…';
  setRoadmapState('loading');
  startTerminalAnimation();

  const systemPrompt = `You are Syllabridge AI, an expert curriculum designer. Generate concise, practical learning roadmaps. Always respond with valid JSON only — no markdown fences, no extra text.`;

  const userMsg = `Generate a ${durationWeeks}-week personalized learning roadmap for someone who wants to: "${payload.goal}".
Level: ${payload.level}
Hours per week: ${payload.hours}
Preferred styles: ${(payload.styles || []).join(', ')}

Return ONLY a JSON array (no extra text, no markdown) of exactly ${Math.min(durationWeeks, 8)} week objects with this shape:
[
  {
    "week": 1,
    "title": "Short catchy week title",
    "focus": "One sentence describing this week's focus (max 15 words)",
    "topics": ["Topic A", "Topic B", "Topic C"],
    "milestone": "What the learner will be able to do by end of this week",
    "leetcodeTag": "arrays"
  }
]
Keep titles short, topics practical, milestones achievable.`;

  try {
    const raw = await callClaude([{ role: 'user', content: userMsg }], systemPrompt);

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const weeks   = JSON.parse(cleaned);

    stopTerminalAnimation();
    renderRoadmapWeeks(weeks);
    setRoadmapState('weeks');
  } catch (err) {
    stopTerminalAnimation();
    roadmapErrorMsg.textContent = err.message || 'Something went wrong. Please try again.';
    setRoadmapState('error');
  } finally {
    generateBtn.disabled    = false;
    generateBtnText.textContent = 'Regenerate';
  }
}

function renderRoadmapWeeks(weeks) {
  const LC_BASE = 'https://leetcode.com/tag/';
  roadmapWeeks.innerHTML = weeks.map((w, i) => `
    <div class="week-ai-card${i === 0 ? ' expanded' : ''}" data-week="${w.week}" style="animation-delay:${i * 0.06}s">
      <div class="wk-head">
        <div class="wk-head-left">
          <span class="wk-num">Week ${w.week}</span>
          <span class="wk-title-text">${escHtml(w.title)}</span>
        </div>
        <span class="wk-chevron">▼</span>
      </div>
      <div class="wk-body">
        <div class="wk-inner">
          <p class="wk-focus">${escHtml(w.focus)}</p>
          <div>
            <div class="wk-section-title">Topics</div>
            <div class="wk-topics">
              ${(w.topics || []).map(t => `<span class="wk-topic-chip">${escHtml(t)}</span>`).join('')}
            </div>
          </div>
          <div class="wk-milestone">
            <span class="wk-milestone-icon">🏁</span>
            <span>${escHtml(w.milestone)}</span>
          </div>
          ${w.leetcodeTag ? `
          <a class="wk-lc-link" href="${LC_BASE}${encodeURIComponent(w.leetcodeTag)}" target="_blank" rel="noopener">
            🧩 LeetCode: ${escHtml(w.leetcodeTag)}
          </a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Accordion toggle
  roadmapWeeks.addEventListener('click', e => {
    const head = e.target.closest('.wk-head');
    if (head) head.closest('.week-ai-card').classList.toggle('expanded');
  });
}

// ══════════════════════════════════════════════════════════════
//  CHAT
// ══════════════════════════════════════════════════════════════
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSendBtn  = document.getElementById('chatSendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const chatSuggestions = document.getElementById('chatSuggestions');

// Conversation history for multi-turn context
const conversationHistory = [];

const CHAT_SYSTEM = `You are Syllabridge AI, a friendly and knowledgeable learning assistant helping a student master "${payload.goal}".
Student profile: Level = ${payload.level}, Duration = ${payload.duration}, Hours/week = ${payload.hours} hrs.
Preferred styles: ${(payload.styles || []).join(', ')}.
Be concise, warm, practical. Use short paragraphs. When listing resources, be specific (real platforms, free links). Keep responses under 200 words.`;

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Send on Enter (Shift+Enter = newline)
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

chatSendBtn.addEventListener('click', sendChatMessage);

// Suggestions
chatSuggestions.addEventListener('click', e => {
  const chip = e.target.closest('.sug-chip');
  if (!chip) return;
  chatInput.value = chip.dataset.prompt;
  chatInput.dispatchEvent(new Event('input'));
  sendChatMessage();
  chatSuggestions.classList.add('hidden'); // hide after first use
});

// Clear chat
clearChatBtn.addEventListener('click', () => {
  chatMessages.innerHTML = '';
  conversationHistory.length = 0;
  chatSuggestions.classList.remove('hidden');
  appendAIMessage('Chat cleared! Ask me anything about your learning journey.');
});

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatSendBtn.disabled = true;
  chatSuggestions.classList.add('hidden');

  // Append user message
  appendUserMessage(text);

  // Add to history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing indicator
  const typingEl = appendTyping();

  try {
    // Keep only last 10 turns for context window
    const messages = conversationHistory.slice(-10);
    const reply = await callClaude(messages, CHAT_SYSTEM);

    // Add AI reply to history
    conversationHistory.push({ role: 'assistant', content: reply });

    typingEl.remove();
    appendAIMessage(reply);
  } catch (err) {
    typingEl.remove();
    appendAIMessage(`⚠ Sorry, I hit an error: ${err.message}. Please try again.`);
  } finally {
    chatSendBtn.disabled = false;
    chatInput.focus();
  }
}

function appendUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = `
    <div class="msg-avatar">You</div>
    <div class="msg-bubble">${escHtml(text)}</div>
  `;
  chatMessages.appendChild(div);
  scrollChat();
}

function appendAIMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg ai';
  // Convert simple markdown-like newlines to paragraphs
  const formatted = text
    .split('\n\n').filter(Boolean)
    .map(para => `<p>${escHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
  div.innerHTML = `
    <div class="msg-avatar">✦</div>
    <div class="msg-bubble">${formatted || escHtml(text)}</div>
  `;
  chatMessages.appendChild(div);
  scrollChat();
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg ai';
  div.innerHTML = `
    <div class="msg-avatar">✦</div>
    <div class="typing-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollChat();
  return div;
}

function scrollChat() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ══════════════════════════════════════════════════════════════
//  NOTES — auto-save to localStorage
// ══════════════════════════════════════════════════════════════
const notesArea = document.getElementById('notesArea');
const NOTES_KEY = 'sb_notes';

// Restore notes
try {
  const saved = localStorage.getItem(NOTES_KEY);
  if (saved) notesArea.value = saved;
} catch (_) {}

let notesSaveTimer = null;
notesArea.addEventListener('input', () => {
  clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(() => {
    try { localStorage.setItem(NOTES_KEY, notesArea.value); } catch (_) {}
  }, 600);
});

// ══════════════════════════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════════════════════════
function escHtml(str) {
  if (typeof str !== 'string') str = String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
