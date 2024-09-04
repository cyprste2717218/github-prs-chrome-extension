import { RepoCardComponentDetails } from "../models/RepoCardModels";

const RepoCardComponent = (repo : RepoCardComponentDetails): JSX.Element => {
	return (
		<a href={repo.clone_url}>
			<div>
				<h3>{repo.name}</h3>
			</div>
      	</a>
	)
}

const GeneratedRepoCards = ({repoDetails}: {repoDetails: RepoCardComponentDetails[]}): JSX.Element => {

    if (!repoDetails) {
      return <h3>No Repos found for provided username</h3>;
    }

    return (
		<>
		{repoDetails.map((repo: RepoCardComponentDetails) => 
			<RepoCardComponent name={repo.name} clone_url={repo.clone_url} />
			
		)}
	  	</>
    )
  }

export default GeneratedRepoCards;