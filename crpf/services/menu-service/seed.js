const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

const CATEGORIES = ['Meals', 'Snacks', 'Beverages', 'Desserts', 'Combos'];

const MOCK_MENU = [
  { name: 'Butter Chicken Thali', description: 'Creamy butter chicken with naan, dal, rice, and raita', price: 120, category: 'Meals', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgq6hH895-K-79yRymnR7GIcqlk7BAOVBxYlDSq0FLLAJDLbeJp0NqFPKd3QMD3DzMqFYnZzLe1GWpoWf10oZjXtRv4tbyHv38X7uLNj7huZUfCnuhIxVYy10j2jzmcxOhasUcooRHUD6qYY18qc5UyC0SMN_J4GN-VJGs_Cizihn6-Uv9-PzYuuKjG1TmMBqNjteqPSVMDBzcyja092Q4uSbiGKMse_WFeDpHVEDhDB5R9m8YSs0asg-UDjshYTyPiaKCCIzHl-kI', isVeg: false, rating: 4.8, prepTime: '15 min', isAvailable: true },
  { name: 'Paneer Tikka Roll', description: 'Spiced paneer wrapped in fresh roomali roti with mint chutney', price: 80, category: 'Snacks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL5FgqKgsabLEt4rFGuScMPRtpfHI9gaBv-9PxoWKkQ-VwcWAFLkzbe3Dh6_LFmaEnuSeEtyZjiicFLFMZ9NmFJann-8uwSgpLeAQMEqZ3HUOLJaLOP39Neg4eILecY3bfrKLOe_mOd9LLsG5MplF3wlNMURZGkYUFxGwoaIsEnoQcSwHPAN1XUMKuJAMppaRgcDD-7MYUAIfBOtlLETOwyX62TuV6Umpc-gYRaoT5ODl_LL-D9iWcJZIYQ5ZLqUWzTwxceNKXDETr', isVeg: true, rating: 4.5, prepTime: '10 min', isAvailable: true },
  { name: 'Masala Chai', description: 'Traditional spiced tea with fresh ginger and cardamom', price: 20, category: 'Beverages', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9NeQktI5vf_oj1yr1F1iVXjCr1hSs1TtmYBIqArnuvifcMiazI_7VIA1rwHGfUiryyiOv0F_YYjsayinmDE_PDTZnsBbObVhKQDkJZnd6alUHJso8SowlswDB70BhGt2FnlMB0vmgPFvVYLSvjDXuc5VwVH_kf_1_5WLr-ymt-8NkQJaxScGrENamSjrmnKFUpfyiiMdGm2r6mg5sZRNOThrDQsFUxCpXUxjqirLgjc5lyfIV3BTQ2dHYyIvbiA4jyxoW2tAbQsve', isVeg: true, rating: 4.9, prepTime: '5 min', isAvailable: true },
  { name: 'Chicken Biryani', description: 'Dum-style layered biryani with tender chicken and aromatic spices', price: 150, category: 'Meals', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgq6hH895-K-79yRymnR7GIcqlk7BAOVBxYlDSq0FLLAJDLbeJp0NqFPKd3QMD3DzMqFYnZzLe1GWpoWf10oZjXtRv4tbyHv38X7uLNj7huZUfCnuhIxVYy10j2jzmcxOhasUcooRHUD6qYY18qc5UyC0SMN_J4GN-VJGs_Cizihn6-Uv9-PzYuuKjG1TmMBqNjteqPSVMDBzcyja092Q4uSbiGKMse_WFeDpHVEDhDB5R9m8YSs0asg-UDjshYTyPiaKCCIzHl-kI', isVeg: false, rating: 4.7, prepTime: '20 min', isAvailable: true },
  { name: 'Gulab Jamun (4 pcs)', description: 'Soft milk-solid dumplings in warm rose-cardamom syrup', price: 60, category: 'Desserts', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL5FgqKgsabLEt4rFGuScMPRtpfHI9gaBv-9PxoWKkQ-VwcWAFLkzbe3Dh6_LFmaEnuSeEtyZjiicFLFMZ9NmFJann-8uwSgpLeAQMEqZ3HUOLJaLOP39Neg4eILecY3bfrKLOe_mOd9LLsG5MplF3wlNMURZGkYUFxGwoaIsEnoQcSwHPAN1XUMKuJAMppaRgcDD-7MYUAIfBOtlLETOwyX62TuV6Umpc-gYRaoT5ODl_LL-D9iWcJZIYQ5ZLqUWzTwxceNKXDETr', isVeg: true, rating: 4.6, prepTime: '5 min', isAvailable: true },
  { name: 'Thali Combo Special', description: 'Full thali with choice of veg/non-veg, dessert, and cold drink', price: 180, category: 'Combos', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9NeQktI5vf_oj1yr1F1iVXjCr1hSs1TtmYBIqArnuvifcMiazI_7VIA1rwHGfUiryyiOv0F_YYjsayinmDE_PDTZnsBbObVhKQDkJZnd6alUHJso8SowlswDB70BhGt2FnlMB0vmgPFvVYLSvjDXuc5VwVH_kf_1_5WLr-ymt-8NkQJaxScGrENamSjrmnKFUpfyiiMdGm2r6mg5sZRNOThrDQsFUxCpXUxjqirLgjc5lyfIV3BTQ2dHYyIvbiA4jyxoW2tAbQsve', isVeg: false, rating: 4.4, prepTime: '20 min', isAvailable: true },
  { name: 'Samosa (2 pcs)', description: 'Crispy fried pastry filled with spiced potato and peas', price: 30, category: 'Snacks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgq6hH895-K-79yRymnR7GIcqlk7BAOVBxYlDSq0FLLAJDLbeJp0NqFPKd3QMD3DzMqFYnZzLe1GWpoWf10oZjXtRv4tbyHv38X7uLNj7huZUfCnuhIxVYy10j2jzmcxOhasUcooRHUD6qYY18qc5UyC0SMN_J4GN-VJGs_Cizihn6-Uv9-PzYuuKjG1TmMBqNjteqPSVMDBzcyja092Q4uSbiGKMse_WFeDpHVEDhDB5R9m8YSs0asg-UDjshYTyPiaKCCIzHl-kI', isVeg: true, rating: 4.3, prepTime: '8 min', isAvailable: false },
  { name: 'Cold Coffee', description: 'Thick creamy cold coffee with vanilla ice cream', price: 50, category: 'Beverages', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL5FgqKgsabLEt4rFGuScMPRtpfHI9gaBv-9PxoWKkQ-VwcWAFLkzbe3Dh6_LFmaEnuSeEtyZjiicFLFMZ9NmFJann-8uwSgpLeAQMEqZ3HUOLJaLOP39Neg4eILecY3bfrKLOe_mOd9LLsG5MplF3wlNMURZGkYUFxGwoaIsEnoQcSwHPAN1XUMKuJAMppaRgcDD-7MYUAIfBOtlLETOwyX62TuV6Umpc-gYRaoT5ODl_LL-D9iWcJZIYQ5ZLqUWzTwxceNKXDETr', isVeg: true, rating: 4.5, prepTime: '5 min', isAvailable: true },
];

async function seed() {
  try {
    for (const catName of CATEGORIES) {
      await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [catName]);
    }
    
    for (const item of MOCK_MENU) {
      const catRes = await pool.query('SELECT id FROM categories WHERE name = $1', [item.category]);
      const catId = catRes.rows[0]?.id;
      
      const insertQuery = `
        INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_veg, rating, prep_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      await pool.query(insertQuery, [catId, item.name, item.description, item.price, item.image, item.isAvailable, item.isVeg, item.rating, item.prepTime]);
      console.log(`Seeded: ${item.name}`);
    }
    
    console.log('Seeding completed!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    pool.end();
  }
}

seed();
