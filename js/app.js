/* 國立嘉義高中 3D 校園導覽 — 主程式
 * 場景、教室配置、樓層切換、搜尋、建築資訊與校園漫步
 * 資料：data/campus-data.js（位置）、data/school-year.js（學年度教室配置） */
(function(){
'use strict';
const C=window.CAMPUS_DATA, Y=window.SCHOOL_YEAR_DATA;
const S=C.scale, FH=C.floorHeight, [CX,CY]=C.origin;
const P=(x,y)=>[(x-CX)*S,(y-CY)*S];
const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const TYPE={class1:{label:'高一',v:'--g1'},class2:{label:'高二',v:'--g2'},class3:{label:'高三',v:'--g3'},
  special:{label:'專科教室',v:'--special'},office:{label:'處室',v:'--office'},stair:{label:'樓梯',v:'--stair'},common:{label:'公共空間',v:'--common'}};
const floorName=n=>n<0?'B1':n+'F';
$('year').textContent=Y.academicYear+' 學年度';

/* ---------- 場景 ---------- */
const stage=$('stage'), labelsEl=$('labels');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,0.3,3000);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.maxPolarAngle=1.45; controls.minDistance=20; controls.maxDistance=700;
const HOME={pos:new THREE.Vector3(-40,230,250),target:new THREE.Vector3(10,0,10)};
camera.position.copy(HOME.pos); controls.target.copy(HOME.target);

const hemi=new THREE.HemisphereLight(0xffffff,0x8d8a77,.75); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,.85); sun.position.set(-120,220,90);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-220,right:220,top:220,bottom:-220,near:10,far:600});
sun.shadow.bias=-0.0005; scene.add(sun);

const groundMat=new THREE.MeshStandardMaterial({color:'#e6e1cf',roughness:1,transparent:true});
const outlineM=C.outline.map(([x,y])=>P(x,y));
const ground=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(outlineM.map(([X,Z])=>new THREE.Vector2(X,-Z)))),groundMat);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const surround=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshStandardMaterial({color:'#9aa596',roughness:1}));
surround.rotation.x=-Math.PI/2; surround.position.y=-0.3; surround.receiveShadow=true; scene.add(surround);
// 圍牆
(function(){const m=new THREE.MeshStandardMaterial({color:'#b8ad94'});
  for(let i=0;i<outlineM.length;i++){const a=outlineM[i],b=outlineM[(i+1)%outlineM.length];
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const w=new THREE.Mesh(new THREE.BoxGeometry(len,1.6,.35),m);
    w.position.set((a[0]+b[0])/2,.8,(a[1]+b[1])/2);w.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);w.castShadow=true;scene.add(w);}})();

function applyTheme(){
  scene.background=new THREE.Color(css('--bg'));
  groundMat.color.set(css('--ground'));
  const r=document.documentElement.dataset.theme;
  const dark=r==='dark'||(!r&&matchMedia('(prefers-color-scheme: dark)').matches);
  hemi.intensity=dark?.45:.75; sun.intensity=dark?.55:.85;
}

const solids=[]; // 漫步碰撞用 [x1,z1,x2,z2]
function rectM(r){const [x1,z1]=P(r[0],r[1]),[x2,z2]=P(r[2],r[3]);return [x1,z1,x2,z2];}
function flatBox(r,color,h=.12,y=0,opts={}){
  const [x1,z1,x2,z2]=rectM(r);
  const m=new THREE.Mesh(new THREE.BoxGeometry(x2-x1,h,z2-z1),new THREE.MeshStandardMaterial({color,roughness:.9,...opts}));
  m.position.set((x1+x2)/2,y+h/2,(z1+z2)/2); m.receiveShadow=true; m.castShadow=h>1; scene.add(m); return m;
}
function stadium(cx,cy,rx,half){
  const s=new THREE.Shape(),[X,Z]=P(cx,cy),R=rx*S,H=half*S;
  s.moveTo(X-R,-(Z-H)); s.lineTo(X-R,-(Z+H));
  s.absarc(X,-(Z+H),R,Math.PI,2*Math.PI,false); s.lineTo(X+R,-(Z-H));
  s.absarc(X,-(Z-H),R,0,Math.PI,false); return s;
}
function flatShape(shape,color,y){const m=new THREE.Mesh(new THREE.ShapeGeometry(shape,48),new THREE.MeshStandardMaterial({color,roughness:1}));
  m.rotation.x=-Math.PI/2; m.position.y=y; m.receiveShadow=true; scene.add(m);}
