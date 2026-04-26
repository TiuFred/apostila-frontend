import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const API      = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SUPA_URL = "https://gtjcdznwsrvbkxgeuvdd.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amNkem53c3J2Ymt4Z2V1dmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTU5ODcsImV4cCI6MjA5MjUzMTk4N30.IGBSgdUMmOw9_hCcirfK3-Z0p6EliWxACnPP5Dk3uvc";
const supabase = createClient(SUPA_URL, SUPA_KEY);

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback(v => {
    setVal(prev => { const next = typeof v === "function" ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next; });
  }, [key]);
  return [val, set];
}

const FIXED_SUBJECTS = [
  {name:"Programação", color:"#7C6AF7"},
  {name:"UX",          color:"#F76A6A"},
  {name:"Orientação",  color:"#22C9A0"},
  {name:"Liderança",   color:"#F7A83E"},
  {name:"Negócios",    color:"#4FB8F7"},
  {name:"Matemática",  color:"#D46AF7"},
];

const WEEKS = Array.from({length:10},(_,i)=>`Semana ${String(i+1).padStart(2,"0")}`);
const MODES = [
  {id:"apostila",    label:"Apostila Completa",    icon:"📋", desc:"Resumo organizado e didático"},
  {id:"mapa",        label:"Mapa Mental",           icon:"🗺️", desc:"Estrutura visual de conceitos"},
  {id:"objetiva",    label:"Simulado Objetiva",     icon:"🎯", desc:"12 questões com somatório"},
  {id:"dissertativa",label:"Simulado Dissertativo", icon:"✍️", desc:"6 questões com critérios de correção"},
  {id:"flashcards",  label:"Flashcards",            icon:"🃏", desc:"20 cards de revisão ativa"},
  {id:"desespero",   label:"Desespero para Prova",  icon:"🚨", desc:"Revisão intensiva de última hora"},
];
const EVENT_TYPES = [
  {id:"prova",        label:"Prova",        color:"#F76A6A", icon:"📝"},
  {id:"trabalho",     label:"Trabalho",     color:"#F7A83E", icon:"📄"},
  {id:"apresentacao", label:"Apresentação", color:"#7C6AF7", icon:"🎤"},
  {id:"evento",       label:"Evento",       color:"#22C9A0", icon:"🎓"},
];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function typeIcon(t){return{artigo:"📄",vídeo:"🎥",livro:"📘",aula:"🎓",anotação:"📝",pdf:"📑"}[t]||"📎";}
function nameFromEmail(email,meta){if(meta?.name)return meta.name;return email?.split("@")[0]||"Usuário";}

function Overlay({onClick}){return<div onClick={onClick} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:900}}/>;}

function Modal({open,onClose,children,wide}){
  if(!open)return null;
  return<><Overlay onClick={onClose}/>
    <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,background:"#16162a",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:16,padding:28,width:wide?"700px":"480px",maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",fontFamily:"'DM Sans',sans-serif",color:"#e8e6ff",boxSizing:"border-box"}}>
      {children}
    </div>
  </>;
}

function Tag({color,children}){return<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:color+"22",color,fontWeight:500}}>{children}</span>;}

function Btn({onClick,color="#7C6AF7",outline,children,disabled,small,full}){
  return<button style={{border:outline?`0.5px solid ${color}`:"none",background:outline?"transparent":disabled?"rgba(255,255,255,0.08)":color,color:disabled?"rgba(255,255,255,0.3)":outline?color:"#fff",padding:small?"5px 12px":"9px 18px",borderRadius:8,fontSize:small?12:13,cursor:disabled?"default":"pointer",fontWeight:600,width:full?"100%":undefined,opacity:disabled?0.5:1}} onClick={disabled?undefined:onClick}>{children}</button>;
}

