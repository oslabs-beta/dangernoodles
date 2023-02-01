"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { parse as parser } from 'https://deno.land/std@0.166.0/flags/mod.ts'; // no longer needed as we are using Node and not Deno
const parse_1 = require("./parse/parse");
const init_1 = require("./init");
const class_1 = require("./test/class");
const yargs = require('yargs/yargs');
// const args = parser(Deno.args);
const [, , ...args] = yargs(process.argv).argv._; // process.argv in Node for CLI arguments and using yargs to parse the arguments into an object
let body = '';
const test = new class_1.default();
console.log('destructured yargs array', args);
//handle arguments
switch (true) {
    case (args.includes('init')):
        (0, init_1.init)();
        break;
    case (args.length === 0):
        if (args.b || args.body)
            body += (args.b || args.body);
        if (args.p || args.post)
            test.testOne('POST', args.p || args.post, body);
        else if (args.u || args.patch || args.put)
            test.testOne(args.patch ? 'PATCH' : 'PUT', args.u || args.patch || args.put, body);
        else if (args.g || args.get)
            test.testOne('GET', args.g || args.get);
        else if (args.d || args.delete)
            test.testOne('DELETE', args.d || args.delete);
        else if (args.f)
            (0, parse_1.parse)();
        else
            test.testAll();
        break;
}
