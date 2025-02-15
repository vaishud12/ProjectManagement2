import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: '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', // Your OpenAI API Key
  dangerouslyAllowBrowser: true,
});

const generateIncidentData = async (project) => {
  try {
    // Construct the prompt
    const prompt = `
      Based on the following project details, generate incident data:
      
      Project Name: ${project.projectname}
      Organization Name: ${project.organizationname}
      Sector: ${project.sector}
      Problem Statement: ${project.projectstatement}
      Solution: ${project.solutions}
      Expected Components: ${project.expectedcomponent}

      Provide:
      - Tag
      - PBI Number
      - Incident Name
      - Incident Description
    `;

    // API request to generate text completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can adjust the model type as needed
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const contentText = response.choices[0].message.content;

    console.log('API Response:', contentText);

    return {
      tag: 'Generated Tag', // Adjust as per your logic
      pbiNumber: 'PBI0001', // Adjust as per your logic
      incidentCategory: 'Generated Category', // Adjust as per your logic
      incidentName: 'Generated Incident Name', // Adjust as per your logic
      incidentDescription: contentText || 'No description provided',
      dateTime: new Date(),
      incidentOwner: 'admin', // Default or dynamic value
      status: 'Open',
      priority: 'High',
      incidentResolver: null,
    };
  } catch (error) {
    console.error('Error generating incident data using OpenAI API:', error);
    throw error;
  }
};

export default generateIncidentData;
  