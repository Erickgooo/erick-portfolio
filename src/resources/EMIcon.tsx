// Vector monogram for Erick Mahecha, traced from the official brand mark.
// Strokes use currentColor so it inherits the surrounding icon color (theme-aware
// automatically); the node keeps the fixed Cobalto Eléctrico brand accent.
// `data-brand-mark` tells the colour scan in tests/e2e/system.spec.ts that this
// Cobalt is the logo's own, the one place besides the call to action and the
// film's progress bar where it is meant to be.
export const EMIcon = () => (
  <svg
    data-brand-mark=""
    viewBox="314 503 1419 1038"
    width="1em"
    height="1em"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <path
      d="M 923,1062 L 710,1275 L 771,1337 L 984,1124 Z M 771,710 L 710,771 L 923,986 L 985,924 Z M 1562,546 L 1439,546 L 1062,923 L 1123,985 Z M 354,546 L 354,1501 L 1022,1501 L 943,1422 L 482,1421 L 483,1067 L 841,1067 L 884,1025 L 840,979 L 484,980 L 482,644 L 781,643 L 1023,885 L 1084,823 L 808,546 Z M 1693,543 L 1148,1088 L 1122,1063 L 1061,1124 L 1198,1262 L 1564,898 L 1565,1501 L 1693,1501 Z"
      fill="currentColor"
    />
    <path d="M 1022,960 L 960,1024 L 1024,1087 L 1086,1022 Z" fill="#2D5BFF" />
  </svg>
);
