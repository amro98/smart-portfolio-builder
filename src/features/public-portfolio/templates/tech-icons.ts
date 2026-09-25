import {
  siReact, siTypescript, siJavascript, siNodedotjs, siHtml5, siCss, siGit, siGithub, siGitlab,
  siPostgresql, siMongodb, siMysql, siGraphql, siNextdotjs, siTailwindcss, siFigma, siDocker,
  siPython, siVuedotjs, siAngular, siSvelte, siSass, siRedux, siExpress, siFirebase, siSupabase,
  siVercel, siPrisma, siDjango, siLaravel, siPhp, siKotlin, siSwift, siFlutter, siDart, siGo,
  siRust, siCplusplus, siDotnet, siBlender, siSketch, siWebflow, siWordpress, siNotion, siJira,
  siFramer, siVite, siJest, siGooglecloud, siKubernetes, siLinux, siStripe, siShopify, siUnity,
  siOpenjdk, siRuby, siRubyonrails, siSpring, siFastapi, siFlask, siRedis, siNestjs, siNuxt,
  siAstro, siGsap, siThreedotjs, siWebpack, siNpm, siPostman, siStorybook, siCypress, siTensorflow,
  siPytorch, siPandas, siNumpy, siJupyter, siGoogleanalytics, siHubspot, siMailchimp, siZapier,
  siTrello, siAsana, siMiro, siDribbble, siBehance, siDavinciresolve, siCinema4d, siAutocad,
  siArduino, siRaspberrypi,
  type SimpleIcon,
} from 'simple-icons';

// Brand glyphs come from simple-icons (CC0-1.0). Named imports keep the bundle to only these
// icons. Skills are free-text in the data model, so names are normalized and matched against
// common aliases; anything unmatched simply renders a monogram tile in the templates.
const ICONS: Record<string, SimpleIcon> = {
  react: siReact, reactjs: siReact, reactnative: siReact,
  typescript: siTypescript, ts: siTypescript,
  javascript: siJavascript, js: siJavascript, es6: siJavascript,
  nodejs: siNodedotjs, node: siNodedotjs,
  html: siHtml5, html5: siHtml5,
  css: siCss, css3: siCss,
  git: siGit, github: siGithub, gitlab: siGitlab,
  postgresql: siPostgresql, postgres: siPostgresql, sql: siPostgresql,
  mongodb: siMongodb, mongo: siMongodb, mysql: siMysql,
  graphql: siGraphql,
  nextjs: siNextdotjs, next: siNextdotjs,
  tailwind: siTailwindcss, tailwindcss: siTailwindcss,
  figma: siFigma, docker: siDocker, python: siPython,
  vue: siVuedotjs, vuejs: siVuedotjs, angular: siAngular, svelte: siSvelte, sass: siSass, scss: siSass,
  redux: siRedux, express: siExpress, expressjs: siExpress, firebase: siFirebase, supabase: siSupabase,
  vercel: siVercel, prisma: siPrisma, django: siDjango, laravel: siLaravel, php: siPhp,
  kotlin: siKotlin, swift: siSwift, flutter: siFlutter, dart: siDart, go: siGo, golang: siGo,
  rust: siRust, cplusplus: siCplusplus, cpp: siCplusplus, csharp: siDotnet, dotnet: siDotnet, net: siDotnet,
  blender: siBlender, sketch: siSketch, webflow: siWebflow, wordpress: siWordpress, notion: siNotion,
  jira: siJira, framer: siFramer, vite: siVite, jest: siJest, gcp: siGooglecloud, googlecloud: siGooglecloud,
  kubernetes: siKubernetes, k8s: siKubernetes, linux: siLinux, stripe: siStripe, shopify: siShopify,
  unity: siUnity, java: siOpenjdk, ruby: siRuby, rails: siRubyonrails, rubyonrails: siRubyonrails,
  spring: siSpring, springboot: siSpring, fastapi: siFastapi, flask: siFlask, redis: siRedis,
  nestjs: siNestjs, nuxt: siNuxt, nuxtjs: siNuxt, astro: siAstro, gsap: siGsap, threejs: siThreedotjs,
  webpack: siWebpack, npm: siNpm, postman: siPostman, storybook: siStorybook, cypress: siCypress,
  tensorflow: siTensorflow, pytorch: siPytorch, pandas: siPandas, numpy: siNumpy, jupyter: siJupyter,
  googleanalytics: siGoogleanalytics, hubspot: siHubspot, mailchimp: siMailchimp, zapier: siZapier,
  trello: siTrello, asana: siAsana, miro: siMiro, dribbble: siDribbble, behance: siBehance,
  davinciresolve: siDavinciresolve, cinema4d: siCinema4d, autocad: siAutocad, arduino: siArduino,
  raspberrypi: siRaspberrypi,
};

export function normalizeTechName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+\+/g, 'plusplus')
    .replace(/#/g, 'sharp')
    .replace(/\.js\b/g, 'js')
    .replace(/[^a-z0-9]/g, '');
}

export function getTechIcon(name: string): SimpleIcon | undefined {
  return ICONS[normalizeTechName(name)];
}

export type { SimpleIcon };

/**
 * Brand hex colors are designed for light backgrounds; a few (Next.js, GitHub, Vercel…) are
 * pure black and vanish on the dark template worlds. Returns a readable color for dark UI.
 */
export function readableBrandColor(icon: SimpleIcon): string {
  const hex = icon.hex;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.28 ? '#e8e8ee' : `#${hex}`;
}
