const FILTER_DEFAULTS = {
  source: new Set(['notion', 'todoist', 'canvas']),
  level: new Set(['project', 'task', 'subtask']),
  status: new Set(['todo', 'in-progress', 'done']),
  search: '',
};

const VISIBLE_FIELD_DEFAULTS = {
  dueDate: true,
  priority: true,
  source: true,
  tags: true,
};

const LEVEL_ORDER = {
  project: 0,
  task: 1,
  subtask: 2,
};

const STORAGE_KEYS = {
  drafts: 'canvas-local-drafts-v2',
  layout: 'canvas-layout-v2',
  layoutMode: 'canvas-layout-mode-v2',
};

const compactMedia = window.matchMedia('(max-width: 720px)');
const assetBase = new URL('.', window.location.href);
const apiBase = new URL('/', window.location.origin);

const state = {
  tasks: [],
  apiAvailable: false,
  storage: null,
  filters: {
    source: new Set(FILTER_DEFAULTS.source),
    level: new Set(FILTER_DEFAULTS.level),
    status: new Set(FILTER_DEFAULTS.status),
    search: '',
  },
  visibleFields: {
    ...VISIBLE_FIELD_DEFAULTS,
  },
  positions: {},
  autoLayout: true,
  selectedTaskId: null,
};

const elements = {
  canvas: document.getElementById('canvas'),
  searchInput: document.getElementById('searchInput'),
  refreshButton: document.getElementById('refreshTasks'),
  resetLayoutButton: document.getElementById('resetLayout'),
  toggleAutoLayoutButton: document.getElementById('toggleAutoLayout'),
  newTaskButton: document.getElementById('newTaskButton'),
  statusMessage: document.getElementById('statusMessage'),
  summaryCount: document.getElementById('summaryCount'),
  storageMode: document.getElementById('storageMode'),
  storageMessage: document.getElementById('storageMessage'),
  storageDetail: document.getElementById('storageDetail'),
  layoutModeLabel: document.getElementById('layoutModeLabel'),
  workspaceHint: document.getElementById('workspaceHint'),
  editorTitle: document.getElementById('editorTitle'),
  editorMode: document.getElementById('editorMode'),
  taskForm: document.getElementById('taskForm'),
  submitTaskButton: document.getElementById('submitTask'),
  clearSelectionButton: document.getElementById('clearSelection'),
  deleteTaskButton: document.getElementById('deleteTask'),
  taskTitle: document.getElementById('taskTitle'),
  taskSource: document.getElementById('taskSource'),
  taskLevel: document.getElementById('taskLevel'),
  taskStatus: document.getElementById('taskStatus'),
  taskPriority: document.getElementById('taskPriority'),
  taskDueDate: document.getElementById('taskDueDate'),
  taskParentId: document.getElementById('taskParentId'),
  taskTags: document.getElementById('taskTags'),
};

function assetUrl(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), assetBase).toString();
}

