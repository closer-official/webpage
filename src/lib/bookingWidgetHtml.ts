/**
 * LPに埋め込む予約UI（server/bookingWidgetHtml.js と同等・buildHtml 用）
 */

function escapeHtml(s: string | null | undefined) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderBookingHeadMeta(itemId: string, apiOrigin: string) {
  const id = escapeHtml(itemId);
  const origin = escapeHtml(String(apiOrigin || '').replace(/\/$/, ''));
  return `
<meta name="wo-booking-item" content="${id}">
<meta name="wo-booking-api-origin" content="${origin}">`;
}

export function renderBookingBodyWidget(p: { ctaLabel: string; siteName: string }) {
  const cta = escapeHtml(p.ctaLabel || '予約する');
  const site = escapeHtml(p.siteName || '');

  return `
<style id="wo-booking-styles">
body.wo-booking-on { padding-bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px)); }
body.wo-booking-on.page-wrapper.template-gym_yoga main { padding-bottom: 0.5rem !important; }
.wo-booking-bar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 9998;
  padding: 0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px));
  background: rgba(255,255,255,0.96);
  border-top: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.08);
  display: flex; justify-content: center; align-items: center;
}
.wo-booking-bar-btn {
  width: min(100%, 28rem);
  min-height: 52px; border: none; border-radius: 999px; cursor: pointer;
  font-size: 1rem; font-weight: 700; letter-spacing: 0.06em;
  background: linear-gradient(180deg, #1fa36f 0%, #157a52 100%);
  color: #fff; box-shadow: 0 4px 16px rgba(21,122,82,0.35);
}
.wo-booking-bar-btn:active { transform: scale(0.98); }
.wo-booking-overlay {
  position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.45);
  display: none; align-items: flex-end; justify-content: center;
  padding: 0; margin: 0;
}
.wo-booking-overlay.is-open { display: flex; }
.wo-booking-modal {
  width: 100%; max-height: min(92vh, 720px); overflow: hidden;
  background: #faf9f6; border-radius: 16px 16px 0 0;
  display: flex; flex-direction: column;
  box-shadow: 0 -12px 48px rgba(0,0,0,0.2);
}
.wo-booking-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1rem 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06);
  background: #fff;
}
.wo-booking-modal-title { font-size: 1.05rem; font-weight: 800; margin: 0; }
.wo-booking-close {
  width: 2.5rem; height: 2.5rem; border: none; border-radius: 50%;
  background: #eee; font-size: 1.25rem; line-height: 1; cursor: pointer;
}
.wo-booking-modal-body { overflow-y: auto; padding: 1rem; flex: 1; }
.wo-booking-hint { font-size: 0.8rem; color: #666; margin: 0 0 0.75rem; line-height: 1.5; }
.wo-booking-date-row { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.75rem; -webkit-overflow-scrolling: touch; }
.wo-booking-date-pill {
  flex: 0 0 auto; min-width: 4.1rem; padding: 0.5rem 0.45rem; border-radius: 10px;
  border: 1px solid #ddd; background: #fff; font-size: 0.78rem; cursor: pointer; text-align: center;
}
.wo-booking-date-pill.is-active { border-color: #157a52; background: #e8f5ef; font-weight: 700; }
.wo-booking-slot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.45rem; }
@media (min-width: 480px) { .wo-booking-slot-grid { grid-template-columns: repeat(5, 1fr); } }
.wo-booking-slot {
  padding: 0.55rem 0.25rem; border-radius: 8px; border: 1px solid #e0e0e0;
  background: #fff; font-size: 0.8rem; text-align: center; cursor: default;
}
.wo-booking-slot.ok { cursor: pointer; border-color: #157a52; }
.wo-booking-slot.ok:hover { background: #e8f5ef; }
.wo-booking-slot .sym { display: block; font-size: 1rem; font-weight: 800; }
.wo-booking-slot.ok .sym { color: #157a52; }
.wo-booking-slot.bad { opacity: 0.45; background: #f3f3f3; }
.wo-booking-form { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #ccc; display: none; }
.wo-booking-form.is-visible { display: block; }
.wo-booking-form label { display: block; font-size: 0.8rem; font-weight: 600; margin: 0.5rem 0 0.2rem; }
.wo-booking-form input, .wo-booking-form textarea {
  width: 100%; box-sizing: border-box; padding: 0.55rem 0.65rem; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem;
}
.wo-booking-submit {
  margin-top: 0.85rem; width: 100%; min-height: 48px; border: none; border-radius: 999px;
  background: #157a52; color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer;
}
.wo-booking-msg { margin-top: 0.75rem; font-size: 0.88rem; }
.wo-booking-msg.err { color: #b91c1c; }
.wo-booking-msg.ok { color: #0f766e; }
.wo-booking-loading { text-align: center; padding: 2rem; color: #666; }
</style>
<div class="wo-booking-bar" role="region" aria-label="予約">
  <button type="button" class="wo-booking-bar-btn wo-booking-open">${cta}</button>
</div>
<div id="wo-booking-overlay" class="wo-booking-overlay" aria-hidden="true">
  <div class="wo-booking-modal" role="dialog" aria-modal="true" aria-labelledby="wo-booking-modal-title">
    <div class="wo-booking-modal-head">
      <h2 id="wo-booking-modal-title" class="wo-booking-modal-title">日時を選択${site ? ` — ${site}` : ''}</h2>
      <button type="button" class="wo-booking-close wo-booking-close-x" aria-label="閉じる">×</button>
    </div>
    <div class="wo-booking-modal-body">
      <p class="wo-booking-hint">ご希望の日付を選び、<strong>○</strong>の時間帯をタップして送信してください（<strong>×</strong>は選択不可です）。</p>
      <div id="wo-booking-loading" class="wo-booking-loading">読み込み中…</div>
      <div id="wo-booking-ui" style="display:none">
        <div id="wo-booking-dates" class="wo-booking-date-row"></div>
        <div id="wo-booking-slots" class="wo-booking-slot-grid"></div>
        <form id="wo-booking-form" class="wo-booking-form">
          <p style="margin:0 0 0.5rem;font-size:0.85rem"><strong id="wo-booking-picked"></strong></p>
          <label for="wo-b-name">お名前 <span style="color:#b91c1c">*</span></label>
          <input id="wo-b-name" name="customerName" required autocomplete="name" placeholder="山田 太郎">
          <label for="wo-b-email">メール</label>
          <input id="wo-b-email" type="email" name="customerEmail" autocomplete="email" placeholder="任意">
          <label for="wo-b-tel">電話番号</label>
          <input id="wo-b-tel" type="tel" name="customerPhone" autocomplete="tel" placeholder="任意">
          <label for="wo-b-note">ご要望</label>
          <textarea id="wo-b-note" name="note" rows="2" placeholder="任意"></textarea>
          <button type="submit" class="wo-booking-submit">この内容で予約する</button>
          <p id="wo-booking-form-msg" class="wo-booking-msg" role="status"></p>
        </form>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
function apiBase(){
  var m=document.querySelector('meta[name="wo-booking-api-origin"]');
  var o=(m&&m.getAttribute('content')||'').trim();
  if(o){while(o.length>0&&o.charAt(o.length-1)==='/')o=o.slice(0,-1);return o;}
  try{return window.location.origin}catch(e){return''}
}
function itemId(){
  var m=document.querySelector('meta[name="wo-booking-item"]');
  return (m&&m.getAttribute('content')||'').trim();
}
var overlay=document.getElementById('wo-booking-overlay');
var openBtns=document.querySelectorAll('.wo-booking-open');
var state={ schedule:[], dateIndex:0, picked:null };

function closeModal(){
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function openModal(){
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  loadAvail();
}
openBtns.forEach(function(b){b.addEventListener('click',openModal);});
overlay.querySelector('.wo-booking-close-x').addEventListener('click',closeModal);
overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});

function loadAvail(){
  var id=itemId();var base=apiBase();
  var ld=document.getElementById('wo-booking-loading');
  var ui=document.getElementById('wo-booking-ui');
  ld.style.display='block';ui.style.display='none';
  fetch(base+'/api/booking/availability/'+encodeURIComponent(id),{credentials:'omit'})
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
    .then(function(x){
      ld.style.display='none';ui.style.display='block';
      if(!x.ok||!x.j.schedule){document.getElementById('wo-booking-slots').textContent='取得に失敗しました。時間をおいて再度お試しください。';return;}
      state.schedule=x.j.schedule;state.dateIndex=0;state.picked=null;
      renderDates();renderSlots();hideForm();
    }).catch(function(){ld.textContent='通信に失敗しました。';});
}

function renderDates(){
  var el=document.getElementById('wo-booking-dates');el.innerHTML='';
  state.schedule.forEach(function(day,i){
    var b=document.createElement('button');b.type='button';b.className='wo-booking-date-pill'+(i===state.dateIndex?' is-active':'');
    var parts=day.date.split('-');
    b.textContent=Number(parts[1])+'/'+Number(parts[2]);
    b.addEventListener('click',function(){state.dateIndex=i;state.picked=null;renderDates();renderSlots();hideForm();});
    el.appendChild(b);
  });
}
function renderSlots(){
  var el=document.getElementById('wo-booking-slots');el.innerHTML='';
  var day=state.schedule[state.dateIndex];if(!day)return;
  day.slots.forEach(function(s){
    var d=document.createElement('div');d.className='wo-booking-slot'+(s.available?' ok':' bad');
    d.innerHTML='<span class="sym">'+(s.symbol||'×')+'</span>'+s.time;
    if(s.available){d.addEventListener('click',function(){pickSlot(day.date,s.time);});}
    el.appendChild(d);
  });
}
function hideForm(){
  var f=document.getElementById('wo-booking-form');
  f.classList.remove('is-visible');
  document.getElementById('wo-booking-form-msg').textContent='';
}
function pickSlot(date,time){
  state.picked={date:date,time:time};
  document.getElementById('wo-booking-picked').textContent=date+' '+time+' 〜';
  document.getElementById('wo-booking-form').classList.add('is-visible');
  document.getElementById('wo-booking-form-msg').textContent='';
}

document.getElementById('wo-booking-form').addEventListener('submit',function(e){
  e.preventDefault();
  var msg=document.getElementById('wo-booking-form-msg');
  msg.textContent='';msg.className='wo-booking-msg';
  if(!state.picked){msg.textContent='時間帯を選んでください。';msg.classList.add('err');return;}
  var id=itemId();var base=apiBase();
  var fd=new FormData(e.target);
  var body={
    dateKey:state.picked.date,
    time:state.picked.time,
    customerName:(fd.get('customerName')||'').toString().trim(),
    customerEmail:(fd.get('customerEmail')||'').toString().trim(),
    customerPhone:(fd.get('customerPhone')||'').toString().trim(),
    note:(fd.get('note')||'').toString().trim()
  };
  fetch(base+'/api/booking/'+encodeURIComponent(id),{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
  .then(function(x){
    if(x.ok&&x.j.ok){
      msg.textContent='予約を受け付けました。担当よりご連絡いたします。';
      msg.classList.add('ok');
      e.target.reset();
      state.picked=null;
      loadAvail();
    }else{
      msg.textContent=(x.j&&x.j.error)||'送信に失敗しました。';
      msg.classList.add('err');
    }
  }).catch(function(){msg.textContent='通信エラーです。';msg.classList.add('err');});
});
document.body.classList.add('wo-booking-on');
})();
</script>`;
}
