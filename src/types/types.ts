

export const role = ["contributor", "maintainer"] as const
export type TRole = typeof role[number]

export type TUser = {
    name: string;
    email: string;
    password_hash: string;
    role?: TRole;
    created_at?: string;
    updated_at?: string;
}
export type TRUser = Omit<TUser, "created_at" | "updated_at">