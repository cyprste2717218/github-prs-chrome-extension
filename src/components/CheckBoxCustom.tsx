import { CheckBoxCustomProps } from "@/models/CheckBoxCustomModels";

const CheckBoxCustom = ({
  repoChecked,
  handleClick,
  name,
}: CheckBoxCustomProps) => {
  return (
    <div style={{ width: "50px" }}>
      <input
        type="checkbox"
        aria-checked={repoChecked}
        id={`check${name}`}
        onClick={handleClick}
        className="form-checkbox h-7 w-7 text-black transition duration-150 ease-in-out rounded border-gray-300 focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer"
      ></input>
      <label
        htmlFor={`check${name}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      ></label>
    </div>
  );
};

export default CheckBoxCustom;
