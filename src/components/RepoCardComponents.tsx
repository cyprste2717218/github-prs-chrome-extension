import {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "../models/RepoCardModels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";

type GeneratedRepoCardsProps = {
  repoDetails: RepoCardComponentDetails[] | null;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  step: number;
};

type RepoCardProps = {
  name: string;
  description: string;
  language: string;
  topics: string[];
  step: number;
  clone_url: string;
  activeNumPRs: ActiveNumPRs[];
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
};

const RepoCardComponent = ({
  name,
  description,
  language,
  topics,
  clone_url,
  activeNumPRs,
  setActiveNumPRs,
}: RepoCardProps): JSX.Element => {
  const [repoChecked, setRepoChecked] = useState<boolean>(false);

  async function handleClick() {
    setRepoChecked(!repoChecked);

    // TODO: fix issue where repoChecked value is out of sync with value shown in UI

    const currentRepoDetails: ActiveNumPRs[] = [...activeNumPRs];
    let updatedRepoDetails: ActiveNumPRs[] = [];

    if (repoChecked) {
      // logic for repo not tracked

      updatedRepoDetails = currentRepoDetails.filter(
        (repo) => repo.name !== name
      );
    } else {
      // logic for repo when is tracked

      const existingRepo = currentRepoDetails.find(
        (repo) => repo.name === name
      );

      if (existingRepo) {
        return currentRepoDetails;
      } else {
        const newRepo = { name: name, numActivePRs: 0 };
        updatedRepoDetails = [...currentRepoDetails, newRepo];
      }
    }

    setActiveNumPRs(updatedRepoDetails);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <a href={clone_url} target="_blank">
              Repo Link
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "left" }}>
            {language && <Badge>{language}</Badge>}
          </div>
          <div style={{ display: "flex", justifyContent: "left" }}>
            {topics &&
              topics.map((topic) => (
                <Badge variant="outline" key={topic}>
                  {topic}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <Checkbox
        aria-checked={repoChecked}
        id={`check${name}`}
        onClick={handleClick}
      />
    </div>
  );
};

const GeneratedRepoCards = ({
  repoDetails,
  step,
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
          description={repo.description}
          language={repo.language}
          topics={repo.topics}
          step={step}
          clone_url={repo.clone_url}
          setActiveNumPRs={setActiveNumPRs}
          activeNumPRs={activeNumPRs}
        />
      ))}
    </>
  );
};

export default GeneratedRepoCards;
