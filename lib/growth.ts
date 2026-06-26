export interface GrowthSuggestion {
  library: string
  why: string
  tags: string[]
}

const SUGGESTIONS: Record<string, GrowthSuggestion[]> = {
  TypeScript: [
    { library: 'Zod', why: 'runtime schema validation that makes your types trustworthy at the edges — APIs, forms, env vars', tags: ['validation', 'DX'] },
    { library: 'tRPC', why: 'end-to-end type safety from server to client without a codegen step', tags: ['APIs', 'fullstack'] },
    { library: 'Jotai', why: 'atomic state management — drops Redux boilerplate without sacrificing predictability', tags: ['state', 'React'] },
  ],
  JavaScript: [
    { library: 'Biome', why: 'one tool for formatting and linting — faster than ESLint + Prettier combined', tags: ['DX', 'tooling'] },
    { library: 'Effect', why: 'functional patterns for error handling and async — type-safe, composable', tags: ['functional', 'async'] },
    { library: 'Bun', why: 'drop-in Node replacement with a built-in bundler, test runner, and package manager', tags: ['runtime', 'tooling'] },
  ],
  Python: [
    { library: 'Polars', why: 'DataFrame operations 10–100× faster than pandas with a clean expression API', tags: ['data', 'performance'] },
    { library: 'Pydantic', why: 'data validation via Python type hints — essential for any API or config layer', tags: ['validation', 'APIs'] },
    { library: 'uv', why: 'pip replacement that resolves and installs packages in milliseconds', tags: ['tooling', 'DX'] },
  ],
  Rust: [
    { library: 'Tokio', why: 'the de-facto async runtime — async Rust starts here', tags: ['async', 'performance'] },
    { library: 'clap', why: 'declarative CLI argument parsing with derive macros — zero friction', tags: ['CLI', 'DX'] },
    { library: 'axum', why: 'ergonomic async web framework built on Tokio with tower middleware', tags: ['web', 'async'] },
  ],
  Go: [
    { library: 'pgx', why: 'the best PostgreSQL driver for Go — significantly faster than database/sql', tags: ['database', 'performance'] },
    { library: 'chi', why: 'lightweight, idiomatic HTTP router that composes with stdlib middleware', tags: ['web', 'routing'] },
    { library: 'slog', why: 'structured logging built into the stdlib since 1.21 — worth adopting if you haven\'t', tags: ['observability', 'stdlib'] },
  ],
  Swift: [
    { library: 'Swift Testing', why: 'Apple\'s new native testing framework in Swift 6 — cleaner than XCTest with macros', tags: ['testing'] },
    { library: 'Observation', why: 'first-party reactive state — simpler than Combine for most SwiftUI work', tags: ['state', 'SwiftUI'] },
  ],
  Kotlin: [
    { library: 'Arrow', why: 'functional programming primitives that make error handling composable', tags: ['functional', 'DX'] },
    { library: 'Ktor', why: 'async, Kotlin-native HTTP framework — lighter than Spring for new services', tags: ['web', 'async'] },
  ],
  'C#': [
    { library: 'FluentValidation', why: 'strongly-typed validation rules separated from your models', tags: ['validation', 'DX'] },
    { library: 'Dapper', why: 'micro-ORM for raw SQL control with minimal mapping overhead', tags: ['database', 'performance'] },
  ],
  Java: [
    { library: 'Quarkus', why: 'Kubernetes-native Java with native compilation — much faster startup than Spring Boot', tags: ['performance', 'cloud'] },
    { library: 'Virtual Threads (JDK 21)', why: 'structured concurrency without callback hell — free performance upgrade if you\'re on JDK 21+', tags: ['concurrency', 'performance'] },
  ],
  Dart: [
    { library: 'Riverpod', why: 'compile-safe dependency injection and state management — the grown-up Provider', tags: ['state', 'Flutter'] },
    { library: 'Freezed', why: 'immutable data classes and union types with generated code', tags: ['DX', 'codegen'] },
  ],
  Ruby: [
    { library: 'Sorbet', why: 'gradual static typing for Ruby — add types where it matters most', tags: ['types', 'DX'] },
    { library: 'dry-rb', why: 'a suite of gems for functional, composable Ruby — especially dry-validation', tags: ['functional', 'validation'] },
  ],
  Vue: [
    { library: 'Pinia', why: 'the official Vue state manager — simpler and TypeScript-friendlier than Vuex', tags: ['state'] },
    { library: 'VueUse', why: 'collection of composables for everything from sensors to animation', tags: ['DX', 'composables'] },
  ],
  Svelte: [
    { library: 'Svelte 5 Runes', why: 'Svelte 5\'s reactive primitives are a paradigm shift — if you haven\'t migrated, now is the time', tags: ['reactivity', 'DX'] },
    { library: 'SvelteKit', why: 'the fullstack framework for Svelte — SSR, routing, and data loading out of the box', tags: ['fullstack', 'SSR'] },
  ],
}

const DEFAULT_SUGGESTIONS: GrowthSuggestion[] = [
  { library: 'mise', why: 'polyglot version manager — one tool for all your runtimes and project tools', tags: ['tooling', 'DX'] },
  { library: 'Just', why: 'a command runner that replaces Makefiles with a much cleaner syntax', tags: ['tooling', 'DX'] },
]

export function getSuggestions(
  topLanguages: string[],
): Array<{ language: string; suggestions: GrowthSuggestion[] }> {
  return topLanguages
    .slice(0, 3)
    .map(lang => ({ language: lang, suggestions: SUGGESTIONS[lang] ?? DEFAULT_SUGGESTIONS }))
}
