# Mi-peque-a-Calculadora
El ejercicio consiste en el desarrollo de una calculadora web a la que se deben agregar nuevas funcionalidades, como operaciones unitarias, binarias, y tratamiento de errores. Además, se debe incluir un manejo de operaciones en formato CSV (valores separados por comas) y un campo informativo que varíe en función del resultado de las operaciones.

# WEB-CALC fx-Carlos

Calculadora web con diseño inspirado en la Casio fx-82 pero personalizado y **modo CSV** para operar con listas de números. Implementada en **HTML5 + CSS3 + JavaScript**, con foco en validación, accesibilidad y atajos de teclado.

## Enlace al repositorio
https://github.com/carlosrdo/calculadora-web

## Funcionalidades implementadas
- **Campo informativo**: se actualiza tras cada operación indicando la operación realizada y el rango del resultado  
  (<100, 100–200, >200).
- **Operaciones unitarias**: cuadrado (x²), raíz cuadrada, cubo (x³), potencia **xʸ**, valor absoluto (|x|), “módulo” (|x|), log₁₀ y factorial (enteros 0–170).
- **Operaciones binarias**: suma, resta, multiplicación y división, con almacenamiento del primer operando y cálculo al pulsar **=**.
- **Modo CSV**: sumatorio, **media**, ordenar ascendente, revertir, quitar último y **quitar por índice**. Validación de listas vacías, incompletas o con valores no numéricos.
- **Tratamiento de errores**: validación de entradas (números enteros/decimales con signo y CSV). Mensajes claros en pantalla y en el modo CSV.
- **Accesibilidad y UX**: navegación por teclado y **atajos** (p. ej., Alt+C para cambiar modo, Alt+Q x², Alt+R √, Alt+3 x³, Alt+F !, Alt+M |x|…).  
  El teclado de la calculadora **no interfiere** al escribir en el textarea del modo CSV.
- **Interfaz**: layout responsive, botones con realce al pulsar y toggle entre Calculadora/CSV.

