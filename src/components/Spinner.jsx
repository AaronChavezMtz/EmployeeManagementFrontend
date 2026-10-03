export default function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
      style={{ width: size, height: size }}
      aria-label="Cargando"
    />
  );
}
