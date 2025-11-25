import { isFailureFetchNumPRs } from "@/utilities/errorHandlingUtilities";
import { fetchNumPRs } from "./fetchNumPRs";
import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { saveToLocalStorage } from "@/utilities/service-worker-funcs/storage-utils";
import { request } from "@octokit/request";

async function handleRedirectLogic({
	repo,
	repoOwner,
	repoName,
	storedPATCode,
	activeNumPRs,
	response,
	currentFetch,
}: {
	repo: ActiveNumPRs;
	repoOwner: string;
	repoName: string;
	storedPATCode: string;
	activeNumPRs: ActiveNumPRs[];
	response: { status: number; url: string };
	currentFetch: number;
}): Promise<void> {
	function checkForRedirects({
		status,
		url,
	}: {
		status: number;
		url: string;
	}): { type: string; url: string } {
		console.log("status:", status);
		console.log("url:", url);

		let redirectionType: string = "na";

		// Handling redirection status codes - see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#follow-redirects

		if (status === 302 || status === 307) {
			// temporary redirection
			redirectionType = "temporary";
		} else if (status === 301) {
			// permanent redirection
			redirectionType = "permanent";
		}

		return {
			type: redirectionType,
			url: url,
		};
	}

	const status = response.status;
	const url = response.url;
	const redirects = checkForRedirects({ status, url });

	if (redirects.type === "temporary") {
		console.log("repeating fetchNumPRs with temporary redirect url");
		const temporaryChangedRepo = { ...repo, redirectUrl: redirects.url };
		await fetchNumPRs(
			activeNumPRs,
			temporaryChangedRepo,
			repoOwner,
			currentFetch,
			storedPATCode
		);

		return;
	} else if (redirects.type === "permanent") {
		console.log("repeating fetchNumPRs with permanent redirect url");

		const updatedActiveNumPRs = activeNumPRs;
		for (let i = 0; i < updatedActiveNumPRs.length; i++) {
			if (updatedActiveNumPRs[i].name === repoName) {
				updatedActiveNumPRs[i].redirectUrl = redirects.url;
			}
		}
		await saveToLocalStorage("activeNumPRs", updatedActiveNumPRs);
		await fetchNumPRs(
			activeNumPRs,
			repo,
			repoOwner,
			currentFetch,
			storedPATCode
		);

		return;
	}
}

async function handleUnauthenticatedFetch(
	owner: string,
	repoName: string,
	currentFetch: number
): Promise<OctokitResponse<any, number>> {
	// unauthenticated request
	try {
		const response = await request(`GET /repos/${owner}/${repoName}/pulls`, {
			owner: owner,
			repo: repoName,
			headers: {
				"X-GitHub-Api-Version": "2022-11-28",
			},

		});

		await handleRedirectLogic({ response, currentFetch });

		return response;
	} catch (error) {
		if (!(error instanceof RequestError)) {
			console.error("Unknown error type encountered:", error);
			throw error;
		}

		const errorDetails = { customType: "Rate Limit Error encountered", waitInterval: 3600 };

		console.log(`error fetching number of PRs for repo ${repoName}: ${error}`);

		throw errorDetails;

		//To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
	}
}

async function handleAuthenticatedFetch(
	owner: string,
	repoName: string,
	storedPATCode: string,
	currentFetch: number
): Promise<OctokitResponse<any, number>> {
	// authenticated request
	try {
		const requestWithAuth = request.defaults({
			headers: {
				authorization: `token ${storedPATCode}`,
			},
		});
		const response = await requestWithAuth(
			`GET /repos/${owner}/${repoName}/pulls`
		);

		console.log("This is the response from authenticated fetch:", response);

		await handleRedirectLogic({ response, currentFetch });

		return response;
	} catch (error) {
		if (!(error instanceof RequestError)) {
			console.error("Unknown error type encountered:", error);
			throw error;
		}

		const errorDetails = { customType: "Rate Limit Error encountered", waitInterval: 3600 };

		console.log(`error fetching number of PRs for repo ${repoName}: ${error} `);

		throw errorDetails;

		//To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
	}
}

async function retrieveFetchResults(
	owner: string,
	repoName: string,
	storedPATCode: string | null,
	currentFetch: number
): Promise<any> {
	try {
		// To-do: Switch out request url for authenticated and unauthenticated requests to use the one from the redirectUrl variable if present
		if (!storedPATCode) {
			// unauthenticated request
			const results = await handleUnauthenticatedFetch(
				owner,
				repoName,
				currentFetch
			);
			return results;
		} else {
			// authenticated request
			const results = await handleAuthenticatedFetch(
				owner,
				repoName,
				storedPATCode,
				currentFetch
			);

			return results;
		}
	} catch (e) {
		if (!isFailureFetchNumPRs(e)) {
			throw new Error(`Unrecognised error format: ${e}`);
		}
		throw e;
	}
}

async function handleRetrieval(
	owner: string,
	repoName: string,
	storedPATCode: string,
	currentFetch: number
) {
	try {
		const results = await retrieveFetchResults(
			owner,
			repoName,
			storedPATCode,
			currentFetch
		);
		return results;
	} catch (e) {
		if (!isFailureFetchNumPRs(e)) {
			console.error("Unrecognised error format:", e);
		}

		throw e;
	}
}

export { retrieveFetchResults, handleRetrieval };
