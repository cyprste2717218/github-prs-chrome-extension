import { ChangeEvent } from 'react'
import GeneratedRepoCards from './RepoCardComponents';
import type { RepoCardComponentDetails } from '../models/RepoCardModels';
import { handleSubmitUserName } from '../utilities/repoDetailUtilities';

type StepComponentProps = {
	setUsername: React.Dispatch<React.SetStateAction<string>>
	setRepoDetails: React.Dispatch<React.SetStateAction<RepoCardComponentDetails[]>>
	setStep: React.Dispatch<React.SetStateAction<number>>
	username: string
	repoDetails: RepoCardComponentDetails[]
	step: number
}

type StepOneComponentProps = {
	setUsername: React.Dispatch<React.SetStateAction<string>>
	setRepoDetails: React.Dispatch<React.SetStateAction<RepoCardComponentDetails[]>>
	setStep: React.Dispatch<React.SetStateAction<number>>
	username: string
}

type StepTwoComponentProps = {
	repoDetails: RepoCardComponentDetails[]
}


const StepOneComponent = ({setUsername, setRepoDetails, setStep, username}: StepOneComponentProps) => {
	const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event?.target?.value) {
		  return;
		}
	
		setUsername(event?.target?.value);
	
	  };

	return (
	<div>
	  <input type="text" placeholder='e.g. @rollingwolf238' value={username} onChange={(e) => handleUserNameChange(e)}></input>
	  <button onClick={() => handleSubmitUserName({username, setRepoDetails, setStep})} type='submit'>Submit</button>
	</div>
	)
}

const StepTwoComponent = ({ repoDetails }: StepTwoComponentProps) => {
	return (
		<GeneratedRepoCards repoDetails={repoDetails} />
	)
}


const StepComponent = ({setUsername, setRepoDetails, setStep, username, repoDetails, step}: StepComponentProps) => {

    let CurrentStepUI = <></>;

    switch(step) {
      case 1:
        CurrentStepUI = <StepOneComponent username={username} setUsername={setUsername} setRepoDetails={setRepoDetails} setStep={setStep} />
        break;

      case 2:
        CurrentStepUI = <StepTwoComponent repoDetails={repoDetails} />
        break;

      case 3:
        CurrentStepUI = <></>;
        break;
    }

    return CurrentStepUI;
  }


export default StepComponent;