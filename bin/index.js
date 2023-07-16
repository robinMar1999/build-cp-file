#!/usr/bin/env node

import path from "path";
import fs from 'fs';
import { log } from "console";
import { readFile as readFileAsync } from "fs/promises";
import { exit } from "process";


const inputFilePath = process.argv[2]

const filePattern = /(.+)\/.+.cpp/
const includePattern = /\#include \"(.+)\"/
const ifdefPattern = /\#ifdef.+/
const endifPattern = /\#endif/
const inputFolderPath = inputFilePath.match(filePattern)[1]
const outputBuildFilePath = path.join(inputFolderPath, "buildToSubmit.cpp")



if(inputFilePath == outputBuildFilePath) {
    console.log("Already a submission file, not creating submission output file");
    exit();
}

fs.readFile(inputFilePath, 'utf-8', async (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    const lines = data.split('\n')
    for(let i = 0; i < lines.length; i++) {
        if(lines[i].match(includePattern)) {
            const includeFilePath = path.join(inputFolderPath, lines[i].match(includePattern)[1])
            const data = await readFileAsync(includeFilePath, 'utf-8')
            lines[i] = data;
        } else if(lines[i].match(ifdefPattern)) {
            while(!lines[i].match(endifPattern)) {
                i++;
            }
        }
    }

    const modifiedData = lines.join('\n')

    fs.writeFile(outputBuildFilePath, modifiedData, 'utf-8', err => {
        if(err) {
            log("Error writing file: ", err)
            return;
        }
        log("Submission file created successfully!")
    })
})
