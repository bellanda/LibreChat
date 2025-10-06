import { z } from 'zod';
import { EModelEndpoint } from './schemas';
import type { EndpointFileConfig, FileConfig } from './types/files';

export const supportsFiles = {
  [EModelEndpoint.openAI]: true,
  [EModelEndpoint.google]: true,
  [EModelEndpoint.assistants]: true,
  [EModelEndpoint.azureAssistants]: true,
  [EModelEndpoint.agents]: true,
  [EModelEndpoint.azureOpenAI]: true,
  [EModelEndpoint.anthropic]: true,
  [EModelEndpoint.custom]: true,
  [EModelEndpoint.bedrock]: true,
};

export const excelFileTypes = [
  'application/vnd.ms-excel',
  'application/msexcel',
  'application/x-msexcel',
  'application/x-ms-excel',
  'application/x-excel',
  'application/x-dos_ms_excel',
  'application/xls',
  'application/x-xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const fullMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
  'text/css',
  'text/vtt',
  'image/jpeg',
  'text/javascript',
  'image/gif',
  'image/png',
  'image/heic',
  'image/heif',
  'application/x-tar',
  'application/typescript',
  'application/xml',
  'application/zip',
  'image/svg',
  'image/svg+xml',
  ...excelFileTypes,
];

export const codeInterpreterMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
  'text/css',
  'image/jpeg',
  'text/javascript',
  'image/gif',
  'image/png',
  'image/heic',
  'image/heif',
  'application/x-tar',
  'application/typescript',
  'application/xml',
  'application/zip',
  ...excelFileTypes,
];

export const retrievalMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
];

export const imageExtRegex = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i;

export const excelMimeTypes =
  /^application\/(vnd\.ms-excel|msexcel|x-msexcel|x-ms-excel|x-excel|x-dos_ms_excel|xls|x-xls|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/;

export const textMimeTypes =
  /^(text\/(x-c|x-csharp|tab-separated-values|x-c\+\+|x-h|x-java|html|markdown|x-php|x-python|x-script\.python|x-ruby|x-tex|plain|css|vtt|javascript|csv|xml))$/;

export const applicationMimeTypes =
  /^(application\/(epub\+zip|csv|json|pdf|x-tar|typescript|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet)|xml|zip))$/;

export const imageMimeTypes = /^image\/(jpeg|gif|png|webp|heic|heif)$/;

export const audioMimeTypes =
  /^audio\/(mp3|mpeg|mpeg3|wav|wave|x-wav|ogg|vorbis|mp4|x-m4a|flac|x-flac|webm)$/;

// Tipos de arquivo que devem ser excluídos do OCR e usar processamento normal
export const excludedFromOCRMimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel XLSX
  'application/vnd.ms-excel', // Excel XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template', // Excel XLTX
  'application/vnd.ms-excel.template', // Excel XLT
];

export const defaultOCRMimeTypes = [
  imageMimeTypes,
  /^application\/pdf$/,
  /^application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation)$/,
  /^application\/vnd\.ms-(word|powerpoint)$/,
  /^application\/epub\+zip$/,
];

export const defaultTextMimeTypes = [/^[\w.-]+\/[\w.-]+$/];

export const defaultSTTMimeTypes = [audioMimeTypes];

export const supportedMimeTypes = [
  textMimeTypes,
  excelMimeTypes,
  applicationMimeTypes,
  imageMimeTypes,
  audioMimeTypes,
  /** Supported by LC Code Interpreter PAI */
  /^image\/(svg|svg\+xml)$/,
];

export const codeInterpreterMimeTypes = [
  textMimeTypes,
  excelMimeTypes,
  applicationMimeTypes,
  imageMimeTypes,
];

