/// <reference types="jest" />

import { DataTransferEvent, getTextPlainFromDataTransfer } from "../Clipboard";

describe("getTextPlainFromDataTransfer", () => {
  test("reads string items when getData returns an empty value", async () => {
    const item: DataTransferItem = {
      kind: "string",
      type: "text/plain",
      getAsFile: () => {
        return null;
      },
      getAsString: (callback: (data: string) => void): void => {
        callback('{"type":"rectangle"}');
      },
    } as DataTransferItem;
    const event = {
      dataTransfer: {
        getData: () => {
          return "";
        },
        items: [item],
      },
    } as unknown as DataTransferEvent;

    await expect(getTextPlainFromDataTransfer(event)).resolves.toBe(
      '{"type":"rectangle"}'
    );
  });

  test("returns empty text when the data transfer has no text payload", async () => {
    const event = {
      dataTransfer: {
        getData: () => {
          return "";
        },
        items: [],
      },
    } as unknown as DataTransferEvent;

    await expect(getTextPlainFromDataTransfer(event)).resolves.toBe("");
  });
});