flatShape(stadium(475,692,102,125),'#c7e83a',.05);
flatShape(stadium(475,692,85,120),'#c8664c',.08);
flatShape(stadium(475,692,64,112),'#6fcf3f',.11);
for(let i=0;i<4;i++){const x=576+i*7; flatBox([x,465,x+3,920],'#ffffff',.1,.05);}

/* ---------- 標籤 ---------- */
const labelItems=[], index=[], pickables=[];
function addLabel(html,pos,cls,ref,color){
  const el=document.createElement('div'); el.className='lbl '+cls; el.innerHTML=html;
  if(color) el.style.setProperty('--rc',color);
  el.addEventListener('click',e=>{e.stopPropagation();select(ref,true);});
  labelsEl.appendChild(el); const it={el,pos,cls,ref,show:true}; labelItems.push(it); return it;
}

/* ---------- 建築 ---------- */
const BUILDINGS=C.buildings.map(b=>Object.assign({},b,Y.buildings[b.id]||{}));
const byId={};
function roomColor(t){return css((TYPE[t]||TYPE.common).v);}
BUILDINGS.forEach(b=>{
  byId[b.id]=b; b.type='building';
  b.name=b.name||b.id; b.floorsList=[]; b.meshes=[];
  const fh=FH*(b.tall||1), rects=[b.r,...(b.extra||[])];
  for(let lv=(b.b1?-1:0);lv<b.f;lv++){
    const floorNo=lv<0?-1:lv+1, y=lv*fh, grp={floorNo,meshes:[],labels:[],rooms:[]};
    const fd=b.floorsData&&b.floorsData[floorNo];
    rects.forEach((r,ri)=>{
      const [x1,z1,x2,z2]=rectM(r), w=x2-x1, d=z2-z1, base=new THREE.Color(b.c);
      const add=(m,ud)=>{m.userData=ud;grp.meshes.push(m);};
      if(fd&&ri===0){
        const ax=b.axis==='z'?'z':'x', len=ax==='x'?w:d, depth=ax==='x'?d:w;
        const corD=depth*.3, roomD=depth-corD;
        // 走廊位置
        let corC, roomC;
        if(ax==='x'){ const corS=b.corridor==='n'; corC=corS?z1+corD/2:z2-corD/2; roomC=corS?z1+corD+roomD/2:z1+roomD/2; }
        else { const corW=b.corridor!=='e'; corC=corW?x1+corD/2:x2-corD/2; roomC=corW?x1+corD+roomD/2:x1+roomD/2; }
        const cor=new THREE.Mesh(new THREE.BoxGeometry(ax==='x'?w:corD,.2,ax==='x'?corD:d),
          new THREE.MeshStandardMaterial({color:base.clone().offsetHSL(0,-.1,.1),roughness:.8,transparent:true}));
        if(ax==='x') cor.position.set((x1+x2)/2,y+.1,corC); else cor.position.set(corC,y+.1,(z1+z2)/2);
        add(cor,{b});
        // 欄杆
        const rail=new THREE.Mesh(new THREE.BoxGeometry(ax==='x'?w:.15,1.1,ax==='x'?.15:d),
          new THREE.MeshStandardMaterial({color:'#f3f0e6',roughness:.9,transparent:true}));
        const edge=ax==='x'?(b.corridor==='n'?z1:z2):(b.corridor!=='e'?x1:x2);
        if(ax==='x') rail.position.set((x1+x2)/2,y+.75,edge); else rail.position.set(edge,y+.75,(z1+z2)/2);
        add(rail,{b});
        const units=fd.reduce((s,it)=>s+(it.span||1),0), seg=len/units;
        let acc=0;
        fd.forEach(it=>{
          const sp=it.span||1, L=seg*sp, mid=acc+L/2; acc+=L;
          const color=new THREE.Color(roomColor(it.type));
          const h=fh-.3;
          const mesh=new THREE.Mesh(new THREE.BoxGeometry(ax==='x'?L-.5:roomD,h,ax==='x'?roomD:L-.5),
            new THREE.MeshStandardMaterial({color:it.type==='stair'?base:color.lerp(base,.35),roughness:.85,transparent:true}));
          const cx=ax==='x'?x1+mid:roomC, cz=ax==='x'?roomC:z1+mid;
          mesh.position.set(cx,y+h/2,cz);
          const room={type:'room',code:it.code,name:it.name,kind:it.type,b,floorNo,mesh,center:new THREE.Vector3(cx,y+fh/2,cz)};
          add(mesh,{b,room}); grp.rooms.push(room);
          if(it.type!=='stair'){
            const txt=/^\d+$/.test(it.code)?`<b>${it.code}</b>${it.name!==it.code?' '+it.name.replace(it.code,'').trim():''}`:it.name;
            const li=addLabel(txt,new THREE.Vector3(cx,y+fh+.4,cz),'room',room,roomColor(it.type));
            grp.labels.push(li); room.label=li;
            index.push({label:/^\d+$/.test(it.code)?`${it.code} 班${it.name!==it.code?'（'+it.name.replace(it.code,'').trim()+'）':''}`:it.name,
              keys:it.code+it.name,sub:`${b.name} ${floorName(floorNo)}・${TYPE[it.type].label}`,ref:room,rank:/^\d+$/.test(it.code)?0:1});
          }
        });
      }else{
        const m=new THREE.Mesh(new THREE.BoxGeometry(w,fh-.25,d),
          new THREE.MeshStandardMaterial({color:base,roughness:.85,transparent:true}));
        m.position.set((x1+x2)/2,y+(fh-.25)/2,(z1+z2)/2); add(m,{b});
      }
      const slab=new THREE.Mesh(new THREE.BoxGeometry(w+.6,.25,d+.6),new THREE.MeshStandardMaterial({color:'#f3f0e6',roughness:.9,transparent:true}));
      slab.position.set((x1+x2)/2,y+fh-.125,(z1+z2)/2); add(slab,{b});
      if(lv===0) solids.push([x1,z1,x2,z2]);
    });
    grp.meshes.forEach(m=>{m.castShadow=true;m.receiveShadow=true;scene.add(m);pickables.push(m);b.meshes.push(m);});
    b.floorsList.push(grp);
  }
  const [x1,z1,x2,z2]=rectM(b.r);
  b.top=b.f*fh; b.fh=fh;
  b.center=new THREE.Vector3((x1+x2)/2,b.top/2,(z1+z2)/2); b.size=Math.max(x2-x1,z2-z1);
  b.label=addLabel(b.name+(b.sub?`<span style="font-weight:400;font-size:11px">（${b.sub}）</span>`:''),
    new THREE.Vector3(b.center.x,b.top+2.5,b.center.z),b.minor?'minor':'bld',b);
  if(!b.minor) index.push({label:b.name+(b.sub?`（${b.sub}）`:''),keys:b.name+(b.sub||'')+b.cat,sub:`${b.cat}・${b.b1?'B1–':''}${b.f}F`,ref:b,rank:0});
});