export const codeTypeMapping: { [key: string]: string } = {
  c: 'text/x-c',
  cs: 'text/x-csharp',
  cpp: 'text/x-c++',
  h: 'text/x-h',
  md: 'text/markdown',
  php: 'text/x-php',
  py: 'text/x-python',
  rb: 'text/x-ruby',
  tex: 'text/x-tex',
  js: 'text/javascript',
  sh: 'application/x-sh',
  ts: 'application/typescript',
  tar: 'application/x-tar',
  zip: 'application/zip',
  yml: 'application/x-yaml',
  yaml: 'application/x-yaml',
  log: 'text/plain',
  tsv: 'text/tab-separated-values',
  // Database files
  sql: 'text/plain',
  // Configuration files
  toml: 'text/plain',
  ini: 'text/plain',
  cfg: 'text/plain',
  conf: 'text/plain',
  config: 'text/plain',
  env: 'text/plain',
  properties: 'text/plain',
  // Git and version control files
  gitignore: 'text/plain',
  gitattributes: 'text/plain',
  gitmodules: 'text/plain',
  // Other common text-based files
  dockerfile: 'text/plain',
  makefile: 'text/plain',
  cmake: 'text/plain',
  requirements: 'text/plain',
  txt: 'text/plain',
  text: 'text/plain',
  // Lock files and package files
  lock: 'text/plain',
  json: 'application/json',
  xml: 'application/xml',
  csv: 'text/csv',
  html: 'text/html',
  css: 'text/css',
  scss: 'text/css',
  sass: 'text/css',
  less: 'text/css',
  // Additional programming languages
  java: 'text/x-java',
  kt: 'text/plain', // Kotlin
  scala: 'text/plain',
  go: 'text/plain',
  rs: 'text/plain', // Rust
  swift: 'text/plain',
  dart: 'text/plain',
  r: 'text/plain',
  m: 'text/plain', // Objective-C
  mm: 'text/plain', // Objective-C++
  pl: 'text/plain', // Perl
  lua: 'text/plain',
  vim: 'text/plain',
  vimrc: 'text/plain',
  bashrc: 'text/plain',
  zshrc: 'text/plain',
  // Web development
  jsx: 'text/javascript',
  tsx: 'application/typescript',
  vue: 'text/html',
  svelte: 'text/html',
  // Data formats
  jsonl: 'application/json',
  ndjson: 'application/json',
  // Shell scripts
  bash: 'application/x-sh',
  zsh: 'application/x-sh',
  fish: 'application/x-sh',
  // Documentation
  rst: 'text/plain',
  adoc: 'text/plain',
  asciidoc: 'text/plain',
  // Other common extensions
  bat: 'text/plain', // Windows batch
  cmd: 'text/plain', // Windows command
  ps1: 'text/plain', // PowerShell
  psm1: 'text/plain', // PowerShell module
  psd1: 'text/plain', // PowerShell data
  // Markup and templating
  handlebars: 'text/html',
  hbs: 'text/html',
  mustache: 'text/html',
  twig: 'text/html',
  jinja: 'text/html',
  jinja2: 'text/html',
  // Configuration formats
  editorconfig: 'text/plain',
  gitconfig: 'text/plain',
  npmrc: 'text/plain',
  yarnrc: 'text/plain',
  // Build and project files
  gradle: 'text/plain',
  maven: 'text/plain',
  sbt: 'text/plain',
  // License and readme files
  license: 'text/plain',
  readme: 'text/plain',
  changelog: 'text/plain',
  contributing: 'text/plain',
  // Ignore files
  dockerignore: 'text/plain',
  eslintignore: 'text/plain',
  prettierignore: 'text/plain',
};

export const retrievalMimeTypes = [
  /^(text\/(x-c|x-c\+\+|x-h|html|x-java|markdown|x-php|x-python|x-script\.python|x-ruby|x-tex|plain|vtt|xml))$/,
  /^(application\/(json|pdf|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation)))$/,
];

export const megabyte = 1024 * 1024;
/** Helper function to get megabytes value */
export const mbToBytes = (mb: number): number => mb * megabyte;

