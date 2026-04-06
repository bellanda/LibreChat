const { z } = require('zod');
const { Tools } = require('librechat-data-provider');
const { tool: toolFn } = require('@langchain/core/tools');

/**
 * Funções principais:
  - optimizeSchema() — Remove descrições dos schemas Zod, mantendo apenas tipos (string, number, boolean, optional)
  - optimizeDescription() — Encurta descrições: usa versões pré-definidas para ferramentas principais ou trunca para a primeira frase/100 caracteres
  - optimizeToolInPlace() — Modifica uma ferramenta existente in-place (preserva propriedades internas do LangChain)
  - createOptimizedTool() — Cria uma nova ferramenta otimizada do zero
 */

const createLiteSchema = (toolName) => {
  if (toolName === Tools.file_search) {
    return z.object({
      query: z.string(),
    });
  }
  if (toolName === Tools.execute_code) {
    return z.object({
      code: z.string(),
      lang: z.string().optional(),
    });
  }
  if (toolName === Tools.web_search) {
    return z.object({
      query: z.string(),
    });
  }
  return null;
};

/**
 * Lite descriptions for core tools in auto mode
 */
const liteToolDescriptions = {
  [Tools.execute_code]: 'Run code in a sandbox.',
  [Tools.file_search]: 'Search uploaded files.',
  [Tools.web_search]: 'Search the web.',
};

/**
 * Optimizes a tool schema by removing descriptions and simplifying structure
 * @param {z.ZodType} schema - Original Zod schema
 * @param {boolean} isAutoMode - Whether auto mode is active
 * @returns {z.ZodType} Optimized schema
 */
function optimizeSchema(schema, isAutoMode = false) {
  if (!isAutoMode || !schema) {
    return schema;
  }

  // For core tools, use ultra-simplified schemas
  // For other tools, try to remove descriptions from schema fields
  try {
    // If it's a Zod object, try to simplify it
    if (schema._def?.typeName === 'ZodObject') {
      const shape = schema._def?.shape();
      if (shape) {
        const simplifiedShape = {};
        for (const [key, value] of Object.entries(shape)) {
          // Remove descriptions from field schemas
          if (value?._def?.typeName === 'ZodString') {
            simplifiedShape[key] = z.string();
          } else if (value?._def?.typeName === 'ZodNumber') {
            simplifiedShape[key] = z.number();
          } else if (value?._def?.typeName === 'ZodBoolean') {
            simplifiedShape[key] = z.boolean();
          } else if (value?._def?.typeName === 'ZodOptional') {
            const innerType = value._def?.innerType;
            if (innerType?._def?.typeName === 'ZodString') {
              simplifiedShape[key] = z.string().optional();
            } else if (innerType?._def?.typeName === 'ZodNumber') {
              simplifiedShape[key] = z.number().optional();
            } else {
              simplifiedShape[key] = value;
            }
          } else {
            // Keep complex types as-is but try to remove descriptions
            simplifiedShape[key] = value;
          }
        }
        return z.object(simplifiedShape);
      }
    }
  } catch (error) {
    // If optimization fails, return original schema
    return schema;
  }

  return schema;
}

/**
 * Optimizes a tool description for auto mode
 * @param {string} toolName - Name of the tool
 * @param {string} originalDescription - Original description
 * @param {boolean} isAutoMode - Whether auto mode is active
 * @returns {string} Optimized description
 */
function optimizeDescription(toolName, originalDescription, isAutoMode = false) {
  if (!isAutoMode) {
    return originalDescription;
  }

  // Use lite descriptions for core tools
  if (liteToolDescriptions[toolName]) {
    return liteToolDescriptions[toolName];
  }

  // For other tools, truncate description to first sentence or 100 chars
  if (originalDescription && originalDescription.length > 100) {
    const firstSentence = originalDescription.split(/[.!?]/)[0];
    return firstSentence.length > 0 && firstSentence.length <= 100
      ? firstSentence
      : originalDescription.substring(0, 100).trim();
  }

  return originalDescription || '';
}

/**
 * Optimizes an existing tool by modifying its schema and description in-place.
 * Preserves all internal LangChain properties needed for execution.
 * @param {Object} tool - Original tool instance
 * @param {boolean} isAutoMode - Whether auto mode is active
 * @returns {Object} Optimized tool (same instance, modified)
 */
function optimizeToolInPlace(tool, isAutoMode = false) {
  if (!isAutoMode || !tool) {
    return tool;
  }

  if (tool.name === Tools.execute_code) {
    const optimizedDescription = optimizeDescription(tool.name, tool.description, isAutoMode);
    if (optimizedDescription) {
      tool.description = optimizedDescription;
    }
    return tool;
  }

  // For other tools, optimize both schema and description
  const optimizedSchema = createLiteSchema(tool.name)
    ? createLiteSchema(tool.name)
    : optimizeSchema(tool.schema, isAutoMode);

  const optimizedDescription = optimizeDescription(tool.name, tool.description, isAutoMode);

  // Modify the tool in-place to preserve internal properties
  if (optimizedSchema && tool.schema) {
    tool.schema = optimizedSchema;
  }

  if (optimizedDescription) {
    tool.description = optimizedDescription;
  }

  return tool;
}

/**
 * Creates an optimized tool instance for auto mode.
 * Only use when creating a new tool. Prefer optimizeToolInPlace() to preserve LangChain internals.
 * @param {Object} params
 * @param {Function} params.toolCall - Original tool's _call function
 * @param {string} params.name - Tool name
 * @param {z.ZodType} params.schema - Original schema
 * @param {string} params.description - Original description
 * @param {boolean} params.isAutoMode - Whether auto mode is active
 * @param {Object} params.extraProps - Extra properties to include
 * @returns {Object} Optimized tool instance
 */
function createOptimizedTool({ toolCall, name, schema, description, isAutoMode, extraProps = {} }) {
  // Use lite schema for core tools, or optimize existing schema
  const optimizedSchema =
    isAutoMode && createLiteSchema(name)
      ? createLiteSchema(name)
      : optimizeSchema(schema, isAutoMode);

  const optimizedDescription = optimizeDescription(name, description, isAutoMode);

  const toolDefinition = {
    name,
    schema: optimizedSchema || schema,
    description: optimizedDescription,
    ...extraProps,
  };

  return toolFn(toolCall, toolDefinition);
}

/**
 * Checks if a tool should be optimized in auto mode
 * @param {string} toolName - Name of the tool
 * @returns {boolean} Whether tool has a lite schema available
 */
function hasLiteSchema(toolName) {
  return !!createLiteSchema(toolName);
}

module.exports = {
  createLiteSchema,
  liteToolDescriptions,
  optimizeSchema,
  optimizeDescription,
  optimizeToolInPlace,
  createOptimizedTool,
  hasLiteSchema,
};