function Spinner({size=18,color="#7C6AF7"}){return<span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}33`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle"}}/>;}

function Toast({msg,onClose}){
  useEffect(()=>{if(msg){const t=setTimeout(onClose,3500);return()=>clearTimeout(t);}},[msg]);
  if(!msg)return null;
  return<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#22C9A0",color:"#fff",padding:"10px 20px",borderRadius:10,zIndex:9999,fontWeight:600,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>✓ {msg}</div>;
}

function Label({text,required}){
  return<div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:6,letterSpacing:"0.04em",textTransform:"uppercase"}}>{text}{required&&<span style={{color:"#7C6AF7",marginLeft:3}}>*</span>}</div>;
}

const IS={width:"100%",padding:"9px 12px",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:13.5,boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};

function ConfirmModal({open,onClose,onConfirm,title,message,danger}){
  return<Modal open={open} onClose={onClose}>
    <h3 style={{margin:"0 0 10px",fontSize:16,fontWeight:700,color:danger?"#F76A6A":"#e8e6ff"}}>{title}</h3>
    <p style={{fontSize:13.5,color:"rgba(255,255,255,0.55)",lineHeight:1.6,marginBottom:24}}>{message}</p>
    <div style={{display:"flex",gap:8}}>
      <Btn onClick={onClose} outline color="rgba(255,255,255,0.25)" full>Cancelar</Btn>
      <Btn onClick={()=>{onConfirm();onClose();}} color={danger?"#F76A6A":"#7C6AF7"} full>{danger?"Sim, deletar":"Confirmar"}</Btn>
    </div>
  </Modal>;
}

function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [name,setName]=useState("");
  const [loading,setLoading]=useState(false);const [err,setErr]=useState("");const [msg,setMsg]=useState("");
  const submit=async()=>{
    if(!email.trim()||!pass.trim())return;
    setLoading(true);setErr("");setMsg("");
    try{
      if(mode==="login"){
        const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error)throw error;onAuth(data.user);
      }else{
        const{data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name:name.trim()||email.split("@")[0]}}});
        if(error)throw error;
        if(data.user&&!data.session)setMsg("Verifique seu e-mail para confirmar o cadastro!");
        else if(data.user)onAuth(data.user);
      }
    }catch(e){
      const msgs={"Invalid login credentials":"E-mail ou senha incorretos.","User already registered":"E-mail já cadastrado. Faça login.","Password should be at least 6 characters":"Senha precisa ter pelo menos 6 caracteres."};
      setErr(msgs[e.message]||e.message);
    }
    setLoading(false);
  };
  return<div style={{display:"flex",height:"100vh",background:"#0e0e1a",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{width:400,padding:36,background:"#16162a",borderRadius:20,border:"0.5px solid rgba(255,255,255,0.08)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:26,letterSpacing:-0.5,marginBottom:6}}><span style={{color:"#7C6AF7"}}>Apostila</span><span style={{color:"rgba(255,255,255,0.85)"}}>.ai</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Repositório compartilhado da turma</div>
      </div>
      <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:24,border:"0.5px solid rgba(255,255,255,0.08)"}}>
        {["login","signup"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("");setMsg("");}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:mode===m?"#7C6AF7":"transparent",color:mode===m?"#fff":"rgba(255,255,255,0.4)",transition:"all 0.2s"}}>{m==="login"?"Entrar":"Criar conta"}</button>)}
      </div>
      {mode==="signup"&&<div style={{marginBottom:14}}><Label text="Seu nome"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: João Silva" style={IS}/></div>}
      <div style={{marginBottom:14}}><Label text="E-mail"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" type="email" onKeyDown={e=>e.key==="Enter"&&submit()} style={IS}/></div>
      <div style={{marginBottom:20}}><Label text="Senha"/><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&submit()} style={IS}/>
        {mode==="signup"&&<div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:5}}>Mínimo 6 caracteres</div>}
      </div>
      {err&&<div style={{fontSize:12,color:"#F76A6A",marginBottom:14,padding:"8px 12px",background:"rgba(247,106,106,0.1)",borderRadius:8}}>{err}</div>}
      {msg&&<div style={{fontSize:12,color:"#22C9A0",marginBottom:14,padding:"8px 12px",background:"rgba(34,201,160,0.1)",borderRadius:8}}>{msg}</div>}
      <Btn onClick={submit} disabled={loading||!email.trim()||!pass.trim()} full>{loading?<><Spinner size={14} color="#fff"/> Aguarde...</>:mode==="login"?"Entrar →":"Criar conta →"}</Btn>
      <div style={{marginTop:20,padding:"14px",background:"rgba(124,106,247,0.08)",borderRadius:10,border:"0.5px solid rgba(124,106,247,0.2)"}}>
        <div style={{fontSize:11,color:"rgba(124,106,247,0.8)",fontWeight:600,marginBottom:4}}>💡 Repositório compartilhado</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>Todos com conta neste app compartilham as mesmas matérias, autoestudos e calendário.</div>
      </div>
    </div>
  </div>;
}

// ── AddItemModal ───────────────────────────────────────────────────────────────
function AddItemModal({open,onClose,onAdd,subjects}){
  const [title,setTitle]=useState("");
  const [url,setUrl]=useState("");
  const [notes,setNotes]=useState("");
  const [week,setWeek]=useState("");
  const [date,setDate]=useState("");
  const [type,setType]=useState("artigo");
  const [subjectId,setSubjectId]=useState(subjects[0]?.id||"");
  const [scraping,setScraping]=useState(false);
  const [pdfFile,setPdfFile]=useState(null);
  const [pdfBusy,setPdfBusy]=useState(false);
  const [linkOk,setLinkOk]=useState(null);
  const [pdfOk,setPdfOk]=useState(null);
  const [content,setContent]=useState("");
  const [driveOk,setDriveOk]=useState(null);
  const [pdfB64,setPdfB64]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{if(open&&subjects.length>0)setSubjectId(s=>s||subjects[0].id);},[open,subjects]);

  const reset=()=>{setTitle("");setUrl("");setNotes("");setWeek("");setDate("");setType("artigo");setPdfFile(null);setLinkOk(null);setPdfOk(null);setContent("");setDriveOk(null);setPdfB64("");};

  const scrape=async()=>{
    if(!url.trim())return;
    setScraping(true);setLinkOk(null);
    try{
      const r=await fetch(`${API}/scrape`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
      const d=await r.json();
      setContent(d.content||"");
      setLinkOk(true);
    }catch{setLinkOk(false);}
    setScraping(false);
  };

  const uploadPdfToDrive=async(b64,fileTitle,subId,wk)=>{
    const subjectName=subjects.find(s=>s.id===subId)?.name||"";
    if(!subjectName||!wk) return;
    try{
      await fetch(`${API}/upload-pdf-drive`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({data:b64,title:fileTitle,subject:subjectName,week:wk})
      });
      setDriveOk(true);
    }catch{ setDriveOk(false); }
  };

  const pickPdf=()=>fileRef.current?.click();
  const handlePdf=async(file)=>{
    if(!file||file.type!=="application/pdf")return;
    setPdfFile(file);
    setPdfBusy(true);setPdfOk(null);setDriveOk(null);
    try{
      const b64=await new Promise((res,rej)=>{const rd=new FileReader();rd.onload=()=>res(rd.result.split(",")[1]);rd.onerror=rej;rd.readAsDataURL(file);});
      setPdfB64(b64);
      const r=await fetch(`${API}/extract-pdf-b64`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:b64})});
      const d=await r.json();
      if(d.content){
        setContent(d.content);
        setPdfOk(true);
        // Auto-upload to Drive if week and subject already selected
        const currentTitle=title||file.name.replace(/\.pdf$/i,"");
        if(week&&subjectId) await uploadPdfToDrive(b64,currentTitle,subjectId,week);
      }else setPdfOk(false);
    }catch{setPdfOk(false);}
    setPdfBusy(false);
  };

  // Upload to drive when week changes after PDF is already loaded
  useEffect(()=>{
    if(pdfOk&&pdfB64&&week&&subjectId&&driveOk===null){
      uploadPdfToDrive(pdfB64,title||pdfFile?.name||"autoestudo",subjectId,week);
    }
  },[week,subjectId]);

  const submit=()=>{
    if(!title.trim()||!subjectId||!week)return;
    // If PDF loaded but drive not yet uploaded (week was selected after PDF), upload now
    if(pdfOk&&pdfB64&&driveOk===null){
      uploadPdfToDrive(pdfB64,title,subjectId,week);
    }
    onAdd({title:title.trim(),url:url.trim(),notes:notes.trim(),week,date,type,scraped_content:content,subject_id:subjectId});
    reset();onClose();
  };

  return<Modal open={open} onClose={()=>{reset();onClose();}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Adicionar autoestudo</h3>
      <button onClick={()=>{reset();onClose();}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:18}}>✕</button>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Matéria" required/>
      <select value={subjectId} onChange={e=>setSubjectId(e.target.value)} style={{...IS,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32}}>
        {subjects.map(s=><option key={s.id} value={s.id} style={{background:"#1a1a2e"}}>{s.name}</option>)}
      </select>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Nome da atividade" required/>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Aula 3 — Introdução ao React" autoFocus style={IS}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      <div>
        <Label text="Semana" required/>
        <select value={week} onChange={e=>setWeek(e.target.value)} style={{...IS,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32}}>
          <option value="">— Selecione —</option>
          {WEEKS.map(w=><option key={w} value={w} style={{background:"#1a1a2e"}}>{w}</option>)}
        </select>
      </div>
      <div>
        <Label text="Data"/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...IS,colorScheme:"dark"}}/>
      </div>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Conteúdo"/>
      <div style={{display:"flex",gap:8,marginBottom:6}}>
        <input value={url} onChange={e=>{setUrl(e.target.value);setLinkOk(null);}} placeholder="Inserir link (https://...)" onKeyDown={e=>e.key==="Enter"&&scrape()} style={{...IS,flex:1}}/>
        <button onClick={scrape} disabled={!url.trim()||scraping} style={{padding:"0 16px",borderRadius:8,border:"none",whiteSpace:"nowrap",flexShrink:0,background:!url.trim()||scraping?"rgba(34,201,160,0.2)":"#22C9A0",color:"#fff",fontSize:12,fontWeight:700,cursor:!url.trim()||scraping?"default":"pointer"}}>
          {scraping?<Spinner size={13} color="#fff"/>:"📡 Ler link"}
        </button>
      </div>
      {linkOk===true&&<div style={{fontSize:11,color:"#22C9A0",marginBottom:8}}>✓ {content.length} caracteres extraídos — conteúdo pronto para a IA</div>}
      {linkOk===false&&<div style={{fontSize:11,color:"#F76A6A",marginBottom:8}}>Não foi possível ler o link.</div>}

      <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0"}}>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontWeight:700,letterSpacing:"0.08em"}}>OU</span>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
      </div>

      <input ref={fileRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handlePdf(e.target.files[0]);}}/>
      {!pdfFile?(
        <button onClick={pickPdf} style={{display:"block",width:"100%",padding:"12px 0",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,border:"1.5px dashed rgba(124,106,247,0.45)",background:"rgba(124,106,247,0.07)",color:"#c4bbff",fontFamily:"'DM Sans',sans-serif"}}>📄 Anexar PDF</button>
      ):(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,background:"rgba(124,106,247,0.1)",border:"0.5px solid rgba(124,106,247,0.35)"}}>
          {pdfBusy?<Spinner size={18} color="#7C6AF7"/>:<span style={{fontSize:22}}>📑</span>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#c4bbff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pdfFile.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>
              {pdfBusy?"Extraindo texto...":
               pdfOk===true?`✓ ${content.length} caracteres${driveOk===true?" · 📁 Salvo no Drive":driveOk===false?" · ⚠ Drive indisponível":(week&&subjectId)?" · Enviando ao Drive...":""}`:
               pdfOk===false?"Erro — adicione notas manuais":""}
            </div>
          </div>
          <button onClick={pickPdf} style={{background:"none",border:"none",fontSize:11,color:"rgba(255,255,255,0.35)",cursor:"pointer",padding:4}}>trocar</button>
          <button onClick={()=>{setPdfFile(null);setPdfOk(null);setContent("");}} style={{background:"none",border:"none",fontSize:15,color:"rgba(247,106,106,0.5)",cursor:"pointer",padding:4}}>✕</button>
        </div>
      )}
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Notas para a IA"/>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)}
        placeholder="Instrução para a IA ao gerar material (ex: foque nas páginas 10-25, ignore a parte de exercícios, priorize os conceitos de X...)"
        rows={3} style={{...IS,resize:"vertical",lineHeight:1.6}}/>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:4}}>A IA vai seguir essas instruções ao criar apostilas e simulados deste autoestudo.</div>
    </div>

    <div style={{marginBottom:18}}>
      <Label text="Tipo"/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["artigo","vídeo","livro","aula","anotação","pdf"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`0.5px solid ${type===t?"rgba(124,106,247,0.5)":"rgba(255,255,255,0.12)"}`,background:type===t?"rgba(124,106,247,0.2)":"transparent",color:type===t?"#c4bbff":"rgba(255,255,255,0.5)",fontWeight:type===t?600:400}}>{type===t?"✓ ":""}{t}</button>
        ))}
      </div>
    </div>

    {!week&&<div style={{fontSize:11,color:"#F7A83E",marginBottom:10}}>⚠ Selecione uma semana para continuar</div>}

    <div style={{display:"flex",gap:8}}>
      <Btn onClick={()=>{reset();onClose();}} outline color="rgba(255,255,255,0.25)" full>Cancelar</Btn>
      <Btn onClick={submit} disabled={!title.trim()||!subjectId||!week} full>Adicionar autoestudo</Btn>
    </div>
  </Modal>;
}

// ── GenerateModal ──────────────────────────────────────────────────────────────
function GenerateModal({open,onClose,subject,items,onSave}){
  const [mode,setMode]=useState("apostila");
  const [selectedWeeks,setSelectedWeeks]=useState([]);
  const [selected,setSelected]=useState([]);
  const [phase,setPhase]=useState("config");
  const [result,setResult]=useState(null);
  const [pdfLoading,setPdfLoading]=useState(false);
  const [err,setErr]=useState("");

  const availableWeeks=[...new Set(items.map(i=>i.week).filter(Boolean))].sort();
  const itemsInWeeks=selectedWeeks.length>0?items.filter(i=>selectedWeeks.includes(i.week)):[];

  useEffect(()=>{
    if(open){setSelectedWeeks([]);setSelected([]);setResult(null);setPhase("config");setErr("");}
  },[open]);

  useEffect(()=>{
    setSelected(itemsInWeeks.map(i=>i.id));
  },[selectedWeeks.join(",")]);

  const toggleWeek=w=>setSelectedWeeks(s=>s.includes(w)?s.filter(x=>x!==w):[...s,w]);
  const toggleItem=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const selItems=items.filter(i=>selected.includes(i.id));

  const generate=async()=>{
    if(!selItems.length||!selectedWeeks.length)return;
    setPhase("generating");setErr("");
    try{
      const r=await fetch(`${API}/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,subject:subject.name,subject_color:subject.color,items:selItems})});
      if(!r.ok)throw new Error(await r.text());
      const d=await r.json();setResult(d);setPhase("done");
    }catch(e){setErr("Erro ao gerar: "+e.message);setPhase("config");}
  };

  const downloadPDF=async()=>{
    if(!result)return;setPdfLoading(true);
    try{
      const r=await fetch(`${API}/pdf`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:result.mode,subject:subject.name,subject_color:subject.color,data:result.data})});
      if(!r.ok)throw new Error(await r.text());
      const blob=await r.blob();const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`${subject.name.replace(/\s+/g,"_")}_${result.mode}.pdf`;a.click();
    }catch(e){alert("Erro ao gerar PDF: "+e.message);}
    setPdfLoading(false);
  };

  const [driveLoading, setDriveLoading] = useState(false);
  const [driveLink,    setDriveLink]    = useState("");

  const uploadToDrive = async () => {
    if (!result) return;
    setDriveLoading(true); setDriveLink("");
    try {
      const r = await fetch(`${API}/upload-drive`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          mode: result.mode,
          subject: subject.name,
          subject_color: subject.color,
          weeks: selectedWeeks,
          data: result.data
        })
      });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setDriveLink(d.link);
    } catch(e) { alert("Erro ao enviar para o Drive: " + e.message); }
    setDriveLoading(false);
  };

  const save=()=>{
    if(!result)return;
    onSave({mode:result.mode,title:`${MODES.find(m=>m.id===result.mode)?.label} — ${subject.name} (${selectedWeeks.join(", ")})`,data:result.data});
    onClose();
  };

  return<Modal open={open} onClose={onClose} wide={phase==="done"}>
    {phase==="config"&&<>
      <h3 style={{margin:"0 0 4px",fontSize:16,fontWeight:700}}>Gerar material — {subject.name}</h3>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:16}}>Selecione as semanas e o tipo de material</p>

      {/* Mode */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {MODES.map(m=><div key={m.id} onClick={()=>setMode(m.id)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",border:`0.5px solid ${mode===m.id?subject.color:"rgba(255,255,255,0.08)"}`,background:mode===m.id?subject.color+"18":"transparent"}}>
          <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
          <div style={{fontSize:12,fontWeight:600,color:mode===m.id?"#fff":"rgba(255,255,255,0.75)"}}>{m.label}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{m.desc}</div>
        </div>)}
      </div>

      {/* Week selector — REQUIRED */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:8}}>
          Semanas <span style={{color:"#F7A83E",fontSize:10}}>* selecione pelo menos uma</span>
        </div>
        {availableWeeks.length===0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.25)",padding:"10px 0"}}>Nenhum autoestudo com semana cadastrada nesta matéria.</div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {availableWeeks.map(w=>{
            const count=items.filter(i=>i.week===w).length;
            const sel=selectedWeeks.includes(w);
            return<button key={w} onClick={()=>toggleWeek(w)} style={{padding:"6px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`0.5px solid ${sel?subject.color:"rgba(255,255,255,0.12)"}`,background:sel?subject.color+"22":"transparent",color:sel?subject.color:"rgba(255,255,255,0.5)",fontWeight:sel?600:400,display:"flex",alignItems:"center",gap:5}}>
              {sel&&<span style={{fontSize:10}}>✓</span>}{w} <span style={{fontSize:10,opacity:0.6}}>({count})</span>
            </button>;
          })}
        </div>
        {selectedWeeks.length>0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:8}}>
          <button onClick={()=>setSelectedWeeks(availableWeeks)} style={{background:"none",border:"none",color:subject.color,fontSize:11,cursor:"pointer",marginRight:8}}>Selecionar todas</button>
          <button onClick={()=>setSelectedWeeks([])} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:11,cursor:"pointer"}}>Limpar</button>
        </div>}
      </div>

      {/* Items in selected weeks */}
      {selectedWeeks.length>0&&<div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>
            Autoestudos das semanas selecionadas <span style={{color:"rgba(255,255,255,0.25)"}}>({selItems.length} selecionados)</span>
          </div>
          <button onClick={()=>setSelected(selected.length===itemsInWeeks.length?[]:itemsInWeeks.map(i=>i.id))} style={{fontSize:11,color:subject.color,background:"none",border:"none",cursor:"pointer"}}>
            {selected.length===itemsInWeeks.length?"Desmarcar":"Selecionar todos"}
          </button>
        </div>
        {itemsInWeeks.length===0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.25)",padding:8}}>Nenhum autoestudo encontrado.</div>}
        {itemsInWeeks.map(item=><div key={item.id} onClick={()=>toggleItem(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,cursor:"pointer",marginBottom:3,background:selected.includes(item.id)?"rgba(255,255,255,0.04)":"transparent"}}>
          <div style={{width:16,height:16,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",border:`1.5px solid ${selected.includes(item.id)?subject.color:"rgba(255,255,255,0.2)"}`,background:selected.includes(item.id)?subject.color:"transparent"}}>{selected.includes(item.id)&&"✓"}</div>
          <span style={{fontSize:13,color:"rgba(255,255,255,0.8)",flex:1}}>{item.title}</span>
          <Tag color="#F7A83E">{item.week}</Tag>
          {item.scraped_content&&<span style={{fontSize:10,color:"#22C9A0"}}>📡</span>}
          {item.notes&&<span style={{fontSize:10,color:"#F7A83E"}} title={item.notes}>📝</span>}
        </div>)}
      </div>}

      {err&&<div style={{color:"#F76A6A",fontSize:12,marginBottom:10}}>{err}</div>}
      {!selectedWeeks.length&&<div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:10,textAlign:"center"}}>← Selecione pelo menos uma semana para continuar</div>}
      <Btn onClick={generate} disabled={!selItems.length||!selectedWeeks.length} full color={subject.color}>✨ Gerar com IA</Btn>
    </>}

    {phase==="generating"&&<div style={{textAlign:"center",padding:"50px 0"}}>
      <div style={{marginBottom:16}}><Spinner size={40} color={subject.color}/></div>
      <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginBottom:4}}>Gerando seu material com IA...</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Lendo os conteúdos dos autoestudos...</div>
    </div>}

    {phase==="done"&&result&&<>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:700}}>{MODES.find(m=>m.id===result.mode)?.icon} {MODES.find(m=>m.id===result.mode)?.label}</h3>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{subject.name} · {selectedWeeks.join(", ")}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <Btn onClick={save} color="#22C9A0" small>💾 Salvar</Btn>
          <Btn onClick={downloadPDF} disabled={pdfLoading} color={subject.color} small>{pdfLoading?<><Spinner size={12} color="#fff"/> Gerando...</>:"⬇ Baixar PDF"}</Btn>
          <Btn onClick={uploadToDrive} disabled={driveLoading} color="#4FB8F7" small>{driveLoading?<><Spinner size={12} color="#fff"/> Enviando...</>:"📁 Enviar para Drive"}</Btn>
          <Btn onClick={()=>setPhase("config")} outline color="rgba(255,255,255,0.3)" small>← Voltar</Btn>
        </div>
      </div>
      {driveLink&&<div style={{marginBottom:14,padding:"10px 14px",background:"rgba(75,184,247,0.1)",border:"0.5px solid rgba(75,184,247,0.3)",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}>✅</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:"#4FB8F7",marginBottom:2}}>Enviado para o Google Drive!</div>
          <a href={driveLink} target="_blank" rel="noreferrer" style={{fontSize:11,color:"rgba(75,184,247,0.7)"}}>Abrir no Drive &rarr;</a>
        </div>
      </div>}
      <ResultPreview mode={result.mode} data={result.data} color={subject.color}/>
    </>}
  </Modal>;
}

