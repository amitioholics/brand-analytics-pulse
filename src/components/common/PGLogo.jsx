export default function PGLogo({
  size = 24,
  height,
  width,
  className = '',
  style = {},
  alt = 'P&G'
}) {
  const computedHeight = height || size;
  const computedWidth = width || computedHeight;

  return (
    <img
      src="/pg-logo.png"
      alt={alt}
      width={computedWidth}
      height={computedHeight}
      className={`brand-logo pg-logo ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        borderRadius: '50%',
        ...style
      }}
    />
  );
}

export const BrandLogo = PGLogo;
export const MyntraLogo = PGLogo;
