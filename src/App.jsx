import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const COLORS = ["#7C6AF7","#22C9A0","#F76A6A","#F7A83E","#4FB8F7","#D46AF7","#6AF7A8","#F7D46A"];

const MODES = [
  { id:"apostila",  label:"Apostila Completa",    icon:"📋", desc:"Resumo organizado e didático" },
  { id:"mapa",      label:"Mapa Mental",           icon:"🗺️", desc:"Estrutura visual de conceitos" },
  { id:"objetiva",  label:"Simulado Objetiva",     icon:"🎯", desc:"12 questões de múltipla escolha" },
  { id:"dissertativa",label:"Simulado Dissertativo",icon:"✍️",desc:"6 questões abertas com gabarito" },
  { id:"flashcards",label:"Flashcards",            icon:"🃏", desc:"20 cards de revisão rápida" },
];

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback(v => {
    setVal(prev => { const next = typeof v === "function" ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next; });
  }, [key]);
  return [val, set];
}

// ── small helpers ─────────────────────────────────────────────────────────────
function typeIcon(t) { return {artigo:"📄",vídeo:"🎥",livro:"📘",aula:"🎓",anotação:"📝",pdf:"📑"}[t]||"📎"; }
function clx(...c) { return c.filter(Boolean).join(" "); }

// ── components ────────────────────────────────────────────────────────────────
function Overlay({ onClick }) {
  return <div onClick={onClick} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:900}} />;
}

function Modal({ open, onClose, children, wide }) {
  if (!open) return null;
  return <>
    <Overlay onClick={onClose} />
    <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,
      background:"#16162a",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:16,
      padding:28,width:wide?"700px":"460px",maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",
      fontFamily:"'DM Sans',sans-serif",color:"#e8e6ff",boxSizing:"border-box"}}>
      {children}
    </div>
  </>;
}

function Tag({ color, children }) {
  return <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:color+"22",color,fontWeight:500}}>{children}</span>;
}

function Btn({ onClick, color="#7C6AF7", outline, children, disabled, small, full, style={} }) {
  const base = {
    border: outline ? `0.5px solid ${color}` : "none",
    background: outline ? "transparent" : disabled ? "rgba(255,255,255,0.08)" : color,
    color: disabled ? "rgba(255,255,255,0.3)" : outline ? color : "#fff",
    padding: small ? "5px 12px" : "9px 18px",
    borderRadius: 8, fontSize: small ? 12 : 13, cursor: disabled ? "default" : "pointer",
    fontWeight: 600, width: full ? "100%" : undefined, transition:"opacity 0.15s",
    opacity: disabled ? 0.5 : 1, ...style
  };
  return <button style={base} onClick={disabled ? undefined : onClick}>{children}</button>;
}

