# Carta digital · Kaldi's Coffee Bean y +KFE

Carta web que se abre con el QR de las mesas. Está en español, inglés y francés, y tiene:
- filtro de alérgenos;
- buscador;
- «Elige por mí»;
- tema claro y oscuro;
- fotos o dibujos de cada producto.

No necesita compilar nada: son archivos estáticos que GitHub Pages sirve tal cual.

## Qué hay en cada carpeta

```
index.html            esqueleto de la página (cabecera, barra de secciones, ventanas)
data/
  carta.json          SECCIONES Y PRODUCTOS: nombres, descripciones, precios, alérgenos, fotos
  locales.json        los dos locales (logo, rótulo, lema) e info opcional (horario, wifi…)
fotos/                fotos de producto: ID.webp (ficha) e ID-t.webp (miniatura)
img/                  logos de los locales
css/
  base.css            colores (claro/oscuro), tipografía, botones
  cabecera.css        rótulo gris con los dos locales y banderas
  carta.css           secciones, productos, precios, tipos de pan, pie
  hojas.css           ficha, alergias, buscador, «Elige por mí»
  responsive.css      ajustes para tablet y ordenador
js/
  main.js             arranque y clics
  state.js            carga de datos, idioma, textos, precios, filtro de alérgenos
  menu.js             pinta secciones y productos
  header.js           cabecera, banderas, tema
  dish.js             ficha del producto
  allergies.js        filtro de alérgenos
  search.js           buscador
  surprise.js         «Elige por mí»
  sheets.js           ventanas que suben desde abajo
  nav.js              barra de secciones
  art.js              dibujos de los productos sin foto
  allergens.js        los 14 alérgenos (colores, nombres, iconos)
  icons.js            iconos de la interfaz
  i18n/es.js en.js fr.js   textos de la interfaz en cada idioma
tools/foto.py         recorta y prepara una foto nueva
```

## Cambiar un precio, un nombre o una descripción

Todo está en `data/carta.json`. Desde GitHub: abre el archivo, pulsa el lápiz ✏️, busca el producto con Ctrl+F, cambia el valor y pulsa «Commit changes». En un minuto está en la web.

```json
{
  "id": "cafe",
  "seccion": "cafes",
  "nombre": { "es": "Café", "en": "Coffee", "fr": "Café" },
  "precios": [
    { "precio": 1.5, "etiqueta": { "es": "Normal", "en": "Regular", "fr": "Normal" } },
    { "precio": 1.6, "etiqueta": { "es": "Para llevar", "en": "Takeaway", "fr": "À emporter" } }
  ],
  "alergenos": null,
  "foto": "cafe",
  "caliente": true
}
```

- **Precio:** con punto decimal (`2.8`, no `2,80`). `null` significa «Según mercado».
- **Un solo precio sin etiqueta:** `"precios": [{ "precio": 2.2 }]`.
- **Descripción:** `"descripcion": { "es": "…", "en": "…", "fr": "…" }`. Si en español no hace falta pero en otros idiomas sí, deja `"es": ""`.
- **Agotado:** añade `"agotado": true` y sale en gris con el sello «Agotado» (y «Elige por mí» no lo propone).

Cuidado con el formato JSON: cada texto va entre comillas dobles y cada elemento lleva una coma detrás, salvo el último. Si la carta deja de cargar después de un cambio, casi siempre es una coma o unas comillas; se puede comprobar pegando el archivo en jsonlint.com.

## Añadir un producto

Copia un producto parecido y cámbialo:
- **`id`**: único, en minúsculas y sin espacios (`tostada-salmon`).
- **`seccion`**: el `id` de su sección (`cafes`, `chocolate`, `desayunos`, `especiales`, `bowls`, `dulces`, `helados`, `refrescos`, `copas`, `picar`, `montaditos`, `bocadillos`).
- **`grupo`** (opcional): subtítulo dentro de la sección. Los productos con el mismo grupo deben ir seguidos.

El orden en el archivo es el orden en la carta.

**Alérgenos:** `"alergenos"` es una lista con estos códigos:

| código | alérgeno | código | alérgeno |
|---|---|---|---|
| `gluten` | Gluten | `nuts` | Frutos de cáscara |
| `crustaceans` | Crustáceos | `celery` | Apio |
| `eggs` | Huevo | `mustard` | Mostaza |
| `fish` | Pescado | `sesame` | Sésamo |
| `peanuts` | Cacahuetes | `sulphites` | Sulfitos |
| `soy` | Soja | `lupin` | Altramuces |
| `milk` | Lácteos | `molluscs` | Moluscos |

`[]` significa «sin alérgenos declarados» y `null`, «sin información». Un producto sin información no se oculta al filtrar: sale con «Consultar alérgenos».

**Opciones** (sabores, variedades…): `"opciones": [{ "titulo": { "es": "Sabores", … }, "lista": { "es": ["Limón", "Maracuyá"], "en": [...], "fr": [...] } }]`.

**Dibujo:** si un producto no tiene foto, se usa su `"dibujo"`. Lo más fácil es copiar el de un producto parecido.

## Fotos

1. Prepara la foto con la herramienta, que la recorta, ajusta el color y la nitidez, y guarda las dos versiones en `fotos/`. Necesita Python y `pip install pillow`:
   ```
   python3 tools/foto.py original.jpg tostada-salmon  x0 y0 x1 y1  [tx0 ty0 tx1 ty1]
   ```
   El primer recorte es para la ficha y el segundo, opcional, más cerrado, para la miniatura redonda. Las coordenadas van en píxeles de la foto original.
2. En el producto de `data/carta.json` pon `"foto": "tostada-salmon"`.
3. Sube los dos archivos (`fotos/tostada-salmon.webp` y `fotos/tostada-salmon-t.webp`).

Si cambias una foto por otra con el mismo nombre, GitHub puede tardar hasta 10 minutos en mostrar la nueva.

## Secciones, locales y tipos de pan

- **Secciones:** van en `data/carta.json → secciones`, en el orden en que salen. Cada una tiene:
  - `nombre`;
  - `corto` (opcional): el nombre en la barra;
  - `intro` (opcional);
  - `formato`: sin formato es una lista; también puede ser `"carrusel"` (la pizarra de especiales), `"cuadricula"` (los bowls) o `"compacta"` (bebidas).
- **Tipos de pan:** en la sección `desayunos → panes`, los que no cobran suplemento, los que sí y el importe del suplemento (`media` y `entera`).
- **Locales:** van en `data/locales.json`. Ahí también se puede poner horario, dirección, teléfono, wifi (`{ "red": "…", "clave": "…" }`) y una nota. Lo que esté a `null` no sale.

## Idiomas

Los textos de botones y avisos están en `js/i18n/es.js`, `en.js` y `fr.js`. Para añadir un idioma:
1. Copia `es.js` como `xx.js` y tradúcelo, incluida la bandera (`flag`).
2. Impórtalo en `js/i18n/index.js`.
3. Añade `"xx": "…"` a los textos de `data/carta.json` y `data/locales.json`. Lo que no esté traducido sale en español.

## Probarla en el ordenador

Con doble clic en `index.html` no carga: el navegador no deja leer los JSON desde un archivo. Hay que abrirla con un servidor:
```
python3 -m http.server 8000
```
y entrar en http://localhost:8000.
