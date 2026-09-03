export const getCategoryStyles = (category) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("business")) return { colorScheme: "blue", icon: "💼" };
  if (cat.includes("science")) return { colorScheme: "purple", icon: "🔬" };
  if (cat.includes("history")) return { colorScheme: "amber", icon: "🏺" };
  if (cat.includes("fiction")) return { colorScheme: "pink", icon: "🎭" };
  if (cat.includes("technology") || cat.includes("computer"))
    return { colorScheme: "cyan", icon: "💻" };
  if (cat.includes("biography") || cat.includes("memoir"))
    return { colorScheme: "emerald", icon: "👤" };
  if (cat.includes("philosophy")) return { colorScheme: "indigo", icon: "🤔" };
  return { colorScheme: "slate", icon: "📚" };
};
