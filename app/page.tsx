"use client";
import GeneratedContent from "@/components/shared/GeneratedContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import researchAgent from "@/lib/tool/researchAgent";
import { useState } from "react";

export default function Home() {
  const [isGenerating,setIsGenerating] =useState(false);
  const [isGenerated,setIsGenerated] =useState(false);
  const [tutorial,setTutorial] =useState<any>({});
  async function handleSubmit(e: any) {
    e.preventDefault();
    const topic = e.target[0].value;
    setIsGenerated(false);
    setIsGenerating(true);
    const responseTutorial=await researchAgent(topic);
    setTutorial(responseTutorial);
    console.log(responseTutorial);
    setIsGenerated(true);
    setIsGenerating(false);
  }
  return (
    <main className="flex-center h-full flex-col">
      <form
        className="w-50 min-w-[300px] mt-6 flex gap-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <Input
          type="text"
          placeholder="Generate a Tutorial"
          className="background-light800_dark400 rounded-md shadow-sm"
        />
        <Button disabled={isGenerating} className="primary-gradient w-fit !text-light-900">
          Generate
        </Button>
      </form>
      <div className="mt-4 container p-5">{
        isGenerated?
        <GeneratedContent tutorial={tutorial} />:isGenerating?<><div >
        <h1 className="h3-bold text-center"> Generating...</h1>
      </div></>:<div >
          <h1 className="h3-bold text-center"> Enter your topic above to generate</h1>
        </div>
      }
      </div>
    </main>
  );
}