function Spinner({ size=18, color="#7C6AF7" }) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}33`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle"}} />;
}

function Toast({ msg, onClose }) {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  return <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#22C9A0",color:"#fff",padding:"10px 20px",borderRadius:10,zIndex:9999,fontWeight:600,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
    ✓ {msg}
  </div>;
}

// ── Add Subject ───────────────────────────────────────────────────────────────
function AddSubjectModal({ open, onClose, onAdd }) {
  const [name, setName] = useState(""); const [color, setColor] = useState(COLORS[0]);
  return <Modal open={open} onClose={onClose}>
    <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>Nova matéria</h3>
    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Algoritmos, Física..." autoFocus
      style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:14,marginBottom:14,boxSizing:"border-box"}} />
    <div style={{marginBottom:18}}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:8}}>Cor da matéria</div>
      <div style={{display:"flex",gap:8}}>{COLORS.map(c=><div key={c} onClick={()=>setColor(c)}
        style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #fff":"3px solid transparent",transition:"border 0.15s"}} />)}</div>
    </div>
    <Btn onClick={()=>{if(name.trim()){onAdd(name.trim(),color);setName("");onClose();}}} color={color} full>Criar matéria</Btn>
  </Modal>;
}

// ── Add Item ──────────────────────────────────────────────────────────────────
const WEEKS = Array.from({length:10},(_,i)=>`Semana ${String(i+1).padStart(2,"0")}`);

function Field({ label, required, children }) {
  return <div style={{marginBottom:14}}>
    <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:6,letterSpacing:"0.04em",textTransform:"uppercase"}}>
      {label}{required&&<span style={{color:"#7C6AF7",marginLeft:3}}>*</span>}
    </div>
    {children}
  </div>;
}

const inputStyle = {width:"100%",padding:"9px 12px",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e8e6ff",fontSize:13.5,boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};

function AddItemModal({ open, onClose, onAdd }) {
  const [title, setTitle]           = useState("");
  const [url, setUrl]               = useState("");
  const [desc, setDesc]             = useState("");
  const [week, setWeek]             = useState("");
  const [date, setDate]             = useState("");
  const [type, setType]             = useState("artigo");
  const [scraping, setScraping]     = useState(false);
  const [pdfFile, setPdfFile]       = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [linkOk, setLinkOk]         = useState(null); // null | true | false
  const [pdfOk, setPdfOk]           = useState(null);
  const [scrapedContent, setScrapedContent] = useState("");
  const fileRef = useRef(null);

  const reset = () => {
    setTitle(""); setUrl(""); setDesc(""); setWeek(""); setDate("");
    setType("artigo"); setPdfFile(null); setLinkOk(null); setPdfOk(null); setScrapedContent("");
  };

  const scrape = async () => {
    if (!url.trim()) return;
    setScraping(true); setLinkOk(null);
    try {
      const r = await fetch(`${API}/scrape`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url}) });
      const d = await r.json();
      if (d.title && !title) setTitle(d.title.slice(0,80));
      if (d.description && !desc) setDesc(d.description.slice(0,200));
      setScrapedContent(d.content || "");
      setLinkOk(true);
    } catch { setLinkOk(false); }
    setScraping(false);
  };

  const openFilePicker = () => fileRef.current?.click();

  const handlePdf = async (file) => {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    if (!title) setTitle(file.name.replace(/\.pdf$/i,"").slice(0,80));
    setPdfLoading(true); setPdfOk(null);
    try {
      const b64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const r = await fetch(`${API}/extract-pdf-b64`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ data: b64 })
      });
      const d = await r.json();
      if (d.content) {
        setScrapedContent(d.content);
        if (!desc) setDesc(d.content.slice(0,200));
        setPdfOk(true);
      } else { setPdfOk(false); }
    } catch { setPdfOk(false); }
    setPdfLoading(false);
  };

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ id:Date.now(), title:title.trim(), url:url.trim(), desc:desc.trim(), week, date, type, scraped_content:scrapedContent });
    reset(); onClose();
  };

  return <Modal open={open} onClose={()=>{reset();onClose();}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Adicionar autoestudo</h3>
      <button onClick={()=>{reset();onClose();}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
    </div>

    <Field label="Nome da atividade" required>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Séries de Taylor — Khan Academy" autoFocus style={inputStyle} />
    </Field>

    {/* Link OR PDF — side by side */}
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:8,letterSpacing:"0.04em",textTransform:"uppercase"}}>
        Conteúdo <span style={{color:"rgba(255,255,255,0.2)",fontWeight:400}}>— insira um link OU anexe um PDF</span>
      </div>

      {/* Link row */}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <input value={url} onChange={e=>{setUrl(e.target.value);setLinkOk(null);}}
          placeholder="Cole o link aqui (https://...)"
          onKeyDown={e=>e.key==="Enter"&&scrape()}
          style={{...inputStyle,flex:1,marginBottom:0}} />
        <button onClick={scrape} disabled={!url.trim()||scraping} style={{
          padding:"0 16px",borderRadius:8,border:"none",whiteSpace:"nowrap",flexShrink:0,
          background:!url.trim()||scraping?"rgba(34,201,160,0.2)":"#22C9A0",
          color:"#fff",fontSize:12,fontWeight:700,cursor:!url.trim()||scraping?"default":"pointer"
        }}>
          {scraping ? <Spinner size={13} color="#fff"/> : "📡 Ler link"}
        </button>
      </div>
      {linkOk===true && <div style={{fontSize:11,color:"#22C9A0",marginBottom:6}}>✓ Link lido — {scrapedContent.length} caracteres extraídos</div>}
      {linkOk===false && <div style={{fontSize:11,color:"#F76A6A",marginBottom:6}}>Não foi possível ler o link. Tente outro ou use o PDF.</div>}

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"10px 0"}}>
        <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.1)"}} />
        <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontWeight:600}}>OU</span>
        <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.1)"}} />
      </div>

      {/* PDF button */}
      <input ref={fileRef} type="file" accept="application/pdf" style={{display:"none"}}
        onChange={e=>e.target.files[0]&&handlePdf(e.target.files[0])} />

      {!pdfFile ? (
        <button onClick={openFilePicker} style={{
          width:"100%",padding:"11px 0",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,
          border:"0.5px dashed rgba(124,106,247,0.4)",background:"rgba(124,106,247,0.07)",color:"#c4bbff"
        }}>
          📄 Anexar PDF
        </button>
      ) : (
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,background:"rgba(124,106,247,0.1)",border:"0.5px solid rgba(124,106,247,0.3)"}}>
          {pdfLoading ? <Spinner size={16} color="#7C6AF7"/> : <span style={{fontSize:18}}>📑</span>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#c4bbff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pdfFile.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>
              {pdfLoading ? "Extraindo texto..." : pdfOk===true ? `✓ ${scrapedContent.length} caracteres extraídos` : pdfOk===false ? "Erro ao extrair — adicione descrição manual" : ""}
            </div>
          </div>
          <button onClick={openFilePicker} style={{background:"none",border:"none",fontSize:11,color:"rgba(255,255,255,0.35)",cursor:"pointer"}}>trocar</button>
          <button onClick={()=>{setPdfFile(null);setPdfOk(null);setScrapedContent("");}} style={{background:"none",border:"none",fontSize:14,color:"rgba(247,106,106,0.5)",cursor:"pointer"}}>✕</button>
        </div>
      )}
    </div>

    <Field label="Descrição">
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Resumo ou observações (opcional — preenchido automaticamente)" rows={3}
        style={{...inputStyle,resize:"vertical",lineHeight:1.5}} />
    </Field>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      <Field label="Semana">
        <select value={week} onChange={e=>setWeek(e.target.value)}
          style={{...inputStyle,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32}}>
          <option value="">— Selecione —</option>
          {WEEKS.map(w=><option key={w} value={w} style={{background:"#1a1a2e"}}>{w}</option>)}
        </select>
      </Field>
      <Field label="Data">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}
          style={{...inputStyle,colorScheme:"dark"}} />
      </Field>
    </div>

    <Field label="Tipo">
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["artigo","vídeo","livro","aula","anotação","pdf"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{
            padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",transition:"all 0.12s",
            border:`0.5px solid ${type===t?"rgba(124,106,247,0.5)":"rgba(255,255,255,0.12)"}`,
            background:type===t?"rgba(124,106,247,0.2)":"transparent",
            color:type===t?"#c4bbff":"rgba(255,255,255,0.5)",fontWeight:type===t?600:400
          }}>{type===t?"✓ ":""}{t}</button>
        ))}
      </div>
    </Field>

    <div style={{display:"flex",gap:8,marginTop:4}}>
      <Btn onClick={()=>{reset();onClose();}} outline color="rgba(255,255,255,0.25)" full>Cancelar</Btn>
      <Btn onClick={submit} disabled={!title.trim()} full>Adicionar autoestudo</Btn>
    </div>
  </Modal>;
}

// ── Tutorial ───────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    icon:"👋", title:"Bem-vindo ao Apostila.ai!",
    text:"Transforme seus links, artigos e vídeos em apostilas, simulados e flashcards gerados por IA. Este tutorial mostra como usar tudo em menos de 2 minutos.",
    tip:null
  },
  {
    icon:"📁", title:"1. Crie suas matérias",
    text:'Clique em "+ Nova matéria" na barra lateral e dê um nome e uma cor para cada disciplina. Você pode ter quantas quiser — Cálculo, Física, Algoritmos, etc.',
    tip:"Cada matéria tem sua própria cor, que aparece na capa dos PDFs gerados."
  },
  {
    icon:"🔗", title:"2. Adicione autoestudos",
    text:'Clique em "+ Adicionar" e preencha o formulário. Cole o link do conteúdo e clique em "📡 Ler" — a IA lê o artigo ou página e preenche o nome automaticamente.',
    tip:'Você pode informar a semana (01 a 10) e a data para organizar cronologicamente.'
  },
  {
    icon:"✨", title:"3. Gere o material com IA",
    text:'Com pelo menos um autoestudo adicionado, clique em "✨ Gerar material". Escolha o tipo: Apostila, Mapa Mental, Simulado ou Flashcards.',
    tip:"Você pode selecionar apenas alguns autoestudos para gerar o material — útil para criar um simulado só da semana 03, por exemplo."
  },
  {
    icon:"⬇", title:"4. Baixe o PDF",
    text:'Após a IA gerar o conteúdo, você vê um preview e pode clicar em "⬇ Baixar PDF" para obter o arquivo formatado com capa, cores da sua matéria e layout profissional.',
    tip:'Clique em "💾 Salvar" para guardar o material e poder baixar o PDF depois, sem precisar gerar novamente.'
  },
  {
    icon:"💡", title:"Pronto! Uma dica extra",
    text:"Seus dados ficam salvos no navegador deste computador. Se quiser acessar de outros dispositivos, peça ao Claude para adicionar integração com Supabase ao projeto.",
    tip:null
  },
];

function TutorialModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  useEffect(()=>{ if(open) setStep(0); },[open]);

  return <Modal open={open} onClose={onClose}>
    {/* Progress dots */}
    <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:24}}>
      {TUTORIAL_STEPS.map((_,i)=>(
        <div key={i} onClick={()=>setStep(i)} style={{
          width: i===step ? 20 : 6, height:6, borderRadius:3, cursor:"pointer",
          background: i===step ? "#7C6AF7" : i<step ? "rgba(124,106,247,0.4)" : "rgba(255,255,255,0.12)",
          transition:"all 0.25s"
        }} />
      ))}
    </div>

    {/* Content */}
    <div key={step} style={{textAlign:"center",animation:"fadeUp 0.3s ease",paddingBottom:8}}>
      <div style={{fontSize:48,marginBottom:16,lineHeight:1}}>{s.icon}</div>
      <h3 style={{margin:"0 0 12px",fontSize:17,fontWeight:700,color:"#e8e6ff"}}>{s.title}</h3>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:"0 0 16px"}}>{s.text}</p>
      {s.tip && (
        <div style={{background:"rgba(124,106,247,0.1)",border:"0.5px solid rgba(124,106,247,0.25)",borderRadius:10,padding:"10px 14px",fontSize:12.5,color:"rgba(255,255,255,0.55)",textAlign:"left",lineHeight:1.6}}>
          <span style={{color:"#7C6AF7",fontWeight:700}}>💡 Dica: </span>{s.tip}
        </div>
      )}
    </div>

    {/* Navigation */}
    <div style={{display:"flex",gap:8,marginTop:24}}>
      {step > 0
        ? <Btn onClick={()=>setStep(s=>s-1)} outline color="rgba(255,255,255,0.25)" full>← Anterior</Btn>
        : <Btn onClick={onClose} outline color="rgba(255,255,255,0.2)" full>Pular tutorial</Btn>
      }
      {isLast
        ? <Btn onClick={onClose} full>Começar a usar →</Btn>
        : <Btn onClick={()=>setStep(s=>s+1)} full>Próximo →</Btn>
      }
    </div>
  </Modal>;
}

// ── Generate ──────────────────────────────────────────────────────────────────
function GenerateModal({ open, onClose, subject, items, onSave }) {
  const [mode, setMode] = useState("apostila");
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("config"); // config | generating | done
  const [result, setResult] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { if (open) { setSelected(items.map(i=>i.id)); setResult(null); setPhase("config"); setErr(""); } }, [open]);

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const selItems = items.filter(i=>selected.includes(i.id));

  const generate = async () => {
    if (!selItems.length) return;
    setPhase("generating"); setErr("");
    try {
      const r = await fetch(`${API}/generate`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode, subject:subject.name, subject_color:subject.color, items:selItems })
      });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setResult(d);
      setPhase("done");
    } catch(e) { setErr("Erro ao gerar: " + e.message); setPhase("config"); }
  };

  const downloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const r = await fetch(`${API}/pdf`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode:result.mode, subject:subject.name, subject_color:subject.color, data:result.data })
      });
      if (!r.ok) throw new Error(await r.text());
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url;
      a.download=`${subject.name.replace(/\s+/g,"_")}_${result.mode}.pdf`; a.click();
    } catch(e) { alert("Erro ao gerar PDF: " + e.message); }
    setPdfLoading(false);
  };

  const save = () => {
    if (!result) return;
    onSave({ id:Date.now(), mode:result.mode, title:`${MODES.find(m=>m.id===result.mode)?.label} — ${subject.name}`, data:result.data, date:new Date().toLocaleDateString("pt-BR") });
    onClose();
  };

  return <Modal open={open} onClose={onClose} wide={phase==="done"}>
    {phase === "config" && <>
      <h3 style={{margin:"0 0 4px",fontSize:16,fontWeight:700}}>Gerar material — {subject.name}</h3>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:16}}>Escolha o tipo e os autoestudos</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {MODES.map(m=><div key={m.id} onClick={()=>setMode(m.id)}
          style={{padding:"10px 12px",borderRadius:10,border:`0.5px solid ${mode===m.id?subject.color:"rgba(255,255,255,0.08)"}`,
            background:mode===m.id?subject.color+"18":"transparent",cursor:"pointer",transition:"all 0.15s"}}>
          <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
          <div style={{fontSize:12,fontWeight:600,color:mode===m.id?"#fff":"rgba(255,255,255,0.75)"}}>{m.label}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{m.desc}</div>
        </div>)}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Autoestudos</div>
          <button onClick={()=>setSelected(selected.length===items.length?[]:items.map(i=>i.id))}
            style={{fontSize:11,color:subject.color,background:"none",border:"none",cursor:"pointer"}}>
            {selected.length===items.length?"Desmarcar todos":"Selecionar todos"}
          </button>
        </div>
        {items.length===0 && <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",padding:10}}>Nenhum autoestudo adicionado.</div>}
        {items.map(item=><div key={item.id} onClick={()=>toggle(item.id)}
          style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,cursor:"pointer",marginBottom:3,background:selected.includes(item.id)?"rgba(255,255,255,0.04)":"transparent"}}>
          <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${selected.includes(item.id)?subject.color:"rgba(255,255,255,0.2)"}`,
            background:selected.includes(item.id)?subject.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,color:"#fff"}}>
            {selected.includes(item.id)&&"✓"}
          </div>
          <span style={{fontSize:13,color:"rgba(255,255,255,0.8)",flex:1}}>{item.title}</span>
          {item.scraped_content && <span style={{fontSize:10,color:"#22C9A0"}}>📡</span>}
          <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{item.type}</span>
        </div>)}
      </div>
      {err && <div style={{color:"#F76A6A",fontSize:12,marginBottom:10}}>{err}</div>}
      <Btn onClick={generate} disabled={!selItems.length} full color={subject.color}>✨ Gerar com IA</Btn>
    </>}

    {phase === "generating" && <div style={{textAlign:"center",padding:"50px 0"}}>
      <div style={{marginBottom:16}}><Spinner size={40} color={subject.color} /></div>
      <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginBottom:4}}>Gerando seu material com IA...</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Isso pode levar alguns segundos</div>
    </div>}

    {phase === "done" && result && <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:700}}>{MODES.find(m=>m.id===result.mode)?.icon} {MODES.find(m=>m.id===result.mode)?.label}</h3>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{subject.name}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={save} color="#22C9A0" small>💾 Salvar</Btn>
          <Btn onClick={downloadPDF} disabled={pdfLoading} color={subject.color} small>
            {pdfLoading?<><Spinner size={12} color="#fff" /> Gerando...</>:"⬇ Baixar PDF"}
          </Btn>
          <Btn onClick={()=>setPhase("config")} outline color="rgba(255,255,255,0.3)" small>← Voltar</Btn>
        </div>
      </div>
      <ResultPreview mode={result.mode} data={result.data} color={subject.color} />
    </>}
  </Modal>;
}

