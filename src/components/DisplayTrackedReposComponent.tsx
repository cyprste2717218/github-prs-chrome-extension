import { DisplayTrackedReposProps } from "@/models/frontend/StepComponentModels";
import AllTrackedRepoCards from "./repo-cards/AllTrackedRepoCards";
import ButtonCustom from "./input/ButtonCustom";

const DisplayTrackedReposComponent = ({
  activeNumPRs,
  username,
}: DisplayTrackedReposProps) => {
  // Threshold for the scroll to top button to appear
  const thresholdPixels = -1050;

  return (
    <>
      <AllTrackedRepoCards
        githubUsername={username}
        activeNumPRs={activeNumPRs}
      />
      <div className="fixed bottom-4 right-4 z-10">
        <ButtonCustom
          type="scrollToTop"
          scrollThresholdPixels={thresholdPixels}
        />
      </div>
    </>
  );
};

export default DisplayTrackedReposComponent;