function ResultPreview({mode,data,color}){
  if(mode==="apostila")return<div style={{fontSize:12.5,lineHeight:1.7,color:"rgba(255,255,255,0.8)"}}>
    <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:8}}>{data.titulo}</div>
    <p style={{marginBottom:10,color:"rgba(255,255,255,0.6)"}}>{data.introducao}</p>
    {data.secoes?.map((s,i)=><div key={i} style={{marginBottom:12}}>
      <div style={{fontWeight:600,color,marginBottom:4,fontSize:13}}>{s.titulo}</div>
      <p style={{marginBottom:6,color:"rgba(255,255,255,0.65)"}}>{s.conteudo?.slice(0,200)}...</p>
      {s.topicos?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{s.topicos.map((t,j)=><Tag key={j} color={color}>{t}</Tag>)}</div>}
    </div>)}
    <div style={{borderTop:"0.5px solid rgba(255,255,255,0.1)",paddingTop:10,marginTop:10}}>
      <div style={{fontWeight:600,marginBottom:4,color:"rgba(255,255,255,0.7)"}}>Resumo</div>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>{data.resumo}</p>
    </div>
  </div>;
  if(mode==="mapa")return<div>
    <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:12,textAlign:"center"}}>{data.centro}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {data.ramos?.map((r,i)=>{let rc=color;try{rc=r.cor||color;}catch{}
        return<div key={i} style={{background:rc+"18",border:`0.5px solid ${rc}44`,borderRadius:10,padding:10}}>
          <div style={{fontWeight:600,color:rc,fontSize:12,marginBottom:6}}>{r.titulo}</div>
          {r.subramos?.map((s,j)=><div key={j} style={{marginBottom:4}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:2}}>↳ {s.titulo}</div>
            {s.itens?.map((it,k)=><div key={k} style={{fontSize:10,color:"rgba(255,255,255,0.45)",paddingLeft:10}}>• {it}</div>)}
          </div>)}
        </div>;
      })}
    </div>
  </div>;
  if(mode==="objetiva")return<div>
    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>{data.titulo}</div>
    <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:12}}>Questões primeiro — gabarito ao final</div>
    {data.questoes?.slice(0,3).map((q,i)=><div key={i} style={{marginBottom:10,padding:10,background:"rgba(255,255,255,0.04)",borderRadius:8}}>
      <div style={{fontWeight:600,color,fontSize:12,marginBottom:4}}>Q{q.numero}</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>{q.enunciado}</div>
    </div>)}
    {data.questoes?.length>3&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:12}}>+ {data.questoes.length-3} questões no PDF</div>}
    <div style={{borderTop:"0.5px solid rgba(255,255,255,0.1)",paddingTop:10}}>
      <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:8}}>Gabarito</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{data.questoes?.map((q,i)=><span key={i} style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:color+"22",color}}>{q.numero}. {q.resposta?.toUpperCase()}</span>)}</div>
    </div>
  </div>;
  if(mode==="dissertativa")return<div>
    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>{data.titulo}</div>
    <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:12}}>Questões primeiro — gabarito ao final</div>
    {data.questoes?.map((q,i)=><div key={i} style={{marginBottom:10,padding:10,background:"rgba(255,255,255,0.04)",borderRadius:8}}>
      <div style={{fontWeight:600,color,fontSize:12,marginBottom:4}}>Q{q.numero} <span style={{fontWeight:400,color:"rgba(255,255,255,0.4)",fontSize:10}}>· {q.valor} pts · {q.dificuldade}</span></div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>{q.enunciado}</div>
    </div>)}
    <div style={{borderTop:"0.5px solid rgba(255,255,255,0.1)",paddingTop:10}}>
      <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:8}}>Gabarito + Critérios</div>
      {data.questoes?.map((q,i)=><div key={i} style={{marginBottom:10,padding:"8px 10px",background:"rgba(34,201,160,0.06)",borderRadius:6,borderLeft:"2px solid #22C9A0"}}>
        <div style={{fontSize:11,fontWeight:600,color:"#22C9A0",marginBottom:3}}>Q{q.numero} — {q.valor} pts</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",marginBottom:4}}>{q.gabarito?.slice(0,100)}...</div>
        {q.criterio_correcao_detalhado&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {q.criterio_correcao_detalhado.map((c,j)=><span key={j} style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"rgba(34,201,160,0.15)",color:"#22C9A0"}}>{c.criterio} ({c.pontuacao})</span>)}
        </div>}
      </div>)}
    </div>
  </div>;

  if(mode==="desespero")return<div style={{fontSize:12.5,color:"rgba(255,255,255,0.85)"}}>
    <div style={{fontWeight:700,fontSize:15,color:"#F76A6A",marginBottom:12}}>🚨 {data.titulo}</div>
    {data.principais_conceitos?.length>0&&<div style={{marginBottom:12}}>
      <div style={{fontWeight:600,color,fontSize:12,marginBottom:6}}>📌 Principais conceitos</div>
      {data.principais_conceitos.slice(0,4).map((c,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:3,paddingLeft:8,borderLeft:`2px solid ${color}`}}>{c}</div>)}
      {data.principais_conceitos.length>4&&<div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>+{data.principais_conceitos.length-4} mais no PDF</div>}
    </div>}
    {data.o_que_mais_cai?.length>0&&<div style={{marginBottom:12}}>
      <div style={{fontWeight:600,color:"#F7A83E",fontSize:12,marginBottom:6}}>🎯 O que mais cai</div>
      {data.o_que_mais_cai.slice(0,3).map((c,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:3}}>• {c}</div>)}
    </div>}
    {data.pegadinhas?.length>0&&<div style={{marginBottom:12}}>
      <div style={{fontWeight:600,color:"#F76A6A",fontSize:12,marginBottom:6}}>⚠️ Pegadinhas</div>
      {data.pegadinhas.slice(0,3).map((c,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:3}}>• {c}</div>)}
    </div>}
    {data.checklist_final?.length>0&&<div>
      <div style={{fontWeight:600,color:"#22C9A0",fontSize:12,marginBottom:6}}>✅ Checklist final</div>
      {data.checklist_final.slice(0,4).map((c,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:3}}>☐ {c}</div>)}
    </div>}
    <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:10}}>Conteúdo completo no PDF</div>
  </div>;
  if(mode==="flashcards")return<div>
    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:12}}>{data.titulo}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {data.cards?.slice(0,6).map((c,i)=><div key={i} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${color}33`}}>
        <div style={{background:color+"25",padding:"8px 10px",borderBottom:`0.5px solid ${color}22`}}><div style={{fontSize:10,color,marginBottom:2,fontWeight:600}}>FRENTE</div><div style={{fontSize:11,color:"rgba(255,255,255,0.85)"}}>{c.frente}</div></div>
        <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.03)"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:2}}>VERSO</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>{c.verso?.slice(0,70)}{c.verso?.length>70?"...":""}</div></div>
      </div>)}
    </div>
  </div>;
  return null;
}

function SavedModal({open,onClose,materials,onDelete,subjects}){
  const [pdfLoading,setPdfLoading]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const dlPDF=async(mat,subject)=>{
    setPdfLoading(mat.id);
    try{
      const r=await fetch(`${API}/pdf`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:mat.mode,subject:subject?.name||"",subject_color:subject?.color||"#7C6AF7",data:mat.data})});
      const blob=await r.blob();const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`${mat.title?.replace(/\s+/g,"_")}.pdf`;a.click();
    }catch(e){alert("Erro: "+e.message);}
    setPdfLoading(null);
  };
  return<><Modal open={open} onClose={onClose} wide>
    <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>💾 Materiais salvos</h3>
    {materials.length===0&&<div style={{fontSize:14,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"30px 0"}}>Nenhum material salvo ainda.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {materials.map(mat=>{const subject=subjects.find(s=>mat.title?.includes(s.name));const modeInfo=MODES.find(m=>m.id===mat.mode);
        return<div key={mat.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:20}}>{modeInfo?.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{mat.title}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{mat.created_at?new Date(mat.created_at).toLocaleDateString("pt-BR"):""} · {modeInfo?.label}</div></div>
          <Btn onClick={()=>dlPDF(mat,subject)} disabled={pdfLoading===mat.id} color={subject?.color||"#7C6AF7"} small>{pdfLoading===mat.id?<Spinner size={12} color="#fff"/>:"⬇ PDF"}</Btn>
          <button onClick={()=>setConfirm(mat.id)} style={{background:"none",border:"none",color:"rgba(255,100,100,0.5)",cursor:"pointer",fontSize:14}}>✕</button>
        </div>;
      })}
    </div>
  </Modal>
  <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>onDelete(confirm)} title="Deletar material?" message="Tem certeza? Esta ação não pode ser desfeita." danger/>
  </>;
}

const CALENDAR_SUBJECTS = ["Programação","UX","Orientação","Liderança","Negócios","Matemática","Recuperação","Outro"];

function AddEventModal({open,onClose,onAdd,defaultDate}){
  const [title,setTitle]=useState("");const [date,setDate]=useState(defaultDate||"");
  const [type,setType]=useState("prova");const [subject,setSubject]=useState("");const [time,setTime]=useState("");
  useEffect(()=>{if(open){setDate(defaultDate||"");setTitle("");setTime("");setType("prova");setSubject("");}},[open,defaultDate]);
  const submit=()=>{if(!title.trim()||!date)return;onAdd({title:title.trim(),date,type,subject,time});onClose();};
  const et=EVENT_TYPES.find(e=>e.id===type);
  return<Modal open={open} onClose={onClose}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Novo evento</h3>
      <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:18}}>✕</button>
    </div>
    <div style={{marginBottom:14}}>
      <Label text="Tipo"/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {EVENT_TYPES.map(e=><button key={e.id} onClick={()=>setType(e.id)} style={{padding:"6px 12px",borderRadius:20,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,border:`0.5px solid ${type===e.id?e.color:"rgba(255,255,255,0.12)"}`,background:type===e.id?e.color+"22":"transparent",color:type===e.id?e.color:"rgba(255,255,255,0.5)",fontWeight:type===e.id?600:400}}><span>{e.icon}</span>{e.label}</button>)}
      </div>
    </div>
    <div style={{marginBottom:14}}><Label text="Título" required/><input value={title} onChange={e=>setTitle(e.target.value)} autoFocus placeholder="Ex: Prova de UX" style={IS}/></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      <div><Label text="Data" required/><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...IS,colorScheme:"dark"}}/></div>
      <div><Label text="Horário"/><input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{...IS,colorScheme:"dark"}}/></div>
    </div>
    <div style={{marginBottom:18}}>
      <Label text="Matéria"/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {CALENDAR_SUBJECTS.map(s=>(
          <button key={s} onClick={()=>setSubject(subject===s?"":s)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`0.5px solid ${subject===s?"rgba(124,106,247,0.6)":"rgba(255,255,255,0.1)"}`,background:subject===s?"rgba(124,106,247,0.2)":"transparent",color:subject===s?"#c4bbff":"rgba(255,255,255,0.45)",fontWeight:subject===s?600:400}}>
            {subject===s?"✓ ":""}{s}
          </button>
        ))}
      </div>
    </div>
    <div style={{display:"flex",gap:8}}>
      <Btn onClick={onClose} outline color="rgba(255,255,255,0.25)" full>Cancelar</Btn>
      <Btn onClick={submit} disabled={!title.trim()||!date} color={et?.color||"#7C6AF7"} full>Adicionar evento</Btn>
    </div>
  </Modal>;
}

function CalendarPage({events,onAddEvent,onDeleteEvent}){
  const today=new Date();
  const [curYear,setCurYear]=useState(today.getFullYear());
  const [curMonth,setCurMonth]=useState(today.getMonth());
  const [addModal,setAddModal]=useState(false);
  const [clickedDate,setClickedDate]=useState("");
  const [confirm,setConfirm]=useState(null);
  const [panel,setPanel]=useState("upcoming"); // "upcoming" | "past"

  const prevMonth=()=>{if(curMonth===0){setCurMonth(11);setCurYear(y=>y-1);}else setCurMonth(m=>m-1);};
  const nextMonth=()=>{if(curMonth===11){setCurMonth(0);setCurYear(y=>y+1);}else setCurMonth(m=>m+1);};
  const firstDay=new Date(curYear,curMonth,1).getDay();
  const daysInMonth=new Date(curYear,curMonth+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  while(cells.length%7!==0)cells.push(null);

  const eventsOnDay=day=>{
    if(!day)return[];
    const ds=`${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return events.filter(e=>e.date===ds);
  };
  const isToday=day=>day&&today.getDate()===day&&today.getMonth()===curMonth&&today.getFullYear()===curYear;

  const todayStr=today.toISOString().slice(0,10);
  const upcoming=[...events].filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date));
  const past=[...events].filter(e=>e.date<todayStr).sort((a,b)=>b.date.localeCompare(a.date));

  const EventCard=({ev,isPast})=>{
    const et=EVENT_TYPES.find(e=>e.id===ev.type);
    const d=new Date(ev.date+"T00:00:00");
    const daysLeft=Math.ceil((d-new Date(today.toDateString()))/(1000*60*60*24));
    const daysAgo=Math.abs(daysLeft);
    return<div style={{marginBottom:8,padding:"10px 12px",borderRadius:8,background:isPast?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`0.5px solid ${isPast?"rgba(255,255,255,0.06)":et?.color+"33"}`,position:"relative",opacity:isPast?0.7:1}}>
      <button onClick={()=>setConfirm(ev.id)} style={{position:"absolute",top:6,right:6,background:"none",border:"none",color:"rgba(255,255,255,0.15)",cursor:"pointer",fontSize:11,lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="rgba(247,106,106,0.6)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.15)"}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:13}}>{et?.icon}</span><span style={{fontSize:11,color:et?.color,fontWeight:600}}>{et?.label}</span></div>
      <div style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.85)",marginBottom:3,paddingRight:16}}>{ev.title}</div>
      {ev.subject&&<div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{ev.subject}</div>}
      {ev.created_by_name&&<div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginBottom:3}}>por {ev.created_by_name}</div>}
      <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>
        {d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}{ev.time&&` · ${ev.time}`}
        {isPast
          ? <span style={{marginLeft:6,padding:"1px 6px",borderRadius:10,fontSize:9,fontWeight:700,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.3)"}}>{daysAgo===0?"Hoje":`${daysAgo}d atrás`}</span>
          : <span style={{marginLeft:6,padding:"1px 6px",borderRadius:10,fontSize:9,fontWeight:700,background:daysLeft===0?"rgba(247,106,106,0.2)":daysLeft<=3?"rgba(247,168,62,0.2)":"rgba(34,201,160,0.1)",color:daysLeft===0?"#F76A6A":daysLeft<=3?"#F7A83E":"#22C9A0"}}>{daysLeft===0?"Hoje":`${daysLeft}d`}</span>
        }
      </div>
    </div>;
  };

  return<><div style={{display:"flex",flex:1,overflow:"hidden"}}>
    {/* Calendar grid */}
    <div style={{flex:1,overflowY:"auto",padding:24}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:600}}>{MONTH_NAMES[curMonth]} {curYear}</h2>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={prevMonth} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#e8e6ff",padding:"6px 12px",cursor:"pointer",fontSize:14}}>←</button>
          <button onClick={()=>{setCurYear(today.getFullYear());setCurMonth(today.getMonth());}} style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,color:"rgba(255,255,255,0.5)",padding:"6px 12px",cursor:"pointer",fontSize:12}}>Hoje</button>
          <button onClick={nextMonth} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#e8e6ff",padding:"6px 12px",cursor:"pointer",fontSize:14}}>→</button>
          <button onClick={()=>{setClickedDate("");setAddModal(true);}} style={{background:"#7C6AF7",border:"none",borderRadius:8,color:"#fff",padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Evento</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.3)",fontWeight:600,padding:"4px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((day,idx)=>{const dayEvents=eventsOnDay(day);const todayCell=isToday(day);
          return<div key={idx} onClick={()=>{if(day){setClickedDate(`${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`);setAddModal(true);}}}
            style={{minHeight:70,borderRadius:8,padding:"6px",cursor:day?"pointer":"default",background:todayCell?"rgba(124,106,247,0.15)":day?"rgba(255,255,255,0.03)":"transparent",border:todayCell?"0.5px solid rgba(124,106,247,0.5)":"0.5px solid rgba(255,255,255,0.06)",transition:"background 0.12s"}}
            onMouseEnter={e=>{if(day)e.currentTarget.style.background=todayCell?"rgba(124,106,247,0.2)":"rgba(255,255,255,0.06)";}}
            onMouseLeave={e=>{if(day)e.currentTarget.style.background=todayCell?"rgba(124,106,247,0.15)":"rgba(255,255,255,0.03)";}}>
            {day&&<><div style={{fontSize:12,fontWeight:todayCell?700:400,color:todayCell?"#c4bbff":"rgba(255,255,255,0.7)",marginBottom:4}}>{day}</div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {dayEvents.slice(0,3).map(ev=>{const et=EVENT_TYPES.find(e=>e.id===ev.type);return<div key={ev.id} style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:et?.color+"33",color:et?.color,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{et?.icon} {ev.title}</div>;})}
                {dayEvents.length>3&&<div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>+{dayEvents.length-3}</div>}
              </div>
            </>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:14,marginTop:16,flexWrap:"wrap"}}>
        {EVENT_TYPES.map(e=><div key={e.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"rgba(255,255,255,0.4)"}}><div style={{width:8,height:8,borderRadius:"50%",background:e.color}}/>{e.label}</div>)}
      </div>
    </div>

    {/* Right panel */}
    <div style={{width:250,borderLeft:"0.5px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
      {/* Tab toggle */}
      <div style={{display:"flex",borderBottom:"0.5px solid rgba(255,255,255,0.07)",flexShrink:0}}>
        {[{id:"upcoming",label:`Próximos (${upcoming.length})`},{id:"past",label:`Passados (${past.length})`}].map(tab=>(
          <button key={tab.id} onClick={()=>setPanel(tab.id)} style={{flex:1,padding:"12px 8px",border:"none",background:"transparent",fontSize:11,fontWeight:panel===tab.id?600:400,color:panel===tab.id?"#7C6AF7":"rgba(255,255,255,0.3)",cursor:"pointer",borderBottom:panel===tab.id?"2px solid #7C6AF7":"2px solid transparent",transition:"all 0.15s"}}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:12}}>
        {panel==="upcoming"&&<>
          {upcoming.length===0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"20px 0"}}>Nenhum evento futuro</div>}
          {upcoming.map(ev=><EventCard key={ev.id} ev={ev} isPast={false}/>)}
        </>}
        {panel==="past"&&<>
          {past.length===0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"20px 0"}}>Nenhum evento passado</div>}
          {past.map(ev=><EventCard key={ev.id} ev={ev} isPast={true}/>)}
        </>}
      </div>
    </div>

    <AddEventModal open={addModal} onClose={()=>setAddModal(false)} onAdd={onAddEvent} defaultDate={clickedDate}/>
  </div>
  <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>{onDeleteEvent(confirm);setConfirm(null);}} title="Remover evento?" message="Tem certeza que quer remover este evento?" danger/>
  </>;
}

