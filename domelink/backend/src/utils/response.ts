export const sanitizeUser = (user: { _id: unknown; name: string; email: string; role: string; avatar?: string }) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});
