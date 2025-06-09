export const stage4CodeGenerationPromptText = `
# ** BEGIN INSTRUCTIONS FOR LLM **

Your Primary task: Generate the source code files for the user's VIDA idea or design.

## RESPONSE FORMAT:

For each file, output in the following markdown format:

### {file path}
**Summary:** {brief description}

\`\`\`{language}
{file contents}
\`\`\`

- Use the correct language identifier for syntax highlighting (e.g., rust, js, py, etc.).
- Do NOT include any explanations or text outside the file blocks.
- Output all files in a single response, one after another.

**END OF INSTRUCTIONS FOR LLM**
`;