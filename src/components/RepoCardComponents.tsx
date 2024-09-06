import {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "../models/RepoCardModels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle as unFilledCheckBox } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck as filledCheckBox } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

type GeneratedRepoCardsProps = {
  repoDetails: RepoCardComponentDetails[] | null;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
};

type RepoCardProps = {
  name: string;
  clone_url: string;
  activeNumPRs: ActiveNumPRs[];
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
};

const RepoCardComponent = ({
  name,
  clone_url,
  activeNumPRs,
  setActiveNumPRs,
}: RepoCardProps): JSX.Element => {
  const [repoChecked, setRepoChecked] = useState<boolean>(false);

  const handleClick = () => {
    setRepoChecked(!repoChecked);

    // TODO: fix issue where repoChecked value is out of sync with value shown in UI

    const currentRepoDetails: ActiveNumPRs[] = [...activeNumPRs];
    let updatedRepoDetails: ActiveNumPRs[] = [];

    if (repoChecked) {
      // logic for repo not tracked

      updatedRepoDetails = currentRepoDetails.filter(
        (repo) => repo.name !== name,
      );
    } else {
      // logic for repo when is tracked

      const existingRepo = currentRepoDetails.find(
        (repo) => repo.name === name,
      );

      if (existingRepo) {
        return currentRepoDetails;
      } else {
        const newRepo = { name: name, numActivePRs: 0 };
        updatedRepoDetails = [...currentRepoDetails, newRepo];
      }
    }

    setActiveNumPRs(updatedRepoDetails);
  };

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "center", padding: "10px" }}
      >
        <div style={{ width: "80%" }}>
          <div style={{ border: "2px solid #000" }}>
            <a href={clone_url} target="_blank">
              <h3>{name}</h3>
            </a>
          </div>
        </div>
        <div style={{ width: "20%" }}>
          <label>
            <button
              type="button"
              role="checkbox"
              aria-checked={repoChecked}
              id={`check${name}`}
              style={{ backgroundColor: "#fff", border: "1px solid #fff" }}
              onClick={handleClick}
            >
              <FontAwesomeIcon
                size="lg"
                style={{ fontSize: "2rem", color: "#ADD8E6" }}
                icon={repoChecked ? filledCheckBox : unFilledCheckBox}
              />
            </button>
          </label>
        </div>
      </div>
    </>
  );
};

const GeneratedRepoCards = ({
  repoDetails,
  setActiveNumPRs,
  activeNumPRs,
}: GeneratedRepoCardsProps): JSX.Element => {
  if (!repoDetails) {
    return <h3>No Repos found for provided username</h3>;
  }

  return (
    <>
      {repoDetails.map((repo: RepoCardComponentDetails) => (
        <RepoCardComponent
          name={repo.name}
          clone_url={repo.clone_url}
          setActiveNumPRs={setActiveNumPRs}
          activeNumPRs={activeNumPRs}
        />
      ))}
    </>
  );
};

export default GeneratedRepoCards;
