import { CodePaths, FilePaths, SheetPaths, TextPaths } from '@librechat/client';
import type { QueryClient } from '@tanstack/react-query';
import type { EndpointFileConfig, TFile } from 'librechat-data-provider';
import {
  codeTypeMapping,
  fileConfig as defaultFileConfig,
  EToolResources,
  excelMimeTypes,
  megabyte,
  QueryKeys,
} from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';

export const partialTypes = ['text/x-'];

const textDocument = {
  paths: TextPaths,
  fill: '#FF5588',
  title: 'Document',
};

const spreadsheet = {
  paths: SheetPaths,
  fill: '#10A37F',
  title: 'Spreadsheet',
};

const codeFile = {
  paths: CodePaths,
  fill: '#FF6E3C',
  // TODO: make this dynamic to the language
  title: 'Code',
};

const artifact = {
  paths: CodePaths,
  fill: '#2D305C',
  title: 'Code',
};

export const fileTypes = {
  /* Category matches */
  file: {
    paths: FilePaths,
    fill: '#0000FF',
    title: 'File',
  },
  text: textDocument,
  txt: textDocument,
  // application:,

  /* Partial matches */
  csv: spreadsheet,
  'application/pdf': textDocument,
  pdf: textDocument,
  'text/x-': codeFile,
  artifact: artifact,

  /* Exact matches */
  // 'application/json':,
  // 'text/html':,
  // 'text/css':,
  // image,
};

// export const getFileType = (type = '') => {
//   let fileType = fileTypes.file;
//   const exactMatch = fileTypes[type];
//   const partialMatch = !exactMatch && partialTypes.find((type) => type.includes(type));
//   const category = (!partialMatch && (type.split('/')[0] ?? 'text') || 'text');

//   if (exactMatch) {
//     fileType = exactMatch;
//   } else if (partialMatch) {
//     fileType = fileTypes[partialMatch];
//   } else if (fileTypes[category]) {
//     fileType = fileTypes[category];
//   }

//   if (!fileType) {
//     fileType = fileTypes.file;
//   }

//   return fileType;
// };

export const getFileType = (
  type = '',
): {
  paths: React.FC;
  fill: string;
  title: string;
} => {
  // Direct match check
  if (fileTypes[type]) {
    return fileTypes[type];
  }

  if (excelMimeTypes.test(type)) {
    return spreadsheet;
  }

  // Partial match check
  const partialMatch = partialTypes.find((partial) => type.includes(partial));
  if (partialMatch && fileTypes[partialMatch]) {
    return fileTypes[partialMatch];
  }

  // Category check
  const category = type.split('/')[0] || 'text';
  if (fileTypes[category]) {
    return fileTypes[category];
  }

  // Default file type
  return fileTypes.file;
};

/**
 * Format a date string to a human readable format
 * @example
 * formatDate('2020-01-01T00:00:00.000Z') // '1 Jan 2020'
 */
