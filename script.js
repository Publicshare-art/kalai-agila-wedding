const body = document.body;
const opening = document.getElementById('opening');
const frontCover = document.getElementById('frontCover');
const curtain = document.getElementById('curtain');
const mainContent = document.getElementById('mainContent');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let openingDone = false;

// Curtain opening: this animation is intentionally kept separate from the invitation glimpse.
frontCover.addEventListener('click', async () => {
  if (openingDone) return;
  openingDone = true;
  curtain.classList.add('opening');
  frontCover.classList.add('covered');
  setTimeout(() => {
    opening.classList.add('finished');
    mainContent.classList.add('revealed');
    mainContent.setAttribute('aria-hidden', 'false');
    body.classList.remove('no-scroll');
    window.scrollTo({top:0, behavior:'instant'});
  }, 1550);
  try {
    await music.play();
    musicBtn.classList.add('playing');
    musicBtn.textContent = '♫';
  } catch { musicBtn.textContent = '♪'; }
});

musicBtn.addEventListener('click', async () => {
  if (music.paused) {
    try { await music.play(); musicBtn.classList.add('playing'); musicBtn.textContent='♫'; } catch {}
  } else {
    music.pause(); musicBtn.classList.remove('playing'); musicBtn.textContent='♪';
  }
});

// Countdown — Reception: 12 September 2026, 6:30 PM IST.
const weddingTime = new Date('2026-09-12T18:30:00+05:30').getTime();
const get = id => document.getElementById(id);
function updateCountdown(){
  const diff = weddingTime - Date.now();
  if(diff <= 0){
    ['days','hours','minutes','seconds'].forEach(id => get(id).textContent='00');
    document.querySelector('.countdown-date').textContent='❤️ Today is the day! ❤️';
    return;
  }
  get('days').textContent=String(Math.floor(diff/86400000)).padStart(2,'0');
  get('hours').textContent=String(Math.floor(diff/3600000)%24).padStart(2,'0');
  get('minutes').textContent=String(Math.floor(diff/60000)%60).padStart(2,'0');
  get('seconds').textContent=String(Math.floor(diff/1000)%60).padStart(2,'0');
}
updateCountdown(); setInterval(updateCountdown,1000);

// Small invitation after countdown.
const glimpseCard=document.getElementById('glimpseCard');
const glimpseReveal=document.getElementById('glimpseReveal');
const glimpseClose=document.getElementById('glimpseClose');
function openGlimpse(){ glimpseReveal.classList.add('open'); glimpseReveal.setAttribute('aria-hidden','false'); body.classList.add('no-scroll'); }
function closeGlimpse(){ glimpseReveal.classList.remove('open'); glimpseReveal.setAttribute('aria-hidden','true'); body.classList.remove('no-scroll'); }
glimpseCard.addEventListener('click',openGlimpse);
glimpseClose.addEventListener('click',closeGlimpse);
document.querySelectorAll('[data-close-glimpse]').forEach(el=>el.addEventListener('click',closeGlimpse));

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&glimpseReveal.classList.contains('open'))closeGlimpse();});

// Memories — mobile-first swipe + click gallery.
const memoryTrack = document.getElementById('memoryTrack');
const memorySlider = document.getElementById('memorySlider');
const memoryPrev = document.getElementById('memoryPrev');
const memoryNext = document.getElementById('memoryNext');
const memoryDots = document.getElementById('memoryDots');
const memoryCards = memoryTrack ? Array.from(memoryTrack.querySelectorAll('.memory-card')) : [];
let memoryIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchTracking = false;

function renderMemoryDots(){
  if(!memoryDots) return;
  memoryDots.innerHTML = '';
  memoryCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'memory-dot' + (i === memoryIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to memory ${i + 1}`);
    dot.addEventListener('click', () => goToMemory(i));
    memoryDots.appendChild(dot);
  });
}

function goToMemory(index){
  if(!memoryTrack || !memoryCards.length) return;
  memoryIndex = (index + memoryCards.length) % memoryCards.length;
  memoryTrack.style.transform = `translateX(-${memoryIndex * 100}%)`;
  memoryCards.forEach((card, i) => card.setAttribute('aria-hidden', i === memoryIndex ? 'false' : 'true'));
  if(memoryPrev) memoryPrev.disabled = memoryCards.length <= 1;
  if(memoryNext) memoryNext.disabled = memoryCards.length <= 1;
  if(memoryDots) Array.from(memoryDots.children).forEach((dot, i) => dot.classList.toggle('active', i === memoryIndex));
}

if(memoryCards.length){
  renderMemoryDots();
  goToMemory(0);

  memoryPrev.addEventListener('click', () => goToMemory(memoryIndex - 1));
  memoryNext.addEventListener('click', () => goToMemory(memoryIndex + 1));

  memorySlider.addEventListener('touchstart', e => {
    if(!e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchTracking = true;
  }, {passive:true});

  memorySlider.addEventListener('touchend', e => {
    if(!touchTracking || !e.changedTouches.length) return;
    touchTracking = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.15){
      goToMemory(memoryIndex + (dx < 0 ? 1 : -1));
    }
  }, {passive:true});
}

// Gentle floating petals/hearts.
const petalSymbols=['🌸','🌺','🌼','✿','❀','🌷'];
function spawn(type){
  const el=document.createElement('span');
  el.className=type;
  el.textContent=type==='petal'?petalSymbols[Math.floor(Math.random()*petalSymbols.length)]:'♥';
  el.style.left=Math.random()*100+'vw';
  el.style.setProperty('--drift',(Math.random()*180-90)+'px');
  el.style.animationDuration=(8+Math.random()*7)+'s';
  el.style.opacity=(0.25+Math.random()*0.5).toFixed(2);
  document.getElementById(type==='petal'?'petals':'hearts').appendChild(el);
  setTimeout(()=>el.remove(),16000);
}
setInterval(()=>spawn('petal'),850);
setInterval(()=>spawn('heart'),1900);
