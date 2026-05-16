# Guía de empresas y servicios recomendados en Mendoza

Página estática (HTML + CSS) que lista empresas y servicios locales agrupados
por rubro. Optimizada para SEO: HTML semántico, JSON-LD con `ItemList` +
`LocalBusiness`, OpenGraph/Twitter cards, anchor text con la palabra clave
de cada empresa.

## Archivos

| Archivo          | Rol                                                                 |
|------------------|---------------------------------------------------------------------|
| `companies.json` | Fuente de verdad: configuración del sitio y lista de empresas       |
| `build.js`       | Script Node (cero dependencias) que genera `index.html` desde JSON  |
| `styles.css`     | Estilos de la página                                                |
| `index.html`     | **Generado por `build.js`. No editar a mano.**                      |
| `sitemap.xml`    | **Generado por `build.js`.** Indexación para buscadores.            |
| `robots.txt`     | **Generado por `build.js`.** Permite crawl + apunta al sitemap.     |

## Agregar una empresa

1. Abrí `companies.json` y agregá un objeto nuevo dentro del array `companies`:

   ```json
   {
     "name": "Nombre de la Empresa",
     "url": "https://ejemplo.com.ar/",
     "type": "website",
     "rubro": "Turismo",
     "subrubro": "Excursiones de aventura",
     "keyword": "excursiones de aventura en Mendoza",
     "description": "Descripción de 1-2 oraciones con la keyword integrada de forma natural.",
     "featured": false
   }
   ```

2. Regenerá el HTML:

   ```bash
   node build.js
   ```

3. Listo. `index.html` se actualiza con la nueva empresa, los conteos, el
   JSON-LD y el nav.

### Campos

- `name` — nombre comercial. Aparece como `h3` y dentro del schema.
- `url` — URL completa del sitio. Si es Instagram, usar `https://www.instagram.com/usuario/`.
- `type` — `"website"` o `"instagram"`. Los `instagram` reciben `rel="nofollow"` para no diluir SEO propio.
- `rubro` — categoría. Si es nueva, agregala también a `rubros_order` para controlar dónde aparece en la página.
- `subrubro` — 2-4 palabras, se muestra como subtítulo de la card.
- `keyword` — **es el anchor text del link saliente**. Patrón: `"[servicio específico] en Mendoza"`. NO usar el nombre de la empresa.
- `description` — 1-2 oraciones, máx ~220 caracteres. Mencionar la keyword una vez de forma natural.
- `featured` — `true` para destacar la card con un badge dorado. La card se queda en su rubro (sin sección "Destacados" aparte).

## Antes de publicar

- [ ] Actualizar `site.url` en `companies.json` con el dominio real (hoy hay un placeholder `https://negociosmendoza.example/`).
- [ ] Revisar las empresas con descripciones inferidas: algunos sitios bloquearon el fetch automático (Visual Médica, Orbitrix, Laboratorio Paracelsus, Kinesia, Mística Natural, Clisa, Celidiet, Valero Comex).
- [ ] Verificar empresas con casa central fuera de Mendoza: Codeex (San Juan), Centro Vial (Córdoba), Tymaq (Misiones), Renault Mediterráneo (también Córdoba).
- [ ] Para deploy: cualquier hosting estático sirve (Vercel, Netlify, GitHub Pages, S3 + CloudFront). No requiere servidor.

## Validación

```bash
node build.js
```

Después, pegá la URL pública en https://validator.schema.org/ para validar
el JSON-LD y en https://search.google.com/test/rich-results para ver cómo
lo lee Google.
