import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge doesn't know the custom scales declared in `global.css`.
 * Registering them prevents `cn()` from treating a typography token such as
 * `text-body` as a text color and removing it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'title',
        'heading',
        'subtitle',
        'body',
        'label',
        'caption',
        'overline',
      ],
      radius: ['button', 'input', 'card', 'badge'],
    },
  },
});

export type ClassNameValue =
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Small className helper. `tailwind-merge` resolves conflicting utilities
 * so callers can safely override a component's default styles.
 */
export function cn(...values: ClassNameValue[]): string {
  return twMerge(values.filter(Boolean).join(' '));
}