function apiUrl(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), apiBase).toString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(dateValue) {
  if (!dateValue) return 'No due date';
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${dateValue}T00:00:00`));
  } catch (error) {
    return dateValue;
  }
}

function formatDateTime(dateValue) {
  if (!dateValue) return 'No update recorded';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function parseTaskCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.tasks)) return payload.tasks;
  return [];
}

function sortTasks(tasks) {
  return [...tasks].sort((left, right) => {
    const levelDiff = (LEVEL_ORDER[left.level] ?? 99) - (LEVEL_ORDER[right.level] ?? 99);
    if (levelDiff !== 0) return levelDiff;

    const dueLeft = left.dueDate || '9999-12-31';
    const dueRight = right.dueDate || '9999-12-31';
    if (dueLeft !== dueRight) return dueLeft.localeCompare(dueRight);

    return (left.title || '').localeCompare(right.title || '');
  });
}

function isLocalDraft(task) {
  return task.id.startsWith('local-');
}

function isCompactLayout() {
  return compactMedia.matches;
}

function isFreeformMode() {
  return !state.autoLayout && !isCompactLayout();
}

function readJsonStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readLocalDrafts() {
  const drafts = parseTaskCollection(readJsonStorage(STORAGE_KEYS.drafts, []));
  return drafts.filter((task) => task && typeof task.title === 'string' && task.title.trim());
}

function saveLocalDrafts(tasks) {
  writeJsonStorage(STORAGE_KEYS.drafts, tasks);
}

function restoreLayoutState() {
  state.positions = readJsonStorage(STORAGE_KEYS.layout, {});
  const savedAutoLayout = readJsonStorage(STORAGE_KEYS.layoutMode, true);
  state.autoLayout = typeof savedAutoLayout === 'boolean' ? savedAutoLayout : true;
}

function persistLayoutState() {
  writeJsonStorage(STORAGE_KEYS.layout, state.positions);
  writeJsonStorage(STORAGE_KEYS.layoutMode, state.autoLayout);
}

function mergeTasks(primaryTasks, localDrafts) {
  const byId = new Map();

  [...primaryTasks, ...localDrafts].forEach((task) => {
    if (!task || typeof task.title !== 'string' || !task.title.trim()) return;
    byId.set(task.id, {
      ...task,
      title: task.title.trim(),
      tags: Array.isArray(task.tags) ? task.tags : [],
      parentId: typeof task.parentId === 'string' && task.parentId.trim() ? task.parentId.trim() : null,
      dueDate: task.dueDate || null,
      updatedAt: task.updatedAt || task.createdAt || null,
      createdAt: task.createdAt || task.updatedAt || null,
    });
  });

  return sortTasks([...byId.values()]);
}

async function loadConfig() {
  try {
    const response = await fetch(apiUrl('/api/config'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Config unavailable');
    const payload = await response.json();
    state.apiAvailable = true;
    state.storage = payload.storage || null;
  } catch (error) {
    state.apiAvailable = false;
    state.storage = {
      storageMode: 'static-preview',
      dataFile: 'Browser local storage only',
      repoSeedFile: assetUrl('data/tasks.json'),
      usingPrivateData: false,
    };
  }
}

async function loadStaticTasks() {
  try {
    const response = await fetch(assetUrl('data/tasks.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Static task file missing');
    const payload = await response.json();
    return parseTaskCollection(payload);
  } catch (error) {
    return [];
  }
}

async function loadTasks() {
  const drafts = readLocalDrafts();

  if (state.apiAvailable) {
    try {
      const response = await fetch(apiUrl('/api/tasks'), { cache: 'no-store' });
      if (!response.ok) throw new Error('API unavailable');
      const payload = await response.json();
      state.tasks = mergeTasks(parseTaskCollection(payload), drafts);
      setStatus('Live API connected');
      render();
      return;
    } catch (error) {
      state.apiAvailable = false;
      setStatus('Live API unavailable, using preview mode');
    }
  }

  const staticTasks = await loadStaticTasks();
  state.tasks = mergeTasks(staticTasks, drafts);
  setStatus('Static preview with browser drafts');
  render();
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

function updateStorageMessaging() {
  const storage = state.storage || {
    storageMode: 'unknown',
    dataFile: 'Unavailable',
    usingPrivateData: false,
  };

  elements.storageMode.textContent = storage.storageMode.replaceAll('-', ' ');
  elements.storageMessage.textContent = storage.usingPrivateData
    ? 'Private runtime store active'
    : 'Preview data only';
  elements.storageDetail.textContent = storage.dataFile;
}

function filteredTasks() {
  return state.tasks.filter((task) => {
    const matchesSearch = state.filters.search
      ? task.title.toLowerCase().includes(state.filters.search) ||
        (task.tags || []).some((tag) => tag.toLowerCase().includes(state.filters.search))
      : true;

    return (
      state.filters.source.has(task.source) &&
      state.filters.level.has(task.level) &&
      state.filters.status.has(task.status) &&
      matchesSearch
    );
  });
}

function summarizeVisibleTasks(tasks) {
  const totals = tasks.reduce(
    (accumulator, task) => {
      accumulator[task.status] += 1;
      return accumulator;
    },
    { todo: 0, 'in-progress': 0, done: 0 }
  );

  elements.summaryCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'card' : 'cards'}`;
  elements.workspaceHint.textContent = `${totals.todo} todo, ${totals['in-progress']} in progress, ${totals.done} done`;
}

