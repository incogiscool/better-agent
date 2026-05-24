/**
 * Declarative map of every component the registry serves. Each entry lists:
 *  - the source files to copy into the customer's project
 *  - shadcn `registryDependencies` to install (resolved via `npx shadcn add`)
 *  - npm `dependencies` the customer needs
 */

export type RegistryFile = {
  /** Absolute path on the server (read at request time). */
  source: string;
  /** Target path in the customer's project, relative to their components root. */
  target: string;
  /** shadcn registry-item-file type. */
  type: "registry:component" | "registry:lib" | "registry:style";
};

export type RegistryComponent = {
  name: string;
  description: string;
  type: "registry:component";
  /** npm packages the customer needs to install. */
  dependencies: string[];
  /** shadcn registry items (e.g. "button", "sheet"). */
  registryDependencies: string[];
  /** Files copied into the customer's project. */
  files: RegistryFile[];
};

const REPO_ROOT = process.cwd();

function src(rel: string): string {
  return `${REPO_ROOT}/${rel}`;
}

const COMMON_DEPS = ["@betteragent/react", "@phosphor-icons/react", "streamdown"];

const PIECE_FILES: RegistryFile[] = [
  {
    source: src("components/chat/pieces/chat-input.tsx"),
    target: "components/chat/pieces/chat-input.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-messages.tsx"),
    target: "components/chat/pieces/chat-messages.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-message.tsx"),
    target: "components/chat/pieces/chat-message.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-tool-call.tsx"),
    target: "components/chat/pieces/chat-tool-call.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-typing.tsx"),
    target: "components/chat/pieces/chat-typing.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-header.tsx"),
    target: "components/chat/pieces/chat-header.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-empty-state.tsx"),
    target: "components/chat/pieces/chat-empty-state.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-suggested-prompts.tsx"),
    target: "components/chat/pieces/chat-suggested-prompts.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-error.tsx"),
    target: "components/chat/pieces/chat-error.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/chat-markdown.tsx"),
    target: "components/chat/pieces/chat-markdown.tsx",
    type: "registry:component",
  },
  {
    source: src("components/chat/pieces/index.ts"),
    target: "components/chat/pieces/index.ts",
    type: "registry:component",
  },
  {
    source: src("components/chat/styles/betteragent.css"),
    target: "components/chat/styles/betteragent.css",
    type: "registry:style",
  },
];

export const REGISTRY: RegistryComponent[] = [
  {
    name: "sidebar",
    description:
      "Right-side chat panel docked next to your main content. Best for assistant copilots that need persistent presence.",
    type: "registry:component",
    dependencies: COMMON_DEPS,
    registryDependencies: ["button", "input"],
    files: [
      ...PIECE_FILES,
      {
        source: src("components/chat/sidebar.tsx"),
        target: "components/chat/sidebar.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "chat-popup",
    description:
      "Floating bottom-right chat panel with a round trigger button. Best for support widgets and onboarding helpers.",
    type: "registry:component",
    dependencies: COMMON_DEPS,
    registryDependencies: ["button", "input"],
    files: [
      ...PIECE_FILES,
      {
        source: src("components/chat/chat-popup.tsx"),
        target: "components/chat/chat-popup.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "cmd-k",
    description:
      "Centered ⌘K-style overlay for typing instructions. Best for power-user productivity surfaces.",
    type: "registry:component",
    dependencies: COMMON_DEPS,
    registryDependencies: ["dialog", "button"],
    files: [
      ...PIECE_FILES,
      {
        source: src("components/chat/chat-cmdk.tsx"),
        target: "components/chat/chat-cmdk.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "inline-bar",
    description:
      "Single chat bar embedded in the page layout with an expanding response panel. Best for forms-adjacent quick actions.",
    type: "registry:component",
    dependencies: COMMON_DEPS,
    registryDependencies: ["input", "button"],
    files: [
      ...PIECE_FILES,
      {
        source: src("components/chat/inline-bar.tsx"),
        target: "components/chat/inline-bar.tsx",
        type: "registry:component",
      },
    ],
  },
];

export function findComponent(name: string): RegistryComponent | null {
  return REGISTRY.find((c) => c.name === name) ?? null;
}