const defaultSizeLimit = mbToBytes(512);
const defaultTokenLimit = 100000;
const assistantsFileConfig = {
  fileLimit: 10,
  fileSizeLimit: defaultSizeLimit,
  totalSizeLimit: defaultSizeLimit,
  supportedMimeTypes,
  disabled: false,
};

export const fileConfig = {
  endpoints: {
    [EModelEndpoint.assistants]: assistantsFileConfig,
    [EModelEndpoint.azureAssistants]: assistantsFileConfig,
    [EModelEndpoint.agents]: assistantsFileConfig,
    default: {
      fileLimit: 10,
      fileSizeLimit: defaultSizeLimit,
      totalSizeLimit: defaultSizeLimit,
      supportedMimeTypes,
      disabled: false,
    },
  },
  serverFileSizeLimit: defaultSizeLimit,
  avatarSizeLimit: mbToBytes(2),
  fileTokenLimit: defaultTokenLimit,
  clientImageResize: {
    enabled: false,
    maxWidth: 1900,
    maxHeight: 1900,
    quality: 0.92,
  },
  ocr: {
    supportedMimeTypes: defaultOCRMimeTypes,
  },
  text: {
    supportedMimeTypes: defaultTextMimeTypes,
  },
  stt: {
    supportedMimeTypes: defaultSTTMimeTypes,
  },
  checkType: function (fileType: string, supportedTypes: RegExp[] = supportedMimeTypes) {
    return supportedTypes.some((regex) => regex.test(fileType));
  },
};

const supportedMimeTypesSchema = z
  .array(z.any())
  .optional()
  .refine(
    (mimeTypes) => {
      if (!mimeTypes) {
        return true;
      }
      return mimeTypes.every(
        (mimeType) => mimeType instanceof RegExp || typeof mimeType === 'string',
      );
    },
    {
      message: 'Each mimeType must be a string or a RegExp object.',
    },
  );

export const endpointFileConfigSchema = z.object({
  disabled: z.boolean().optional(),
  fileLimit: z.number().min(0).optional(),
  fileSizeLimit: z.number().min(0).optional(),
  totalSizeLimit: z.number().min(0).optional(),
  supportedMimeTypes: supportedMimeTypesSchema.optional(),
});

export const fileConfigSchema = z.object({
  endpoints: z.record(endpointFileConfigSchema).optional(),
  serverFileSizeLimit: z.number().min(0).optional(),
  avatarSizeLimit: z.number().min(0).optional(),
  fileTokenLimit: z.number().min(0).optional(),
  imageGeneration: z
    .object({
      percentage: z.number().min(0).max(100).optional(),
      px: z.number().min(0).optional(),
    })
    .optional(),
  clientImageResize: z
    .object({
      enabled: z.boolean().optional(),
      maxWidth: z.number().min(0).optional(),
      maxHeight: z.number().min(0).optional(),
      quality: z.number().min(0).max(1).optional(),
    })
    .optional(),
  ocr: z
    .object({
      supportedMimeTypes: supportedMimeTypesSchema.optional(),
    })
    .optional(),
  text: z
    .object({
      supportedMimeTypes: supportedMimeTypesSchema.optional(),
    })
    .optional(),
});

/** Helper function to safely convert string patterns to RegExp objects */
export const convertStringsToRegex = (patterns: string[]): RegExp[] =>
  patterns.reduce((acc: RegExp[], pattern) => {
    try {
      const regex = new RegExp(pattern);
      acc.push(regex);
    } catch (error) {
      console.error(`Invalid regex pattern "${pattern}" skipped.`, error);
    }
    return acc;
  }, []);

