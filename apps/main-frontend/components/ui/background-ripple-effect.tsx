"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTriggeredCellRef = useRef<{ row: number; col: number } | null>(
    null,
  );

  const updateBounds = useCallback(() => {
    const node = gridRef.current ?? containerRef.current;

    if (!node) {
      return;
    }

    boundsRef.current = node.getBoundingClientRect();
  }, []);

  const triggerRipple = useCallback(
    (clientX: number, clientY: number, force = false) => {
      if (!boundsRef.current) {
        updateBounds();
      }

      const bounds = boundsRef.current;

      if (!bounds) {
        return;
      }

      const { width, height, left, top } = bounds;

      if (width === 0 || height === 0) {
        return;
      }

      const offsetX = clientX - left;
      const offsetY = clientY - top;

      if (offsetX < 0 || offsetY < 0 || offsetX > width || offsetY > height) {
        lastTriggeredCellRef.current = null;
        return;
      }

      const col = Math.min(
        cols - 1,
        Math.max(0, Math.floor((offsetX / width) * cols)),
      );
      const row = Math.min(
        rows - 1,
        Math.max(0, Math.floor((offsetY / height) * rows)),
      );

      if (
        !force &&
        lastTriggeredCellRef.current &&
        lastTriggeredCellRef.current.row === row &&
        lastTriggeredCellRef.current.col === col
      ) {
        return;
      }

      lastTriggeredCellRef.current = { row, col };

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        setClickedCell({ row, col });
        setRippleKey((k) => k + 1);
        frameRef.current = null;
      });
    },
    [cols, rows, updateBounds],
  );

  useEffect(() => {
    const target = gridRef.current ?? containerRef.current;

    if (!target) {
      return;
    }

    updateBounds();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateBounds())
        : undefined;

    if (observer) {
      observer.observe(target);
    }

    const handleResize = () => updateBounds();
    const handleScroll = () => updateBounds();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      observer?.disconnect();
    };
  }, [updateBounds]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      triggerRipple(event.clientX, event.clientY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      triggerRipple(event.clientX, event.clientY, true);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [triggerRipple]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full",
        "[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]",
        "dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]",
      )}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          ref={gridRef}
          className="mask-radial-from-20% mask-radial-at-top opacity-600"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number; // in pixels
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ["--delay"]?: string;
  ["--duration"]?: string;
};

const DivGrid = React.forwardRef<HTMLDivElement, DivGridProps>(
  (
    {
      className,
      rows = 7,
      cols = 30,
      cellSize = 56,
      borderColor = "#3f3f46",
      fillColor = "rgba(14,165,233,0.3)",
      clickedCell = null,
      onCellClick = () => { },
      interactive = true,
    },
    ref,
  ) => {
    const cells = useMemo(
      () => Array.from({ length: rows * cols }, (_, idx) => idx),
      [rows, cols],
    );

    const gridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      width: cols * cellSize,
      height: rows * cellSize,
      marginInline: "auto",
    };

    return (
      <div
        ref={ref}
        className={cn("relative z-[3]", className)}
        style={gridStyle}
      >
        {cells.map((idx) => {
          const rowIdx = Math.floor(idx / cols);
          const colIdx = idx % cols;
          const distance = clickedCell
            ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
            : 0;
          const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
          const duration = 200 + distance * 80; // ms

          const style: CellStyle = clickedCell
            ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
            : {};

          return (
            <div
              key={idx}
              className={cn(
                "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
                clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
                !interactive && "pointer-events-none",
              )}
              style={{
                backgroundColor: fillColor,
                borderColor: borderColor,
                ...style,
              }}
              onClick={
                interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
              }
            />
          );
        })}
      </div>
    );
  },
);

DivGrid.displayName = "DivGrid";
