function deniedExit(permission: Deno.PermissionName): void {
    console.log(`${permission} permission denied. Exiting.`);
    Deno.exit(1);
}

export async function requestPermission(permissions: Deno.PermissionName[]): Promise<void>;
export async function requestPermission(permission: Deno.PermissionName): Promise<void>;
export async function requestPermission(permission: Deno.PermissionName | Deno.PermissionName[]): Promise<void> {
    const permissions = Array.isArray(permission) ? permission : [permission];
    for (const permission of permissions) {
        const permissionQuery = await Deno.permissions.query({ name: permission });
        if (permissionQuery.state === "prompt") {
            const permissionRequest = await Deno.permissions.request({ name: permission });
            if (permissionRequest.state === "denied") {
                deniedExit(permission);
            }
        } else if (permissionQuery.state === "denied") {
            deniedExit(permission);
        }
    }
}