function currentTask() {
  return state.tasks.find((task) => task.id === state.selectedTaskId) || null;
}

function canEditSelectedTask(task) {
  if (!task) return true;
  if (state.apiAvailable) return true;
  return isLocalDraft(task);
}

function updateEditor(task) {
  const editable = canEditSelectedTask(task);

  if (!task) {
    elements.editorTitle.textContent = 'Create task';
    elements.editorMode.textContent = state.apiAvailable
      ? 'New tasks save into your private runtime data store.'
      : 'Preview mode can create browser-only drafts without touching repo data.';
    elements.submitTaskButton.textContent = 'Create task';
    elements.deleteTaskButton.hidden = true;
    elements.taskForm.reset();
    elements.taskPriority.value = 'medium';
    elements.taskSource.value = 'canvas';
    elements.taskLevel.value = 'task';
    elements.taskStatus.value = 'todo';
  } else {
    elements.editorTitle.textContent = editable ? 'Edit task' : 'Inspect demo task';
    elements.editorMode.textContent = editable
      ? `Last updated ${formatDateTime(task.updatedAt)}`
      : 'This task comes from preview data. Clear the selection to create a local draft.';
    elements.submitTaskButton.textContent = editable ? 'Save changes' : 'Read only';
    elements.deleteTaskButton.hidden = !editable;
    elements.taskTitle.value = task.title || '';
    elements.taskSource.value = task.source || 'canvas';
    elements.taskLevel.value = task.level || 'task';
    elements.taskStatus.value = task.status || 'todo';
    elements.taskPriority.value = task.priority || 'medium';
    elements.taskDueDate.value = task.dueDate || '';
    elements.taskTags.value = Array.isArray(task.tags) ? task.tags.join(', ') : '';
  }

  elements.taskForm.querySelectorAll('input, select').forEach((field) => {
    if (field.id === 'taskParentId') return;
    field.disabled = !!task && !editable;
  });

  elements.submitTaskButton.disabled = !!task && !editable;
  populateParentOptions(task);
}

function populateParentOptions(selectedTask) {
  const currentParentId = selectedTask?.parentId || '';
  const options = ['<option value="">None</option>'];

  state.tasks
    .filter((task) => !selectedTask || task.id !== selectedTask.id)
    .forEach((task) => {
      options.push(
        `<option value="${escapeHtml(task.id)}"${task.id === currentParentId ? ' selected' : ''}>${escapeHtml(
          task.title
        )}</option>`
      );
    });

  elements.taskParentId.innerHTML = options.join('');
  elements.taskParentId.disabled = !!selectedTask && !canEditSelectedTask(selectedTask);
}

function levelBadge(task) {
  return `<span class="badge">${escapeHtml(task.level)}</span>`;
}

function statusBadge(task) {
  return `<span class="status-badge status-${escapeHtml(task.status)}">${escapeHtml(task.status.replace('-', ' '))}</span>`;
}

function sourceBackground(source) {
  return {
    notion: 'var(--card-notion)',
    todoist: 'var(--card-todoist)',
    canvas: 'var(--card-canvas)',
  }[source] || 'var(--card-default)';
}

