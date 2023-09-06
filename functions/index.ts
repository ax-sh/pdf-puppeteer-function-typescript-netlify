import { Handler } from '@netlify/functions'
import * as chromium  from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

async function getBrowser(){
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath:  process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
        headless: true,
    });
    await browser.close();
    return browser
}
const handler: Handler = async (event, context) => {
   const browser =await  getBrowser()
    const page = await browser.newPage();
    console.log(page, 888)
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello World" })
    }
}

export { handler }