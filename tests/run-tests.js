import eventTests from "./events.test.js";
import loaderTests from "./loader.test.js";
import securityTests from "./security.test.js";

const suites = [
    ...securityTests,
    ...eventTests,
    ...loaderTests,
];

let failureCount = 0;

for (const { name, run } of suites) {
    try {
        await run();
        console.log(`PASS ${name}`);
    } catch (error) {
        failureCount += 1;
        console.error(`FAIL ${name}`);
        console.error(error);
    }
}

if (failureCount > 0) {
    console.error(`\n${failureCount} test(s) failed.`);
    process.exitCode = 1;
} else {
    console.log(`\n${suites.length} test(s) passed.`);
}
