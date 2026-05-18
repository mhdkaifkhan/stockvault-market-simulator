export const SkeletonCard = () => (
  <div className="card p-5 animate-pulse space-y-3">
    <div className="skeleton h-4 w-24 rounded" />
    <div className="skeleton h-7 w-36 rounded" />
    <div className="skeleton h-3 w-20 rounded" />
  </div>
)

export const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3"><div className="skeleton h-4 rounded" style={{ width: `${60 + i * 10}%` }} /></td>
    ))}
  </tr>
)

export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <tbody>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-white/5">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-4 py-3.5">
            <div className="skeleton h-4 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)
