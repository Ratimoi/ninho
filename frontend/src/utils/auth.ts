import type { UsuarioType } from "./types"

const apiUrl = import.meta.env.VITE_API_URL

// O token de sessão vive só num cookie httpOnly definido pelo backend —
// nunca passa por aqui, então um XSS não consegue lê-lo via JavaScript.
// O que fica no LocalStorage é só uma cópia não sensível dos dados do
// usuário/admin, usada pra UI (saudação, checagem de "está logado").
// Requisito 5: manter conectado — o id do cliente também fica salvo aqui.
const CLIENTE_KEY = "ninho_cliente"
const ADMIN_KEY = "ninho_admin"

export function salvarCliente(usuario: UsuarioType) {
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(usuario))
}

export function obterCliente(): UsuarioType | null {
    const dados = localStorage.getItem(CLIENTE_KEY)
    return dados ? JSON.parse(dados) : null
}

export function obterClienteId(): string | null {
    return obterCliente()?.id ?? null
}

export async function sairCliente() {
    await fetch(`${apiUrl}/usuario/logout`, { method: "POST", credentials: "include" })
    localStorage.removeItem(CLIENTE_KEY)
}

export function salvarAdmin(admin: UsuarioType) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function obterAdmin(): UsuarioType | null {
    const dados = localStorage.getItem(ADMIN_KEY)
    return dados ? JSON.parse(dados) : null
}

export async function sairAdmin() {
    await fetch(`${apiUrl}/admin/logout`, { method: "POST", credentials: "include" })
    localStorage.removeItem(ADMIN_KEY)
}