// ── Main App ───────────────────────────────────────────────────────────────────
// ── GradesPage ────────────────────────────────────────────────────────────────
const TIPO_COLORS = {Ponderada:"#7C6AF7",Artefato:"#22C9A0",Prova:"#F76A6A",Aula:"#4FB8F7",Grupo:"#F7A83E"};
const ICON_MAP = {"chalkboard-user-solido":"Aula","book-open-reader-solido":"Ponderada","square-code-solido":"Artefato","user-pen-solido":"Grupo","scroll-torah-solido":"Prova","scroll-old-solido":"Prova","user-group-solido":"Prova"};
const DEFAULT_SIM = {notaAssumida:7,notaAssumidaPonderada:7,notaAssumidaArtefato:7,manterAteOMomento:true,metaFinal:7};
const LETRAS = ["A","B","C","D","E"];
const DEFAULT_MULT = {A:1.05,B:1.0,C:0.95,D:0.9,E:0.85};

function fmtN(v,d=2){if(v===null||v===undefined)return"—";return Number(v).toFixed(d);}
function fmtP(v){return(v*100).toFixed(0)+"%";}

function calcMetricas(items,sim){
  const byTipo=(tipo)=>items.filter(i=>i.tipo===tipo);
  const acByTipo=(tipo)=>byTipo(tipo).reduce((a,i)=>a+i.peso*(i.nota??0),0);
  const mediaByTipo=(tipo)=>{
    const f=byTipo(tipo).filter(i=>i.nota!==null);
    const sp=f.reduce((a,i)=>a+i.peso,0);
    if(!sp)return null;
    return f.reduce((a,i)=>a+i.peso*(i.nota??0),0)/sp;
  };
  const acP=acByTipo("Ponderada"),acA=acByTipo("Artefato"),acAu=acByTipo("Aula"),acG=acByTipo("Grupo"),acPr=acByTipo("Prova");
  const acTotal=acP+acA+acAu+acG+acPr;
  const avalDados=items.filter(i=>i.nota!==null);
  const spAv=avalDados.reduce((a,i)=>a+i.peso,0);
  const mediaTotal=spAv?avalDados.reduce((a,i)=>a+i.peso*(i.nota??0),0)/spAv:null;
  const pesoProva=byTipo("Prova").reduce((a,i)=>a+i.peso,0);
  const media=mediaTotal??sim.notaAssumida;
  const somaSemProva=items.reduce((a,item)=>{
    if(item.tipo==="Prova")return a;
    const n=item.nota!==null?item.nota:sim.manterAteOMomento?media:(item.tipo==="Ponderada"?sim.notaAssumidaPonderada:item.tipo==="Artefato"?sim.notaAssumidaArtefato:sim.notaAssumida);
    return a+item.peso*n;
  },0);
  const notaProvaRaw=pesoProva?(sim.metaFinal-somaSemProva)/pesoProva:0;
  const notaProva=Math.max(0,Math.min(10,notaProvaRaw));
  const provaStatus=notaProvaRaw<=0?"aprovado":notaProvaRaw>10?"impossivel":notaProvaRaw>7?"exigente":"aprovado";
  const finalProj=items.reduce((a,item)=>{
    const n=item.tipo==="Prova"?notaProva:item.nota!==null?item.nota:sim.manterAteOMomento?media:(item.tipo==="Ponderada"?sim.notaAssumidaPonderada:item.tipo==="Artefato"?sim.notaAssumidaArtefato:sim.notaAssumida);
    return a+item.peso*n;
  },0);
  const naoAv=items.filter(i=>i.nota===null).reduce((a,i)=>a+i.peso,0);
  const pesosPorTipo={};
  items.forEach(i=>{pesosPorTipo[i.tipo]=(pesosPorTipo[i.tipo]||0)+i.peso;});
  return {acP,acA,acAu,acG,acPr,acTotal,mediaP:mediaByTipo("Ponderada"),mediaA:mediaByTipo("Artefato"),mediaAu:mediaByTipo("Aula"),mediaG:mediaByTipo("Grupo"),mediaPr:mediaByTipo("Prova"),mediaTotal,notaProva,provaStatus,finalProj,naoAv,pesosPorTipo};
}

