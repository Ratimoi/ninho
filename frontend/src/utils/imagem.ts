const apiUrl = import.meta.env.VITE_API_URL

// As imagens vêm do backend como caminho relativo ("/uploads/arquivo.jpg").
export function resolverUrlImagem(url: string) {
    return url.startsWith("http") ? url : `${apiUrl}${url}`
}
