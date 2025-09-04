//  Returns user initials (can have only first letter of firstName/lastName or both)
export const getUserInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`
    .toUpperCase()
    .trim();
};
