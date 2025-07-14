import { DisplayTrackedReposProps } from "@/models/StepComponentModels";
import AllTrackedRepoCards from "./repo-cards/AllTrackedRepoCards";

const DisplayTrackedReposComponent = ({
  activeNumPRs,
  username,
}: DisplayTrackedReposProps) => {
  return (
    <>
      <AllTrackedRepoCards
        githubUsername={username}
        activeNumPRs={activeNumPRs}
      />
    </>
  );
};

export default DisplayTrackedReposComponent;