C.flats.forEach(f=>{
  let m; f.type='flat';
  if(f.roof){const [x1,z1,x2,z2]=rectM(f.r);
    m=new THREE.Mesh(new THREE.BoxGeometry(x2-x1,.3,z2-z1),new THREE.MeshStandardMaterial({color:f.c,roughness:.6}));
    m.position.set((x1+x2)/2,3,(z1+z2)/2); m.castShadow=true; scene.add(m);}
  else m=flatBox(f.r,f.c,f.h||(f.road?.04:.15),0,f.water?{roughness:.15,metalness:.1}:{});
  if(f.solid) solids.push(rectM(f.r));
  f.center=m.position.clone(); f.size=Math.max(Math.abs(f.r[2]-f.r[0]),Math.abs(f.r[3]-f.r[1]))*S;
  m.userData={flat:f}; pickables.push(m);
  if(!/（/.test(f.name)) f.label=addLabel(f.name,f.center.clone().add(new THREE.Vector3(0,(f.h||1)+2,0)),'minor',f);
  index.push({label:f.name,keys:f.name+f.cat,sub:f.cat,ref:f,rank:2});
});

C.points.forEach(p=>{
  const [X,Z]=P(...p.p); p.type='point'; p.center=new THREE.Vector3(X,0,Z);
  const M=c=>new THREE.MeshStandardMaterial({color:c});
  if(p.cat==='出入口')[-3,3].forEach(o=>{const g=new THREE.Mesh(new THREE.BoxGeometry(1.4,3.2,1.4),M('#8a7f6b'));g.position.set(X+o,1.6,Z);g.castShadow=true;scene.add(g);});
  if(['lizhu','chengmen','jianghe'].includes(p.id)){
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.4,1.8,4),M('#b23a2c'));roof.position.set(X,3.8,Z);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,8),M('#7a5a40'));post.position.set(X,1.5,Z);scene.add(post);}
  if(p.id==='bell'){const t=new THREE.Mesh(new THREE.CylinderGeometry(2,2.4,9,16),M('#b59a6c'));t.position.set(X,4.5,Z);t.castShadow=true;scene.add(t);solids.push([X-2.4,Z-2.4,X+2.4,Z+2.4]);}
  if(p.id==='roma'){const s=new THREE.Mesh(new THREE.CylinderGeometry(14,14,.6,40,1,false,Math.PI/2,Math.PI),M('#f2cf6b'));s.position.set(X,.3,Z+4);scene.add(s);}
  if(p.id==='meihua'){const s=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.4,5),new THREE.MeshStandardMaterial({color:'#69b8e0',roughness:.2}));s.position.set(X,.3,Z);scene.add(s);}
  p.label=addLabel(p.name,p.center.clone().add(new THREE.Vector3(0,p.id==='track'?2:6,0)),p.cat==='出入口'?'bld':'minor',p);
  index.push({label:p.name,keys:p.name+p.cat,sub:p.cat,ref:p,rank:2});
});
flatBox([738,385,765,442],'#9fdcef',.3,0,{roughness:.2}); // 水池