export function formatDate(dateString: string, isSmallScreen = false) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (isSmallScreen) {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Adds a file to the query cache
 */
export function addFileToCache(queryClient: QueryClient, newfile: TFile) {
  const currentFiles = queryClient.getQueryData<TFile[]>([QueryKeys.files]);

  if (!currentFiles) {
    console.warn('No current files found in cache, skipped updating file query cache');
    return;
  }

  const fileIndex = currentFiles.findIndex((file) => file.file_id === newfile.file_id);

  if (fileIndex > -1) {
    console.warn('File already exists in cache, skipped updating file query cache');
    return;
  }

  queryClient.setQueryData<TFile[]>(
    [QueryKeys.files],
    [
      {
        ...newfile,
      },
      ...currentFiles,
    ],
  );
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return 0;
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
}

const { checkType } = defaultFileConfig;

// Helper function to check if a file extension is likely a text file
function isLikelyTextFile(extension: string): boolean {
  const textExtensions = [
    'txt',
    'md',
    'markdown',
    'rst',
    'log',
    'ini',
    'cfg',
    'conf',
    'config',
    'json',
    'xml',
    'html',
    'htm',
    'css',
    'scss',
    'sass',
    'less',
    'yaml',
    'yml',
    'toml',
    'csv',
    'tsv',
    'sql',
    'sh',
    'bash',
    'zsh',
    'fish',
    'ps1',
    'bat',
    'cmd',
    'py',
    'js',
    'ts',
    'jsx',
    'tsx',
    'vue',
    'svelte',
    'php',
    'rb',
    'go',
    'rs',
    'java',
    'kt',
    'swift',
    'c',
    'cpp',
    'cc',
    'cxx',
    'h',
    'hpp',
    'cs',
    'fs',
    'vb',
    'pl',
    'pm',
    'r',
    'm',
    'mm',
    'scala',
    'clj',
    'edn',
    'hs',
    'elm',
  ];
  return textExtensions.includes(extension.toLowerCase());
}

export const validateFiles = ({
  files,
  fileList,
  setError,
  endpointFileConfig,
  toolResource,
  fileConfig,
}: {
  fileList: File[];
  files: Map<string, ExtendedFile>;
  setError: (error: string) => void;
  endpointFileConfig: EndpointFileConfig;
  toolResource?: string;
  fileConfig: FileConfig | null;
}) => {
  const { fileLimit, fileSizeLimit, totalSizeLimit, supportedMimeTypes } = endpointFileConfig;
  const existingFiles = Array.from(files.values());
  const incomingTotalSize = fileList.reduce((total, file) => total + file.size, 0);
  if (incomingTotalSize === 0) {
    setError('com_error_files_empty');
    return false;
  }
  const currentTotalSize = existingFiles.reduce((total, file) => total + file.size, 0);

  if (fileLimit && fileList.length + files.size > fileLimit) {
    setError(`You can only upload up to ${fileLimit} files at a time.`);
    return false;
  }

  for (let i = 0; i < fileList.length; i++) {
    let originalFile = fileList[i];
    let fileType = originalFile.type;
    const extension = originalFile.name.split('.').pop() ?? '';
    const knownCodeType = codeTypeMapping[extension];

    console.log(`🚀 Processing file: ${originalFile.name}`);
    console.log(`📄 Original type: "${fileType}"`);
    console.log(`🔤 Extension: "${extension}"`);
    console.log(`🗂️ Known code type: "${knownCodeType}"`);

    // Infer MIME type for Known Code files when the type is empty or a mismatch
    if (knownCodeType && (!fileType || fileType !== knownCodeType)) {
      console.log(
        `🔧 Setting MIME type for ${originalFile.name} from extension "${extension}" to "${knownCodeType}"`,
      );
      fileType = knownCodeType;
    }

    // Check if the file type is still empty after the extension check
    if (!fileType) {
      console.log(
        `❓ No file type detected for ${originalFile.name} with extension "${extension}"`,
      );
      // Try to determine if it's likely a text file based on extension
      if (isLikelyTextFile(extension)) {
        fileType = 'text/plain';
        console.log(
          `✅ File ${originalFile.name} extension "${extension}" detected as likely text file, setting to text/plain`,
        );
      } else {
        // For file_search uploads, default to text/plain if we can't determine the type
        if (toolResource === 'file_search') {
          fileType = 'text/plain';
          console.log(
            `🔍 File ${originalFile.name} has unknown type, defaulting to text/plain for file_search upload`,
          );
        } else {
          console.log(`❌ Unable to determine file type for: ${originalFile.name}`);
          setError('Unable to determine file type for: ' + originalFile.name);
          return false;
        }
      }
    } else {
      console.log(`✅ File type already determined: ${originalFile.name} -> ${fileType}`);
    }

    // Replace empty type with inferred type
    if (originalFile.type !== fileType) {
      const newFile = new File([originalFile], originalFile.name, { type: fileType });
      originalFile = newFile;
      fileList[i] = newFile;
    }

    let mimeTypesToCheck = supportedMimeTypes;
    if (toolResource === EToolResources.context) {
      mimeTypesToCheck = [
        ...(fileConfig?.text?.supportedMimeTypes || []),
        ...(fileConfig?.ocr?.supportedMimeTypes || []),
        ...(fileConfig?.stt?.supportedMimeTypes || []),
        excelMimeTypes, // Add Excel support for context tool resource
      ];
    }

    if (!checkType(originalFile.type, mimeTypesToCheck)) {
      console.log(originalFile);
      setError('Currently, unsupported file type: ' + originalFile.type);
      return false;
    }

    if (fileSizeLimit && originalFile.size >= fileSizeLimit) {
      setError(`File size exceeds ${fileSizeLimit / megabyte} MB.`);
      return false;
    }
  }

  if (totalSizeLimit && currentTotalSize + incomingTotalSize > totalSizeLimit) {
    setError(`The total size of the files cannot exceed ${totalSizeLimit / megabyte} MB.`);
    return false;
  }

  const combinedFilesInfo = [
    ...existingFiles.map(
      (file) =>
        `${file.file?.name ?? file.filename}-${file.size}-${file.type?.split('/')[0] ?? 'file'}`,
    ),
    ...fileList.map(
      (file: File | undefined) =>
        `${file?.name}-${file?.size}-${file?.type.split('/')[0] ?? 'file'}`,
    ),
  ];

  const uniqueFilesSet = new Set(combinedFilesInfo);

  if (uniqueFilesSet.size !== combinedFilesInfo.length) {
    setError('com_error_files_dupe');
    return false;
  }

  return true;
};
