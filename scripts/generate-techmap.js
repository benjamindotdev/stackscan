const fs = require("fs");
const path = require("path");
const simpleIcons = require("simple-icons");

// Map of package name to tech info
const techMapping = {
  // Languages
  typescript: { name: "TypeScript", slug: "typescript", type: "language" },
  javascript: { name: "JavaScript", slug: "javascript", type: "language" },
  python: { name: "Python", slug: "python", type: "language" },
  go: { name: "Go", slug: "go", type: "language" },
  rust: { name: "Rust", slug: "rust", type: "language" },
  php: { name: "PHP", slug: "php", type: "language" },
  ruby: { name: "Ruby", slug: "ruby", type: "language" },
  java: { name: "Java", slug: "openjdk", type: "language" },
  csharp: { name: "C#", slug: "csharp", type: "language" },

  // Frontend Frameworks/Libraries
  react: { name: "React", slug: "react", type: "frontend" },
  "react-dom": { name: "ReactDOM", slug: "react", type: "frontend" },
  next: { name: "Next.js", slug: "nextdotjs", type: "frontend" },
  remix: { name: "Remix", slug: "remix", type: "frontend" },
  astro: { name: "Astro", slug: "astro", type: "frontend" },
  svelte: { name: "Svelte", slug: "svelte", type: "frontend" },
  "@sveltejs/kit": { name: "SvelteKit", slug: "svelte", type: "frontend" },
  "solid-js": { name: "SolidJS", slug: "solid", type: "frontend" },
  preact: { name: "Preact", slug: "preact", type: "frontend" },
  vue: { name: "Vue", slug: "vuedotjs", type: "frontend" },
  nuxt: { name: "Nuxt", slug: "nuxt", type: "frontend" },
  "@angular/core": { name: "Angular", slug: "angular", type: "frontend" },
  lit: { name: "Lit", slug: "lit", type: "frontend" },
  "@builder.io/qwik": { name: "Qwik", slug: "qwik", type: "frontend" },
  "ember-source": { name: "Ember", slug: "emberdotjs", type: "frontend" },
  backbone: { name: "Backbone", slug: "backbone", type: "frontend" },
  alpinejs: { name: "AlpineJS", slug: "alpinedotjs", type: "frontend" },
  "htmx.org": { name: "HTMX", slug: "htmx", type: "frontend" },

  // CSS Frameworks/Libraries
  tailwindcss: { name: "TailwindCSS", slug: "tailwindcss", type: "css" },
  bootstrap: { name: "Bootstrap", slug: "bootstrap", type: "css" },
  bulma: { name: "Bulma", slug: "bulma", type: "css" },
  "foundation-sites": { name: "Foundation", slug: "foundation", type: "css" },
  "@mui/material": { name: "Material UI", slug: "mui", type: "css" },
  "@chakra-ui/react": { name: "Chakra UI", slug: "chakraui", type: "css" },
  "@mantine/core": {
    name: "Mantine",
    slug: "mantine",
    type: "css",
    fallback: "mantine-logo.svg",
  },
  shadcn: {
    name: "ShadCN UI",
    slug: "shadcnui",
    type: "css",
    fallback: "shadcnui.svg",
  },
  daisyui: { name: "DaisyUI", slug: "daisyui", type: "css" },
  antd: { name: "Ant Design", slug: "antdesign", type: "css" },
  "@radix-ui/react": { name: "Radix UI", slug: "radixui", type: "css" },
  "@headlessui/react": { name: "Headless UI", slug: "headlessui", type: "css" },
  "@emotion/react": { name: "Emotion", slug: "emotion", type: "css" },
  "styled-components": {
    name: "Styled Components",
    slug: "styledcomponents",
    type: "css",
  },
  "@stitches/react": {
    name: "Stitches",
    slug: "stitches",
    type: "css",
    fallback: "stitches.svg",
  },
  sass: { name: "Sass", slug: "sass", type: "css" },
  less: { name: "Less", slug: "less", type: "css" },
  postcss: { name: "PostCSS", slug: "postcss", type: "css" },

  // State Management
  redux: { name: "Redux", slug: "redux", type: "state" },
  mobx: { name: "MobX", slug: "mobx", type: "state" },
  zustand: { name: "Zustand", slug: "zustand", type: "state" },
  jotai: { name: "Jotai", slug: "jotai", type: "state" },
  recoil: { name: "Recoil", slug: "recoil", type: "state" },
  xstate: { name: "XState", slug: "xstate", type: "state" },
  "@tanstack/react-query": {
    name: "TanStack Query",
    slug: "reactquery",
    type: "state",
    fallback: "reactquery.svg",
  },
  "@reduxjs/toolkit": { name: "RTK Query", slug: "redux", type: "state" },

  // Build Tools
  vite: { name: "Vite", slug: "vite", type: "build" },
  webpack: { name: "Webpack", slug: "webpack", type: "build" },
  "parcel-bundler": { name: "Parcel", slug: "parcel", type: "build" },
  rollup: { name: "Rollup", slug: "rollupdotjs", type: "build" },
  snowpack: { name: "Snowpack", slug: "snowpack", type: "build" },
  turbopack: { name: "Turbopack", slug: "webpack", type: "build" },
  "@swc/core": { name: "SWC", slug: "swc", type: "build" },
  esbuild: { name: "ESBuild", slug: "esbuild", type: "build" },
  "@babel/core": { name: "Babel", slug: "babel", type: "build" },
  tsup: { name: "Tsup", slug: "tsup", type: "build" },

  // Testing
  jest: { name: "Jest", slug: "jest", type: "testing" },
  "@playwright/test": {
    name: "Playwright",
    slug: "playwright",
    type: "testing",
  },
  cypress: { name: "Cypress", slug: "cypress", type: "testing" },
  vitest: { name: "Vitest", slug: "vitest", type: "testing" },
  mocha: { name: "Mocha", slug: "mocha", type: "testing" },
  chai: { name: "Chai", slug: "chai", type: "testing" },
  "@testing-library/react": {
    name: "Testing Library",
    slug: "testinglibrary",
    type: "testing",
  },
  jasmine: { name: "Jasmine", slug: "jasmine", type: "testing" },
  puppeteer: { name: "Puppeteer", slug: "puppeteer", type: "testing" },
  "@storybook/react": { name: "Storybook", slug: "storybook", type: "testing" },

  // Backend Frameworks
  express: { name: "Express", slug: "express", type: "backend" },
  fastify: { name: "Fastify", slug: "fastify", type: "backend" },
  "@nestjs/core": { name: "NestJS", slug: "nestjs", type: "backend" },
  koa: { name: "Koa", slug: "koa", type: "backend" },
  "@hapi/hapi": { name: "Hapi", slug: "hapi", type: "backend" },
  bun: { name: "Bun", slug: "bun", type: "runtime" },
  deno: { name: "Deno", slug: "deno", type: "runtime" },
  "@adonisjs/core": { name: "AdonisJS", slug: "adonisjs", type: "backend" },
  "@feathersjs/feathers": {
    name: "FeatherJS",
    slug: "feather",
    type: "backend",
  },

  // API
  "@trpc/server": { name: "tRPC", slug: "trpc", type: "api" },
  "graphql-yoga": { name: "GraphQL Yoga", slug: "graphql", type: "api" },
  "apollo-server": {
    name: "Apollo Server",
    slug: "apollographql",
    type: "api",
  },
  graphql: { name: "GraphQL", slug: "graphql", type: "api" },
  "@apollo/client": {
    name: "Apollo Client",
    slug: "apollographql",
    type: "api",
  },
  urql: { name: "Urql", slug: "graphql", type: "api" },
  "relay-runtime": { name: "Relay", slug: "relay", type: "api" },
  "@graphql-codegen/cli": {
    name: "GraphQL Codegen",
    slug: "graphql",
    type: "api",
  },

  // ORM
  prisma: { name: "Prisma", slug: "prisma", type: "orm" },
  mongoose: { name: "Mongoose", slug: "mongoose", type: "orm" },
  typeorm: { name: "TypeORM", slug: "typeorm", type: "orm" },
  "drizzle-orm": {
    name: "Drizzle ORM",
    slug: "drizzle",
    type: "orm",
    fallback: "Drizzle--Streamline-Simple-Icons.svg",
  },

  // Databases
  pg: { name: "PostgreSQL", slug: "postgresql", type: "database" },
  mysql: { name: "MySQL", slug: "mysql", type: "database" },
  mysql2: { name: "MySQL", slug: "mysql", type: "database" },
  mariadb: { name: "MariaDB", slug: "mariadb", type: "database" },
  sqlite3: { name: "SQLite", slug: "sqlite", type: "database" },
  mongodb: { name: "MongoDB", slug: "mongodb", type: "database" },
  redis: { name: "Redis", slug: "redis", type: "database" },
  "@elastic/elasticsearch": {
    name: "Elasticsearch",
    slug: "elasticsearch",
    type: "database",
  },
  "cassandra-driver": {
    name: "Cassandra",
    slug: "apachecassandra",
    type: "database",
  },
  "@aws-sdk/client-dynamodb": {
    name: "DynamoDB",
    slug: "amazondynamodb",
    type: "database",
  },
  "@google-cloud/firestore": {
    name: "Firestore",
    slug: "firebase",
    type: "database",
  },
  "@supabase/supabase-js": {
    name: "Supabase",
    slug: "supabase",
    type: "database",
  },
  "@planetscale/database": {
    name: "PlanetScale",
    slug: "planetscale",
    type: "database",
  },
  faunadb: { name: "FaunaDB", slug: "fauna", type: "database" },
  "@cockroachdb/prisma-adapter": {
    name: "CockroachDB",
    slug: "cockroachlabs",
    type: "database",
  },
  "surrealdb.js": { name: "SurrealDB", slug: "surrealdb", type: "database" },
  duckdb: { name: "DuckDB", slug: "duckdb", type: "database" },

  // Network/HTTP
  axios: { name: "Axios", slug: "axios", type: "network" },
  "node-fetch": { name: "Fetch", slug: "brandfetch", type: "network" },
  swr: { name: "SWR", slug: "swr", type: "network" },
  got: { name: "Got", slug: "go", type: "network" },
  "@grpc/grpc-js": { name: "gRPC", slug: "grpc", type: "network" },
  openapi: { name: "OpenAPI", slug: "openapiinitiative", type: "network" },
  superagent: { name: "SuperAgent", slug: "superagent", type: "network" },

  // Auth
  auth0: { name: "Auth0", slug: "auth0", type: "auth" },
  "@clerk/nextjs": { name: "Clerk", slug: "clerk", type: "auth" },
  "@supabase/auth-helpers-nextjs": {
    name: "Supabase Auth",
    slug: "supabase",
    type: "auth",
  },
  firebase: { name: "Firebase Auth", slug: "firebase", type: "auth" },
  "next-auth": { name: "NextAuth", slug: "nextdotjs", type: "auth" },
  jsonwebtoken: { name: "JWT", slug: "jsonwebtokens", type: "auth" },
  passport: { name: "Passport.js", slug: "passport", type: "auth" },
  bcrypt: { name: "bcrypt", slug: "bcrypt", type: "auth" },
  argon2: { name: "argon2", slug: "argo", type: "auth" },
  "keycloak-js": { name: "Keycloak", slug: "keycloak", type: "auth" },

  // AI
  openai: { name: "OpenAI SDK", slug: "openai", type: "ai" },
  langchain: { name: "LangChain", slug: "langchain", type: "ai" },
  "@tensorflow/tfjs": { name: "TensorFlow.js", slug: "tensorflow", type: "ai" },
  "@huggingface/inference": {
    name: "HuggingFace",
    slug: "huggingface",
    type: "ai",
  },
  replicate: { name: "Replicate", slug: "replicate", type: "ai" },
  ai: { name: "Vercel AI SDK", slug: "vercel", type: "ai" },
  "@xenova/transformers": {
    name: "Transformers.js",
    slug: "transformers",
    type: "ai",
  },

  // CI/CD
  "github-actions": {
    name: "GitHub Actions",
    slug: "githubactions",
    type: "ci",
  },
  "gitlab-ci": { name: "GitLab CI", slug: "gitlab", type: "ci" },
  circleci: { name: "CircleCI", slug: "circleci", type: "ci" },
  "travis-ci": { name: "Travis CI", slug: "travisci", type: "ci" },
  jenkins: { name: "Jenkins", slug: "jenkins", type: "ci" },

  // Containers/DevOps
  docker: { name: "Docker", slug: "docker", type: "container" },
  "docker-compose": {
    name: "Docker Compose",
    slug: "docker",
    type: "container",
  },
  kubernetes: { name: "Kubernetes", slug: "kubernetes", type: "container" },
  terraform: { name: "Terraform", slug: "terraform", type: "devops" },
  ansible: { name: "Ansible", slug: "ansible", type: "devops" },
  "@pulumi/pulumi": { name: "Pulumi", slug: "pulumi", type: "devops" },
  serverless: {
    name: "Serverless Framework",
    slug: "serverless",
    type: "devops",
  },

  // Cloud/Hosting
  "aws-sdk": { name: "AWS", slug: "amazonwebservices", type: "cloud" },
  "@azure/core-client": {
    name: "Azure",
    slug: "microsoftazure",
    type: "cloud",
  },
  "@google-cloud/storage": {
    name: "Google Cloud",
    slug: "googlecloud",
    type: "cloud",
  },
  vercel: { name: "Vercel", slug: "vercel", type: "hosting" },
  netlify: { name: "Netlify", slug: "netlify", type: "hosting" },
  "@railway/cli": { name: "Railway", slug: "railway", type: "hosting" },
  render: { name: "Render", slug: "render", type: "hosting" },
  "@cloudflare/workers-types": {
    name: "Cloudflare",
    slug: "cloudflare",
    type: "cloud",
  },

  // Linting/Formatting
  eslint: { name: "ESLint", slug: "eslint", type: "lint" },
  prettier: { name: "Prettier", slug: "prettier", type: "format" },
  husky: { name: "Husky", slug: "husqvarna", type: "lint" },
  "lint-staged": { name: "Lint-staged", slug: "lintstaged", type: "lint" },
  commitizen: { name: "Commitizen", slug: "commitizen", type: "lint" },
  "@commitlint/cli": { name: "Commitlint", slug: "commitlint", type: "lint" },

  // Package Managers
  npm: { name: "npm", slug: "npm", type: "package" },
  pnpm: { name: "pnpm", slug: "pnpm", type: "package" },
  yarn: { name: "Yarn", slug: "yarn", type: "package" },

  // SSG
  "@11ty/eleventy": { name: "11ty", slug: "eleventy", type: "ssg" },
  hugo: { name: "Hugo", slug: "hugo", type: "ssg" },
  jekyll: { name: "Jekyll", slug: "jekyll", type: "ssg" },
  gatsby: { name: "Gatsby", slug: "gatsby", type: "ssg" },

  // CMS
  wordpress: { name: "WordPress", slug: "wordpress", type: "cms" },
  "@shopify/shopify-api": { name: "Shopify", slug: "shopify", type: "cms" },
  "@sanity/client": { name: "Sanity", slug: "sanity", type: "cms" },
  contentful: { name: "Contentful", slug: "contentful", type: "cms" },
  "@strapi/strapi": { name: "Strapi", slug: "strapi", type: "cms" },
  ghost: { name: "Ghost", slug: "ghost", type: "cms" },
  "@keystone-6/core": { name: "KeystoneJS", slug: "keystone", type: "cms" },
  directus: { name: "Directus", slug: "directus", type: "cms" },

  // Automation
  turborepo: { name: "TurboRepo", slug: "turborepo", type: "automation" },
  nx: { name: "Nx", slug: "nx", type: "automation" },
  lerna: { name: "Lerna", slug: "lerna", type: "automation" },
  "@changesets/cli": {
    name: "Changesets",
    slug: "changesets",
    type: "automation",
    fallback: "changesets.svg",
  },

  // Mobile
  "react-native": { name: "React Native", slug: "react", type: "mobile" },
  expo: { name: "Expo", slug: "expo", type: "mobile" },
  flutter: { name: "Flutter", slug: "flutter", type: "mobile" },
  "@ionic/angular": { name: "Ionic", slug: "ionic", type: "mobile" },
  "@capacitor/core": { name: "Capacitor", slug: "capacitor", type: "mobile" },

  // Utilities
  lodash: { name: "Lodash", slug: "lodash", type: "utility" },
  dayjs: { name: "Day.js", slug: "dayjs", type: "utility" },
  moment: { name: "Moment.js", slug: "moment", type: "utility" },
  zod: { name: "Zod", slug: "zod", type: "utility" },
  yup: { name: "Yup", slug: "pyup", type: "utility" },
  joi: { name: "Joi", slug: "joi", type: "utility" },
  rxjs: { name: "RxJS", slug: "reactivex", type: "utility" },
  three: { name: "Three.js", slug: "threedotjs", type: "utility" },
  leaflet: { name: "Leaflet", slug: "leaflet", type: "utility" },
  d3: { name: "D3.js", slug: "d3", type: "utility" },

  // Payment
  stripe: { name: "Stripe", slug: "stripe", type: "payment" },
  "@paypal/checkout-server-sdk": {
    name: "PayPal SDK",
    slug: "paypal",
    type: "payment",
  },
  "@lemonsqueezy/lemonsqueezy.js": {
    name: "LemonSqueezy",
    slug: "lemonsqueezy",
    type: "payment",
    fallback: "lemonsqueezy.svg",
  },
};

