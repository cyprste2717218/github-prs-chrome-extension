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

    const rows = [];
    for (let i = 0; i < paginationElements.length; i += 10) {
      rows.push(paginationElements.slice(i, i + 10));
    }

    return rows;
  };

  const paginationRows = generatePaginationElements();

  return (
    <Pagination
      style={{ display: "flex", flexDirection: "column" }}
      className="w-[400px]"
    >
      {paginationRows ? (
        paginationRows.map((paginationRow, rowIndex) => (
          <PaginationContent
            key={`row-${rowIndex}`}
            style={{ marginBottom: "10px" }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              {paginationRow.map((element) => element)}
            </div>
          </PaginationContent>
        ))
      ) : (
        <></>
      )}
    </Pagination>
  );
};

export default PaginationInput;
