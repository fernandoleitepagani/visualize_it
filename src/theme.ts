// src/theme.ts
export {
  theme,
  palette,
  lightPalette,
  space,
  radius,
  font,
  sans,
  mono,
  shadow,
  transition,
  tint,
  vizVar,
  cssVariablesResolver,
} from './theme/tokens';

/**
 * @deprecated Use `palette` de `@/theme` no lugar de `viz`.
 * Mantido temporariamente para não quebrar imports legados.
 * Será removido quando todos os componentes migrarem.
 */
export { palette as viz } from './theme/tokens';