export function mergeFileConfig(dynamic: z.infer<typeof fileConfigSchema> | undefined): FileConfig {
  const mergedConfig: FileConfig = {
    ...fileConfig,
    ocr: {
      ...fileConfig.ocr,
      supportedMimeTypes: fileConfig.ocr?.supportedMimeTypes || [],
    },
    text: {
      ...fileConfig.text,
      supportedMimeTypes: fileConfig.text?.supportedMimeTypes || [],
    },
    stt: {
      ...fileConfig.stt,
      supportedMimeTypes: fileConfig.stt?.supportedMimeTypes || [],
    },
  };
  if (!dynamic) {
    return mergedConfig;
  }

  if (dynamic.serverFileSizeLimit !== undefined) {
    mergedConfig.serverFileSizeLimit = mbToBytes(dynamic.serverFileSizeLimit);
  }

  if (dynamic.avatarSizeLimit !== undefined) {
    mergedConfig.avatarSizeLimit = mbToBytes(dynamic.avatarSizeLimit);
  }

  if (dynamic.fileTokenLimit !== undefined) {
    mergedConfig.fileTokenLimit = dynamic.fileTokenLimit;
  }

  // Merge clientImageResize configuration
  if (dynamic.clientImageResize !== undefined) {
    mergedConfig.clientImageResize = {
      ...mergedConfig.clientImageResize,
      ...dynamic.clientImageResize,
    };
  }

  if (dynamic.ocr !== undefined) {
    mergedConfig.ocr = {
      ...mergedConfig.ocr,
      ...dynamic.ocr,
    };
    if (dynamic.ocr.supportedMimeTypes) {
      mergedConfig.ocr.supportedMimeTypes = convertStringsToRegex(dynamic.ocr.supportedMimeTypes);
    }
  }

  if (dynamic.text !== undefined) {
    mergedConfig.text = {
      ...mergedConfig.text,
      ...dynamic.text,
    };
    if (dynamic.text.supportedMimeTypes) {
      mergedConfig.text.supportedMimeTypes = convertStringsToRegex(dynamic.text.supportedMimeTypes);
    }
  }

  if (!dynamic.endpoints) {
    return mergedConfig;
  }

  for (const key in dynamic.endpoints) {
    const dynamicEndpoint = (dynamic.endpoints as Record<string, EndpointFileConfig>)[key];

    if (!mergedConfig.endpoints[key]) {
      mergedConfig.endpoints[key] = {};
    }

    const mergedEndpoint = mergedConfig.endpoints[key];

    if (dynamicEndpoint.disabled === true) {
      mergedEndpoint.disabled = true;
      mergedEndpoint.fileLimit = 0;
      mergedEndpoint.fileSizeLimit = 0;
      mergedEndpoint.totalSizeLimit = 0;
      mergedEndpoint.supportedMimeTypes = [];
      continue;
    }

    if (dynamicEndpoint.fileSizeLimit !== undefined) {
      mergedEndpoint.fileSizeLimit = mbToBytes(dynamicEndpoint.fileSizeLimit);
    }

    if (dynamicEndpoint.totalSizeLimit !== undefined) {
      mergedEndpoint.totalSizeLimit = mbToBytes(dynamicEndpoint.totalSizeLimit);
    }

    const configKeys = ['fileLimit'] as const;
    configKeys.forEach((field) => {
      if (dynamicEndpoint[field] !== undefined) {
        mergedEndpoint[field] = dynamicEndpoint[field];
      }
    });

    if (dynamicEndpoint.supportedMimeTypes) {
      mergedEndpoint.supportedMimeTypes = convertStringsToRegex(
        dynamicEndpoint.supportedMimeTypes as unknown as string[],
      );
    }
  }

  return mergedConfig;
}

/**
 * Helper function to determine if a file extension is likely a text-based file
 * This serves as a fallback for extensions not in codeTypeMapping
 */
