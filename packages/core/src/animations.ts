/**
 * CSS for the blink, breathe and look animations keyed on the classes emitted by
 * `createAvatar(name, { animated: true })` (`wobbly-root`, `wobbly-breathe`, `wobbly-eyes`,
 * `wobbly-eye`). Disabled under `prefers-reduced-motion: reduce`. Web only.
 */
export const ANIMATIONS_CSS = `.wobbly-breathe { transform-box: view-box; transform-origin: 50% 60%; animation: wobbly-breathe 3s ease-in-out infinite alternate; }
.wobbly-eyes { animation: wobbly-look 6s steps(1, end) infinite; transition: translate 0.2s; }
.wobbly-eye > path { transform-box: fill-box; transform-origin: 50% 50%; animation: wobbly-blink 4.6s infinite; }
.wobbly-root:hover .wobbly-breathe { animation-duration: 1.4s; }

@keyframes wobbly-breathe {
  to { transform: scale(1.025, 0.98); }
}
@keyframes wobbly-blink {
  0%, 95% { transform: scaleY(1); }
  97% { transform: scaleY(0.08); }
  100% { transform: scaleY(1); }
}
@keyframes wobbly-look {
  0%, 30% { translate: 0 0; }
  32%, 55% { translate: -1px -0.6px; }
  57%, 78% { translate: 1.1px 0.2px; }
  80%, 100% { translate: 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wobbly-breathe, .wobbly-eyes, .wobbly-eye > path { animation: none; }
}
`;