const trunkM=new THREE.MeshStandardMaterial({color:'#8b6b4a'}),leafM=new THREE.MeshStandardMaterial({color:'#2f8f3a'});
C.palms.forEach(([x,y])=>{const [X,Z]=P(x,y);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.35,.5,9,6),trunkM);t.position.set(X,4.5,Z);t.castShadow=true;scene.add(t);
  for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(.7,5,4),leafM);l.position.set(X,9,Z);l.rotation.z=1.15;l.rotation.y=i*Math.PI/3;l.translateY(2.2);l.castShadow=true;scene.add(l);}
  solids.push([X-.5,Z-.5,X+.5,Z+.5]);});

/* ---------- 樓層切換 ---------- */
let floorMode='all', showLabels=true, selected=null, selRoom=null;
function setFloor(f){
  floorMode=String(f);
  document.querySelectorAll('#rail .floor').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===floorMode)));
  const F=floorMode==='all'?null:Number(floorMode);
  groundMat.opacity=F===-1?.35:1; groundMat.depthWrite=F!==-1;
  BUILDINGS.forEach(b=>{
    b.floorsList.forEach(g=>{
      let vis=true,op=1;
      if(F!==null){ if(g.floorNo>F) vis=false; else if(g.floorNo<F) op=.22; }
      g.meshes.forEach(m=>{m.visible=vis;m.material.opacity=op;m.material.depthWrite=op===1;});
      g.labels.forEach(l=>l.show=F!==null&&g.floorNo===F);
    });
    const topLv=F===null?b.f:(F<0?0:Math.min(F,b.f));
    b.label.pos.y=topLv*b.fh+(b.floorsData&&F!==null?6:2.5);
    b.label.show=F===null||b.floorsList.some(g=>g.floorNo===F);
  });
  if(selected&&selected.type==='building') renderFloors(selected);
}
document.querySelectorAll('#rail .floor').forEach(btn=>btn.addEventListener('click',()=>setFloor(btn.dataset.f)));
$('toggleLbl').addEventListener('click',e=>{showLabels=!showLabels;e.currentTarget.setAttribute('aria-pressed',String(showLabels));});
$('reset').addEventListener('click',()=>{setFloor('all');flyTo(HOME.target,HOME.pos);});

/* ---------- 選取與資訊面板 ---------- */
const info=$('info');
let highlight=[];
function clearHighlight(){highlight.forEach(m=>m.material.emissive.set(0));highlight=[];labelItems.forEach(l=>l.el.classList.remove('sel'));}
function glow(meshes,k){highlight=meshes;meshes.forEach(m=>{m.material.emissive.set(css('--mark'));m.material.emissiveIntensity=k;});}

