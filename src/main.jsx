
import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {createWorker} from "tesseract.js";
import "./styles.css";

const seed=[
 {id:1,date:"2026-09-02",bookmaker:"Bet365",sport:"Football",games:2,selections:4,odds:4.5,stake:10,return:45,result:"Won",markets:["Match Result","Goals","Corners","Cards"],note:"Weekend builder"},
 {id:2,date:"2026-09-03",bookmaker:"Sky Bet",sport:"Football",games:3,selections:6,odds:6.2,stake:15,return:0,result:"Lost",markets:["Goals","Shots","Match Result"],note:""},
 {id:3,date:"2026-09-06",bookmaker:"William Hill",sport:"Football",games:2,selections:4,odds:3.8,stake:12,return:45.6,result:"Won",markets:["Goals","Both Teams To Score"],note:""},
 {id:4,date:"2026-09-08",bookmaker:"Bet365",sport:"Football",games:1,selections:3,odds:5.5,stake:8,return:0,result:"Pending",markets:["Player Shots","Goals"],note:""}
];

function readBets(){try{return JSON.parse(localStorage.getItem("bbt-bets"))||seed}catch{return seed}}
const money=n=>"£"+Number(n||0).toFixed(2);
const safeNum=(v,d=0)=>{const n=Number(String(v).replace(/[^\d.-]/g,""));return Number.isFinite(n)?n:d};

function App(){
 const [bets,setBets]=useState(readBets);
 const [page,setPage]=useState("Dashboard");
 useEffect(()=>localStorage.setItem("bbt-bets",JSON.stringify(bets)),[bets]);
 const addBet=bet=>{setBets(x=>[{...bet,id:Date.now(),date:bet.date||new Date().toISOString().slice(0,10)},...x]);setPage("Bet History")};
 const updateResult=(id,result)=>setBets(x=>x.map(b=>b.id===id?{...b,result,return:result==="Won"?(Number(b.stake)*Number(b.odds)):result==="Lost"?0:Number(b.return||0)}:b));
 const deleteBet=id=>setBets(x=>x.filter(b=>b.id!==id));
 return <div className="app">
  <aside className="side"><div className="brand"><span className="brandmark">✓</span><div><b>BET BUILDER</b><small>TRACKER</small></div></div>
   {["Dashboard","Add Bet","Bet History","Analytics","Settings"].map(p=><button className={page===p?"nav active":"nav"} onClick={()=>setPage(p)} key={p}><span>{({Dashboard:"⌂","Add Bet":"+","Bet History":"▤",Analytics:"◒",Settings:"⚙"})[p]}</span>{p}</button>)}
   <div className="sidefoot">PRIVATE LOCAL TRACKER<br/><span>Your bets stay in this browser.</span></div>
  </aside>
  <main className="main"><header><div><div className="eyebrow">BET BUILDER TRACKER</div><h1>{page}</h1></div><button className="primary" onClick={()=>setPage("Add Bet")}>＋ Add bet</button></header>
   {page==="Dashboard"&&<Dashboard bets={bets} setPage={setPage}/>}
   {page==="Add Bet"&&<AddBet onAdd={addBet}/>}
   {page==="Bet History"&&<History bets={bets} updateResult={updateResult} deleteBet={deleteBet}/>}
   {page==="Analytics"&&<Analytics bets={bets}/>}
   {page==="Settings"&&<Settings bets={bets} setBets={setBets}/>}
  </main>
 </div>
}

