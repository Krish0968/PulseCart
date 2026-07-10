export function getProductImage(product) {
  if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
  
  // 1. If the product has a valid custom/uploaded/seeded image URL
  const img = product.imageUrl || '';
  if (img && (img.startsWith('http') || img.startsWith('/assets') || img.startsWith('/uploads') || img.startsWith('blob:') || img.startsWith('data:'))) {
    return img;
  }
  
  // 2. Local fallback: derive the path based on category and slug
  const slug = product.slug || '';
  const category = (product.categoryName || (product.category && product.category.name) || '').toLowerCase();
  
  let categorySlug = 'electronics';
  if (category.includes('game')) categorySlug = 'gaming';
  else if (category.includes('appliance') || category.includes('kitchen')) categorySlug = 'home-appliances';
  else if (category.includes('fash') || category.includes('wear')) categorySlug = 'fashion';
  else if (category.includes('book')) categorySlug = 'books';
  else if (category.includes('sport') || category.includes('out')) categorySlug = 'sports-outdoors';
  else if (category.includes('beauty') || category.includes('care')) categorySlug = 'beauty-personal-care';
  else if (category.includes('toy')) categorySlug = 'toys-games';
  
  if (slug) {
    return `/assets/products/${categorySlug}/${slug}.svg`;
  }
  
  // 3. Final generic placeholder as last resort
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
}
