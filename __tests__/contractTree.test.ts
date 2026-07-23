import {
  filterContractTree,
  findContractTreeNode,
} from '@/modules/contracts/domain/contractTree';
import type { ContractTreeNode } from '@/modules/contracts/types/contracts.types';

const tree: ContractTreeNode[] = [
  {
    code: '3',
    name: 'Ejecución contractual',
    level: 1,
    acceptsPdf: false,
    status: 'PENDIENTE',
    documentId: null,
    currentVersionId: null,
    children: [
      {
        code: '3.4',
        name: 'Informes',
        level: 2,
        acceptsPdf: false,
        status: 'PENDIENTE',
        documentId: null,
        currentVersionId: null,
        children: [
          {
            code: '3.4.13',
            name: 'Informe final',
            level: 3,
            acceptsPdf: true,
            status: 'SUBIDO',
            documentId: 'document-id',
            currentVersionId: 'version-id',
            children: [],
          },
        ],
      },
    ],
  },
];

describe('jerarquía contractual móvil', () => {
  it('encuentra destinos de tercer nivel sin crear pantallas específicas', () => {
    expect(findContractTreeNode(tree, '3.4.13')?.name).toBe('Informe final');
  });

  it('mantiene el grupo raíz cuando un descendiente coincide', () => {
    expect(filterContractTree(tree, 'Informe final', 'UPLOADED')).toEqual(tree);
  });
});