// Generate techMap.ts
function generateTechMap() {
  const techMapEntries = [];

  for (const [packageName, info] of Object.entries(techMapping)) {
    let logoPath;

    if (info.fallback) {
      // Use fallback logo
      logoPath = `fallback/${info.fallback}`;
    } else {
      // Try to get from simple-icons
      try {
        const icon =
          simpleIcons[
            `si${info.slug.charAt(0).toUpperCase()}${info.slug
              .slice(1)
              .replace(/-/g, "")}`
          ];
        if (icon) {
          logoPath = `${info.slug}.svg`;
        } else {
          console.warn(
            `⚠️  No icon found for ${info.name} (slug: ${info.slug})`
          );
          logoPath = `${info.slug}.svg`; // Use slug anyway, might be manual
        }
      } catch (e) {
        logoPath = `${info.slug}.svg`;
      }
    }

    techMapEntries.push(
      `  '${packageName}': { name: '${info.name}', logo: '${logoPath}', type: '${info.type}' }`
    );
  }

  const techMapContent = `import { DetectorResult } from "./types";

export const techMap: Record<string, DetectorResult> = {
${techMapEntries.join(",\n")}
};
`;

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "techMap.ts"),
    techMapContent,
    "utf8"
  );

  console.log("✅ Generated techMap.ts with all icons!");
}

generateTechMap();
