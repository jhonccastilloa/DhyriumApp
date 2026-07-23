# Guía de arquitectura y convenciones

## Contexto del proyecto

Dhyrium es una aplicación móvil React Native CLI, escrita en TypeScript. La base actual usa React Native 0.86, React 19, React Navigation 7, Zustand, TanStack Query, Axios, MMKV, React Hook Form, Zod y React Native Unistyles.

- El punto de entrada es `index.js`. Debe cargar `src/styles/unistyles` antes de registrar `src/app/App`.
- La composición global vive en `src/app`. `App.tsx` instala, de fuera hacia dentro, Gesture Handler, React Query, Bottom Sheets, Keyboard Controller, Safe Area, navegación y `Toaster`. Conserva ese orden salvo que se entienda y pruebe la dependencia entre providers.
- El alias `@/` apunta a `src/` y está configurado tanto en TypeScript como en Babel. No agregues alias solo en una de las dos configuraciones.
- La app se distribuye en Android e iOS. Los cambios en `android/`, `ios/`, `app.json`, Metro, Babel, fuentes o dependencias nativas requieren validación en la plataforma afectada.

## Arquitectura y dirección de dependencias

El código se organiza por composición global, UI compartida y funcionalidades de negocio:

- `src/app`: `App`, providers, navegación raíz y estado realmente transversal.
- `src/components`: primitivas visuales y de formularios reutilizables, sin conocimiento de una entidad o feature.
- `src/modules/<feature>`: funcionalidad de negocio autocontenida. Las features actuales son `auth`, `home` y `profile`.
- `src/infrastructure`: adaptadores de HTTP, almacenamiento u otros servicios externos.
- `src/config`: lectura y validación de configuración de entorno.
- `src/styles`: configuración de Unistyles, tokens, paleta, colores semánticos y temas.
- `src/utils`: utilidades puras sin dominio.
- `src/types`: declaraciones globales, por ejemplo módulos de SVG o de variables nativas.
- `src/assets`: recursos estáticos.

Respeta esta dirección de dependencias:

- `app` puede componer módulos, componentes e infraestructura.
- Un módulo puede usar componentes, infraestructura, estilos, utilidades y sus propios archivos.
- Un componente compartido no puede importar una feature. Si conoce una entidad de negocio, debe vivir dentro de su módulo.
- Infraestructura no puede depender de pantallas o componentes. Mantén los efectos de UI y la lógica de transporte separados.
- Evita dependencias entre features. Extrae lo compartido al área que le corresponda.

`apiClient` es una excepción heredada: actualmente coordina loader, token y toast. No añadas más dependencias de UI o de features a ese cliente. Si se modifica de forma relevante, aprovecha para desacoplar esas responsabilidades mediante adaptadores o una capa de aplicación.

## Estructura de una feature

Una feature vive en `src/modules/<feature>` y solo crea las carpetas que necesita:

```text
src/modules/<feature>/
  components/     # UI propia de la feature
  screens/        # pantallas
  navigation/     # navegadores y ParamLists de la feature
  services/       # operaciones contra API u otros adaptadores
  state/          # Zustand u otro estado propiedad de la feature
  schemas/        # validación de formularios o inputs
  entities/       # modelo de dominio validado con Zod
  types/          # DTOs/contratos externos
  mappers/        # conversión de DTO a entidad
  constants/      # constantes de la feature
```

- Las pantallas orquestan hooks, navegación y componentes; no deben contener llamadas HTTP ni transformaciones extensas de DTOs.
- Los componentes de `modules/<feature>/components` pueden conocer el dominio de esa feature, pero deben recibir sus datos y callbacks por props cuando sea posible.
- Ubica una store según quién posee el estado, no según desde dónde se consume. Usa `app/state` solo para estado transversal.
- TanStack Query es la fuente de verdad para datos remotos cacheables. Usa Zustand para estado de sesión, UI o estado local compartido; no dupliques resultados de queries en una store sin una razón explícita.
- Las mutaciones y consultas nuevas deben vivir en la feature propietaria y usar claves de query estables, definidas cerca del servicio o hook que las consume.

## Datos, API y almacenamiento

El flujo esperado para datos de backend es:

```text
API DTO (types) -> service -> mapper -> entidad de dominio (entities) -> UI/state
```

- Los contratos de endpoint van en `modules/<feature>/types` como `camelCase.types.ts` y usan el sufijo `ApiResponse`. Tipar por completo lo conocido, incluidos `null`, arrays y objetos anidados. Usa `unknown`, nunca `any`, cuando falte un contrato.
- Cada entidad de dominio va en `entities/PascalCase.ts`, exporta `NombreSchema` y el tipo inferido `Nombre`.
- Los mappers se nombran `mapNombre.ts`, construyen el modelo explícitamente y lo validan con `NombreSchema.parse()`.
- Los servicios usan rutas relativas contra el `apiClient`, tipan la respuesta de Axios y retornan entidades mapeadas; no retornan `AxiosResponse` ni DTOs a pantallas.
- La base URL permanece centralizada en `src/infrastructure/http/apiClient.ts`; no la repitas en servicios ni componentes. Si se vuelve configurable, hazlo a través de `src/config/env.ts`.
- Una respuesta de autenticación puede contener token como dato de frontera, pero nunca debe exponer contraseña, hashes, tokens o credenciales a entidades, componentes, logs o mensajes de error. Reduce el DTO al contrato mínimo que la app necesita antes de persistirlo.
- `StorageAdapter` es el único punto de acceso a MMKV. Las claves de una feature se declaran en su carpeta `constants` y se guardan como constantes inmutables.
- Nunca imprimas secretos, tokens, DNI, contraseñas ni respuestas HTTP completas en consola.

## Configuración y secretos

