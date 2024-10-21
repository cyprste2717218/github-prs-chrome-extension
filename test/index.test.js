const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(process.cwd(), '../dist');
const EXTENSION_ID = 'ifihfononohiajgdcakilbjemapgbkpe';

let browser;

beforeEach(async () => {
	browser = await puppeteer.launch({
	  headless: false,
	  args: [
		`--disable-extensions-except=${EXTENSION_PATH}`,
		`--load-extension=${EXTENSION_PATH}`
	  ]
	});
  });
  
  afterEach(async () => {
	await browser.close();
	browser = undefined;
  });


  test('popup renders correctly', async () => {
	const page = await browser.newPage();
	await page.goto(`chrome-extension://${EXTENSION_ID}/index.html`);
  });