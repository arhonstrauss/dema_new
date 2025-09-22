import { openaiCompletion } from './openaiClient.js';
export async function synthesizeToJSON(rawOutput) {
    const synthesisPrompt = `You are a political analysis expert. Please analyze the following text and extract political information into a structured JSON format.

Raw text to analyze:
${rawOutput}

Please provide a JSON response with the following structure:
{
  "politicalLeanings": {
    "estimate": "Left/Right/Center/Unknown with specific details",
    "confidence": 0.85,
    "reasoning": "Brief explanation of the evidence used"
  },
  "keyIssues": [
    {
      "issue": "Specific political issue (e.g., 'Healthcare Policy', 'Climate Change')",
      "stance": "Support/Oppose/Neutral/Unknown with details",
      "confidence": 0.8,
      "reasoning": "Evidence for this stance"
    }
  ],
  "summary": "One paragraph summary of the person's political profile"
}

Guidelines:
- Use confidence scores from 0.0 to 1.0
- Be specific in estimates and stances
- Include reasoning for all assessments
- If information is unclear or missing, use "Unknown" and low confidence
- Focus on concrete evidence from the text
- Only output valid json, do not wrap in md code fences or anything else`;
    const requestBody = {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        instructions: "You are a political analysis expert who extracts structured information from text about people's political views and positions.",
        input: synthesisPrompt,
        temperature: 0.1,
    };
    try {
        const response = await openaiCompletion(requestBody);
        // Extract the text content from the response
        let jsonText = '';
        console.log("TEXT  " + response.output[0].content[0].text);
        if (response.output && response.output[0] && response.output[0].content && response.output[0].content[0]) {
            jsonText = response.output[0].content[0].text;
        }
        else if (response.choices && response.choices[0] && response.choices[0].message) {
            // Fallback for chat completions format
            jsonText = response.choices[0].message.content;
        }
        else {
            throw new Error('Unexpected response format from synthesis API');
        }
        // Parse the JSON response
        const analysis = JSON.parse(jsonText);
        // Validate the structure
        if (!analysis.politicalLeanings || !analysis.keyIssues || !analysis.summary) {
            throw new Error('Invalid JSON structure returned from synthesis');
        }
        // INSERT_YOUR_CODE
        // Attach the full text used for synthesis to the analysis object for reference
        analysis.fullOutput = rawOutput;
        return analysis;
    }
    catch (error) {
        console.error('Error in JSON synthesis:', error);
        throw new Error(`Failed to synthesize results to JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=jsonSynthesis.js.map