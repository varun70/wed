// script.js — handles tools and terminal
// Utilities
function $(id){return document.getElementById(id)}

// Base64
function b64encode(){
  const v = $('b64-input').value || ''
  const out = btoa(unescape(encodeURIComponent(v)))
  $('b64-out').textContent = out
}
function b64decode(){
  const v = $('b64-input').value || ''
  try{
    const out = decodeURIComponent(escape(atob(v)))
    $('b64-out').textContent = out
  }catch(e){
    $('b64-out').textContent = 'Invalid Base64 string'
  }
}

// SHA-256 (browser crypto)
async function sha256(){
  const text = $('hash-input').value || ''
  const enc = new TextEncoder()
  const data = enc.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
  $('hash-out').textContent = hex
}

// Password strength (simple)
function pwcheck(){
  const p = $('pw-input').value || ''
  let score=0
  if(p.length>=8) score++
  if(/[A-Z]/.test(p)) score++
  if(/[0-9]/.test(p)) score++
  if(/[^A-Za-z0-9]/.test(p)) score++
  const labels=['Very Weak','Weak','Fair','Good','Strong']
  $('pw-out').textContent = labels[score]
}

// Port scan simulator for Tools page
function simulateNmapTools(){
  const target = $('scan-target').value || 'example.com'
  const out = $('scan-out')
  out.textContent = 'Starting simulated scan on '+target+'...\n'
  setTimeout(()=> out.textContent += '80/tcp open http\n',600)
  setTimeout(()=> out.textContent += '22/tcp open ssh\n',1200)
  setTimeout(()=> out.textContent += '443/tcp open https\n',1800)
  setTimeout(()=> out.textContent += 'Scan complete. (simulation)',2400)
}

// Terminal — interactive (shared by terminal.html)
// Basic command engine
let cmdHistory = [], histIndex = 0

function initInteractiveTerminal(){
  const win = $('terminalWindow')
  if(!win) return
  win.innerHTML = ''
  typeLines(win, ["VanarSec Interactive Terminal (simulation)", "Type 'help' for commands."], 30, () => {
    createInputLine(win)
  })
}

function createInputLine(win){
  const inputLine = document.createElement('div'); inputLine.className='input-line'
  const prompt = document.createElement('span'); prompt.className='prompt'; prompt.textContent='$'
  const input = document.createElement('input'); input.className='terminal-input'; input.autocomplete='off'
  inputLine.appendChild(prompt); inputLine.appendChild(input); win.appendChild(inputLine)
  input.focus()
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      const v = input.value.trim()
      runCommand(v, win)
      cmdHistory.push(v); histIndex=cmdHistory.length
      input.disabled=true
      createInputLine(win)
    } else if(e.key==='ArrowUp'){
      if(histIndex>0){ histIndex--; input.value = cmdHistory[histIndex] || '' }
    } else if(e.key==='ArrowDown'){
      if(histIndex<cmdHistory.length-1){ histIndex++; input.value = cmdHistory[histIndex] || '' }
      else { input.value=''; histIndex=cmdHistory.length }
    }
  })
}

function printLine(win, text){
  const line = document.createElement('div'); line.className='terminal-line'; line.textContent = text; win.appendChild(line); win.scrollTop = win.scrollHeight
}

function typeLines(win, lines, speed=30, cb){
  let i=0
  function next(){ if(i>=lines.length){ cb&&cb(); return } typeLine(win, lines[i++], speed, next) }
  next()
}
function typeLine(win, text, speed, cb){
  const line = document.createElement('div'); line.className='terminal-line'; win.appendChild(line)
  let j=0
  function step(){
    if(j<=text.length){ line.textContent = text.slice(0,j); win.scrollTop = win.scrollHeight; j++; setTimeout(step, speed + Math.random()*20) } else cb&&cb()
  }
  step()
}

function runCommand(raw, win){
  if(!raw) return
  printLine(win, '$ '+raw)
  const parts = raw.split(' ').filter(Boolean); const cmd = (parts[0]||'').toLowerCase(); const args = parts.slice(1)
  switch(cmd){
    case 'help':
      typeLines(win, ["Available: help, clear, banner, whoami, nmap, osint, theme <name>, tools, blog"], 20); break
    case 'clear':
      win.innerHTML=''; break
    case 'banner':
      typeLines(win, ["VanarSec — Cyberpunk Terminal",""], 20); break
    case 'whoami':
      typeLines(win, ["guest — learner","vanarsec project"], 20); break
    case 'tools':
      printLine(win, 'Open tools.html in a new tab to use interactive tools.'); break
    case 'blog':
      printLine(win, 'Open blog.html to read articles.'); break
    case 'nmap':
      simulateNmapTerminal(win, args.join(' ')||'example.com'); break
    case 'osint':
      simulateOSINTTerminal(win, args.join(' ')||'example.com'); break
    case 'theme':
      if(args[0]){ document.body.classList.remove('theme-green','theme-red','theme-blue','theme-cyber'); document.body.classList.add('theme-'+args[0]); printLine(win,'Theme set to '+args[0]); } else printLine(win,'Usage: theme <green|red|blue|cyber>')
      break
    default:
      printLine(win, "Unknown command. Type 'help'."); break
  }
}

function simulateNmapTerminal(win, target){
  typeLines(win, ['Simulated scan for '+target,'PORT STATE SERVICE'], 40, ()=>{
    setTimeout(()=>printLine(win,'22/tcp open ssh'),500)
    setTimeout(()=>printLine(win,'80/tcp open http'),1000)
    setTimeout(()=>printLine(win,'443/tcp open https'),1500)
    setTimeout(()=>printLine(win,'Scan complete (simulation).'),2000)
  })
}

function simulateOSINTTerminal(win, target){
  typeLines(win, ['Running OSINT (simulation) for '+target], 40, ()=>{
    setTimeout(()=>printLine(win,'Found public email: contact@'+target),500)
    setTimeout(()=>printLine(win,'Found subdomains: dev.'+target+', blog.'+target),1000)
    setTimeout(()=>printLine(win,'OSINT complete.'),1500)
  })
}

window.addEventListener('load', ()=>{ initInteractiveTerminal() })