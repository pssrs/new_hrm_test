type PagedList<T> = {
  items: T[]
  totalCount: number
}
type EmployeePersonal = {
  am: number
  birthDate: string
  familyStatus: number
  fatherName: string
  motherName: string
}

type EmployeeInfo = {
  am: number
  address: string
  postCode: string
  city: string
  phone: string
  email: string
}

type EmployeeIdentity = {
  am: number
  citizenship: string
  nationality: string
  identityCardNumber: string
  identityCardIssueDate: string
}

type EmployeeNumber = {
  am: number
  afm: string
  amka: string
  ama: string
  personalNumber: string
  doy: string
}

type EmployeeBank = {
  am: number
  iban1: string
  iban2: string
}

type EmployeeCard = {
  id: number
  am: number
  name: string
  lastName?: string
  firstName?: string
  fatherName?: string
  motherName?: string
  spouseName?: string
  birthDate?: string
  birthPlace?: string
  afm?: string
  address?: string
  area?: string
  city?: string
  postCode?: string
  sector?: string
  department?: string
  office?: string
  sex?: string
  familyStatus?: string
  nationality?: string
  citizenship?: string
  ama?: string
  phone?: string
  identityCardNumber?: string
  identityCardIssueDate?: string
  amka?: string
  email?: string
  doy?: string
  employmentState?: string
  iban1?: string
  iban2?: string
  specialty?: string
  isActive: number
  personalNumber?: string
  mk?: number
  category?: string
  mkDate?: string
  mkNextDate?: string
  terminationDate?: string
}

type EmployeeListDto = {
  id: number
  name: string
  afm: string
  am: number
  address: string
  sector: string
  department: string
  office: string
  isActive: number
  mk: number
  category: string
  mkDate: DateOnly
  mkNextDate: DateOnly
  branch: string
  specialty: string
  grade: string
  grDate: DateOnly
  grNextDate: DateOnly
}

type Employee = {
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
  personalNumber?: string
  leave: number
}

type employeePerAddress = {
  address: string
  count: number
}

type employeesMK = {
  mk: string
  count: number
}

type employeesChanges = {
  fullname: string
  changeType: string
  nextValue: string
  remainingDays: number
}

type EmployeesEndOfContract = {
  fullname: string
  date: string
}

type dashboardCalendar = {
  date: Date
  fullName: string
  event: string
  days: number
  childId?: number
  am?: number
  childFlag?: number
}

type EmployeePosition = {
  am: number
  workRelation: number
  category: string
  branch: string
  specialty: string
}

type EmployeePositionInfo = {
  am: number
  fek: string
  hireDate: string | null
  position: number
  employmentType: number
}

type EmployeeSalary = {
  am: number
  salaryCode: string
  mk: number
  mkDate: Date
  mkNextDate: Date
}

type EmployeeGrade = {
  am: number
  rank: string
  rankDate: Date
  rankNextDate: Date
  gradeFek: string
}

type EmployeeBelongs = {
  am: number
  directorate: number
  sector: number
  department: number
  office: number
}

type EmployeeWorks = {
  am: number
  workDirectorate: number
  workSector: number
  workDepartment: number
  workOffice: number
}

