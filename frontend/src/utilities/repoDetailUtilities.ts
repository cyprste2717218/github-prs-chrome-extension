import type { RepoCardComponentDetails, ActiveNumPRs } from "../models/RepoCardModels";

type RepoDetailUtilities = {
	username: string;
	setRepoDetails: React.Dispatch<React.SetStateAction<RepoCardComponentDetails[] | null>>;
	setStep: React.Dispatch<React.SetStateAction<number>>;
}

type SubmitPRDetailsProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
}

async function handleSubmitPRDetails({setActiveNumPRs, activeNumPRs, repoOwner}: SubmitPRDetailsProps) {
  console.log('gets to here');
  console.log('active num of prs:', activeNumPRs)
  const updatedNumPRs = await Promise.all(
    activeNumPRs.map( async (repo) => {
      const repoName = repo.name;
      const owner = repoOwner;
      const currentNumPRs = repo.numActivePRs.toString();
      

      const queryParams = new URLSearchParams({
        repoName,
        owner,
        currentNumPRs,
      });

    const response = (await fetch(`/api?${queryParams.toString()}`)).json();
    const data = await response
    
    return {
      name: repoName,
      numActivePRs: data.numActivePRs
    } 
  }))

  setActiveNumPRs(updatedNumPRs);
 
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



export { handleFetchUserRepos, handleSubmitUserName, handleSubmitPRDetails}

   