- `.env` es local y está ignorado por Git. No lo agregues al repositorio ni lo incluyas en pruebas o capturas.
- `src/config/env.ts` valida las variables al iniciar. Mantén allí la lista central de variables requeridas; actualmente incluye `MMKV_ENCRYPTION_KEY` y `APP_ENV` (`DEV` o `PROD`).
- No uses valores secretos por defecto. Para documentar configuración, crea o actualiza un archivo de ejemplo sin valores reales, como `.env.example`.

## UI, tema y accesibilidad

- Usa Unistyles y los tokens de `src/styles/theme`. Prefiere colores semánticos (`theme.colors.*`), espaciado (`theme.spacing.*`), tipografía y radios del tema antes que valores literales.
- `AppText`, `AppFlex`, `AppButton`, `AppTextInput`, `AppIcon`, bottom sheets y `ScreenContainer` son las abstracciones compartidas preferidas. Extiéndelas antes de duplicar estilos o comportamiento de React Native.
- Usa el prefijo `App` para componentes visuales compartidos y `App[Especialidad]Input` para controles derivados de `AppTextInput`.
- Usa el prefijo `Form` únicamente para controles conectados a React Hook Form. Los `Form*Input` delegan en `FormField`; no dupliques la integración con `Controller` en cada pantalla.
- Los componentes estructurales terminan en `Container`. Los componentes de dominio se nombran por entidad y representación, sin prefijo `App`.
- El nombre de archivo, componente exportado y props deben coincidir: `AppButton.tsx`, `AppButton`, `AppButtonProps`.
- Para estilos estáticos usa `StyleSheet.create` de `react-native-unistyles`. Para valores dinámicos de tokens usa `useUnistyles`. No crees un segundo sistema de tema.
- Todo control presionable debe comunicar estado deshabilitado y un rol accesible cuando no lo proporcione la plataforma. Conserva los patrones de `AppButton` y `AppOptionItem`.
- Si una pantalla contiene inputs, considera `KeyboardAwareScrollView` y `keyboardShouldPersistTaps="handled"`, como en el flujo de autenticación.

## Formularios y validación

- Define el schema Zod de cada formulario en `modules/<feature>/schemas` y deriva el tipo con `z.infer`.
- Usa `useForm` con `zodResolver` en la pantalla o hook de la feature, y entrega el resultado a `FormContainer`.
- La validación de formato pertenece al schema; los componentes de input solo se ocupan de presentación y restricciones de entrada reutilizables.
- Muestra errores mediante los componentes `Form*`; no implementes una variante visual de error por cada formulario.
- Las operaciones asíncronas de envío deben reflejar carga, impedir doble envío y manejar el error sin ocultar información sensible.

## Navegación

- Los navegadores usan el sufijo `Navigator` y exportan `NombreNavigatorParamList`. Declara también `NombreNavigatorNavigationProp` solo si un consumidor requiere esa API concreta.
- La navegación raíz usa la API estática de React Navigation: `RootNavigator` exporta un `StaticParamList` y extiende `ReactNavigation.RootParamList`. Mantén ese patrón.
- `SignIn` y `SignOut` son nombres de rutas raíz de compatibilidad. Aunque su asociación con el estado parezca invertida, no los renombres ni alteres su mapeo sin una decisión de producto y una migración explícita.
- Para una ruta que contiene otro navegador usa `NavigatorScreenParams` y mantén sincronizados el ParamList, el `Screen` y cada `navigate`.
- Los navegadores propios de una feature deben residir en `modules/<feature>/navigation`; los navegadores que componen features pertenecen a `app/navigation`.
- No escribas tipos manuales para `useNavigation` salvo que necesites una API del navegador específica. Prefiere la inferencia del ParamList raíz.

## Nombres, imports y TypeScript

- Carpetas: `kebab-case` (las carpetas de inputs existentes son una excepción histórica; no propagues el patrón).
- Componentes, pantallas, providers y navegadores: `PascalCase.tsx`.
- Clases: `PascalCase.ts` y exportan una clase del mismo nombre.
- Funciones, hooks, schemas, constantes y utilidades: `camelCase.ts`; tipos de feature: `camelCase.types.ts`; declaraciones: `kebab-case.d.ts`.
- Hooks comienzan por `use`; stores Zustand siguen `useNombreStore`; constantes inmutables usan `UPPER_SNAKE_CASE`.
- Usa `@/` entre áreas distintas de `src` y rutas relativas para archivos próximos de la misma carpeta o feature.
- Usa `import type` cuando una importación solo se use como tipo. Mantén tipos de dominio en su feature y reserva `src/types` para lo global.
- Evita `any`, conversiones inseguras y supresiones de TypeScript. Si un dato externo no está definido, represéntalo como `unknown` y valídalo en el límite.

## Calidad, pruebas y cambios

- Antes de modificar, revisa el estado de Git y conserva cambios ajenos. No combines cambios de comportamiento con un refactor de nombres no relacionado.
- Tras cambiar TypeScript, componentes, estilos o imports ejecuta `npm run quality` (lint y typecheck) y corrige los problemas introducidos.
- Tras cambiar comportamiento, ejecuta `npm test`. Añade o actualiza pruebas cerca de la feature o en `__tests__` para flujos transversales.
- Prueba manualmente en Android o iOS cuando cambies navegación, teclado, bottom sheets, fuentes, assets, configuración nativa o dependencias de React Native.
- Para dependencias nativas, actualiza los artefactos requeridos por cada plataforma (incluido `bundle exec pod install` en iOS cuando corresponda) y no edites archivos generados sin necesidad.
- Mantén los commits enfocados y usa Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `test` o `chore`.
- Actualiza este documento cuando cambie una convención sostenida por el proyecto, el stack o el flujo de verificación.
