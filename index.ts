import { Monkey as monkey, it, expect, evaluate } from "./Monkey";



/** We define the response type for our getTruthiness function. */
interface Truthiness {
    isTrue: boolean;
    confidence: 'high' | 'medium' | 'low';
    explanation: string;
}

/** We call `monkey.patch` with any prompt and any input type, with the expected return type as a generic. */
const getTruthiness = (statement:string): Truthiness => {
    const prompt = "Evaluate the given statement for truthiness and return your assessment";
    return monkey.patch<Truthiness>(prompt, statement);
}

/** We can call `monkey.patch` using the same prompt multiple times (asynchronously) with evaluate */
const getTruthinessMany = (statements:string[]): Truthiness => {
    return monkey.patch<Truthiness>("Evaluate the given statement for truthiness and return your assessment", ()=>{
        return statements.map(statement=>evaluate(statement))
    });
}


/** To test the correctness of out implementation, as well as to improve the quality of its output, we can use `monkey.align` to define tests. */
const testTruthiness = () => {
    monkey.align(() => {
        it("should evaluate clearly true statements as true", () => {
            expect(getTruthiness("True things are true")).toMatchObject({
                isTrue: true,
            })
            expect(getTruthiness("10 is greater than 3")).toMatchObject({
                isTrue: true,
            })
        })

        it("should evaluate clearly false statements as false", () => {
            expect(getTruthiness("3 times 2 is 1.6")).toMatchObject({
                isTrue: false,
            })
            expect(getTruthiness("Coffee mugs' main purpose is to teach children how to read")).toMatchObject({
                isTrue: false,
            })
        })

        it("should evaluate clearly true or false statements with high confidence", () => {
            expect(getTruthiness("If today is Wednesday, yesterday was Tuesday")).toMatchObject({
                isTrue: true,
                confidence: 'high',
            })
            expect(getTruthiness("There are 100 days in a year")).toMatchObject({
                isTrue: false,
                confidence: 'high',
            })
        })

        it("should evaluate statements where the truth cannot be inferred with low confidence", () => {
            expect(getTruthiness("All blurps are shmorps, therefore we can assume that all garples are shmorps as well")).toMatchObject({
                confidence: 'low',
            })
        })
    });
}


