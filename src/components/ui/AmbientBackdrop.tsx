interface AmbientBackdropProps {
  variant: 'auth' | 'dashboard'
}

export function AmbientBackdrop({ variant }: AmbientBackdropProps) {
  return (
    <div className={`ambient-backdrop ambient-backdrop-${variant}`} aria-hidden="true">
      <span className="ambient-beam ambient-beam-one" />
      <span className="ambient-beam ambient-beam-two" />
    </div>
  )
}
