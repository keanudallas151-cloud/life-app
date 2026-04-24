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
        {[
          { value: snapshot.score, label: "score", highlight: false },
          { value: `Lv ${snapshot.level}`, label: "level", highlight: true },
          { value: `${snapshot.streakDays}d`, label: "streak", highlight: snapshot.streakDays > 0 },
          { value: `${snapshot.completionRate}%`, label: "today", highlight: snapshot.completionRate >= 80 },
        ].map(({ value, label, highlight }) => (
          <div key={label} style={{ textAlign: "center", flex: 1 }}>
            <div
              className="life-momentum-stat-value ios-tabular"
              style={{ color: highlight ? "var(--life-green, #50c878)" : "inherit" }}
            >
              {value}
            </div>
            <div className="life-momentum-stat-label">{label}</div>
          </div>
        ))}
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