function parseHtml(html){
  try{
    const parser=new DOMParser();
    const doc=parser.parseFromString(html,"text/html");
    const rows=doc.querySelectorAll("tr");
    const items=[];
    rows.forEach(row=>{
      const iconEl=row.querySelector("[data-src]");
      const iconSrc=iconEl?.getAttribute("data-src")||"";
      const iconName=(iconSrc.match(/\/([a-zA-Z0-9-]+)\.svg$/)||[])[1]||"";
      const tipo=ICON_MAP[iconName]||"";
      const nomeEl=row.querySelector("[class*='caption-activity']");
      const nome=nomeEl?.textContent?.trim()||"";
      if(!nome)return;
      const semanaEl=row.querySelector("[data-label='Semana'] span");
      const pontosEl=row.querySelector("[data-label='Pontos'] span");
      const notaEl=row.querySelector("[data-label='Notas'] span");
      const semanaNum=parseInt(semanaEl?.textContent?.trim()||"0");
      const semana=semanaNum?"S"+semanaNum:"";
      const pontosRaw=parseFloat((pontosEl?.textContent||"0").replace(",","."));
      const peso=isNaN(pontosRaw)?0:pontosRaw/100;
      const notaText=(notaEl?.textContent||"").replace(",",".").trim();
      const nota=(notaText==="-"||notaText==="")?null:parseFloat(notaText);
      items.push({id:`imp-${Math.random()}`,semana,tipo,atividade:nome,peso,nota:isNaN(nota)?null:nota,origem:"importado",matchStatus:"matched"});
    });
    const studentEl=doc.querySelector("[class*='student-name'],[class*='studentName']");
    const studentName=studentEl?.textContent?.trim()||null;
    return{items:items.filter(i=>i.peso>0),studentName};
  }catch{return{items:[],studentName:null};}
}

