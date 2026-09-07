export type EmployeeStepHandle = {
    validate: () => Promise<unknown>;
    // Επιστρέφει την τρέχουσα κατάσταση του βήματος χωρίς validation, ώστε να μη χάνονται
    // μερικώς συμπληρωμένα πεδία όταν γίνεται backward navigation
    getSnapshot: () => unknown;
};