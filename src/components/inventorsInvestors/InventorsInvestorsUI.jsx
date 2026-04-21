import { useMemo } from "react";

export function FeatureFrame({ t, eyebrow, title, subtitle, actions, children }) {
  return (
    <div
      className="ii-feature-frame"
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "22px 16px calc(96px + env(safe-area-inset-bottom, 0px))",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        className="ii-feature-frame-head"
        style={{
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          {eyebrow ? (
            <p
              className="ii-feature-frame-eyebrow"
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: t.green,
              }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className="ii-feature-frame-title"
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.05,
              fontWeight: 800,
              color: t.ink,
              fontFamily: "Georgia, serif",
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className="ii-feature-frame-subtitle"
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                lineHeight: 1.75,
                color: t.mid,
                maxWidth: 560,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 10 }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SurfaceCard({ t, children, padded = true, style = {}, className }) {
  return (
    <div
      className={className}
      style={{
        background: t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 24,
        padding: padded ? "20px 18px" : 0,
        boxShadow: `0 16px 40px ${alpha(t.ink, 0.06)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ t, children, disabled, onClick, type = "button", style = {} }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: 50,
        borderRadius: 16,
        border: "none",
        padding: "0 18px",
        fontSize: 14,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? alpha(t.green, 0.25) : t.green,
        color: disabled ? alpha("#ffffff", 0.65) : "#ffffff",
        boxShadow: disabled ? "none" : `0 16px 30px ${alpha(t.green, 0.22)}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ t, children, onClick, type = "button", style = {} }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        minHeight: 48,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        padding: "0 16px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        background: t.skin,
        color: t.ink,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children, t }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        color: t.ink,
      }}
    >
      {children}
    </label>
  );
}

export function TextField({
  t,
  label,
  value,
  onChange,
  placeholder,
  error,
  multiline = false,
  type = "text",
  inputMode,
  maxLength,
}) {
  const sharedStyle = {
    width: "100%",
    borderRadius: 16,
    border: `1px solid ${error ? t.red : t.border}`,
    background: t.skin,
    color: t.ink,
    fontSize: 14,
    outline: "none",
    padding: multiline ? "14px 14px" : "0 14px",
    minHeight: multiline ? 120 : 50,
    boxSizing: "border-box",
    resize: multiline ? "vertical" : "none",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>{label}</SectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={sharedStyle}
          maxLength={maxLength}
        />
      ) : (
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={sharedStyle}
          maxLength={maxLength}
        />
      )}
      {error ? <InlineError t={t}>{error}</InlineError> : null}
    </div>
  );
}

export function MoneyField({ t, label, value, onChange, placeholder, error }) {
  const displayValue = formatMoneyInput(value);

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>{label}</SectionLabel>
      <input
        type="text"
        value={displayValue}
        inputMode="numeric"
        onChange={(event) => onChange(formatMoneyInput(event.target.value))}
        placeholder={placeholder}
        style={{
          width: "100%",
          borderRadius: 16,
          border: `1px solid ${error ? t.red : t.border}`,
          background: t.skin,
          color: t.ink,
          fontSize: 14,
          outline: "none",
          padding: "0 14px",
          minHeight: 50,
          boxSizing: "border-box",
          fontVariantNumeric: "tabular-nums",
        }}
      />
      {error ? <InlineError t={t}>{error}</InlineError> : null}
    </div>
  );
}

export function SelectField({ t, label, value, onChange, options, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>{label}</SectionLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          minHeight: 50,
          borderRadius: 16,
          border: `1px solid ${error ? t.red : t.border}`,
          background: t.skin,
          color: t.ink,
          fontSize: 14,
          padding: "0 14px",
          outline: "none",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <InlineError t={t}>{error}</InlineError> : null}
    </div>
  );
}

export function ToggleField({ t, label, checked, onChange, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        minHeight: 58,
        marginBottom: 14,
        borderRadius: 18,
        border: `1px solid ${t.border}`,
        background: t.skin,
        color: t.ink,
        cursor: "pointer",
        padding: "0 16px",
        textAlign: "left",
      }}
    >
      <span>
        <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{label}</span>
        {hint ? (
          <span style={{ display: "block", marginTop: 4, fontSize: 12, color: t.mid }}>
            {hint}
          </span>
        ) : null}
      </span>
      <span
        style={{
          width: 46,
          height: 28,
          borderRadius: 999,
          background: checked ? t.green : t.border,
          position: "relative",
          transition: "all 160ms ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#ffffff",
            transition: "all 160ms ease",
          }}
        />
      </span>
    </button>
  );
}

