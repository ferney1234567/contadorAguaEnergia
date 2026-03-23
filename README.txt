------------------------------ -Frontend – Sistema de Contadores (Next.js)---------------------------


El frontend está desarrollado con Next.js y corresponde a la parte visual del sistema,
 es decir, la aplicación que los usuarios utilizan para registrar y consultar la información 
 del consumo de agua y energía eléctrica.
La plataforma permite gestionar los datos de los contadores de forma sencilla desde
computador o celular, facilitando el registro de lecturas y el análisis del consumo 
dentro de la organización.El sistema se conecta con el backend desarrollado en FastAPI, 
el cual se encarga de almacenar y procesar la información en la base de datos.


Funcionalidades principales del sistema

--------El sistema permite realizar las siguientes acciones:-------------

*Registrar lecturas de agua
-Los usuarios pueden ingresar manualmente las lecturas de los contadores de agua para
llevar un control del consumo en cada bodega o ubicación.

*Registrar lecturas de energía
-También es posible registrar las lecturas de los contadores de energía eléctrica para hacer 
seguimiento al consumo energético.

*Registrar lecturas desde el celular
-El sistema puede utilizarse desde dispositivos móviles, lo que permite registrar las lecturas
directamente desde el celular mientras se realizan las inspecciones en campo.

*Consultar datos históricos
-Los usuarios pueden revisar el historial de consumo registrado, lo que permite 
analizar el comportamiento del uso de agua y energía a lo largo del tiempo.

*Visualizar el dashboard
-El sistema incluye un dashboard que muestra de forma gráfica la información del consumo,
facilitando el análisis de los datos.

*Comparativo de consumo de agua y energía
*El sistema permite comparar el consumo entre diferentes sedes, bodegas o periodos de 
tiempo, lo que ayuda a identificar variaciones en el uso de los recursos.

*Exportar información en PDF y Excel
-Los datos registrados pueden exportarse en PDF o Excel, lo que permite generar reportes 
para análisis, control o seguimiento administrativo.


------------------------------ 🏗 Arquitectura del Frontend --------------------------------------------

CONTADOR_AGUA_ENERGIA/
│
├── public/
├── src/
│   ├── app/
│   │   ├── api/agua/route.js - energia/route.js - lecturas/route.js - metas/route.js  - comparativoAgua/route.js  -  comparativoEnergia/route.js 
│   │   ├── components/consumoAgua/consumoAgua.tsx  -consumoEnergia/consumoEnergia.tsx  -dashboard/dashboard.tsx  - lecturas/lecturas
│   │   ├── utils/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│
├── .env
├── package.json
├── next.config.ts
└── tsconfig.json


##-------------------------------- Descripcion de Carpetas y Archivos---------------------------------------------------

------------------------------- 📁Carpeta .next -------------------------------------------------

Esta carpeta es generada automáticamente por Next.js cuando se ejecuta o se construye la aplicación.
Contiene archivos internos que permiten que el sistema funcione correctamente en el navegador.
No es necesario modificar esta carpeta manualmente.

--------------------------------- 📁.vscode --------------------------------------------------------

Esta carpeta contiene configuraciones del editor Visual Studio Code, como preferencias del proyecto
o extensiones recomendadas para el desarrollo.

---------------------------------📁 node_modules------------------------------------------------------

Esta carpeta almacena todas las librerías y dependencias que utiliza el proyecto.
Estas dependencias se instalan automáticamente mediante npm o yarn y permiten que el sistema 
funcione correctamente.

--------------------------------📁 public/img -----------------------------------------------------

Esta carpeta almacena imágenes utilizadas en la interfaz del sistema, como logotipos o elementos
visuales que aparecen en la aplicación.
Por ejemplo, en este proyecto se incluyen imágenes del logo de la empresa Envia, 
que se muestran en el encabezado o en diferentes secciones del sistema.


------------ ------------------📁Carpeta src / app/---------------------------------------------------------------------------

La carpeta src/app contiene la estructura principal del frontend de la aplicación.
Aquí se organizan los diferentes archivos y módulos que conforman la interfaz del sistema, como:

Las páginas principales del sistema.
Los componentes visuales.
Las rutas de comunicación con el backend.
Los estilos globales.

Esta carpeta es el núcleo del frontend, donde se define cómo funciona y se visualiza 
la aplicación de gestión de consumo de agua y energía.