function renderCanvas() {
  const visibleTasks = filteredTasks();
  summarizeVisibleTasks(visibleTasks);
  elements.layoutModeLabel.textContent = isFreeformMode() ? 'Freeform canvas' : 'Stacked board';
  elements.toggleAutoLayoutButton.textContent = isFreeformMode() ? 'Switch to stacked' : 'Switch to freeform';
  elements.canvas.classList.toggle('is-freeform', isFreeformMode());
  elements.canvas.innerHTML = '';

  if (!visibleTasks.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <p class="eyebrow">No cards match this view</p>
      <h3>Adjust the filters or create a fresh task</h3>
      <p class="panel-note">The preview keeps repo data read-only and stores your new drafts in the browser until the live server is available.</p>
    `;
    elements.canvas.appendChild(emptyState);
    return;
  }

  visibleTasks.forEach((task, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    if (task.id === state.selectedTaskId) {
      card.classList.add('selected');
    }

    card.dataset.id = task.id;
    card.tabIndex = 0;
    card.style.background = sourceBackground(task.source);
    applyCardPosition(card, task, index);

    const tagsMarkup =
      state.visibleFields.tags && task.tags.length
        ? `<div class="tag-list">${task.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>`
        : '';

    card.innerHTML = `
      <div class="card-head">
        ${levelBadge(task)}
        ${statusBadge(task)}
      </div>
      <h3 class="card-title">${escapeHtml(task.title)}</h3>
      <div class="card-meta">
        ${state.visibleFields.source ? `<span>${escapeHtml(task.source)}</span>` : ''}
        ${state.visibleFields.priority ? `<span>Priority ${escapeHtml(task.priority)}</span>` : ''}
        ${state.visibleFields.dueDate ? `<span>${escapeHtml(formatDate(task.dueDate))}</span>` : ''}
      </div>
      ${tagsMarkup}
      <div class="card-footer">
        <span>${
          isLocalDraft(task)
            ? state.apiAvailable
              ? 'Unsynced browser draft'
              : 'Browser draft'
            : state.apiAvailable
              ? 'Private data'
              : 'Preview seed'
        }</span>
        <span>${escapeHtml(formatDateTime(task.updatedAt || task.createdAt))}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      state.selectedTaskId = task.id;
      render();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        state.selectedTaskId = task.id;
        render();
      }
    });

    if (isFreeformMode()) {
      enableDrag(card, task.id);
    }

    elements.canvas.appendChild(card);
  });

  if (isFreeformMode()) {
    resizeCanvasForFreeform();
  } else {
    elements.canvas.style.minHeight = '';
  }
}

function applyCardPosition(card, task, index) {
  if (!isFreeformMode()) {
    card.style.left = '';
    card.style.top = '';
    return;
  }

  const columns = Math.max(1, Math.floor((elements.canvas.clientWidth || 900) / 312));
  const offset = task.source === 'notion' ? 6 : task.source === 'todoist' ? 18 : 30;
  const fallback = {
    x: 18 + (index % columns) * 292 + offset,
    y: 18 + Math.floor(index / columns) * 220 + offset / 2,
  };
  const position = state.positions[task.id] || fallback;
  card.style.left = `${position.x}px`;
  card.style.top = `${position.y}px`;
}

function resizeCanvasForFreeform() {
  const cards = [...elements.canvas.querySelectorAll('.card')];
  const maxBottom = cards.reduce((largest, card) => Math.max(largest, card.offsetTop + card.offsetHeight), 0);
  elements.canvas.style.minHeight = `${Math.max(620, maxBottom + 36)}px`;
}

function enableDrag(card, taskId) {
  let dragging = false;
  let startX = 0;
  let startY = 0;

  card.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX - card.offsetLeft;
    startY = event.clientY - card.offsetTop;
    card.classList.add('dragging');
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener('pointermove', (event) => {
    if (!dragging) return;

    const nextX = Math.max(12, event.clientX - startX);
    const nextY = Math.max(12, event.clientY - startY);
    card.style.left = `${nextX}px`;
    card.style.top = `${nextY}px`;
  });

  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');

    if (event?.pointerId != null) {
      try {
        card.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }
    }

    state.positions[taskId] = {
      x: card.offsetLeft,
      y: card.offsetTop,
    };
    persistLayoutState();
    resizeCanvasForFreeform();
  }

  card.addEventListener('pointerup', stopDragging);
  card.addEventListener('pointercancel', stopDragging);
}

