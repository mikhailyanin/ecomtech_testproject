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
const commonPattern = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z (ERROR|INFO) user=(\d+) action=(login|pay|view)$/;
const errorPattern = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z ERROR user=(\d+) /;
const userPattern = /user=(\d+)/;
const intPattern = /(\d+)/;
function syncReadFile(filename) {
    console.log([__dirname, filename].join('\\'));
    const errors = new Map();
    //const result = fs.readFileSync([__dirname, filename].join('\\'), 'utf-8');
    const readInterface = readline.createInterface({
        input: fs.createReadStream([__dirname, filename].join('\\')),
        output: process.stdout
    });
    let count = 0;
    let errorCount = 0;
    let userMap = new Map();
    readInterface.on('line', (line) => {
        count++;
        //console.log(line);
        let isCommonMatch = commonPattern.test(line);
        //console.log("isCommonMatch", isCommonMatch);
        if (!isCommonMatch) {
            console.log("������ �� ������������� �������", line);
        }
        else {
            let isErrorMatch = errorPattern.test(line);
            //console.log("isErrorMatch", isErrorMatch);
            if (isErrorMatch) {
                errorCount++;
                const matches = line.match(userPattern);
                if (matches !== null) {
                    console.log(matches[0]);
                    const str = matches[0];
                    const intMatches = str.match(intPattern);
                    if (intMatches != null) {
                        const userId = Number(intMatches[0]);
                        console.log(userId);
                        let userErrorCount = 0;
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
        console.log("���������� �����: " + count);
        console.log("���������� ������: " + errorCount);
        const sortedUserMap = new Map(Array.from(userMap).sort((a, b) => b[1] - a[1]));
        console.log("��� 3 ������������ � ��������:");
        let i = 0;
        for (const [key, value] of sortedUserMap.entries()) {
            if (i >= 3) {
                break;
            }
            console.log("UserID: " + key + " ������: " + value);
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
//# sourceMappingURL=app.js.map