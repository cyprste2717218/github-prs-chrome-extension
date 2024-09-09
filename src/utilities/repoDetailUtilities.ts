import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/RepoCardModels";
import { request } from "@octokit/request";

type RepoDetailUtilities = {
  username: string;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

type SubmitPRDetailsProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

async function updatePRDetails({
  setActiveNumPRs,
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps) {
  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);
  const updatedNumPRs = await Promise.all(
    activeNumPRs.map(async (repo) => {
      const repoName = repo.name;
      const owner = repoOwner;
      const currentNumPRs = repo.numActivePRs;

      const response = await request(`GET /repos/${owner}/${repoName}/pulls`, {
        owner: owner,
        repo: repoName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }).then((response) => response.data);

      // update number of PRs for repo if number changed
      let updatedNumPRs: number = currentNumPRs;
      if (currentNumPRs !== response.length) {
        updatedNumPRs = response.length;
      }

      console.log("github prs fetched:", response);

      return {
        name: repoName,
        numActivePRs: updatedNumPRs,
      };
    })
  );

  setActiveNumPRs(updatedNumPRs);
}

async function handleSubmitUserName({
  username,
  setRepoDetails,
  setStep,
}: RepoDetailUtilities) {
  if (!username) {
    console.warn("No username entered, no repos fetched");
    return;
  }

  await handleFetchUserRepos(username).then((results) => {
    if (!results) {
      return;
    }
    setRepoDetails(results);
    setStep(2);
  });
}

async function handleFetchUserRepos(
  username: string
): Promise<RepoCardComponentDetails[] | undefined> {
  if (!username) {
    console.warn("No username entered");
    return;
  }

  const results = await fetch(
    `https://api.github.com/users/${username}/repos`
  ).then((response) => response.json());

  if (results?.length > 0) {
    const relevantDetails = results.map((repo: any) => {
      let shortenedDesc = repo.description;

      if (repo.description.length > 150) {
        shortenedDesc = repo.description.slice(0, 150) + "...";
      }

      return {
        name: repo.name,
        clone_url: repo.clone_url,
        description: shortenedDesc,
        language: repo.language,
        topics: repo.topics,
      };
    });

    return relevantDetails;
  } else {
    return undefined;
  }
}

export { handleFetchUserRepos, handleSubmitUserName, updatePRDetails };
