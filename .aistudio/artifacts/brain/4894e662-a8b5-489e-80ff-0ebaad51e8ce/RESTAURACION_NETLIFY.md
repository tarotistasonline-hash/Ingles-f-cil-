# Guía de Restauración de tu Dominio .org en Netlify

## 1. ¿Por qué se puso en blanco la página en Netlify?
En aplicaciones creadas con **React + Vite**, cuando un visitante entra a la página principal o recarga el navegador, el servidor de Netlify busca una ruta de archivo. Al no encontrarla, muestra una pantalla completamente en blanco o un error 404 invisible.

Para solucionarlo de forma permanente, la web necesita:
1. Una regla de redirección (`/* /index.html 200`) en un archivo llamado `_redirects`.
2. O un archivo `netlify.toml` con las instrucciones de compilación.
**Ambos archivos ya fueron creados y están incluidos en tu proyecto.**

---

## 2. Mensaje exacto para copiar y pegar al Soporte de Netlify

Si estás chateando o respondiendo un ticket con el equipo de soporte de Netlify, simplemente cópiales este texto:

```text
Hello Netlify Support team,

My site went blank / 404 when loading client-side routes.
Here are the build and configuration details for my application:

- Framework: React (Vite SPA)
- Build Command: npm run build
- Publish Directory: dist
- Node Version: 18 or 20
- Redirect Rule: /* /index.html 200 (included in _redirects and netlify.toml)

Could you please make sure the publish directory is set to "dist" and that the SPA redirect rule (/* -> /index.html with 200 status) is active on my custom .org domain?

Thank you!
```

---

## 3. ¿Cómo subir la web a Netlify tú misma desde el celular o computadora?

Si prefieres activarlo tú misma sin esperar a soporte:

1. Ve a **[app.netlify.com](https://app.netlify.com/)** e inicia sesión con tu cuenta.
2. Toca tu sitio web donde está configurado el dominio `.org`.
3. Ve a **Site configuration** ➔ **Build & deploy**.
4. Verifica que los ajustes sean:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. En la pestaña **Deploys**, puedes subir la carpeta de producción `dist/` para que tu sitio quede en línea de inmediato.
