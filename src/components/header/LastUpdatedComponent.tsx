const LastUpdatedComponent = ({
  currentStep,
  lastUpdated,
}: {
  currentStep: number;
  lastUpdated: string;
}) => {
  return (
    currentStep === 4 && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "left",
        }}
      >
        <p
          className="stepTitle"
          style={{ fontSize: "12px", color: "grey", textAlign: "left" }}
        >
          Last Updated: {lastUpdated}
        </p>
      </div>
    )
  );
};

export default LastUpdatedComponent;
