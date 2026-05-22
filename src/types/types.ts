

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

// ----issuse type ----

export const type = ["bug", "feature_request"] as const
export type TType = typeof type[number]

export const status = ["open", "in_progress", "resolved"] as const
export type TStatus = typeof status[number]

export type Tissues = {
    id?: number;
    title: string;
    description: string;
    type: TType;
    status?: TStatus;
    reporter_id?: number;
    created_at?: string;
    updated_at?: string;
}

export type TToken = string | undefined


