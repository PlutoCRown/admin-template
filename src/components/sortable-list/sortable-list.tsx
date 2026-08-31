import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragOverlaySurface } from "#components/drag-overlay-surface";

const DEFAULT_ACTIVATION_DISTANCE = 6;

const SORTABLE_TRANSITION = {
  duration: 250,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

const dropAnimation: DropAnimation = {
  duration: SORTABLE_TRANSITION.duration,
  easing: SORTABLE_TRANSITION.easing,
  sideEffects(params) {
    params.dragOverlay.node.querySelector(".is-lifted")?.classList.remove("is-lifted");
    return defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0" },
      },
    })(params);
  },
};

interface SortableItemContextValue {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  isDragging: boolean;
}

const SortableItemContext = createContext<SortableItemContextValue | null>(null);

export interface SortableMoveEvent {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
  fromIndex: number;
  toIndex: number;
}

export interface SortableOverlayMeta {
  width?: number;
}

export interface SortableListProps {
  ids: UniqueIdentifier[];
  children: ReactNode;
  onMove: (event: SortableMoveEvent) => void;
  renderOverlay?: (activeId: UniqueIdentifier, meta: SortableOverlayMeta) => ReactNode;
  strategy?: SortingStrategy;
  activationDistance?: number;
  overlayClassName?: string;
  matchOverlayWidth?: boolean;
}

export interface SortableItemProps {
  id: UniqueIdentifier;
  children: ReactNode;
  className?: string;
  draggingClassName?: string;
  style?: CSSProperties;
  draggingZIndex?: number;
  animateLayoutChanges?: AnimateLayoutChanges;
}

export function preventLayoutAnimationAfterSorting({
  isSorting,
  wasDragging,
}: Parameters<AnimateLayoutChanges>[0]) {
  return !(isSorting || wasDragging);
}

export function useSortableItem() {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error("useSortableItem 必须在 SortableItem 内使用");
  }
  return context;
}

export function useOptionalSortableItem() {
  return useContext(SortableItemContext);
}

export function SortableItem({
  id,
  children,
  className,
  draggingClassName,
  style,
  draggingZIndex,
  animateLayoutChanges,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: SORTABLE_TRANSITION,
    animateLayoutChanges,
  });
  const mergedClassName = [className, isDragging ? draggingClassName : undefined]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0 : style?.opacity,
    zIndex: isDragging ? draggingZIndex : style?.zIndex,
  };
  const contextValue: SortableItemContextValue = {
    attributes,
    listeners,
    setActivatorNodeRef,
    isDragging,
  };

  return (
    <SortableItemContext.Provider value={contextValue}>
      <div ref={setNodeRef} className={mergedClassName || undefined} style={mergedStyle}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

export function SortableList({
  ids,
  children,
  onMove,
  renderOverlay,
  strategy = verticalListSortingStrategy,
  activationDistance = DEFAULT_ACTIVATION_DISTANCE,
  overlayClassName,
  matchOverlayWidth = true,
}: SortableListProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: activationDistance },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetDragState = () => {
    setActiveId(null);
    setOverlayWidth(undefined);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setOverlayWidth(active.rect.current.initial?.width);
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetDragState();
    if (!over || active.id === over.id) {
      return;
    }
    const fromIndex = ids.indexOf(active.id);
    const toIndex = ids.indexOf(over.id);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    onMove({
      activeId: active.id,
      overId: over.id,
      fromIndex,
      toIndex,
    });
  };

  const overlay = activeId == null ? null : renderOverlay?.(activeId, { width: overlayWidth });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={ids} strategy={strategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {overlay ? (
          <DragOverlaySurface
            className={overlayClassName}
            style={matchOverlayWidth ? { width: overlayWidth } : undefined}
          >
            {overlay}
          </DragOverlaySurface>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
