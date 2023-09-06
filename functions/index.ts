import {Handler} from '@netlify/functions'
import * as chromium from 'chrome-aws-lambda';
import puppeteer, {Browser} from 'puppeteer-core';
import * as dotenv from 'dotenv'

dotenv.config()

async function getBrowser() {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
        headless: true,
    });

    return browser
}


async function openPage(callback: CallableFunction) {
    let browser: Browser
    try {
        browser = await getBrowser()
        const page = await browser.newPage();
      await  callback(page)
    } finally {
        await browser?.close();
    }
}

const handler: Handler = async (event, context) => {
    await openPage(async (page)=>{
        await page.goto('https://ax-sh.github.io/', {waitUntil: "networkidle2",});
        const pageTitle = await page.title();

        const pdf = await page.pdf({
            format: "A4",
            // displayHeaderFooter:true,
            printBackground:true,
            margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
        }); // generate the PDF 🎉

        const response = {
            headers: {
                "Content-type": "application/pdf",
                "content-disposition": `attachment; filename=${pageTitle}.pdf`
            },
            statusCode: 200,
            body: pdf.toString("base64"),
            isBase64Encoded: true
        };
        context.succeed(response);

    })
}

export {handler}