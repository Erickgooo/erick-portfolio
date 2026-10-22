// Workbench, Visual Work: the link between the prints and the viewer. A print
// is a small client button (PieceButton), so React replays a click made while
// the page is still hydrating; if the viewer is not listening yet, the request
// waits here until it is.
export type OpenRequest = { id: string; trigger: HTMLElement };

let listener: ((request: OpenRequest) => void) | null = null;
let pending: OpenRequest | null = null;

export function openPiece(request: OpenRequest) {
  if (listener) listener(request);
  else pending = request;
}

export function onOpenPiece(fn: (request: OpenRequest) => void) {
  listener = fn;
  if (pending) {
    const request = pending;
    pending = null;
    fn(request);
  }
  return () => {
    if (listener === fn) listener = null;
  };
}
