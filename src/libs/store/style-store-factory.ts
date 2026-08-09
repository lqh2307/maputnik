import { type IStyleStore, type OnStyleChangedCallback } from "../definitions";
import {
  getStyleUrlFromAddressbarAndRemoveItIfNeeded,
  loadStyleUrl,
} from "../urlopen";
import { StyleStore } from "./stylestore";

export async function createStyleStore(
  onStyleChanged: OnStyleChangedCallback
): Promise<IStyleStore> {
  const styleUrl = getStyleUrlFromAddressbarAndRemoveItIfNeeded();
  const useStyleUrl =
    styleUrl &&
    window.confirm(
      "Load style from URL: " + styleUrl + " and discard current changes?"
    );
  const styleStore = new StyleStore();
  const styleToLoad = useStyleUrl
    ? await loadStyleUrl(styleUrl)
    : await styleStore.getLatestStyle();
  onStyleChanged(styleToLoad, { initialLoad: true, save: false });
  return styleStore;
}

export type { IStyleStore };
