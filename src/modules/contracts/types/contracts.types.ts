export type ContractScope = {
  type: 'company' | 'consortium';
  id: number;
  name: string;
  contractCount: number;
};

export type ContractStatus =
  | 'EN_CURSO'
  | 'VENCE_PRONTO'
  | 'VENCIDO'
  | 'FINALIZADO'
  | 'AL_DIA';

export type ContractSummary = {
  id: number;
  cui: string;
  name: string;
  contractNumber: string;
  projectName: string;
  projectShortName: string | null;
  entity: string;
  type: 'CONTRATO' | 'ORDEN_DE_SERVICIO' | 'CONTRATACION_DIRECTA';
  signedAt: string | null;
  status: ContractStatus;
  relevantDate: string | null;
  company: { id: number; name: string } | null;
  consortium: { id: number; name: string } | null;
  documentProgress: {
    required: number;
    uploaded: number;
    percentage: number;
  };
};

export type ContractTreeNode = {
  code: string;
  name: string;
  level: number;
  acceptsPdf: boolean;
  status: 'PENDIENTE' | 'SUBIDO';
  documentId: string | null;
  currentVersionId: string | null;
  children: ContractTreeNode[];
};

export type ContractFilters = {
  dueSoon: boolean;
  pendingDocuments: boolean;
  statuses: ContractStatus[];
  period?: number;
  instrumentType?:
    | 'CONTRATO'
    | 'ORDEN_DE_SERVICIO'
    | 'CONTRATACION_DIRECTA';
};

export type ContractListResponse = {
  data: ContractSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
