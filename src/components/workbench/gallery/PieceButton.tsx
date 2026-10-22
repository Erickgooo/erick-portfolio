"use client";

import type { ComponentProps } from "react";
import { openPiece } from "./open";

/** A print on the bench: opens its piece in the viewer (see Viewer.tsx). */
export function PieceButton({
  piece,
  ...props
}: Omit<ComponentProps<"button">, "type" | "onClick"> & { piece: string }) {
  return (
    <button
      {...props}
      type="button"
      data-piece={piece}
      onClick={(e) => openPiece({ id: piece, trigger: e.currentTarget })}
    />
  );
}
