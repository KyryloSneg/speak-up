import useMemberCardsMaxColsAndRows from "@/composables/useMemberCardsMaxColsAndRows";
import {
  DEFAULT_ASPECT_RATIO_H,
  DEFAULT_ASPECT_RATIO_W,
} from "@/utils/mediaConsts";
import calcMemberCardsLayout, {
  type AnyLayoutItem,
  type LayoutItem,
} from "@/utils/roomMemberCards/calcMemberCardsLayout";
import { useElementSize } from "@vueuse/core";
import {
  computed,
  toValue,
  type MaybeRefOrGetter,
  type TemplateRef,
} from "vue";

export type ExtendedLayoutItem<IsVisible extends boolean> =
  LayoutItem<IsVisible> & {
    type: "user" | "screenSharing";
  };

function useMemberCardsLayout(
  items: MaybeRefOrGetter<{ userId: string; type: "user" | "screenSharing" }[]>,
  templateRef: TemplateRef<HTMLElement>,
) {
  const boundaries = useMemberCardsMaxColsAndRows(templateRef);
  const { width, height } = useElementSize(templateRef);

  const initLayout = computed(() => {
    const itemsValue = toValue(items);

    const maxCols = boundaries.value?.maxCols;
    const maxRows = boundaries.value?.maxRows;

    if (!maxCols || !maxRows) return null;
    const idItems = itemsValue.map(item => ({
      id: `${item.userId}-${item.type}`,
    }));

    const layout = calcMemberCardsLayout(
      idItems,
      maxCols,
      maxRows,
      DEFAULT_ASPECT_RATIO_W / DEFAULT_ASPECT_RATIO_H,
      width.value,
      height.value,
    );

    const layoutItemsWithType: (AnyLayoutItem & {
      type: "user" | "screenSharing";
    })[] = layout.items.map(item => {
      const i = layout.items.indexOf(item);
      const initItem = itemsValue[i]!;

      return {
        ...item,
        id: initItem.userId,
        origId: item.id,
        type: initItem.type,
      };
    });

    return { ...layout, items: layoutItemsWithType };
  });

  const initLastVisibleItem = computed(() => {
    if (!initLayout.value) return null;
    const visibleItems = initLayout.value.items.filter(item => item.visible);

    return visibleItems[visibleItems.length - 1];
  });

  const rawLayout = computed(() => {
    if (!initLayout.value) return null;
    if (initLayout.value.hiddenCount) {
      const visibleItems = initLayout.value.items.filter(item => item.visible);
      const lastVisibleItem = visibleItems[visibleItems.length - 1]!;

      const lastRowItems =
        initLayout.value.rows[initLayout.value.rows.length - 1]!.items;

      return {
        ...initLayout.value,
        // leave some space for the RoomOtherMemberCards component
        visibleCount: initLayout.value.visibleCount - 1,
        hiddenCount: initLayout.value.hiddenCount + 1,
        rows: initLayout.value.rows.map(row =>
          row.index === initLayout.value!.rowCount - 1
            ? {
                ...row,
                items: lastRowItems.slice(0, lastRowItems.length - 1),
                itemCount: lastRowItems.length - 1,
              }
            : row,
        ),
        items: initLayout.value.items.map(item => {
          const isLastVisible = item.id === lastVisibleItem.id;
          if (!isLastVisible) return item;

          return {
            id: item.id,
            visible: false,
            row: null,
            col: null,
            widthPercent: 0,
            heightPercent: 0,
            style: {
              width: "0%",
              maxWidth: "0%",
              maxHeight: "0%",
            },
          };
        }),
      };
    }

    return initLayout.value;
  });

  const layout = computed(() => ({
    ...rawLayout.value,
    initLastVisibleItem: initLastVisibleItem.value,
  }));

  return layout;
}

export default useMemberCardsLayout;