function Dashboard({bets,setPage}){
 const settled=bets.filter(b=>b.result!=="Pending"), won=settled.filter(b=>b.result==="Won");
 const profit=settled.reduce((a,b)=>a+Number(b.return||0)-Number(b.stake||0),0);
 const staked=settled.reduce((a,b)=>a+Number(b.stake||0),0), roi=staked?profit/staked*100:0;
 const avg=bets.length?bets.reduce((a,b)=>a+Number(b.odds||0),0)/bets.length:0;
 return <div className="content">
  <section className="hero"><div><span className="pill">LIVE TRACKER</span><h2>Know exactly how your builders are performing.</h2><p>Scan a bet slip, review every leg, save it, then track results and bankroll over time.</p></div><div className="heroart"><i></i><i></i><i></i><strong>{money(profit)}</strong><small>settled profit</small></div></section>
  <div className="kpis"><K title="Total bets" value={bets.length} sub={`${bets.filter(b=>b.result==="Pending").length} pending`} icon="◈"/><K title="Win rate" value={`${settled.length?(won.length/settled.length*100).toFixed(1):0}%`} sub={`${won.length} wins / ${settled.length} settled`} icon="↗"/><K title="Average odds" value={avg.toFixed(2)} sub="across all builders" icon="◎"/><K title="ROI" value={`${roi.toFixed(1)}%`} sub={`profit ${money(profit)}`} icon="£"/></div>
  <div className="grid2"><section className="card chartcard"><div className="cardhead"><div><b>Profit / loss</b><span>Settled cumulative</span></div><button onClick={()=>setPage("Bet History")}>Full history →</button></div><ProfitChart bets={bets}/></section>
  <section className="card"><div className="cardhead"><div><b>Recent bets</b><span>Latest activity</span></div></div><div className="recent">{bets.slice(0,5).map(b=><div className="recentrow" key={b.id}><div className="datebox">{String(b.date).slice(8,10)}<small>{new Date(b.date).toLocaleString("en-GB",{month:"short"})}</small></div><div className="grow"><b>{b.bookmaker} · {b.sport}</b><span>{b.games} games · {b.selections} selections · {b.odds} odds</span></div><div className={b.result==="Won"?"profit pos":b.result==="Lost"?"profit neg":"profit pend"}>{b.result==="Won"?"+":b.result==="Lost"?"−":"…"}{money(Math.abs(Number(b.return||0)-Number(b.stake||0)))}</div></div>)}</div></section></div>
 </div>
}
function K({title,value,sub,icon}){return <div className="kpi"><span className="kicon">{icon}</span><small>{title}</small><strong>{value}</strong><em>{sub}</em></div>}

function ProfitChart({bets}){
 const data=bets.filter(b=>b.result!=="Pending").slice().reverse().reduce((a,b)=>{const prev=a.length?a[a.length-1].v:0;a.push({d:b.date,v:prev+Number(b.return||0)-Number(b.stake||0)});return a},[]);
 if(!data.length)return <div className="emptychart">Settle a bet to start your profit graph.</div>;
 const W=760,H=250,pad=28,min=Math.min(0,...data.map(x=>x.v)),max=Math.max(0,...data.map(x=>x.v)),range=max-min||1;
 const pts=data.map((x,i)=>`${pad+i*(W-pad*2)/Math.max(1,data.length-1)},${H-pad-(x.v-min)/range*(H-pad*2)}`).join(" ");
 return <div className="svgwrap"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><line x1={pad} y1={H-pad-(0-min)/range*(H-pad*2)} x2={W-pad} y2={H-pad-(0-min)/range*(H-pad*2)} className="zero"/><polyline points={pts} className="line"/>{data.map((x,i)=>{const [cx,cy]=pts.split(" ")[i].split(",");return <circle key={i} cx={cx} cy={cy} r="4" className={x.v>=0?"dot posdot":"dot negdot"}><title>{x.d} · {money(x.v)}</title></circle>})}</svg><div className="chartlabels"><span>{data[0].d}</span><span>{data[data.length-1].d}</span></div></div>
}

