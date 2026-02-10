// Buckshot Roulette Calculator - Fixed Version

const ShellType = {
  UNKNOWN: 'UNKNOWN',
  LIVE: 'LIVE',
  BLANK: 'BLANK'
};

const gs = {
  shellLineup: [],
  liveChance: 0,
  blankChance: 0
};

let liveTotal = 0;
let blankTotal = 0;
let livesUsed = 0;  // Shells that have been fired/cycled (removed from lineup)
let blanksUsed = 0; // Shells that have been fired/cycled (removed from lineup)

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
const liveChanceEl = document.getElementById('liveChance');
const blankChanceEl = document.getElementById('blankChance');
const lineupEl = document.getElementById('lineup');

// ========== HELPER FUNCTIONS ==========
function getShellCount(type) {
  return gs.shellLineup.filter(s => s === type).length;
}

function getRemainingCounts() {
  // Count known shells still in the lineup
  const liveInLineup = getShellCount(ShellType.LIVE);
  const blankInLineup = getShellCount(ShellType.BLANK);
  
  // Remaining = total - used - known_in_lineup
  const liveLeft = liveTotal - livesUsed - liveInLineup;
  const blankLeft = blankTotal - blanksUsed - blankInLineup;
  
  return { live: Math.max(0, liveLeft), blank: Math.max(0, blankLeft) };
}

function updateButtonStates() {
  if (gs.shellLineup.length === 0) {
    fireBtn.disabled = true;
    cycleBtn.disabled = true;
    return;
  }

  const remaining = getRemainingCounts();
  const currentShell = gs.shellLineup[0];

  // Fire button: disabled if no live shells or current is definitely blank
  const totalLiveLeft = remaining.live + (currentShell === ShellType.LIVE ? 1 : 0);
  fireBtn.disabled = totalLiveLeft === 0 || currentShell === ShellType.BLANK;

  // Cycle button: disabled if no blank shells or current is definitely live
  const totalBlankLeft = remaining.blank + (currentShell === ShellType.BLANK ? 1 : 0);
  cycleBtn.disabled = totalBlankLeft === 0 || currentShell === ShellType.LIVE;
}

// ========== CORE LOGIC ==========
function reset() {
  gs.shellLineup = [];
  gs.liveChance = 0;
  gs.blankChance = 0;
  liveTotal = 0;
  blankTotal = 0;
  livesUsed = 0;
  blanksUsed = 0;
  console.clear()
  render();
}

function populateShellLineUp() {
  const live = Math.max(0, parseInt(liveInput.value) || 0);
  const blank = Math.max(0, parseInt(blankInput.value) || 0);
  if (live + blank === 0) return alert('Please provide at least one shell');

  // Clear everything first
  gs.shellLineup = [];
  gs.liveChance = 0;
  gs.blankChance = 0;
  liveTotal = live;
  blankTotal = blank;
  livesUsed = 0;
  blanksUsed = 0;
  
  // Fill the array with unknowns
  for (let i = 0; i < live + blank; i++) {
    gs.shellLineup.push(ShellType.UNKNOWN);
  }
  
  // Update odds and render
  updateOdds();
  render();
}

function cycleShell(shellType) {
  if (gs.shellLineup.length === 0) return;

  const currentShell = gs.shellLineup[0];

  if (shellType === ShellType.LIVE) {
    console.log('Live fired.');
    
    // Mark the current shell as LIVE before removing it
    gs.shellLineup[0] = ShellType.LIVE;
    livesUsed++;
    
  } else {
    console.log('Blank cycled.');
    
    // Mark the current shell as BLANK before removing it
    gs.shellLineup[0] = ShellType.BLANK;
    blanksUsed++;
  }

  // Now remove the shell
  gs.shellLineup.shift();
  
  // Check if we can deduce remaining shells
  checkRemainingShells();
  updateOdds();
  render();
}

function checkRemainingShells() {
  if (!gs.shellLineup.includes(ShellType.UNKNOWN)) return;
  
  const remaining = getRemainingCounts();
  
  // If no live shells remaining (all accounted for), all unknowns must be blank
  if (remaining.live === 0) {
    gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.BLANK : s);
  }
  
  // If no blank shells remaining (all accounted for), all unknowns must be live
  if (remaining.blank === 0) {
    gs.shellLineup = gs.shellLineup.map(s => s === ShellType.UNKNOWN ? ShellType.LIVE : s);
  }
}

function updateOdds() {
  // Check if we need to deduce remaining shells first
  checkRemainingShells();
  
  const remaining = getRemainingCounts();
  
  // If no shells left, set to 0
  if (gs.shellLineup.length === 0) {
    gs.liveChance = 0; 
    gs.blankChance = 0; 
    return;
  }
  
  // If first shell is known, set odds accordingly
  if (gs.shellLineup[0] === ShellType.LIVE) {
    gs.liveChance = 100; 
    gs.blankChance = 0; 
    return;
  }
  if (gs.shellLineup[0] === ShellType.BLANK) {
    gs.liveChance = 0; 
    gs.blankChance = 100; 
    return;
  }
  
  // Calculate odds based on remaining shells
  const total = remaining.live + remaining.blank;
  if (total === 0) {
    gs.liveChance = 0;
    gs.blankChance = 0;
    return;
  }
  
  gs.liveChance = Math.round((remaining.live / total) * 100);
  gs.blankChance = Math.round((remaining.blank / total) * 100);
}

function addShellKnowledge() {
  const pos = Math.max(1, parseInt(knowledgePos.value) || 1);
  const type = knowledgeType.value;
  if (pos > gs.shellLineup.length) return alert('Position out of range');

  gs.shellLineup[pos - 1] = type;
  
  // Check if we can deduce remaining shells based on the knowledge
  checkRemainingShells();
  updateOdds(); 
  render();
}

// ========== RENDER ==========
function render() {
  const remaining = getRemainingCounts();
  
  // Update remaining counts
  liveRemEl.textContent = remaining.live;
  blankRemEl.textContent = remaining.blank;
  
  // Update odds display
  liveChanceEl.textContent = gs.liveChance + '%';
  blankChanceEl.textContent = gs.blankChance + '%';

  // Clear lineup
  lineupEl.innerHTML = '';
  
  // If no shells, show message
  if (gs.shellLineup.length === 0) {
    lineupEl.innerHTML = '<p style="color:#777;font-size:14px">No shells loaded</p>';
  } else {
    // Render each shell
    gs.shellLineup.forEach((shell, i) => {
      const div = document.createElement('div');
      div.className = `shell ${shell}`;
      div.textContent = `${i + 1}: ${shell}`;
      if (i === 0) div.style.outline = '2px solid var(--accent)';
      lineupEl.appendChild(div);
    });
  }
  
  // Update button states
  updateButtonStates();
}

// ========== EVENT HANDLERS ==========
populateBtn.addEventListener('click', populateShellLineUp);
resetBtn.addEventListener('click', reset);
fireBtn.addEventListener('click', () => cycleShell(ShellType.LIVE));
cycleBtn.addEventListener('click', () => cycleShell(ShellType.BLANK));
updateOddsBtn.addEventListener('click', () => { updateOdds(); render(); });
addKnowledgeBtn.addEventListener('click', addShellKnowledge);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  populateShellLineUp();
});