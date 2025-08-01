import { useState } from "react";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";

function displayScrollToTopButton() {
  const [scrollTopButtonStyle, setScrollTopButtonStyle] = useState({});

  useScrollPosition(
    ({ currPos }) => {
      const isVisible = currPos.y < -128;

      const shouldBeStyle = {
        visibility: isVisible ? "visible" : "hidden",
        opacity: isVisible ? 1 : 0,
        transition: `all 200ms ${isVisible ? "ease-in" : "ease-out"}`,
        transform: isVisible ? "none" : "translate(0, -25%)",
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
