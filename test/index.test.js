const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(process.cwd(), '../dist');
const EXTENSION_ID = 'ifihfononohiajgdcakilbjemapgbkpe';

let browser;
let puppeteerArgs = [
	`--disable-extensions-except=${EXTENSION_PATH}`,
	`--load-extension=${EXTENSION_PATH}`
];

describe('Extension Tests', () => {

	beforeEach(async () => {
		browser = await puppeteer.launch({
		  headless: false,
		  args: puppeteerArgs,
		});
	  });
	  
	afterEach(async () => {
		await browser.close();
		browser = undefined;
	  });
	
	
	it('extension renders correctly', async () => {
		
		const page = await browser.newPage();
		const extensionUrl = `chrome-extension://${EXTENSION_ID}/index.html`;
		await page.goto(extensionUrl, {waitUntil: ['domcontentloaded', "networkidle2"]});

        const popupHeading = await page.$eval('h1', (e => e.innerText));

		
        expect(popupHeading).toEqual('Welcome to Github PR Tracker!');
		

	  });

})

