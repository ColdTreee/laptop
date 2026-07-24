import { EMOTIONS } from '../../data/dashboard'

export function LearningFocusShowcase() {
  return (
    <section className="learning-focus-showcase" aria-labelledby="learning-focus-title">
      <div className="learning-focus-visual" aria-hidden="true">
        <img className="learning-focus-image" src="/learning-focus-study.png" alt="" />
      </div>
      <div className="learning-focus-card">
        <div className="learning-focus-copy">
          <p className="eyebrow">LEARNING FOCUS</p>
          <div className="learning-focus-heading">
            <h1 id="learning-focus-title">学习专注度</h1>
            <span>今日专注状态分布</span>
          </div>
          <p className="learning-focus-note">
            高效时段 <strong>09:00-11:00</strong>
          </p>
        </div>
        <dl className="learning-focus-list" aria-label="今日专注状态分布">
          {EMOTIONS.map((emotion) => (
            <div key={emotion.label}>
              <dt>{emotion.label}</dt>
              <dd>{emotion.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
