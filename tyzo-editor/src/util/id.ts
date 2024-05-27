import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdef", 10);

export function randomId() {
  return nanoid(); //=> "4f90d13a42"
}