------------ ------------------📄 layout.tsx ---------------------------------------------------------------------------

Este archivo define la estructura base de toda la aplicación en Next.js.
Aquí se configuran elementos globales como el idioma de la página, la fuente 
principal y los estilos generales.

Además, el layout envuelve todas las páginas del sistema, permitiendo mantener 
una estructura común en toda la aplicación y aplicar configuraciones compartidas 
como estilos y metadatos del sitio.

------------ ------------------📄 page.tsx ---------------------------------------------------------------------------

Este archivo corresponde a la página principal del sistema y es donde se controla la
 navegación entre los diferentes módulos de la aplicación.Aquí se carga la estructura 
 principal del sistema, incluyendo el menú lateral, el encabezado y el área de contenido, 
 desde donde el usuario puede acceder a las diferentes secciones como el dashboard, consumo de agua, 
 consumo de energía, comparativos y registro de lecturas.
Además, en este archivo se gestiona la navegación entre vistas, el modo noche, 
la adaptación a dispositivos móviles y la visualización dinámica de los componentes 
principales del sistema.


------------ ------------------📁 api/---------------------------------------------------------------------------

Esta carpeta contiene las rutas API internas del frontend de Next.js que permiten 
la comunicación entre la interfaz del usuario y el backend desarrollado con FastAPI.
Estas rutas funcionan como una capa intermedia  que recibe las 
peticiones del frontend, las envía al backend y retorna la respuesta al usuario.
Cada archivo se encarga de gestionar un módulo específico del sistema 
de contadores de agua y energía.

-------cada uno de los archivos permite Permite:

*Registrar nuevas lecturas de contadores.
*Consultar lecturas históricas.
*Actualizar lecturas si se requiere corrección de datos.
*Eliminar registros de lectura cuando sea necesario.



------------ ------------------📁Componentes/---------------------------------------------------------------------------

La carpeta components contiene los componentes principales de la interfaz del sistema.
Cada componente representa una sección o módulo de la aplicación que permite al usuario 
interactuar con la información de consumo de agua y energía.

Estos componentes organizan la interfaz y permiten mostrar los datos, registrar 
información y visualizar análisis del consumo.

----dashboard:

Este componente muestra el panel principal del sistema, donde se visualiza un resumen general
del consumo de agua y energía.

Aquí se presentan indicadores importantes como:
*Graficas de consumo de agua y energia
*Consumo total.
*Promedios.
*Resúmenes de consumo.
*Información general del sistema.

-------consumoAgua

Este componente permite gestionar la información del consumo de agua registrada en el sistema.

Aquí los usuarios pueden:
*Visualizar los datos de consumo.
*Analizar el comportamiento del consumo de agua.
*Consultar información por periodos de tiempo.
*Editar crear actualizar y eliminar los datos del consumo de agua

--------consumoEnergia

Este componente permite gestionar la información del consumo de energia registrada en el sistema.

Aquí los usuarios pueden:
*Visualizar los datos de consumo.
*Analizar el comportamiento del consumo de energia.
*Consultar información por periodos de tiempo.
*Editar crear actualizar y eliminar los datos del consumo de energia


---------lecturas

Este componente permite registrar manualmente las lecturas de los contadores de agua y energía.

Está diseñado para ser utilizado también desde dispositivos móviles, lo que permite que el 
personal encargado pueda ingresar las lecturas en tiempo real desde el celular mientras realiza 
las revisiones en campo.

--------comparativoAgua

Este componente permite realizar un análisis comparativo del consumo de agua entre diferentes 
sedes o puntos de servicio.

Esto facilita evaluar el comportamiento del consumo y comparar los resultados entre diferentes
 ubicaciones dentro de la organización.

------comparativoEnergia

Este componente permite comparar el consumo de energía eléctrica entre diferentes sedes o 
puntos de servicio de la regional.

Este análisis ayuda a identificar diferencias en el consumo energético y facilita el seguimiento 
del uso de energía en cada ubicación.

------------ ------------------📁utils/--------------------------------------------------------------------------------


La carpeta utils contiene funciones de apoyo que ayudan al funcionamiento del sistema.
Estas funciones se utilizan para realizar tareas específicas como generar reportes, 
exportar información o trabajar con fechas importantes.El objetivo de esta carpeta es 
organizar herramientas que pueden ser utilizadas en diferentes partes de la aplicación,
evitando repetir código y facilitando el mantenimiento del sistema.

