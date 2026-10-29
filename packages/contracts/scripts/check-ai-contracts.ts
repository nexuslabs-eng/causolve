import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { StartAIInvestigationRequestSchema } from "../src/internal-ai/investigation-request.schema.js";
import { AIInvestigationResultSchema } from "../src/internal-ai/investigation-result.schema.js";

const readFixture = (name: string) =>
    JSON.parse(
        readFileSync(
            new URL(`../fixtures/internal-ai/${name}`, import.meta.url),
            "utf8",
        ),
    );

const boundary = readFixture("boundary.json");
const invalid = readFixture("invalid.json");

const schemas = {
    request: StartAIInvestigationRequestSchema,
    result: AIInvestigationResultSchema,
};

assert.deepStrictEqual(
    schemas.request.parse(boundary.request),
    boundary.request,
);
assert.deepStrictEqual(
    schemas.result.parse(boundary.result),
    boundary.result,
);

for (const caseData of invalid) {
    const name = caseData.model as keyof typeof schemas;
    assert.ok(Object.hasOwn(schemas, name), `Unknown fixture model: ${name}`);
    assert.ok(Array.isArray(caseData.path) && caseData.path.length > 0,
        "Fixture path must be a non-empty array");
    const value = structuredClone(boundary[name]);
    const label = `${name}.${caseData.path.join(".")}`;
    let parent = value;

    for (const segment of caseData.path.slice(0, -1)) {
        assert.ok(
            parent !== null &&
            typeof parent === "object" &&
            Object.hasOwn(parent, segment),
            `Invalid fixture path: ${label}`,
        );
        parent = parent[segment];
    }

    const key = caseData.path.at(-1);
    assert.ok(
        key !== undefined &&
        parent !== null &&
        typeof parent === "object" &&
        Object.hasOwn(parent, key),
        `Invalid fixture target: ${label}`,
    );
    if (caseData.remove) {
        delete parent[key];
    } else {
        parent[key] = caseData.value;
    }

    assert.equal(
        schemas[name].safeParse(value).success,
        false,
        `Expected rejection: ${name}.${caseData.path.join(".")}`,
    );
}

const outputPath = process.argv[2];
assert.ok(outputPath, "Provide the Python-generated JSON file path.");

const output = JSON.parse(readFileSync(outputPath, "utf8"));

assert.deepStrictEqual(
    schemas.request.parse(output.request),
    boundary.request,
);
assert.deepStrictEqual(
    schemas.result.parse(output.result),
    boundary.result,
);

for (const sample of [output.execution, output.failure]) {
    assert.deepStrictEqual(
        schemas.result.parse(sample),
        sample,
    );
}

assert.deepStrictEqual(output.execution, {
    investigationId: boundary.request.investigationId,
    status: "DEGRADED",
    hypothesisProposals: [],
    evidenceInterpretations: [],
    recommendationProposal: null,
    error:
        "Graph and provider verification succeeded. " +
        "Investigation intelligence is not implemented.",
});

assert.deepStrictEqual(output.failure, {
    investigationId: boundary.request.investigationId,
    status: "FAILED",
    hypothesisProposals: [],
    evidenceInterpretations: [],
    recommendationProposal: null,
    error: "AI provider execution failed (unavailable).",
});

console.log(
    `AI contracts passed: shared fixtures, ${invalid.length} invalid cases, and Python output.`,
);
