import {
  AllPreviewRepoCardsProps,
  PreviewRepoCardProps,
  RepoCardComponentDetails,
} from "@/models/frontend/RepoCardModels";
import { handleToggleRepo } from "@/utilities/repoDetailUtilities";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ChevronsUpDown, Github } from "lucide-react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import CheckBoxCustom from "../input/CheckBoxCustom";

const AllPreviewRepoCards = ({
  setActiveNumPRs,
  repoDetails,
  step,
  activeNumPRs,
  allReposToggled,
}: AllPreviewRepoCardsProps): JSX.Element => {
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
          allReposToggled={allReposToggled}
          setActiveNumPRs={setActiveNumPRs}
          activeNumPRs={activeNumPRs}
        />
      ))}
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
  allReposToggled,
  setActiveNumPRs,
}: PreviewRepoCardProps): JSX.Element => {
  const [repoChecked, setRepoChecked] = useState<boolean>(allReposToggled);
  const [cardExpanded, setCardExpanded] = useState<boolean>(false);
  const [lastToggleState, setLastToggleState] =
    useState<boolean>(allReposToggled);

  useEffect(() => {
    if (lastToggleState !== allReposToggled) {
      const newCheckedState = allReposToggled;
      setRepoChecked(newCheckedState);

      handleToggleRepo({
        name,
        newCheckedState,
        activeNumPRs,
        setActiveNumPRs,
      });
      setLastToggleState(allReposToggled);
    }
  }, [allReposToggled, lastToggleState]);

  type CalculateCollapsibleHeightProps = {
    language: string;
    displayedTopics: string[];
    numAdditionalTopics: number | undefined;
  };

  const calculateCollapsibleHeight = ({
    language,
    displayedTopics,
    numAdditionalTopics,
  }: CalculateCollapsibleHeightProps): number => {
    let collapsibleCardHeight;

    if (language && displayedTopics && numAdditionalTopics) {
      collapsibleCardHeight = 170;
    } else if (language && displayedTopics) {
      collapsibleCardHeight = 50;
    } else {
      collapsibleCardHeight = 20;
    }

    return collapsibleCardHeight;
  };

  async function handleClick() {
    const newCheckedState = !repoChecked;
    setRepoChecked(newCheckedState);
    handleToggleRepo({ name, newCheckedState, activeNumPRs, setActiveNumPRs });
  }

  const separatorPresent = language || (topics && topics.length > 0);

  let numAdditionalTopics: number | undefined;
  let displayedTopics: string[] = topics;
  const calculatedCollapsedHeight = calculateCollapsibleHeight({
    language,
    displayedTopics,
    numAdditionalTopics,
  });
  if (topics && topics.length > 2) {
    displayedTopics = topics.slice(0, 2);
    numAdditionalTopics = topics.length - 2;
  }

  console.log(`allReposToggled: ${name}`, allReposToggled);
  console.log(`repoChecked: ${name}`, repoChecked);

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
          <CollapsibleContent className={`h-[${calculatedCollapsedHeight}px]`}>
            <div
              style={{ display: "flex", justifyContent: "center" }}
              className="h-[45px]"
            >
              <CardDescription className="w-[370px]">
                <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                  <div>{description}</div>
                </div>
              </CardDescription>
            </div>
            <CardContent className={"h-[110}px]"}>
              <Separator className="my-4" />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <div
                  className={`flex h-[${calculatedCollapsedHeight}]px items-center space-x-4 text-sm`}
                >
                  <div
                    className="w-[180px]"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      paddingLeft: "15px",
                      paddingTop: "5px",
                    }}
                  >
                    <div
                      className="h-5"
                      style={{
                        display: "flex",
                        justifyContent: "left",
                        marginBottom: "7px",
                      }}
                    >
                      {language && (
                        <Badge style={{ padding: "10px" }}>{language}</Badge>
                      )}
                    </div>
                    <div
                      className="h-15"
                      style={{
                        display: "flex",
                        justifyContent: "left",
                        marginTop: "5px",
                      }}
                    >
                      {displayedTopics ? (
                        displayedTopics.map((topic) => (
                          <Badge variant="outline" key={topic}>
                            {topic}
                          </Badge>
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                    <div
                      className="h-15"
                      style={{
                        display: "flex",
                        justifyContent: "left",
                        paddingLeft: "1px",
                        marginTop: "3px",
                      }}
                    >
                      {numAdditionalTopics ? (
                        <Badge
                          className="h-7 min-w-7 rounded-full px-1 font-mono tabular-nums"
                          variant="outline"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          +{numAdditionalTopics}
                        </Badge>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>

                  {separatorPresent && <Separator orientation="vertical" />}

                  <div
                    className="w-[180px]"
                    style={{
                      display: "flex",
                      justifyContent: `${separatorPresent ? "left" : "center"}`,
                      marginRight: `${separatorPresent ? "" : "30px"}`,
                    }}
                  >
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

export default AllPreviewRepoCards;
