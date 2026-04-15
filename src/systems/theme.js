export const C = {
  skin:"#f5f0e8", white:"#ffffff", green:"#4a8c5c", greenLt:"#eaf3ec",
  ink:"#141414", mid:"#3a3a3a", muted:"#8a8070", border:"#ddd5c4",
  light:"#ede8de", gold:"#b8975a", red:"#c0392b",
};

/** Depth tokens — use for cards / sheets */
export const S = {
  sm: "0 1px 2px rgba(20,20,20,0.04), 0 2px 8px rgba(20,20,20,0.06)",
  md: "0 4px 6px rgba(20,20,20,0.04), 0 12px 28px rgba(74,140,92,0.08), 0 2px 4px rgba(20,20,20,0.04)",
  lg: "0 8px 16px rgba(20,20,20,0.06), 0 24px 48px rgba(74,140,92,0.12)",
  glow: "0 0 0 1px rgba(74,140,92,0.12), 0 16px 40px rgba(74,140,92,0.15)",
};

if(typeof document!=="undefined"){
  if (!document.getElementById("life-theme-global-style")) {
    const style=document.createElement("style");
    style.id = "life-theme-global-style";
    style.textContent=`button:active{filter:brightness(0.92)!important;transform:scale(0.985)!important;}button{transition:filter 0.18s cubic-bezier(0.4,0,0.2,1),transform 0.18s cubic-bezier(0.4,0,0.2,1),box-shadow 0.22s ease,background 0.18s ease,border-color 0.18s ease;}`;
    document.head.appendChild(style);
  }
}
