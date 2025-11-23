import { loadFromLocalStorage, saveToSessionStorage } from "./storage-utils";
import { updatePRDetails } from "../pollingUtilities";
import { createAlarm, deleteAlarm } from "./alarm-utils";
import {
  ErrorMsg,
  handleUpdatePRDetailsError,
} from "../errorHandlingUtilities";
import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";

async function handleDeleteAllAlarms(): Promise<void> {
  console.log("clearing all alarms");
  await chrome.alarms.clearAll();
  console.log("all alarms cleared");
}

async function handleDeleteAlarm(alarmName: string): Promise<void> {
  try {
    await deleteAlarm(alarmName);
  } catch (e) {
    console.error(`Error deleting ${alarmName}: ${e}`);

    if (alarmName === "pollingAlarm") {
      // To-do: add retry logic for deleting polling alarm
    }

    throw new Error("Alarm handling error encountered");
  }
  console.log(`deleted ${alarmName}`);
}

async function handleCreateAlarm(alarmName: string): Promise<void> {
  try {
    const alarmCreationResult = await createAlarm(alarmName);

    if (alarmCreationResult === false) {
      console.log(`${alarmName} already exists, not creating another one`);
    } else if (alarmCreationResult === true) {
      console.log(`created ${alarmName} successfully`);
    }
  } catch (e) {
    console.error(`Error during creation of ${alarmName} alarm: ${e}`);
    throw new Error(`${alarmName} handling error encountered`);
  }
}

async function handleAlertAlarm(alarmName: string): Promise<void> {
  try {
    if (alarmName === "pollingAlarm") {
      const now = new Date();
      const isoString = now.toISOString();

      console.log(`pollingAlarm alarm triggered at ${isoString}`);
      const activeNumPRs = (await loadFromLocalStorage(
        "activeNumPRs"
      )) as ActiveNumPRs[];
      const repoOwner = (await loadFromLocalStorage("username")) as string;

      try {
        await updatePRDetails({ activeNumPRs, repoOwner });

        console.log(
          "saved updated PR details to extension localStorage successfully"
        );
        return;
      } catch (e) {
        await handleUpdatePRDetailsError(e as ErrorMsg);
      }
    } else if (alarmName === "rateLimitErrorAlarm") {
      console.log(
        "period elapsed for suspension from making requests due to rate limit error response"
      );

      try {
        // 1). delete rate limit error alarm
        console.log("deleting rate limit error alarm");
        await handleDeleteAlarm("rateLimitErrorAlarm");
        console.log("deleted rate limit error alarm");

        // 2). create new polling alarm
        console.log("creating new polling alarm");
        await handleCreateAlarm("pollingAlarm");
        console.log("created new polling alarm");

        // 3). updating session storage to indicate rate limit error has been handled
        console.log("setting watInterval in session storage to 0");
        await saveToSessionStorage("rateLimitWaitInterval", 0);
        console.log("clearing rate limit error messages in session storage");
        await saveToSessionStorage("rateLimitErrorMessages", []);
      } catch (e) {
        console.error(
          "Issue handling deletion of old rate limit error alarm followed by creation of new polling alarm following rate limit error period having elapsed"
        );

        throw new Error("Alarm handling error encountered");
      }

      return;
    }
  } catch (e) {
    throw new Error("Alarm handling error encountered");
  }
}

async function handleLocalStorageStepChanges(
  changes: { [key: string]: chrome.storage.StorageChange },
  area: string
): Promise<void> {
  // checking if localStorage indicates on repo tracking display screen, to determine if polling alarm needs to be created or deleted
  if (area === "local" && changes.step) {
    const newValue = JSON.parse(changes.step.newValue);
    console.log("the step is:", newValue);

    if (newValue !== 4) {
      // if not on repo track display screen, delete polling alarm if it exists

      console.log(
        "no repos being tracked, deleting polling or rate limit error alarm if it exists"
      );
      await handleDeleteAllAlarms();
    } else if (newValue === 4) {
      // if on repo track display screen, ensure polling alarm exists

      console.log(
        "on repo track display screen, ensuring polling alarm exists"
      );
      await handleCreateAlarm("pollingAlarm");
      console.log("ensured polling alarm exists");
    }
  }
}

export {
  handleAlertAlarm,
  handleCreateAlarm,
  handleDeleteAlarm,
  handleLocalStorageStepChanges,
};
