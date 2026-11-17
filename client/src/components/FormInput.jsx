const fieldClass =
  "w-full rounded bg-white p-1 text-black focus:outline-none focus:ring-2 focus:ring-cyan-400";

// Labelled form control. Renders an <input> by default, or a <select> /
// <textarea> when `as` is set. `options` is [{ value, label }] for selects.
export default function FormInput({
  label,
  as = "input",
  options = [],
  className = "",
  ...props
}) {
  let control;
  if (as === "select") {
    control = (
      <select className={fieldClass} {...props}>
        <option value="">-- Select --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === "textarea") {
    control = <textarea className={fieldClass} {...props} />;
  } else {
    control = <input className={fieldClass} {...props} />;
  }

  return (
    <label className={`block text-left text-lg text-white ${className}`}>
      {label}
      {props.required && <span className="text-cyan-200"> *</span>}
      {control}
    </label>
  );
}
