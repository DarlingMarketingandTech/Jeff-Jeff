const roleCapabilities = {
  internal: new Set([
    'schedule:read',
    'schedule:write',
    'message:read',
    'message:write',
    'settings:read',
  ]),
  client: new Set(['schedule:read', 'message:read']),
};

export function hasCapability(role, capability) {
  return roleCapabilities[role]?.has(capability) ?? false;
}

export function getRoleCapabilities(role) {
  return [...(roleCapabilities[role] ?? new Set())];
}
