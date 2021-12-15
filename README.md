# Aplicación de Registro de Sucesos (happening-log)

Esta aplicación fue concebida en torno a la idea de poder registrar los momentos en los que ocurre algún Suceso de interés.

Se puede crear un Suceso especificando sus características que pueden ser de tipo texto, número, hora y fecha, u hora. Un ejemplo puede ser ```Ir a trotar``` con las características ```Inicio``` de tipo fecha y hora y ```Duración (minutos)``` de tipo número.

Los Registros representan las ocurrencias de un Suceso especificando valores para cada una de las características definidas. Un ejemplo puede ser un Registro del Suceso ```Ir a trotar``` con ```Inicio = 15 de Enero de 2022 6:30 p.m.``` y ```Duración (minutos) = 20```.

Además, se puede crear Etiquetas para asignar a uno o varios Sucesos y tener una forma de clasificarlos. Un ejemplo de puede ser la Etiqueta ```Ejercicio``` que puede asignarse al Suceso ```Ir a trotar```.

## Requerimientos

 - Node.js 12 o mayor
 - Yarn
 - Git
 - MongoDB

## Instalación

 - Clonar el repositorio vía una CLI a través del comando ```git clone https://github.com/jlr032032/happening-log.git```

 - Con una CLI posicionada en el directorio ```/client```, ejecutar el comando ```yarn install```

 - Con una CLI posicionada en el directorio ```/server```, ejecutar el comando ```yarn install```

 - Crear una base de datos en MongoDB para ser usada por la aplicación. Esta base de datos puede tener cualquier nombre, la aplicación sabrá conectarse mediante el string de conexión provisto en el archivo de configuración ```.env```

## Configuración

- Incorporar el archivo de configuración ```.env``` en el directorio ```/server```. El archivo ```/server/.env.example``` provee un ejemplo de este archivo, con las variables requeridas y valores que sirven de ejemplo para la configuración

## Ejecución

 - Con una CLI posicionada en el directorio ```/client```, ejecutar el comando ```yarn serve```

 - Con una CLI posicionada en el directorio ```/server```, ejecutar el comando ```yarn dev```
