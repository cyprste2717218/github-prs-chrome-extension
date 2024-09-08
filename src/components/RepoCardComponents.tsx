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
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { Github } from "lucide-react";

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
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "left" }}>
                  {language && <Badge>{language}</Badge>}
                </div>
                <div style={{ display: "flex", justifyContent: "left" }}>
                  {topics ? (
                    topics.map((topic) => (
                      <Badge variant="outline" key={topic}>
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" />
              <div style={{ display: "flex", justifyContent: "left" }}>
                <a href={clone_url} target="_blank">
                  <Button variant="link">
                    <div style={{ padding: "10px" }}>
                      <Github className="h-4 w-4" />
                    </div>
                    Link to Repo
                  </Button>
                </a>
              </div>
            </div>
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
