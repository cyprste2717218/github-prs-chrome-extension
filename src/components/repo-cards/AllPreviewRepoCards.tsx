import {
	AllPreviewRepoCardsProps,
	PreviewRepoCardProps,
	RepoCardComponentDetails,
} from "@/models/RepoCardModels";
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

	async function handleClick() {
		const newCheckedState = !repoChecked;
		setRepoChecked(newCheckedState);
		handleToggleRepo({ name, newCheckedState, activeNumPRs, setActiveNumPRs });
	}

	const separatorPresent = language || (topics && topics.length > 0);

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
					<CollapsibleContent>
						<div style={{ display: "flex", justifyContent: "center" }}>
							<CardDescription className="w-[370px]">{description}</CardDescription>
						</div>
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
									{separatorPresent && <Separator orientation="vertical" />}

									<div
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
