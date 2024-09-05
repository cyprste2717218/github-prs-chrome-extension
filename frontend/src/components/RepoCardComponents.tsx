import { RepoCardComponentDetails } from "../models/RepoCardModels";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCircle as unFilledCheckBox} from '@fortawesome/free-regular-svg-icons';
import {faCircleCheck as filledCheckBox} from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";

type GeneratedRepoCardsProps = {
	repoDetails: RepoCardComponentDetails[] | null;
	setSelectedRepos: React.Dispatch<React.SetStateAction<string[]>>;
	selectedRepos: string[];
}

type RepoCardProps = {
	name: string;
	clone_url: string;
	selectedRepos: string[];
	setSelectedRepos: React.Dispatch<React.SetStateAction<string[]>>;
}

const RepoCardComponent = ({name, clone_url, selectedRepos, setSelectedRepos} : RepoCardProps): JSX.Element => {

	const [repoChecked, setRepoChecked] = useState<boolean>(false);

	const handleClick = () => {
		setRepoChecked(!repoChecked);
		for ( let i = 0; i < selectedRepos.length; i++) {
			if ((selectedRepos[i] === name) && !repoChecked) {
				const updatedRepoDetails = [...selectedRepos];
  				updatedRepoDetails.splice(i, 1);
				setSelectedRepos(updatedRepoDetails);
			} else {
				setSelectedRepos([...selectedRepos, name]);
			}
		}
		
	};

	return (
		<>
			<div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}>
				<div style={{width: '80%'}}>
					<div style={{border: '2px solid #000'}}>
						<a href={clone_url} target="_blank">
							<h3>{name}</h3>
						</a>
					</div>
				</div>
				<div style={{width: '20%'}}>	
					<label>
						<button
							type='button'
							role='checkbox'
							aria-checked={repoChecked}
							id={`check${name}`}
							style={{backgroundColor: '#fff', border: '1px solid #fff'}}
							onClick={handleClick}
						>
							<FontAwesomeIcon size='lg' style={{fontSize: '2rem', color: '#ADD8E6'}} icon={repoChecked ? filledCheckBox : unFilledCheckBox} />

						</button>
					</label>
				</div>
			</div>
		</>
	)
}

const GeneratedRepoCards = ({repoDetails, setSelectedRepos, selectedRepos}: GeneratedRepoCardsProps): JSX.Element => {

    if (!repoDetails) {
      return <h3>No Repos found for provided username</h3>;
    }

    return (
		<>
		{repoDetails.map((repo: RepoCardComponentDetails) => 
			<RepoCardComponent name={repo.name} clone_url={repo.clone_url} setSelectedRepos={setSelectedRepos} selectedRepos={selectedRepos} />
			
		)}
	  	</>
    )
  }

export default GeneratedRepoCards;