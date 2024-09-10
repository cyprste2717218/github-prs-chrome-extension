import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type HandleRefreshProps = {
  handleRefresh: () => void;
};

const RefreshButton = ({ handleRefresh }: HandleRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = () => {
	console.log('pressed refresh button')
    setIsRefreshing(true);
    handleRefresh();
    setIsRefreshing(false);
	console.log('succesfully refreshed prs')
  };

  return (
    <Button onClick={handleClick} variant="outline">
      <RefreshCw className={`h-4 w-4 ${isRefreshing && "animate-spin"}`} />
    </Button>
  );
};

export default RefreshButton;
