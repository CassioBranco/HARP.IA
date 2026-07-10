// Skeletons do editor — placeholders com shimmer enquanto os dados carregam.
// Puramente visual (aria-hidden nos blocos, aria-busy no container).
// Estilo shimmer vive em editor.css (.ed-skel + @keyframes edSkel), tema-aware.

type SkelProps = {
  w?: number | string
  h?: number | string
  r?: number | string
  style?: React.CSSProperties
}

export function Skeleton({ w = '100%', h = 14, r = 8, style }: SkelProps) {
  return (
    <span
      className="ed-skel"
      aria-hidden="true"
      style={{ display: 'block', width: w, height: h, borderRadius: r, ...style }}
    />
  )
}

// Tela inteira do editor (rail + painel + palco) enquanto o site carrega.
export function EditorSkeleton() {
  return (
    <div className="ed" aria-busy="true" aria-label="Carregando editor">
      <div className="ed-rail">
        <Skeleton w={34} h={34} r={9} style={{ marginBottom: '.6rem' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} w={44} h={40} r={11} style={{ marginBottom: '.4rem' }} />
        ))}
      </div>

      <div className="ed-panel">
        <div className="ed-ph"><Skeleton w={110} h={12} /></div>
        <div className="ed-scroll">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} h={i % 3 === 0 ? 58 : 40} />
          ))}
        </div>
      </div>

      <div className="ed-stage">
        <div className="ed-toolbar">
          <Skeleton w={170} h={28} r={10} />
          <Skeleton w={90} h={28} r={10} style={{ marginLeft: 'auto' }} />
        </div>
        <div className="ed-canvas">
          <Skeleton h="100%" r={12} style={{ maxWidth: 1080, minHeight: 420, width: '100%' }} />
        </div>
      </div>
    </div>
  )
}
