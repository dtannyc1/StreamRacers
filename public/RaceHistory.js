import {
  parseDate,
  filterRaces,
  buildStats,
  sortedLeaders,
  formatDateLabel,
  formatMonthLabel,
  getDayKey,
  getMonthKey,
  getMostRecentDay,
} from './leaderboardFilters.js'

let raceHistory = []
let settings = {}

const getLatestRaceHistory = async () => {
  return SE_API.store.get('raceHistory')
    .then(data => raceHistory = data ?? [])
}

const getLatestOverlaySettings = async () => {
  return SE_API.store.get('raceHistoryOverlaySettings')
    .then(data => settings = data ?? {})
}

window.addEventListener('onWidgetLoad', async function (obj) {
  await getLatestRaceHistory()
  await getLatestOverlaySettings()
  render()
})

window.addEventListener('onEventReceived', async function (obj) {
  const listener = obj?.detail?.listener;
  const key      = obj?.detail?.event?.data?.key;

  if (key === 'customWidget.raceHistoryOverlaySettings') {
    await getLatestOverlaySettings();
    render();
  }

  if (key === 'customWidget.raceHistory') {
    await getLatestRaceHistory();
    flashRefresh();
    render();
  }
})

function flashRefresh() {
  const el = document.getElementById('refresh-flash');
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 200);
}

function applyCSSSettings(s) {
  const root = document.documentElement.style;
  const set  = (prop, val) => { if (val != null) root.setProperty(prop, val); };

  set('--font-family',       s.fontFamily);
  set('--font-size-base',    s.fontSizeBase);
  set('--font-size-title',   s.fontSizeTitle);
  set('--font-size-name',    s.fontSizeName);
  set('--font-size-stat',    s.fontSizeStat);
  set('--font-size-badge',   s.fontSizeBadge);

  set('--outer-padding',    s.outerPadding);
  set('--panel-gap',        s.panelGap);
  set('--row-padding-x',    s.rowPaddingX);
  set('--row-padding-y',    s.rowPaddingY);
  set('--header-padding-y', s.headerPaddingY);

  set('--color-bg',              s.colorBg);
  set('--color-panel-bg',        s.colorPanelBg);
  set('--color-header-bg',       s.colorHeaderBg);
  set('--color-border',          s.colorBorder);
  set('--color-stripe',          s.colorStripe);
  set('--color-text-primary',    s.colorTextPrimary);
  set('--color-text-secondary',  s.colorTextSecondary);
  set('--color-text-stat',       s.colorTextStat);
  set('--color-accent',          s.colorAccent);
  set('--color-gold',            s.colorGold);
  set('--color-silver',          s.colorSilver);
  set('--color-bronze',          s.colorBronze);

  set('--border-radius-outer', s.borderRadiusOuter);
  set('--border-radius-inner', s.borderRadiusInner);
}

// ---------------------------------------------------------------------------
// Data helpers — period label + race set from settings
// ---------------------------------------------------------------------------

/** Parse the refDate string stored in settings, or fall back to today. */
function getRefDate(s) {
  if (s.refDate) {
    const [y, m, d] = s.refDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return getMostRecentDay(raceHistory)
}

/** Returns { raceSet, label, sub } for a given period mode. */
function getPanelData(mode, races, refDate) {
  const raceSet = filterRaces(races, mode, refDate);

  if (mode === 'day') {
    return {
      raceSet,
      label: `${formatDateLabel(refDate)}`,
      sub: `${raceSet.length} races`,
    };
  }
  if (mode === 'month') {
    return {
      raceSet,
      label: formatMonthLabel(refDate),
      sub: `${raceSet.length} races this month`,
    };
  }
  if (mode === 'year') {
    return {
      raceSet,
      label: `${refDate.getFullYear()} Season`,
      sub: `${raceSet.length} total races`,
    };
  }
  // alltime
  return {
    raceSet: races,
    label: 'All Time',
    sub: `${races.length} total races`,
  };
}

// ---------------------------------------------------------------------------
// DOM rendering
// ---------------------------------------------------------------------------

function posBadgeClass(pos) {
  if (pos === 1) return 'pos-badge pos-1';
  if (pos === 2) return 'pos-badge pos-2';
  if (pos === 3) return 'pos-badge pos-3';
  return 'pos-badge pos-other';
}

function renderPanel(mode, races, refDate, maxRows = 10) {
  const { raceSet, label, sub } = getPanelData(mode, races, refDate);
  const stats   = buildStats(raceSet);
  const leaders = sortedLeaders(stats, maxRows);

  const panel = document.createElement('div');
  panel.className = 'panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `
    <div class="panel-flag"></div>
    <span class="panel-title">${escHtml(label)}</span>
    <span class="panel-sub">${escHtml(sub)}</span>
  `;
  panel.appendChild(header);

  // Rows
  if (leaders.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No races found';
    panel.appendChild(empty);
  } else {
    leaders.forEach(([name, s], i) => {
      const row = document.createElement('div');
      row.className = 'racer-row';
      row.innerHTML = `
        <div class="${posBadgeClass(i + 1)}">${i + 1}</div>
        <span class="racer-name">${escHtml(name)}</span>
        <div class="racer-stats">
          <span class="racer-pts">${s.points}pts</span>
          <span class="racer-meta">${s.wins} Wins ${s.races} Races</span>
        </div>
      `;
      panel.appendChild(row);
    });
  }

  return panel;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Determine which panels to show based on current settings. */
function getPanelModes(s) {
  const vm = s.viewMode ?? 'split';

  if (vm === 'split') {
    return [s.splitLeft ?? 'day', s.splitRight ?? 'month'];
  }
  // single-panel modes
  return [vm]; // 'day' | 'month' | 'year' | 'alltime'
}

function render() {
  applyCSSSettings(settings);

  const refDate = getRefDate(settings);
  const maxRows = settings.maxRows ?? 10;
  const modes   = getPanelModes(settings);

  const container = document.getElementById('panels');
  container.innerHTML = '';

  modes.forEach(mode => {
    const panel = renderPanel(mode, raceHistory, refDate, maxRows);
    container.appendChild(panel);
  });
}