import type { RepoCardComponentDetails } from "../models/RepoCardModels";

type RepoDetailUtilities = {
	username: string;
	setRepoDetails: React.Dispatch<React.SetStateAction<RepoCardComponentDetails[]>>;
	setStep: React.Dispatch<React.SetStateAction<number>>;
}

async function handleSubmitUserName({username, setRepoDetails, setStep}: RepoDetailUtilities) {

    if (!username) {
      console.warn('No username entered, no repos fetched')
      return;
    }

    await handleFetchUserRepos(username)
      .then((results) => {
        if (!results) {
          return;
        }
        setRepoDetails(results)
        setStep(2);
      })

    
  }


async function handleFetchUserRepos(username: string): Promise<RepoCardComponentDetails[] | undefined> {

    if (!username) {
      console.warn('No username entered')
      return;
    }

    const results = await fetch(`https://api.github.com/users/${username}/repos`)
      .then((response) => response.json())
    
    if (results?.length > 0) {
      const relevantDetails = results.map((repo: any) => {
        return {
          name: repo.name,
          clone_url: repo.clone_url,
        }
      }
      )

      return relevantDetails;

    } else {
		return undefined;
	} 

   }

export { handleFetchUserRepos, handleSubmitUserName }

   