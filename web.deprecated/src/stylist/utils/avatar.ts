const AVATAR_COLORS = ["#c4917b", "#9e6b56", "#c9a96e", "#7bb08a", "#8b7ec8", "#c97070", "#5b9ec4"];

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2);
}