function GradesPage({userId}){
  const STORE_KEY=`apostila-grades-${userId||"local"}`;
  const loadG=()=>{try{const s=localStorage.getItem(STORE_KEY);return s?JSON.parse(s):null;}catch{return null;}};
  const saveG=(s)=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(s));}catch{}};

  const init=loadG()||{items:[],sim:DEFAULT_SIM,studentName:null,participacao:"B",multipliers:DEFAULT_MULT};
  const [items,setItemsRaw]=useState(init.items);
  const [sim,setSimRaw]=useState(init.sim||DEFAULT_SIM);
  const [studentName,setStudentName]=useState(init.studentName);
  const [participacao,setPartRaw]=useState(init.participacao||"B");
  const [multipliers,setMultRaw]=useState(init.multipliers||DEFAULT_MULT);
  const [err,setErr]=useState("");
  const [tab,setTab]=useState("dashboard"); // dashboard | table
  const [semFilter,setSemFilter]=useState("");
  const [showSlider,setShowSlider]=useState(false);
  const [showMultCfg,setShowMultCfg]=useState(false);
  const fileRef=useCallback(node=>{if(node)node.value="";},[]);

  const persist=(patch)=>{const next={items,sim,studentName,participacao,multipliers,...patch};saveG(next);};
  const setItems=(v)=>{setItemsRaw(v);persist({items:v});};
  const setSim=(v)=>{setSimRaw(v);persist({sim:v});};
  const setPart=(v)=>{setPartRaw(v);persist({participacao:v});};
  const setMult=(v)=>{setMultRaw(v);persist({multipliers:v});};

  const handleFile=async(file)=>{
    if(!file)return;
    setErr("");
    const text=await file.text();
    const{items:parsed,studentName:sn}=parseHtml(text);
    if(!parsed.length){setErr("Nenhuma atividade encontrada. Verifique se exportou a página de Notas do Adalove.");return;}
    setItemsRaw(parsed);setStudentName(sn);persist({items:parsed,studentName:sn});
  };

  const updateNota=(id,nota)=>{
    const next=items.map(i=>i.id===id?{...i,nota}:i);
    setItems(next);
  };

  const m=items.length?calcMetricas(items,sim):null;
  const mult=multipliers[participacao]||1;
  const notaComPart=m?m.finalProj*mult:null;
  const semanas=[...new Set(items.map(i=>i.semana).filter(Boolean))].sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)));
  const filtered=items.filter(i=>!semFilter||i.semana===semFilter);

  const provaColor=m?.provaStatus==="aprovado"?"#22C9A0":m?.provaStatus==="exigente"?"#F7A83E":"#F76A6A";
  const provaLabel=m?.provaStatus==="aprovado"?"Cenário confortável":m?.provaStatus==="exigente"?"Nota alta necessária":"Acima de 10 — improvável";

  return<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#0e0e1a"}}>
    {/* Header */}
    <div style={{padding:"14px 24px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
      <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:600,flex:1}}>🎓 Calculadora de Notas</h1>
      {studentName&&<span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>👤 {studentName}</span>}
      <label style={{background:"#7C6AF7",color:"#fff",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
        📥 Importar HTML
        <input type="file" accept=".html,.htm" style={{display:"none"}} onChange={e=>handleFile(e.target.files?.[0])}/>
      </label>
      {items.length>0&&<button onClick={()=>{setItemsRaw([]);setStudentName(null);persist({items:[],studentName:null});}} style={{background:"none",border:"0.5px solid rgba(247,106,106,0.3)",borderRadius:8,color:"rgba(247,106,106,0.6)",fontSize:11,padding:"6px 10px",cursor:"pointer"}}>Limpar</button>}
    </div>

    {err&&<div style={{margin:"12px 24px",padding:"10px 14px",background:"rgba(247,106,106,0.1)",border:"0.5px solid rgba(247,106,106,0.3)",borderRadius:8,fontSize:12,color:"#F76A6A"}}>{err}</div>}

    {/* Empty state */}
    {!items.length&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:480,padding:24}}>
        <div style={{fontSize:48,marginBottom:16}}>📊</div>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Importe suas notas do Adalove</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,marginBottom:20}}>
          Acesse o <strong>Adalove</strong> → página <strong>Notas</strong> → salve como HTML (<kbd style={{background:"rgba(255,255,255,0.1)",padding:"1px 6px",borderRadius:4}}>Ctrl+S</kbd>) → importe aqui.
        </p>
        <div style={{padding:"16px",background:"rgba(124,106,247,0.08)",border:"0.5px solid rgba(124,106,247,0.2)",borderRadius:10,fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.7,textAlign:"left"}}>
          <strong style={{color:"#7C6AF7"}}>Passos:</strong><br/>
          1. Acesse adalove.inteli.edu.br → Notas<br/>
          2. Aguarde carregar todas as atividades<br/>
          3. Salve: <strong>Ctrl+S</strong> → "Página da Web completa"<br/>
          4. Clique em "Importar HTML" acima
        </div>
      </div>
    </div>}

    {/* Dashboard */}
    {items.length>0&&m&&<div style={{flex:1,overflowY:"auto",padding:24}}>
      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {[{id:"dashboard",label:"📊 Dashboard"},{id:"table",label:"📋 Atividades"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 16px",borderRadius:8,border:`0.5px solid ${tab===t.id?"#7C6AF7":"rgba(255,255,255,0.1)"}`,background:tab===t.id?"rgba(124,106,247,0.15)":"transparent",color:tab===t.id?"#c4bbff":"rgba(255,255,255,0.5)",fontSize:12,fontWeight:tab===t.id?600:400,cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="dashboard"&&<>
        {/* Metrics row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:"Total acumulado",value:fmtN(m.acTotal,3),sub:"/ "+fmtN(Object.values(m.pesosPorTipo).reduce((a,b)=>a+b,0)*10,1)+" pts"},
            {label:"Média atual",value:fmtN(m.mediaTotal),sub:"até o momento"},
            {label:"Ponderadas",value:fmtN(m.acP,3),sub:m.mediaP!==null?`média ${fmtN(m.mediaP)}`:"sem notas"},
            {label:"Artefatos",value:fmtN(m.acA,3),sub:m.mediaA!==null?`média ${fmtN(m.mediaA)}`:"sem notas"},
            {label:"Prova",value:fmtN(m.acPr,3),sub:m.mediaPr!==null?`média ${fmtN(m.mediaPr)}`:"sem notas"},
          ].map((card,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{card.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:"#e8e6ff",marginBottom:2}}>{card.value}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{card.sub}</div>
          </div>)}
        </div>

        {/* Simulation panel */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {/* Left: assumptions */}
          <div style={{padding:"16px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.04em"}}>Simulação</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[{v:false,l:"Nota fixa"},{v:true,l:"Manter média"}].map(opt=>(
                <button key={String(opt.v)} onClick={()=>setSim({...sim,manterAteOMomento:opt.v})} style={{flex:1,padding:"5px 0",borderRadius:6,border:`0.5px solid ${sim.manterAteOMomento===opt.v?"#7C6AF7":"rgba(255,255,255,0.1)"}`,background:sim.manterAteOMomento===opt.v?"rgba(124,106,247,0.2)":"transparent",color:sim.manterAteOMomento===opt.v?"#c4bbff":"rgba(255,255,255,0.4)",fontSize:11,cursor:"pointer"}}>
                  {opt.l}
                </button>
              ))}
            </div>
            {!sim.manterAteOMomento&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[{label:"Ponderadas",key:"notaAssumidaPonderada",color:"#7C6AF7"},{label:"Artefatos",key:"notaAssumidaArtefato",color:"#22C9A0"}].map(f=>(
                <div key={f.key}>
                  <div style={{fontSize:10,color:f.color,marginBottom:3}}>{f.label}</div>
                  <input type="number" min="0" max="10" step="0.1" value={sim[f.key]} onChange={e=>setSim({...sim,[f.key]:parseFloat(e.target.value)||0})}
                    style={{...{width:"100%",padding:"5px 8px",borderRadius:6,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:13,boxSizing:"border-box"}}}/>
                </div>
              ))}
            </div>}
            {/* Participação */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.04em"}}>Participação</div>
                <button onClick={()=>setShowMultCfg(v=>!v)} style={{background:"none",border:"none",fontSize:10,color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>⚙</button>
              </div>
              <div style={{display:"flex",gap:4}}>
                {LETRAS.map(l=><button key={l} onClick={()=>setPart(l)} style={{flex:1,padding:"5px 0",borderRadius:6,border:`0.5px solid ${participacao===l?"#F7A83E":"rgba(255,255,255,0.1)"}`,background:participacao===l?"rgba(247,168,62,0.2)":"transparent",color:participacao===l?"#F7A83E":"rgba(255,255,255,0.4)",fontSize:12,fontWeight:participacao===l?700:400,cursor:"pointer"}}>{l}</button>)}
              </div>
              {showMultCfg&&<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginTop:6}}>
                {LETRAS.map(l=><div key={l}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:2}}>{l}</div>
                  <input type="number" step="0.01" value={multipliers[l]} onChange={e=>setMult({...multipliers,[l]:parseFloat(e.target.value)||1})}
                    style={{width:"100%",padding:"3px 4px",borderRadius:4,border:"0.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:10,boxSizing:"border-box",textAlign:"center"}}/>
                </div>)}
              </div>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>Projeção final</span>
              <span style={{fontWeight:700,color:"#e8e6ff"}}>{fmtN(m.finalProj)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:4}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>Com participação {participacao} ({mult>1?"+":""}{ ((mult-1)*100).toFixed(0)}%)</span>
              <span style={{fontWeight:700,color:"#F7A83E"}}>{fmtN(notaComPart)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:4}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>Não avaliado</span>
              <span style={{color:"rgba(255,255,255,0.5)"}}>{fmtP(m.naoAv)}</span>
            </div>
          </div>

          {/* Right: prova */}
          <div style={{padding:"16px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.04em"}}>Meta final</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:22,fontWeight:700,color:"#e8e6ff"}}>{sim.metaFinal.toFixed(1)}</span>
              <button onClick={()=>setShowSlider(v=>!v)} style={{background:"none",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:6,color:"rgba(255,255,255,0.4)",fontSize:11,padding:"4px 8px",cursor:"pointer"}}>✏️ Editar</button>
            </div>
            {showSlider&&<input type="range" min="0" max="10" step="0.5" value={sim.metaFinal} onChange={e=>setSim({...sim,metaFinal:parseFloat(e.target.value)})}
              style={{width:"100%",marginBottom:12,accentColor:"#7C6AF7"}}/>}

            <div style={{borderTop:"0.5px solid rgba(255,255,255,0.08)",paddingTop:12,marginTop:4}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:6}}>Nota necessária na prova</div>
              <div style={{fontSize:28,fontWeight:700,color:provaColor,marginBottom:4}}>{fmtN(m.notaProva)}</div>
              <div style={{fontSize:12,color:provaColor}}>{provaLabel}</div>
            </div>

            <div style={{borderTop:"0.5px solid rgba(255,255,255,0.08)",paddingTop:12,marginTop:12}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:8}}>Distribuição de pesos</div>
              {Object.entries(m.pesosPorTipo).map(([tipo,peso])=>(
                <div key={tipo} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:TIPO_COLORS[tipo]||"rgba(255,255,255,0.5)"}}>{tipo}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{fmtP(peso)}</span>
                  </div>
                  <div style={{height:4,borderRadius:4,background:"rgba(255,255,255,0.06)"}}>
                    <div style={{height:"100%",width:fmtP(peso),background:TIPO_COLORS[tipo]||"#7C6AF7",borderRadius:4}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>}

      {tab==="table"&&<>
        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <button onClick={()=>setSemFilter("")} style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`0.5px solid ${!semFilter?"#7C6AF7":"rgba(255,255,255,0.1)"}`,background:!semFilter?"rgba(124,106,247,0.2)":"transparent",color:!semFilter?"#c4bbff":"rgba(255,255,255,0.4)"}}>Todas</button>
          {semanas.map(s=><button key={s} onClick={()=>setSemFilter(s)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`0.5px solid ${semFilter===s?"#7C6AF7":"rgba(255,255,255,0.1)"}`,background:semFilter===s?"rgba(124,106,247,0.2)":"transparent",color:semFilter===s?"#c4bbff":"rgba(255,255,255,0.4)"}}>{s}</button>)}
        </div>
        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.08)"}}>
                {["Sem.","Tipo","Atividade","Peso","Nota"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item=>(
                <tr key={item.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)",opacity:item.nota===null?0.6:1}}>
                  <td style={{padding:"7px 10px",color:"rgba(255,255,255,0.5)",fontFamily:"monospace",whiteSpace:"nowrap"}}>{item.semana}</td>
                  <td style={{padding:"7px 10px"}}>
                    <span style={{padding:"2px 7px",borderRadius:12,border:`0.5px solid ${TIPO_COLORS[item.tipo]||"rgba(255,255,255,0.15)"}`,color:TIPO_COLORS[item.tipo]||"rgba(255,255,255,0.5)",fontSize:10,whiteSpace:"nowrap"}}>{item.tipo||"—"}</span>
                  </td>
                  <td style={{padding:"7px 10px",color:"rgba(255,255,255,0.85)",maxWidth:300}}>{item.atividade}</td>
                  <td style={{padding:"7px 10px",color:"rgba(255,255,255,0.5)",fontFamily:"monospace",whiteSpace:"nowrap"}}>{fmtP(item.peso)}</td>
                  <td style={{padding:"7px 10px"}}>
                    <input type="number" min="0" max="10" step="0.1" value={item.nota??""} placeholder="—"
                      onChange={e=>{const v=e.target.value===""?null:parseFloat(e.target.value);updateNota(item.id,isNaN(v)?null:v);}}
                      style={{width:60,padding:"3px 6px",borderRadius:5,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:12,textAlign:"center"}}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,fontSize:11,color:"rgba(255,255,255,0.3)"}}>{filtered.length} atividades</div>
      </>}
    </div>}
  </div>;
}