function renderFloors(b){
  const box=$('infoFloors'); box.innerHTML='';
  if(!b.floorsData) return;
  const floors=Object.keys(b.floorsData).map(Number).sort((a,c)=>a-c);
  const cur=floors.includes(Number(floorMode))?Number(floorMode):(selRoom&&selRoom.b===b?selRoom.floorNo:floors[0]);
  const tabs=document.createElement('div'); tabs.className='tabs'; tabs.setAttribute('role','tablist');
  floors.forEach(n=>{const t=document.createElement('button');t.className='btn';t.textContent=floorName(n);
    t.setAttribute('aria-pressed',String(n===cur));t.addEventListener('click',()=>{setFloor(n);});tabs.appendChild(t);});
  box.appendChild(tabs);
  const grp=b.floorsList.find(g=>g.floorNo===cur), wrap=document.createElement('div'); wrap.className='rooms';
  grp.rooms.forEach(r=>{
    const el=document.createElement('button'); el.className='rm'+(r.kind==='stair'?' stair':'')+(r===selRoom?' sel':'');
    el.style.setProperty('--rc',roomColor(r.kind));
    const num=/^\d+$/.test(r.code);
    el.innerHTML=num?`<b>${r.code}</b><small>${r.name.replace(r.code,'').trim()||TYPE[r.kind].label}</small>`:`<b style="font-family:var(--f-body)">${r.name}</b><small>${TYPE[r.kind].label}</small>`;
    if(r.kind==='stair') el.disabled=true; else el.addEventListener('click',()=>select(r,true));
    wrap.appendChild(el);
  });
  box.appendChild(wrap);
  const note=document.createElement('div'); note.className='dirnote';
  note.textContent=b.axis==='z'?'由北 → 南排列':'由西 → 東排列'; box.appendChild(note);
}

function select(ref,fly){
  clearHighlight(); selRoom=null;
  if(!ref){selected=null;info.hidden=true;return;}
  let target,dist;
  if(ref.type==='room'){
    const r=ref; selRoom=r; selected=r.b;
    if(floorMode!==String(r.floorNo)) setFloor(r.floorNo);
    glow([r.mesh],.5); r.label&&r.label.el.classList.add('sel');
    $('infoName').textContent=/^\d+$/.test(r.code)?`${r.code} 班`:r.name;
    $('infoMeta').innerHTML=[r.b.name,floorName(r.floorNo),TYPE[r.kind].label,/^\d+$/.test(r.code)&&r.name!==r.code?r.name.replace(r.code,'').trim()+'班':''].filter(Boolean).map(m=>`<span class="chip">${m}</span>`).join('');
    $('infoDesc').textContent=`位於${r.b.name} ${floorName(r.floorNo)}。`;
    renderFloors(r.b);
    target=r.center; dist=45;
  }else if(ref.type==='building'){
    const b=ref; selected=b;
    glow(b.meshes.filter(m=>m.visible),.15); b.label.el.classList.add('sel');
    $('infoName').textContent=b.name+(b.sub?`（${b.sub}）`:'');
    $('infoMeta').innerHTML=[b.cat,`地上 ${b.f} 層`,b.b1?'地下 1 層':''].filter(Boolean).map(m=>`<span class="chip">${m}</span>`).join('');
    $('infoDesc').textContent=b.summary||`${b.cat}空間。`;
    renderFloors(b);
    target=b.center; dist=Math.max(60,b.size*2.2);
  }else{
    selected=ref; ref.label&&ref.label.el.classList.add('sel');
    $('infoName').textContent=ref.name; $('infoMeta').innerHTML=`<span class="chip">${ref.cat}</span>`;
    $('infoDesc').textContent=ref.cat==='出入口'?'校園出入口。':'依校園平面圖位置標示。'; $('infoFloors').innerHTML='';
    target=ref.center; dist=ref.id==='track'?140:(ref.size?Math.max(60,ref.size*1.6):70);
  }
  info.hidden=false;
  if(fly&&!walk){const dir=camera.position.clone().sub(controls.target).setY(0).normalize();
    if(!dir.lengthSq()) dir.set(0,0,1);
    flyTo(target,target.clone().add(dir.multiplyScalar(dist*.75)).setY(target.y+dist*.7));}
}
$('closeInfo').addEventListener('click',()=>select(null));

let tween=null;
function flyTo(t,p){tween={t0:controls.target.clone(),p0:camera.position.clone(),t1:t.clone(),p1:p.clone(),s:performance.now()};}

