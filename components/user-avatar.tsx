"use client"

type Props = {
    photoURL?: string | null
    displayName?: string | null
    size?: number // px
}

function initials(name?: string | null, email?: string | null) {
    const base = (name || email || "Usuário").trim()
    const parts = base.split(/\s+/).filter(Boolean)
    const txt =
        parts.length >= 2 ? (parts[0][0] + parts[1][0]) : base.slice(0, 2)
    return txt.toUpperCase()
}

// SVG avatar padrão (neutro)
const fallbackSvg = (label: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <rect width='128' height='128' fill='#e2e8f0'/>
      <circle cx='64' cy='48' r='24' fill='#94a3b8'/>
      <rect x='24' y='80' width='80' height='32' rx='16' fill='#94a3b8'/>
      <text x='64' y='118' text-anchor='middle' font-size='18' fill='#475569' font-family='sans-serif'>${label}</text>
    </svg>`
    )}`

export function UserAvatar({ photoURL, displayName, size = 64 }: Props) {
    const label = (displayName || "Usuário").split(" ")[0]
    const src = photoURL || fallbackSvg(initials(displayName, null))

    return (
        <img
            src={src}
            alt={displayName || "Foto do usuário"}
            width={size}
            height={size}
            className="rounded-full object-cover border border-gray-300 bg-white"
            onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackSvg(initials(displayName, null))
            }}
        />
    )
}
