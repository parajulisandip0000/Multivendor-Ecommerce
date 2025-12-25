import { useMemo, useState } from 'react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const ZoomableImage = ({ src, alt, zoom = 2, className = '', imgClassName = '' }) => {
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    const [hovered, setHovered] = useState(false);

    const style = useMemo(() => ({
        '--origin-x': `${origin.x}%`,
        '--origin-y': `${origin.y}%`,
    }), [origin.x, origin.y]);

    return (
        <div
            className={`relative overflow-hidden bg-white ${className}`}
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
            }}
        >
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-contain transition-transform duration-150 ease-out ${hovered ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${imgClassName}`}
                style={{
                    transformOrigin: 'var(--origin-x) var(--origin-y)',
                    transform: hovered ? `scale(${zoom})` : 'scale(1)',
                }}
                draggable={false}
            />
            {!hovered && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            )}
        </div>
    );
};

export default ZoomableImage;

