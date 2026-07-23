import type { ContractTreeNode } from '../types/contracts.types';

export const findContractTreeNode = (
  nodes: ContractTreeNode[],
  code: string
): ContractTreeNode | undefined => {
  for (const node of nodes) {
    if (node.code === code) return node;
    const match = findContractTreeNode(node.children, code);
    if (match) return match;
  }
  return undefined;
};

export const flattenContractTree = (
  nodes: ContractTreeNode[]
): ContractTreeNode[] =>
  nodes.flatMap(node => [node, ...flattenContractTree(node.children)]);

export const filterContractTree = (
  nodes: ContractTreeNode[],
  search: string,
  status: 'ALL' | 'PENDING' | 'UPLOADED'
) => {
  const normalized = search.trim().toLocaleLowerCase('es');
  const matches = (node: ContractTreeNode) => {
    const statusMatches =
      status === 'ALL' ||
      (status === 'PENDING' && node.status === 'PENDIENTE') ||
      (status === 'UPLOADED' && node.status === 'SUBIDO');
    const textMatches =
      !normalized ||
      node.code.toLocaleLowerCase('es').includes(normalized) ||
      node.name.toLocaleLowerCase('es').includes(normalized);
    return statusMatches && textMatches;
  };

  return nodes.filter(node => {
    if (matches(node)) return true;
    return flattenContractTree(node.children).some(matches);
  });
};