// ── EditItemModal ──────────────────────────────────────────────────────────────
function EditItemModal({open,onClose,item,onSave,subjects}){
  const [title,setTitle]=useState("");
  const [url,setUrl]=useState("");
  const [notes,setNotes]=useState("");
  const [week,setWeek]=useState("");
  const [date,setDate]=useState("");
  const [type,setType]=useState("artigo");
  const [subjectId,setSubjectId]=useState("");

  useEffect(()=>{
    if(item){
      setTitle(item.title||"");setUrl(item.url||"");setNotes(item.notes||"");
      setWeek(item.week||"");setDate(item.date||"");setType(item.type||"artigo");
      setSubjectId(item.subject_id||"");
    }
  },[item]);

  const submit=()=>{
    if(!title.trim())return;
    onSave(item.id,{title:title.trim(),url:url.trim(),notes:notes.trim(),week,date,type,subject_id:subjectId});
    onClose();
  };

  if(!item)return null;
  return<Modal open={open} onClose={onClose}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Editar autoestudo</h3>
      <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:18}}>✕</button>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Matéria"/>
      <select value={subjectId} onChange={e=>setSubjectId(e.target.value)} style={{...IS,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32}}>
        {subjects.map(s=><option key={s.id} value={s.id} style={{background:"#1a1a2e"}}>{s.name}</option>)}
      </select>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Nome da atividade" required/>
      <input value={title} onChange={e=>setTitle(e.target.value)} style={IS} autoFocus/>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Link"/>
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." style={IS}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      <div>
        <Label text="Semana"/>
        <select value={week} onChange={e=>setWeek(e.target.value)} style={{...IS,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32}}>
          <option value="">— Selecione —</option>
          {WEEKS.map(w=><option key={w} value={w} style={{background:"#1a1a2e"}}>{w}</option>)}
        </select>
      </div>
      <div>
        <Label text="Data"/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...IS,colorScheme:"dark"}}/>
      </div>
    </div>

    <div style={{marginBottom:14}}>
      <Label text="Tipo"/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["artigo","vídeo","livro","aula","anotação","pdf"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`0.5px solid ${type===t?"rgba(124,106,247,0.5)":"rgba(255,255,255,0.12)"}`,background:type===t?"rgba(124,106,247,0.2)":"transparent",color:type===t?"#c4bbff":"rgba(255,255,255,0.5)",fontWeight:type===t?600:400}}>{type===t?"✓ ":""}{t}</button>
        ))}
      </div>
    </div>

    <div style={{marginBottom:18}}>
      <Label text="Notas para a IA"/>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)}
        placeholder="Instrução para a IA ao gerar material..."
        rows={3} style={{...IS,resize:"vertical",lineHeight:1.6}}/>
    </div>

    {item.scraped_content&&<div style={{marginBottom:14,padding:"8px 12px",background:"rgba(34,201,160,0.08)",borderRadius:8,border:"0.5px solid rgba(34,201,160,0.2)"}}>
      <div style={{fontSize:11,color:"#22C9A0"}}>📡 Conteúdo extraído salvo — {item.scraped_content.length} caracteres</div>
    </div>}

    <div style={{display:"flex",gap:8}}>
      <Btn onClick={onClose} outline color="rgba(255,255,255,0.25)" full>Cancelar</Btn>
      <Btn onClick={submit} disabled={!title.trim()} full>Salvar alterações</Btn>
    </div>
  </Modal>;
}

