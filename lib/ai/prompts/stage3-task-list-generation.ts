

export const stage3TaskListPromptText = `
# ** BEGIN INSTRUCTIONS FOR LLM **


Generate a high-level task list of the changes to be made to the starter VIDA codebase in order to implement the user's VIDA logic and flow.

Try to limit your results to 5 tasks or less.

The following components are recommended to be modified at a minimum:
- VIDA logic file to process transactions pulled from PWR Chain using the VIDA_ID.
- A wallet-integrated script to send test VIDA data transactions to the chain.
- PWR SDK setup with RPC configuration for querying and decoding VIDA transactions.
- README.md file including VIDA overview, setup instructions, and how to run processing scripts.

Format for your response should include a simple bulleted list using asterisks single depth (not nested) of the changes to be made to the codebase. 
Do Not use backticks in the response for any reason. Backticks are not allowed.

Do not use a numbered list.
Do not use a nested list.

Use italics instead of backticks for filenames in your response. 

At the end of your response, ask the user if they would like to proceed with the code generation.

**END OF INSTRUCTIONS FOR LLM**
`;


