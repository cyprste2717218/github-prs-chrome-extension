const puppeteer = require("puppeteer");
const path = require("path");

const EXTENSION_PATH = path.resolve(process.cwd(), "dist");
const EXTENSION_ID = "ifihfononohiajgdcakilbjemapgbkpe";

let browser;
let puppeteerArgs = [
  `--disable-extensions-except=${EXTENSION_PATH}`,
  `--load-extension=${EXTENSION_PATH}`,
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
];

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: "new",
    args: puppeteerArgs,
    executablePath: process.env.GITHUB_ACTIONS
      ? '/usr/bin/google-chrome'
      : undefined,
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

it("User can enter github/org username, choose repos to track and view the tracked repo cards", async () => {
  const page = await browser.newPage();
  const extensionUrl = `chrome-extension://${EXTENSION_ID}/index.html`;
  await page.goto(extensionUrl, {
    waitUntil: ["domcontentloaded", "networkidle2"],
  });

  const Heading = await page.$eval("h1", (e) => e.innerText);
  expect(Heading).toEqual("Welcome to Github PR Tracker!");

  // check username entry button is present in display for user to click
  const UsernameEntryButton = await page.$eval(
    "#username-entry-button",
    (e) => e.innerText
  );
  expect(UsernameEntryButton).toEqual("Enter Github Username/Org Name");

  // checking extension changes to step 2 UI after pressing the Username entry button
  await page.click("#username-entry-button");

  const UsernameTextEntryButton = await page.$("#username");
  const SubmitUsernameButton = await page.$("#submit-button");

  expect(UsernameTextEntryButton).toBeTruthy();
  expect(UsernameTextEntryButton).not.toBeNull();
  expect(SubmitUsernameButton).toBeTruthy();
  expect(SubmitUsernameButton).not.toBeNull();

  // user enters Github username/org name and submits
  await page.type("#username", "facebook");
  await page.click("#submit-button");

  // user selects repos from list of displayed preview repos for tracking

  const SubTitleHeading = await page.$eval("h2", (e) => e.innerText);
  expect(SubTitleHeading).toEqual("Enter the Github Username/Org Name to Track");

  await page.waitForNetworkIdle();
  const previewCards = await page.$$('[id^="previewCard-"]');  
  expect(previewCards.length).toBeGreaterThanOrEqual(5);

  // checking four initial repositories for tracking, will need to make this more robust

  await page.click("#checkakd")  
  await page.click("#checkAx")
  await page.click("#checkbetween-meals")
  await page.click("#checkbookworm")

  // click next button
  await page.click("#next-button")

  // checking extension changes to step 3 UI after pressing the next button
  const SubTitleHeading2 = await page.$eval("h2", (e) => e.innerText);
  expect(SubTitleHeading2).toEqual("Your Repositories");

  const displayCards = await page.$$('[id^="displayCard-"]');  
  expect(displayCards.length).toBeGreaterThanOrEqual(4);


});
