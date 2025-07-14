import { RepoCardComponentDetails } from "@/models/RepoCardModels";
import { SetStateAction } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../ui/pagination";
import { handleChangePageResults } from "@/utilities/repoDetailUtilities";

// move ts inline definitions here elsewhere
const PaginationInput = ({
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

export default PaginationInput;
