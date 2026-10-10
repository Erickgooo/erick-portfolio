// Prints the ffmpeg expression for the horizontal centre of the 9:16 crop of the
// home film, as a fraction of the frame width over time. A centre crop loses the
// subject in several shots, so each shot gets its own framing: keyframes inside
// a shot are interpolated (a slow pan that follows the camera move), and a pair
// of keyframes 1 ms apart makes the framing jump exactly on a cut.
//
// Usage: node scripts/media/portrait-crop.mjs   (used by encode-film.sh)
const CUT = 0.001;

// [seconds, centre]. Read off a contact sheet of the 16:9 master, one frame every 0.5 s.
const KEYS = [
  // Desk and keyboard from above, then the hand on the mouse.
  [0, 0.5],
  [1.9, 0.5],
  [2.3, 0.32],
  [3.17, 0.32],
  // Face, then profile.
  [3.17 + CUT, 0.47],
  [3.8, 0.47],
  [4.1, 0.36],
  [5.17, 0.36],
  // Face, front.
  [5.17 + CUT, 0.42],
  [6.5, 0.5],
  [7.03, 0.5],
  // Hand on the mouse, then Erick at the desk on the right of the frame.
  [7.03 + CUT, 0.56],
  [8.4, 0.6],
  [8.9, 0.72],
  [12.4, 0.7],
  // Monitors, then the desk from behind.
  [12.4 + CUT, 0.5],
  [13.9, 0.5],
  [14.1, 0.33],
  [15.5, 0.3],
  // Hand, then face, then profile at the desk.
  [15.5 + CUT, 0.5],
  [16.6, 0.58],
  [16.9, 0.47],
  [18.6, 0.48],
  [19, 0.68],
  [19.5, 0.62],
  [20, 0.53],
  [20.77, 0.55],
  // At the desk, then face.
  [20.77 + CUT, 0.6],
  [21.5, 0.65],
  [22, 0.6],
  [22.5, 0.5],
  [23, 0.46],
  [23.67, 0.5],
  // From behind, monitors in the centre.
  [23.67 + CUT, 0.4],
  [25, 0.4],
];

let expression = String(KEYS.at(-1)[1]);
for (let i = KEYS.length - 2; i >= 0; i--) {
  const [t0, c0] = KEYS[i];
  const [t1, c1] = KEYS[i + 1];
  const span = (t1 - t0).toFixed(4);
  expression = `if(lt(t,${t1.toFixed(4)}),lerp(${c0},${c1},(t-${t0.toFixed(4)})/${span}),${expression})`;
}
process.stdout.write(expression);