function ResultPreview({ mode, data, color }) {
  if (mode === "apostila") return <div style={{fontSize:12.5,lineHeight:1.7,color:"rgba(255,255,255,0.8)"}}>
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

  if (mode === "mapa") return <div>
    <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:12,textAlign:"center"}}>{data.centro}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {data.ramos?.map((r,i)=>{
        let rc = color;
        try { rc = r.cor||color; } catch {}
        return <div key={i} style={{background:rc+"18",border:`0.5px solid ${rc}44`,borderRadius:10,padding:10}}>
          <div style={{fontWeight:600,color:rc,fontSize:12,marginBottom:6}}>{r.titulo}</div>
          {r.subramos?.map((s,j)=><div key={j} style={{marginBottom:4}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:2}}>↳ {s.titulo}</div>
            {s.itens?.map((it,k)=><div key={k} style={{fontSize:10,color:"rgba(255,255,255,0.45)",paddingLeft:10}}>• {it}</div>)}
          </div>)}
        </div>;
      })}
    </div>
  </div>;

  if (mode === "objetiva" || mode === "dissertativa") return <div>
    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:12}}>{data.titulo}</div>
    {data.questoes?.slice(0,3).map((q,i)=><div key={i} style={{marginBottom:12,padding:10,background:"rgba(255,255,255,0.04)",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.08)"}}>
      <div style={{fontWeight:600,color,fontSize:12,marginBottom:4}}>Q{q.numero}</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginBottom:6}}>{q.enunciado}</div>
      {mode==="objetiva"&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>5 alternativas • Resposta: {q.resposta?.toUpperCase()}</div>}
      {mode==="dissertativa"&&q.gabarito&&<div style={{fontSize:11,color:"#22C9A0",marginTop:4}}>Gabarito: {q.gabarito?.slice(0,80)}...</div>}
    </div>)}
    {data.questoes?.length>3&&<div style={{fontSize:12,color:"rgba(255,255,255,0.35)",textAlign:"center"}}>+ {data.questoes.length-3} questões no PDF</div>}
  </div>;

  if (mode === "flashcards") return <div>
    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:12}}>{data.titulo}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {data.cards?.slice(0,6).map((c,i)=><div key={i} style={{borderRadius:8,overflow:"hidden",border:`0.5px solid ${color}33`}}>
        <div style={{background:color+"25",padding:"8px 10px",borderBottom:`0.5px solid ${color}22`}}>
          <div style={{fontSize:10,color,marginBottom:2,fontWeight:600}}>FRENTE</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.85)"}}>{c.frente}</div>
        </div>
        <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.03)"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:2}}>VERSO</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>{c.verso?.slice(0,70)}{c.verso?.length>70?"...":""}</div>
        </div>
      </div>)}
    </div>
    {data.cards?.length>6&&<div style={{fontSize:12,color:"rgba(255,255,255,0.35)",textAlign:"center",marginTop:8}}>+ {data.cards.length-6} cards no PDF</div>}
  </div>;

  return null;
}

