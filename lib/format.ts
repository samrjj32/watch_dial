const formatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats rupees the way the source store did: "Rs. 14,100.00" */
export function money(rupees: number): string {
  return `Rs. ${formatter.format(rupees)}`;
}
