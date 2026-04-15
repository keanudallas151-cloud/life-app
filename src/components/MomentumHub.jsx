import { MomentumCard } from "./MomentumCard";

export function MomentumHub({ snapshot, onNavigate, onQuickEvent }) {
  if (!snapshot) return null;

  const missions = Array.isArray(snapshot.missions) ? snapshot.missions : [];
  const suggestion = snapshot.nextSuggestion;

  return (
    <div className="life-momentum-hub-page" data-page-tag="#momentum_hub">
      <header className="life-momentum-hub-header">
        <p>Flagship System</p>
        <h2>Life Momentum Hub</h2>
        <span>
          Stack points through reading, notes, quizzes, and community actions.
        </span>
      </header>

      <MomentumCard
        snapshot={snapshot}
        onOpenHub={() => {}}
        title="Today at a glance"
        hideOpenButton
      />

      {suggestion && (
        <section className="life-momentum-hub-section">
          <div className="life-momentum-hub-section-head">
            <h3>Next best action</h3>
            <button
              type="button"
              className="life-momentum-link-btn"
              onClick={() => onNavigate?.(suggestion.route || "home")}
            >
              Go now
            </button>
          </div>
          <article className="life-momentum-suggestion">
            <h4>{suggestion.title}</h4>
            <p>{suggestion.body}</p>
          </article>
        </section>
      )}

      <section className="life-momentum-hub-section">
        <div className="life-momentum-hub-section-head">
          <h3>Daily missions</h3>
          <span>{snapshot.completionRate}% complete</span>
        </div>
        <div className="life-momentum-mission-list">
          {missions.map((mission) => {
            const pct = Math.min(
              100,
              Math.round((mission.progressCount / Math.max(1, mission.targetCount)) * 100),
            );
            return (
              <article
                key={mission.id}
                className={`life-momentum-mission-item${mission.completed ? " done" : ""}`}
              >
                <div className="life-momentum-mission-top">
                  <h4>{mission.label}</h4>
                  <strong>
                    +{mission.pointsReward} pts {mission.completed ? "✓" : ""}
                  </strong>
                </div>
                <p>{mission.description}</p>
                <div className="life-momentum-progress-head">
                  <span>
                    {mission.progressCount}/{mission.targetCount}
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="life-momentum-progress-track">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <button
                  type="button"
                  className="life-momentum-go-btn"
                  onClick={() => onNavigate?.(mission.route || "home")}
                >
                  {mission.ctaLabel || "Open"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="life-momentum-hub-section">
        <div className="life-momentum-hub-section-head">
          <h3>Quick momentum boosts</h3>
        </div>
        <div className="life-momentum-quick-actions">
          <button
            type="button"
            onClick={() =>
              onQuickEvent?.({
                type: "streak",
                source: "home",
                points: 4,
                meta: { quick: true },
              })
            }
          >
            Claim focus check-in
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.("where_to_start")}
          >
            Start a reading sprint
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.("quiz")}
          >
            Launch quiz challenge
          </button>
        </div>
      </section>
    </div>
  );
}
