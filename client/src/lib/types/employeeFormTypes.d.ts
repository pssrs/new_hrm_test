type EmployeePersonalFormData = {
    firstName: string | undefined
    lastName: string | undefined
    birthDate: string | undefined
    fatherName: string | undefined
    motherName: string | undefined
    maritalStatus: string | undefined
    address: string | undefined
    addressNumber: string | undefined
    postCode: string | undefined
    city: string | undefined
    phone: string | undefined
    email: string | undefined
    identity: string | undefined
    dateOfIssue: string | undefined
    citizenship: string | undefined
    nationality: string | undefined
    afm: string | undefined
    amka: string | undefined
    ama: string | undefined
    personalNumber: string | undefined
    doy: string | undefined
    iban1: string | undefined
    iban2: string | undefined
}

type EmployeeServiceFormData = {
    workRelation: string | undefined
    category: string | undefined
    speciality: string | undefined
    branch: string | undefined
    position: string | undefined
    employmentType: string | undefined
    dateOfHire: string | undefined
    fek: string | undefined
    salaryCode: string | undefined
    mk: string | undefined
    mkDate: string | undefined
    mkNextDate: string | undefined
    rank: string | undefined
    rankDate: string | undefined
    rankNextDate: string | undefined
    rankFek: string | undefined
    belongsAddress: number | undefined
    belongsSector: number | undefined
    belongsDepartment: number | undefined
    belongsOffice: number | undefined
    worksAddress: number | undefined
    worksSector: number | undefined
    worksDepartment: number | undefined
    worksOffice: number | undefined
}

type EmployeeExperienceFormData = {
    type: number
    dateFrom: string
    dateTo: string
    years: string
    months: string
    days: string
    carrier: string
    decisionId: string
    comments: string
    agonis: number
    mk: number | undefined
    grade: number | undefined
    sunt: number | undefined
    dateCouncil: string
    auto: string | undefined
}

type EmployeeChildrenFormData = {
    employeeId: number
    childSurname: string
    childName: string
    childFather: string
    childSex: number
    childBirth: string
    childDateFrom: string
    childDateTo: string
    childDisability: number
    childLevel: number
    childSchool: number
    childYears: string
    childMonths: string
    childFlag: number
    child18: number
}

type EmployeeStudiesFormData = {
    am: number
    type: number
    description: string
    education: number
    local: number
    category: number
    years: string
    date: string
    degree: string
    employee: number
    relevance: number
    comment: string
    dateRequired: string
    location: string
}