export default function App(){
  const [user,setUser]=useState(null);const [authLoading,setAuthLoading]=useState(true);
  const [subjects,setSubjects]=useState([]);const [items,setItems]=useState([]);
  const [calEvents,setCalEvents]=useState([]);const [savedMaterials,setSavedMaterials]=useState([]);
  const [activeId,setActiveId]=useState(null);const [page,setPage]=useState("subjects");
  const [modals,setModals]=useState({addItem:false,generate:false,saved:false});
  const [toast,setToast]=useState("");const [backendOk,setBackendOk]=useState(null);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [sortBy,setSortBy]=useState("week"); // default sort by week
  const [viewMode,setViewMode]=useState("grid"); // "grid" | "week"
  const [confirmDel,setConfirmDel]=useState(null);
  const [editItem,setEditItem]=useState(null);

  const modal=(k,v)=>setModals(m=>({...m,[k]:v}));

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);setAuthLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setUser(session?.user||null);});
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user)return;
    seedAndLoad();
    fetch(`${API}/health`).then(r=>r.json()).then(()=>setBackendOk(true)).catch(()=>setBackendOk(false));
  },[user]);

  const seedAndLoad=async()=>{
    setLoading(true);
    const{data:existing}=await supabase.from("subjects").select("name");
    if((existing||[]).length===0){
      await supabase.from("subjects").insert(FIXED_SUBJECTS.map(s=>({...s,created_by:user.id})));
    }
    const[s,it,ev,sm]=await Promise.all([
      supabase.from("subjects").select("*").order("created_at"),
      supabase.from("items").select("*").order("created_at"),
      supabase.from("cal_events").select("*").order("date"),
      supabase.from("saved_materials").select("*").order("created_at",{ascending:false}),
    ]);
    if(s.data){setSubjects(s.data);setActiveId(id=>id||s.data[0]?.id||null);}
    if(it.data)setItems(it.data);
    if(ev.data)setCalEvents(ev.data);
    if(sm.data)setSavedMaterials(sm.data);
    setLoading(false);
  };

  const active=subjects.find(s=>s.id===activeId)||subjects[0];
  const userName=nameFromEmail(user?.email,user?.user_metadata);

  const rawItems=items.filter(i=>i.subject_id===active?.id);
  const filteredItems=rawItems
    .filter(i=>!search||i.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      if(sortBy==="week")return(a.week||"zzz").localeCompare(b.week||"zzz");
      if(sortBy==="type")return(a.type||"").localeCompare(b.type||"");
      if(sortBy==="name")return(a.title||"").localeCompare(b.title||"");
      return new Date(b.created_at||0)-new Date(a.created_at||0);
    });

  // Group by week for week view
  const byWeek=filteredItems.reduce((acc,item)=>{
    const k=item.week||"Sem semana";
    if(!acc[k])acc[k]=[];
    acc[k].push(item);
    return acc;
  },{});
  const weekKeys=Object.keys(byWeek).sort((a,b)=>a==="Sem semana"?1:b==="Sem semana"?-1:a.localeCompare(b));

  const addItem=async(item)=>{
    const{data,error}=await supabase.from("items").insert({...item,created_by:user.id,created_by_name:userName}).select().single();
    if(error){setToast("Erro ao adicionar: "+error.message);return;}
    setItems(it=>[...it,data]);setToast(`"${item.title}" adicionado!`);
  };

  const removeItem=async(id)=>{
    await supabase.from("items").delete().eq("id",id);
    setItems(it=>it.filter(i=>i.id!==id));
  };

  const updateItem=async(id,changes)=>{
    const{data,error}=await supabase.from("items").update(changes).eq("id",id).select().single();
    if(!error&&data) setItems(it=>it.map(i=>i.id===id?data:i));
    setToast("Autoestudo atualizado!");
  };

  const saveMateria=async(mat)=>{
    const{data,error}=await supabase.from("saved_materials").insert({...mat,created_by:user.id}).select().single();
    if(error){setToast("Erro ao salvar");return;}
    setSavedMaterials(m=>[data,...m]);setToast("Material salvo!");
  };

  const addEvent=async(ev)=>{
    const{data,error}=await supabase.from("cal_events").insert({...ev,created_by:user.id,created_by_name:userName}).select().single();
    if(error){setToast("Erro ao adicionar evento");return;}
    setCalEvents(e=>[...e,data]);setToast(`"${ev.title}" adicionado!`);
  };

  const deleteEvent=async(id)=>{await supabase.from("cal_events").delete().eq("id",id);setCalEvents(e=>e.filter(ev=>ev.id!==id));};
  const deleteMaterial=async(id)=>{await supabase.from("saved_materials").delete().eq("id",id);setSavedMaterials(m=>m.filter(x=>x.id!==id));};
  const logout=async()=>{await supabase.auth.signOut();setUser(null);};

  const todayStr=new Date().toISOString().slice(0,10);
  const upcomingCount=calEvents.filter(e=>e.date>=todayStr).length;

  const ItemCard=({item})=>(
    <div onClick={()=>setEditItem(item)}
      style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",transition:"border-color 0.15s,transform 0.15s",cursor:"pointer"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=active?.color||"rgba(255,255,255,0.15)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:20}}>{typeIcon(item.type)}</span>
        <button onClick={e=>{e.stopPropagation();setConfirmDel(item.id);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.18)",cursor:"pointer",fontSize:13}}
          onMouseEnter={e=>e.currentTarget.style.color="rgba(247,106,106,0.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.18)"}>✕</button>
      </div>
      <div style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.9)",lineHeight:1.4,marginBottom:5}}>{item.title}</div>
      {item.notes&&<div style={{fontSize:11,color:"rgba(247,168,62,0.7)",lineHeight:1.5,marginBottom:5,fontStyle:"italic"}}>📝 {item.notes.slice(0,80)}{item.notes.length>80?"...":""}</div>}
      {item.url&&<a href={item.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:"rgba(124,106,247,0.65)",display:"block",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔗 {item.url}</a>}
      {item.created_by_name&&<div style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginBottom:5}}>👤 {item.created_by_name}</div>}
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <Tag color={active?.color||"#7C6AF7"}>{item.type}</Tag>
        {item.week&&<Tag color="#F7A83E">{item.week}</Tag>}
        {item.date&&<Tag color="#4FB8F7">{item.date}</Tag>}
        {item.scraped_content&&<Tag color="#22C9A0">📡 lido</Tag>}
      </div>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.15)",marginTop:8,textAlign:"right"}}>clique para editar</div>
    </div>
  );

  if(authLoading)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#0e0e1a"}}><Spinner size={32} color="#7C6AF7"/></div>;
  if(!user)return<AuthScreen onAuth={setUser}/>;

  return<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#0e0e1a;font-family:'DM Sans',sans-serif;color:#e8e6ff;}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25)}
      input:focus,textarea:focus,select:focus{outline:none;border-color:rgba(124,106,247,0.6)!important}
    `}</style>

    <div style={{display:"flex",height:"100vh",background:"#0e0e1a"}}>
      {/* Sidebar */}
      <div style={{width:224,background:"#111122",borderRight:"0.5px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 10px"}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:19,letterSpacing:-0.5}}><span style={{color:"#7C6AF7"}}>Apostila</span><span style={{color:"rgba(255,255,255,0.85)"}}>.ai</span></div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>👤 {userName}</div>
        </div>

        {backendOk===false&&<div style={{margin:"0 10px 8px",padding:"6px 10px",background:"rgba(247,106,106,0.15)",border:"0.5px solid rgba(247,106,106,0.3)",borderRadius:8,fontSize:11,color:"#F76A6A"}}>⚠ Backend offline</div>}
        {backendOk===true&&<div style={{margin:"0 10px 8px",padding:"4px 10px",background:"rgba(34,201,160,0.1)",borderRadius:8,fontSize:11,color:"#22C9A0"}}>● Online</div>}
        <a href="https://drive.google.com/drive/u/0/folders/0APH2Y3zPPWOOUk9PVA" target="_blank" rel="noreferrer" style={{display:"block",width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px solid rgba(75,184,247,0.3)",background:"rgba(75,184,247,0.07)",color:"#4FB8F7",fontSize:12,cursor:"pointer",textAlign:"center",textDecoration:"none",fontWeight:600}}>
          📁 Abrir Google Drive
        </a>
        <div style={{padding:"0 8px 6px"}}>
          {[{id:"subjects",label:"📚 Matérias"},{id:"calendar",label:"📅 Calendário",badge:upcomingCount},{id:"grades",label:"🎓 Notas"}].map(nav=>(
            <button key={nav.id} onClick={()=>setPage(nav.id)} style={{width:"100%",padding:"8px 10px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:page===nav.id?"rgba(255,255,255,0.07)":"transparent",border:"none",color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:page===nav.id?600:400,marginBottom:2,textAlign:"left"}}>
              <span style={{flex:1}}>{nav.label}</span>
              {nav.badge>0&&<span style={{fontSize:10,background:"#7C6AF7",color:"#fff",padding:"1px 6px",borderRadius:10,fontWeight:700}}>{nav.badge}</span>}
            </button>
          ))}
        </div>

        {page==="subjects"&&<div style={{padding:"0 8px",flex:1,overflowY:"auto"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.22)",padding:"4px 8px",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600}}>Matérias</div>
          {loading&&<div style={{textAlign:"center",padding:"20px 0"}}><Spinner size={18} color="#7C6AF7"/></div>}
          {subjects.map(s=>{const count=items.filter(i=>i.subject_id===s.id).length;
            return<div key={s.id} onClick={()=>{setActiveId(s.id);setSearch("");}} style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:2,background:activeId===s.id||(!activeId&&s===subjects[0])?"rgba(255,255,255,0.07)":"transparent",transition:"background 0.12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=activeId===s.id?"rgba(255,255,255,0.07)":"transparent"}>
              <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.85)",flex:1,fontWeight:500}}>{s.name}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",padding:"1px 6px",borderRadius:10}}>{count}</span>
            </div>;
          })}
        </div>}
        {page==="calendar"&&<div style={{flex:1}}/>}
        {page==="grades"&&<div style={{flex:1}}/>}

        <div style={{padding:"10px 10px 12px",borderTop:"0.5px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={()=>modal("saved",true)} style={{width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.45)",fontSize:12,cursor:"pointer"}}>💾 Materiais salvos ({savedMaterials.length})</button>
          <button onClick={logout} style={{width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px solid rgba(247,106,106,0.2)",background:"transparent",color:"rgba(247,106,106,0.5)",fontSize:12,cursor:"pointer"}}>Sair — {userName}</button>
        </div>
      </div>

      {/* Main */}
      {page==="calendar"?(
        <CalendarPage events={calEvents} onAddEvent={addEvent} onDeleteEvent={deleteEvent}/>
      ):page==="grades"?(
        <GradesPage userId={user?.id}/>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Topbar */}
          {active&&<div style={{padding:"14px 24px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.01)",flexShrink:0}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:active.color}}/>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:600,flex:1,letterSpacing:-0.3}}>{active.name}</h1>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.05)",padding:"3px 10px",borderRadius:20}}>{rawItems.length} autoestudo{rawItems.length!==1?"s":""}</span>
            <Btn onClick={()=>modal("addItem",true)} outline color="rgba(255,255,255,0.25)">+ Adicionar</Btn>
            <Btn onClick={()=>modal("generate",true)} color={active.color} disabled={rawItems.length===0}>✨ Gerar material</Btn>
          </div>}

          {/* Search + Sort + View toggle */}
          {active&&rawItems.length>0&&<div style={{padding:"10px 24px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",gap:10,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:200,position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(255,255,255,0.25)"}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar autoestudos..." style={{...IS,paddingLeft:32,fontSize:12.5}}/>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginRight:2}}>Ordenar:</span>
              {[{id:"week",label:"Semana"},{id:"date",label:"Data"},{id:"name",label:"Nome"},{id:"type",label:"Tipo"}].map(s=>(
                <button key={s.id} onClick={()=>setSortBy(s.id)} style={{padding:"4px 10px",borderRadius:6,fontSize:11,cursor:"pointer",border:`0.5px solid ${sortBy===s.id?active.color:"rgba(255,255,255,0.1)"}`,background:sortBy===s.id?active.color+"22":"transparent",color:sortBy===s.id?active.color:"rgba(255,255,255,0.4)",fontWeight:sortBy===s.id?600:400}}>{s.label}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setViewMode("grid")} title="Grade" style={{padding:"4px 8px",borderRadius:6,border:`0.5px solid ${viewMode==="grid"?active.color:"rgba(255,255,255,0.1)"}`,background:viewMode==="grid"?active.color+"22":"transparent",color:viewMode==="grid"?active.color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:13}}>⊞</button>
              <button onClick={()=>setViewMode("week")} title="Por semana" style={{padding:"4px 8px",borderRadius:6,border:`0.5px solid ${viewMode==="week"?active.color:"rgba(255,255,255,0.1)"}`,background:viewMode==="week"?active.color+"22":"transparent",color:viewMode==="week"?active.color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:13}}>☰</button>
            </div>
          </div>}

          {/* Content */}
          <div style={{flex:1,overflowY:"auto",padding:24}}>
            {!active&&!loading&&<div style={{textAlign:"center",padding:"80px 0",color:"rgba(255,255,255,0.3)"}}><div style={{fontSize:40,marginBottom:12}}>📚</div><div>Carregando matérias...</div></div>}
            {loading&&<div style={{textAlign:"center",padding:"80px 0"}}><Spinner size={32} color="#7C6AF7"/></div>}

            {active&&rawItems.length===0&&!loading&&<div style={{textAlign:"center",padding:"60px 0",animation:"fadeUp 0.4s ease"}}>
              <div style={{fontSize:44,marginBottom:14}}>📚</div>
              <div style={{fontSize:15,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Nenhum autoestudo ainda</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.25)",marginBottom:22}}>Seja o primeiro a adicionar!</div>
              <Btn onClick={()=>modal("addItem",true)} color={active.color}>+ Adicionar primeiro autoestudo</Btn>
            </div>}

            {active&&rawItems.length>0&&filteredItems.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,0.3)"}}><div style={{fontSize:32,marginBottom:10}}>🔍</div><div>Nenhum resultado para "{search}"</div></div>}

            {/* Grid view */}
            {active&&filteredItems.length>0&&viewMode==="grid"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                {filteredItems.map(item=><ItemCard key={item.id} item={item}/>)}
              </div>
            )}

            {/* Week view */}
            {active&&filteredItems.length>0&&viewMode==="week"&&(
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {weekKeys.map(week=>(
                  <div key={week}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600,color:active.color}}>{week}</div>
                      <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.07)"}}/>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>{byWeek[week].length} autoestudo{byWeek[week].length!==1?"s":""}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
                      {byWeek[week].map(item=><ItemCard key={item.id} item={item}/>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick action bar */}
          {active&&rawItems.length>0&&<div style={{padding:"10px 24px",borderTop:"0.5px solid rgba(255,255,255,0.06)",display:"flex",gap:7,flexWrap:"wrap",flexShrink:0}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",alignSelf:"center",marginRight:4}}>Gerar rápido:</div>
            {MODES.map(m=><button key={m.id} onClick={()=>modal("generate",true)} style={{padding:"4px 12px",borderRadius:20,border:"0.5px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",transition:"all 0.12s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=active.color;e.currentTarget.style.color=active.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
              {m.icon} {m.label}
            </button>)}
          </div>}
        </div>
      )}
    </div>

    <AddItemModal open={modals.addItem} onClose={()=>modal("addItem",false)} onAdd={addItem} subjects={subjects}/>
    <EditItemModal open={!!editItem} onClose={()=>setEditItem(null)} item={editItem} onSave={updateItem} subjects={subjects}/>
    {active&&<GenerateModal open={modals.generate} onClose={()=>modal("generate",false)} subject={active} items={rawItems} onSave={saveMateria}/>}
    <SavedModal open={modals.saved} onClose={()=>modal("saved",false)} materials={savedMaterials} onDelete={deleteMaterial} subjects={subjects}/>
    <ConfirmModal open={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{removeItem(confirmDel);setConfirmDel(null);}} title="Remover autoestudo?" message="Tem certeza? Esta ação não pode ser desfeita." danger/>
    <Toast msg={toast} onClose={()=>setToast("")}/>
  </>;
}