export function isLikelyTextFile(extension: string): boolean {
  const textExtensions = new Set([
    // Programming languages not in main mapping
    'asm',
    'c++',
    'cc',
    'cxx',
    'h',
    'hpp',
    'hxx',
    'inc',
    'f',
    'f77',
    'f90',
    'f95',
    'for',
    'ftn',
    'fpp',
    'pas',
    'pp',
    'inc',
    'dpr',
    'dpk',
    'hs',
    'lhs',
    'elm',
    'ml',
    'mli',
    'fsx',
    'fs',
    'erl',
    'hrl',
    'ex',
    'exs',
    'clj',
    'cljs',
    'cljc',
    'lisp',
    'lsp',
    'cl',
    'el',
    'scm',
    'ss',
    'rkt',
    'nim',
    'nims',
    'nimble',
    'cr',
    'jl',
    'zig',
    'v',
    'vv',
    'vsh',
    'gleam',
    'odin',
    'pony',
    // Markup and documentation
    'org',
    'tex',
    'latex',
    'bib',
    'wiki',
    'mediawiki',
    'textile',
    'creole',
    'pod',
    'rdoc',
    'man',
    // Configuration and data
    'inf',
    'reg',
    'desktop',
    'service',
    'timer',
    'mount',
    'automount',
    'swap',
    'target',
    'socket',
    'slice',
    'scope',
    'path',
    'device',
    'netdev',
    'network',
    'link',
    'zone',
    'policy',
    'pkla',
    // Web and API
    'graphql',
    'gql',
    'proto',
    'avsc',
    'avdl',
    'thrift',
    'capnp',
    'fbs',
    'yang',
    'yang',
    // Database and query languages
    'cql',
    'cypher',
    'sparql',
    'xquery',
    'xpath',
    'hql',
    'pig',
    'ql',
    'dml',
    'ddl',
    // Templating and DSL
    'styl',
    'stylus',
    'pug',
    'jade',
    'slim',
    'haml',
    'erb',
    'ejs',
    'nunjucks',
    'liquid',
    'ftl',
    'vm',
    'vtl',
    'art',
    'dot',
    'ect',
    // Build and automation
    'mk',
    'mak',
    'cmake',
    'bazel',
    'bzl',
    'build',
    'ninja',
    'gn',
    'gyp',
    'gypi',
    'waf',
    'scons',
    'ant',
    'ivy',
    'gradle',
    'mvn',
    'pom',
    'sbt',
    'mix',
    'rebar',
    'stack',
    'cabal',
    'opam',
    // CI/CD and deployment
    'jenkinsfile',
    'dockerfile',
    'containerfile',
    'compose',
    'stack',
    'swarm',
    'nomad',
    'consul',
    'terraform',
    'tf',
    'tfvars',
    'hcl',
    'pkr',
    'ansible',
    'playbook',
    'inventory',
    'vault',
    'k8s',
    'kube',
    'helm',
    'chart',
    'values',
    // Logs and monitoring
    'access',
    'error',
    'debug',
    'trace',
    'audit',
    'syslog',
    'dmesg',
    'kern',
    'mail',
    'cron',
    'auth',
    'daemon',
    'user',
    'local',
    'messages',
    // Version control
    'patch',
    'diff',
    'rej',
    'orig',
    'conflict',
    'gitkeep',
    'gitmodules',
    'gitattributes',
    'hgignore',
    'hgtags',
    'svnignore',
    // Package managers
    'podfile',
    'cartfile',
    'brewfile',
    'gemfile',
    'pipfile',
    'poetry',
    'pyproject',
    'setup',
    'requirements',
    'constraints',
    'manifest',
    'package-lock',
    'yarn',
    'pnpm-lock',
    'shrinkwrap',
    // IDE and editor
    'editorconfig',
    'prettierrc',
    'eslintrc',
    'tslint',
    'jsconfig',
    'tsconfig',
    'babelrc',
    'webpack',
    'rollup',
    'vite',
    'parcel',
    'snowpack',
    'esbuild',
    // Other text-based formats
    'ldif',
    'dsv',
    'psv',
    'ssv',
    'tab',
    'fixed',
    'arff',
    'weka',
    'libsvm',
    'bibtex',
    'ris',
    'endnote',
    'refer',
    'medline',
    'pubmed',
  ]);

  return textExtensions.has(extension.toLowerCase());
}
