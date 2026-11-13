// Reusable Tailwind class strings. Mobile-first: unprefixed = mobile,
// `sm:` (640px+) and `md:` (768px+) = tablet/desktop.
// Keep every class as a complete string literal so Tailwind can detect it.

// ---------- Form ----------
export const form =
  "mx-auto flex w-full max-w-md flex-col gap-4 rounded-none bg-white p-4 " +
  "sm:gap-5 sm:rounded-2xl sm:p-8 sm:shadow-lg sm:ring-1 sm:ring-gray-200";

export const formWide =
  "mx-auto flex w-full max-w-md flex-col gap-4 bg-white p-4 " +
  "sm:gap-5 sm:p-8 md:max-w-2xl md:rounded-2xl md:shadow-lg md:ring-1 md:ring-gray-200";

// Two columns on desktop, one on mobile
export const formGrid = "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5";

export const formTitle =
  "text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl";

export const formSubtitle = "text-sm text-gray-500 sm:text-base";

export const formActions =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end";

export const formDivider = "border-t border-gray-200";

// ---------- Field pieces ----------
export const field = "flex flex-col gap-1 sm:gap-1.5";

export const label = "text-sm font-medium text-gray-700";

export const hint = "text-xs text-gray-500";

export const errorText = "text-xs text-red-600";

// text-base on mobile prevents iOS zoom-on-focus; taller for touch targets.
export const control =
  "block w-full rounded-lg border bg-white px-3 py-2.5 text-base text-gray-900 " +
  "placeholder:text-gray-400 transition focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 " +
  "sm:py-2 sm:text-sm";

export const controlOk =
  "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200";
export const controlBad =
  "border-red-400 focus:border-red-500 focus:ring-red-200";

export const input = `${control} ${controlOk}`;
export const inputError = `${control} ${controlBad}`;
export const textarea = `${input} min-h-28 resize-y`;
export const select = `${input} appearance-auto pr-8`;

// Pick the right input style: inputClass(!!error)
export const inputClass = (hasError = false) => (hasError ? inputError : input);

export const checkbox =
  "mt-0.5 h-5 w-5 rounded border-gray-300 text-indigo-600 " +
  "focus:ring-2 focus:ring-indigo-500 sm:h-4 sm:w-4";

export const checkboxLabel =
  "flex items-start gap-2 text-sm text-gray-700 sm:gap-2.5";

// ---------- Buttons ----------
// Full width on mobile, auto width on sm+.
export const btn =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 " +
  "text-base font-medium transition focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 " +
  "sm:w-auto sm:py-2.5 sm:text-sm";

export const btnPrimary =
  `${btn} bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 ` +
  "focus-visible:ring-indigo-500";

export const btnSecondary =
  `${btn} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ` +
  "active:bg-gray-100 focus-visible:ring-gray-400";

export const btnDanger =
  `${btn} bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ` +
  "focus-visible:ring-red-500";

export const btnGhost =
  `${btn} text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 ` +
  "focus-visible:ring-indigo-500";

// ---------- Links ----------
// Inline text link
export const link =
  "font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 " +
  "hover:underline focus:outline-none focus-visible:underline";

// Link styled as a button (use on <Link> / <a>)
export const linkButton = `${btnPrimary} no-underline`;
export const linkButtonSecondary = `${btnSecondary} no-underline`;

// Small centered helper text under a form: "No account? <Link>Register</Link>"
export const formFooter = "text-center text-sm text-gray-600 sm:text-base";

// ---------- Layout helper ----------
// Centers a form page; vertically centered on desktop, top-aligned on mobile.
export const formPage =
  "flex min-h-screen items-start justify-center bg-white px-0 py-6 " +
  "sm:items-center sm:bg-gray-50 sm:px-6 sm:py-10";
