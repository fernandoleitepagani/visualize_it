// src/theme.ts
export {
  theme,
  palette,
  space,
  radius,
  font,
  mono,
  shadow,
  transition,
  tint,
  vizVar,
} from './theme/tokens';

/**
 * @deprecated Use `palette` de `@/theme` no lugar de `viz`.
 * Mantido temporariamente para não quebrar imports legados.
 * Será removido quando todos os componentes migrarem.
 */
export { palette as viz } from './theme/tokens';
