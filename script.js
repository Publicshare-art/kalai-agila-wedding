const body = document.body;
const opening = document.getElementById('opening');
const frontCover = document.getElementById('frontCover');
const curtain = document.getElementById('curtain');
const mainContent = document.getElementById('mainContent');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let openingDone = false;

// Supabase — safe browser configuration. RLS protects the table.
const SUPABASE_URL = 'https://ttlfusbudyldnpvphtye.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_26k1QQQojNLNNzI4d1iz-A_NrsMjkSZ';
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Curtain opening: kept as the same maroon striped curtain design, with no image on it.
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
    document.querySelector('.countdown-date').textContent='❤️ Reception day is here! ❤️';
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

// Memories — circular left/right carousel. It moves by click, not by scrolling through a grid.
const memoryItems = [
  ['images/photo01.jpg','Memory 1'],['images/photo05.jpg','Memory 2'],['images/photo06.jpg','Memory 3'],
  ['images/photo04.jpg','Memory 4'],['images/photo08.jpg','Memory 5'],['images/photo09.jpg','Memory 6'],
  ['images/photo10.jpg','Memory 7'],['images/photo11.jpg','Memory 8'],['images/photo12.jpg','Memory 9'],
  ['images/photo13.jpg','Memory 10'],['images/photo14.jpg','Memory 11'],['images/memory-15-wedding.jpg','Wedding memory']
];
const memoryTrack = document.getElementById('memoryTrack');
const memoryPrev = document.getElementById('memoryPrev');
const memoryNext = document.getElementById('memoryNext');
const memoryCounter = document.getElementById('memoryCounter');
let memoryIndex = 0;
function mod(n,m){ return ((n % m) + m) % m; }
function renderMemories(direction=0){
  memoryTrack.innerHTML='';
  memoryItems.forEach((item,i)=>{
    let delta = i - memoryIndex;
    if(delta > memoryItems.length/2) delta -= memoryItems.length;
    if(delta < -memoryItems.length/2) delta += memoryItems.length;
    const card=document.createElement('figure');
    card.className='memory-card';
    card.dataset.position=String(delta);
    card.setAttribute('aria-hidden', Math.abs(delta)>1 ? 'true' : 'false');
    card.innerHTML=`<img src="${item[0]}" alt="${item[1]}" loading="lazy"><span>${String(i+1).padStart(2,'0')}</span>`;
    card.style.setProperty('--pos',delta);
    memoryTrack.appendChild(card);
  });
  memoryCounter.textContent=`${String(memoryIndex+1).padStart(2,'0')} / ${String(memoryItems.length).padStart(2,'0')}`;
}
function moveMemory(step){
  memoryIndex=mod(memoryIndex+step,memoryItems.length);
  renderMemories(step);
}
memoryPrev.addEventListener('click',()=>moveMemory(-1));
memoryNext.addEventListener('click',()=>moveMemory(1));
document.addEventListener('keydown',e=>{
  const carousel=document.getElementById('memoryCarousel');
  if(carousel && carousel.contains(document.activeElement)){
    if(e.key==='ArrowLeft') moveMemory(-1);
    if(e.key==='ArrowRight') moveMemory(1);
  }
});
renderMemories();

// Guest blessings → Supabase.
const wishOpenBtn=document.getElementById('wishOpenBtn');
const wishPanel=document.getElementById('wishPanel');
const wishForm=document.getElementById('wishForm');
const wishStatus=document.getElementById('wishStatus');
wishOpenBtn.addEventListener('click',()=>{
  wishPanel.hidden=!wishPanel.hidden;
  wishOpenBtn.textContent=wishPanel.hidden?'💌 Send Your Blessings':'✕ Close Wishes';
  if(!wishPanel.hidden) document.getElementById('wishName').focus();
});
wishForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=document.getElementById('wishName').value.trim();
  const message=document.getElementById('wishMessage').value.trim();
  if(!name || !message) return;
  const submit=wishForm.querySelector('button[type="submit"]');
  submit.disabled=true;
  wishStatus.textContent='Sending your blessings…';
  if(!supabaseClient){
    wishStatus.textContent='Unable to connect right now. Please try again.';
    submit.disabled=false;
    return;
  }
  const {error}=await supabaseClient.from('Guest_wishes').insert({name,message});
  if(error){
    console.error(error);
    wishStatus.textContent='We could not save your blessing. Please try again.';
  }else{
    wishStatus.textContent='Thank you for your beautiful blessings. ❤️';
    wishForm.reset();
  }
  submit.disabled=false;
});

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
