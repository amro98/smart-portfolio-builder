import type { Modifier } from '@dnd-kit/core';

// Local equivalent of @dnd-kit/modifiers' restrictToVerticalAxis (not a project dependency).
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });
