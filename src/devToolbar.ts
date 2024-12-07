// import type { AstroIntegration } from 'astro';

// interface DevToolbarUIOptions {
//   label: string;
// }

// export function defineToolbarApp(options: DevToolbarUIOptions) {
//   return {
//     id: 'tyzo-cms',
//     name: options.label,
//     icon: `
//       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
//         <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
//         <path d="M12 11v8"/>
//         <path d="M8 11v8"/>
//         <path d="M16 11v8"/>
//       </svg>
//     `,
//   };
// }

// export function addDevToolbarApp(): AstroIntegration {
//   return {
//     name: 'tyzo-cms-dev-toolbar',
//     hooks: {
//       'astro:config:setup': ({ addDevToolbarApp }) => {
//         addDevToolbarApp(
//           defineToolbarApp({
//             label: 'Tyzo CMS',
//           })
//         );
//       },
//     },
//   };
// }
