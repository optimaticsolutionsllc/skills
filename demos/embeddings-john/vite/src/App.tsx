import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { clips, labels, pipelineSteps, queries, quizQuestions, sentences, type Clip, type Vector4 } from './data';
import { rankedClips } from './math';

const chapters = [
  { short: 'What is it?', title: 'Watch an embedding happen', prompt: 'One piece of text in, number card out' },
  { short: 'The problem', title: 'Find the right clip', prompt: 'Why search by meaning?' },
  { short: 'The numbers', title: 'Give words a number card', prompt: 'What is an embedding?' },
  { short: 'The steps', title: 'Watch the work happen', prompt: 'Where do the numbers come from?' },
  { short: 'Try it', title: 'Find a John-style clip', prompt: 'How does the computer compare?' },
  { short: 'Check it', title: 'A match is not proof', prompt: 'What can go wrong?' },
  { short: 'Your work', title: 'Put it to work', prompt: 'How would Rose use it?' },
  { short: 'Quick test', title: 'You do the explaining', prompt: 'Can you teach it back?' },
] as const;

function Icon({ name, size = 22 }: { name: 'arrow' | 'chevron' | 'play' | 'check' | 'search' | 'spark' | 'link' | 'brain' | 'shield'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    play: <path d="m9 6 10 6-10 6V6Z" />,
    check: <path d="m5 12 5 5L20 7" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4.2 4.2" /></>,
    spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-2 2" /><path d="M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l2-2" /></>,
    brain: <><path d="M12 20V4M12 7a4 4 0 1 0-4 5m4-6a4 4 0 1 1 4 6M12 17a4 4 0 1 1-4-5m4 5a4 4 0 1 0 4-5" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Press({ selected, children, onClick, className = '' }: { selected: boolean; children: ReactNode; onClick: () => void; className?: string }) {
  return <button className={`press ${selected ? 'selected' : ''} ${className}`} aria-pressed={selected} type="button" onClick={onClick}>{children}</button>;
}

function Vector({ vector, compact = false }: { vector: Vector4; compact?: boolean }) {
  return <div className={`vector ${compact ? 'compact' : ''}`} aria-label="Four hand-made numbers used to teach how comparisons work">
    {vector.map((v, i) => <div key={labels[i]} className="vector-cell">
      <span className="vector-val">{v.toFixed(2)}</span>
      <span className="vector-label">{labels[i]}</span>
      <div className="vector-track" aria-hidden="true"><span style={{ width: `${Math.round(v * 100)}%` }} /></div>
    </div>)}
  </div>;
}

function DemoNote({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <div className={`callout ${warning ? 'callout-warn' : ''}`}><span className="callout-icon" aria-hidden="true">{warning ? '!' : '↳'}</span><div>{children}</div></div>;
}

function StepTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="chapter-intro"><p className="section-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{children}</p></div>;
}


/**
 * First lesson. All four-number cards are hand-written teaching props, NOT
 * embeddings returned by an AI model. Similarity ranking uses real cosine math.
 */
const labExamples = [
  {label:'Get time back',icon:'⏰',
   question:'How can John help an owner get weekends back?',q:[.97,.12,.07,.04],
   clips:[
    {id:'A',name:'Less work',text:'I stopped sitting in every meeting, so Friday was mine again.',v:[.95,.09,.07,.04],time:'08:20'},
    {id:'B',name:'Better sales',text:'I made a clear offer so the right clients could say yes.',v:[.09,.95,.10,.08],time:'18:12'},
    {id:'C',name:'Client care',text:'I sent a personal welcome note before our first call.',v:[.08,.14,.05,.97],time:'25:05'}]},
  {label:'Find better clients',icon:'🎯',
   question:'How can John help me find the right paying clients?',q:[.11,.97,.10,.05],
   clips:[
    {id:'A',name:'Less work',text:'I stopped sitting in every meeting, so Friday was mine again.',v:[.95,.09,.07,.04],time:'08:20'},
    {id:'B',name:'Better sales',text:'I made a clear offer so the right clients could say yes.',v:[.09,.95,.10,.08],time:'18:12'},
    {id:'C',name:'Client care',text:'I sent a personal welcome note before our first call.',v:[.08,.14,.05,.97],time:'25:05'}]},
  {label:'Care for clients',icon:'🤝',
   question:'How does John make a new client feel welcome?',q:[.06,.12,.05,.99],
   clips:[
    {id:'A',name:'Less work',text:'I stopped sitting in every meeting, so Friday was mine again.',v:[.95,.09,.07,.04],time:'08:20'},
    {id:'B',name:'Better sales',text:'I made a clear offer so the right clients could say yes.',v:[.09,.95,.10,.08],time:'18:12'},
    {id:'C',name:'Client care',text:'I sent a personal welcome note before our first call.',v:[.08,.14,.05,.97],time:'25:05'}]},
] as const;

type DemoNumbers = readonly [number,number,number,number];
function demoSimilarity(a:DemoNumbers,b:DemoNumbers):number {
  const dot=a.reduce((sum,value,i)=>sum+value*b[i],0);
  const lenA=Math.sqrt(a.reduce((sum,v)=>sum+v*v,0));
  const lenB=Math.sqrt(b.reduce((sum,v)=>sum+v*v,0));
  return dot/(lenA*lenB);
}
function TinyCard({nums,plain=false}:{nums:DemoNumbers;plain?:boolean}) {
  return <div className={'tiny-number-card'+(plain?' is-plain':'')} aria-label={'Four practice numbers: '+nums.map(x=>x.toFixed(2)).join(', ')}>
    {nums.map((value,i)=><span className="tiny-num" key={i}><strong>{value.toFixed(2)}</strong><i style={{height:String(Math.round(value*100))+'%'}}/></span>)}
  </div>;
}
function FirstEmbedding() {
  const [example,setExample]=useState(0);
  const [step,setStep]=useState(0);
  const [picked,setPicked]=useState<string|null>(null);
  const [expand,setExpand]=useState(false);
  const item=labExamples[example];
  const results=[...item.clips].map(c=>({...c,similarity:demoSimilarity(item.q,c.v)})).sort((a,b)=>b.similarity-a.similarity);
  function chooseExample(i:number){setExample(i);setStep(0);setPicked(null);}
  const stepDescriptions=[
    <>The words are the <b>input</b>. Rose has three short pieces of a video transcript. Her question uses different words.</>,
    <>An <b>embedding model</b> reads each piece of text and returns a list of numbers. It does not write a post or pick a clip. The app saves the numbers <b>next to the text and video time</b>.</>,
    <>Rose's question goes through <b>the same embedding model</b>. Now her question has a number card too. A fair comparison needs the same model for both sides.</>,
    <>The computer compares Rose's number card with <b>every saved card</b>, puts the closest first, and shows Rose the real words and video time. <b>Rose checks the video.</b></>,
  ];
  return <>
    <StepTitle eyebrow="START HERE · THE PLAIN ANSWER" title="An embedding is a number list made from words">
      You give a trained computer program some text. It gives you a fixed-size list of numbers. An app compares those lists to find text that talks about similar things.
    </StepTitle>
    <div className="definition-banner">
      <div className="definition-mark">Aa <span>→</span> 123</div>
      <div><span className="small-title">IF YOU REMEMBER ONE THING</span><p><strong>Text goes in. Numbers come out.</strong> Those numbers help a computer find similar ideas, even when the words are different.</p></div>
    </div>
    <div className="lesson-grid two lab-analogy">
      <article className="lab-story"><span className="lab-story-icon" aria-hidden="true">📚</span><div><h3>Picture a shelf of notebooks</h3><p>John has hundreds of pages of notes. Rose wants a page about having more free time. She can't remember its exact words. Embeddings help put <strong>similar ideas near each other</strong>, so she knows where to look first.</p></div></article>
      <article className="lab-story"><span className="lab-story-icon" aria-hidden="true">🔎</span><div><h3>Now watch the real job</h3><p>Instead of opening every video, Rose types what she's looking for. The app ranks likely transcript moments. She still checks John's actual recording before posting.</p></div></article>
    </div>
    <div className="lab-workbench">
      <div className="lab-workbench-head">
        <div><span className="small-title">THE CLICK-THROUGH WORKSHOP</span><h3>Make a pretend embedding, then use it.</h3><p>Choose the topic Rose wants. Press the steps in order and watch what changes.</p></div>
        <span className="lab-offline">● Works offline</span>
      </div>
      <div className="lab-topic" role="group" aria-label="Choose one of three practice searches">{labExamples.map((c,i)=><button type="button" key={c.label} className={'lab-topic-button'+(example===i?' current':'')} aria-pressed={example===i} onClick={()=>chooseExample(i)}><span>{c.icon}</span>{c.label}</button>)}</div>
      <div className="lab-stage-nav" aria-label="Steps of making and using an embedding">
        {['1. Read words','2. Make numbers','3. Number the question','4. Find a match'].map((t,i)=><button className={'lab-stage-tab'+(step===i?' current':'')} type="button" key={t} aria-current={step===i?'step':undefined} onClick={()=>{setStep(i);setPicked(null)}}><span className="lab-stage-number">{i+1}</span><span>{t.substring(3)}</span></button>)}
      </div>
      <div className="lab-board" aria-live="polite">
        <div className="lab-narration"><strong>WHAT JUST HAPPENED?</strong><p>{stepDescriptions[step]}</p></div>
        <div className="lab-board-grid">
          <div className="lab-slip-stack">
            <span className="lab-label">JOHN'S VIDEO · PRACTICE TRANSCRIPT</span>
            {item.clips.map(c=><div key={c.id} className={'lab-slip'+(picked===c.id?' lab-picked':'')}><span className="lab-slip-letter">{c.id}</span><div className="lab-slip-content"><strong>“{c.text}”</strong><small>Made-up recording · {c.time}</small></div>{step>=1&&<TinyCard nums={c.v} plain/>}</div>)}
          </div>
          <div className="lab-right-stack">
            <div className="lab-input-box">
              <span className="lab-label">WHAT ROSE ASKS</span>
              <div className="lab-question"><span>⌕</span><strong>“{item.question}”</strong></div>
              {step>=2?<div className="lab-query-card"><span className="lab-label">THE SAME MODEL MAKES 4 DEMO NUMBERS</span><TinyCard nums={item.q}/></div>:<div className="lab-no-card">No number card for this question yet.</div>}
            </div>
            {step===0&&<div className="lab-computer"><span className="lab-computer-icon">🧠</span><div><strong>The model has not run yet.</strong><p>So far, we only have words.</p></div></div>}
            {step===1&&<div className="lab-computer"><span className="lab-computer-icon">🔢</span><div><strong>Three clip cards are made.</strong><p>Same size. Different numbers. Each card stays attached to its own text.</p></div></div>}
            {step===2&&<div className="lab-computer"><span className="lab-computer-icon">🧩</span><div><strong>Now both sides have numbers.</strong><p>We can compare the question with the three clips.</p></div></div>}
            {step===3&&<div className="lab-results"><span className="lab-label">CLOSEST IDEAS FIRST · CLICK A RESULT</span>{results.map((c,i)=><button type="button" key={c.id} className={'lab-hit'+(picked===c.id?' chosen':'')} onClick={()=>setPicked(c.id)}><span className="lab-hit-index">{i+1}</span><span className="lab-hit-body"><strong>Clip {c.id} · {c.name}</strong><span className="lab-meter"><i style={{width:String(Math.round(c.similarity*100))+'%'}}/></span></span><span className="lab-hit-score">{c.similarity.toFixed(2)}<small>match</small></span></button>)}
              <div className="lab-human-check">{picked?<><strong>Rose opens clip {picked} and checks the original.</strong><span>A close score is only a clue. It is not proof that John said something.</span></>:<><strong>Closest is not always correct.</strong><span>Tap a clip to see the final human check.</span></>}</div>
            </div>}
          </div>
        </div>
        <div className="lab-step-controls"><button type="button" className="btn-secondary" disabled={step===0} onClick={()=>{setStep(step-1);setPicked(null)}}>← Back one step</button><span>Step {step+1} of 4</span><button type="button" className="btn-primary" onClick={()=>{setStep((step+1)%4);setPicked(null)}}>{step===3?'Try again':'Next: '+['Make numbers','Number the question','Compare the cards'][step]} <Icon name="arrow" size={16}/></button></div>
      </div>
      <div className="lab-zoom">
        <div className="lab-zoom-top"><div><span className="small-title">LOOK INSIDE THE NUMBER CARD</span><p>We only draw 4 big numbers above, so you can follow along. A real model can make <b>hundreds</b>. The workshop model used 512.</p></div><button type="button" className="lab-zoom-toggle" aria-expanded={expand} onClick={()=>setExpand(!expand)}>{expand?'Hide the 512 boxes':'Show me 512 boxes'} <span>{expand?'−':'+'}</span></button></div>
        {expand&&<><div className="lab-512" aria-label="Illustration of 512 number slots">{Array.from({length:512},(_,i)=><span key={i} style={{opacity:String(.33+(i%13)/21)}}/>)}</div><p className="card-caption">512 slots = 512 separate numbers for one piece of text. The colored squares are just a picture of the size, not real values. These numbers aren't neat labels like “time” or “sales.”</p></>}
      </div>
    </div>
    <div className="lab-remember-grid">
      <div><span>✅</span><h3>What the embedding IS</h3><p>A fixed-size list of numbers made by a trained model from text. The list is used to compare pieces of text.</p></div>
      <div><span>❌</span><h3>What it IS NOT</h3><p>Not John's voice, not a transcript, not a summary, not a finished post, and not a promise that a search result is right.</p></div>
      <div><span>🎬</span><h3>What Rose can actually DO</h3><p>Search John's words by idea, open likely moments faster, check the original, then choose a clip.</p></div>
    </div>
    <DemoNote warning><strong>Accuracy check:</strong> The four numbers and all “John clips” on this screen are hand-made examples. The comparison score uses real math, but <strong>there is no live embedding model and no real John recording in this demo.</strong></DemoNote>
  </>;
}

function Problem() {
  const [mode, setMode] = useState<'exact' | 'meaning' | null>(null);
  const lines = [
    { id: 'A', text: 'I cut useless meetings and got my week back.', topic: 'Time' },
    { id: 'B', text: 'My team can now run daily tasks without me.', topic: 'Systems' },
    { id: 'C', text: 'I sent a kind note to welcome a client.', topic: 'Clients' },
  ];
  return <>
    <StepTitle eyebrow="01 · THE PROBLEM" title="Rose needs the right clip">John has hours of recordings. Rose wants a short moment about getting time back. She doesn't know the exact words John used.</StepTitle>
    <div className="lesson-grid two">
      <div className="lesson-card prompt-card">
        <p className="small-title">WHAT ROSE TYPES</p>
        <p className="hero-quote">“How can I get my Saturdays back?”</p>
        <div className="choice-row vertical">
          <Press selected={mode === 'exact'} onClick={() => setMode('exact')}><span className="choice-emoji">🔤</span> Look for the same words</Press>
          <Press selected={mode === 'meaning'} onClick={() => setMode('meaning')}><span className="choice-emoji">💡</span> Look for the same idea</Press>
        </div>
        <div className="live-message" aria-live="polite">
          {!mode && <><span className="message-dot" /> Pick a button and watch what changes.</>}
          {mode === 'exact' && <><strong>0 clips found.</strong> The word “Saturdays” is missing from every clip.</>}
          {mode === 'meaning' && <><strong>Clip A is a likely match.</strong> “Got my week back” is another way to talk about getting time back.</>}
        </div>
      </div>
      <div className="lesson-card">
        <p className="small-title">THREE MADE-UP CLIPS</p>
        <div className="clip-list">{lines.map(line => <div key={line.id} className={`clip-row ${mode === 'meaning' && line.id === 'A' ? 'is-match' : ''}`}>
          <span className="clip-letter">{line.id}</span><div><p>“{line.text}”</p><span className="clip-topic">{line.topic}</span></div>{mode === 'meaning' && line.id === 'A' && <span className="match-indicator">Idea match ✓</span>}
        </div>)}</div>
      </div>
    </div>
    <DemoNote><strong>A word search finds text.</strong> An embedding search can find a <strong>similar idea</strong> even when the words are different.</DemoNote>
  </>;
}

function NumberCards() {
  const [selected, setSelected] = useState(0);
  return <>
    <StepTitle eyebrow="02 · THE NUMBERS" title="Words become a number card">The computer cannot think about every clip like a person. So a special program turns each piece of text into a list of numbers.</StepTitle>
    <div className="lesson-card conversion-card">
      <div className="conversion-head"><div className="source-bubble"><span>✏️</span><div><small>WORDS GO IN</small><strong>“{sentences[selected].text}”</strong></div></div><span className="conversion-arrow"><Icon name="arrow" size={27} /></span><div className="model-bubble"><Icon name="brain" size={26}/><div><small>THE MODEL WORKS</small><strong>Find patterns in the words</strong></div></div></div>
      <div className="number-result"><div className="number-arrow"><Icon name="arrow" size={23}/><strong>NUMBERS COME OUT</strong></div><Vector vector={sentences[selected].vector}/></div>
      <p className="card-caption">Tap a new sentence. See the numbers change.</p>
      <div className="choice-row">{sentences.map((s, i) => <Press key={s.text} selected={selected === i} onClick={() => setSelected(i)}>{s.text}</Press>)}</div>
    </div>
    <div className="lesson-grid two mini-info">
      <div className="insight"><span className="insight-icon">01</span><div><strong>What is the model?</strong><p>A program that learned how words and ideas are used together. It makes the number list.</p></div></div>
      <div className="insight"><span className="insight-icon">02</span><div><strong>Why so many numbers?</strong><p>Real embeddings use hundreds or more. Each number is part of a pattern, not a simple word label.</p></div></div>
    </div>
    <DemoNote warning><strong>Important:</strong> Our four boxes are a pretend teaching model. “Time,” “Clients,” “Posts,” and “Care” are made-up labels. Real embedding numbers are <strong>not</strong> tidy labels like these. Letz Go used 512 numbers.</DemoNote>
  </>;
}

function Pipeline() {
  const [current, setCurrent] = useState(0);
  return <>
    <StepTitle eyebrow="03 · THE STEPS" title="Watch a video become searchable">The model does not watch a video by itself. First, the app needs written words. Tap each step to see what happens.</StepTitle>
    <div className="pipeline-layout">
      <div className="pipeline-rail" role="group" aria-label="Five pipeline steps">
        {pipelineSteps.map((s, i) => <Press key={s.title} selected={current === i} onClick={() => setCurrent(i)} className="pipeline-press">
          <span className="rail-number">{i + 1}</span><span className="rail-icon">{s.icon}</span><span className="rail-name">{s.short}</span><Icon name="chevron" size={17}/>
        </Press>)}
      </div>
      <div className="lesson-card pipeline-stage" aria-live="polite">
        <span className="stage-big-icon" aria-hidden="true">{pipelineSteps[current].icon}</span>
        <p className="small-title">STEP {current + 1} OF 5</p><h3>{pipelineSteps[current].title.slice(3)}</h3><p>{pipelineSteps[current].description}</p>
        <div className="stage-artifact"><small>WHAT WE KEEP</small><div>{pipelineSteps[current].example ?? [
          'Video: coaching-session.mp4',
          'Text: “I cut useless meetings and got my week back.”',
          'One short section plus its source time',
          'Numbers: [0.027, −0.113, 0.084, …]',
          'Words + numbers + recording + timestamp',
        ][current]}</div></div>
        <div className="inline-step-nav"><button type="button" disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Back</button><button type="button" onClick={() => setCurrent(Math.min(4, current + 1))} disabled={current === 4}>Next step →</button></div>
      </div>
    </div>
    <DemoNote><strong>Keep the source with the numbers.</strong> The numbers help find a clip. The original video and its time help Rose check it.</DemoNote>
  </>;
}

function MeaningMap({ queryIndex, selectedClip, onSelect }: { queryIndex: number; selectedClip: string | null; onSelect: (clip: Clip) => void }) {
  const q = queries[queryIndex];
  return <svg className="meaning-map" viewBox="0 0 420 335" role="img" aria-label="Illustrated meaning map. Use the clip buttons below the map for an accessible selection.">
    <rect width="420" height="335" rx="20" fill="#004C6D" />
    {[
      {x:115,y:96,rx:92,ry:69,c:'#9CC9DC'},
      {x:320,y:98,rx:82,ry:72,c:'#C6DBE8'},
      {x:121,y:263,rx:101,ry:54,c:'#9AA6BE'},
      {x:330,y:255,rx:73,ry:51,c:'#DDE8EF'},
    ].map(g => <ellipse key={g.c} cx={g.x} cy={g.y} rx={g.rx} ry={g.ry} fill={g.c} fillOpacity=".10" stroke={g.c} strokeOpacity=".45" strokeWidth="1.7" strokeDasharray="6 5"/>)}
    <g fontSize="12" fontWeight="750" letterSpacing=".2" fill="#FFFFFF"><text x="55" y="29">Time &amp; systems</text><text x="256" y="29">Clients &amp; sales</text><text x="59" y="207">Marketing</text><text x="286" y="207">Client care</text></g>
    {clips.map(c => <g key={c.id} onClick={() => onSelect(c)} tabIndex={0} role="button" aria-label={`Read clip ${c.id}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(c)}}} className="map-clip">
      {c.id === selectedClip && <circle cx={c.x} cy={c.y} r="20" fill="none" stroke="#FFFFFF" strokeWidth="2.6"/>}
      <circle cx={c.x} cy={c.y} r="14" fill={c.color} stroke="#00354D" strokeWidth="3"/><text x={c.x} y={c.y+4} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" pointerEvents="none">{c.id}</text>
    </g>)}
    <circle cx={q.x} cy={q.y} r="23" stroke="#C8102E" strokeOpacity=".5" fill="#C8102E" fillOpacity=".12" strokeDasharray="3 5"/>
    <rect x={q.x-7} y={q.y-7} width="14" height="14" rx="2" fill="#C8102E" stroke="#004C6D" strokeWidth="1" transform={`rotate(45 ${q.x} ${q.y})`}/>
  </svg>;
}

function Search() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Clip | null>(null);
  const q=queries[index];
  const matches = useMemo(()=>rankedClips(q, clips).slice(0,4),[q]);
  return <>
    <StepTitle eyebrow="04 · TRY IT" title="Now let the numbers search">Rose types an idea. The computer turns her search into a number card too. Then it compares that card with every saved clip.</StepTitle>
    <div className="search-query"><div className="search-icon"><Icon name="search" size={24}/></div><div><small>SEARCH BY MEANING</small><strong>“{q.text}”</strong></div></div>
    <div className="choice-row query-choices">{queries.map((query, i)=><Press key={query.text} selected={index===i} onClick={()=>{setIndex(i);setSelected(null)}}>{query.label}</Press>)}</div>
    <div className="lesson-grid search-layout">
      <div className="lesson-card"><div className="card-header"><span className="small-title">MATCHES</span><span className="subtle-badge">Real math · pretend numbers</span></div>
        <div className="matches">{matches.map(({clip,similarity},i)=><button key={clip.id} type="button" className={`match-row ${selected?.id===clip.id?'active':''}`} onClick={()=>setSelected(clip)}>
          <span className="rank-index">{i+1}</span><span className="match-text"><strong>Clip {clip.id}</strong><span>“{clip.text}”</span><span className="match-track"><i style={{width:`${Math.round(similarity*100)}%`}} /></span></span><span className="match-score">{similarity.toFixed(2)}<small>score</small></span>
        </button>)}</div>
      </div>
      <div className="lesson-card map-card"><div className="card-header"><span className="small-title">THE MEANING MAP</span><span className="subtle-badge">Interactive</span></div><MeaningMap queryIndex={index} selectedClip={selected?.id??null} onSelect={setSelected}/>
        <p className="map-caption"><span className="diamond-icon">◆</span> Yellow = Rose's search. Dots = clips with similar ideas nearby.</p>
        <div className="map-buttons" aria-label="Choose a clip to inspect">{clips.map(c=><button type="button" key={c.id} className={selected?.id===c.id?'active':''} onClick={()=>setSelected(c)}>{c.id}</button>)}</div>
        <div className="clip-detail" aria-live="polite">{selected?<><b>Clip {selected.id}</b><p>“{selected.text}”</p><small>This is made up, not an actual John recording.</small></>:<><b>Pick a clip</b><p>Tap a dot or letter to read it.</p></>}</div>
      </div>
    </div>
    <DemoNote warning><strong>The number scores are practice scores.</strong> I picked the four-number cards by hand. The app runs the real comparison math, but no live model made these numbers. A score is <strong>not</strong> a percent chance the clip is right.</DemoNote>
  </>;
}

function Check() {
  const [choice,setChoice]=useState<'yes'|'no'|null>(null);
  return <>
    <StepTitle eyebrow="05 · CHECK IT" title="A close match can still be wrong">Two clips may use almost the same words but say opposite things. An embedding helps you find possible clips. It doesn't tell you what's true.</StepTitle>
    <div className="lesson-grid two">
      <div className="lesson-card contrast-card"><div className="small-title">TWO CLIPS, OPPOSITE ADVICE</div>
        <div className="contrast"><span className="contrast-label">CLIP ONE</span><p>“<strong>Stop</strong> posting daily if it steals time and brings no clients.”</p></div>
        <div className="contrast"><span className="contrast-label">CLIP TWO</span><p>“Post <strong>every day</strong>, even if it steals your free time.”</p></div>
        <p className="sub-copy">Both clips mention posting and time. But they tell people to do different things.</p>
      </div>
      <div className="lesson-card quiz-card"><div className="small-title">YOUR TURN</div><h3>Can Rose publish a clip just because its numbers match?</h3>
        <div className="choice-row vertical"><Press selected={choice==='yes'} onClick={()=>setChoice('yes')}>Yes. A high score proves it is right.</Press><Press selected={choice==='no'} onClick={()=>setChoice('no')}>No. She checks the video first.</Press></div>
        <div className={`quiz-feedback ${choice==='no'?'is-correct':''}`} aria-live="polite">{choice==='yes'?'Try again. Numbers can bring back the wrong clip.':choice==='no'?'Exactly. The numbers say “look here.” Rose checks what John really said.':'Choose an answer to see why.'}</div>
      </div>
    </div>
    <DemoNote><strong>One rule for your workflow:</strong> search → open recording → check the full story → pick the clip. Do not publish a made-up quote because the number score looks good.</DemoNote>
  </>;
}

function YourWork() {
  const roles=[
    {icon:'🎬',title:'Rose finds the clip',body:'She types “John on working less.” The app finds likely transcript parts. She listens and picks the right moment.'},
    {icon:'🧩',title:'Tim builds the link',body:'He connects each short text part with its number card, video, and time. So Rose can find the original in one click.'},
    {icon:'🗣️',title:'John keeps his real voice',body:'His real words stay attached to the clip. No invented quotes. No guesswork about what he meant.'},
  ];
  return <>
    <StepTitle eyebrow="06 · YOUR WORK" title="This is where it helps you">You are not building an AI just to have AI. You want less time hunting through long recordings and more time making useful posts from real advice.</StepTitle>
    <div className="lesson-grid three">{roles.map(r=><article className="role-card" key={r.title}><span className="role-icon">{r.icon}</span><h3>{r.title}</h3><p>{r.body}</p></article>)}</div>
    <div className="lesson-card work-process"><div className="small-title">THE WHOLE JOB, IN ORDER</div><div className="process-list">{['John speaks','Write down the words','Cut them into short parts','Make and save number cards','Rose types an idea','Compare the cards','Open and check the video'].map((text,i)=><div className="process-step" key={text}><span>{i+1}</span>{text}</div>)}</div></div>
    <div className="big-takeaway"><Icon name="spark" size={29}/><p><strong>The embedding has one small job:</strong> help find text that means something similar. The rest is your workflow.</p></div>
  </>;
}

function Quiz() {
  const [index,setIndex]=useState(0);const [answer,setAnswer]=useState<number|null>(null);const [done,setDone]=useState(false);
  const active=quizQuestions[index];const right=answer===active.correct;
  function next(){if(index===quizQuestions.length-1){setDone(true)}else{setIndex(index+1);setAnswer(null)}}
  return <>
    <StepTitle eyebrow="07 · QUICK TEST" title="Can you teach it back?">You don't need to know the code. You just need to know what each step does and when you should trust it.</StepTitle>
    <div className="lesson-card quiz-main">
      {done?<div className="complete-screen"><span className="completion-mark"><Icon name="check" size={38}/></span><h3>You got it.</h3><p>An embedding is a number card made from text. You compare the cards to find similar ideas. Then you check the real source.</p><button className="btn-primary" type="button" onClick={()=>{setDone(false);setIndex(0);setAnswer(null)}}>Try the questions again <Icon name="arrow" size={17}/></button></div>:<>
        <div className="quiz-top"><span className="small-title">QUESTION {index+1} OF {quizQuestions.length}</span><div className="quiz-progress" aria-hidden="true">{quizQuestions.map((_,i)=><span className={i<=index?'on':''} key={i}/>)}</div></div>
        <h3>{active.question}</h3>
        <div className="choice-row vertical quiz-choices">{active.choices.map((text,i)=><button key={text} type="button" disabled={right} onClick={()=>setAnswer(i)} className={`answer-option ${answer===i?(right?'correct':'incorrect'):''}`}><span className="answer-letter">{String.fromCharCode(65+i)}</span>{text}{answer===i&&right&&<Icon name="check" size={19}/>}</button>)}</div>
        <div className={`quiz-feedback ${right?'is-correct':''}`} aria-live="polite">{answer===null?'Pick the answer you think is right.':right?active.feedback:'Not quite. Have another go.'}</div>
        {right&&<button type="button" onClick={next} className="btn-primary">{index===quizQuestions.length-1?'Finish lesson':'Next question'} <Icon name="arrow" size={17}/></button>}
      </>}
    </div>
  </>;
}

const views=[<FirstEmbedding/>,<Problem/>,<NumberCards/>,<Pipeline/>,<Search/>,<Check/>,<YourWork/>,<Quiz/>];

type Theme = 'light' | 'dark';
function initialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem('embeddings-by-doing-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Storage can be disabled in a private browser. */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0D1724' : '#FAF9F5');
    try {
      window.localStorage.setItem('embeddings-by-doing-theme', theme);
    } catch { /* Still usable if storage is blocked. */ }
  }, [theme]);

  const [chapter,setChapter]=useState(0);const [visited,setVisited]=useState<ReadonlySet<number>>(new Set([0]));
  function change(next:number){if(next<0||next>=chapters.length)return;setChapter(next);setVisited(old=>new Set([...old,next]));window.scrollTo({top:0,behavior:'instant'});}
  const active=chapters[chapter];
  return <div className="app-shell">
    <a className="skip-link" href="#lesson-content">Skip to lesson</a>
    <header className="topbar"><div className="site-container topbar-inner"><div className="brandmark"><span className="brand-orbit">✳</span><div><strong>HAPPIER WORK <span className="brand-slash">/</span> LEARNING LAB</strong><small>A Rose + Tim practice tool</small></div></div><div className="topbar-controls">
      <div className="theme-toggle" role="group" aria-label="Color theme">
        <button type="button" aria-label="Use light mode" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}><span aria-hidden="true">☀</span> Light</button>
        <button type="button" aria-label="Use dark mode" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}><span aria-hidden="true">☾</span> Dark</button>
      </div>
      <span className="topbar-right"><span className="status-dot"/>Works without the workshop API</span>
    </div></div></header>
    <div className="site-container main-layout">
      <aside className="sidebar" aria-label="Lesson outline"><div className="sidebar-sticky"><div className="course-card"><span className="course-kicker">GUIDED LESSON</span><h1>Make an<br/><em>embedding.</em></h1><p>Text in. Numbers out. Similar ideas found.</p><div className="course-line"><Icon name="play" size={16}/> About 12 minutes</div></div>
        <div className="course-nav-title">YOUR PATH <span>{chapter+1} / {chapters.length}</span></div>
        <nav className="chapter-nav">{chapters.map((c,i)=><button type="button" key={c.short} onClick={()=>change(i)} aria-current={chapter===i?'step':undefined} className={`chapter-link ${chapter===i?'active':''}`}><span className="chapter-index">{visited.has(i)&&i<chapter?<Icon name="check" size={15}/>:String(i+1).padStart(2,'0')}</span><span><strong>{c.short}</strong><small>{c.prompt}</small></span>{chapter===i&&<Icon name="chevron" size={18}/>}</button>)}</nav>
        <p className="sidebar-footnote">Inspired by the calm, useful business systems John teaches. Not an official John brand product.</p>
      </div></aside>
      <main className="content" id="lesson-content">
        <section className="hero-banner" aria-label="Lesson introduction"><div><span className="hero-kicker">THE PLAIN ANSWER, BUILT TO PRACTICE</span><h2>Find the <em>meaning.</em><br/>Keep the <em>proof.</em></h2><p>Using the kind of clips Rose searches for in John's recordings.</p><div className="hero-pills"><span>✳ No tech skills needed</span><span>✳ Try every step</span></div></div><div className="hero-art" aria-hidden="true"><span className="art-word word-a">“Less busy”</span><span className="art-word word-b">“More free time”</span><span className="art-vector">[ 0.96 · 0.11 · … ]</span><span className="art-dot dot-a"/><span className="art-dot dot-b"/><span className="art-dot dot-c"/><svg viewBox="0 0 300 260" preserveAspectRatio="none"><path d="M62 93 Q152 36 233 138" stroke="#007EA8" strokeDasharray="5 9" strokeWidth="2" fill="none"/><path d="M55 173 Q145 230 233 138" stroke="#9AA6BE" strokeDasharray="4 10" strokeWidth="2" fill="none"/></svg></div></section>
        <div className="chapter-topline"><span className="chapter-name">LESSON {String(chapter+1).padStart(2,'0')} <span> / {active.short.toUpperCase()}</span></span><span className="demo-label"><Icon name="shield" size={15}/> Safe practice data</span></div>
        <div key={chapter} className="lesson-view">{views[chapter]}</div>
        <div className="lesson-actions"><button type="button" onClick={()=>change(chapter-1)} disabled={chapter===0} className="btn-secondary">← Previous</button><div className="action-progress">{chapters.map((_,i)=><span className={i===chapter?'active':visited.has(i)?'seen':''} key={i}/>)}</div>{chapter<chapters.length-1?<button type="button" className="btn-primary" onClick={()=>change(chapter+1)}>Next: {chapters[chapter+1].short} <Icon name="arrow" size={17}/></button>:<button type="button" className="btn-primary" onClick={()=>change(0)}>Back to start <Icon name="arrow" size={17}/></button>}</div>
        <footer className="foot"><p><strong>Made for learning.</strong> Practice clips, numbers, timestamps, and map dots are invented examples, not John's actual recordings. Comparison math is real; the 4-number cards are not live embeddings.</p><p>Inspired by <a href="https://www.johnjdmunn.com/" target="_blank" rel="noreferrer">John J D Munn's</a> focus on time, systems, and happier work. No login or live embedding service required.</p></footer>
      </main>
    </div>
  </div>;
}