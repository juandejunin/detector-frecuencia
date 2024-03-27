### Función `window.onload`:

La función `window.onload` se ejecuta cuando la ventana ha terminado de cargar todos sus recursos, incluyendo HTML, CSS, imágenes y scripts. Esto asegura que el código dentro de la función se ejecute después de que todos los elementos de la página estén disponibles y listos para ser manipulados desde JavaScript.

#### Detalles de la Función:

1. **Creación de un Contexto de Audio:**
   - Utiliza la interfaz `AudioContext` de la Web Audio API para crear un contexto de audio. Este objeto proporciona una manera de representar y manipular audio en la web, permitiendo operaciones avanzadas como carga de archivos de audio y creación de nodos de procesamiento de audio.

2. **Definición del Tamaño Máximo para el Análisis de Frecuencia (`MAX_SIZE`):**
   - Calcula el tamaño máximo para el análisis de frecuencia, que se utiliza más adelante en el código. Este tamaño se calcula tomando el máximo entre 4 y la tasa de muestreo del contexto de audio dividida por 5000, lo que corresponde a una señal de 5kHz.

3. **Obtención de Referencias a Elementos del DOM:**
   - Utiliza `document.getElementById()` para obtener referencias a varios elementos del documento HTML, como "detector", "output", "pitch", "note", "detune", y "detune_amt". Estos elementos probablemente representan áreas en la página donde se mostrará información relacionada con el análisis de audio.


En resumen, esta función prepara el entorno necesario para realizar análisis de audio en la página web. Configura el contexto de audio, calcula parámetros importantes y obtiene referencias a elementos del DOM que se utilizarán para mostrar información relacionada con el análisis de audio.


## Función: `noteFromPitch(frequency)`

Esta función calcula el número de nota MIDI más cercano a partir de una frecuencia dada.

### Parámetro:
- `frequency`: La frecuencia para la cual se desea calcular la nota MIDI. Esta frecuencia representa la frecuencia fundamental de una nota musical.

### Descripción de la función:
1. **Cálculo del número de nota MIDI**:
   - Primero, la función calcula un número de nota aproximado utilizando la fórmula:  
     ```
     noteNum = 69 + 12 * (log2(frequency / 440))
     ```
     - `69`: Representa el número MIDI de la nota A4 (la octava central del piano).
     - `12`: Representa el número de semitonos en una octava.
     - `log2()`: Es la función logarítmica en base 2.

2. **Redondeo del número de nota**:
   - Luego, el número de nota calculado se redondea al número entero más cercano utilizando `Math.round()`.

3. **Cálculo de los centavos (cents)**:
   - A continuación, se calcula la diferencia en centavos entre la frecuencia dada y la frecuencia correspondiente al número de nota redondeado. Esto se hace mediante la fórmula:
     ```
     cents = 1200 * (




## Función: `frequencyFromNoteNumber(note)`

Esta función calcula la frecuencia de una nota musical a partir de su número de nota MIDI.

### Parámetro:
- `note`: El número de la nota MIDI para la cual se desea calcular la frecuencia. Este número está en el rango de 0 a 127, donde 69 representa la nota A4 (la octava central del piano) y cada número representa una nota específica en la escala musical.

### Explicación de la fórmula:
La fórmula utilizada en esta función está basada en la fórmula estándar utilizada en la teoría musical y la acústica para calcular la frecuencia de una nota musical a partir de su posición en la escala MIDI.

- **440 Hz**: Este es el estándar de referencia para la nota A4, que es la octava central del piano y es ampliamente utilizada como referencia en la música. La frecuencia de la nota A4 es de 440 Hz.

- `Math.pow(2, (note - 69) / 12)`: Esta parte de la fórmula calcula la relación de frecuencia entre la nota dada y la nota A4 (69). La diferencia entre el número de la nota dada y 69 (A4) nos da el número de semitonos de distancia entre las dos notas. Como hay 12 semitonos en una octava, dividimos esta diferencia por 12 para obtener el número de octavas completas de separación. Luego, elevamos 2 a esta potencia para obtener la relación de frecuencia en esa cantidad de octavas.

#### Desglose de la fórmula:
- `(note - 69)`: Calcula la distancia en semitonos entre la nota dada y la nota A4.
- `(note - 69) / 12`: Convierte la distancia de semitonos a distancia de octavas.
- `Math.pow(2, (note - 69) / 12)`: Calcula la relación de frecuencia basada en la distancia de octavas.
- `440 * Math.pow(2, (note - 69) / 12)`: Multiplica esta relación de frecuencia por 440 Hz (la frecuencia de A4) para obtener la frecuencia de la nota dada.

### Ejemplo:
Si `note` es 69 (que es la nota A4), la fórmula devuelve 440 Hz, que es la frecuencia estándar para la nota A4. Si `note` es mayor que 69, la frecuencia devuelta será mayor, y si `note` es menor que 69, la frecuencia devuelta será menor, lo que representa las notas más altas o más bajas en la escala musical, respectivamente.

En resumen, esta función proporciona una forma conveniente de calcular la frecuencia de una nota musical específica utilizando su número de nota MIDI correspondiente.
