// Buckshot Roulette Calculator — Final Version

const ShellType = {
  UNKNOWN: 'UNKNOWN',
  LIVE: 'LIVE',
  BLANK: 'BLANK'
};

const gs = {
  shellLineup: [],
  liveRemaining: 0,
  blankRemaining: 0,
  liveChance: 0,
  blankChance: 0
};

let liveTotal = 0;
let blankTotal = 0;

// UI References
const liveInput = document.getElementById('liveInput');
const blankInput = document.getElementById('blankInput');
const populateBtn = document.getElementById('populateBtn');
const resetBtn = document.getElementById('resetBtn');
const fireBtn = document.getElementById('fireBtn');
const cycleBtn = document.getElementById('cycleBtn');
const updateOddsBtn = document.getElementById('updateOddsBtn');
const addKnowledgeBtn = document.getElementById('addKnowledgeBtn');
const knowledgePos = document.getElementById('knowledgePos');
const knowledgeType = document.getElementById('knowledgeType');

const liveRemEl = document.getElementById('liveRemaining');
const blankRemEl = document.getElementById('blankRemaining');
const lineupEl = document.getElementById('lineup');

// ========== CORE LOGIC ==========
function reset() {
  gs.shellLineup = [];
  gs.liveRemaining = 0;
  gs.blankRemaining = 0;
  gs.liveChance = 0;
  gs.blankChance = 0;
  liveTotal = 0;
  blankTotal = 0;
  render();
}

function fillArray(total) {
  for (let i = 0; i < total; i++) gs.shellLineup.push(ShellType.UNKNOWN);
}

function populateShellLineUp() {
  const live = Math.max(0, parseInt(liveInput.value) || 0);
  const blank = Math.max(0, parseInt(blankInput.value) || 0);
  if (live + blank === 0) return alert('Please provide at least one shell');

  reset();
  gs.liveRemaining = live;
  gs.blankRemaining = blank;
  liveTotal = live;
  blankTotal = blank;
  fillArray(live + blank);
  updateOdds();
  render();
}

function cycleShell(shellType) {
  if (gs.shellLineup.length === 0) return;

  if (shellType === ShellType.LIVE) {
    if (gs.liveRemaining === 0) {
      console.log('No live shells remaining.');
      gs.shellLineup.fill(ShellType.BLANK);
      updateOdds(); render();
      return;
    }
    if (gs.shellLineup[0] === ShellType.BLANK) {
      console.log('Current shell is blank, cannot fire.');
      return;
    }
    console.log('Live fired.');
    gs.liveRemaining--;
  } else {
    if (gs.blankRemaining === 0) {
      console.log('No blank shells remaining.');
      gs.shellLineup.fill(ShellType.LIVE);
      updateOdds(); render();
      return;
    }
    if (gs.shellLineup[0] === ShellType.LIVE) {
      console.log('Current shell is live, cannot cycle.');
      return;
    }
    console.log('Blank cycled.');
    gs.blankRemaining--;
  }

  gs.shellLineup.shift();
  checkRemainingShells();
  updateOdds();
  render();
}

function checkRemainingShells() {
  if (!gs.shellLineup.includes(ShellType.UNKNOWN)) return;
  if (gs.liveRemaining === 0)
    gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.BLANK : s);
  if (gs.blankRemaining === 0)
    gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.LIVE : s);
}

function updateOdds() {
  // No live remaining
  if (gs.liveRemaining === 0 && gs.shellLineup[0] === ShellType.BLANK) {
    gs.liveChance = 0; gs.blankChance = 100; return;
  }
  // No blank remaining
  if (gs.blankRemaining === 0 && gs.shellLineup[0] === ShellType.LIVE) {
    gs.liveChance = 100; gs.blankChance = 0; return;
  }

  const remainingUnknownBlank = gs.blankRemaining - getShellCount(ShellType.BLANK);
  const remainingUnknownLive = gs.liveRemaining - getShellCount(ShellType.LIVE);
  const remainingUnknown = getShellCount(ShellType.UNKNOWN);

  if (remainingUnknown <= 0) {
    const total = gs.liveRemaining + gs.blankRemaining;
    gs.liveChance = total === 0 ? 0 : Math.round((gs.liveRemaining / total) * 100);
    gs.blankChance = 100 - gs.liveChance;
    return;
  }

  if (remainingUnknownBlank === remainingUnknownLive) {
    gs.liveChance = 50; gs.blankChance = 50; return;
  }

  gs.blankChance = Math.round((remainingUnknownBlank / remainingUnknown) * 100);
  gs.liveChance = Math.round((remainingUnknownLive / remainingUnknown) * 100);
}

function addShellKnowledge() {
  const pos = Math.max(1, parseInt(knowledgePos.value) || 1);
  const type = knowledgeType.value;
  if (pos > gs.shellLineup.length) return alert('Position out of range');

  gs.shellLineup[pos - 1] = type;

  if (type === ShellType.LIVE) {
    if (getShellCount(ShellType.LIVE) === liveTotal)
      gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.BLANK : s);
  }
  if (type === ShellType.BLANK) {
    if (getShellCount(ShellType.BLANK) === blankTotal)
      gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.LIVE : s);
  }
  updateOdds(); render();
}

function getShellCount(type) {
  return gs.shellLineup.filter(s => s === type).length;
}

// ========== RENDER ==========
function render() {
  liveRemEl.textContent = gs.liveRemaining;
  blankRemEl.textContent = gs.blankRemaining;

  lineupEl.innerHTML = '';
  if (gs.shellLineup.length === 0) {
    lineupEl.innerHTML = '<p style="color:#777;font-size:14px">No shells loaded</p>';
    return;
  }

  gs.shellLineup.forEach((shell, i) => {
    const div = document.createElement('div');
    div.className = `shell ${shell}`;
    div.textContent = `${i + 1}: ${shell}`;
    if (i === 0) div.style.outline = '2px solid var(--accent)'; // highlight current shell
    lineupEl.appendChild(div);
  });
}

// ========== EVENT HANDLERS ==========
populateBtn.addEventListener('click', populateShellLineUp);
resetBtn.addEventListener('click', reset);
fireBtn.addEventListener('click', () => cycleShell(ShellType.LIVE));
cycleBtn.addEventListener('click', () => cycleShell(ShellType.BLANK));
updateOddsBtn.addEventListener('click', () => { updateOdds(); render(); });
addKnowledgeBtn.addEventListener('click', addShellKnowledge);

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
  populateShellLineUp();
  render();
});