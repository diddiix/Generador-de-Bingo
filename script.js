let uploadedImages = [];
let generatedCards = []; // Para almacenar los cartones generados

// Función para manejar la carga de imágenes
document.getElementById('imageInput').addEventListener('change', function(event) {
    const files = event.target.files;
    uploadedImages = []; // Reiniciar el array de imágenes cargadas

    // Crear un array de URLs temporales de las imágenes seleccionadas
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = URL.createObjectURL(file); // Crear una URL para cada imagen
        uploadedImages.push(imageUrl);
    }

    // Mostrar mensaje si se seleccionaron menos de 12 imágenes
    if (uploadedImages.length < 12) {
        alert("Por favor, selecciona al menos 12 imágenes.");
    }
});

// Función para generar un cartón de bingo aleatorio con las imágenes subidas
async function generateBingoCard() {
    if (uploadedImages.length < 12) {
        alert("Necesitas subir al menos 12 imágenes para generar el cartón.");
        return null;
    }

    const bingoContainer = document.getElementById('bingo-container');
    const bingoCard = document.getElementById('bingo-card');
    bingoCard.innerHTML = ''; // Limpiar el cartón previo

    // Mezclar las imágenes seleccionadas
    const shuffledImages = shuffleArray(uploadedImages);

    // Insertar las imágenes en el cartón (3x3)
    for (let i = 0; i < 9; i++) { // Asumiendo 9 celdas (3x3)
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        const img = document.createElement('img');
        img.src = shuffledImages[i];
        cell.appendChild(img);
        bingoCard.appendChild(cell);
    }

    // Guardar el contenedor completo como imagen en alta calidad
    return html2canvas(bingoContainer, { scale: 3 }).then(canvas => {
        return canvas.toDataURL('image/png', 1.0); // Devolver la imagen generada en alta calidad
    });
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para descargar todos los cartones generados en un PDF
async function downloadBingoCards() {
    const { jsPDF } = window.jspdf; // Acceso a la biblioteca jsPDF
    const pdf = new jsPDF('l', 'pt', 'a4'); // Crear un PDF en modo horizontal, tamaño A4

    const numCards = parseInt(document.getElementById('numCards').value);
    generatedCards = []; // Reiniciar los cartones generados

    // Generar y almacenar todos los cartones en el array `generatedCards`
    for (let i = 0; i < numCards; i++) {
        const imgData = await generateBingoCard(); // Generar un nuevo cartón para cada iteración
        if (imgData) {
            generatedCards.push(imgData); // Almacenar la imagen generada en el array
        } else {
            alert("No se pudo generar el cartón de bingo.");
            return;
        }
    }

    // Agregar las imágenes almacenadas en `generatedCards` al PDF
    for (let i = 0; i < generatedCards.length; i++) {
        const imgData = generatedCards[i];

        // Añadir cartones al PDF
        if (i % 2 === 0 && i > 0) {
            pdf.addPage(); // Nueva página después de cada 2 cartones
        }

        const x = (i % 2) * 400 + 20; // Posición X ajustada (aumenta el desplazamiento)
        const y = 20; // Establecer Y siempre en 20 para alinear las imágenes correctamente

        // Añadir la imagen al PDF con el mismo tamaño
        pdf.addImage(imgData, 'PNG', x, y, 380, 520, undefined, 'FAST');
    }

    pdf.save('cartones_bingo.pdf'); // Descargar el PDF
}
