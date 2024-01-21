"use server";

import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
import {
  AgentExecutor,
  AgentFinish,
  AgentStep,
} from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { RunnableSequence } from "langchain/runnables";
import { AIMessage, BaseMessage, FunctionMessage } from "langchain/schema";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { DynamicTool } from "@langchain/community/tools/dynamic";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { FunctionsAgentAction } from "langchain/agents/openai/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";


const researchAgent = async (topic: any) => {
    try {
    const llm = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-1106",
    });
    
    const searchTool = new DynamicTool({
      name: "web-search-tool",
      description: "Tool for getting the latest information from the web",
      func: async (searchQuery: string, runManager) => {
          const retriever = new TavilySearchAPIRetriever({apiKey:process.env.TAVLY_SEARCH_API});
        const docs = await retriever.invoke(
          searchQuery,
          runManager?.getChild()
          );
          return docs.map((doc) => doc.pageContent).join("\n-----\n");
        },
    });
    const prompt = ChatPromptTemplate.fromMessages([
      [
          "system",
          "You are a helpful assistant who will provide a tutorial about the given topic. You should give the response that synchronize all the schema items. You must always call one of the provided tools.",
        ],
        ["user", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    const responseSchema = z.object({
      moduleOverview: z.string().describe("A brief overview of what will be cover in this tutorial to return to the user in a paragraph form"),
      learningObjectives: z.array(z.string().describe("The list of learning objectives of the tutorial to return to the user")),
      prerequisites: z.array(z.string().describe("The list of prerequisites that are required before starting this tutorial to return to the user")),
      introduction: z.array(z.object({heading:z.string().describe("A heading related to the paragraph property of this object to return to the user"),paragraph:z.string().describe("A comprehensive paragrapph related to that heading"),imgUrl:z.string().describe("any image url that will be a visual aid for this paragraph"),headingNumber:z.number().describe("size of the heading in format 1:main heading,2:subheading,3:small subheading")}).describe("this object contains the heading, paragraph related to that heading, image url for viusal aid and heading number for styling purpose.")).describe("this array will contain all the major content related to the introduction about the input topic in an object of heading and paragraphs format to return to the user"),
      exampleCode: z.object({beforeCodeExplanation:z.string().describe("This property will include the explanation about code that could occur before the code"), code:z.object({languageName:z.string().describe("This property will contain the language of the code"),code:z.array(z.string().describe("the line of code")).describe("this will contain the list for lines of code")}),afterCodeExplanation:z.string().describe("this property will contain the example code itself if any code related topic.")}),
      testYourKnowledge: z.array(z.object({question:z.string().describe("This will contain the main question statement of the mcq"),options:z.array(z.string().describe("this will contain the option")).describe("the list of option related to the question"),correctOption:z.string().describe("correct option from the above option list.")}).describe("The list of MCQs object to test your knowledge that related to all the properties in the schema")),
      sources: z
        .array(z.string())
        .describe(
            "List of page links that contain information related to the respponse. Only include a page link if it contains relevant information"
            ),
        });
    const responseOpenAIFunction = {
      name: "response",
      description: "Return the response to the user",
      parameters: zodToJsonSchema(responseSchema),
    };
    const structuredOutputParser = (
      message: AIMessage
    ): FunctionsAgentAction | AgentFinish => {
        if (message.content && typeof message.content !== "string") {
        throw new Error("This agent cannot parse non-string model responses.");
      }
      if (message.additional_kwargs.function_call) {
          const { function_call } = message.additional_kwargs;
          try {
              const toolInput = function_call.arguments
            ? JSON.parse(function_call.arguments)
            : {};
            // If the function call name is `response` then we know it's used our final
            // response function and can return an instance of `AgentFinish`
            if (function_call.name === "response") {
                return { returnValues: { ...toolInput }, log: message.content };
            }
            return {
            tool: function_call.name,
            toolInput,
            log: `Invoking "${function_call.name}" with ${
              function_call.arguments ?? "{}"
            }\n${message.content}`,
            messageLog: [message],
          };
        } catch (error) {
            throw new Error(
            `Failed to parse function arguments from chat model response. Text: "${function_call.arguments}". ${error}`
            );
        }
      } else {
          return {
              returnValues: { output: message.content },
              log: message.content,
            };
        }
    };
    const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
    steps.flatMap(({ action, observation }) => {
        if ("messageLog" in action && action.messageLog !== undefined) {
          const log = action.messageLog as BaseMessage[];
          return log.concat(new FunctionMessage(observation, action.tool));
        } else {
            return [new AIMessage(action.log)];
        }
    });
    
    const llmWithTools = llm.bind({
      functions: [convertToOpenAIFunction(searchTool), responseOpenAIFunction],
    });
    /** Create the runnable */
    const runnableAgent = RunnableSequence.from<{
        input: string;
        steps: Array<AgentStep>;
    }>([
      {
        input: (i) => i.input,
        agent_scratchpad: (i) => formatAgentSteps(i.steps),
      },
      prompt,
      llmWithTools,
      structuredOutputParser,
    ]);
    const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
      tools: [searchTool],
    });
    /** Call invoke on the agent */
    const res = await executor.invoke({
      input: topic,
    });
    console.log({
        res,
    });
    fs.writeFileSync("res.json",JSON.stringify(res))
    return res;
  } catch (error) {
      console.log(error);
    }
};

export default researchAgent;