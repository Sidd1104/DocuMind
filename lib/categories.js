export const CATEGORIES = [
  {
    key: "identity",
    label: "Identity & Government",
    subcategories: ["Aadhaar", "PAN", "Passport", "Driving License", "Voter ID", "Other"],
  },
  {
    key: "vehicle",
    label: "Vehicle",
    subcategories: ["RC", "Vehicle Insurance", "PUC", "Service Record", "Other"],
  },
  {
    key: "insurance",
    label: "Insurance",
    subcategories: ["Life Insurance", "Health Insurance", "Property Insurance", "Other"],
  },
  {
    key: "property",
    label: "Property & Legal",
    subcategories: ["Land Document", "Sale Deed", "Rent Agreement", "Lease Agreement", "Other"],
  },
  {
    key: "financial",
    label: "Financial",
    subcategories: ["Bank Document", "Tax Document", "Investment", "Loan", "Receipt", "Other"],
  },
  {
    key: "education",
    label: "Education",
    subcategories: ["Degree", "Marksheet", "Certificate", "Other"],
  },
  {
    key: "employment",
    label: "Employment",
    subcategories: ["Offer Letter", "Appointment Letter", "Salary Document", "Other"],
  },
  {
    key: "bills",
    label: "Bills & Utilities",
    subcategories: ["Electricity", "Internet", "Mobile", "Gas", "Other"],
  },
  {
    key: "medical",
    label: "Medical & Health",
    subcategories: ["Medical Report", "Prescription", "Other"],
  },
  {
    key: "warranty",
    label: "Warranty & Purchases",
    subcategories: ["Warranty", "Invoice", "Other"],
  },
  {
    key: "other",
    label: "Other / Custom",
    subcategories: ["Custom"],
  },
];

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}
