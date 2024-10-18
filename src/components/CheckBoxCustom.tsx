import { CheckBoxCustomProps } from "@/models/CheckBoxCustomModels";

const CheckBoxCustom = ({
  repoChecked,
  handleClick,
  name,
}: CheckBoxCustomProps) => {
  return (
    <div>
      <input
        type="checkbox"
        aria-checked={repoChecked}
        id={`check${name}`}
        onClick={handleClick}
      ></input>
      <label
        htmlFor={`check${name}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      ></label>
    </div>
  );
};

export default CheckBoxCustom;
