import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";

// Returns the docs theme's MDX components merged with any local overrides.
// The return type is inferred from the theme (not annotated as the generic
// `MDXComponents`) so `wrapper` stays a callable component — the catch-all
// route renders `useMDXComponents().wrapper` directly.
export function useMDXComponents<T extends object>(components?: T) {
  return {
    ...getThemeComponents(),
    ...components,
  };
}
