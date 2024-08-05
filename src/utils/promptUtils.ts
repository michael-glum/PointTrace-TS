export const makeInputPrompt = (inputValue: string) => {
  return `Analyze the following text and determine if it contains one or more arguments.
      If it does, break each argument down into Conclusion, Premises, and Assumptions in their simplest forms.
      Ensure you include both explicit and implicit assumptions, noting the premise each assumption is derived from.
      Additionally, evaluate the logical validity / soundness of each argument.
      Opinions are considered arguments, but they are invalid.
      If the text does not contain an argument, clearly state that it is not an argument.
      If there are multiple sides being argued, compare the different arguments.
      Determine if the arguments are equivalent and identify the true points of contention within the argument, such as misalignment of their premises or assumptions.

      Text: "${inputValue}"
      Response Format:

      Argument [n]:
      Conclusion: [state the conclusion]
      Premises:
      - [premise 1]
      - [premise 2]
      - ...
      Assumptions:
      - [assumption 1] (Premise #)
      - [assumption 2] (Premise #)
      - ...
      Validity: [state if the argument is valid based solely on the premises and why]
      Argument Status: [state “This is an argument” or “This is not an argument”]

      If there are multiple sides, use the same format for each argument.

      Example Text:

      "Public transportation should be free for all because it reduces traffic congestion and provides equal access to mobility. Also, increased use of public transportation would reduce pollution."

      Example Response:

      Argument 1:
      Conclusion: Public transportation should be free for all.
      Premises:
      - Public transportation reduces traffic congestion.
      - Free public transportation promotes equal access to mobility.
      - Increased use of public transport reduces environmental pollution.
      Assumptions:
      - Reduced traffic congestion benefits society. (Premise #1)
      - People will use public transportation more if it is free. (Premise #1)
      - Equal access to mobility is a societal good. (Premise #2)
      - The cost of free public transport can be covered by other means. (Premise #2)
      - Reduced pollution has a positive environmental impact. (Premise #3)
      - Increased public transportation use leads to a decrease in personal vehicle use. (Premise #3)
      - There is no alternative solution that would be more efficient and/or effective at reducing environmental pollution and should take priority over free public transport. (Premise #3)
      Validity: The argument is invalid because even if each premise is proven to be true, the conclusion can still be false if the implicit assumptions are false. For example, even if all of the premises about the benefits of providing free public transport are true, there could still be another option that is better at providing those same benefits. Therefore, there could be a tradeoff scenario in which only one of the two options can be chosen and the decision has to be made to not make public transportation free, in favor of a better solution. It follows then, in that scenario, that public transportation should not be free for all.
      Argument Status: This is an argument.
  `;
};

export const InitialInstructions = 'You are an assistant that analyzes arguments and breaks them down into Conclusion, Premises, and Assumptions. Additionally, evaluate the logical validity of the argument. An argument is valid if, if all of its premises (not assumptions) are true, it always has to be true. Opinions are considered arguments.';