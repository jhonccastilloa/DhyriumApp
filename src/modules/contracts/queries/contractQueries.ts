import { useQuery } from '@tanstack/react-query';
import ContractsService from '../services/ContractsService';
import type {
  ContractFilters,
  ContractScope,
} from '../types/contracts.types';

export const useContractScopesQuery = () =>
  useQuery({
    queryKey: ['contracts', 'scopes'],
    queryFn: ContractsService.getScopes,
    staleTime: 10 * 60 * 1000,
  });

export const useContractsQuery = (input: {
  search: string;
  scope?: ContractScope;
  filters: ContractFilters;
}) =>
  useQuery({
    queryKey: ['contracts', 'list', input],
    queryFn: () => ContractsService.getContracts(input),
    enabled: Boolean(input.scope),
  });

export const useContractCountQuery = (input: {
  search?: string;
  scope?: ContractScope;
  filters: ContractFilters;
}) =>
  useQuery({
    queryKey: ['contracts', 'count', input],
    queryFn: () => ContractsService.getCount(input),
    enabled: Boolean(input.scope),
    staleTime: 30_000,
  });

export const useContractQuery = (contractId: number) =>
  useQuery({
    queryKey: ['contracts', 'detail', contractId],
    queryFn: () => ContractsService.getContract(contractId),
  });

export const useContractTreeQuery = (contractId: number) =>
  useQuery({
    queryKey: ['contracts', 'tree', contractId],
    queryFn: () => ContractsService.getTree(contractId),
  });
