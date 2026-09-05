"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

interface DragScrollProps {
  children: ReactNode;
  className?: string;
}

export function DragScroll({ children, className = "" }: DragScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0, moved: false });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, x: event.clientX, left: el.scrollLeft, moved: false };
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const delta = event.clientX - drag.current.x;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.left - delta;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (el?.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      drag.current.active = false;
      drag.current.moved = false;
    }, 0);
  }

  return (
    <div
      ref={ref}
      className={`${className} cursor-grab select-none active:cursor-grabbing`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (drag.current.moved) event.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
