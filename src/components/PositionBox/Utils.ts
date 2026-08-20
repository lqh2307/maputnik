import { PositionBoxInfo } from "./Types";

/** Performs create reset box info. */
export function createResetBoxInfo(): PositionBoxInfo {
  return {
    offset: undefined,
    position: undefined,
    children: undefined,
  };
}
