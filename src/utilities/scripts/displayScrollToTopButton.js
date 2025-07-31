import { useState } from "react";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";

function displayScrollToTopButton() {
  const [scrollTopButtonStyle, setScrollTopButtonStyle] = useState({
    transition: "all 200ms ease-in",
  });

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isVisible = currPos.y > prevPos.y;

      const shouldBeStyle = {
        visibility: isVisible ? "visible" : "hidden",
        transition: `all 200ms ${isVisible ? "ease-in" : "ease-out"}`,
        transform: isVisible ? "none" : "translate(0, -100%)",
      };

      if (
        JSON.stringify(shouldBeStyle) === JSON.stringify(scrollTopButtonStyle)
      )
        return;

      setScrollTopButtonStyle(shouldBeStyle);
    },
    [scrollTopButtonStyle]
  );

  return scrollTopButtonStyle;
}

export { displayScrollToTopButton };
