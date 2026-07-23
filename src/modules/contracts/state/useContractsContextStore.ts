import { create } from 'zustand';
import type {
  ContractFilters,
  ContractScope,
} from '../types/contracts.types';

export const EMPTY_CONTRACT_FILTERS: ContractFilters = {
  dueSoon: false,
  pendingDocuments: false,
  statuses: [],
};

type ContractsContextState = {
  scope?: ContractScope;
  filters: ContractFilters;
  setScope: (scope: ContractScope) => void;
  setFilters: (filters: ContractFilters) => void;
  resetFilters: () => void;
};

export const useContractsContextStore = create<ContractsContextState>(set => ({
  filters: EMPTY_CONTRACT_FILTERS,
  setScope: scope =>
    set({
      scope,
      filters: EMPTY_CONTRACT_FILTERS,
    }),
  setFilters: filters => set({ filters }),
  resetFilters: () => set({ filters: EMPTY_CONTRACT_FILTERS }),
}));

export const countActiveContractFilters = (filters: ContractFilters) =>
  Number(filters.dueSoon) +
  Number(filters.pendingDocuments) +
  filters.statuses.length +
  Number(filters.period !== undefined) +
  Number(filters.instrumentType !== undefined);
