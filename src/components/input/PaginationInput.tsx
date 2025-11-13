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
import { PaginationInputProps } from "@/models/frontend/InputModels";

const PaginationInput = ({
  setNumPageResults,
  setRepoDetails,
  setActiveResultsPage,
  activeResultsPage,
  numPageResults,
  username,
  patCode,
}: PaginationInputProps) => {
  const AllPaginationNumComponents = () => {
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
        const currentResultPageNum = i + 1;
        const shouldSetActive =
          activeResultsPage === currentResultPageNum ? true : false;

        paginationElements.push(
          <PaginationItem key={`pagination-item-${currentResultPageNum}`}>
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

    const currentPaginationRow = generatePaginationElements();

    return currentPaginationRow ? (
      currentPaginationRow.map((element) => element)
    ) : (
      <PaginationItem>
        <PaginationLink>1</PaginationLink>
      </PaginationItem>
    );
  };

  const PaginationElipsisComponent = () => {
    const isMinPageResults = numPageResults && numPageResults > 6;
    const onLastResultsPage = activeResultsPage === numPageResults;

    return (
      <PaginationItem>
        {isMinPageResults && !onLastResultsPage && <PaginationEllipsis />}
      </PaginationItem>
    );
  };

  const PaginationNavComponent = ({
    buttonType,
  }: {
    buttonType: "prev" | "next";
  }) => {
    const fetchPaginationButtonProps = (buttonType: "prev" | "next") => {
      let condition: boolean;
      let newPageNum: number;

      if (buttonType === "prev") {
        condition = activeResultsPage <= 1;
        newPageNum = activeResultsPage - 1;
      } else {
        condition = activeResultsPage >= numPageResults;
        newPageNum = activeResultsPage + 1;
      }

      return {
        "aria-disabled": condition,
        tabIndex: condition ? -1 : undefined,
        className: condition ? "pointer-events-none opacity-50" : undefined,
        onClick: () =>
          handleChangePageResults({
            ...handleChangePageResultsProps,
            currentResultPageNum: newPageNum,
          }),
      };
    };

    switch (buttonType) {
      case "prev":
        const prevButtonProps = fetchPaginationButtonProps("prev");
        return (
          <PaginationItem>
            <PaginationPrevious {...prevButtonProps} />
          </PaginationItem>
        );

      case "next":
        const nextButtonProps = fetchPaginationButtonProps("next");
        return (
          <PaginationItem>
            <PaginationNext {...nextButtonProps} />
          </PaginationItem>
        );
      default:
        return <></>;
    }
  };

  const handleChangePageResultsProps = {
    setNumPageResults,
    setRepoDetails,
    setActiveResultsPage,
    username,
    patCode,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Pagination className="w-[400px]">
        <PaginationContent
          key={`current-repos-row`}
          style={{ marginBottom: "10px" }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <PaginationNavComponent buttonType="prev" />
            <AllPaginationNumComponents />
            <PaginationElipsisComponent />
            <PaginationNavComponent buttonType="next" />
          </div>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationInput;
