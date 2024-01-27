"use client";
import GeneratedContent from "@/components/shared/GeneratedContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import researchAgent from "@/lib/tool/researchAgent";
import { useState } from "react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [tutorial, setTutorial] = useState<string | undefined>("");
  const [isApiBtnOpen, setIsApiBtnOpen] = useState(false);
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = e.target;
    const topic = form.topic.value;
    let openAiKey = "";
    let tavilyKey = "";
    let modelName = "";
    if (isApiBtnOpen) {
      openAiKey = form.openAiKey.value;
      tavilyKey = form.tavilyKey.value;
      modelName = form.modelName.value;
    }
    setIsGenerated(false);
    setIsGenerating(true);
    const responseTutorial=await researchAgent({topic,openAiKey,tavilyKey,modelName});
    setTutorial(responseTutorial);
    console.log(responseTutorial);
    setIsGenerated(true);
    setIsGenerating(false);
  }
  const toggleApiInput = () => {
    if (isApiBtnOpen) {
      setIsApiBtnOpen(false);
      return;
    }
    setIsApiBtnOpen(true);
  };
  return (
    <main className="flex-center h-full flex-col">
      <form
        className="w-50 min-w-[300px] mt-6 flex flex-col gap-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="flex gap-4">
          <Input
            type="text"
            name="topic"
            placeholder="Enter a topic to generate tutorial"
            className="background-light800_dark400 rounded-md shadow-sm"
          />
          <Button
            disabled={isGenerating}
            className="primary-gradient w-fit !text-light-900"
          >
            Generate
          </Button>
        </div>
        <div className="flex gap-4">
          {isApiBtnOpen && (
            <>
              <Input
                type="text"
                name="openAiKey"
                placeholder="Enter OpenAI Api Key"
                className="background-light800_dark400 rounded-md shadow-sm"
              />
              <Input
                type="text"
                name="tavilyKey"
                placeholder="Enter Tavily Api Key"
                className="background-light800_dark400 rounded-md shadow-sm"
              />
              <Input
                type="text"
                name="modelName"
                placeholder="Enter model name"
                className="background-light800_dark400 rounded-md shadow-sm"
              />
            </>
          )}
          <Button
            className="primary-gradient w-fit !text-light-900"
            type="button"
            onClick={toggleApiInput}
          >
            Want to use your own Api keys?
          </Button>
        </div>
      </form>
      <div className="mt-4 container p-5">
        {isGenerated ? (
          <GeneratedContent tutorial={tutorial} />
        ) : isGenerating ? (
          <>
            <div>
              <h1 className="h3-bold text-center"> Generating...</h1>
            </div>
          </>
        ) : (
          <div>
            <h1 className="h3-bold text-center">
              {" "}
              Enter your topic above to generate
            </h1>
          </div>
        )}
      </div>
    </main>
  );
}
