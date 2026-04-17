export function MomentumCard({
  snapshot,
  onOpenHub,
  compact = false,
  title = "Momentum",
  hideOpenButton = false,
}) {
  if (!snapshot) return null;

  const suggestion = snapshot.nextSuggestion;
  const missions = Array.isArray(snapshot.missions) ? snapshot.missions : [];
  const nextMission = missions.find((mission) => !mission.completed) || missions[0];
  return (
    <section className={`life-momentum-card${compact ? " is-compact" : ""}`}>
      <div className="life-momentum-card-head">
        <div>
          <p className="life-momentum-card-kicker">Life Momentum</p>
          <h3>{title}</h3>
        </div>
        {!hideOpenButton && (
          <button type="button" onClick={onOpenHub} className="life-momentum-link-btn">
            Open hub
          </button>
        )}
      </div>

      <div className="life-momentum-stat-row">
        <div>
          <span className="life-momentum-stat-value">{snapshot.score}</span>
          <span className="life-momentum-stat-label">score</span>
        </div>
        <div>
          <span className="life-momentum-stat-value">Lv {snapshot.level}</span>
          <span className="life-momentum-stat-label">level</span>
        </div>
        <div>
          <span className="life-momentum-stat-value">{snapshot.streakDays}d</span>
          <span className="life-momentum-stat-label">streak</span>
        </div>
        <div>
          <span className="life-momentum-stat-value">{snapshot.completionRate}%</span>
          <span className="life-momentum-stat-label">today</span>
        </div>
      </div>

      {suggestion && (
        <div className="life-momentum-next">
          <p className="life-momentum-next-kicker">Next best action</p>
          <p className="life-momentum-next-title">{suggestion.title}</p>
          <p className="life-momentum-next-body">{suggestion.body}</p>
        </div>
      )}

      {nextMission && (
        <div className="life-momentum-progress">
          <div className="life-momentum-progress-head">
            <span>{nextMission.label}</span>
            <span>
              {nextMission.progressCount}/{nextMission.targetCount}
            </span>
          </div>
          <div className="life-momentum-progress-track">
            <span
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (nextMission.progressCount / Math.max(1, nextMission.targetCount)) *
                      100,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {!compact && Array.isArray(snapshot.highlights) && snapshot.highlights.length > 0 && (
        <div className="life-momentum-highlights">
          {snapshot.highlights.map((item) => (
            <div key={item.label} className={`life-momentum-highlight life-momentum-highlight--${item.tone || "default"}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
