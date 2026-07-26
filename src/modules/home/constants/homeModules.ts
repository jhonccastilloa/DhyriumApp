import type { IconName } from '@/components/icons/iconRegistry';

export type HomeModule = {
  key: string;
  name: string;
  enabled: boolean;
  icon: IconName;
};

export type HomeModuleGroup = {
  title: string;
  modules: HomeModule[];
};

export const HOME_MODULE_GROUPS: HomeModuleGroup[] = [
  {
    title: 'Documentos',
    modules: [
      { key: 'contracts', name: 'Contratos', enabled: true, icon: 'fileText' },
      { key: 'procedures', name: 'Trámites', enabled: false, icon: 'clipboardText' },
      { key: 'payroll', name: 'Planillas', enabled: false, icon: 'money' },
    ],
  },
  {
    title: 'Trabajo',
    modules: [
      { key: 'projects', name: 'Proyectos', enabled: false, icon: 'hardHat' },
      { key: 'tasks', name: 'Mis tareas', enabled: false, icon: 'listChecks' },
      { key: 'measurements', name: 'Metrado de estructuras', enabled: false, icon: 'ruler' },
    ],
  },
  {
    title: 'Operación',
    modules: [
      { key: 'attendance', name: 'Control de asistencia', enabled: false, icon: 'calendarCheck' },
      { key: 'gate', name: 'Control de puerta', enabled: false, icon: 'door' },
      { key: 'rotations', name: 'Rotaciones', enabled: false, icon: 'identificationCard' },
    ],
  },
  {
    title: 'Organización',
    modules: [
      { key: 'offices', name: 'Oficinas y reuniones', enabled: false, icon: 'buildings' },
      { key: 'companies', name: 'Empresas', enabled: false, icon: 'receipt' },
      { key: 'users', name: 'Usuarios', enabled: false, icon: 'usersThree' },
    ],
  },
  {
    title: 'Recursos',
    modules: [
      { key: 'tutorials', name: 'Tutoriales', enabled: false, icon: 'video' },
      { key: 'meals', name: 'Comidas', enabled: false, icon: 'forkKnife' },
      { key: 'custom-invoice', name: 'Factura personalizada', enabled: false, icon: 'userGear' },
    ],
  },
];
