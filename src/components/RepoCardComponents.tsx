import React, { Fragment, SetStateAction } from "react";
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
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronsUpDown } from "lucide-react";

import { useState } from "react";
import { Github } from "lucide-react";
import CheckBoxCustom from "./CheckBoxCustom";
import { handleChangePageResults } from "@/utilities/repoDetailUtilities";

const DisplayCardComponent = ({
  name,
  numPRs,
  githubUsername,
}: DisplayRepoCardProps) => {
  if (name === "" && numPRs === -1) {
    //To-do: improve this 'null' logic handling - temporary measure for now
    return <Fragment></Fragment>;
  }

  let cardName = name;
  if (name.length > 27) {
    cardName = name.slice(0, 27) + "...";
  }
  return (
    <a
      href={`https://github.com/${githubUsername}/${cardName}`}
      target="_blank"
    >
      <Card
        className="w-[200px] h-[200px] shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out"
        style={{ margin: "5px" }}
        id={`displayCard-${cardName}`}
      >
        <CardHeader style={{ height: "100px" }}>
          <CardTitle>{cardName}</CardTitle>
        </CardHeader>
        <CardContent style={{ height: "100px" }}>
          <div style={{ marginBottom: "auto", marginTop: "auto" }}>
            <div className="text-4xl font-semibold">{numPRs}</div>
            <div>Open PRs</div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

const GeneratedDisplayRepoCards = ({
  activeNumPRs,
  githubUsername,
}: {
  activeNumPRs: ActiveNumPRs[];
  githubUsername: string;
}) => {
  type RepoRowProps = {
    repoOneName: string;
    repoTwoName: string;
    repoOneNumPRs: number;
    repoTwoNumPRs: number;
    githubUsername: string;
  };

  const RepoRow = ({
    repoOneName,
    repoTwoName,
    repoOneNumPRs,
    repoTwoNumPRs,
    githubUsername,
  }: RepoRowProps) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <DisplayCardComponent
          name={repoOneName}
          numPRs={repoOneNumPRs}
          githubUsername={githubUsername}
        />
        <DisplayCardComponent
          name={repoTwoName}
          numPRs={repoTwoNumPRs}
          githubUsername={githubUsername}
        />
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
          githubUsername={githubUsername}
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
    <div
      id={`previewCard-${name}`}
      style={{ display: "flex", justifyContent: "center", padding: "10px" }}
    >
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
      <Card
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CheckBoxCustom
          repoChecked={repoChecked}
          handleClick={handleClick}
          name={name}
        />
      </Card>
    </div>
  );
};

// move ts inline definitions here elsewhere
const PaginationElements = ({
  numPageResults,
  setNumPageResults,
  setRepoDetails,
  username,
  patCode,
}: {
  setNumPageResults: React.Dispatch<SetStateAction<number | null>>;
  numPageResults: number | null;
  setRepoDetails: React.Dispatch<
    SetStateAction<RepoCardComponentDetails[] | null>
  >;
  username: string;
  patCode: string | null;
}) => {
  const generatePaginationElements = () => {
    if (!numPageResults) return;
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>;

    let paginationElements = [];

    for (let i = 0; i < numPageResults; i++) {
      let resultPageNum = i + 1;

      paginationElements.push(
        <PaginationItem
          onClick={() =>
            handleChangePageResults({
              setNumPageResults,
              setRepoDetails,
              username,
              patCode,
              resultPageNum,
            })
          }
        >
          <PaginationLink>{i + 1}</PaginationLink>
        </PaginationItem>
      );
    }

    return paginationElements;
  };

  return (
    <Pagination>
      <PaginationContent>{generatePaginationElements()}</PaginationContent>
    </Pagination>
  );
};

const GeneratedPreviewRepoCards = ({
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
  username,
  patCode,
  repoDetails,
  step,
  numPageResults,
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
      <PaginationElements
        setNumPageResults={setNumPageResults}
        numPageResults={numPageResults}
        setRepoDetails={setRepoDetails}
        username={username}
        patCode={patCode}
      />
    </>
  );
};

export { GeneratedPreviewRepoCards, GeneratedDisplayRepoCards };
