import { Button } from "./ui/button";
import { RefreshCcw } from "lucide-react";

type HandleRefreshProps = {
	handleRefresh: () => void;
}

const RefreshButton = ({handleRefresh}: HandleRefreshProps) => {
	return (
			<Button onClick={handleRefresh} variant='outline' size='icon'>
				<RefreshCcw className='h-4 w-4' />
			</Button>
	)
}

export default RefreshButton;