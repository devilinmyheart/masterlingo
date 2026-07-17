// Load TanStack Start's module augmentation that adds the `server` key to
// createFileRoute options. `export type *` in @tanstack/react-start's index
// does not propagate `declare module` augmentations, so import the source
// file directly.
import "@tanstack/start-client-core/dist/esm/serverRoute.js";