function AddBet({onAdd}){
 const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[scanning,setScanning]=useState(false),[progress,setProgress]=useState(0),[status,setStatus]=useState(""),[raw,setRaw]=useState("");
 const [form,setForm]=useState({bookmaker:"",sport:"Football",date:new Date().toISOString().slice(0,10),stake:"",odds:"",return:"",result:"Pending",note:"",legs:[]});
 const input=useRef();
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 async function scan(f){
  if(!f||!f.type.startsWith("image/")){setStatus("Please choose a JPG, PNG or WEBP image.");return}
  setFile(f);setPreview(URL.createObjectURL(f));setScanning(true);setProgress(0);setStatus("Reading the bet slip…");
  const worker=await createWorker("eng",{logger:m=>{if(m.status==="recognizing text")setProgress(Math.round((m.progress||0)*100))}});
  try{
   const {data}=await worker.recognize(f); setRaw(data.text||"");
   const parsed=parseSlip(data.text||"");
   setForm(x=>({...x,...parsed,legs:parsed.legs.length?parsed.legs:x.legs}));
   setStatus(`Scan complete — ${parsed.legs.length} leg${parsed.legs.length===1?"":"s"} detected. Check the fields below before saving.`);
  }catch(e){setStatus("The image could not be read. You can still enter the slip manually.");}
  await worker.terminate();setScanning(false);
 }
 function save(e){e.preventDefault();
  const legs=form.legs.filter(l=>l.fixture||l.market||l.selection).map(l=>({...l}));
  const games=new Set(legs.map(l=>l.fixture).filter(Boolean)).size||Math.max(1,Number(form.games||1));
  const selections=legs.length||Math.max(1,Number(form.selections||1));
  const bet={...form,games,selections,stake:safeNum(form.stake),odds:safeNum(form.odds,1),return:safeNum(form.return),legs};
  onAdd(bet);
 }
 const addLeg=()=>setForm(f=>({...f,legs:[...f.legs,{fixture:"",market:"",selection:"",odds:""}]}));
 const editLeg=(i,k,v)=>setForm(f=>({...f,legs:f.legs.map((l,n)=>n===i?{...l,[k]:v}:l)}));
 return <div className="content addgrid"><section className="card scanner"><div className="cardhead"><div><b>Scan your bet slip</b><span>Real image upload + local OCR</span></div><span className="secure">● ON DEVICE</span></div>
  <input ref={input} type="file" accept="image/*" hidden onChange={e=>scan(e.target.files?.[0])}/>
  <div className="drop" onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();scan(e.dataTransfer.files?.[0])}}>{preview?<img src={preview} />:<><div className="uploadicon">↑</div><b>Drop a screenshot here</b><span>or click to choose an image</span><small>PNG · JPG · WEBP</small></>}</div>
  {scanning&&<div className="progress"><div style={{width:`${progress}%`}}></div><span>{progress}% scanning</span></div>}
  {status&&<div className="scanstatus">{status}</div>}
  {raw&&<details><summary>OCR text</summary><pre>{raw}</pre></details>}
 </section>
 <form className="card form" onSubmit={save}><div className="cardhead"><div><b>Review & save</b><span>Everything is editable</span></div></div>
  <div className="fields"><label>Bookmaker<input value={form.bookmaker} onChange={e=>set("bookmaker",e.target.value)} placeholder="e.g. Bet365"/></label><label>Sport<input value={form.sport} onChange={e=>set("sport",e.target.value)} /></label><label>Date<input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></label><label>Stake (£)<input type="number" step="0.01" value={form.stake} onChange={e=>set("stake",e.target.value)} /></label><label>Total odds<input type="number" step="0.01" value={form.odds} onChange={e=>set("odds",e.target.value)} /></label><label>Return (£)<input type="number" step="0.01" value={form.return} onChange={e=>set("return",e.target.value)} /></label><label>Result<select value={form.result} onChange={e=>set("result",e.target.value)}><option>Pending</option><option>Won</option><option>Lost</option><option>Void</option></select></label><label>Note<input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Optional"/></label></div>
  <div className="legshead"><div><b>Builder legs</b><span>{form.legs.length} detected / added</span></div><button type="button" className="ghost" onClick={addLeg}>＋ Add leg</button></div>
  {form.legs.length===0&&<div className="legempty">No legs detected yet. Add them manually or upload a clearer screenshot.</div>}
  {form.legs.map((l,i)=><div className="leg" key={i}><div className="legnum">{i+1}</div><input value={l.fixture} onChange={e=>editLeg(i,"fixture",e.target.value)} placeholder="Game / fixture"/><input value={l.market} onChange={e=>editLeg(i,"market",e.target.value)} placeholder="Market"/><input value={l.selection} onChange={e=>editLeg(i,"selection",e.target.value)} placeholder="Selection"/><input value={l.odds||""} onChange={e=>editLeg(i,"odds",e.target.value)} placeholder="Odds"/></div>)}
  <button className="primary save" type="submit">Save bet builder →</button>
 </form></div>
}

