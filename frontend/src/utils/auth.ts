import type { UsuarioType } from "./types"

// Requisito 5: manter conectado salvando o id do cliente (string UUID) no
// LocalStorage. Guardamos o id numa chave própria (literal ao requisito) e o
// restante dos dados + token em outra, para recuperar tudo no próximo acesso.
const CLIENTE_ID_KEY = "ninho_cliente_id"
const CLIENTE_KEY = "ninho_cliente"
const CLIENTE_TOKEN_KEY = "ninho_cliente_token"

const ADMIN_KEY = "ninho_admin"
const ADMIN_TOKEN_KEY = "ninho_admin_token"

export function salvarCliente(token: string, usuario: UsuarioType) {
    localStorage.setItem(CLIENTE_ID_KEY, usuario.id)
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(usuario))
    localStorage.setItem(CLIENTE_TOKEN_KEY, token)
}

export function obterClienteToken(): string | null {
    return localStorage.getItem(CLIENTE_TOKEN_KEY)
}

export function obterClienteId(): string | null {
    return localStorage.getItem(CLIENTE_ID_KEY)
}

export function obterCliente(): UsuarioType | null {
    const dados = localStorage.getItem(CLIENTE_KEY)
    return dados ? JSON.parse(dados) : null
}

export function limparCliente() {
    localStorage.removeItem(CLIENTE_ID_KEY)
    localStorage.removeItem(CLIENTE_KEY)
    localStorage.removeItem(CLIENTE_TOKEN_KEY)
}

export function salvarAdmin(token: string, admin: UsuarioType) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function obterAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function obterAdmin(): UsuarioType | null {
    const dados = localStorage.getItem(ADMIN_KEY)
    return dados ? JSON.parse(dados) : null
}

export function limparAdmin() {
    localStorage.removeItem(ADMIN_KEY)
    localStorage.removeItem(ADMIN_TOKEN_KEY)
}
