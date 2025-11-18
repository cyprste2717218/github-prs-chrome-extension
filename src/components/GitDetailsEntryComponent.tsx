import { ChangeEvent } from "react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import InputCustom from "./input/TextInputCustom";
import ButtonCustom from "./input/ButtonCustom";
import { GitDetailsEntryProps } from "@/models/frontend/StepComponentModels";
import { saveToLocalStorage } from "@/utilities/service-worker-funcs/storage-utils";

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
  patCode,
}: GitDetailsEntryProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    saveToLocalStorage("username", event?.target?.value);
    // setUsername(event?.target?.value);
  };

  const handlePATChange = (event: ChangeEvent<HTMLInputElement>) => {
    saveToLocalStorage("patCode", event?.target?.value);
    //setPAT(event?.target?.value);
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
          {patCode !== null && (
            <>
              <div style={{ margin: "5px", textAlign: "left" }}>
                <Label htmlFor="githubPAT">
                  Your Github Personal Access Token (classic)
                </Label>
              </div>

              <InputCustom
                type="PAT"
                PAT={patCode}
                handlePATChange={handlePATChange}
              />
            </>
          )}
        </div>
        <div style={{ marginTop: "15px" }}>
          <ButtonCustom
            type="submit"
            username={username}
            patCode={patCode}
            currentStep={currentStep}
            repoOwner={username}
            activeNumPRs={activeNumPRs}
            initialValuePAT={patCode}
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
