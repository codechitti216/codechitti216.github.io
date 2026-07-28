import { useState, useRef, useEffect, useLayoutEffect, useCallback, forwardRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
const D = 768, DK = 64, DFF = D * 4, N = 6;
const Q_C = { bg: '#93c5fd', bdr: '#60a5fa', dk: '#2563eb' };
const K_C = { bg: '#fca5a5', bdr: '#f87171', dk: '#dc2626' };
const V_C = { bg: '#86efac', bdr: '#4ade80', dk: '#16a34a' };
const S_C = { bg: '#c4b5fd', bdr: '#a78bfa', dk: '#7c3aed' };
const GRAY = '#b0b0b0', GREEN = '#16a34a', PURPLE = '#a78bfa';

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function TransformerViz() {
  const [tip, setTip] = useState(null);
  const cRef = useRef(null);
  const sRef = useRef(null);
  const { scrollYProgress: sp } = useScroll({ target: sRef, offset: ['start start', 'end end'] });

  // ── Cut state (for path computation only) ──
  const [cut, setCut] = useState(1);
  useEffect(() => sp.on('change', v =>
    setCut(v < 0.17 ? 1 : v < 0.33 ? 2 : v < 0.45 ? 3 : v < 0.54 ? 4 : 5)
  ), [sp]);

  // ── Cut opacities: tight crossfades to minimize overlap ──
  const c1Op = useTransform(sp, [0, 0, 0.15, 0.17], [1, 1, 1, 0]);
  const c2Op = useTransform(sp, [0.16, 0.18, 0.32, 0.34], [0, 1, 1, 0]);
  const c3Op = useTransform(sp, [0.33, 0.35, 0.44, 0.46], [0, 1, 1, 0]);
  const c4Op = useTransform(sp, [0.45, 0.47, 0.52, 0.54], [0, 1, 1, 0]);
  const c5Op = useTransform(sp, [0.53, 0.55, 1, 1], [0, 1, 1, 1]);

  // ── Scroll sub-phases per cut ──
  // Cut 1: No PE
  const c1 = A(sp, [[0,.03],[.03,.05],[.05,.08],[.08,.10],[.10,.12],[.12,.14]]);
  const c1Warn = useTransform(sp, [.14,.16], [0,1]);

  // Cut 2: With PE, single head
  const c2 = A(sp, [[.18,.21],[.21,.23],[.23,.26],[.26,.28],[.28,.30],[.30,.32]]);

  // Cut 3: Multi-head encoder
  const c3H = useTransform(sp, [.35,.39], [0,1]);
  const c3Bot = useTransform(sp, [.39,.43], [0,1]);

  // Cut 5: Decoder
  const c5H = useTransform(sp, [.55,.60], [0,1]);
  const c5Exp = useTransform(sp, [.60,.66], [0,1]);
  const c5Mask = useTransform(sp, [.66,.72], [0,1]);
  const c5Cross = useTransform(sp, [.72,.78], [0,1]);
  const c5FFN = useTransform(sp, [.78,.84], [0,1]);
  const c5Col = useTransform(sp, [.84,.90], [0,1]);

  // ── Refs ──
  const r1 = U({ emb:1, wq:1, wk:1, wv:1, q:1, k:1, v:1 });
  const rP = U({ emb:1, pe:1, enc:1 });
  const r2 = U({ wq:1, wk:1, wv:1, q:1, k:1, v:1 });
  const r3 = U({ h1:1, h2:1, h3:1, h4:1, cat:1 });
  const r4 = U({ enc:1 });
  const r5 = U({ dh1:1, dh2:1, dh3:1, dh4:1, cross:1 });

  // ── Paths ──
  const [paths, setPaths] = useState([]);

  const comp = useCallback(() => {
    if (!cRef.current) return;
    const cr = cRef.current.getBoundingClientRect();
    const p = r => {
      if (!r.current) return null;
      const b = r.current.getBoundingClientRect();
      if (!b.width || !b.height) return null;
      return { cx: b.left-cr.left+b.width/2, t: b.top-cr.top, b: b.bottom-cr.top };
    };
    const cv = (a, b, col) => {
      if (!a||!b) return null;
      const dist = b.t - a.b;
      if (dist < 0) return null; // overlapping elements — skip
      const d = Math.max(dist * 0.45, 15);
      return { d:`M ${a.cx} ${a.b} C ${a.cx} ${a.b+d}, ${b.cx} ${b.t-d}, ${b.cx} ${b.t}`, color: col };
    };

    let ps = [];
    if (cut===1) { const e=p(r1.emb); ps=[cv(e,p(r1.wq),GRAY),cv(e,p(r1.wk),GRAY),cv(e,p(r1.wv),GRAY),cv(p(r1.wq),p(r1.q),Q_C.dk),cv(p(r1.wk),p(r1.k),K_C.dk),cv(p(r1.wv),p(r1.v),V_C.dk)]; }
    else if (cut===2) { const pe=p(rP.pe); ps=[cv(p(rP.emb),pe,GRAY),cv(pe,p(r2.wq),GREEN),cv(pe,p(r2.wk),GREEN),cv(pe,p(r2.wv),GREEN),cv(p(r2.wq),p(r2.q),Q_C.dk),cv(p(r2.wk),p(r2.k),K_C.dk),cv(p(r2.wv),p(r2.v),V_C.dk)]; }
    else if (cut===3) { const pe=p(rP.pe); ps=[cv(pe,p(r3.h1),PURPLE),cv(pe,p(r3.h2),PURPLE),cv(pe,p(r3.h3),PURPLE),cv(pe,p(r3.h4),PURPLE),cv(p(r3.h1),p(r3.cat),'#9ca3af'),cv(p(r3.h2),p(r3.cat),'#9ca3af'),cv(p(r3.h3),p(r3.cat),'#9ca3af'),cv(p(r3.h4),p(r3.cat),'#9ca3af')]; }
    else if (cut===4) { const pe=p(rP.pe); ps=[cv(pe,p(rP.enc),'#6b7280')]; }
    else if (cut===5) { const enc=p(rP.enc); ps=[cv(enc,p(r5.dh1),PURPLE),cv(enc,p(r5.dh2),PURPLE),cv(enc,p(r5.dh3),PURPLE),cv(enc,p(r5.dh4),PURPLE),cv(p(rP.enc),p(r5.cross),'#f59e0b')]; }
    setPaths(ps.filter(Boolean));
  }, [cut]);

  // No setPaths([]) — just replace atomically. No flash.
  useLayoutEffect(comp, [comp]);
  useEffect(() => { window.addEventListener('resize', comp); return () => window.removeEventListener('resize', comp); }, [comp]);

  // SVG opacity: always matches the max visible cut opacity
  const svgOp = useTransform(sp, v => {
    const ops = [
      v <= 0 ? 1 : v <= 0.15 ? 1 : v <= 0.19 ? 1-(v-0.15)/0.04 : 0,                    // c1
      v <= 0.16 ? 0 : v <= 0.19 ? (v-0.16)/0.03 : v <= 0.32 ? 1 : v <= 0.36 ? 1-(v-0.32)/0.04 : 0, // c2
      v <= 0.33 ? 0 : v <= 0.36 ? (v-0.33)/0.03 : v <= 0.44 ? 1 : v <= 0.48 ? 1-(v-0.44)/0.04 : 0, // c3
      v <= 0.45 ? 0 : v <= 0.48 ? (v-0.45)/0.03 : v <= 0.52 ? 1 : v <= 0.56 ? 1-(v-0.52)/0.04 : 0, // c4
      v <= 0.53 ? 0 : v <= 0.56 ? (v-0.53)/0.03 : 1,                                      // c5
    ];
    return Math.max(...ops);
  });

  // ── Tooltip ──
  useEffect(() => { const h=e=>{if(tip&&!e.target.closest('.clk'))setTip(null)}; document.addEventListener('click',h); return()=>document.removeEventListener('click',h); }, [tip]);
  const tt = (e, text) => { e.stopPropagation(); const r=e.currentTarget.getBoundingClientRect(), cr=cRef.current.getBoundingClientRect(); setTip({x:r.right-cr.left+10,y:r.top-cr.top+r.height/2,text}); };

  // ── Scores ──
  const raw = useMemo(() => Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>0.1+(i===j?.7:Math.random()*.3))), []);
  const soft = useMemo(() => raw.map(r=>{const e=r.map(v=>Math.exp(v*8)),s=e.reduce((a,b)=>a+b);return e.map(x=>x/s)}), [raw]);

  // Layout: Emb(20-72) → gap → PE(80-124) → gap → ENC(140-202) → gap → CY/CY5
  const HY = 20, ENC_Y = 140, CY = 210, CY5 = 210;

  return (
    <div ref={sRef} className="relative" style={{ height: '1200vh' }}>
      <div ref={cRef} className="sticky top-0 h-screen w-full overflow-hidden bg-white">

        {/* ── SVG: opacity synced with active cut ── */}
        <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex:1, opacity: svgOp }}>
          <defs>{[['ag',GRAY],['aq',Q_C.dk],['ak',K_C.dk],['av',V_C.dk],['ap',PURPLE],['agn',GREEN],['agy','#9ca3af'],['ao','#f59e0b'],['ad','#6b7280']].map(([id,f])=>(
            <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><polygon points="0,0 10,5 0,10" fill={f}/></marker>
          ))}</defs>
          {paths.map((p,i)=>{const m=p.color===GRAY?'ag':p.color===Q_C.dk?'aq':p.color===K_C.dk?'ak':p.color===V_C.dk?'av':p.color===GREEN?'agn':p.color===PURPLE?'ap':p.color==='#f59e0b'?'ao':p.color==='#9ca3af'?'agy':'ad';
            return <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth="1.5" markerEnd={`url(#${m})`} opacity=".65"/>;
          })}
        </motion.svg>

        {/* ── PERSISTENT: Emb + PE (Cuts 2-5) ── */}
        <motion.div className="absolute flex flex-col items-center" style={{ zIndex:3, top:HY, left:0, right:0, opacity: useTransform(sp,[.18,.20],[0,1]) }}>
          <B ref={rP.emb} l="Embedding" d={`(${N}, ${D})`} w={120} h={40} c="#d1d5db" bg="#f3f4f6" lc="#6b7280" t={tt}/>
          <div className="flex items-center justify-center mt-2" style={{gap:8}}>
            <span style={{fontSize:'.75rem',color:GREEN,fontWeight:700}}>+</span>
            <B ref={rP.pe} l="Positional Encoding" d={`(${N}, ${D})`} w={120} h={32} c="#4ade80" bg="#f0fdf4" lc={GREEN} t={tt}/>
          </div>
        </motion.div>

        {/* ── PERSISTENT: ENCODER block (Cut 4-5) — fade in ── */}
        <motion.div className="absolute flex flex-col items-center" style={{ zIndex:3, top:ENC_Y, left:0, right:0, opacity: useTransform(sp,[.46,.49],[0,1]) }}>
          <B ref={rP.enc} l="ENCODER" d={`(${N}, ${D})`} w={140} h={50} c="#374151" bg="#f9fafb" lc="#111827" t={tt}/>
        </motion.div>

        {/* ═══ CUT 1: No PE ═══ */}
        <motion.div className="absolute flex flex-col items-center" style={{ top:HY, left:0, right:0, zIndex:2, opacity: c1Op, pointerEvents: cut===1?'auto':'none' }}>
          <B ref={r1.emb} l="Embedding" d={`(${N}, ${D})`} w={120} h={40} c="#d1d5db" bg="#f3f4f6" lc="#6b7280" t={tt}/>
          <Sp h={40}/>
          <Row g={80}>
            <B ref={r1.wq} l={<>W<sub>Q</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={Q_C.bdr} bg={Q_C.bg} lc={Q_C.dk} op={.5} t={tt}/>
            <B ref={r1.wk} l={<>W<sub>K</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={K_C.bdr} bg={K_C.bg} lc={K_C.dk} op={.5} t={tt}/>
            <B ref={r1.wv} l={<>W<sub>V</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={V_C.bdr} bg={V_C.bg} lc={V_C.dk} op={.5} t={tt}/>
          </Row>
          <Sp h={40}/>
          <Row g={80}>
            <Col><B ref={r1.q} l="Q" d={`(${N}, ${DK})`} w={60} h={44} c={Q_C.bdr} bg="#fafafa" lc={Q_C.dk} t={tt}/></Col>
            <Col>
              <B ref={r1.k} l="K" d={`(${N}, ${DK})`} w={60} h={44} c={K_C.bdr} bg="#fafafa" lc={K_C.dk} t={tt}/>
              <motion.div className="mt-2" style={{opacity:c1[1]}}><AttnCalc raw={raw} soft={soft} c1={c1} tt={tt}/></motion.div>
            </Col>
            <Col><B ref={r1.v} l="V" d={`(${N}, ${DK})`} w={60} h={44} c={V_C.bdr} bg="#fafafa" lc={V_C.dk} t={tt}/></Col>
          </Row>
          <motion.div className="mt-4" style={{opacity:c1Warn,zIndex:3}}>
            <div style={{border:'1.5px dashed #f87171',borderRadius:8,padding:'8px 20px',backgroundColor:'#fef2f2'}}>
              <span style={{fontSize:'.75rem',color:'#dc2626',fontWeight:600}}>⚠ Position invariant — shuffle tokens, same scores</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══ CUT 2: With PE, single head ═══ */}
        <motion.div className="absolute flex flex-col items-center" style={{ top:CY, left:0, right:0, zIndex:2, opacity: c2Op, pointerEvents: cut===2?'auto':'none' }}>
          <Row g={80}>
            <B ref={r2.wq} l={<>W<sub>Q</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={Q_C.bdr} bg={Q_C.bg} lc={Q_C.dk} op={.5} t={tt}/>
            <B ref={r2.wk} l={<>W<sub>K</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={K_C.bdr} bg={K_C.bg} lc={K_C.dk} op={.5} t={tt}/>
            <B ref={r2.wv} l={<>W<sub>V</sub></>} d={`(${D}, ${DK})`} w={70} h={50} c={V_C.bdr} bg={V_C.bg} lc={V_C.dk} op={.5} t={tt}/>
          </Row>
          <Sp h={30}/>
          <Row g={80}>
            <Col><B ref={r2.q} l="Q" d={`(${N}, ${DK})`} w={60} h={44} c={Q_C.bdr} bg="#fafafa" lc={Q_C.dk} t={tt}/></Col>
            <Col>
              <B ref={r2.k} l="K" d={`(${N}, ${DK})`} w={60} h={44} c={K_C.bdr} bg="#fafafa" lc={K_C.dk} t={tt}/>
              <motion.div className="mt-2" style={{opacity:c2[1]}}><AttnCalc raw={raw} soft={soft} c1={c2} tt={tt}/></motion.div>
              <motion.div className="mt-2" style={{opacity:c2[5]}}>
                <Pill text="+ Embedding"/><div className="mt-1"><B l="LN" d={`(${N}, ${D})`} w={50} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/></div>
                <div className="mt-1"><B l="FFN" d={`(${N},${D})→(${N},${DFF})→(${N},${D})`} w={60} h={28} c="#f59e0b" bg="#fffbeb" lc="#d97706" t={tt}/></div>
                <div className="mt-1"><Pill text="+ Attn Out"/></div>
                <div className="mt-1"><B l="LN" d={`(${N}, ${D})`} w={50} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/></div>
              </motion.div>
            </Col>
            <Col><B ref={r2.v} l="V" d={`(${N}, ${DK})`} w={60} h={44} c={V_C.bdr} bg="#fafafa" lc={V_C.dk} t={tt}/></Col>
          </Row>
        </motion.div>

        {/* ═══ CUT 3: Multi-head encoder ═══ */}
        <motion.div className="absolute flex flex-col items-center" style={{ top:CY, left:0, right:0, zIndex:2, opacity: c3Op, pointerEvents: cut===3?'auto':'none' }}>
          <div className="flex justify-center" style={{gap:24}}>
            {[1,2,3,4].map(i=>(<HeadBox key={i} ref={r3[`h${i}`]} num={i} tt={tt}/>))}
          </div>
          <Sp h={24}/>
          <div className="flex flex-col items-center" style={{gap:8}}>
            <B ref={r3.cat} l="Concat" d={`(${N}, ${DK*4})`} w={100} h={30} c="#6b7280" bg="#f3f4f6" lc="#374151" t={tt}/>
            <B l={<>W<sub>O</sub></>} d={`(${DK*4}, ${D})`} w={80} h={34} c={PURPLE} bg={S_C.bg} lc={S_C.dk} op={.6} t={tt}/>
            <Pill text="+ Embedding"/>
            <B l="LN" d={`(${N}, ${D})`} w={80} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/>
            <B l="FFN" d={`(${N},${D})→(${N},${DFF})→(${N},${D})`} w={70} h={28} c="#f59e0b" bg="#fffbeb" lc="#d97706" t={tt}/>
            <Pill text="+ MH Attn Out"/>
            <B l="LN" d={`(${N}, ${D})`} w={80} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/>
            <B l="Encoder Block Output" d={`(${N}, ${D})`} w={110} h={30} c="#374151" bg="#f3f4f6" lc="#111827" t={tt}/>
          </div>
        </motion.div>

        {/* ═══ CUT 4: Uses persistent ENCODER block above — no extra content ═══ */}
        {/* (Persistent P:ENCODER fades in at 0.46-0.49 which covers Cut 4) */}

        {/* ═══ CUT 5: Decoder ═══ */}
        <motion.div className="absolute flex flex-col items-center" style={{ top:CY5, left:0, right:0, zIndex:2, opacity: c5Op, pointerEvents: cut===5?'auto':'none' }}>

          {/* 4 decoder heads (masked self-attention) */}
          <motion.div className="flex justify-center" style={{gap:24,opacity:c5H}}>
            {[1,2,3,4].map(i=>(<HeadBox key={i} ref={r5[`dh${i}`]} num={i} masked tt={tt}/>))}
          </motion.div>
          <motion.span className="mt-1" style={{fontSize:'.55rem',color:'#9ca3af',opacity:c5H}}>Masked Self-Attention Heads</motion.span>

          <Sp h={16}/>

          {/* Expanded single head with causal mask */}
          <motion.div className="flex flex-col items-center" style={{opacity:c5Exp}}>
            <span style={{fontSize:'.6rem',color:'#6b7280',fontWeight:600,marginBottom:4}}>Head 1 (expanded)</span>
            <Row g={50}>
              <B l="Q" d={`(${N}, ${DK})`} w={40} h={36} c={Q_C.bdr} bg="#fafafa" lc={Q_C.dk} t={tt}/>
              <Col>
                <B l="K" d={`(${N}, ${DK})`} w={40} h={36} c={K_C.bdr} bg="#fafafa" lc={K_C.dk} t={tt}/>
                <div className="mt-1 flex items-center" style={{gap:4}}>
                  <span style={{fontSize:'.5rem',color:Q_C.dk,fontWeight:600}}>Q</span>
                  <span style={{fontSize:'.55rem',color:'#6b7280',fontWeight:700}}>@</span>
                  <span style={{fontSize:'.5rem',color:K_C.dk,fontWeight:600}}>K<sup style={{fontSize:'.35rem'}}>T</sup></span>
                </div>
                {/* Score grid with causal mask */}
                <div className="mt-1"><MaskedScoreGrid raw={raw} maskProgress={c5Mask} tt={tt}/></div>
                <motion.div className="mt-1 flex items-center" style={{gap:6,opacity:c5Mask}}>
                  <Pill text="/√d_k"/>
                  <span style={{fontSize:'.5rem',color:'#9ca3af'}}>→</span>
                  <Pill text="softmax" color={S_C.dk} bg="#f5f3ff" border={S_C.bg}/>
                </motion.div>
              </Col>
              <B l="V" d={`(${N}, ${DK})`} w={40} h={36} c={V_C.bdr} bg="#fafafa" lc={V_C.dk} t={tt}/>
            </Row>
          </motion.div>

          <Sp h={16}/>

          {/* Cross-attention */}
          <motion.div className="flex flex-col items-center" style={{opacity:c5Cross}}>
            <div style={{border:'1.5px solid #f59e0b',borderRadius:8,padding:'10px 20px',backgroundColor:'#fffbeb',textAlign:'center'}}>
              <span style={{fontSize:'.7rem',color:'#d97706',fontWeight:600}}>Cross-Attention</span>
              <div className="mt-1 flex items-center justify-center" style={{gap:8}}>
                <span style={{fontSize:'.55rem',color:'#9ca3af'}}>Q from decoder</span>
                <span style={{fontSize:'.55rem',color:'#d97706',fontWeight:600}}>K,V from ENCODER ↑</span>
              </div>
            </div>
            <B ref={r5.cross} l="" d={`Cross-Attn: (${N}, ${D})`} w={1} h={1} c="transparent" bg="transparent" lc="transparent" t={tt}/>
          </motion.div>

          <Sp h={12}/>

          {/* FFN + output */}
          <motion.div className="flex flex-col items-center" style={{gap:6,opacity:c5FFN}}>
            <Pill text="+ Masked Attn Out"/>
            <B l="LN" d={`(${N}, ${D})`} w={70} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/>
            <B l="FFN" d={`(${N},${D})→(${N},${DFF})→(${N},${D})`} w={60} h={28} c="#f59e0b" bg="#fffbeb" lc="#d97706" t={tt}/>
            <Pill text="+ Cross-Attn Out"/>
            <B l="LN" d={`(${N}, ${D})`} w={70} h={22} c="#d1d5db" bg="#f9fafb" lc="#9ca3af" t={tt}/>
            <B l="Decoder Output" d={`(${N}, ${D})`} w={100} h={30} c="#92400e" bg="#fffbeb" lc="#92400e" t={tt}/>
          </motion.div>

          <Sp h={16}/>

          {/* Collapse to DECODER */}
          <motion.div className="flex flex-col items-center" style={{opacity:c5Col}}>
            <div style={{border:'2px solid #92400e',borderRadius:8,padding:'12px 30px',backgroundColor:'#fffbeb'}}>
              <span style={{fontSize:'.85rem',color:'#92400e',fontWeight:700}}>DECODER</span>
            </div>
            <span className="mt-1" style={{fontSize:'.5rem',color:'#9ca3af'}}>Masked MH Self-Attn + Cross-Attn + FFN × N</span>
          </motion.div>
        </motion.div>

        {/* Tooltip */}
        {tip&&<div style={{position:'absolute',left:tip.x,top:tip.y,transform:'translateY(-50%)',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'6px 14px',fontSize:'.85rem',color:'#374151',whiteSpace:'nowrap',fontWeight:500,boxShadow:'0 2px 8px rgba(0,0,0,.1)',zIndex:100,pointerEvents:'none'}}>{tip.text}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

// Attention calc sub-section (reused in Cut 1 & 2)
function AttnCalc({ raw, soft, c1, tt }) {
  return (
    <div className="flex flex-col items-center" style={{gap:4}}>
      <div className="flex items-center" style={{gap:6}}>
        <span style={{fontSize:'.5rem',color:'#9ca3af'}}>T →</span>
        <div className="clk rounded cursor-pointer" style={{width:55,height:36,border:`1.5px solid ${K_C.bdr}`,borderRadius:4,backgroundColor:K_C.bg,opacity:.4}} onClick={e=>tt(e,`K^T: (${DK}, ${N})`)}/>
      </div>
      <div className="flex items-center" style={{gap:4}}>
        <span style={{fontSize:'.6rem',color:Q_C.dk,fontWeight:600}}>Q</span>
        <span style={{fontSize:'.65rem',color:'#6b7280',fontWeight:700}}>@</span>
        <span style={{fontSize:'.6rem',color:K_C.dk,fontWeight:600}}>K<sup style={{fontSize:'.4rem'}}>T</sup></span>
      </div>
      <motion.div className="flex flex-col items-center" style={{opacity:c1[2]}}>
        <span style={{fontSize:'.55rem',color:S_C.dk,fontWeight:600}}>Scores</span>
        <ScoreGrid raw={raw} soft={soft} gp={c1[2]} scp={c1[3]} sfp={c1[4]} tt={tt}/>
        <span style={{fontSize:'.45rem',color:'#9ca3af'}}>({N},{N})</span>
      </motion.div>
      <motion.div className="flex items-center" style={{gap:8,opacity:c1[3]}}>
        <Pill text={<>/√d<sub>k</sub></>}/>
        <motion.span style={{fontSize:'.55rem',color:'#9ca3af',opacity:c1[4]}}>→</motion.span>
        <motion.div style={{opacity:c1[4]}}><Pill text="softmax" color={S_C.dk} bg="#f5f3ff" border={S_C.bg}/></motion.div>
      </motion.div>
      <motion.div className="flex items-center" style={{gap:6,opacity:c1[5]}}>
        <span style={{fontSize:'.55rem',color:S_C.dk,fontWeight:600}}>W</span>
        <span style={{fontSize:'.65rem',color:'#6b7280',fontWeight:700}}>@</span>
        <span style={{fontSize:'.55rem',color:V_C.dk,fontWeight:600}}>V</span>
        <span style={{fontSize:'.65rem',color:'#6b7280',fontWeight:700}}>=</span>
      </motion.div>
      <motion.div style={{opacity:c1[5]}}>
        <B l="Output" d={`(${N}, ${D})`} w={60} h={40} c="#a78bfa" bg="#faf5ff" lc={S_C.dk} t={tt}/>
      </motion.div>
    </div>
  );
}

function ScoreGrid({ raw, soft, gp, scp, sfp, tt }) {
  const s=10;
  return <motion.div className="clk cursor-pointer" style={{opacity:gp}} onClick={e=>tt(e,`(${N}, ${N})`)}>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${N},${s}px)`,gap:'1px',padding:3,border:`1.5px solid ${S_C.bdr}`,borderRadius:4,backgroundColor:'#faf5ff'}}>
      {raw.flat().map((r,i)=>{const sf2=soft[Math.floor(i/N)][i%N]; return <SCell key={i} r={r} sf={sf2} s={s} scp={scp} sfp={sfp}/>;})}
    </div>
  </motion.div>;
}

function SCell({r,sf,s,scp,sfp}) {
  const op=useTransform([scp,sfp],([sc,sx])=>sx>.5?sf:sc>.5?r*.6:r*.8);
  return <motion.div style={{width:s,height:s,borderRadius:1,backgroundColor:S_C.dk,opacity:op}}/>;
}

function MaskedScoreGrid({ raw, maskProgress, tt }) {
  const s=10;
  return <div className="clk cursor-pointer" onClick={e=>tt(e,`Masked: (${N}, ${N})`)}>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${N},${s}px)`,gap:'1px',padding:3,border:`1.5px solid ${S_C.bdr}`,borderRadius:4,backgroundColor:'#faf5ff'}}>
      {raw.flat().map((r,idx)=>{
        const i=Math.floor(idx/N), j=idx%N;
        const isMasked = j > i; // upper triangle
        return <MaskedCell key={idx} r={r} s={s} masked={isMasked} maskProgress={maskProgress}/>;
      })}
    </div>
  </div>;
}

function MaskedCell({r,s,masked,maskProgress}) {
  const op = useTransform(maskProgress, v => masked ? r*.8*(1-v) : r*.8);
  const bg = useTransform(maskProgress, v => masked && v > .5 ? '#1f2937' : S_C.dk);
  return <motion.div style={{width:s,height:s,borderRadius:1,backgroundColor:bg,opacity:useTransform(maskProgress,v=>masked?(v>.5?.9:r*.8):r*.8)}}/>;
}

// Head box
const HeadBox = forwardRef(function HeadBox({num, masked, tt}, ref) {
  return <div className="flex flex-col items-center" style={{gap:4}}>
    <span style={{fontSize:'.6rem',color:'#6b7280',fontWeight:600}}>Head {num}</span>
    <div ref={ref} className="clk rounded cursor-pointer" style={{width:70,height:80,border:'1.5px solid #a78bfa',backgroundColor:'#faf5ff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:6}}
      onClick={e=>tt(e,`Head ${num}: (${N}, ${DK})${masked?' [masked]':''}`)}>
      <div className="flex" style={{gap:3}}>
        <div style={{width:10,height:10,borderRadius:2,backgroundColor:Q_C.bg}}/>
        <div style={{width:10,height:10,borderRadius:2,backgroundColor:K_C.bg}}/>
        <div style={{width:10,height:10,borderRadius:2,backgroundColor:V_C.bg}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,5px)',gap:'1px'}}>
        {Array.from({length:9},(_,j)=><div key={j} style={{width:5,height:5,borderRadius:1,backgroundColor:S_C.dk,opacity:j%4===0?.7:.2}}/>)}
      </div>
      {masked && <span style={{fontSize:'.4rem',color:'#dc2626',fontWeight:600}}>MASKED</span>}
    </div>
  </div>;
});

// Primitives
const B = forwardRef(function B({l,d,w,h,c,bg,lc,op=1,t},ref) {
  return <div className="flex flex-col items-center" style={{gap:2,zIndex:2}}>
    <span style={{fontSize:'.65rem',color:lc,fontWeight:600,lineHeight:1.2}}>{l}</span>
    <div ref={ref} className="clk rounded cursor-pointer" style={{width:w,height:h,backgroundColor:bg,border:`1.5px solid ${c}`,opacity:op,transition:'box-shadow .15s'}}
      onClick={e=>t(e,d)} onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 0 2px ${c}40`}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}/>
  </div>;
});

function Pill({text,color='#6b7280',bg='#f3f4f6',border='#e5e7eb'}) {
  return <span style={{fontSize:'.55rem',color,fontWeight:600,backgroundColor:bg,padding:'2px 8px',borderRadius:4,border:`1px solid ${border}`,display:'inline-block'}}>{text}</span>;
}
function Sp({h}) { return <div style={{height:h,flexShrink:0}}/>; }
function Row({g,children}) { return <div className="flex justify-center items-start" style={{gap:g,zIndex:2}}>{children}</div>; }
function Col({children}) { return <div className="flex flex-col items-center">{children}</div>; }

// Helpers
function A(sp, ranges) { return ranges.map(([a,b])=>useTransform(sp,[a,b],[0,1])); }
function U(keys) { const r={}; Object.keys(keys).forEach(k=>r[k]=useRef(null)); return r; }