export function RoleChoiceCard({ t, role, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role.value)}
      style={{
        width: "100%",
        borderRadius: 22,
        border: `1px solid ${selected ? t.green : t.border}`,
        background: selected ? alpha(t.green, 0.08) : t.white,
        textAlign: "left",
        padding: "18px 18px",
        cursor: "pointer",
        boxShadow: selected ? `0 14px 28px ${alpha(t.green, 0.14)}` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: t.ink }}>{role.title}</div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: t.mid }}>
            {role.description}
          </div>
        </div>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `2px solid ${selected ? t.green : t.border}`,
            background: selected ? t.green : "transparent",
            flexShrink: 0,
            marginTop: 4,
          }}
        />
      </div>
    </button>
  );
}

export function ProgressMeter({ t, percent, label }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: t.ink }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.ink, whiteSpace: "nowrap" }}>{percent}%</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: alpha(t.border, 0.8),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            background: t.green,
          }}
        />
      </div>
    </div>
  );
}

export function ImagePicker({
  t,
  label,
  multiple = false,
  previews,
  onChange,
  error,
  helperText,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>{label}</SectionLabel>
      <label
        style={{
          display: "block",
          borderRadius: 18,
          border: `1px dashed ${error ? t.red : t.border}`,
          background: t.skin,
          padding: "16px 14px",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(event) => onChange(event.target.files)}
          style={{ display: "none" }}
        />
        <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink }}>
          {multiple ? "Tap to add images" : "Tap to choose an image"}
        </span>
        <span style={{ display: "block", marginTop: 6, fontSize: 12, color: t.mid }}>
          {helperText}
        </span>
      </label>
      {previews?.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: previews.length > 1 ? "repeat(3, minmax(0, 1fr))" : "1fr",
            gap: 10,
            marginTop: 12,
          }}
        >
          {previews.map((preview, index) => (
            <div
              key={`${preview}-${index}`}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 16,
                overflow: "hidden",
                border: `1px solid ${t.border}`,
                background: t.skin,
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      ) : null}
      {error ? <InlineError t={t}>{error}</InlineError> : null}
    </div>
  );
}

export function SearchBar({ t, value, onChange, placeholder, rightSlot }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 52,
          borderRadius: 18,
          border: `1px solid ${t.border}`,
          background: t.white,
          padding: "0 14px",
        }}
      >
        <span style={{ fontSize: 16, color: t.mid }}>⌕</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            color: t.ink,
          }}
        />
      </div>
      {rightSlot}
    </div>
  );
}

export function EmptyState({ t, title, body, action }) {
  return (
    <SurfaceCard t={t} style={{ textAlign: "center", padding: "28px 20px" }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>◌</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: t.ink }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: t.mid }}>{body}</div>
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </SurfaceCard>
  );
}

export function InlineError({ t, children }) {
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: t.red, lineHeight: 1.55 }}>{children}</div>
  );
}

export function SectionGrid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

export function SwipeGestureCard({
  t,
  children,
  onSwipeLeft,
  onSwipeRight,
  style = {},
}) {
  const swipeHandlers = useMemo(() => {
    let startX = 0;
    let startY = 0;
    return {
      onTouchStart(event) {
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      },
      onTouchEnd(event) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;
        if (deltaX < 0) onSwipeLeft?.();
        if (deltaX > 0) onSwipeRight?.();
      },
    };
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <SurfaceCard
      t={t}
      padded={false}
      className="ii-swipe-card"
      style={{
        overflow: "hidden",
        maxWidth: 520,
        margin: "0 auto",
        ...style,
      }}
      {...swipeHandlers}
    >
      {children}
    </SurfaceCard>
  );
}

export function Avatar({ src, name, size = 56, t }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: alpha(t.green, 0.12),
        color: t.green,
        fontWeight: 800,
        border: `1px solid ${alpha(t.green, 0.2)}`,
        flexShrink: 0,
      }}
    >
      {(name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export function ConversationBadge({ count, t }) {
  if (!count) return null;
  return (
    <span
      style={{
        minWidth: 22,
        height: 22,
        padding: "0 7px",
        borderRadius: 999,
        background: t.green,
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {count}
    </span>
  );
}

export function formatMoneyInput(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  const normalized = digits.replace(/^0+(?=\d)/, "") || "0";
  const capped = Math.min(Number(normalized), 100000000);
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(capped)}`;
}

export function alpha(hex, opacity) {
  if (!hex || !hex.startsWith("#")) return hex;
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((item) => item + item).join("") : value;
  const number = Number.parseInt(normalized, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
