"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Drag-to-reorder photo grid. The first photo is the cover. A small
// movement threshold keeps clicks on the tile buttons from starting a drag;
// on touch, a short press starts it so scrolling still works.
export default function SortablePhotos({
  images,
  onChange,
  children,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  /** Rendered as the last grid cell (the "Add photos" tile). */
  children?: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    onChange(
      arrayMove(images, images.indexOf(String(active.id)), images.indexOf(String(over.id))),
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <SortablePhoto
              key={src}
              src={src}
              index={i}
              onMakeCover={() => onChange([src, ...images.filter((s) => s !== src)])}
              onRemove={() => onChange(images.filter((s) => s !== src))}
            />
          ))}
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortablePhoto({
  src,
  index,
  onMakeCover,
  onRemove,
}: {
  src: string;
  index: number;
  onMakeCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: src });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`Photo ${index + 1}${index === 0 ? ", cover" : ""}. Drag to reorder.`}
      className={`group relative aspect-square touch-manipulation overflow-hidden rounded-[10px] bg-[#f0f0f2] outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-accent)] ${
        isDragging
          ? "z-10 scale-[1.04] cursor-grabbing shadow-[0_12px_30px_rgb(0_0_0/0.22),0_0_0_0.5px_rgb(0_0_0/0.08)]"
          : "cursor-grab shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.06)]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-cover mix-blend-multiply"
      />
      {index === 0 ? (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          Cover
        </span>
      ) : (
        <button
          type="button"
          onClick={onMakeCover}
          className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        >
          Make cover
        </button>
      )}
      <button
        type="button"
        aria-label={`Remove photo ${index + 1}`}
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[12px] leading-none text-white backdrop-blur transition-opacity hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