Dentro de esta carpeta se incluyen funciones relacionadas principalmente con la 
generación de reportes y manejo de información del sistema de consumos.

*Exportación de datos a Excel: permite descargar reportes del consumo de agua, energía o del 
dashboard general del sistema.

*Generación de reportes: facilita la creación de archivos que pueden ser utilizados para 
análisis o seguimiento del consumo.

*Gestión de fechas especiales: incluye funciones para identificar los festivos oficiales 
de Colombia, lo cual puede ser útil para análisis o cálculos relacionados con el consumo.


------------ -----------------📄global.css ---------------------------------------------------------------------------


Este archivo contiene los estilos globales de toda la aplicación.
Aquí se definen configuraciones generales de diseño que se aplican a todas las
páginas del sistema.

--Entre sus funciones principales se encuentran:

* Integrar TailwindCSS para facilitar el diseño de la interfaz.
* Definir colores, variables de estilo y temas visuales del sistema.
* Configurar el modo claro y modo oscuro de la aplicación.
* Controlar el comportamiento del diseño en dispositivos móviles.
* Evitar desbordamientos horizontales y mejorar la visualización en pantalla.
* Definir estilos generales para elementos como formularios, scroll y sidebar.



------------ -----------------📄.env ---------------------------------------------------------------------------------


El archivo .env contiene las variables de configuración del sistema, las cuales permiten
 definir direcciones o parámetros que la aplicación necesita para funcionar correctamente.

En este caso, se define la dirección del backend del sistema, que es el servidor encargado 
de procesar y almacenar la información.

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
#NEXT_PUBLIC_API_URL=https://contador-backend-6eyq.onrender.com

NEXT_PUBLIC_API_URL: indica la dirección del servidor backend con el que se comunica el frontend.

La primera URL corresponde al servidor local utilizado durante el desarrollo.

La segunda URL corresponde al servidor en producción desplegado en Vercel, pero está 
comentada y se puede activar cuando se necesite.


------------ ---------------------------📄.gitignore---------------------------------------------

Este archivo indica qué archivos o carpetas no deben subirse al repositorio de Git.
Generalmente se excluyen archivos temporales, dependencias o configuraciones locales 
que no son necesarias compartir.

------------ ---------------------------📄components.json   -------------------------------------

Este archivo contiene la configuración de los componentes de la interfaz,
 permitiendo organizar y gestionar los componentes utilizados dentro del proyecto.

-----------------------------------------📄 eslint.config.mjs  ------------------------------------

Este archivo define las reglas de calidad del código que utiliza el proyecto.
ESLint ayuda a mantener un código más limpio, ordenado y con buenas prácticas de programación.

-----------------------------------------📄 next-env.d.ts ------------------------------------

Este archivo es generado automáticamente por Next.js y permite que TypeScript reconozca 
correctamente los tipos utilizados por el framework.

-----------------------------------------📄 next.config.ts  -----------------------------------

Este archivo contiene la configuración principal de Next.js, donde se pueden definir 
ajustes del funcionamiento del framework, optimizaciones o configuraciones del proyecto.


-----------------------------------------📄 package.json  -------------------------------------

Este archivo contiene la información principal del proyecto, incluyendo:

*Nombre del proyecto
*Dependencias utilizadas
*Scripts para ejecutar la aplicación
*Versiones de las librerías

Es uno de los archivos más importantes del proyecto.


------------------------------------------ 📄 package-lock.json ----------------------------------

Este archivo registra las versiones exactas de todas las dependencias instaladas, garantizando 
que el proyecto funcione igual en diferentes entornos.

------------------------------------------📄 postcss.config.mjs  -----------------------------------

Este archivo configura PostCSS, una herramienta que permite procesar y optimizar los estilos
CSS del proyecto.

En este sistema se utiliza junto con TailwindCSS para manejar los estilos de la aplicación.


---------------------------------------- 📄 README.txt  ---------------------------------------------

Este archivo contiene la documentacion general del proyecto, explicando su 
funcionamiento, estructura y cómo ejecutar la aplicación.

--------------------------------------------📄 tsconfig.json  ------------------------------------

Este archivo contiene la configuración de TypeScript del proyecto.

Aquí se definen opciones relacionadas con la compilación del código, rutas de archivos
y reglas para trabajar con TypeScript dentro de la aplicación.