function parseSlip(text){
 const lines=text.split(/\r?\n/).map(s=>s.replace(/\s+/g," ").trim()).filter(Boolean);
 const all=text.replace(/\s+/g," ");
 const known=["Bet365","Sky Bet","William Hill","Ladbrokes","Coral","Paddy Power","Betfair","Unibet","888sport","Betway","BoyleSports","Virgin Bet","talkSPORT BET","Betfred","Dafabet","Spreadex","Parimatch"];
 const bookmaker=known.find(x=>new RegExp(x.replace(" ","\\s*"),"i").test(text))||"";
 const moneyMatches=[...all.matchAll(/(?:stake|bet amount|amount)\s*[:\-]?\s*[£€$]?\s*(\d+(?:\.\d{1,2})?)/ig)];
 const returnMatches=[...all.matchAll(/(?:potential return|possible return|payout|returns?|winnings?)\s*[:\-]?\s*[£€$]?\s*(\d+(?:\.\d{1,2})?)/ig)];
 const oddsMatches=[...all.matchAll(/(?:total\s*)?(?:odds|price)\s*[:\-]?\s*(\d+(?:\.\d+)?)/ig)];
 let legs=[], current=null;
 const fixtureRe=/\b(.{2,45}?)\s+(?:v|vs|versus|@)\s+(.{2,45})\b/i;
 const skip=/^(stake|bet amount|potential return|possible return|payout|total odds|odds|cash out|bet slip|single|acca|accumulator|bet builder|estimated|return)$/i;
 for(let line of lines){
   if(skip.test(line)) continue;
   const fm=line.match(fixtureRe);
   if(fm){current={fixture:`${fm[1].trim()} v ${fm[2].trim()}`,market:"",selection:"",odds:""};legs.push(current);continue}
   const om=line.match(/\b([1-9]\d?(?:\.\d{1,2})?)\b\s*$/);
   const nums=[...line.matchAll(/\b\d+(?:\.\d+)?\b/g)].map(m=>m[0]);
   if(current){
     if(!current.market && /(\+?\d+(\.\d+)?|over|under|both teams|draw|win|to score|shots|corners|cards|goals|result|handicap|double chance)/i.test(line)){
       if(!current.selection){current.selection=line}else current.market=line;
     } else if(!current.selection && !/^\d/.test(line)) current.selection=line;
     if(om) current.odds=om[1];
   } else if(fixtureRe.test(line)===false && lines.indexOf(line)<8 && !/^\d/.test(line) && line.length<80){}
 }
 if(!legs.length){
   const likely=lines.filter(x=>x.length>3&&!skip.test(x)&&!known.some(k=>x.toLowerCase()===k.toLowerCase())&&x.length<100);
   for(let i=0;i<likely.length;i+=3){legs.push({fixture:"",market:likely[i]||"",selection:likely[i+1]||"",odds:likely[i+2]?.match(/\b\d+(?:\.\d+)?\b$/)?.[0]||""})}
 }
 return {bookmaker,sport:/tennis/i.test(text)?"Tennis":/basketball/i.test(text)?"Basketball":/racing|horse/i.test(text)?"Horse Racing":"Football",
  stake:moneyMatches[0]?.[1]||"",return:returnMatches[0]?.[1]||"",odds:oddsMatches[0]?.[1]||"",legs:legs.slice(0,30),
  result:/won|winning|settled/i.test(text)?"Won":/lost|losing/i.test(text)?"Lost":"Pending"};
}

