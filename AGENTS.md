# Guía de arquitectura y convenciones

## Arquitectura

El proyecto usa una estructura por responsabilidades y funcionalidades.

- `src/app`: composición global de la aplicación. Contiene `App`, navegación raíz, providers y estado transversal.
- `src/components`: UI verdaderamente reutilizable y sin conocimiento de un dominio de negocio.
- `src/modules`: funcionalidades de negocio independientes, organizadas por feature, por ejemplo `auth`, `home`, `contacts` o `debts`.
- `src/infrastructure`: adaptadores a servicios externos, como HTTP y almacenamiento local.
- `src/config`: configuración de la aplicación y variables de entorno.
- `src/styles`: tema, tokens y configuración visual global.
- `src/utils`: funciones reutilizables que no pertenecen a un dominio concreto.
- `src/types`: declaraciones globales o tipos transversales que no pertenecen a una feature o componente.
- `src/assets`: recursos estáticos, como iconos, imágenes y fuentes.

### Reglas de dependencia

- `app` puede componer módulos, componentes e infraestructura.
- Un módulo puede usar `components`, `infrastructure`, `styles`, `utils` y sus propios archivos.
- Un componente compartido no debe depender de una feature de negocio. Si necesita conocer contactos, deudas u otra entidad, debe vivir en el módulo correspondiente.
- `infrastructure` no debe importar pantallas ni componentes. Mantén la lógica de red y almacenamiento independiente de la UI siempre que sea posible.
- Evita dependencias circulares. Si dos features comparten una pieza, extráela a `components`, `utils`, `types` o `infrastructure`, según corresponda.

## Nombres de carpetas y archivos

- Usa `kebab-case` para carpetas.
- Usa `PascalCase.tsx` para componentes React, pantallas, providers y navegadores.
- Usa `camelCase.ts` para lógica funcional, schemas, constantes, configuración y utilidades.
- Usa `camelCase.types.ts` para tipos y `kebab-case.d.ts` para declaraciones de módulos.
- Usa `PascalCase.ts` para archivos que exportan una clase con el mismo nombre, por ejemplo `AuthService.ts`.
- Los hooks usan el prefijo `use`, por ejemplo `useAuthStore` o `useFormContainerContext`.
- Las stores de Zustand usan el patrón `useNombreStore`.
- Usa `UPPER_SNAKE_CASE` para valores constantes inmutables, por ejemplo `AUTH_STORAGE_KEYS`.
- Conserva los nombres estándar exigidos por herramientas, como `__tests__`, `README.md`, `AGENTS.md`, `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `jest.config.js`, `app.json` e `index.js`.

## Componentes compartidos

- Usa el prefijo `App` para abstracciones visuales propias sobre React Native o librerías externas: `AppText`, `AppIcon`, `AppButton`, `AppTextInput`, `AppBottomSheetModal` y `AppSelectionSheet`.
- Usa `App[Especialidad]Input` para controles visuales derivados de `AppTextInput`, por ejemplo `AppAmountInput`, `AppDateInput` y `AppPercentageInput`.
- Usa el prefijo `Form` para componentes conectados a `react-hook-form`, por ejemplo `FormField`, `FormTextInput`, `FormButton` y `FormAmountInput`.
- Conserva el sufijo `Container` para componentes estructurales que envuelven layout o contexto, por ejemplo `ScreenContainer` y `FormContainer`.
- Los componentes específicos de dominio no usan `App`; nómbralos por entidad y representación, por ejemplo `DebtStatusBadge`.
- El nombre del archivo, componente exportado y tipo de props deben coincidir: `AppButton.tsx`, `AppButton`, `AppButtonProps`.
- Coloca los componentes según su responsabilidad: layout en `components/layout`, formularios en `components/form`, tipografía en `components/typography`, feedback en `components/feedback` e iconos en `components/icons`.
- No agregues lógica de negocio a componentes compartidos. Recibe datos y callbacks por props; deja las peticiones y reglas de dominio en módulos o servicios.

## Módulos y estado

- Una feature vive en `src/modules/<feature>` y puede incluir `screens`, `navigation`, `components`, `services`, `state`, `schemas`, `types` y `constants` según lo necesite.
- Ubica una store según quién posee el estado, no según desde dónde se consume.
- Usa `app/state` para estado transversal, por ejemplo loader, tema, conectividad o idioma.
- Usa `modules/<feature>/state` para estado de una feature, por ejemplo `modules/auth/state/useAuthStore.ts`.
- Mantén los servicios de una feature junto a ella. Un servicio que consume API y representa el dominio de autenticación pertenece a `modules/auth/services`.

## Navegación

- Usa el sufijo `Navigator` para navegadores, por ejemplo `RootNavigator`, `MainAppNavigator` y `AuthNavigator`.
- Usa el patrón `NombreNavigatorParamList` para tipos de rutas, por ejemplo `MainTabsNavigatorParamList`.
- Usa el patrón `NombreNavigatorNavigationProp` para tipos de navegación específicos cuando sean necesarios.
- Nombra las rutas por su destino, por ejemplo `Home`, `Settings`, `Auth` y `MainTabs`; evita sufijos estructurales como `Tab` o `Screen`.
- Mantén sincronizados el `ParamList`, cada `Screen` configurado y cada llamada a `navigate`.
- Usa `NavigatorScreenParams` al declarar una ruta que contiene otro navegador.
- `SignIn` y `SignOut` son rutas raíz existentes y se conservan como excepción de compatibilidad; no las renombres dentro de un refactor sin una decisión explícita.
- Evita anotar `useNavigation` manualmente salvo que necesites una API específica del navegador; prefiere los tipos inferidos por el navegador raíz cuando sea posible.

## Imports y tipos

- Usa el alias `@/` para imports entre áreas distintas de `src`.
- Usa imports relativos para archivos cercanos dentro de la misma carpeta o feature.
- Usa `import type` cuando la importación solo se utilice como tipo.
- Mantén los tipos de una feature dentro de `modules/<feature>/types`; coloca en `src/types` solo declaraciones o tipos realmente globales.
- Tras mover un archivo, actualiza imports, exports, aliases, tipos, pruebas y rutas afectadas.

## Cambios, pruebas y commits

- No mezcles cambios de comportamiento con un refactor de nombres.
- Ejecuta `npm run lint` después de modificar TypeScript o componentes y corrige los errores introducidos por el cambio.
- Ejecuta `npx tsc --noEmit` al modificar contratos, imports, navegación, tipos o estructura de carpetas.
- Ejecuta las pruebas disponibles cuando modifiques comportamiento. Añade pruebas junto a la funcionalidad o en `__tests__` cuando corresponda.
- Verifica manualmente Android o iOS cuando cambies fuentes, assets, configuración nativa o dependencias de React Native.
- Mantén los commits enfocados y funcionales. Usa prefijos Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `test` y `chore`.
- Actualiza este documento cuando adoptes una convención que deba mantenerse en cambios futuros.
