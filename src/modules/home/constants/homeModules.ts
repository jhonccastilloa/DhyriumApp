import type { Icon } from 'phosphor-react-native';
import {
  BuildingsIcon,
  CalendarCheckIcon,
  ClipboardTextIcon,
  DoorIcon,
  FileTextIcon,
  ForkKnifeIcon,
  HardHatIcon,
  IdentificationCardIcon,
  ListChecksIcon,
  MoneyIcon,
  ReceiptIcon,
  RulerIcon,
  UsersThreeIcon,
  VideoIcon,
  UserGearIcon,
} from 'phosphor-react-native';

export type HomeModule = {
  key: string;
  name: string;
  enabled: boolean;
  icon: Icon;
};

export type HomeModuleGroup = {
  title: string;
  modules: HomeModule[];
};

export const HOME_MODULE_GROUPS: HomeModuleGroup[] = [
  {
    title: 'Documentos',
    modules: [
      { key: 'contracts', name: 'Contratos', enabled: true, icon: FileTextIcon },
      { key: 'procedures', name: 'Trámites', enabled: false, icon: ClipboardTextIcon },
      { key: 'payroll', name: 'Planillas', enabled: false, icon: MoneyIcon },
    ],
  },
  {
    title: 'Trabajo',
    modules: [
      { key: 'projects', name: 'Proyectos', enabled: false, icon: HardHatIcon },
      { key: 'tasks', name: 'Mis tareas', enabled: false, icon: ListChecksIcon },
      { key: 'measurements', name: 'Metrado de estructuras', enabled: false, icon: RulerIcon },
    ],
  },
  {
    title: 'Operación',
    modules: [
      { key: 'attendance', name: 'Control de asistencia', enabled: false, icon: CalendarCheckIcon },
      { key: 'gate', name: 'Control de puerta', enabled: false, icon: DoorIcon },
      { key: 'rotations', name: 'Rotaciones', enabled: false, icon: IdentificationCardIcon },
    ],
  },
  {
    title: 'Organización',
    modules: [
      { key: 'offices', name: 'Oficinas y reuniones', enabled: false, icon: BuildingsIcon },
      { key: 'companies', name: 'Empresas', enabled: false, icon: ReceiptIcon },
      { key: 'users', name: 'Usuarios', enabled: false, icon: UsersThreeIcon },
    ],
  },
  {
    title: 'Recursos',
    modules: [
      { key: 'tutorials', name: 'Tutoriales', enabled: false, icon: VideoIcon },
      { key: 'meals', name: 'Comidas', enabled: false, icon: ForkKnifeIcon },
      { key: 'custom-invoice', name: 'Factura personalizada', enabled: false, icon: UserGearIcon },
    ],
  },
];
