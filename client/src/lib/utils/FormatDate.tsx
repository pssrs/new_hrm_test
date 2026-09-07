export const formatDate = (date: string | Date): string => {
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

export const formDate = (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const formattedDate =
        typeof date === "string"
            ? date.split("T")[0]
            : date.toISOString().split("T")[0];
    return formattedDate === "1900-01-01" ? "" : formattedDate;
};