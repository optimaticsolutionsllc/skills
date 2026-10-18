import { useMemo, useState } from 'react';
import './advanced.css';

type Modality = 'text' | 'image' | 'audio' | 'video';
const MODES: {id:Modality; icon:string; label:string; question:string; sees:string; misses:string; example:string}[] = [
 {id:'text',icon:'✎',label:'Words',question:'Find John explaining why owners are busy',sees:'What the transcript says, even in different words',misses:'A smile, hand gesture, laugh, or chart that was never spoken',example:'“I removed three meetings and got Friday back.”'},
 {id:'image',icon:'▣',label:'Images',question:'Find a frame where John is smiling',sees:'A single still frame: face appearance, objects, slides, expression cues',misses:'What was said before the frame; motion and tone of voice',example:'A still image shows John smiling at a client.'},
 {id:'audio',icon:'♫',label:'Sound',question:'Find a moment with applause or laughter',sees:'Sound patterns: laughter, speech delivery, applause, pauses',misses:'A whiteboard, a slide, or a smile that makes no sound',example:'Client laughs after hearing a new way to price the offer.'},
 {id:'video',icon:'▤',label:'Moving video',question:'Find John drawing a framework on screen',sees:'How frames change over time; a gesture, action, or sequence',misses:'Precise wording may still need a transcript and review',example:'John draws a box, adds an arrow, then points at a result.'}
];

function ModePicture({kind}: {kind:Modality}) {
 if(kind==='text')return <div className="adv-paper"><span>RECORDED WORDS · 12:40</span><p>“We changed the process and I got my Fridays back.”</p><div className="adv-underlining"><i/><i/><i/></div></div>;
 if(kind==='audio')return <div className="adv-audio-art" aria-label="Illustrative audio waveform">
   <div className="adv-wave">{Array.from({length:40},(_,i)=><span key={i} style={{height:String(16+Math.abs(Math.sin(i*.75)+Math.sin(i*1.91))*34)+'%'}}/>)}</div><div>▶︎ <strong>“That changes everything!”</strong> <span>laughter</span></div></div>;
 if(kind==='image')return <div className="adv-scene adv-image-art"><div className="adv-head">☺</div><div className="adv-shoulders"/><span className="adv-photo-tag">ONE FRAME · 12:41</span></div>;
 return <div className="adv-video-strip">{['12:41','12:42','12:43'].map((t,i)=><div className="adv-mini-frame" key={t}><span className="adv-stickhead">☺</span><span className={'adv-arm adv-arm-'+i}/><small>{t}</small></div>)}</div>;
}

