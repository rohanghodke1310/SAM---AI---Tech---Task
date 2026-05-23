// ── STATE ──────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';
let editingId = null;

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  loadTheme();
  render();
  bindEvents();
});

function setDate() {
  const d = new Date();
  document.getElementById('dateDisplay').textContent =
    d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── SAVE ───────────────────────────────────────────────────
function save() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// ── ADD TASK ───────────────────────────────────────────────
function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  if (!text) {
    document.getElementById('taskInput').style.borderColor = 'var(--red)';
    setTimeout(() => document.getElementById('taskInput').style.borderColor = '', 1500);
    return;
  }

  const task = {
    id: Date.now(),
    text,
    priority: document.getElementById('prioritySelect').value,
    category: document.getElementById('categorySelect').value,
    dueDate: document.getElementById('dueDateInput').value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  save();
  render();

  document.getElementById('taskInput').value = '';
  document.getElementById('dueDateInput').value = '';
  document.getElementById('prioritySelect').value = 'medium';
  document.getElementById('categorySelect').value = 'general';
}

// ── TOGGLE COMPLETE ────────────────────────────────────────
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  save();
  render();

  // Check if all tasks completed → confetti!
  const active = tasks.filter(t => !t.completed);
  if (tasks.length > 0 && active.length === 0) {
    launchConfetti();
  }
}

// ── DELETE TASK ────────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ── OPEN EDIT MODAL ────────────────────────────────────────
function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;

  document.getElementById('editInput').value = task.text;
  document.getElementById('editPriority').value = task.priority;
  document.getElementById('editCategory').value = task.category;
  document.getElementById('editDate').value = task.dueDate || '';

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('editInput').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null;
}

function saveEdit() {
  const text = document.getElementById('editInput').value.trim();
  if (!text) return;

  const task = tasks.find(t => t.id === editingId);
  if (!task) return;

  task.text = text;
  task.priority = document.getElementById('editPriority').value;
  task.category = document.getElementById('editCategory').value;
  task.dueDate = document.getElementById('editDate').value;

  save();
  render();
  closeModal();
}

// ── CLEAR COMPLETED ────────────────────────────────────────
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
}

// ── FILTER ─────────────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}

// ── SEARCH ─────────────────────────────────────────────────
function getSearchQuery() {
  return document.getElementById('searchInput').value.trim().toLowerCase();
}

// ── RENDER ─────────────────────────────────────────────────
function render() {
  const query = getSearchQuery();
  const list = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');

  // Filter
  let filtered = tasks.filter(task => {
    if (currentFilter === 'active' && task.completed) return false;
    if (currentFilter === 'completed' && !task.completed) return false;
    if (query && !task.text.toLowerCase().includes(query)) return false;
    return true;
  });

  // Update progress
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progressText').textContent = `${done} of ${total} tasks completed`;
  document.getElementById('progressPercent').textContent = `${pct}%`;
  document.getElementById('progressBar').style.width = `${pct}%`;

  // Remaining count
  const remaining = tasks.filter(t => !t.completed).length;
  document.getElementById('remainingCount').textContent =
    `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;

  // Render tasks
  list.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<div class="empty-icon">${query ? '🔍' : '✅'}</div>
      <p>${query ? 'No tasks match your search.' : currentFilter === 'completed' ? 'No completed tasks yet.' : 'No tasks here!'}</p>`;
    list.appendChild(empty);
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;

    // Due date display
    let dueHTML = '';
    if (task.dueDate) {
      const due = new Date(task.dueDate + 'T00:00:00');
      const today = new Date(); today.setHours(0,0,0,0);
      const isOverdue = !task.completed && due < today;
      const label = due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dueHTML = `<span class="meta-tag due-tag ${isOverdue ? 'overdue' : ''}">📅 ${label}${isOverdue ? ' (Overdue)' : ''}</span>`;
    }

    const catLabels = { general: '📌 General', work: '💼 Work', personal: '👤 Personal', study: '📚 Study' };
    const priClass = { high: 'pri-high', medium: 'pri-medium', low: 'pri-low' };
    const priLabel = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

    card.innerHTML = `
      <div class="task-check ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
        ${task.completed ? '✓' : ''}
      </div>
      <div class="task-body">
        <div class="task-text">${escapeHTML(task.text)}</div>
        <div class="task-meta">
          <span class="meta-tag cat-tag">${catLabels[task.category] || task.category}</span>
          <span class="meta-tag ${priClass[task.priority]}">${priLabel[task.priority]}</span>
          ${dueHTML}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" onclick="openEdit(${task.id})" title="Edit">✏️</button>
        <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
      </div>
    `;

    list.appendChild(card);
  });
}

// ── ESCAPE HTML ────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

// ── THEME ──────────────────────────────────────────────────
function loadTheme() {
  const saved = localStorage.getItem('taskflow_theme') || 'dark';
  document.body.className = saved;
  document.getElementById('themeBtn').textContent = saved === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark');
  document.body.className = isDark ? 'light' : 'dark';
  document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('taskflow_theme', isDark ? 'light' : 'dark');
}

// ── CONFETTI ───────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    w: Math.random() * 10 + 6,
    h: Math.random() * 6 + 4,
    color: ['#6c63ff','#ff6584','#43d98f','#ffd166','#4ecdc4'][Math.floor(Math.random() * 5)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 6
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
    });

    const alive = pieces.some(p => p.y < canvas.height);
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (frame) cancelAnimationFrame(frame);
  draw();
}

// ── BIND EVENTS ────────────────────────────────────────────
function bindEvents() {
  // Add task
  document.getElementById('addBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Theme
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);

  // Filter tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', render);

  // Clear completed
  document.getElementById('clearCompleted').addEventListener('click', clearCompleted);

  // Modal
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', saveEdit);
  document.getElementById('editInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeModal();
  });
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}