// ── Saved Materials ───────────────────────────────────────────────────────────
function SavedModal({ open, onClose, materials, onDelete, subjects, onGeneratePDF }) {
  const [pdfLoading, setPdfLoading] = useState(null);
  const dlPDF = async (mat, subject) => {
    setPdfLoading(mat.id);
    try {
      const r = await fetch(`${API}/pdf`, {
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mode:mat.mode,subject:subject?.name||"",subject_color:subject?.color||"#7C6AF7",data:mat.data})
      });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download=`${mat.title.replace(/\s+/g,"_")}.pdf`; a.click();
    } catch(e){alert("Erro: "+e.message);}
    setPdfLoading(null);
  };
  return <Modal open={open} onClose={onClose} wide>
    <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>💾 Materiais salvos</h3>
    {materials.length===0&&<div style={{fontSize:14,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"30px 0"}}>Nenhum material salvo ainda.<br/>Gere e salve um material!</div>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {materials.map(mat=>{
        const subject = subjects.find(s=>mat.title.includes(s.name));
        const modeInfo = MODES.find(m=>m.id===mat.mode);
        return <div key={mat.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:20}}>{modeInfo?.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{mat.title}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{mat.date} • {modeInfo?.label}</div>
          </div>
          <Btn onClick={()=>dlPDF(mat,subject)} disabled={pdfLoading===mat.id} color={subject?.color||"#7C6AF7"} small>
            {pdfLoading===mat.id?<Spinner size={12} color="#fff"/>:"⬇ PDF"}
          </Btn>
          <button onClick={()=>onDelete(mat.id)} style={{background:"none",border:"none",color:"rgba(255,100,100,0.5)",cursor:"pointer",fontSize:14}}>✕</button>
        </div>;
      })}
    </div>
  </Modal>;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [subjects, setSubjects] = useLocalStorage("subjects", [
    {id:1,name:"Cálculo II",color:"#7C6AF7",items:[]},
    {id:2,name:"Física",color:"#22C9A0",items:[]},
  ]);
  const [savedMaterials, setSavedMaterials] = useLocalStorage("savedMaterials", []);
  const [activeId, setActiveId] = useState(null);
  const [modals, setModals] = useState({addSubject:false,addItem:false,generate:false,saved:false,tutorial:false});
  const [toast, setToast] = useState("");
  const [backendOk, setBackendOk] = useState(null);

  const open = useEffect(()=>{ setActiveId(s=>s||subjects[0]?.id||null); },[]);
  const active = subjects.find(s=>s.id===activeId) || subjects[0];

  useEffect(()=>{
    fetch(`${API}/health`).then(r=>r.json()).then(()=>setBackendOk(true)).catch(()=>setBackendOk(false));
  },[]);

  const modal = (k,v) => setModals(m=>({...m,[k]:v}));

  const addSubject = (name,color) => {
    const ns = {id:Date.now(),name,color,items:[]};
    setSubjects(s=>[...s,ns]);
    setActiveId(ns.id);
    setToast(`Matéria "${name}" criada!`);
  };

  const addItem = item => {
    setSubjects(s=>s.map(sub=>sub.id===activeId?{...sub,items:[...sub.items,item]}:sub));
    setToast(`"${item.title}" adicionado!`);
  };

  const removeItem = id => setSubjects(s=>s.map(sub=>sub.id===activeId?{...sub,items:sub.items.filter(i=>i.id!==id)}:sub));

  const saveMateria = mat => { setSavedMaterials(m=>[mat,...m]); setToast("Material salvo!"); };

  const removeSubject = id => {
    const remaining = subjects.filter(s=>s.id!==id);
    setSubjects(remaining);
    if (activeId===id) setActiveId(remaining[0]?.id||null);
  };

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#0e0e1a;font-family:'DM Sans',sans-serif;color:#e8e6ff;}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      input::placeholder{color:rgba(255,255,255,0.25)}
      input:focus{outline:none;border-color:rgba(124,106,247,0.6)!important}
      a{color:inherit;text-decoration:none}
    `}</style>

    <div style={{display:"flex",height:"100vh",background:"#0e0e1a"}}>
      {/* Sidebar */}
      <div style={{width:224,background:"#111122",borderRight:"0.5px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 12px"}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:19,letterSpacing:-0.5}}>
            <span style={{color:"#7C6AF7"}}>Apostila</span><span style={{color:"rgba(255,255,255,0.85)"}}>.ai</span>
          </div>
          <div style={{fontSize:10.5,color:"rgba(255,255,255,0.28)",marginTop:1}}>seu estudo, organizado</div>
        </div>

        {backendOk===false&&<div style={{margin:"0 10px 8px",padding:"6px 10px",background:"rgba(247,106,106,0.15)",border:"0.5px solid rgba(247,106,106,0.3)",borderRadius:8,fontSize:11,color:"#F76A6A"}}>
          ⚠ Backend offline — rode o servidor
        </div>}
        {backendOk===true&&<div style={{margin:"0 10px 8px",padding:"4px 10px",background:"rgba(34,201,160,0.1)",borderRadius:8,fontSize:11,color:"#22C9A0"}}>
          ● Online
        </div>}

        <div style={{padding:"0 8px",flex:1,overflowY:"auto"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.22)",padding:"6px 8px 4px",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600}}>Matérias</div>
          {subjects.map(s=><div key={s.id} onClick={()=>setActiveId(s.id)}
            style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:2,
              background:activeId===s.id?"rgba(255,255,255,0.07)":"transparent",transition:"background 0.12s",position:"relative"}} 
            onMouseEnter={e=>{if(activeId!==s.id)e.currentTarget.style.background="rgba(255,255,255,0.035)"}}
            onMouseLeave={e=>{if(activeId!==s.id)e.currentTarget.style.background="transparent"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}} />
            <span style={{fontSize:13,color:activeId===s.id?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.5)",flex:1,fontWeight:activeId===s.id?500:400}}>{s.name}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",padding:"1px 6px",borderRadius:10}}>{s.items.length}</span>
          </div>)}
        </div>

        <div style={{padding:"10px 10px 12px",borderTop:"0.5px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={()=>modal("addSubject",true)}
            style={{width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px dashed rgba(255,255,255,0.14)",background:"transparent",color:"rgba(255,255,255,0.38)",fontSize:12,cursor:"pointer"}}>
            + Nova matéria
          </button>
          <button onClick={()=>modal("saved",true)}
            style={{width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.45)",fontSize:12,cursor:"pointer"}}>
            💾 Materiais salvos ({savedMaterials.length})
          </button>
          <button onClick={()=>modal("tutorial",true)}
            style={{width:"100%",padding:"7px 0",borderRadius:8,border:"0.5px solid rgba(124,106,247,0.2)",background:"rgba(124,106,247,0.06)",color:"rgba(124,106,247,0.7)",fontSize:12,cursor:"pointer"}}>
            📖 Como usar
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        {active && <div style={{padding:"14px 24px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.01)",flexShrink:0}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:active.color}} />
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:600,flex:1,letterSpacing:-0.3}}>{active.name}</h1>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.05)",padding:"3px 10px",borderRadius:20}}>
            {active.items.length} autoestudo{active.items.length!==1?"s":""}
          </span>
          {subjects.length>1&&<button onClick={()=>removeSubject(active.id)}
            style={{background:"none",border:"0.5px solid rgba(247,106,106,0.25)",borderRadius:8,color:"rgba(247,106,106,0.5)",fontSize:11,padding:"4px 10px",cursor:"pointer"}}>
            Remover matéria
          </button>}
          <Btn onClick={()=>modal("addItem",true)} outline color="rgba(255,255,255,0.25)">+ Adicionar</Btn>
          <Btn onClick={()=>modal("generate",true)} color={active.color} disabled={active.items.length===0}>✨ Gerar material</Btn>
        </div>}

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {!active && <div style={{textAlign:"center",padding:"80px 0",color:"rgba(255,255,255,0.3)"}}>
            <div style={{fontSize:40,marginBottom:12}}>📚</div>
            <div>Crie sua primeira matéria</div>
          </div>}

          {active && active.items.length===0 && <div style={{textAlign:"center",padding:"60px 0",animation:"fadeUp 0.4s ease"}}>
            <div style={{fontSize:44,marginBottom:14}}>📚</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Nenhum autoestudo ainda</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.25)",marginBottom:22}}>Adicione artigos, vídeos, livros ou aulas</div>
            <Btn onClick={()=>modal("addItem",true)} color={active.color}>+ Adicionar primeiro autoestudo</Btn>
          </div>}

          {active && active.items.length>0 && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12}}>
              {active.items.map((item,i)=><div key={item.id}
                style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",animation:`fadeUp 0.3s ease ${i*0.04}s both`,transition:"border-color 0.15s,transform 0.15s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.transform="translateY(-1px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <span style={{fontSize:22}}>{typeIcon(item.type)}</span>
                  <button onClick={()=>removeItem(item.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.18)",cursor:"pointer",fontSize:13}}
                    onMouseEnter={e=>e.currentTarget.style.color="rgba(247,106,106,0.7)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.18)"}>✕</button>
                </div>
                <div style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.9)",lineHeight:1.4,marginBottom:8}}>{item.title}</div>
                {item.desc&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.5,marginBottom:8}}>{item.desc.slice(0,100)}{item.desc.length>100?"...":""}</div>}
                {item.url&&<a href={item.url} target="_blank" rel="noreferrer"
                  style={{fontSize:11,color:"rgba(124,106,247,0.65)",display:"block",marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  🔗 {item.url}
                </a>}
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <Tag color={active.color}>{item.type}</Tag>
                  {item.week&&<Tag color="#F7A83E">{item.week}</Tag>}
                  {item.date&&<Tag color="#4FB8F7">{item.date}</Tag>}
                  {item.scraped_content&&<Tag color="#22C9A0">📡 lido</Tag>}
                </div>
              </div>)}
            </div>
          </>}
        </div>

        {/* Quick action bar */}
        {active && active.items.length>0 && <div style={{padding:"10px 24px",borderTop:"0.5px solid rgba(255,255,255,0.06)",display:"flex",gap:7,flexWrap:"wrap",flexShrink:0}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",alignSelf:"center",marginRight:4}}>Gerar rápido:</div>
          {MODES.map(m=><button key={m.id} onClick={()=>modal("generate",true)}
            style={{padding:"4px 12px",borderRadius:20,border:"0.5px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",transition:"all 0.12s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=active.color;e.currentTarget.style.color=active.color;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            {m.icon} {m.label}
          </button>)}
        </div>}
      </div>
    </div>

    {/* Modals */}
    <AddSubjectModal open={modals.addSubject} onClose={()=>modal("addSubject",false)} onAdd={addSubject} />
    <AddItemModal open={modals.addItem} onClose={()=>modal("addItem",false)} onAdd={addItem} />
    {active && <GenerateModal open={modals.generate} onClose={()=>modal("generate",false)} subject={active} items={active.items} onSave={saveMateria} />}
    <SavedModal open={modals.saved} onClose={()=>modal("saved",false)} materials={savedMaterials} onDelete={id=>setSavedMaterials(m=>m.filter(x=>x.id!==id))} subjects={subjects} />
    <TutorialModal open={modals.tutorial} onClose={()=>modal("tutorial",false)} />
    <Toast msg={toast} onClose={()=>setToast("")} />
  </>;
}
