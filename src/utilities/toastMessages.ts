const toastMessages = {
	"success": {
		"savePollingRate": "New polling rate saved successfully!"
	},
	"info": {
		"rateLimitError": `You've hit a rate limit! Waiting ${timeout} seconds before trying again`
	},
	"error": {
		"noPublicRepos": "No public repositories discovered for specified user",
		"polling": "Error during polling github api, if the issue persists try reinstalling the extension",
		"storageHandling": "An error has occurred, try reloading or alternatively reinstalling the extension",
		"alarmHandling": "An error has occurred, try reloading or alternatively reinstalling the extension",
		"extensionInstall": "An error has occurred, try reloading or alternatively reinstalling the extension"
	}
}

const getToast(category: "success" | "info" | "error", cause: string, timeout?: number): string => {

	if (!timeout) {
		return toastMessages[category][cause];
	}

	return "";

}

export { getToast }