const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{
  if(walk||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(pickables.filter(m=>m.visible&&m.material.opacity>.5))[0];
  if(!hit){select(null);return;}
  const u=hit.object.userData;
  if(u.room&&u.room.kind!=='stair'&&floorMode!=='all') select(u.room,false);
  else if(u.b) select(u.b,false);
  else if(u.flat) select(u.flat,false);
});

/* ---------- 搜尋 ---------- */
const q=$('q'),results=$('results');
const norm=s=>s.replace(/\s+/g,'').toLowerCase();
function search(){
  const s=norm(q.value); results.innerHTML='';
  if(!s)return;
  const hits=index.filter(i=>norm(i.keys+i.label+i.sub).includes(s))
    .sort((a,b)=>(norm(a.label).startsWith(s)?0:1)-(norm(b.label).startsWith(s)?0:1)||a.rank-b.rank).slice(0,14);
  hits.forEach(i=>{
    const li=document.createElement('li'),b=document.createElement('button');
    b.innerHTML=`<span>${i.label}</span><small>${i.sub}</small>`;
    b.addEventListener('click',()=>{select(i.ref,true);results.innerHTML='';q.value=i.label;q.blur();});
    li.appendChild(b);results.appendChild(li);
  });
  if(!hits.length) results.innerHTML='<li class="empty">找不到符合的班級或地點</li>';
}
q.addEventListener('input',search);
q.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=results.querySelector('button');b&&b.click();}if(e.key==='Escape'){q.value='';results.innerHTML='';}});

/* ---------- 指北針 ---------- */
const needle=$('needle'), tmpDir=new THREE.Vector3();
$('compass').addEventListener('click',()=>{
  if(walk){walk.yaw=0;return;}
  const off=camera.position.clone().sub(controls.target), h=Math.hypot(off.x,off.z);
  flyTo(controls.target,controls.target.clone().add(new THREE.Vector3(0,off.y,h)));
});

/* ---------- 校園漫步 ---------- */
let walk=null; const keys={};
const avatar=new THREE.Group();
(function(){const body=new THREE.Mesh(new THREE.CylinderGeometry(.32,.38,1.1,14),new THREE.MeshStandardMaterial({color:'#2d5d8c'}));body.position.y=.95;
  const legs=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.45,12),new THREE.MeshStandardMaterial({color:'#2b2f36'}));legs.position.y=.22;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,16,12),new THREE.MeshStandardMaterial({color:'#f1c9a5'}));head.position.y=1.75;
  const nose=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.2),new THREE.MeshStandardMaterial({color:'#2d5d8c'}));nose.position.set(0,1.0,-.38);
  [body,legs,head,nose].forEach(m=>{m.castShadow=true;avatar.add(m);});})();
avatar.visible=false; scene.add(avatar);

function inPoly(x,z){let c=false;for(let i=0,j=outlineM.length-1;i<outlineM.length;j=i++){const [xi,zi]=outlineM[i],[xj,zj]=outlineM[j];
  if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))c=!c;}return c;}
function blocked(x,z){const m=.45; if(!inPoly(x,z))return true;
  return solids.some(([a,b,c,d])=>x>a-m&&x<c+m&&z>b-m&&z<d+m);}

function startWalk(){
  const [X,Z]=P(...C.walkStart);
  walk={pos:new THREE.Vector3(X,0,Z),yaw:0,pitch:-.05,fp:false,joy:{x:0,y:0}};
  select(null); setFloor('all'); controls.enabled=false; avatar.visible=true; tween=null;
  document.body.classList.add('walking'); $('walkbar').hidden=false;
  $('joy').hidden=!matchMedia('(pointer: coarse)').matches;
  $('walkHint').textContent=matchMedia('(pointer: coarse)').matches?'搖桿移動・拖曳畫面轉向':'WASD／方向鍵移動・拖曳轉向・Shift 跑步';
}
function endWalk(){
  if(!walk)return; const p=walk.pos.clone(); walk=null;
  controls.enabled=true; avatar.visible=false; document.body.classList.remove('walking');
  $('walkbar').hidden=true; $('joy').hidden=true;
  controls.target.copy(p); camera.position.copy(p.clone().add(new THREE.Vector3(0,60,60)));
}
$('walkBtn').addEventListener('click',startWalk);
$('exitWalk').addEventListener('click',endWalk);
$('povBtn').addEventListener('click',e=>{walk.fp=!walk.fp;e.currentTarget.setAttribute('aria-pressed',String(walk.fp));});
addEventListener('keydown',e=>{if(document.activeElement===q)return;keys[e.code]=true;if(e.code==='Escape'&&walk)endWalk();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(walk){drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(walk&&drag){walk.yaw-=(e.clientX-drag[0])*.005;walk.pitch=Math.max(-.9,Math.min(.6,walk.pitch-(e.clientY-drag[1])*.003));drag=[e.clientX,e.clientY];}});
renderer.domElement.addEventListener('pointerup',()=>drag=null);
// 搖桿
(function(){const j=$('joy'),k=j.querySelector('i');let id=null;
  const upd=e=>{const r=j.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);
    const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}walk&&(walk.joy={x,y});k.style.transform=`translate(${x*36}px,${y*36}px)`;};
  j.addEventListener('pointerdown',e=>{id=e.pointerId;j.setPointerCapture(id);upd(e);});
  j.addEventListener('pointermove',e=>{if(e.pointerId===id)upd(e);});
  const end=()=>{id=null;walk&&(walk.joy={x:0,y:0});k.style.transform='';};
  j.addEventListener('pointerup',end);j.addEventListener('pointercancel',end);})();