function render() {
  const selected = currentTask();
  updateStorageMessaging();
  renderCanvas();
  updateEditor(selected);
}

function readFormDraft() {
  return {
    title: elements.taskTitle.value.trim(),
    source: elements.taskSource.value,
    level: elements.taskLevel.value,
    status: elements.taskStatus.value,
    priority: elements.taskPriority.value,
    dueDate: elements.taskDueDate.value || null,
    tags: elements.taskTags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    parentId: elements.taskParentId.value || null,
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

async function persistTaskFromForm() {
  const selected = currentTask();
  const draft = readFormDraft();

  if (!draft.title) {
    window.alert('Give the task a title before saving.');
    return;
  }

  if (selected && !canEditSelectedTask(selected)) {
    return;
  }

  if (selected && (state.apiAvailable || isLocalDraft(selected))) {
    if (state.apiAvailable && isLocalDraft(selected)) {
      await requestJson('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
      saveLocalDrafts(readLocalDrafts().filter((task) => task.id !== selected.id));
    } else if (state.apiAvailable) {
      await requestJson(`/api/tasks/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(draft),
      });
    } else {
      const updatedDrafts = readLocalDrafts().map((task) =>
        task.id === selected.id ? { ...task, ...draft, updatedAt: new Date().toISOString() } : task
      );
      saveLocalDrafts(updatedDrafts);
    }
  } else if (state.apiAvailable) {
    await requestJson('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  } else {
    const drafts = readLocalDrafts();
    drafts.unshift({
      id: `local-${Date.now()}`,
      ...draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveLocalDrafts(drafts);
  }

  state.selectedTaskId = null;
  await refreshAll();
}

async function deleteSelectedTask() {
  const selected = currentTask();
  if (!selected || !canEditSelectedTask(selected)) return;

  const confirmed = window.confirm(`Delete "${selected.title}"?`);
  if (!confirmed) return;

  if (state.apiAvailable && !isLocalDraft(selected)) {
    await requestJson(`/api/tasks/${encodeURIComponent(selected.id)}`, {
      method: 'DELETE',
    });
  } else {
    saveLocalDrafts(readLocalDrafts().filter((task) => task.id !== selected.id));
  }

  delete state.positions[selected.id];
  persistLayoutState();
  state.selectedTaskId = null;
  await refreshAll();
}

async function refreshAll() {
  await loadConfig();
  await loadTasks();
}

function clearSelection() {
  state.selectedTaskId = null;
  render();
}

function resetLayout() {
  state.positions = {};
  persistLayoutState();
  render();
}

function toggleLayoutMode() {
  state.autoLayout = !state.autoLayout;
  persistLayoutState();
  render();
}

function setupFilters() {
  document.querySelectorAll('input[data-filter]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const filterName = event.target.dataset.filter;
      const value = event.target.value;
      if (event.target.checked) {
        state.filters[filterName].add(value);
      } else {
        state.filters[filterName].delete(value);
      }
      render();
    });
  });

  document.querySelectorAll('input[data-field]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const fieldName = event.target.dataset.field;
      state.visibleFields[fieldName] = event.target.checked;
      render();
    });
  });

  elements.searchInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });
}

function setupActions() {
  elements.refreshButton.addEventListener('click', refreshAll);
  elements.resetLayoutButton.addEventListener('click', resetLayout);
  elements.toggleAutoLayoutButton.addEventListener('click', toggleLayoutMode);
  elements.newTaskButton.addEventListener('click', clearSelection);
  elements.clearSelectionButton.addEventListener('click', clearSelection);
  elements.deleteTaskButton.addEventListener('click', deleteSelectedTask);

  elements.taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await persistTaskFromForm();
  });

  compactMedia.addEventListener('change', () => {
    render();
  });

  window.addEventListener('resize', () => {
    if (isFreeformMode()) {
      renderCanvas();
    }
  });
}

async function init() {
  restoreLayoutState();
  setupFilters();
  setupActions();
  await refreshAll();
}

init();
