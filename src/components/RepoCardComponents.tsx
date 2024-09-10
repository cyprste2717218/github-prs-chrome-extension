import { Fragment } from "react";
import {
  ActiveNumPRs,
  RepoCardComponentDetails,
  DisplayRepoCardProps,
  PreviewRepoCardProps,
  GeneratedRepoCardsProps,
} from "../models/RepoCardModels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ChevronsUpDown } from "lucide-react";

import { useState } from "react";
import { Github } from "lucide-react";

const DisplayCardComponent = ({ name, numPRs }: DisplayRepoCardProps) => {
  if (name === "" && numPRs === -1) {
    //To-do: improve this 'null' logic handling - temporary measure for now
    return <Fragment></Fragment>;
  }
  return (
    <Card className="w-[200px]">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>{numPRs} Open PRs</CardContent>
    </Card>
  );
};

const GeneratedDisplayRepoCards = ({
  activeNumPRs,
}: {
  activeNumPRs: ActiveNumPRs[];
}) => {
  type RepoRowProps = {
    repoOneName: string;
    repoTwoName: string;
    repoOneNumPRs: number;
    repoTwoNumPRs: number;
  };

  const RepoRow = ({
    repoOneName,
    repoTwoName,
    repoOneNumPRs,
    repoTwoNumPRs,
  }: RepoRowProps) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <DisplayCardComponent name={repoOneName} numPRs={repoOneNumPRs} />
        <DisplayCardComponent name={repoTwoName} numPRs={repoTwoNumPRs} />
      </div>
    );
  };

  if (!activeNumPRs) return <></>;

  const totalRepos = activeNumPRs.length;
  let results = [];

  if (totalRepos > 0) {
    for (let i = 0; i < totalRepos; i += 2) {
      function isIndexOutOfRange() {
        return i + 1 >= totalRepos;
      }

      results.push(
        <RepoRow
          repoOneName={activeNumPRs[i].name}
          repoOneNumPRs={activeNumPRs[i].numActivePRs}
          repoTwoName={isIndexOutOfRange() ? "" : activeNumPRs[i + 1].name}
          repoTwoNumPRs={
            isIndexOutOfRange() ? -1 : activeNumPRs[i + 1].numActivePRs
          }
        />
      );
    }
  }

  return (
    <>
      {results.map((card) => (
        <Fragment>{card}</Fragment>
      ))}
      {/*  {activeNumPRs.map((repo) => (
        <DisplayCardComponent name={repo.name} numPRs={repo.numActivePRs} />
      ))} */}
    </>
  );
};

const PreviewCardComponent = ({
  name,
  description,
  language,
  topics,
  clone_url,
  activeNumPRs,
  setActiveNumPRs,
}: PreviewRepoCardProps): JSX.Element => {
  const [repoChecked, setRepoChecked] = useState<boolean>(false);
  const [cardExpanded, setCardExpanded] = useState<boolean>(false);

  async function handleClick() {
    setRepoChecked(!repoChecked);
    ``;

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
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
      <Collapsible open={cardExpanded} onOpenChange={setCardExpanded}>
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ width: "380px" }}>{name}</div>
                <div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle Repository Details</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CollapsibleContent>
            <CardDescription>{description}</CardDescription>
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
          </CollapsibleContent>
        </Card>
      </Collapsible>
      <Card>
        <div>
          <Checkbox
            aria-checked={repoChecked}
            id={`check${name}`}
            onClick={handleClick}
          />
          <label
            htmlFor={`check${name}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Track Repo
          </label>
        </div>
      </Card>
    </div>
  );
};

const GeneratedPreviewRepoCards = ({
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
        <PreviewCardComponent
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

export { GeneratedPreviewRepoCards, GeneratedDisplayRepoCards };
