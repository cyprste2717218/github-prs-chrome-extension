import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";

interface LaunchOptions {
  headless: boolean;
  devtools: boolean;
  pipe: boolean;
  enableExtensions: string[];
  args: string[];
}

interface TestContext {
  browser: Browser | undefined;
  popupPage: Page | undefined;
  EXTENSION_PATH: string;
}

describe("User Flow (E2E) Testing", () => {
  let browser: Browser | undefined;
  let popupPage: Page | undefined;

  const EXTENSION_PATH: string = path.join(process.cwd(), "dist");

  beforeEach(async (): Promise<void> => {
    const launchOptions: LaunchOptions = {
      headless: false,
      devtools: false,
      pipe: true,
      enableExtensions: [EXTENSION_PATH],
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "-enable-unsafe-extension-debugging",
      ],
    };

    browser = (await puppeteer.launch(
      launchOptions as Parameters<typeof puppeteer.launch>[0]
    )) as Browser;

    // Giving browser time to load chrome extension
    await browser.installExtension(EXTENSION_PATH);

    // Retrieving the service worker
    const workerTarget = await browser.waitForTarget(
      (target) =>
        target.type() === "service_worker" &&
        target.url().endsWith("service-worker.js")
    );

    const worker = await workerTarget.worker();

    // Loading the extensions' popup

    if (!worker) {
      throw new Error("Service worker not found");
    }

    //await worker.evaluate('chrome.action.openPopup();');

    const popupTarget = await browser.waitForTarget(
      (target) =>
        target.type() === "page" && target.url().endsWith("index.html")
    );

    popupPage = await popupTarget.asPage();
  });
  afterEach(async () => {
    const popupTarget = await (browser as Browser).waitForTarget(
      (target) =>
        target.type() === "page" && target.url().endsWith("index.html")
    );

    popupPage = await popupTarget.asPage();

    // clearing chrome local and session storage for next test
    await popupPage.evaluate(() => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.clear(function () {
          let error = chrome.runtime.lastError;
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve("chrome.localStorage clear succesful!");
          }
        });
        chrome.storage.session.clear(function () {
          let error = chrome.runtime.lastError;
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve("chrome.sessionStorage clear succesful!");
          }
        });
      });
    });

    await (browser as Browser).close();
    browser = undefined;
  });

  it("User can enter github/org username, choose repos to track and view the tracked repo cards", async () => {
    const page = popupPage as Page;

    const Heading = await page.$eval("h1", (e) => e.innerText);
    expect(Heading).toEqual("Welcome to Github PR Tracker!");

    // check username entry button is present in display for user to click
    const UsernameEntryButton = await page.$eval(
      "#username-entry-button",
      (e) => (e as HTMLElement).innerText
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
    expect(SubTitleHeading).toEqual(
      "Enter the Github Username/Org Name to Track"
    );

    await page.waitForNetworkIdle();
    const previewCards = await page.$$('[id^="previewCard-"]');
    expect(previewCards.length).toBeGreaterThanOrEqual(5);

    // checking four initial repositories for tracking, will need to make this more robust

    await page.click("#checkakd");
    await page.click("#checkAx");
    await page.click("#checkbetween-meals");
    await page.click("#checkbookworm");

    // click next button
    await page.click("#next-button");

    // checking extension changes to step 3 UI after pressing the next button
    const SubTitleHeading2 = await page.$eval("h2", (e) => e.innerText);
    expect(SubTitleHeading2).toEqual("Your Repositories");

    const displayCards = await page.$$('[id^="displayCard-"]');
    expect(displayCards.length).toBeGreaterThanOrEqual(4);
  });
});
