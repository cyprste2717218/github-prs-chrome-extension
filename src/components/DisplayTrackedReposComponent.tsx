import { DisplayTrackedReposProps } from "@/models/StepComponentModels";
import AllTrackedRepoCards from "./repo-cards/AllTrackedRepoCards";

const DisplayTrackedReposComponent = ({
  activeNumPRs,
  githubUsername,
}: DisplayTrackedReposProps) => {
  return (
    <>
      <AllTrackedRepoCards
        githubUsername={githubUsername}
        activeNumPRs={activeNumPRs}
      />
    </>
  );
};

export default DisplayTrackedReposComponent;
