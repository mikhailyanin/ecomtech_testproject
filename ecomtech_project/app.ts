//import * from "fs";
//import join from 'path';

import * as fs from 'fs';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import fs = require("fs");


//const join = require("path");

const commonPattern: RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z (ERROR|INFO) user=(\d+) action=(login|pay|view)$/;
const errorPattern: RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z ERROR user=(\d+) /;
const userPattern: RegExp = /user=(\d+)/;
const intPattern: RegExp = /(\d+)/;

function syncReadFile(filename: string) {
    console.log([__dirname, filename].join('\\'));

    const errors = new Map<string, number>();
    //const result = fs.readFileSync([__dirname, filename].join('\\'), 'utf-8');


    const readInterface = readline.createInterface({
        input: fs.createReadStream([__dirname, filename].join('\\')),
        output: process.stdout
    });

    let count: number = 0;
    let errorCount: number = 0;
    let userMap = new Map<number, number>();
    readInterface.on('line', (line) => {
        count++;
        //console.log(line);

        let isCommonMatch: boolean = commonPattern.test(line);
        //console.log("isCommonMatch", isCommonMatch);
        if (!isCommonMatch) {
            console.log("Строка не соответствует шаблону", line);
        }
        else {


            let isErrorMatch: boolean = errorPattern.test(line);

            //console.log("isErrorMatch", isErrorMatch);

            if (isErrorMatch) {
                errorCount++;

                const matches: RegExpMatchArray | null = line.match(userPattern);

                if (matches !== null) {
                    console.log(matches[0]);

                    const str: string = matches[0];
                    const intMatches: RegExpMatchArray | null = str.match(intPattern);
                    if (intMatches != null) {

                        const userId: number = Number(intMatches[0]);
                        console.log(userId);

                        let userErrorCount: number = 0;
                        if (userMap.has(userId)) {
                            userErrorCount = userMap.get(userId) ?? 0;
                        }
                        userErrorCount++;
                        userMap.set(userId, userErrorCount);
                    }
                }

            }
        }

    });

    readInterface.on('close', () => {
        console.log("Количество строк: " + count);
        console.log("Количество ошибок: " + errorCount);
        const sortedUserMap = new Map(
            Array.from(userMap).sort((a, b) => b[1] - a[1])
        );

        console.log("Топ 3 пользователя с ошибками:");
        let i = 0;

        for (const [key, value] of sortedUserMap.entries()) {
            if (i >= 3) {
                break;
            }
            console.log("UserID: " + key + " Ошибок: " + value);
            i++;
        }
        
    });

    // bobby
    // hadz
    // com
    //console.log(result);

    //return result;
}

syncReadFile('log_data.txt');