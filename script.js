/* VanarSec interactive terminal script
   - interactive commands
   - command history (up/down)
   - fake Nmap/OSINT/Bruteforce/WiFi/Metasploit outputs
   - typing animation for lines
   - simple WebAudio synth for key & enter sounds
   - theme switching via command: theme <name>
*/

/* ---------- Utility: sound via WebAudio ---------- */
const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
function beep(freq=800, time=0.04, type='sine', vol=0.02){
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + time);
}

/* ---------- Terminal state ---------- */
let cmdHistory = [];
let histIndex = -1;

/* Insert initial message and create input */
function initTerminal(){
  const term = document.getElementById('terminalWindow');
  if(!term) return;

  term.innerHTML = '';
  // Welcome lines with typed effect
  typeLines([
    "VanarSec Interactive Terminal — Cyberpunk Neon",
    "Type 'help' to list commands. This is a safe frontend sandbox only.",
    ""
  ], 40, () => {
    createInputLine();
    printToTerminal("Hint: Try 'banner' or 'nmap' or 'osint' or 'theme cyber'");
  });
}

/* Create input line element */
function createInputLine(){
  const term = document.getElementById('terminalWindow');
  const inputLine = document.createElement('div');
  inputLine.className = 'input-line';

  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = '$';

  const input = document.createElement('input');
  input.className = 'terminal-input';
  input.setAttribute('autocomplete','off');
  input.spellcheck = false;
  input.autofocus = true;

  inputLine.appendChild(prompt);
  inputLine.appendChild(input);
  term.appendChild(inputLine);
  input.focus();

  // play soft click when focusing (user gesture)
  input.addEventListener('keydown', (e) => {
    if (e.key.length === 1) beep(1200, 0.008, 'square', 0.004);
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      runCommand(raw);
      cmdHistory.push(raw);
      histIndex = cmdHistory.length;
      input.value = '';
    }
    if (e.key === 'ArrowUp') {
      if (histIndex > 0) histIndex--;
      input.value = cmdHistory[histIndex] || '';
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      if (histIndex < cmdHistory.length - 1) histIndex++;
      input.value = cmdHistory[histIndex] || '';
      if(histIndex === cmdHistory.length) input.value = '';
      e.preventDefault();
    }
  });
}

/* Print a single line (no typing) */
function printToTerminal(text){
  const term = document.getElementById('terminalWindow');
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = text;
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}

/* Type lines with small typing animation (calls callback when done) */
function typeLines(lines, speed=30, callback){
  const term = document.getElementById('terminalWindow');
  let i = 0;
  const nextLine = () => {
    if (i >= lines.length) { callback && callback(); return; }
    const text = lines[i++];
    typeLine(text, speed, nextLine);
  };
  nextLine();
}

function typeLine(text, speed, ondone){
  const term = document.getElementById('terminalWindow');
  const wrapper = document.createElement('div');
  wrapper.className = 'terminal-line';
  term.appendChild(wrapper);
  let j = 0;
  const step = () => {
    if (j <= text.length) {
      wrapper.textContent = text.slice(0, j);
      term.scrollTop = term.scrollHeight;
      j++;
      // small typing beep occasionally
      if (j % 2 === 0) beep(1000 + (j*3) % 800, 0.006, 'sine', 0.002);
      setTimeout(step, speed + Math.random()*20);
    } else {
      ondone && ondone();
    }
  };
  step();
}