function History({bets,updateResult,deleteBet}){
 const [q,setQ]=useState(""),[filter,setFilter]=useState("All");
 const rows=bets.filter(b=>(filter==="All"||b.result===filter)&&`${b.bookmaker} ${b.sport} ${b.note}`.toLowerCase().includes(q.toLowerCase()));
 return <div className="content"><section className="card chartcard"><div className="cardhead"><div><b>Bankroll performance</b><span>Cumulative profit from settled builders</span></div></div><ProfitChart bets={bets}/></section>
 <section className="card"><div className="toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="⌕  Search bets…"/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Won</option><option>Lost</option><option>Pending</option><option>Void</option></select></div>
 <div className="table"><div className="tr th"><span>Date</span><span>Builder</span><span>Legs</span><span>Odds</span><span>Stake</span><span>Result</span><span>P/L</span><span></span></div>{rows.map(b=><div className="tr" key={b.id}><span>{b.date}</span><span><b>{b.bookmaker||"Unknown bookmaker"}</b><small>{b.sport} · {b.games} game{b.games==1?"":"s"}</small></span><span>{b.selections}</span><span>{Number(b.odds).toFixed(2)}</span><span>{money(b.stake)}</span><span><select className={`status ${b.result.toLowerCase()}`} value={b.result} onChange={e=>updateResult(b.id,e.target.value)}><option>Pending</option><option>Won</option><option>Lost</option><option>Void</option></select></span><span className={b.result==="Won"?"pos":b.result==="Lost"?"neg":"pend"}>{b.result==="Won"?"+":b.result==="Lost"?"−":"…"}{money(Math.abs(Number(b.return||0)-Number(b.stake||0)))}</span><button className="trash" onClick={()=>deleteBet(b.id)}>×</button></div>)}</div>{!rows.length&&<div className="noresults">No bets match your filters.</div>}</section></div>
}

function Analytics({bets}){
 const byBook=Object.entries(bets.reduce((a,b)=>{a[b.bookmaker||"Unknown"]??={n:0,p:0,s:0};a[b.bookmaker||"Unknown"].n++;a[b.bookmaker||"Unknown"].p+=Number(b.return||0)-Number(b.stake||0);a[b.bookmaker||"Unknown"].s+=Number(b.stake||0);return a},{}));
 const bySize=Object.entries(bets.reduce((a,b)=>{const k=`${b.games} game${b.games==1?"":"s"}`;a[k]??={n:0,p:0};a[k].n++;a[k].p+=Number(b.return||0)-Number(b.stake||0);return a},{}));
 return <div className="content analytics"><section className="card"><div className="cardhead"><div><b>By bookmaker</b><span>Performance breakdown</span></div></div>{byBook.map(([k,v])=><div className="barrow" key={k}><div><b>{k}</b><span>{v.n} bet{v.n==1?"":"s"} · {money(v.p)} P/L</span></div><div className="bar"><i style={{width:`${Math.min(100,Math.max(6,50+v.p/2))}%`}}/></div>)}</section><section className="card"><div className="cardhead"><div><b>By builder size</b><span>Games per builder</span></div></div>{bySize.map(([k,v])=><div className="sizecard" key={k}><strong>{k}</strong><span>{v.n} bets</span><b className={v.p>=0?"pos":"neg"}>{v.p>=0?"+":""}{money(v.p)}</b></div>)}</section></div>
}

function Settings({bets,setBets}){
 const exportData=()=>{const blob=new Blob([JSON.stringify(bets,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="bet-builder-tracker-backup.json";a.click()};
 return <div className="content"><section className="card settings"><div className="cardhead"><div><b>Tracker settings</b><span>Simple, private and GitHub-deployable</span></div></div><div className="settingrow"><div><b>Local storage</b><span>Your saved bets persist in this browser.</span></div><button className="ghost" onClick={exportData}>Export backup</button></div><div className="settingrow"><div><b>Reset sample data</b><span>Replace current data with the starter examples.</span></div><button className="danger" onClick={()=>{if(confirm("Replace your current bets with starter data?"))setBets(seed)}}>Reset</button></div><div className="privacy"><b>Scanner privacy</b><p>Images are processed in your browser with OCR. The screenshot is not uploaded to a server by this app.</p></div></section></div>
}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
createRoot(document.getElementById("root")).render(<App/>);
