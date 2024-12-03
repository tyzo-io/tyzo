import { Format } from "ajv";

export const ajvFormats = (collectionNames: string[]) =>
  ({
    uuid: true,
    uri: true,
    email: true,
    duration: true,
    "date-time": true,
    ...collectionNames
      .map((key) => `#/ref/collections/${key}`)
      .reduce((all, ref) => Object.assign(all, { [ref]: true }), {}),
  } as { [x: string]: Format | undefined });
