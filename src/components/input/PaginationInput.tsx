import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { handleChangePageResults } from "@/utilities/repoDetailUtilities";
import { PaginationInputProps } from "@/models/InputModels";

const PaginationInput = ({
  setNumPageResults,
  setRepoDetails,
  setActiveResultsPage,
  activeResultsPage,
  numPageResults,
  username,
  patCode,
}: PaginationInputProps) => {
  const generatePaginationElements = () => {
    if (!numPageResults) return;

    let paginationElements = [];
    let maxPageNumToRender = numPageResults;
    let startNum = 0;

    // throttling the number of pagination elements to generate at any one time
    if (maxPageNumToRender > 6) {
      maxPageNumToRender = 6;
    }

    if (activeResultsPage >= 4 && numPageResults > 6) {
      startNum = activeResultsPage - 3;
      maxPageNumToRender = activeResultsPage + 3;

      if (numPageResults - 3 < activeResultsPage) {
        startNum = numPageResults - 5;
        maxPageNumToRender = numPageResults;
      }
    }

    for (let i = startNum; i < maxPageNumToRender; i++) {
      let currentResultPageNum = i + 1;
      const shouldSetActive =
        activeResultsPage === currentResultPageNum ? true : false;

      paginationElements.push(
        <PaginationItem>
          <PaginationLink
            onClick={() =>
              handleChangePageResults({
                ...handleChangePageResultsProps,
                currentResultPageNum,
              })
            }
            isActive={shouldSetActive}
          >
            {currentResultPageNum}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return paginationElements;
  };

  const handleChangePageResultsProps = {
    setNumPageResults,
    setRepoDetails,
    setActiveResultsPage,
    username,
    patCode,
  };

  const isMinPageResults = numPageResults && numPageResults > 6;
  const onLastResultsPage = activeResultsPage === numPageResults;
  const prevResultsPage = activeResultsPage - 1;
  const nextResultsPage = activeResultsPage + 1;
  const currentPaginationRow = generatePaginationElements();

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Pagination className="w-[400px]">
        {currentPaginationRow ? (
          <PaginationContent
            key={`current-repos-row`}
            style={{ marginBottom: "10px" }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={activeResultsPage === 1 ? true : false}
                  tabIndex={activeResultsPage <= 1 ? -1 : undefined}
                  className={
                    activeResultsPage <= 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={() =>
                    handleChangePageResults({
                      ...handleChangePageResultsProps,
                      currentResultPageNum: prevResultsPage,
                    })
                  }
                />
              </PaginationItem>

              {currentPaginationRow.map((element) => element)}

              <PaginationItem>
                {isMinPageResults && !onLastResultsPage && (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={
                    activeResultsPage >= numPageResults ? true : false
                  }
                  tabIndex={
                    activeResultsPage >= numPageResults ? -1 : undefined
                  }
                  className={
                    activeResultsPage >= numPageResults
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={() =>
                    handleChangePageResults({
                      ...handleChangePageResultsProps,
                      currentResultPageNum: nextResultsPage,
                    })
                  }
                />
              </PaginationItem>
            </div>
          </PaginationContent>
        ) : (
          <PaginationContent
            key={`current-repos-row`}
            style={{ marginBottom: "10px" }}
          >
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        )}
      </Pagination>
    </div>
  );
};

export default PaginationInput;
