import { ParsedArgument } from '../types/argumentTypes';

export const parseArgumentResponse = (responseContent: string): ParsedArgument[] => {
  const lines = responseContent.split('\n').map(line => line.trim()).filter(line => line);
  let currentArgument: ParsedArgument | null = null;
  const parsedArguments: ParsedArgument[] = [];
  let currentSection = '';

  const SECTION_KEYS = {
    CONCLUSION: 'Conclusion:',
    PREMISES: 'Premises:',
    ASSUMPTIONS: 'Assumptions:',
    VALIDITY: 'Validity:',
    ARGUMENT_STATUS: 'Argument Status:',
  };

  // Helper function to add a new argument
  const addNewArgument = () => {
    if (currentArgument && currentArgument.conclusion) {
      parsedArguments.push(currentArgument);
    }
    currentArgument = {
      conclusion: '',
      premises: [],
      assumptions: [],
      validity: '',
      argumentStatus: ''
    };
    currentSection = '';
  };

  // Helper function to extract premise index
  const extractPremiseIndex = (text: string): number => {
    const match = text.match(/\(Premise #(\d+)\)$/);
    return match ? parseInt(match[1], 10) - 1 : -1;
  };

  // Regular expression to match "Argument X:"
  const argumentHeaderRegex = /^Argument \d+:/;

  addNewArgument();

  // Iterate over the lines to extract information
  lines.forEach(line => {
    if (argumentHeaderRegex.test(line)) {
      addNewArgument(); // Ensure the current argument is saved before starting a new one
    } else if (line.startsWith(SECTION_KEYS.CONCLUSION)) {
      currentSection = 'conclusion';
      currentArgument!.conclusion = line.replace(SECTION_KEYS.CONCLUSION, '').trim();
    } else if (line.startsWith(SECTION_KEYS.PREMISES)) {
      currentSection = 'premises';
    } else if (line.startsWith(SECTION_KEYS.ASSUMPTIONS)) {
      currentSection = 'assumptions';
    } else if (line.startsWith(SECTION_KEYS.VALIDITY)) {
      currentSection = 'validity';
      currentArgument!.validity = line.replace(SECTION_KEYS.VALIDITY, '').trim();
    } else if (line.startsWith(SECTION_KEYS.ARGUMENT_STATUS)) {
      currentSection = 'argumentStatus';
      currentArgument!.argumentStatus = line.replace(SECTION_KEYS.ARGUMENT_STATUS, '').trim();
    } else if (line.startsWith('- ')) {
      const content = line.replace('- ', '').trim();
      const premiseIndex = extractPremiseIndex(content);
      if (currentSection === 'premises') {
        currentArgument!.premises.push(content);
      } else if (currentSection === 'assumptions') {
        currentArgument!.assumptions.push({ text: content, premiseIndex });
      }
    }
  });
  
  // Add the last argument if it has a conclusion
  addNewArgument();

  return parsedArguments;
};