export interface ProfileApiJob {
  value: string;
  label: string;
  abrv: string;
  amount: number;
}

export interface ProfileApiDetails {
  id: number;
  firstName: string;
  lastName: string;
  firstNameRef: string;
  lastNameRef: string;
  addressRef: string;
  dni: string;
  phone: string;
  phoneRef: string;
  updatedAt: string;
  degree: string;
  job: ProfileApiJob;
  description: string;
  department: string;
  province: string;
  district: string;
  room: string | null;
  gender: string;
  userPc: string | null;
  usuario: unknown | null;
  userId: number;
}

export interface ProfileApiOffice {
  officeId: number;
  office: {
    name: string;
    _count: {
      users: number;
    };
  };
}

export interface ProfileApiMenuItem {
  typeRol: string;
  idRelation: number;
  id: number;
  title: string;
  route: string;
}

export interface ProfileApiMenuPoint {
  id: number;
  route: string;
  title: string;
  typeRol: string;
  menu?: ProfileApiMenuItem[];
  noView?: boolean;
}

export interface ProfileApiRole {
  id: number;
  name: string;
  menuPoints: ProfileApiMenuPoint[];
}

export interface ProfileApiResponse {
  id: number;
  status: boolean;
  userType: string;
  isSystemUser: boolean;
  email: string;
  createdAt: string;
  updatedAt: string;
  contract: unknown[];
  cv: string;
  declaration: string;
  withdrawalDeclaration: string | null;
  ruc: string;
  address: string;
  roleId: number;
  profile: ProfileApiDetails;
  payrollInfo: unknown | null;
  offices: ProfileApiOffice[];
  isAccessReception: boolean;
  role: ProfileApiRole;
}
