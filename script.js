/* ─── Syllabridge · Course Input Form JS ─────────────────── */

(function () {
  'use strict';

  // ── DOM refs ────────────────────────────────────────────
  const form       = document.getElementById('courseForm');
  const steps      = document.querySelectorAll('.form-step');
  const stepDots   = document.querySelectorAll('.step');
  const stepLines  = document.querySelectorAll('.step-line');
  const formSection   = document.getElementById('form-section');
  const successScreen = document.getElementById('successScreen');
  const successSummary = document.getElementById('successSummary');
  const restartBtn = document.getElementById('restartBtn');

  let currentStep = 1;

  // ── Step navigation ─────────────────────────────────────
  function goToStep(n) {
    steps.forEach((s, i) => {
      s.classList.toggle('hidden', i + 1 !== n);
    });
    stepDots.forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 === n)  dot.classList.add('active');
      if (i + 1 < n)    dot.classList.add('done');
    });
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Char counter ─────────────────────────────────────────
  const goalTextarea = document.getElementById('courseGoal');
  const charCount    = document.getElementById('charCount');

  goalTextarea.addEventListener('input', () => {
    charCount.textContent = goalTextarea.value.length;
  });

  // ── Chip selection ────────────────────────────────────────
  document.getElementById('chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chip.classList.toggle('selected');
    // Set textarea to last selected chip (if empty)
    const selected = [...document.querySelectorAll('.chip.selected')]
      .map(c => c.dataset.value).join(', ');
    goalTextarea.value = selected;
    charCount.textContent = goalTextarea.value.length;
    clearError('goalError', 'courseGoal');
  });

  // ── Range slider ──────────────────────────────────────────
  const rangeInput = document.getElementById('hoursPerWeek');
  const rangeVal   = document.getElementById('rangeVal');

  rangeInput.addEventListener('input', () => {
    rangeVal.textContent = `${rangeInput.value} hrs/week`;
    updateRangeTrack();
  });

  function updateRangeTrack() {
    const min = +rangeInput.min, max = +rangeInput.max, val = +rangeInput.value;
    const pct = ((val - min) / (max - min)) * 100;
    rangeInput.style.background =
      `linear-gradient(90deg, var(--accent) ${pct}%, var(--surface2) ${pct}%)`;
  }
  updateRangeTrack();

  // ── Error helpers ─────────────────────────────────────────
  function showError(errId, inputId) {
    document.getElementById(errId).classList.add('visible');
    if (inputId) document.getElementById(inputId)?.classList.add('error');
  }
  function clearError(errId, inputId) {
    document.getElementById(errId).classList.remove('visible');
    if (inputId) document.getElementById(inputId)?.classList.remove('error');
  }

  // ── Step 1 validation ─────────────────────────────────────
  document.getElementById('nextBtn1').addEventListener('click', () => {
    const goal = goalTextarea.value.trim();
    if (!goal) {
      showError('goalError', 'courseGoal');
      goalTextarea.focus();
      return;
    }
    clearError('goalError', 'courseGoal');
    goToStep(2);
  });

  goalTextarea.addEventListener('input', () => clearError('goalError', 'courseGoal'));

  // ── Step 2 validation ─────────────────────────────────────
  document.getElementById('nextBtn2').addEventListener('click', () => {
    let valid = true;

    const level = document.getElementById('skillLevel');
    if (!level.value) {
      showError('levelError', 'skillLevel');
      valid = false;
    } else { clearError('levelError', 'skillLevel'); }

    const dur = document.getElementById('duration');
    if (!dur.value) {
      showError('durationError', 'duration');
      valid = false;
    } else { clearError('durationError', 'duration'); }

    const email = document.getElementById('email');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.value.trim())) {
      showError('emailError', 'email');
      valid = false;
    } else { clearError('emailError', 'email'); }

    if (!valid) return;

    buildReview();
    goToStep(3);
  });

  ['skillLevel', 'duration'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      clearError(id + 'Error', id);
    });
  });
  document.getElementById('email').addEventListener('input', () => {
    clearError('emailError', 'email');
  });

  // ── Back buttons ──────────────────────────────────────────
  document.getElementById('backBtn2').addEventListener('click', () => goToStep(1));
  document.getElementById('backBtn3').addEventListener('click', () => goToStep(2));

  // ── Build review ──────────────────────────────────────────
  function buildReview() {
    const levelMap = {
      beginner: '🌱 Beginner',
      intermediate: '🌿 Intermediate',
      advanced: '🌳 Advanced'
    };
    const durMap = { 4:'4 Weeks', 8:'8 Weeks', 12:'12 Weeks', 24:'24 Weeks' };

    const goal    = goalTextarea.value.trim();
    const level   = document.getElementById('skillLevel').value;
    const dur     = document.getElementById('duration').value;
    const hrs     = document.getElementById('hoursPerWeek').value;
    const email   = document.getElementById('email').value.trim();
    const styles  = [...document.querySelectorAll('input[name="style"]:checked')]
                      .map(c => c.value).join(', ') || 'None selected';

    document.getElementById('reviewGrid').innerHTML = `
      <div class="review-item full">
        <div class="review-key">Learning Goal</div>
        <div class="review-val">${escHtml(goal)}</div>
      </div>
      <div class="review-item">
        <div class="review-key">Skill Level</div>
        <div class="review-val">${levelMap[level] || level}</div>
      </div>
      <div class="review-item">
        <div class="review-key">Duration</div>
        <div class="review-val">${durMap[dur] || dur + ' weeks'}</div>
      </div>
      <div class="review-item">
        <div class="review-key">Hours / Week</div>
        <div class="review-val">${hrs} hrs/week</div>
      </div>
      <div class="review-item">
        <div class="review-key">Learning Style</div>
        <div class="review-val">${escHtml(styles)}</div>
      </div>
      <div class="review-item full">
        <div class="review-key">Email</div>
        <div class="review-val">${escHtml(email)}</div>
      </div>
    `;
  }

  // ── Form submit ───────────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
      showError('termsError', null);
      return;
    }
    clearError('termsError', null);

    // Collect all data
    const payload = collectPayload();

    // UI: loading state
    const btnLabel  = document.getElementById('submitBtn').querySelector('.btn-label');
    const btnLoader = document.getElementById('btnLoader');
    btnLabel.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    document.getElementById('submitBtn').disabled = true;

    // Simulate async submission (replace with real API call)
    await simulateSubmit(payload);

    // Show success
    showSuccess(payload);
  });

  termsCheckLiveHide();
  function termsCheckLiveHide() {
    document.getElementById('termsCheck').addEventListener('change', () => {
      clearError('termsError', null);
    });
  }

  function collectPayload() {
    const levelMap = {
      beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'
    };
    const durMap = { 4:'4 Weeks', 8:'8 Weeks', 12:'12 Weeks', 24:'24 Weeks' };
    const styles = [...document.querySelectorAll('input[name="style"]:checked')]
      .map(c => ({
        video: 'Video Lectures',
        reading: 'Reading / Docs',
        projects: 'Hands-on Projects',
        problems: 'Problem Solving'
      }[c.value] || c.value));

    return {
      goal:     goalTextarea.value.trim(),
      level:    levelMap[document.getElementById('skillLevel').value] || '',
      duration: durMap[document.getElementById('duration').value] || '',
      hours:    document.getElementById('hoursPerWeek').value,
      styles,
      email:    document.getElementById('email').value.trim(),
      timestamp: new Date().toISOString()
    };
  }

  function simulateSubmit(payload) {
    console.log('[Syllabridge] Course Request Payload:', payload);
    // Persist payload so dashboard page can read it
    try { localStorage.setItem('syllabridge_payload', JSON.stringify(payload)); } catch (_) {}
    return new Promise(res => setTimeout(res, 1800));
  }

  function showSuccess(payload) {
    formSection.classList.add('hidden');
    successScreen.classList.remove('hidden');

    const pills = [
      payload.goal.slice(0, 40) + (payload.goal.length > 40 ? '…' : ''),
      payload.level,
      payload.duration,
      payload.hours + ' hrs/week'
    ];
    successSummary.innerHTML = pills.map(p =>
      `<span class="s-pill">${escHtml(p)}</span>`
    ).join('');

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      window.location.href = 'index2.html';
    }, 2200);
  }

  // ── Restart (now goes straight to dashboard) ─────────────
  restartBtn.addEventListener('click', () => {
    window.location.href = 'index2.html';
  });

  // ── Utility ───────────────────────────────────────────────
  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

})();
