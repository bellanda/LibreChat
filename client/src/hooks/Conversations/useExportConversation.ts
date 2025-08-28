import { useQueryClient } from '@tanstack/react-query';
import download from 'downloadjs';
import exportFromJSON from 'export-from-json';
import type {
  TConversation,
  TMessage,
  TMessageContentParts,
  TPreset,
} from 'librechat-data-provider';
import {
  buildTree,
  ContentTypes,
  imageGenTools,
  isImageVisionTool,
  QueryKeys,
  ToolCallTypes,
} from 'librechat-data-provider';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useBuildMessageTree from '~/hooks/Messages/useBuildMessageTree';
import { useScreenshot } from '~/hooks/ScreenshotContext';
import { cleanupPreset } from '~/utils';

type ExportValues = {
  fieldName: string;
  fieldValues: string[];
};
type ExportEntries = ExportValues[];

export default function useExportConversation({
  conversation,
  filename,
  type,
  includeOptions,
  exportBranches,
  recursive,
  lastMessageOnly,
}: {
  conversation: TConversation | null;
  filename: string;
  type: string;
  includeOptions: boolean | 'indeterminate';
  exportBranches: boolean | 'indeterminate';
  recursive: boolean | 'indeterminate';
  lastMessageOnly: boolean | 'indeterminate';
}) {
  const queryClient = useQueryClient();
  const { captureScreenshot } = useScreenshot();
  const buildMessageTree = useBuildMessageTree();

  const { conversationId: paramId } = useParams();

  const getMessageTree = useCallback(() => {
    const queryParam =
      paramId === 'new' ? paramId : (conversation?.conversationId ?? paramId ?? '');
    const messages = queryClient.getQueryData<TMessage[]>([QueryKeys.messages, queryParam]) ?? [];
    const dataTree = buildTree({ messages });
    return dataTree?.length === 0 ? null : (dataTree ?? null);
  }, [paramId, conversation?.conversationId, queryClient]);

  const getMessageText = (message: Partial<TMessage> | undefined, format = 'text') => {
    if (!message) {
      return '';
    }

    const formatText = (sender: string, text: string) => {
      if (format === 'text') {
        return `>> ${text}`;
      }
      return `${text}`;
    };

    if (!message.content) {
      return formatText(message.sender || '', message.text || '');
    }

    return message.content
      .map((content) => getMessageContent(message.sender || '', content))
      .map((text) => {
        return formatText(text[0], text[1]);
      })
      .join('\n\n\n');
  };
  const getLastBotMessage = async () => {
    const messages = await buildMessageTree({
      messageId: conversation?.conversationId,
      message: null,
      messages: getMessageTree(),
      branches: Boolean(exportBranches),
      recursive: false,
    });

    const allMessages = Array.isArray(messages) ? messages : [messages];
    const validMessages = allMessages.filter((msg) => msg && msg.messageId) as TMessage[];

    // Encontrar a última mensagem do bot
    for (let i = validMessages.length - 1; i >= 0; i--) {
      const msg = validMessages[i];
      if (msg.isCreatedByUser === false) {
        return msg;
      }
    }

    return null;
  };

  // Função para gerar markdown da última mensagem apenas
  const exportLastMessageMarkdown = async () => {
    // let data = '# Last Bot Message\n';

    let data = '';

    if (includeOptions === true) {
      data += '\n## Options\n';
      const options = cleanupPreset({ preset: conversation as TPreset });
      for (const key of Object.keys(options)) {
        data += `- ${key}: ${options[key]}\n`;
      }
    }

    const lastMessage = await getLastBotMessage();

    if (lastMessage) {
      // data += '\n## Message\n';
      data += `${getMessageText(lastMessage, 'md')}\n`;
      if (lastMessage.error) {
        data += '*(This is an error message)*\n';
      }
      if (lastMessage.unfinished === true) {
        data += '*(This is an unfinished message)*\n';
      }
    } else {
      data += '\n## Message\n';
      data += '*No bot messages found*\n';
    }

    return data;
  };

  // Exportar HTML via API Python (using backend proxy)
  const exportHTML = async () => {
    const markdown =
      lastMessageOnly === true ? await exportLastMessageMarkdown() : await exportMarkdown();
    if (typeof markdown !== 'string') {
      console.error('Erro: markdown não é uma string válida');
      return;
    }
    const formData = new FormData();
    const file = new Blob([markdown], { type: 'text/markdown' });
    formData.append('file', file, 'conversation.md');

    // Use backend proxy instead of direct API call
    const response = await fetch('/api/python-tools/convert/md-to-html', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      console.error('Erro ao exportar HTML');
      return;
    }
    const blob = await response.blob();
    download(blob, `${filename}.html`);
  };

  // Exportar PDF via API Python (using backend proxy)
  const exportPDF = async () => {
    const markdown =
      lastMessageOnly === true ? await exportLastMessageMarkdown() : await exportMarkdown();
    if (typeof markdown !== 'string') {
      console.error('Erro: markdown não é uma string válida');
      return;
    }
    const formData = new FormData();
    const file = new Blob([markdown], { type: 'text/markdown' });
    formData.append('file', file, 'conversation.md');

    // Use backend proxy instead of direct API call
    const response = await fetch('/api/python-tools/convert/md-to-pdf', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      console.error('Erro ao exportar PDF');
      return;
    }
    const blob = await response.blob();
    download(blob, `${filename}.pdf`);
  };

  /**
   * Format and return message texts according to the type of content.
   * Currently, content whose type is `TOOL_CALL` basically returns JSON as is.
   * In the future, different formatted text may be returned for each type.
   */
  const getMessageContent = (sender: string, content?: TMessageContentParts): string[] => {
    if (!content) {
      return [];
    }

    if (content.type === ContentTypes.ERROR) {
      // ERROR
      return [
        sender,
        typeof content[ContentTypes.TEXT] === 'object'
          ? (content[ContentTypes.TEXT].value ?? '')
          : (content[ContentTypes.TEXT] ?? ''),
      ];
    }

    if (content.type === ContentTypes.TEXT) {
      // TEXT
      const textPart = content[ContentTypes.TEXT];
      const text = typeof textPart === 'string' ? textPart : textPart.value;
      return [sender, text];
    }

    if (content.type === ContentTypes.TOOL_CALL) {
      const type = content[ContentTypes.TOOL_CALL].type;

      if (type === ToolCallTypes.CODE_INTERPRETER) {
        // CODE_INTERPRETER
        const toolCall = content[ContentTypes.TOOL_CALL];
        const code_interpreter = toolCall[ToolCallTypes.CODE_INTERPRETER];
        return ['Code Interpreter', JSON.stringify(code_interpreter)];
      }

      if (type === ToolCallTypes.RETRIEVAL) {
        // RETRIEVAL
        const toolCall = content[ContentTypes.TOOL_CALL];
        return ['Retrieval', JSON.stringify(toolCall)];
      }

      if (
        type === ToolCallTypes.FUNCTION &&
        imageGenTools.has(content[ContentTypes.TOOL_CALL].function.name)
      ) {
        // IMAGE_GENERATION
        const toolCall = content[ContentTypes.TOOL_CALL];
        return ['Tool', JSON.stringify(toolCall)];
      }

      if (type === ToolCallTypes.FUNCTION) {
        // IMAGE_VISION
        const toolCall = content[ContentTypes.TOOL_CALL];
        if (isImageVisionTool(toolCall)) {
          return ['Tool', JSON.stringify(toolCall)];
        }
        return ['Tool', JSON.stringify(toolCall)];
      }
    }

    if (content.type === ContentTypes.IMAGE_FILE) {
      // IMAGE
      const imageFile = content[ContentTypes.IMAGE_FILE];
      return ['Image', JSON.stringify(imageFile)];
    }

    return [sender, JSON.stringify(content)];
  };

  const exportScreenshot = async () => {
    let data;
    try {
      data = await captureScreenshot();
    } catch (err) {
      console.error('Failed to capture screenshot');
      return console.error(err);
    }
    download(data, `${filename}.png`, 'image/png');
  };

  const exportCSV = async () => {
    const data: Partial<TMessage>[] = [];

    const messages = await buildMessageTree({
      messageId: conversation?.conversationId,
      message: null,
      messages: getMessageTree(),
      branches: Boolean(exportBranches),
      recursive: false,
    });

    if (Array.isArray(messages)) {
      for (const message of messages) {
        if (!message) {
          continue;
        }
        data.push(message);
      }
    } else {
      if (messages && messages.messageId) {
        data.push(messages as TMessage);
      }
    }

    exportFromJSON({
      data: data,
      fileName: filename,
      extension: 'csv',
      exportType: exportFromJSON.types.csv,
      beforeTableEncode: (entries: ExportEntries | undefined) => [
        {
          fieldName: 'sender',
          fieldValues: entries?.find((e) => e.fieldName == 'sender')?.fieldValues ?? [],
        },
        {
          fieldName: 'text',
          fieldValues: entries?.find((e) => e.fieldName == 'text')?.fieldValues ?? [],
        },
        {
          fieldName: 'isCreatedByUser',
          fieldValues: entries?.find((e) => e.fieldName == 'isCreatedByUser')?.fieldValues ?? [],
        },
        {
          fieldName: 'error',
          fieldValues: entries?.find((e) => e.fieldName == 'error')?.fieldValues ?? [],
        },
        {
          fieldName: 'unfinished',
          fieldValues: entries?.find((e) => e.fieldName == 'unfinished')?.fieldValues ?? [],
        },
        {
          fieldName: 'messageId',
          fieldValues: entries?.find((e) => e.fieldName == 'messageId')?.fieldValues ?? [],
        },
        {
          fieldName: 'parentMessageId',
          fieldValues: entries?.find((e) => e.fieldName == 'parentMessageId')?.fieldValues ?? [],
        },
        {
          fieldName: 'createdAt',
          fieldValues: entries?.find((e) => e.fieldName == 'createdAt')?.fieldValues ?? [],
        },
      ],
    });
  };

  const exportMarkdown = async () => {
    let data =
      '# Conversation\n' +
      `- conversationId: ${conversation?.conversationId}\n` +
      `- endpoint: ${conversation?.endpoint}\n` +
      `- title: ${conversation?.title}\n` +
      `- exportAt: ${new Date().toTimeString()}\n`;

    if (includeOptions === true) {
      data += '\n## Options\n';
      const options = cleanupPreset({ preset: conversation as TPreset });

      for (const key of Object.keys(options)) {
        data += `- ${key}: ${options[key]}\n`;
      }
    }

    const messages = await buildMessageTree({
      messageId: conversation?.conversationId,
      message: null,
      messages: getMessageTree(),
      branches: Boolean(exportBranches),
      recursive: false,
    });

    data += '\n## History\n';
    if (Array.isArray(messages)) {
      for (const message of messages) {
        data += `${getMessageText(message, 'md')}\n`;
        if (message?.error) {
          data += '*(This is an error message)*\n';
        }
        if (message?.unfinished === true) {
          data += '*(This is an unfinished message)*\n';
        }
        data += '\n\n';
      }
    } else {
      // Quando branches estiver desabilitado, exportar apenas a última pergunta do usuário e a última resposta da IA
      const allMessages = Array.isArray(messages) ? messages : [messages];
      const validMessages = allMessages.filter((msg) => msg && msg.messageId) as TMessage[];

      if (validMessages.length > 0) {
        // Encontrar a última pergunta do usuário e a última resposta da IA
        let lastUserMessage: TMessage | undefined;
        let lastAiMessage: TMessage | undefined;

        // Percorrer as mensagens do final para o início para encontrar as últimas
        for (let i = validMessages.length - 1; i >= 0; i--) {
          const msg = validMessages[i];
          if (!lastUserMessage && msg.isCreatedByUser === true) {
            lastUserMessage = msg;
          }
          if (!lastAiMessage && msg.isCreatedByUser === false) {
            lastAiMessage = msg;
          }
          // Se já encontrou ambos, pode parar
          if (lastUserMessage && lastAiMessage) {
            break;
          }
        }

        // Adicionar a última pergunta do usuário
        if (lastUserMessage) {
          data += `${getMessageText(lastUserMessage, 'md')}\n`;
          if (lastUserMessage.error) {
            data += '*(This is an error message)*\n';
          }
          if (lastUserMessage.unfinished === true) {
            data += '*(This is an unfinished message)*\n';
          }
          data += '\n\n';
        }

        // Adicionar a última resposta da IA
        if (lastAiMessage) {
          data += `${getMessageText(lastAiMessage, 'md')}\n`;
          if (lastAiMessage.error) {
            data += '*(This is an error message)*\n';
          }
          if (lastAiMessage.unfinished === true) {
            data += '*(This is an unfinished message)*\n';
          }
          data += '\n\n';
        }
      }
    }

    if (type === 'markdown') {
      exportFromJSON({
        data: data,
        fileName: filename,
        extension: 'md',
        exportType: exportFromJSON.types.txt,
      });
    }

    return data;
  };

  const exportText = async () => {
    let data =
      'Conversation\n' +
      '########################\n' +
      `conversationId: ${conversation?.conversationId}\n` +
      `endpoint: ${conversation?.endpoint}\n` +
      `title: ${conversation?.title}\n` +
      `exportAt: ${new Date().toTimeString()}\n`;

    if (includeOptions === true) {
      data += '\nOptions\n########################\n';
      const options = cleanupPreset({ preset: conversation as TPreset });

      for (const key of Object.keys(options)) {
        data += `${key}: ${options[key]}\n`;
      }
    }

    const messages = await buildMessageTree({
      messageId: conversation?.conversationId,
      message: null,
      messages: getMessageTree(),
      branches: false,
      recursive: false,
    });

    data += '\nHistory\n########################\n';
    if (Array.isArray(messages)) {
      for (const message of messages) {
        data += `${getMessageText(message)}\n`;
        if (message?.error) {
          data += '(This is an error message)\n';
        }
        if (message?.unfinished === true) {
          data += '(This is an unfinished message)\n';
        }
        data += '\n\n';
      }
    } else if (messages && typeof messages === 'object' && 'messageId' in messages) {
      data += `${getMessageText(messages as TMessage)}\n`;
      if ((messages as TMessage).error) {
        data += '(This is an error message)\n';
      }
      if ((messages as TMessage).unfinished === true) {
        data += '(This is an unfinished message)\n';
      }
      data += '\n\n';
    }

    exportFromJSON({
      data: data,
      fileName: filename,
      extension: 'txt',
      exportType: exportFromJSON.types.txt,
    });
  };

  const exportJSON = async () => {
    const data = {
      conversationId: conversation?.conversationId,
      endpoint: conversation?.endpoint,
      title: conversation?.title,
      exportAt: new Date().toTimeString(),
      branches: exportBranches,
      recursive: recursive,
    };

    if (includeOptions === true) {
      data['options'] = cleanupPreset({ preset: conversation as TPreset });
    }

    const messages = await buildMessageTree({
      messageId: conversation?.conversationId,
      message: null,
      messages: getMessageTree(),
      branches: Boolean(exportBranches),
      recursive: Boolean(recursive),
    });

    if (recursive === true && !Array.isArray(messages)) {
      data['messagesTree'] = messages.children;
    } else {
      data['messages'] = messages;
    }

    exportFromJSON({
      data: data,
      fileName: filename,
      extension: 'json',
      exportType: exportFromJSON.types.json,
    });
  };

  const exportConversation = () => {
    if (type === 'json') {
      exportJSON();
    } else if (type == 'text') {
      exportText();
    } else if (type == 'markdown') {
      exportMarkdown();
    } else if (type == 'csv') {
      exportCSV();
    } else if (type == 'screenshot') {
      exportScreenshot();
    } else if (type === 'webpage') {
      exportHTML();
    } else if (type === 'pdf') {
      exportPDF();
    }
  };

  return { exportConversation };
}
