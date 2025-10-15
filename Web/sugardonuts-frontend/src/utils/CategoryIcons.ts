// /utils/categoryIcons
export const getCategoryIcon = (categoryName?: string): string => {
  if (!categoryName) return '🍩'; // Default

  const category = categoryName.toLowerCase();

  // Donas
  if (category.includes('donas') || category.includes('clasica')) return '🍩';
  
  // Bebidas
  if (category.includes('cafe')) return '☕';
  if (category.includes('gaseosa')) return '🥤';
  if (category.includes('te')) return '🍵';
  if (category.includes('batido')) return '🥛';
  if (category.includes('jugo')) return '🧃';

  
  // Otros
  if (category.includes('sandwiches')) return '🥪';
  if (category.includes('galleta')) return '🍪';
  if (category.includes('pastel')) return '🎂';
  if (category.includes('pan')) return '🥐';
  
  return '🍩';
};