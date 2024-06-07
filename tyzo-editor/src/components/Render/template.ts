// This is an unsafe template function using eval and therefore should not be used

// export function templateString(str: string, props: any) {
//   return str.replace(/\{([^}]+)\}/g, function (_m, n) {
//     try {
//       return eval?.(`"use strict"; ${n}`);
//     } catch {
//       return n;
//     }
//   //   const p = n.split("|")[0].split(".");
//   //   let o = data;
//   //   for (let i = 0; i < p.length; i++) {
//   //     const x = o[p[i]];
//   //     o = typeof x === "function" ? (x as () => string)() : o[p[i]];
//   //     if (typeof o === "undefined" || o === null)
//   //       return n.indexOf("|") !== -1 ? n.split("|")[1] : m;
//   //   }
//   //   return o;
//   });
// }
