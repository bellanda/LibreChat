import { logger } from '@librechat/data-schemas';
import axios from 'axios';
import type { Request as ServerRequest } from 'express';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { FileSources } from 'librechat-data-provider';
import { generateShortLivedToken } from '~/crypto/jwt';
import { logAxiosError, readFileAsString } from '~/utils';

/**
 * Attempts to parse text using RAG API, falls back to native text parsing
 * @param params - The parameters object
 * @param params.req - The Express request object
 * @param params.file - The uploaded file
 * @param params.file_id - The file ID
 * @returns
 */
export async function parseText({
  req,
  file,
  file_id,
}: {
  req: Pick<ServerRequest, 'user'> & {
    user?: { id: string };
  };
  file: Express.Multer.File;
  file_id: string;
}): Promise<{ text: string; bytes: number; source: string }> {
  if (!process.env.RAG_API_URL) {
    logger.debug('[parseText] RAG_API_URL not defined, falling back to native text parsing');
    return parseTextNative(file);
  }

  const userId = req.user?.id;
  if (!userId) {
    logger.debug('[parseText] No user ID provided, falling back to native text parsing');
    return parseTextNative(file);
  }

  try {
    const healthResponse = await axios.get(`${process.env.RAG_API_URL}/health`, {
      timeout: 5000, // Reduced timeout for faster fallback
    });
    if (healthResponse?.statusText !== 'OK' && healthResponse?.status !== 200) {
      logger.debug('[parseText] RAG API health check failed, falling back to native parsing');
      return parseTextNative(file);
    }
  } catch (healthError) {
    logAxiosError({
      message: '[parseText] RAG API health check failed, falling back to native parsing:',
      error: healthError,
    });
    return parseTextNative(file);
  }

  try {
    const jwtToken = generateShortLivedToken(userId);
    const formData = new FormData();
    formData.append('file_id', file_id);
    formData.append('file', createReadStream(file.path));

    const formHeaders = formData.getHeaders();

    const response = await axios.post(`${process.env.RAG_API_URL}/text`, formData, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        accept: 'application/json',
        ...formHeaders,
      },
      timeout: 30000,
    });

    const responseData = response.data;
    logger.debug(`[parseText] RAG API completed successfully (${response.status})`);

    if (!('text' in responseData)) {
      throw new Error('RAG API did not return parsed text');
    }

    // Log do conteúdo recebido do RAG API para debug
    logger.info(`📄 [parseText] Conteúdo recebido do RAG API para arquivo ${file.originalname}:`);
    logger.info(`📄 [parseText] Tamanho do conteúdo: ${responseData.text.length} caracteres`);
    logger.info(`📄 [parseText] Primeiros 500 caracteres: ${responseData.text.substring(0, 500)}`);
    logger.info(
      `📄 [parseText] Últimos 500 caracteres: ${responseData.text.substring(responseData.text.length - 500)}`,
    );
    logger.info(`📄 [parseText] Conteúdo completo:\n${responseData.text}`);

    return {
      text: responseData.text,
      bytes: Buffer.byteLength(responseData.text, 'utf8'),
      source: FileSources.text,
    };
  } catch (error) {
    // Se for erro de tamanho (413), não fazer fallback - propagar o erro
    if (axios.isAxiosError(error) && error.response?.status === 413) {
      logAxiosError({
        message: '[parseText] RAG API returned file too large error',
        error,
      });
      throw new Error(error.response?.data?.detail || 'File too large for text processing');
    }

    // Para outros erros, fazer fallback
    logAxiosError({
      message: '[parseText] RAG API text parsing failed, falling back to native parsing',
      error,
    });
    return parseTextNative(file);
  }
}

/**
 * Native JavaScript text parsing fallback
 * Simple text file reading - complex formats handled by RAG API
 * @param file - The uploaded file
 * @returns
 */
export async function parseTextNative(file: Express.Multer.File): Promise<{
  text: string;
  bytes: number;
  source: string;
}> {
  const { content: text, bytes } = await readFileAsString(file.path, {
    fileSize: file.size,
  });

  return {
    text,
    bytes,
    source: FileSources.text,
  };
}