/* ---------- Commands ---------- */
function runCommand(raw){
  if (!raw) return;
  printToTerminal('$ ' + raw);
  const parts = raw.split(' ').filter(Boolean);
  const cmd = (parts[0] || '').toLowerCase();
  const args = parts.slice(1);

  switch(cmd){
    case 'help':
      typeLines([
        "Available commands:",
        " help           — show this",
        " clear          — clear terminal",
        " banner         — show ASCII banner",
        " whoami         — show fake user",
        " nmap           — simulate nmap scan",
        " osint          — run fake OSINT recon",
        " bruteforce     — simulated password test",
        " wifi-scan      — simulate wifi probe",
        " metasploit     — simulate metasploit output",
        " tools          — link to tools page",
        " blog           — link to blog",
        " theme <name>   — theme: green / red / blue / cyber",
        " history        — show recent commands"
      ], 18);
      break;

    case 'clear':
      document.getElementById('terminalWindow').innerHTML = '';
      createInputLine();
      break;

    case 'banner':
      typeLines([
        "██╗   ██╗ █████╗ ███╗   ██╗ █████╗ ██████╗ ███████╗███████╗",
        "██║   ██║██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝",
        "██║   ██║███████║██╔██╗ ██║███████║██║  ██║█████╗  ███████╗",
        "╚██╗ ██╔╝██╔══██║██║╚██╗██║██╔══██║██║  ██║██╔══╝  ╚════██║",
        " ╚████╔╝ ██║  ██║██║ ╚████║██║  ██║██████╔╝███████╗███████║",
        "  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝",
        ""
      ], 14);
      break;

    case 'whoami':
      typeLines([
        "user: guest",
        "role: learner",
        "project: VanarSec Cyber Academy",
        ""
      ], 26);
      break;

    case 'tools':
      typeLines([
        "Opening Tools page (frontend link):",
        "/tools.html",
        "Tip: open it in a new tab to read tool cheat-sheets."
      ], 20);
      // small click sound
      beep(1000, 0.02, 'sine', 0.01);
      break;

    case 'blog':
      typeLines([
        "Opening Blog page:",
        "/blog.html"
      ], 20);
      beep(850, 0.02, 'sine', 0.01);
      break;

    case 'history':
      if(cmdHistory.length === 0) printToTerminal("No history yet.");
      else cmdHistory.slice(-8).forEach((h,i)=> printToTerminal((i+1)+". "+h));
      break;

    case 'nmap':
      simulateNmap(args.join(' ') || 'vanarsec.in');
      break;

    case 'osint':
      simulateOSINT(args.join(' ') || 'vanarsec.in');
      break;

    case 'bruteforce':
      simulateBruteforce(args[0] || 'ssh');
      break;

    case 'wifi-scan':
      simulateWifi();
      break;

    case 'metasploit':
      simulateMetasploit();
      break;

    case 'theme':
      if (args[0]) changeTheme(args[0].toLowerCase());
      else printToTerminal("Usage: theme <green|red|blue|cyber>");
      break;

    default:
      if (raw.trim() === '') return;
      printToTerminal("Unknown command: '"+raw+"'  — type 'help'.");
      break;
  }
}

/* ---------- Simulations ---------- */
function simulateNmap(target){
  typeLines([`Nmap scan simulation for ${target}...`], 30, () => {
    const out = [
      "Starting SYN Stealth Scan...",
      "Host: " + target + " (203.0.113.5)",
      "PORT    STATE  SERVICE",
      "22/tcp  open   ssh",
      "80/tcp  open   http",
      "443/tcp open   https",
      "3306/tcp closed mysql",
      "Service detection performed. 3 services open."
    ];
    typeLines(out, 60, () => {
      printToTerminal("Scan finished.");
    });
  });
}

function simulateOSINT(target){
  typeLines([`OSINT recon simulation for ${target}...`], 30, () => {
    const out = [
      "Collecting public profiles... found: 4",
      "Checking paste sites... found: 2 references",
      "Subdomains discovered: dev.vanarsec.in, blog.vanarsec.in",
      "Email leaks: contact@vanarsec.in (2 mentions)",
      "OSINT complete."
    ];
    typeLines(out, 55);
  });
}

function simulateBruteforce(service){
  typeLines([`Simulated brute force on ${service} (safe demo)`], 30, () => {
    const out = [
      "Trying password list: 1000 entries",
      "Attempt 1: admin:123456 -> failed",
      "Attempt 254: admin:password -> failed",
      "Attempt 999: admin:letmein -> failed",
      "Brute-force simulation complete. No access gained."
    ];
    typeLines(out, 60);
  });
}

function simulateWifi(){
  typeLines(["WiFi probe simulation... (no packets captured — frontend demo)"], 30, () => {
    const out = [
      "Found SSIDs: HomeNet_5G, CoffeeShop_WiFi, VanarSec-Test",
      "WPA2 networks detected: 2",
      "Signal strengths measured. No attack performed."
    ];
    typeLines(out, 60);
  });
}

function simulateMetasploit(){
  typeLines(["Metasploit simulation starting..."], 30, () => {
    const out = [
      "Connecting to database... ok",
      "Loading auxiliary scanners...",
      "No exploitable modules will be run in this demo.",
      "Metasploit simulation complete."
    ];
    typeLines(out, 65);
  });
}

/* ---------- THEME SWITCH ---------- */
function changeTheme(name){
  const bodies = document.getElementsByTagName('body');
  if (!bodies[0]) return;
  bodies[0].classList.remove('theme-green','theme-red','theme-blue','theme-cyber');
  switch(name){
    case 'green': bodies[0].classList.add('theme-green'); setCurrentTheme('green'); break;
    case 'red': bodies[0].classList.add('theme-red'); setCurrentTheme('red'); break;
    case 'blue': bodies[0].classList.add('theme-blue'); setCurrentTheme('blue'); break;
    case 'cyber': bodies[0].classList.add('theme-cyber'); setCurrentTheme('cyber'); break;
    default: printToTerminal("Unknown theme. Options: green / red / blue / cyber"); return;
  }
  beep(1200,0.02,'sine',0.01);
}

function setCurrentTheme(val){
  const el = document.getElementById('currentTheme');
  if (el) el.textContent = val;
}

/* ---------- Init on load ---------- */
window.addEventListener('load', () => {
  // default theme
  document.body.classList.add('theme-cyber');
  setCurrentTheme('cyber');
  initTerminal();
});
