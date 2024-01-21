import React, { useState } from 'react'
import { Input } from '../ui/input';
import { Button } from '../ui/button';

function GeneratedContent({tutorial}:any) {
    const {introduction,learningObjectives,codeExample,prerequisites,moduleOverview,input,testYourKnowledge,sources}=tutorial;
    const [isCheck,setIsCheck]=useState(false);
    function handleQuiz(e:any){
        e.preventDefault();
        const a="What does npm stand for?"
        console.log(e.target[a].value);
        setIsCheck(true);
    }
  return (
    <div className='flex flex-col gap-12 w-full text-justify'>
        <section className='flex gap-5 flex-col'>
        <h1 className='h1-bold capitalize text-center text-primary-500 shadow-lg background-light700_dark400 py-2'>{input}</h1>
        <p className='base-medium text-justify'>{moduleOverview}</p>
        </section>
        <section>
            <h1 className='h2-bold text-left'>Learning Objectives</h1>
            <ul className='list-disc space my-3 leading-loose'>
            {learningObjectives.map((objective:any)=>{
                return <><li className='list-item'>{objective}</li></>
            })}
            </ul>
        </section>
        <section>
            <h1 className='h2-bold text-left'>Prerequisites</h1>
            <ul className='list-disc space my-3 leading-loose'>
            {prerequisites.map((objective:any)=>{
                return <li className='list-item' key={objective}>{objective}</li>
            })}
            </ul>
        </section>
        <section>
            <h1 className='h2-bold text-left text-center mb-4'>Introduction to <span className='text-primary-500 capitalize'>{input}</span></h1>
            <div className='flex flex-col gap-5'>
            {introduction.map((objective:any)=>{
                return <div className='' key={objective.heading} >
                    <h1 className='h3-bold mb-3'>{objective.heading}</h1>
                    <p className=''>{objective.paragraph}</p>
                    </div>
            })}
            </div>
        </section>
        <form onSubmit={(e)=>handleQuiz(e)} className='flex flex-col gap-6'>
            <h1 className='h3-bold'>Test Your Knowledge</h1>
            {testYourKnowledge.map((testObject:any)=>{
                return(<div key={testObject.question}>
                <h1 className='base-bold text-[14px]'>{testObject.question}</h1>
                <div className='ml-4'>
                    {testObject.options.map((option:any)=>{
                        return <div className={`flex items-center gap-2 ${isCheck && testObject.correctOption===option?"text-green-600":""}`} key={option}>
                            <Input className='font-[12px] w-min h-min' type='radio' name={testObject.question} value={option} id={option}/>
                            <label className='ml-2' htmlFor={option}>{option}</label>
                            </div>
                    })}
                </div>
                </div>)
            })}
            <Button disabled={isCheck} className="primary-gradient w-fit !text-light-900">
          Check Your Answers
        </Button>
        </form>
    </div>
  )
}

export default GeneratedContent