"use strict";
// import * as path from "https://deno.land/std/path/mod.ts"
Object.defineProperty(exports, "__esModule", { value: true });
function errors(errorMessage) {
    console.log('error function invoked, hello hello hello');
    console.log('errorMessageInputArgument', errorMessage);
    if (!errorMessage)
        return "...";
    const arrayOfRegex = [
        /(?<=file:\/\/)\S*/,
        /(?<=\.(j|t)s:)\S*/,
        / (.*): /gi,
        /\"(.*)\"/,
        /:(\d+):(\d+)/, // looking for a colon between two numbers
    ];
    const arrayErrorStack = [];
    const arrayOfUsefulErrorInformation = [];
    //Remove all of the new lines and spaces and extract the error stack string into an array of strings for each element in the stack
    {
        JSON.stringify(errorMessage).split("\\n\\n").forEach((stringElement) => {
            stringElement.split('\\n').forEach((element) => arrayErrorStack.push(element.replaceAll('    at ', '')));
        });
    }
    // Loop through the array of error stack strings and parse each string into readable, usable information
    for (let i = 0; i < arrayErrorStack.length; i++) {
        const finalObj = {
            message: '',
            request: {
                url: '',
                method: '',
                hasBody: Boolean(),
            },
            response: {
                status: '',
                type: '',
                hasBody: Boolean(),
                writable: Boolean(),
            },
            location: '',
            lineNo: '',
            colNo: '',
        };
        if (arrayErrorStack[i].includes('[uncaught application error]:')) {
            const extractFileDirectoryFromErrorStack = arrayErrorStack[i + 3].match(arrayOfRegex[0]);
            const decodedURIArrayElement = ((extractFileDirectoryFromErrorStack?.[0] !== undefined) ? decodeURI(extractFileDirectoryFromErrorStack?.[0]) : undefined); // memoize the file path to the error
            const lineAndColNumbers = decodedURIArrayElement?.match(arrayOfRegex[1])?.[0].split(':'); //extract line and column numbers
            const strobj = {
                message: arrayErrorStack[i].replaceAll(/\"/g, ''),
                request: arrayErrorStack[i + 1].replace(/request: /, '').replaceAll(/\\/g, ''),
                response: arrayErrorStack[i + 2].replace(/response: /, ''),
                location: decodedURIArrayElement,
                lineNo: lineAndColNumbers?.[0],
                colNo: lineAndColNumbers?.[1],
            };
            // Assign finalObj.message to strobj.message
            {
                ({ message: finalObj.message, lineNo: finalObj.lineNo, colNo: finalObj.colNo } = strobj);
            }
            // Turn the request message into an object in the block below:
            {
                const JSONstringArr = [];
                strobj.request.split(',').forEach((ele) => {
                    const requestObjectKeys = ele.match(arrayOfRegex[2])?.[0].replace(' ', '"').replace(':', '":');
                    if (requestObjectKeys !== undefined) {
                        JSONstringArr.push(requestObjectKeys);
                    }
                });
                JSONstringArr.forEach((ele) => {
                    const removeExtraQuotationMarksFromReqObjKeys = ele.match(arrayOfRegex[3]);
                    if (removeExtraQuotationMarksFromReqObjKeys !== null) {
                        {
                            strobj.request = strobj.request.replace(removeExtraQuotationMarksFromReqObjKeys[1], removeExtraQuotationMarksFromReqObjKeys[0]);
                        }
                    }
                });
                finalObj.request = JSON.parse(strobj.request);
            }
            // Turn the response message into an object in the block below:
            {
                const JSONstringArr = [];
                strobj.response = strobj.response.replace('type: undefined', 'type: "undefined"'); // JSON.parse does not parse undefined
                strobj.response.split(',').forEach((ele) => {
                    const testForObjKeys = ele.match(arrayOfRegex[2]);
                    if (testForObjKeys !== null) {
                        JSONstringArr.push(testForObjKeys[0].replace(' ', '"').replace(':', '":'));
                    }
                });
                JSONstringArr.forEach((ele) => {
                    const stringifyKeyNamesOfResponseObject = ele.match(arrayOfRegex[3]);
                    if (stringifyKeyNamesOfResponseObject !== null) {
                        strobj.response = strobj.response.replace(stringifyKeyNamesOfResponseObject[1], stringifyKeyNamesOfResponseObject[0]);
                    }
                });
                finalObj.response = JSON.parse(strobj.response);
                if (finalObj.response.type === 'undefined')
                    finalObj.response.type = undefined; // turn 'undefined' into undefined
            }
            // Remove the line and column number from the location object:
            {
                const removeLineAndColumnNumber = strobj.location?.match(arrayOfRegex[4]);
                if (removeLineAndColumnNumber !== null && removeLineAndColumnNumber !== undefined) {
                    finalObj.location = strobj.location?.replace(removeLineAndColumnNumber[0], '');
                }
            }
            arrayOfUsefulErrorInformation.push(finalObj);
        }
    }
    return arrayOfUsefulErrorInformation;
}
exports.default = errors;
