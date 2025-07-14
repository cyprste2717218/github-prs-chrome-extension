import { ChangeEvent } from "react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import InputCustom from "./input/TextInputCustom";
import ButtonCustom from "./input/ButtonCustom";
import { GitDetailsEntryProps } from "@/models/StepComponentModels";

const GitDetailsEntryComponent = ({
  setUsername,
  setRepoDetails,
  setActiveNumPRs,
  setStep,
  setPAT,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  currentStep,
  username,
  activeNumPRs,
  PAT,
}: GitDetailsEntryProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event?.target?.value);
  };

  const handlePATChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPAT(event?.target?.value);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        columnGap: "10px",
        marginTop: "20px",
        color: "#000",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <Separator className="my-4" />
          <div style={{ margin: "5px", textAlign: "left" }}>
            <Label htmlFor="username">Github Username/Org Name</Label>
          </div>

          <InputCustom
            type="username"
            username={username}
            handleUserNameChange={handleUserNameChange}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          {PAT !== null && (
            <>
              <div style={{ margin: "5px", textAlign: "left" }}>
                <Label htmlFor="githubPAT">
                  Your Github Personal Access Token (classic)
                </Label>
              </div>

              <InputCustom
                type="PAT"
                PAT={PAT}
                handlePATChange={handlePATChange}
              />
            </>
          )}
        </div>
        <div style={{ marginTop: "15px" }}>
          <ButtonCustom
            type="submit"
            username={username}
            patCode={PAT}
            currentStep={currentStep}
            repoOwner={username}
            activeNumPRs={activeNumPRs}
            initialValuePAT={PAT}
            setRepoDetails={setRepoDetails}
            setStep={setStep}
            setPAT={setPAT}
            setActiveNumPRs={setActiveNumPRs}
            setUsername={setUsername}
            setNumPageResults={setNumPageResults}
            setDisplayWarning={setDisplayWarning}
            setReposToggled={setReposToggled}
          />
        </div>
      </div>
    </div>
  );
};

export default GitDetailsEntryComponent;
