import { Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  AllTrackedRepoCardProps,
  TrackedRepoCardProps,
  TrackedRepoRowProps,
} from "@/models/frontend/RepoCardModels";

const AllTrackedRepoCards = ({
  activeNumPRs,
  githubUsername,
}: AllTrackedRepoCardProps) => {
  if (!activeNumPRs) return <></>;

  const totalRepos = activeNumPRs.length;
  let results = [];

  if (totalRepos > 0) {
    for (let i = 0; i < totalRepos; i += 2) {
      function isIndexOutOfRange() {
        return i + 1 >= totalRepos;
      }

      results.push(
        <TrackedRepoRow
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
    </>
  );
};

const TrackedRepoRow = ({
  repoOneName,
  repoTwoName,
  repoOneNumPRs,
  repoTwoNumPRs,
  githubUsername,
}: TrackedRepoRowProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <TrackedCardComponent
        name={repoOneName}
        numPRs={repoOneNumPRs}
        githubUsername={githubUsername}
      />
      <TrackedCardComponent
        name={repoTwoName}
        numPRs={repoTwoNumPRs}
        githubUsername={githubUsername}
      />
    </div>
  );
};

const TrackedCardComponent = ({
  name,
  numPRs,
  githubUsername,
}: TrackedRepoCardProps) => {
  if (name === "" && numPRs === -1) {
    //To-do: improve this 'null' logic handling - temporary measure for now
    return <Fragment></Fragment>;
  }

  function getDisplayCardNameForLength(fullRepoName: string): string {
    if (fullRepoName.length > 27) {
      return fullRepoName.slice(0, 27) + "...";
    } else {
      return fullRepoName.slice(0, 10) + "\n" + fullRepoName.slice(10, 27);
    }
  }

  const cardNameForURL: string = name;
  const displayCardName: string = getDisplayCardNameForLength(name);

  return (
    <a
      href={`https://github.com/${githubUsername}/${cardNameForURL}`}
      target="_blank"
    >
      <Card
        className="w-[200px] h-[200px] shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out"
        style={{ margin: "5px" }}
        id={`displayCard-${displayCardName}`}
      >
        <CardHeader style={{ height: "100px", whiteSpace: "pre-line" }}>
          <CardTitle>{displayCardName}</CardTitle>
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

export default AllTrackedRepoCards;
