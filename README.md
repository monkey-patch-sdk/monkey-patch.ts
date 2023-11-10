# 🙈 Monkey Patch - TypeScript (Coming Soon!)

The easiest way to build scalable, LLM-powered functions and applications that get cheaper and faster the more you use them.


NOTE: This is the TypeScript implementation of the library. For the Python implementation, refer to [this link](
https://github.com/monkey-patch-sdk/monkey-patch.py).

## Contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->
   * [Introduction](#introduction)
   * [Features](#features)
   * [Installation and Getting Started](#installation-and-getting-started)
   * [How It Works](#how-it-works)
   * [Typed Outputs](#typed-outputs)
   * [Test-Driven Alignment](#test-driven-alignment)
   * [Scaling and Finetuning](#scaling-and-finetuning)
   * [Frequently Asked Questions](#frequently-asked-questions)

<!-- TOC end -->
<!-- TOC --><a name="introduction"></a>
## Introduction 

Monkey Patch is a way to programmatically invoke an LLM in TypeScript, with the same parameters and output that you would expect from a function implemented by hand. 

These LLM-powered functions are typed, reliable, stateless, and production-ready to be dropped into your app seamlessly. Rather than endless prompt-wrangling and failures, these LLM-powered functions and applicatiosn behave like traditional functions.

Lastly, the more you use the patched function, the cheaper and faster it gets through automatic model distillation.
```ts
const monkeyPatch = (input:TypedInput) => {
    return monkey.patch<TypedOutput>("Include the description of what this function does.", input);
}

const monkeyAlign = () => {
    monkey.align("Testing and aligning our function", () => {
        it("Testing some aspect of our function", () => {
            expect(monkeyPatch(exampleTypedInput)).toEqual(expectedTypedOutput);
        })
    });
} 
```
<!-- TOC --><a name="features"></a>
## Features

- **Easy and seamless integration** - Add LLM augmented functions to any workflow within seconds. Call monkey.patch and optionally add type hints and docstrings to guide the execution. That’s it.
- **Type aware** - Ensure that the outputs of the LLM adhere to the type constraints of the function (TypeScript types, enums, and interfaces) to guard against bugs or unexpected side-effects of using LLMs.
- **Aligned outputs** - LLMs are unreliable, which makes them difficult to use in place of classically programmed functions. Use common testing patterns to align the behaviour of your patched function to what you expect.
- **Lower cost and latency** - Achieve up to 90% lower cost and 80% lower latency with increased usage. The package will take care of model training, MLOps and DataOps efforts to improve LLM capabilities through distillation.
- **Batteries included** - No remote dependencies other than OpenAI. 

<!-- TOC --><a name="installation-and-getting-started"></a>
## Installation and Getting Started
<!-- TOC --><a name="installation"></a>
### Installation
```bash
npm install monkey-patch
# or
# yarn add monkey-patch
```
Set your OpenAI key using:

```ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'My API Key', // defaults to process.env["OPENAI_API_KEY"]
});
```


<!-- TOC --><a name="getting-started"></a>
### Getting Started

To get started:
1. Create a function calling `monkey.patch()` providing it with your expected return type as a generic, a prompt, and an optional input.
2. (Optional) Call `monkey.align()` following normal [Jest](https://jestjs.io/) patterns declaring the expected behaviour of your patched function with different inputs.

The patched function can now be called as normal in the rest of your code. 

To add functional alignment, the functions annotated with `align` must also be called if:
- It is the first time calling the patched function (including any updates to the function signature, i.e docstring, input arguments, input type hints, naming or the output type hint)
- You have made changes to your assert statements.

Here is what it could look like for a simple classification function:
```ts
const classifySentiment = (msg:string) => {
    const prompt = "Classifies a message from the user into 'good', 'bad' or Null if it can't be classified.";
    return monkey.patch<'good' | 'bad' | null>(prompt, msg);
}

const alignClassifySentiment = () => {
    monkey.align(() => {
        it("Classifies sentiments correctly", () => {
            expect(classifySentiment("I love you")).toEqual('good');
            expect(classifySentiment("I hate you")).toEqual('bad');
            expect(classifySentiment("People from Phoenix are called Phoenicians")).toEqual(null);
        })
    });
}
```
<!-- TOC --><a name="how-it-works"></a>
## How It Works

When you call a monkey-patched function during development, an LLM in a n-shot configuration is invoked to generate the typed response. 

The number of examples used is dependent on the number of align statements supplied in functions annotated with the align decorator. 

The response will be post-processed and the supplied output type will be programmatically instantiated ensuring that the correct type is returned. 

This response can be passed through to the rest of your app / stored in the DB / displayed to the user.

Make sure to execute all align functions at least once before running your patched functions to ensure that the expected behaviour is registered. These are cached onto the disk for future reference.

The inputs and outputs of the function will be stored during execution as future training data.
As your data volume increases, smaller and smaller models will be distilled using the outputs of larger models. 

The smaller models will capture the desired behaviour and performance at a lower computational cost, lower latency and without any MLOps effort.

<!-- TOC --><a name="typed-outputs"></a>
## Typed Outputs

LLM API outputs are typically in natural language. In many instances, it’s preferable to have constraints on the format of the output to integrate them better into workflows.

A core concept of monkey-patch is the support for typed parameters and outputs. Supporting typed outputs of patched functions allows you to declare *rules about what kind of data the patched function is allowed to pass back* for use in the rest of your program. This will guard against the verbose or inconsistent outputs of the LLMs that are trained to be as “helpful as possible”.

You can use primitives or TypeScript types and interfaces to express very complex rules about what the patched function can return. These act as guard-rails for the model preventing a patched function breaking the code or downstream workflows, and means you can avoid having to write custom validation logic in your application. 
```ts
interface ActionItem {
    goal: string & "What task must be completed"
    deadline: Date & "The date the goal needs to be achieved"
}

const getActionItems = (msg:string) => {
    const prompt = "Generate a list of Action Items";
    return monkey.patch<ActionItem[]>(prompt, msg);
}

const alignActionItems = () => {
    monkey.align(() => {
        it("Generates a list of Action Items", () => {
            const nextTuesday = new Date();
            nextTuesday.setDate(nextTuesday.getDate() + ((1 + 7 - nextTuesday.getDay()) % 7));
            nextTuesday.setHours(0, 0, 0, 0);

            expect(getActionItems("Can you please get the presentation to me by Tuesday?")).toEqual([
                {
                    goal: "Prepare the presentation",
                    deadline: nextTuesday
                }
            ]);
        })
    });
}
```
By constraining the types of data that can pass through your patched function, you are declaring the potential outputs that the model can return and specifying the world where the program exists in.


<!-- TOC --><a name="test-driven-alignment"></a>
## Test-Driven Alignment

In classic [test-driven development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development), the standard practice is to write a failing test before writing the code that makes it pass. 

Test-Driven Alignment (TDA) adapts this concept to align the behavior of a patched function with an expectation defined by a test.

To align the behaviour of your patched function to your needs, call `monkey.align` and assert the outputs of the function with the normal Jest-like patter, by using ‘it’ and ‘expect’ statements as is done with standard tests.

```ts
const alignClassifySentiment = () => {
    monkey.align(() => {
        it("Classifies sentiments correctly", () => {
            expect(classifySentiment("I love you")).toEqual('good');
            expect(classifySentiment("I hate you")).toEqual('bad');
        })
    });
}
```

By writing a test that encapsulates the expected behaviour of the monkey patched function, you declare the contract that the function must fulfill. This enables you to:

1. **Verify Expectations:** Confirm that the function adheres to the desired output. 
2. **Capture Behavioural Nuances:** Make sure that the LLM respects the edge cases and nuances stipulated by your test.
3. **Develop Iteratively:** Refine and update the behavior of the monkey patched function by declaring the desired behaviour as tests.

Unlike traditional TDD, where the objective is to write code that passes the test, TDA flips the script: **tests do not fail**. Their existence and the form they take are sufficient for LLMs to align themselves with the expected behavior.

TDA offers a lean yet robust methodology for grafting machine learning onto existing or new Python codebases. It combines the preventive virtues of TDD while addressing the specific challenges posed by the dynamism of LLMs.

---

<!-- TOC --><a name="scaling-and-finetuning"></a>
## Scaling and Finetuning

An advantage of using Monkey-Patch in your workflow is the cost and latency benefits that will be provided as the number of datapoints increases. 

Successful executions of your patched function suitable for finetuning will be persisted to a training dataset, which will be used to distil smaller models for each patched function. This results in significant decreases in cost and latency while keeping performance on the same level. 

Training smaller function-specific models and deploying them is handled by the Monkey-Patch library, so the user will get the benefits without any additional MLOps or DataOps effort. Currently only OpenAI GPT style models are supported (Teacher - GPT4, Student GPT-3.5) 


<!-- TOC --><a name="frequently-asked-questions"></a>
## Frequently Asked Questions


<!-- TOC --><a name="intro"></a>
### Intro
<!-- TOC --><a name="what-is-monkey-patch-in-plain-words"></a>
#### What is Monkey-patch in plain words?
Monkey-patch is a simple and seamless way to create LLM augmented functions available in Python and Typescript, which ensure the outputs of the LLMs follow a specific structure. Moreover, the more you call a patched function, the cheaper and faster the execution gets.

<!-- TOC --><a name="how-does-this-compare-to-other-frameworks-like-langchain"></a>
#### How does this compare to other frameworks like Langchain?
- **Langchain**: Monkey-Patch has a narrower scope than Langchain. Our mission is to ensure predictable and consistent LLM execution, with automatic reductions in cost and latency through finetuning.
- **Magentic**: Monkey-Patch offers two main benefits compared to Magentic, namely; lower cost and latency through automatic distillation, and more predictable behaviour through test-driven alignment. Currently, there are two cases where you should use Magentic, namely: where you need support for tools (functions) - a feature that is on our roadmap, and where you need support for asynchronous functions.

<!-- TOC --><a name="what-are-some-sample-use-cases"></a>
#### What are some sample use-cases?
We've created a few examples to show how to use Monkey-Patch for different problems. You can find them [here](https://github.com/monkey-patch-sdk/monkey-patch.py/tree/master/examples).
A few ideas are as follows:
- Adding an importance classifier to customer requests
- Creating a offensive-language classification feature
- Creating a food-review app
- Generating data that conforms to your DB schema that can immediately 

<!-- TOC --><a name="why-would-i-need-typed-responses"></a>
#### Why would I need typed responses?
When invoking LLMs, the outputs are free-form. This means that they are less predictable when used in software products. Using types ensures that the outputs adhere to specific constraints or rules which the rest of your program can work with.

<!-- TOC --><a name="getting-started-1"></a>
### Getting Started
<!-- TOC --><a name="how-do-i-get-started"></a>
#### How do I get started?
Follow the instructions in the [Installation and getting started]() and [How it works]() sections

<!-- TOC --><a name="how-do-i-align-my-functions"></a>
#### How do I align my functions?
See [How it works]() and [Test-Driven Alignment]() sections or the examples shown [here](https://github.com/monkey-patch-sdk/monkey-patch.py/tree/master/examples).


<!-- TOC --><a name="do-i-need-my-own-openai-key"></a>
#### Do I need my own OpenAI key?
Yes

<!-- TOC --><a name="does-it-only-work-with-openai"></a>
#### Does it only work with OpenAI?
Currently yes but there are plans to support Anthropic and popular open-source models. If you have a specific request, either join our Discord server, or create a Github issue.

<!-- TOC --><a name="how-it-works-1"></a>
### How It Works
<!-- TOC --><a name="how-does-the-llm-get-cheaper-and-faster-over-time-and-by-how-much"></a>
#### How does the LLM get cheaper and faster over time? And by how much?
Using the outputs of the larger (teacher) model, a smaller (student) model will be trained to emulate the teacher model behaviour while being faster and cheaper to run due to smaller size. In some cases it is possible to achieve up to 90% lower cost and 80% lower latency with a small number of executions of your patched functions.  
<!-- TOC --><a name="how-many-calls-does-it-require-to-get-the-improvement"></a>
#### How many calls does it require to get the improvement?
The default minimum is 200 calls, although this can be changed by adding flags to the patch decorator.
<!-- TOC --><a name="can-i-link-functions-together"></a>
#### Can I link functions together?
Yes! It is possible to use the output of one patched function as the input to another patched function. Simply carry this out as you would do with normal python functions.
<!-- TOC --><a name="does-fine-tuning-reduce-the-performance-of-the-llm"></a>
#### Does fine tuning reduce the performance of the LLM?
Not necessarily. Currently the only way to improve the LLM performance is to have better align statements. As the student model is trained on both align statements and input-output calls, it is possible for the fine tuned student model to exceed the performance of the N-shot teacher model during inference.


<!-- TOC --><a name="accuracy-reliability"></a>
### Accuracy & Reliability
<!-- TOC --><a name="how-do-you-guarantee-consistency-in-the-output-of-patched-functions"></a>
#### How do you guarantee consistency in the output of patched functions?
Each output of the LLM will be programmatically instantiated into the output class ensuring the output will be of the correct type. If the LLM output is incorrect and instantiating the correct output object fails, an automatic feedback repair loop kicks in to correct the mistake.
<!-- TOC --><a name="how-reliable-are-the-typed-outputs"></a>
#### How reliable are the typed outputs?
For simpler-medium complexity classes GPT4 with align statements has been shown to be very reliable in outputting the correct type. Additionally we have implemented a repair loop with error feedback to “fix” incorrect outputs and add the correct output to the training dataset.
<!-- TOC --><a name="how-do-you-deal-with-hallucinations"></a>
#### How do you deal with hallucinations?
Hallucinations can’t be 100% removed from LLMs. However, by creating test functions decorated with `@monkey.align`, you can use normal `assert` statements to align the model to behave in the way that you expect. Additionally, you can create types with Pydantic, which act as guardrails to prevent any nasty surprises and provide correct error handling.
<!-- TOC --><a name="how-do-you-deal-with-bias"></a>
#### How do you deal with bias?
By adding more align statements that cover a wider range of inputs, you can ensure that the model is less biased.
<!-- TOC --><a name="will-distillation-impact-performance"></a>
#### Will distillation impact performance?
It depends. For tasks that are challenging for even the best models (e.g GPT4), distillation will reduce performance.
However, distillation can be manually turned off in these cases. Additionally, if the distilled model frequently fails to generate correct outputs, the distilled model will be automatically turned off.

<!-- TOC --><a name="what-is-this-not-suitable-for"></a>
#### What is this not suitable for?
- Time-series data
- Tasks that requires a lot of context to completed correctly
- For tasks that output natural language, you will get less value from monkey-patch and may want to consider the OpenAI API directly.

---

