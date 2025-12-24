const state = {
  tasks: [],
  filters: {
    source: new Set(['notion', 'todoist', 'canvas']),
    level: new Set(['project', 'task', 'subtask']),
    status: new Set(['todo', 'in-progress', 'done']),
    search: '',
  },
  visibleFields: {
    dueDate: true,
    priority: true,
    source: true,
  },
  positions: {},
  autoLayout: false,
};

const canvasEl = document.getElementById('canvas');
const searchInput = document.getElementById('searchInput');
const refreshButton = document.getElementById('refreshTasks');
const resetLayoutButton = document.getElementById('resetLayout');
const toggleAutoLayoutButton = document.getElementById('toggleAutoLayout');
const createForm = document.getElementById('createForm');
const settingsButton = document.getElementById('openSettings');

async function loadTasks() {
  const response = await fetch('/api/tasks');
  const payload = await response.json();
  state.tasks = payload.tasks || [];
  renderCards();
}

function filteredTasks() {
  return state.tasks
    .filter((task) => state.filters.source.has(task.source))
    .filter((task) => state.filters.level.has(task.level))
    .filter((task) => state.filters.status.has(task.status))
    .filter((task) =>
      state.filters.search
        ? task.title.toLowerCase().includes(state.filters.search) ||
          (task.tags || []).some((tag) => tag.toLowerCase().includes(state.filters.search))
        : true
    );
}

function cardColor(task) {
  const palette = {
    notion: 'var(--card-notion)',
    todoist: 'var(--card-todoist)',
    canvas: 'var(--card-canvas)',
  };
  return palette[task.source] || 'var(--card-default)';
}

function layoutPosition(task, index) {
  if (state.positions[task.id]) return state.positions[task.id];
  const columns = 3;
  const gap = 24;
  const cardWidth = 260;
  const x = (index % columns) * (cardWidth + gap);
  const y = Math.floor(index / columns) * 160;
  const jitter = (task.source === 'notion' ? 6 : task.source === 'todoist' ? 12 : 18);
  return { x: x + jitter, y: y + jitter };
}

function renderCards() {
  canvasEl.innerHTML = '';
  const tasks = filteredTasks();
  tasks.forEach((task, index) => {
    const card = document.createElement('article');
    card.className = `card card-${task.level}`;
    card.style.background = cardColor(task);
    const pos = layoutPosition(task, index);
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="card-top">
        <span class="pill">${task.level}</span>
        <span class="status ${task.status}">${task.status}</span>
      </div>
      <h3>${task.title}</h3>
      ${state.visibleFields.dueDate && task.dueDate ? `<p class="meta">Due ${task.dueDate}</p>` : ''}
      ${state.visibleFields.priority ? `<p class="meta">Priority: ${task.priority || 'medium'}</p>` : ''}
      ${state.visibleFields.source ? `<p class="meta">From ${task.source}</p>` : ''}
      ${task.tags && task.tags.length ? `<p class="tags">${task.tags.map((t) => `#${t}`).join(' ')}</p>` : ''}
    `;

    card.addEventListener('dblclick', () => {
      card.classList.toggle('focused');
    });

    enableDrag(card, task.id);
    canvasEl.appendChild(card);
  });
}

function enableDrag(card, id) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  card.addEventListener('pointerdown', (event) => {
    isDragging = true;
    startX = event.clientX - card.offsetLeft;
    startY = event.clientY - card.offsetTop;
    card.setPointerCapture(event.pointerId);
    card.classList.add('dragging');
  });

  card.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const x = event.clientX - startX;
    const y = event.clientY - startY;
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  });

  card.addEventListener('pointerup', (event) => {
    if (!isDragging) return;
    isDragging = false;
    card.releasePointerCapture(event.pointerId);
    card.classList.remove('dragging');
    state.positions[id] = { x: card.offsetLeft, y: card.offsetTop };
    persistLayout();
  });
}

function persistLayout() {
  localStorage.setItem('canvas-layout', JSON.stringify(state.positions));
}

function restoreLayout() {
  const saved = localStorage.getItem('canvas-layout');
  if (saved) {
    try {
      state.positions = JSON.parse(saved) || {};
    } catch (error) {
      console.warn('Could not restore layout', error);
    }
  }
}

function resetLayout() {
  state.positions = {};
  persistLayout();
  renderCards();
}

function toggleAutoLayout() {
  state.autoLayout = !state.autoLayout;
  canvasEl.classList.toggle('auto-layout', state.autoLayout);
  toggleAutoLayoutButton.textContent = state.autoLayout ? 'Manual layout' : 'Auto layout';
  if (state.autoLayout) {
    state.positions = {};
  }
  renderCards();
}

function setupFilterCheckboxes() {
  document.querySelectorAll('input[data-filter]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const { filter, value } = event.target.dataset;
      if (event.target.checked) {
        state.filters[filter].add(value);
      } else {
        state.filters[filter].delete(value);
      }
      renderCards();
    });
  });
}

function setupVisibleFieldToggles() {
  document.querySelectorAll('input[data-field]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const { field } = event.target.dataset;
      state.visibleFields[field] = event.target.checked;
      renderCards();
    });
  });
}

function setupSearch() {
  searchInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderCards();
  });
}

function setupRefresh() {
  refreshButton.addEventListener('click', loadTasks);
}

function setupResetLayout() {
  resetLayoutButton.addEventListener('click', resetLayout);
}

function setupAutoLayout() {
  toggleAutoLayoutButton.addEventListener('click', toggleAutoLayout);
}

function setupForm() {
  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(createForm);
    const payload = Object.fromEntries(formData.entries());
    const tags = payload.tags
      ? payload.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.title,
        source: payload.source,
        level: payload.level,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate || null,
        tags,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Could not create task: ${error.error || 'unknown error'}`);
      return;
    }

    createForm.reset();
    await loadTasks();
  });
}

function setupSettings() {
  settingsButton.addEventListener('click', () => {
    alert('Settings panel coming soon. Today you can filter, rearrange, and create tasks.');
  });
}

function init() {
  restoreLayout();
  setupFilterCheckboxes();
  setupVisibleFieldToggles();
  setupSearch();
  setupRefresh();
  setupResetLayout();
  setupAutoLayout();
  setupForm();
  setupSettings();
  loadTasks();
}

init();
