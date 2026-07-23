import { HOME_MODULE_GROUPS } from '@/modules/home/constants/homeModules';

describe('home module catalog', () => {
  it('shows all 15 modules grouped and enables only contracts', () => {
    const modules = HOME_MODULE_GROUPS.flatMap(group => group.modules);
    expect(modules).toHaveLength(15);
    expect(modules.filter(module => module.enabled).map(module => module.name)).toEqual([
      'Contratos',
    ]);
    expect(modules.filter(module => !module.enabled)).toHaveLength(14);
  });

  it('keeps the five requested business groups', () => {
    expect(HOME_MODULE_GROUPS.map(group => group.title)).toEqual([
      'Documentos',
      'Trabajo',
      'Operación',
      'Organización',
      'Recursos',
    ]);
  });
});