function stepWalk(dt){
  const k=keys, run=k.ShiftLeft||k.ShiftRight;
  let fwd=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0)-walk.joy.y;
  let str=(k.KeyD?1:0)-(k.KeyA?1:0);
  walk.yaw+=((k.ArrowLeft?1:0)-(k.ArrowRight?1:0))*1.8*dt-walk.joy.x*1.8*dt;
  const sp=(run?10:4.5)*dt, fx=-Math.sin(walk.yaw), fz=-Math.cos(walk.yaw);
  const dx=(fx*fwd+Math.cos(walk.yaw)*str)*sp, dz=(fz*fwd-Math.sin(walk.yaw)*str)*sp;
  if(!blocked(walk.pos.x+dx,walk.pos.z)) walk.pos.x+=dx;
  if(!blocked(walk.pos.x,walk.pos.z+dz)) walk.pos.z+=dz;
  avatar.position.copy(walk.pos); avatar.rotation.y=walk.yaw;
  avatar.visible=!walk.fp;
  if(walk.fp){
    camera.position.set(walk.pos.x,1.6,walk.pos.z);
    camera.lookAt(walk.pos.x+fx,1.6+Math.tan(walk.pitch),walk.pos.z+fz);
  }else{
    const back=7, up=3.2-walk.pitch*4;
    let cx=walk.pos.x-fx*back, cz=walk.pos.z-fz*back;
    camera.position.set(cx,up,cz); camera.lookAt(walk.pos.x,1.6,walk.pos.z);
  }
}

/* ---------- 迴圈 ---------- */
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
const v=new THREE.Vector3(); let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(walk) stepWalk(dt);
  else{
    if(tween){const t=Math.min(1,(now-tween.s)/900),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      controls.target.lerpVectors(tween.t0,tween.t1,e);camera.position.lerpVectors(tween.p0,tween.p1,e);if(t===1)tween=null;}
    controls.update();
  }
  renderer.render(scene,camera);
  camera.getWorldDirection(tmpDir); needle.setAttribute('transform',`rotate(${Math.atan2(-tmpDir.x,-tmpDir.z)*180/Math.PI} 13 13)`);
  const dist=walk?0:camera.position.distanceTo(controls.target);
  for(const l of labelItems){
    let vis=showLabels&&l.show;
    if(vis&&walk&&l.cls==='room') vis=false;
    if(vis&&l.cls==='minor'&&dist>420&&!l.el.classList.contains('sel')) vis=false;
    if(vis&&walk&&l.pos.distanceTo(camera.position)>120) vis=false;
    if(vis){v.copy(l.pos).project(camera); vis=v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1;}
    if(vis){l.el.style.display='';l.el.style.transform=`translate(-50%,-100%) translate(${(v.x+1)/2*innerWidth}px,${(1-v.y)/2*innerHeight}px)`;}
    else l.el.style.display='none';
  }
  requestAnimationFrame(loop);
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
setFloor('all');
// 網址 #315 直接定位班級
const h=decodeURIComponent(location.hash.slice(1));
if(h){q.value=h;search();const b=results.querySelector('button');b&&b.click();}
requestAnimationFrame(loop);
})();
