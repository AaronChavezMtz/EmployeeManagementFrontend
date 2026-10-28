// Toma el color del texto que lo rodea (currentColor): blanco dentro de un botón azul, gris en uno claro.
// Antes era azul fijo y desaparecía en los botones principales. Va junto a un texto ("Guardando…"),
// por eso es decorativo para los lectores de pantalla.
export default function Spinner({ size = 20 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block flex-shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
      style={{ width: size, height: size }}
    />
  );
}
