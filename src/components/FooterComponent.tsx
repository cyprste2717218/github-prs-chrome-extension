import { handleFetchActivePRs } from "../utilities/repoDetailUtilities";

type FooterComponentProps = {
	setStepState: React.Dispatch<React.SetStateAction<number>>
	currentStep: number;
}

const FooterComponent = ({setStepState, currentStep}: FooterComponentProps): JSX.Element => {

	async function handleClick() {
		// establish websockets connection and fetch PR numbers for repos
		const results = await handleFetchActivePRs();

		setStepState(currentStep + 1);
	}
	

	return (
		<>
			{(currentStep === 2) && <button onClick={() => handleClick()}>Next</button>}
		</>
	)
}

export default FooterComponent;