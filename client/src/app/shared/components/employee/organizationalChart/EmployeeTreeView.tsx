export default function EmployeeTreeView() {
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <img src={`${import.meta.env.BASE_URL}orgchart.png`} alt="Οργανόγραμμα" className="max-w-full max-h-[70vh] object-contain" />
        </div>
    )
}
