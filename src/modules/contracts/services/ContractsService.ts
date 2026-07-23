import api from '@/infrastructure/http/apiClient';
import type {
  ContractFilters,
  ContractListResponse,
  ContractScope,
  ContractSummary,
  ContractTreeNode,
} from '../types/contracts.types';

type ListInput = {
  search?: string;
  scope?: ContractScope;
  filters: ContractFilters;
  page?: number;
  limit?: number;
};

const buildListParams = (input: ListInput) => ({
  search: input.search || undefined,
  companyId: input.scope?.type === 'company' ? input.scope.id : undefined,
  consortiumId:
    input.scope?.type === 'consortium' ? input.scope.id : undefined,
  dueSoon: input.filters.dueSoon || undefined,
  pendingDocuments: input.filters.pendingDocuments || undefined,
  statuses:
    input.filters.statuses.length > 0
      ? input.filters.statuses.join(',')
      : undefined,
  period: input.filters.period,
  instrumentType: input.filters.instrumentType,
  page: input.page || 1,
  limit: input.limit || 50,
});

class ContractsService {
  static async getScopes(): Promise<ContractScope[]> {
    const response = await api.get<{ scopes: ContractScope[] }>(
      '/contract-documents/scopes',
      { headers: { noLoader: true } }
    );
    return response.data.scopes;
  }

  static async getContracts(input: ListInput): Promise<ContractListResponse> {
    const response = await api.get<ContractListResponse>(
      '/contract-documents/contracts',
      {
        params: buildListParams(input),
        headers: { noLoader: true },
      }
    );
    return response.data;
  }

  static async getCount(input: ListInput): Promise<number> {
    const response = await api.get<{ count: number }>(
      '/contract-documents/contracts/count',
      {
        params: buildListParams(input),
        headers: { noLoader: true },
      }
    );
    return response.data.count;
  }

  static async getContract(id: number): Promise<ContractSummary> {
    const response = await api.get<{ contract: ContractSummary }>(
      `/contract-documents/contracts/${id}`,
      { headers: { noLoader: true } }
    );
    return response.data.contract;
  }

  static async getTree(id: number): Promise<ContractTreeNode[]> {
    const response = await api.get<{
      contractId: number;
      tree: ContractTreeNode[];
    }>(`/contract-documents/contracts/${id}/tree`, {
      headers: { noLoader: true },
    });
    return response.data.tree;
  }

  static async attachArtifact(
    contractId: number,
    levelCode: string,
    artifactId: string
  ) {
    const response = await api.post<{
      status: 'SUBIDO';
      versionId: string;
      artifactId: string;
    }>(
      `/contract-documents/contracts/${contractId}/nodes/${encodeURIComponent(
        levelCode
      )}/attachments`,
      { artifactId },
      { headers: { noLoader: true } }
    );
    return response.data;
  }

  static async replaceArtifact(input: {
    contractId: number;
    levelCode: string;
    artifactId: string;
    expectedCurrentVersionId: string;
  }) {
    const response = await api.post<{
      status: 'SUBIDO';
      versionId: string;
      artifactId: string;
    }>(
      `/contract-documents/contracts/${
        input.contractId
      }/nodes/${encodeURIComponent(input.levelCode)}/replacements`,
      {
        artifactId: input.artifactId,
        expectedCurrentVersionId: input.expectedCurrentVersionId,
      },
      { headers: { noLoader: true } }
    );
    return response.data;
  }

  static async getEditSource(contractId: number, levelCode: string) {
    const response = await api.post<{
      source: {
        documentId: string;
        levelCode: string;
        levelName: string;
        currentVersionId: string;
        artifact: {
          id: string;
          name: string;
          pageCount: number;
          sizeBytes: number;
          downloadUrl: string;
          status?: string;
          type?: string;
          mimeType?: string;
          createdAt?: string;
          expiresAt?: string | null;
        };
      };
    }>(
      `/contract-documents/contracts/${contractId}/nodes/${encodeURIComponent(
        levelCode
      )}/edit-source`,
      undefined,
      { headers: { noLoader: true } }
    );
    return response.data.source;
  }

  static async removeCurrent(
    contractId: number,
    levelCode: string,
    currentVersionId?: string
  ) {
    await api.delete(
      `/contract-documents/contracts/${contractId}/nodes/${encodeURIComponent(
        levelCode
      )}/attachments/current`,
      {
        params: { currentVersionId },
        headers: { noLoader: true },
      }
    );
  }
}

export default ContractsService;
