import { inputClass } from "../utils/classes";

export default function FormInput(
  label,
  inputType,
  name,
  val,
  func,
  require,
  options,
) {
  if (inputType === "select") {
    return (
      <label>
        {label}
        <select className={inputClass} name={name} value={val}>
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label>
      {label}
      <input
        className={inputClass}
        type={inputType}
        name={name}
        value={val}
        onChange={func}
        required={require}
      />
    </label>
  );
}
