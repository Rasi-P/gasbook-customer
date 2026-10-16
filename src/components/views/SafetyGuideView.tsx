import { useId, useState } from 'react'
import safetyImage from '../../assets/safe.png'
import '../../styles/safety-guide.css'

const videoUrl = 'https://www.youtube.com/watch?v=oKXem5gT-2A'
const topics = [
  { id: 'leak', icon: 'alert', title: 'What should I do if I smell gas?', description: 'Even a small leak needs immediate attention.', steps: [
    'Do not light a flame, smoke, or operate electrical switches, plugs, fans or phones near the leak.',
    'If you can do so safely, turn the regulator and burner knobs off. Open doors and windows by hand; do not turn on an exhaust fan.',
    'Move everyone outside. Do not attempt repairs or carry a leaking cylinder through the home.',
    'From a safe place outside, call your LPG distributor. For fire or immediate danger, call 112. Do not use the installation again until it has been checked by an authorised technician.',
  ] },
  { id: 'fitting', icon: 'fitting', title: 'How do I get my cylinder fitted safely?', description: 'Ask the delivery person or an authorised technician to check the installation.', steps: [
    'At delivery, ask the delivery person to check the cylinder seal, safety cap and cylinder condition before accepting it.',
    'Have an authorised person connect the correct regulator and hose, check for leaks, and demonstrate safe operation before use.',
    'Keep the cylinder upright on a level surface, with the stove on a raised platform above it. Allow ventilation around the cylinder.',
    'Never force a regulator, alter a valve, or use a match to check for leaks. If a fitting is loose or damaged, stop using it and contact your distributor.',
  ] },
  { id: 'hose', icon: 'check', title: 'When should I check the hose and regulator?', description: 'A quick visual check can help you spot damage early.', steps: [
    'Look for cracks, wear, loose connections or damage to the hose. Keep it visible, away from heat, and free of twists.',
    'Use the hose and regulator recommended by your LPG supplier. Follow the marked replacement date and manufacturer’s instructions.',
    'Arrange inspection and replacement through an authorised technician. Do not patch a damaged hose with tape or try to repair the regulator yourself.',
  ] },
  { id: 'daily', icon: 'home', title: 'How should I store and use my cylinder?', description: 'Simple habits for a safer kitchen.', steps: [
    'Keep the cylinder upright in a ventilated space, away from heat, flames and combustible materials. Do not keep it in a closed cupboard.',
    'Turn off the regulator when cooking is finished, especially before bed. Keep children away from the stove and regulator.',
    'If you notice a gas smell, stop cooking and follow the leak guidance above. Do not wait for the smell to become stronger.',
  ] },
] as const

function SafetyIcon({ kind }: { kind: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'alert' ? <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></> :
      kind === 'fitting' ? <><path d="M14 5a5 5 0 0 0-6 6L3 16a3 3 0 0 0 5 5l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z" /></> :
      kind === 'home' ? <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" /></> :
      <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></>}
  </svg>
}

export function SafetyGuideView({ onBack }: { onBack: () => void }) {
  const [openTopic, setOpenTopic] = useState<string | null>('leak')
  const [showVideo, setShowVideo] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const id = useId()
  return <section className="safety-guide" aria-label="LPG safety guide">
    <button className="safety-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Home</button>
    <header className="safety-guide-heading">
      <span className="safety-eyebrow">SAFETY FIRST</span>
      <h1>A safer kitchen starts with you</h1>
      <p>Practical LPG guidance, a safety video, and answers to everyday questions.</p>
    </header>
    <aside className="safety-urgent" aria-label="Immediate gas leak guidance">
      <SafetyIcon kind="alert" />
      <div><h2>Smell gas right now?</h2><p>Avoid flames, switches and phones near the leak. Move outside and call your LPG distributor from a safe place. For fire or immediate danger, call <a href="tel:112">112</a>.</p></div>
    </aside>
    <div className="safety-guide-layout">
      <section className="safety-video-card" aria-label="Safety video">
        <div className="safety-video-frame">
          {showVideo && !videoError ? <iframe src="https://www.youtube-nocookie.com/embed/oKXem5gT-2A?rel=0" title="LPG Safety Tips — BPCL India" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen onError={() => setVideoError(true)} /> :
            <div className="safety-video-poster" style={{ backgroundImage: `url(${safetyImage})` }}>
              <span className="safety-video-label">LPG SAFETY</span><h2>Small checks.<br />Safer homes.</h2>
              <button type="button" className="safety-play" onClick={() => { setVideoError(false); setShowVideo(true) }}><span aria-hidden="true">▶</span> {videoError ? 'Retry video' : 'Watch safety video'}</button>
            </div>}
        </div>
        <div className="safety-video-caption"><h2>LPG Safety Tips</h2><p>Video by BPCL India · Bharat Petroleum</p><a href={videoUrl} target="_blank" rel="noopener noreferrer">{showVideo ? 'Video not loading? Watch on YouTube ↗' : 'Watch on YouTube ↗'}</a></div>
        <p className="safety-video-note">Watch when you are in a safe place. For installation or repairs, contact an authorised technician.</p>
      </section>
      <section className="safety-questions" aria-label="Safety questions">
        <h2>Frequently asked questions</h2>
        <p className="safety-questions-intro">Tap a topic to read the guidance.</p>
        {topics.map(topic => {
          const expanded = openTopic === topic.id
          return <div className={`safety-topic${expanded ? ' is-open' : ''}`} key={topic.id}>
            <h3><button type="button" id={`${id}-${topic.id}-button`} aria-expanded={expanded} aria-controls={`${id}-${topic.id}-content`} onClick={() => setOpenTopic(expanded ? null : topic.id)}>
              <span className="safety-topic-icon"><SafetyIcon kind={topic.icon} /></span><span>{topic.title}</span><svg className="safety-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button></h3>
            <div id={`${id}-${topic.id}-content`} role="region" aria-labelledby={`${id}-${topic.id}-button`} hidden={!expanded} className="safety-topic-content">
              <p>{topic.description}</p><ol>{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>
            </div>
          </div>
        })}
        <p className="safety-helpline">Indane, Bharatgas and HP Gas customers can also call the LPG emergency helpline <a href="tel:1906">1906</a> from a safe place.</p>
      </section>
    </div>
    <footer className="safety-sources">Guidance sources: <a href="https://pmuy.gov.in/Safety_Pledge.aspx" target="_blank" rel="noopener noreferrer">PMUY safety pledge</a><span> · </span><a href="https://www.bharatpetroleum.in/safety.aspx" target="_blank" rel="noopener noreferrer">Bharat Petroleum</a><span> · </span><a href="https://iocl.com/pages/faq" target="_blank" rel="noopener noreferrer">IndianOil FAQs</a><span> · </span><a href="https://www.112.gov.in/about" target="_blank" rel="noopener noreferrer">Emergency help</a></footer>
  </section>
}
