const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(process.cwd(), '../../dist');
const EXTENSION_ID = 'ifihfononohiajgdcakilbjemapgbkpe';

let browser;
let puppeteerArgs = [
	`--disable-extensions-except=${EXTENSION_PATH}`,
	`--load-extension=${EXTENSION_PATH}`
];

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

it('User can enter github/org username, choose repos to track and view the tracked repo cards',async () => {
		
	const page = await browser.newPage();
	const extensionUrl = `chrome-extension://${EXTENSION_ID}/index.html`;
	await page.goto(extensionUrl, {waitUntil: ['domcontentloaded', "networkidle2"]});

	const Heading = await page.$eval('h1', (e => e.innerText));

	
	expect(Heading).toEqual('Welcome to Github PR Tracker!');


})

