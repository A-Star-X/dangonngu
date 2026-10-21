import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Báo cho tailwind-merge biết các cỡ chữ riêng của dự án (src/styles), để không nhầm với class màu chữ.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['data', 'label', 'description', 'display-lg'] }],
      rounded: [{ rounded: ['button', 'card', 'dropdown'] }],
    },
  },
});

/** Ghép class Tailwind, class sau ghi đè class trước cùng nhóm. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
