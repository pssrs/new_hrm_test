type PagedList<T> = {
  items: T[]
  totalCount: number
}

type Employee = {
  id: number
  LastName: string
  FirstName: string
  Afm: string
}

type EmployeeCard = {
  id: number
  am: number
  lastName: string
  firstName: string
  fatherName: string
  motherName: string
  spouseName: string
  birthDate: string
  birthPlace: string
  address: string
  area: string
  city: string
  postCode: string
  sex: string
  familyStatus: string
  nationality: string
  citizenship: string
  ama: string
  phone: string
  identityCardNumber: string
  identityCardIssueDate: string
  amka: string
  email: string
  afm: string
  doy: string
  employmentState: string
  iban1: string
  iban2: string
}

type EmployeeService = {
  id: number
  am: number

  // Dates (DateOnly? → serialized as "yyyy-MM-dd" or null)
  hireDate: string | null
  publicationDate: string | null
  appointmentDate: string | null
  terminationDate: string | null
  mkDate: string | null
  rankDate: string | null

  // Selects (int)
  workRelation: number
  position: number
  employmentType: number

  // Salary
  mk: number
  salaryGrade: string
  salaryCode: string

  // Career
  category: string
  branch: string
  specialty: string
  rank: string
  fek: string

  // Organization
  directorate: number
  sector: number
  department: number
  office: number
  workDirectorate: number
  workSector: number
  workDepartment: number
  workOffice: number

  flag: number
}

type LoginDto = {
  email: string
  password: string
}

type User = {
  userName: string
  group: string | number
  fullName: string
  kk: number
  email: string
  token: string
}