type EmployeeService = {
  id: number
  am: number

  // Dates (DateOnly? → serialized as "yyyy-MM-dd" or null)
  hireDate: Date | null
  publicationDate: Date
  appointmentDate: Date
  terminationDate: Date
  mkDate: Date
  mkNextDate: Date
  rankDate: Date
  rankNextDate: Date

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
  gradeFek: string

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

type Experience = {
  id: number
  am: number
  type: number
  dateFrom: Date
  dateTo: Date
  years: string
  months: string
  days: string
  carrier: string
  decisionId: string
  comments: string
  agonis: number
  mk: number
  grade: number
  sunt: number
  dateCouncil: string
  auto: string
}

type Penalty = {
  id: number
  am: number
  type: number
  lexical: number | null
  description: string | null
  decision: string | null
  dateFrom: string | Date
  dateTo: string | Date
  amount: string | null
  flag: number
}

type Move = {
  id: number
  am: number
  type: number
  destination: number
  foreas: number
  dateFrom: string | Date
  dateTo: string | Date
  decision: string
  dateDecision: string | Date
  comment: string
}

type Children = {
  id: number
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
  childSchoolDesc: string
}

type Studies = {
  id: number
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

type UserList = {
  id: number
  am: number
  userName: string
  fullName: string
  email: string
  name: string
}

type UserDto = {
  id: string
  userName: string
  fullName: string
  email: string
  am: number
}

type Kladoi = {
  id: number
  code: string
  description: string
  orgThesiFek: int
  thesiPlus: int
  thesiDelete: int
  orgSunolo: int
  orgDesmev: int
  tropopoihsh: int
  kladoiVisible: int
}

type Leave = {
  id: number
  am: number
  type: number
  duration: number
  dateFrom: string | Date
  dateTo: string | Date
  year: number
  notes: string
  request: string
  approval: string
  state: number
}

type OverallLeaves = {
  id: number
  am: number
  type: number
  duration: number
  year: number
  balance: number
  flag: number
  epik: number
  epikDays: number
  grossDays: number
}

type Change = {
  id: number
  am: number
  type: number
  previousState: number
  nextState: number
  changeDate: string | Date
  nextDate: string | Date
  user: string
  notes: string
  anadromikaApo: string | Date
  anadromikaEws: string | Date
  days: string
  flag: number
  flagHRM: number
  protocol: string
  protocolDate: string | Date
}

type Placement = {
  id: number
  am: number
  type: number
  oldAddress: number
  oldSector: number
  oldDepartment: number
  oldTeam: number
  newAddress: number
  newSector: number
  newDepartment: number
  newTeam: number
  comment: string
  duration: string
  date: string | Date
  user: string
}

type Files = {
  id: number
  am: number
  type: number
  name: string
  location: string
}

type Position = {
  id: number
  description: string
  visible: int
}

type Eidikothtes = {
  id: number
  description: string
  code: string
  visible: number
}

type Address = {
  id: number
  address_str: string
}

type Sector = {
  id: int
  addressId: int
  sectorId: int
  sectorName: string
}

type Department = {
  id: int
  addressId: int
  sectorId: int
  departmentId: int
  departmentName: string
}

type Office = {
  id: int
  departmentId: int
  officeName: string
}

type Category = {
  id: int
  description: string
  code: string
}

type Grade = {
  id: int
  description: string
  code: int
}

type Doy = {
  id: int
  code: int
  description: string
}

type LeaveType = {
  id: number
  description: string
  code: string
  duration: number
  years: number
  yearFlag: number
  kK: string
  parathrhsh: string
  flag: number
  wends: number
  argia: number
  aneuApodoxwn: number
  pentaetia: number
  dus: number
}

type ChangeType = {
  id: number
  description: string
}

type ChangeTypeMap = {
  id: number
  type: number
  value: number
  description: string
}

type FileType = {
  id: number
  type: number
  description: string
}

type StudyTypes = {
  id: number
  description: string
}

type Argies = {
  id: number
  date: string
  description: string
}

type PositionNumberDTO = {
  id: number
  addressId: number
  sectorId: number
  departmentId: number
  officeId: number
  sum: number
  used: number
  unused: number
}

type EmployeeChangesDto = {
  fullName: string
  afm: string
  type: string
  prevValue: string
  nextValue: string
  changeDate: Date
  nextChangeDate: Date
  notes: string
  workRelation: number
  flag: number
  flagHRM: number
  changeId: number | null
}

type LeaveListDto = {
  id: number
  am: number
  afm: string
  employeeName: string
  type: number
  duration: number
  dateFrom: string | Date
  dateTo: string | Date
  totalLeaves?: number
  entitled?: number
  used?: number
  carriedOver?: number
}