export function MediaTypes() {
 const [mode,setMode]=useState<Modality>('text');
 const [cross,setCross]=useState<'shared'|'separate'>('shared');
 const m=MODES.find(x=>x.id===mode)!;
 return <div className="adv-view">
 <div className="adv-intro"><span className="adv-eyebrow">LEVEL 2 · 01 / UNDERSTAND THE MEDIA</span><h2>One recording. Four different ways to search.</h2><p>A video can contain pictures, moving scenes, sounds, and spoken words. <strong>Each source can tell you something different.</strong> Pick a type below and see what a model can notice.</p></div>
 <div className="adv-mode-tabs" role="group" aria-label="Choose which kind of media to explore">{MODES.map(x=><button type="button" key={x.id} aria-pressed={mode===x.id} className={mode===x.id?'on':''} onClick={()=>setMode(x.id)}><span>{x.icon}</span>{x.label}</button>)}</div>
 <div className="adv-media-stage">
   <div><span className="adv-small-heading">WHAT THE MODEL IS GIVEN</span><ModePicture kind={mode}/><p className="adv-picture-label">{m.example}</p></div>
   <div className="adv-center-flow" aria-hidden="true"><span>↓</span><div>Embedding<br/>model</div><span>↓</span><div className="adv-vectors">{[.43,.91,.18,.62,.77,.24,.86,.52].map((v,i)=><span key={i} style={{height:String(18+v*56)+'px'}}/>)}</div><small>Number list</small></div>
   <div className="adv-media-answer"><span className="adv-small-heading">ROSE ASKS</span><h3>{m.question}</h3><div className="adv-yes"><strong>Can help find</strong><p>{m.sees}</p></div><div className="adv-no"><strong>Can miss</strong><p>{m.misses}</p></div></div>
 </div>
 <div className="adv-two-col">
   <div className="adv-panel"><h3>Do the numbers work across types?</h3><p>Not always. Two models might each make 768 numbers, but that <strong>does not</strong> mean you can compare them.</p>
   <div className="adv-choice" role="group" aria-label="Choose embedding model setup"><button type="button" className={cross==='separate'?'on':''} aria-pressed={cross==='separate'} onClick={()=>setCross('separate')}>Different models</button><button type="button" className={cross==='shared'?'on':''} aria-pressed={cross==='shared'} onClick={()=>setCross('shared')}>One shared model</button></div>
   <div className="adv-comparison" aria-live="polite">{cross==='separate'?<><div><b>Text model</b><span className="adv-chip-row"><i/><i/><i/><i/></span></div><div><b>Image model</b><span className="adv-chip-row diff"><i/><i/><i/><i/></span></div><p><strong>Different rulers.</strong> Don't mix these lists without a tested cross-modal bridge or aligned model.</p></>:<><div><b>Text query</b><span className="adv-chip-row"><i/><i/><i/><i/></span></div><div><b>Video clip</b><span className="adv-chip-row"><i/><i/><i/><i/></span></div><p><strong>Same ruler.</strong> A unified multimodal model can compare different media types in a shared space.</p></>}</div></div>
   <div className="adv-panel adv-info-panel"><h3>A smile is not in a transcript</h3><p>Ask “Find John smiling.” A text-only search may miss it because nobody <em>said</em> “smiling.”</p><p>Visual search can surface frames that look like smiles. It still needs a person to review the real video, especially if faces are small or partly hidden.</p><div className="adv-callout">Important: an embedding helps retrieve a likely moment. It does <strong>not</strong> prove a client's outcome or accurately measure someone's feelings.</div></div>
 </div>
 <div className="adv-disclaimer">Illustrations and vector bars on this page are teaching visuals, not actual model outputs or John footage.</div>
 </div>;
}

const MOMENTS=[
 {time:'00:04:10–00:04:38',title:'The client asks',spoken:'Client: I work every weekend. How do I stop?',asr:'Client: I walk every weekend. How do I shop?',visual:'Client speaks; John listens and nods',sound:'Normal conversational speech',tags:['question','owner pain'],kind:'question'},
 {time:'00:04:39–00:05:22',title:'John explains a system',spoken:'John: Stop approving every small thing. Give the team clear rules.',asr:'John: Stop approving every small thing. Give the team clear rules.',visual:'John points at three boxes on a whiteboard',sound:'Calm explanation; pauses between steps',tags:['framework','delegation','systems'],kind:'framework'},
 {time:'00:05:23–00:05:42',title:'The reaction',spoken:'Client: I think that would give me Friday back.',asr:'Client: I think that would give me Friday back.',visual:'John smiles as the client laughs',sound:'Short laugh; positive reaction',tags:['reaction','smile','laugh'],kind:'reaction'},
 {time:'00:05:43–00:06:15',title:'John gives the next step',spoken:'John: Write the five decisions your team can make without you.',asr:'John: Write the five decisions your team can make without you.',visual:'John writes five decisions on the board',sound:'Instruction; pen noise',tags:['action','framework','whiteboard'],kind:'action'}
] as const;
type Track = 'words'|'frames'|'sound'|'combined';

export function RecordingRoom() {
 const [moment,setMoment]=useState(0);
 const [track,setTrack]=useState<Track>('combined');
 const [corrected,setCorrected]=useState(false);
 const [query,setQuery]=useState<'smile'|'framework'|'weekends'>('smile');
 const [visual,setVisual]=useState(false);
 const current=MOMENTS[moment];
 const target=query==='smile'?2:query==='framework'?1:0;
 return <div className="adv-view">
 <div className="adv-intro"><span className="adv-eyebrow">LEVEL 2 · 02 / THE REAL RECORDING</span><h2>Don't index just the transcript. Keep the whole moment.</h2><p>One made-up coaching call contains four useful moments. Tap a timestamp and switch between what was <strong>said, seen, and heard.</strong></p></div>
 <div className="adv-recording-head"><div><b>DEMO CALL 024</b><p>“Getting Friday Back” · Simulated coaching Q&amp;A</p></div><span>00:04:10 → 00:06:15</span></div>
 <div className="adv-moment-track" role="group" aria-label="Select a timestamped moment">{MOMENTS.map((m,i)=><button type="button" key={m.time} className={moment===i?'active':''} aria-pressed={moment===i} onClick={()=>setMoment(i)}><small>{m.time.slice(0,8)}</small><span>{m.title}</span></button>)}</div>
 <div className="adv-recording-layout"><div className="adv-panel"><div className="adv-videoplayer"><div className="adv-stage-mark">DEMO · NOT REAL FOOTAGE</div><div className="adv-stage-people"><span className="adv-stage-person">◯<small>CLIENT</small></span><span className="adv-stage-board">▢ <span>→</span> ▢<br/>▤ ▤ ▤</span><span className="adv-stage-person">◯<small>JOHN</small></span></div><div className="adv-player-time">{current.time}</div></div><div className="adv-choice" role="group" aria-label="Inspect media track">{(['combined','words','frames','sound'] as Track[]).map(t=><button key={t} type="button" aria-pressed={track===t} className={track===t?'on':''} onClick={()=>setTrack(t)}>{({combined:'All',words:'Words',frames:'Frames',sound:'Audio'})[t]}</button>)}</div>
   {(track==='combined'||track==='words')&&<div className="adv-media-detail"><strong>WORDS · TRANSCRIPT</strong><p>{corrected?current.spoken:current.asr}</p>{moment===0&&<div className="adv-transcript-issue">{corrected?'✓ Corrected text is saved as a reviewed version. The raw text is preserved.':'⚠ Speech-to-text got two words wrong.'}</div>}</div>}
   {(track==='combined'||track==='frames')&&<div className="adv-media-detail"><strong>PICTURES · VIDEO FRAMES</strong><p>{current.visual}</p></div>}
   {(track==='combined'||track==='sound')&&<div className="adv-media-detail"><strong>SOUND · AUDIO</strong><p>{current.sound}</p></div>}
   </div><div className="adv-panel"><span className="adv-small-heading">ONE MOMENT, ONE ID, MANY SEARCH TOOLS</span><h3>{current.title}</h3><p>Source <strong>demo-call-024</strong>, time <strong>{current.time}</strong>.</p><div className="adv-entitymap"><div>Original video</div><span>↓</span><div>Moment ID: demo-024-m0{moment+1}</div><span>↓</span><div className="adv-three-tags"><b>Text index</b><b>Image index</b><b>Audio / video index</b></div></div><p className="adv-muted">Every search result should return this same source ID and start/end time so Rose can get back to the real moment.</p>{moment===0&&<button type="button" className="btn-primary" onClick={()=>setCorrected(v=>!v)}>{corrected?'Show raw ASR error':'Correct transcript for searching'}</button>}</div></div>
 <div className="adv-panel adv-search-visual"><h3>Try a search that text alone cannot solve</h3><div className="adv-choice adv-search-queries" role="group" aria-label="Choose what Rose needs">{([{id:'smile',label:'John smiling'},{id:'framework',label:'Drawing a framework'},{id:'weekends',label:'Client stuck working weekends'}] as const).map(q=><button type="button" key={q.id} className={query===q.id?'on':''} aria-pressed={query===q.id} onClick={()=>setQuery(q.id)}>{q.label}</button>)}</div>
 <div className="adv-search-outcome"><div><span className="adv-small-heading">TEXT ONLY</span><strong>{query==='smile'?'Cannot reliably find a silent smile':query==='framework'?'May locate speech about the method, not drawing':"Might find 'weekend' but miss 'walk'/'work' ASR mistake"}</strong><small>{query==='weekends'&&!corrected?'ASR still contains a damaging error.':'Text search sees words, not the full event.'}</small></div><div><span className="adv-small-heading">WITH THE RIGHT EXTRA INDEX</span><strong>{visual?'Likely candidate: '+MOMENTS[target].title:'Run a targeted multimodal search'}</strong><small>{visual?'Go to '+MOMENTS[target].time+' and verify the original.':'Sample frames and/or audio, then compare.'}</small><button type="button" className="btn-secondary" onClick={()=>{setVisual(true);setMoment(target)}}>Find matching moment →</button></div></div></div>
 <div className="adv-callout"><strong>Better than indexing every frame:</strong> Start with the transcript and coarse visual samples (for example, one frame every 10 seconds), then inspect more frames only around promising moments. Keep timestamps and review rights. A one-frame sample can still miss a quick smile.</div>
 <div className="adv-disclaimer">Everything in the sample call is invented. The “find” result is a scripted illustration, not a live media embedding or face-analysis result.</div>
 </div>;
}

type QualityItem={id:string;bad:string;good:string;issue:string;why:string};
const REPAIR:QualityItem[]=[
 {id:'01',bad:'final_john_EDIT_new.mp4',good:'source: demo-call-024 | segment: m03 | 05:23–05:42 | version: raw-v1',issue:'File name cannot tell which call or time it came from',why:'A system needs a stable ID, not just a file name.'},
 {id:'02',bad:'Client was happy. Great success story.',good:'speaker: client | claim: “I think that would give me Friday back” | status: unverified',issue:'An assumption was saved as proven client success',why:'Separate a client's hope from an outcome that was actually measured.'},
 {id:'03',bad:'Video = complete transcript.txt',good:'video: source.mp4 | audio: source.wav | raw_asr: v1 | corrected: v2 | frame_samples: /frames/',issue:'One transcript hides the audio, video, and corrections',why:'Keep media as separate linked assets so each can be searched and checked.'}
];
export function LabelLab(){
 const [fixed,setFixed]=useState<string[]>([]);
 const [showSchema,setShowSchema]=useState(false);
 return <div className="adv-view"><div className="adv-intro"><span className="adv-eyebrow">LEVEL 2 · 03 / DATA HYGIENE</span><h2>Bad labels can hide a great clip.</h2><p>Embeddings cannot repair a missing video, missing timestamps, or made-up proof. <strong>Before choosing a bigger model, fix how the files point to each other.</strong></p></div>
 <div className="adv-panel"><div className="adv-row-between"><h3>Find and repair three common mistakes</h3><span className="adv-counter">{fixed.length} / 3 repaired</span></div><div className="adv-repair-list">{REPAIR.map(r=><div className="adv-repair" key={r.id}><span className="adv-index">#{r.id}</span><div><strong>{r.issue}</strong><code className="adv-badlabel">{r.bad}</code>{fixed.includes(r.id)&&<><code className="adv-goodlabel">{r.good}</code><p>{r.why}</p></>}</div><button type="button" className={fixed.includes(r.id)?'adv-fixed':'btn-primary'} onClick={()=>setFixed(v=>v.includes(r.id)?v.filter(id=>id!==r.id):[...v,r.id])}>{fixed.includes(r.id)?'✓ Fixed':'Repair →'}</button></div>)}</div><div className={fixed.length===3?'adv-success':'adv-muted'} aria-live="polite">{fixed.length===3?'You repaired all three examples. Next: use one shared ID to join source → moment → clip → post → results.':'Each repair reveals the information the system should actually save.'}</div></div>
 <div className="adv-label-line"><span>ONE ORIGINAL CALL</span><i>→</i><span>STORY / SEGMENT</span><i>→</i><span>CLIP</span><i>→</i><span>POST</span><i>→</i><span>90-DAY RESULTS</span></div>
 <div className="adv-panel"><div className="adv-row-between"><div><h3>What should one searchable moment record contain?</h3><p>The record is small. It points at bigger files; it does not duplicate every video.</p></div><button type="button" className="btn-secondary" onClick={()=>setShowSchema(v=>!v)} aria-expanded={showSchema}>{showSchema?'Hide example':'Show record example'}</button></div>
 {showSchema&&<pre className="adv-schema">{'{\n  "moment_id": "demo-024-m03",\n  "recording_id": "demo-call-024",\n  "start_ms": 323000,\n  "end_ms": 342000,\n  "speaker_ids": ["john", "client-a"],\n  "raw_transcript_uri": "demo/raw-asr.json",\n  "corrected_text": "I think that gives me Friday back.",\n  "transcript_status": "human-reviewed",\n  "video_uri": "demo/source.mp4",\n  "audio_uri": "demo/source.wav",\n  "frame_samples": ["demo/05-30.jpg"],\n  "text_model": "model-and-version",\n  "visual_model": "model-and-version",\n  "consent_status": "review-needed",\n  "claim_status": "unverified",\n  "clip_ids": ["clip-071"],\n  "post_ids": ["post-042"]\n}'}</pre>}
 <div className="adv-steps-grid">{[{n:'01',t:'Ingest',d:'Inventory source, dedupe, hash, access rules'},{n:'02',t:'Align',d:'Correct ASR, diarize, attach time ranges'},{n:'03',t:'Understand',d:'Embed text; sample frames; add audio/video as needed'},{n:'04',t:'Retrieve',d:'Filter by person, topic, rights, proof, media'},{n:'05',t:'Learn',d:'Join published posts to 90-day performance data'}].map(x=><div key={x.n}><small>{x.n}</small><strong>{x.t}</strong><p>{x.d}</p></div>)}</div></div>
 <div className="adv-callout"><strong>Guardrails:</strong> preserve original recordings and raw ASR; use reviewed corrections; record who said what; ask permission before publishing client identities or stories; restrict sensitive coaching files to approved users. A search hit is not a publish approval.</div>
 </div>;
}

type ExamplePost={id:string;topic:string;format:string;impressions:number;saves:number;comments:number;clicks:number;leads:number;approved:boolean;moment:string;look:string};
const POSTS:ExamplePost[]=[
 {id:'P-101',topic:'Pricing objection',format:'Live Q&A',impressions:12400,saves:146,comments:53,clicks:76,leads:9,approved:true,moment:'John answers a real client pricing question',look:'Live answer · face + explanation'},
 {id:'P-102',topic:'Quick motivation',format:'Quote card',impressions:28600,saves:38,comments:17,clicks:24,leads:1,approved:true,moment:'Short motivational excerpt',look:'Text graphic'},
 {id:'P-103',topic:'Owner delegation',format:'Workshop clip',impressions:8800,saves:112,comments:36,clicks:61,leads:7,approved:true,moment:'John draws a delegation framework',look:'Whiteboard · step-by-step'},
 {id:'P-104',topic:'Client breakthrough',format:'Case story',impressions:6400,saves:89,comments:44,clicks:45,leads:8,approved:false,moment:'Client discusses a possible result; approval missing',look:'Live client conversation'}
];
export function ContentFinder(){
 const [goal,setGoal]=useState<'attention'|'leads'|'saves'>('leads');
 const [topic,setTopic]=useState('all');
 const [showOnlyVerified,setVerified]=useState(true);
 const ranked=useMemo(()=>POSTS.filter(p=>(topic==='all'||p.topic===topic)&&(!showOnlyVerified||p.approved)).sort((a,b)=>goal==='attention'?b.impressions-a.impressions:goal==='saves'?b.saves/b.impressions-a.saves/a.impressions:b.leads/b.impressions-a.leads/a.impressions),[goal,topic,showOnlyVerified]);
 const best=ranked[0];
 return <div className="adv-view"><div className="adv-intro"><span className="adv-eyebrow">LEVEL 2 · 04 / CONTENT STRATEGY</span><h2>Start with what worked. Then find more proof.</h2><p>Rose reviews the past 90 days, picks a theme that actually helped the business, then retrieves <strong>new moments that show John's expertise in action.</strong> Try changing the goal.</p></div>
 <div className="adv-metric-controls"><div><label htmlFor="adv-goal">WHAT ARE WE TRYING TO IMPROVE?</label><select id="adv-goal" value={goal} onChange={e=>setGoal(e.target.value as typeof goal)}><option value="leads">Leads per 1,000 impressions</option><option value="saves">Saves per 1,000 impressions</option><option value="attention">Total impressions</option></select></div><div><label htmlFor="adv-topic">TOPIC</label><select id="adv-topic" value={topic} onChange={e=>setTopic(e.target.value)}><option value="all">All topics</option>{POSTS.map(p=><option key={p.id} value={p.topic}>{p.topic}</option>)}</select></div><label className="adv-checkbox"><input type="checkbox" checked={showOnlyVerified} onChange={e=>setVerified(e.target.checked)}/> Approved examples only</label></div>
 <div className="adv-panel"><div className="adv-row-between"><h3>Last 90 days · practice performance</h3><span className="adv-count-tag">Simulated dataset</span></div><div className="adv-posts">{ranked.length?ranked.map((p,i)=><div className="adv-post" key={p.id}><span className="adv-rank">{i+1}</span><div><strong>{p.topic}</strong><small>{p.format} · {p.approved?'Approval recorded':'Review needed'}</small><div className="adv-post-meta"><span>{p.impressions.toLocaleString()} impressions</span><span>{p.saves} saves</span><span>{p.leads} attributed leads</span></div></div><div className="adv-post-score"><b>{goal==='attention'?p.impressions.toLocaleString():((goal==='leads'?p.leads:p.saves)/p.impressions*1000).toFixed(2)}</b><small>{goal==='attention'?'views':goal+' / 1k'}</small></div></div>):<p>No posts match these filters. Try a different topic or approval setting.</p>}</div></div>
 {best&&<div className="adv-finder-next"><div><span className="adv-small-heading">YOUR NEXT SEARCH</span><h3>Find another {best.format.toLowerCase()} about {best.topic.toLowerCase()}.</h3><p>Search John's indexed conversations for related <strong>questions, clear answers, frameworks, and observable client reactions.</strong> Filter by visual format and permission, then open the original moment.</p><div className="adv-search-pill">⌕ “John explains {best.topic.toLowerCase()} to a client in a live conversation”</div></div><div className="adv-finder-result"><b>USEFUL MOMENT LOOKS LIKE</b><div className="adv-mock-thumbnail"><span>▶</span></div><p>{best.moment}</p><small>{best.look} · Retrieve source before publishing</small></div></div>}
 <div className="adv-two-col"><div className="adv-panel"><h3>Why not copy the biggest post?</h3><p>A post with 28,600 impressions may generate fewer qualified leads than a teaching clip with 12,400. Views, saves, clicks, booked calls, and paid conversions answer <strong>different questions</strong>.</p></div><div className="adv-panel"><h3>The MoreMozi-inspired test</h3><p>Test live answers and workshop Q&amp;A against current formats. Measure attributable leads and conversions, not only views. Keep post format, topic, channel, date, and source clip tied together.</p></div></div>
 <div className="adv-disclaimer">All metrics and post results above are fictional. No John analytics were read or imported. “Attributed leads” are placeholders, not proven conversions. Adjust measurement for attribution windows, spend, audience, and consent.</div>
 </div>;
}

type ModelInfo={name:string;role:string;types:string;trade:string;link:string};
const MODELS:ModelInfo[]=[
 {name:'OpenAI text-embedding-3-small',role:'Low-cost transcript search',types:'Text only',trade:'Very cheap to embed words. Cannot find a silent smile.',link:'https://developers.openai.com/api/docs/models/text-embedding-3-small'},
 {name:'Gemini Embedding 2',role:'One shared multimodal search',types:'Text + image + audio + video + PDF',trade:'Convenient cross-modal pilot. Visual and audio inputs cost more than text.',link:'https://ai.google.dev/gemini-api/docs/models/gemini-embedding-2'},
 {name:'Qwen3-VL-Embedding-2B',role:'Local visual/video pilot',types:'Text + image + video',trade:'Open model: no per-call API charge. Compute and integration are your responsibility; not native audio.',link:'https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B'},
 {name:'Twelve Labs Marengo 3.5',role:'Video-first search',types:'Text + image + audio + video',trade:'Specialized video retrieval. Benchmark quality and total metered media cost.',link:'https://docs.twelvelabs.io/docs/guides/create-embeddings/at-scale/video'}
];
export function ModelAndCost(){
 const [hours,setHours]=useState(100);
 const [sampleEvery,setSampleEvery]=useState(10);
 const [audioPercent,setAudioPercent]=useState(10);
 const [modelChoice,setModelChoice]=useState(1);
 const frames=hours*3600/sampleEvery;
 const imageCost=frames*.00012;
 const videoFrameCost=frames*.00079;
 const audioCost=hours*3600*(audioPercent/100)*.00016;
 const textEstimate=hours*12000/1e6*.02; // explicit assumption; ~200 text tokens/min
 const usd=(n:number)=>'$'+n.toFixed(n<1?3:2);
 return <div className="adv-view"><div className="adv-intro"><span className="adv-eyebrow">LEVEL 2 · 05 / MODELS & BUDGET</span><h2>Which model should we try first?</h2><p>Don't re-embed thousands of recordings before you know what “a good result” looks like. Start with 20–30 calls and a list of searches that Rose actually needs.</p></div>
 <div className="adv-model-grid">{MODELS.map((m,i)=><button type="button" key={m.name} className={'adv-model-card'+(modelChoice===i?' active':'')} aria-pressed={modelChoice===i} onClick={()=>setModelChoice(i)}><span className="adv-model-flag">{i===1?'Multimodal pilot':i===0?'Cheap text baseline':i===2?'Local experiment':'Video specialist'}</span><strong>{m.name}</strong><small>{m.types}</small></button>)}</div>
 <div className="adv-panel adv-model-detail"><h3>{MODELS[modelChoice].role}</h3><p>{MODELS[modelChoice].trade}</p><a href={MODELS[modelChoice].link} target="_blank" rel="noopener noreferrer">Read provider model documentation ↗</a></div>
 <div className="adv-panel"><div className="adv-row-between"><div><h3>Make a rough embedding-cost estimate</h3><p>These are input charges from published pricing, not a quote for the whole pipeline.</p></div><span className="adv-count-tag">USD · example only</span></div><div className="adv-cost-controls">
 <label>Hours of archived recordings <output>{hours} h</output><input type="range" min="10" max="500" step="10" value={hours} onChange={e=>setHours(Number(e.target.value))}/></label>
 <label>One image frame every <output>{sampleEvery} seconds</output><select value={sampleEvery} onChange={e=>setSampleEvery(Number(e.target.value))}><option value={5}>5 seconds</option><option value={10}>10 seconds</option><option value={30}>30 seconds</option></select></label>
 <label>Audio directly embedded <output>{audioPercent}%</output><input type="range" min="0" max="100" step="10" value={audioPercent} onChange={e=>setAudioPercent(Number(e.target.value))}/></label>
 </div><div className="adv-cost-results">
 <div><small>Text baseline · OpenAI 3-small</small><strong>{usd(textEstimate)}</strong><span>Assumes 12,000 tokens / recorded hour</span></div>
 <div><small>Sampled images · Gemini Embedding 2</small><strong>{usd(imageCost)}</strong><span>{Math.round(frames).toLocaleString()} still images × $0.00012</span></div>
 <div><small>Native audio · Gemini Embedding 2</small><strong>{usd(audioCost)}</strong><span>{Math.round(hours*3600*audioPercent/100).toLocaleString()} seconds × $0.00016</span></div>
 <div><small>Video-frame illustration · Gemini Embedding 2</small><strong>{usd(videoFrameCost)}</strong><span>{Math.round(frames).toLocaleString()} frames × $0.00079; not a full-video quote</span></div>
 </div><p className="adv-muted">Text, image, audio, and video figures are <strong>alternative component scenarios, not an automatic total</strong>. Real video billing depends on the submitted clips and model sampling. Excludes transcription, visual captions, storage, transport, retries, model output, vector DB, human review, and taxes. Batch prices can be lower.</p></div>
 <div className="adv-two-col"><div className="adv-panel"><h3>My recommended order</h3><ol className="adv-ordered"><li><strong>Fix IDs, timestamps, raw ASR, and access rights.</strong> That's the foundation.</li><li><strong>Use cheap text embeddings</strong> for everything with good transcripts.</li><li><strong>Add sampled-frame visual search</strong> for “smiling,” whiteboards, gestures, and live Q&amp;A.</li><li><strong>Pilot Gemini Embedding 2</strong> or local Qwen3-VL on a small set. Add audio/video-native indexing only when it improves tested queries.</li><li><strong>Keep a human review step</strong> before turning client stories into posts.</li></ol></div><div className="adv-panel"><h3>How to know it works</h3><p>Write 30–50 real questions Rose would ask. For each one, manually mark the clip(s) she expects to find. Compare text-only, text + visual, and native multimodal searches.</p><p>Track: <strong>found the right source in top 5?</strong> <strong>How many minutes did Rose save?</strong> <strong>How many false matches?</strong> Then connect approved clips to real 90-day content outcomes.</p><div className="adv-callout">API privacy: a free embedding tier may allow provider training on submitted data. Don't send client recordings to a free tier without checking contracts, settings, and client permission.</div></div></div>
 <div className="adv-disclaimer">Prices checked against provider pages in October 2026; verify again before purchase. Sources: <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener noreferrer">Gemini API pricing</a> · <a href="https://developers.openai.com/api/docs/models/text-embedding-3-small" target="_blank" rel="noopener noreferrer">OpenAI text embedding pricing</a> · <a href="https://www.twelvelabs.io/pricing-calculator" target="_blank" rel="noopener noreferrer">Twelve Labs estimator</a>. No actual API requests or paid processing occur in this learning app.</div>
 </div>;
}
