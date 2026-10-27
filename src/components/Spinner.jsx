export default function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-primary/30 border-t-primary"
      style={{ width: size, height: size }}
      aria-label="Cargando"
    />
  );
}
