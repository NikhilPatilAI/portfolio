import type { CaseStudy, Hue } from '@/data/content';
import { tint } from '@/lib/style';

function Arrow() {
  return (
    <svg className="step-arrow" viewBox="0 0 14 26" aria-hidden="true" focusable="false">
      <path d="M7 1v20M2 16l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The architecture as one ordered list per lane, so it reads correctly with a screen reader and wraps on phones. */
export function Flow({ flow, hue }: { flow: CaseStudy['flow']; hue: Hue }) {
  return (
    <div className={flow.lanes.length > 1 ? 'flow flow-2' : 'flow'}>
      {flow.lanes.map((lane) => (
        <div key={lane.name} className="lane">
          <p className="label lane-name">{lane.name}</p>
          <ol>
            {lane.steps.map((step, i) => (
              <li key={step.label} className="step">
                {i > 0 ? <Arrow /> : null}
                <div className="step-box" style={tint(hue)}>
                  <span className="step-label">{step.label}</span>
                  {step.detail ? <span className="step-detail">{step.detail}</span> : null}
                  {step.exit ? <span className="step-exit">↳ {step.exit}</span> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {flow.note ? <p className="flow-note">{flow.note}</p> : null}
    </div>
  );
}
