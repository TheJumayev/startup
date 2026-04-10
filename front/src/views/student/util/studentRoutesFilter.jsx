export const getStudentRoutes = (routes, magistr, isGroupLeader) => {
  const online = true;

  return routes.filter((r) => {
    if (r.layout !== "/student") return false;

    // Bakalavr bo‘lsa magistrni yashiramiz
    if (magistr === "Bakalavr" && r.path === "magistr") {
      return false;
    }

    // Group leader emas bo‘lsa
    if (!isGroupLeader && r.path === "group-offline-davomat") return false;
    if (!isGroupLeader && r.path === "group/:groupId") return false;
    if (!isGroupLeader && r.path === "group/students") return false;

    if (r.hidden) return false;

    return !r.isOnline || online;
  });
};
