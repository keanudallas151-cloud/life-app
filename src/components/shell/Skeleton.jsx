import React from 'react'

/** Lightweight placeholder blocks (no external animation libs). */
export const Skeleton = ({ className = '', width, height, style: styleProp }) => (
  <div
    className={`life-skeleton-block ${className}`.trim()}
    style={{ width, height, borderRadius: 8, ...styleProp }}
  />
)

export const SkeletonCard = () => (
  <div style={{ background: 'rgba(20,20,20,0.06)', borderRadius: 16, padding: 24 }}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
      <Skeleton width={48} height={48} style={{ borderRadius: '50%' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} />
      </div>
    </div>
    <Skeleton width="100%" height={20} style={{ marginBottom: 8 }} />
    <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={20} />
  </div>
)

export const SkeletonArticle = () => (
  <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Skeleton width="60%" height={40} style={{ borderRadius: 12 }} />
    <Skeleton width="100%" height={200} style={{ borderRadius: 16 }} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="90%" height={16} />
    <Skeleton width="95%" height={16} />
    <Skeleton width="85%" height={16} />
  </div>
)

export default Skeleton
