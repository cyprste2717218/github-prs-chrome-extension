import { SelectAllButtonProps } from "@/models/InputModels";
import { Button } from "../ui/button";
import CheckBoxCustom from "./CheckBoxCustom";
import { handleToggleAllRepos } from "@/utilities/repoDetailUtilities";

const SelectAllButton = ({
  allReposToggled,
  repoDetails,
  activeNumPRs,
  setActiveNumPRs,
  setRepoDetails,
  setReposToggled,
}: SelectAllButtonProps): JSX.Element => {
  async function toggleAllSelectedRepos() {
    if (repoDetails !== null) {
      setReposToggled(!allReposToggled);
      await handleToggleAllRepos({
        allReposToggled,
        setRepoDetails,
        setActiveNumPRs,
        activeNumPRs,
        repoDetails,
      });
    }
  }
  console.log(
    "Select all button will receive repoChecked value: ",
    allReposToggled
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "5px",
        marginBottom: "5px",
        marginRight: "10px",
      }}
    >
      <Button
        variant="secondary"
        className="rounded shadow mb-5"
        id="select-all-button"
        onClick={toggleAllSelectedRepos}
        style={{
          paddingBottom: "15px",
          paddingTop: "15px",
          paddingRight: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <p className="adjacentButtonText">Select All</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginTop: "2px",
              marginLeft: "10px",
              marginRight: "0",
            }}
          >
            <CheckBoxCustom
              handleClick={toggleAllSelectedRepos}
              repoChecked={allReposToggled}
              name={"-ToggleAll"}
            />
          </div>
        </div>
      </Button>
    </div>
  );
};

export default SelectAllButton;
