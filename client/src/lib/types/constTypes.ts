//------------------------------ STUDIES TYPES ------------------------------

export const STUDY_EDUCATION = [
    { value: "0", label: "-" },
    { value: "1", label: "ΠΕ" },
    { value: "2", label: "ΤΕ" },
    { value: "3", label: "ΔΕ" },
    { value: "4", label: "ΥΕ" },
];


export const PLACEMENT_TYPES = [
    { value: "0", label: "" },
    { value: "1", label: "Μονάδα/Τμήμα" },
    { value: "2", label: "Προϊσταμένου" },
    { value: "3", label: "Αν. Προϊσταμένου" },
];

export const FAMILY_STATUS = [
    { value: "1", label: "Έγγαμος/η" },
    { value: "2", label: "Άγαμος/η" },
    { value: "3", label: "Διαζευγμένος/η" },
    { value: "4", label: "Χήρος/α" },
];

export const EXPERIENCE_TYPES = [
    { value: "1", label: "Αναγνωρισμένη δημόσιο" },
    { value: "2", label: "Μη αναγνωρισμένη" },
    { value: "3", label: "Αναγνωρισμένη ιδιωτικό" },
    { value: "4", label: "Χρόνος υπηρεσίας δημοσίου" },
]

export const WORK_RELATION_OPTIONS = [
    { value: "1", label: "Μόνιμος υπάλληλος δημοσίου" },
    { value: "2", label: "ΙΔΑΧ" },
    { value: "3", label: "ΙΔΟΧ" },
    { value: "4", label: "ΟΑΕΔ" },
    { value: "5", label: "Έμμισθη εντολή" },
];

export const CATEGORY_OPTIONS = [
    { value: "pe", label: "ΠΕ" },
    { value: "pe6", label: "ΠΕ6" },
    { value: "ye0", label: "ΥΕ" },
    { value: "te", label: "ΤΕ" },
    { value: "de", label: "ΔΕ" },
];

export const EMPLOYEMENT_TYPE_OPTIONS = [
    { value: "1", label: "Οργανική" },
    { value: "2", label: "Προσωποπαγής" },
    { value: "3", label: "Σε απόσπαση" },
];

export const CHILD_LEVEL = [
    { value: "0", label: "-" },
    { value: "1", label: "ΠΕ" },
    { value: "2", label: "ΤΕ" },
    { value: "3", label: "ΔΕ" },
    { value: "4", label: "ΥΕ" },
];

export const FILTER_VIEWS = [
    { value: "org", label: "Οργανόγραμμα", fields: ["flag", "address", "sector", "department"] },
    { value: "specialty", label: "Ειδικότητες", fields: ["flag", "specialty"] },
    { value: "branch", label: "Κλάδοι", fields: ["flag", "branch"] },
    { value: "positions", label: "Πληρότητα θέσεων", fields: ["flag", "positions"] },
];


export const DAY_LABELS = ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"];

export const MONTH_NAMES = [
    "Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
    "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου",
];

export const MONTH_TITLES = [
    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
    "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];