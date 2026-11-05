(function(){
var WA='919978791167';
var LG=document.documentElement.lang||'gu';
var T={gu:{play:'Video ચલાવો',pump:'પંપ',hi:'નમસ્તે, મારી પાસે {n} {u} જમીન છે. ગણતરી મુજબ: ',end:'. આ પ્રોગ્રામ સમજાવો.'},
hi:{play:'वीडियो चलाएं',pump:'पंप',hi:'नमस्ते, मेरे पास {n} {u} ज़मीन है। गणना के अनुसार: ',end:'। यह प्रोग्राम समझाइए।'},
mr:{play:'व्हिडिओ चालू करा',pump:'पंप',hi:'नमस्कार, माझ्याकडे {n} {u} जमीन आहे. गणनेनुसार: ',end:'. हा प्रोग्राम समजावून सांगा.'},
pa:{play:'ਵੀਡੀਓ ਚਲਾਓ',pump:'ਪੰਪ',hi:'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੇਰੇ ਕੋਲ {n} {u} ਜ਼ਮੀਨ ਹੈ। ਹਿਸਾਬ ਮੁਤਾਬਕ: ',end:'। ਇਹ ਪ੍ਰੋਗਰਾਮ ਸਮਝਾਓ ਜੀ।'},
kn:{play:'ವೀಡಿಯೊ ಪ್ಲೇ ಮಾಡಿ',pump:'ಪಂಪ್',hi:'ನಮಸ್ಕಾರ, ನನ್ನ ಬಳಿ {n} {u} ಜಮೀನು ಇದೆ. ಲೆಕ್ಕದ ಪ್ರಕಾರ: ',end:'. ಈ ಪ್ರೋಗ್ರಾಂ ಬಗ್ಗೆ ತಿಳಿಸಿ.'},
en:{play:'Play video',pump:'pumps',hi:'Hello, I have {n} {u} of land. As per the calculator: ',end:'. Please explain this program.'}}[LG]||null;
if(!T)T={play:'Video ચલાવો',pump:'પંપ',hi:'નમસ્તે, મારી પાસે {n} {u} જમીન છે. ગણતરી મુજબ: ',end:'. આ પ્રોગ્રામ સમજાવો.'};
function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t);}
window.dataLayer=window.dataLayer||[];
var PLAY='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
function thumb(yt){return 'https://i.ytimg.com/vi/'+yt+'/hqdefault.jpg';}
document.querySelectorAll('[data-wa]').forEach(function(a){a.href=wa(a.getAttribute('data-wa'));});

function mount(box){
  var yt=box.getAttribute('data-yt'),mp4=box.getAttribute('data-mp4'),title=box.getAttribute('data-title')||'Video';
  if(mp4){box.innerHTML='<video controls preload="none" playsinline poster="'+thumb(yt)+'" src="'+mp4+'" title="'+title+'"></video>';return;}
  box.innerHTML='<img class="th" loading="lazy" alt="'+title+'" src="'+thumb(yt)+'"><button class="play" type="button" aria-label="'+T.play+'"><span>'+PLAY+'</span></button>';
  box.querySelector('.play').addEventListener('click',function(){
    box.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+yt+'?autoplay=1&rel=0&modestbranding=1" title="'+title+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    window.dataLayer.push({event:'video_play',video_id:yt});
  });
}
document.querySelectorAll('.vid[data-yt]').forEach(mount);

/* gallery lightbox + filters */
var lb=document.getElementById('lb');
if(lb){
  var inner=lb.querySelector('.in');
  var close=function(){lb.classList.remove('on');inner.innerHTML='';};
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('x'))close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  document.querySelectorAll('.gal-item').forEach(function(it){
    it.addEventListener('click',function(){
      var yt=it.getAttribute('data-yt'),mp4=it.getAttribute('data-mp4'),img=it.getAttribute('data-img');
      if(mp4){inner.innerHTML='<video controls autoplay playsinline src="'+mp4+'"></video>';}
      else if(yt){inner.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+yt+'?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';}
      else if(img){inner.innerHTML='<img src="'+img+'" alt="">';}
      lb.classList.add('on');
    });
  });
}
var fb=document.querySelectorAll('[data-filter]');
fb.forEach(function(b){
  b.addEventListener('click',function(){
    var f=b.getAttribute('data-filter'),n=0;
    fb.forEach(function(x){x.classList.toggle('on',x===b);});
    document.querySelectorAll('.gal-item').forEach(function(it){
      var c=(it.getAttribute('data-cat')||'').split(' ');
      var show=f==='all'||c.indexOf(f)>-1;
      it.hidden=!show; if(show)n++;
    });
    var em=document.getElementById('gal-empty'); if(em)em.hidden=n>0;
  });
});

/* dose calculator */
var ls=document.getElementById('landSize');
if(ls){
  var lu=document.getElementById('landUnit');
  var f=function(n){return Math.round(n*10)/10;};
  var calc=function(){
    var v=parseFloat(ls.value); if(isNaN(v)||v<=0)v=1;
    var vg=lu.value==='acre'?v*2.5:v;
    document.getElementById('resGranules').textContent=f(vg*8)+' - '+f(vg*12)+' KG';
    document.getElementById('resSpecial').textContent=f(vg*0.5)+' - '+f(vg*0.7)+' L';
    document.getElementById('resGold').textContent=Math.round(vg*4)+'-'+Math.round(vg*5)+' '+T.pump;
    document.getElementById('resGoldSub').textContent=Math.round(vg*250)+' ML Special + '+Math.round(vg*250)+' ML Gold';
  };
  ls.addEventListener('input',calc); lu.addEventListener('change',calc); calc();
  var cs=document.getElementById('calcSend');
  if(cs)cs.addEventListener('click',function(){
    var msg=T.hi.replace('{n}',ls.value).replace('{u}',lu.options[lu.selectedIndex].text)+'Granules: '+document.getElementById('resGranules').textContent+', Special (Drenching): '+document.getElementById('resSpecial').textContent+', Foliar Spray: '+document.getElementById('resGold').textContent+' ('+document.getElementById('resGoldSub').textContent+')'+T.end;
    window.dataLayer.push({event:'generate_lead',method:'whatsapp',click_source:'calculator',land_size:ls.value,land_unit:lu.value});
    window.open(wa(msg),'_blank');
  });
}
document.querySelectorAll('[data-print]').forEach(function(b){b.addEventListener('click',function(){window.print();});});

/* GTM lead tracking */
document.addEventListener('click',function(e){
  var s=function(l){var sec=l.closest('section,main');return (sec&&sec.id)||'page';};
  var t=e.target.closest('a[href^="tel:"]');
  if(t){window.dataLayer.push({event:'generate_lead',method:'call',click_source:s(t),link_url:t.href});return;}
  var w=e.target.closest('a[href*="wa.me"]');
  if(w){window.dataLayer.push({event:'generate_lead',method:'whatsapp',click_source:s(w),link_url:w.href});}
});
})();
