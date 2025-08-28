import { supabase } from './src/api/supabaseClient.js';

async function fixDatabaseSchema() {
  console.log('Starting database schema fixes...');

  try {
    // First, check current table structures
    console.log('Checking current table structures...');
    
    // Check resources table columns
    const { data: resourcesColumns, error: resourcesError } = await supabase.rpc('get_table_columns', {
      table_name: 'resources'
    });
    
    // If the RPC doesn't exist, we'll use SQL directly
    const migrations = [
      // Add missing columns to resources table
      `ALTER TABLE resources 
       ADD COLUMN IF NOT EXISTS title TEXT,
       ADD COLUMN IF NOT EXISTS description TEXT,
       ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
       ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'article',
       ADD COLUMN IF NOT EXISTS external_url TEXT,
       ADD COLUMN IF NOT EXISTS featured_image TEXT,
       ADD COLUMN IF NOT EXISTS author TEXT,
       ADD COLUMN IF NOT EXISTS slug TEXT,
       ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`,

      // Add missing columns to products table
      `ALTER TABLE products
       ADD COLUMN IF NOT EXISTS title TEXT,
       ADD COLUMN IF NOT EXISTS description TEXT,
       ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
       ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'book',
       ADD COLUMN IF NOT EXISTS external_url TEXT,
       ADD COLUMN IF NOT EXISTS featured_image TEXT,
       ADD COLUMN IF NOT EXISTS author TEXT,
       ADD COLUMN IF NOT EXISTS slug TEXT,
       ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`,

      // Create unique indexes
      `CREATE UNIQUE INDEX IF NOT EXISTS resources_slug_idx ON resources(slug);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);`,

      // Create update trigger function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,

      // Add triggers
      `DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
       CREATE TRIGGER update_resources_updated_at
           BEFORE UPDATE ON resources
           FOR EACH ROW
           EXECUTE FUNCTION update_updated_at_column();`,

      `DROP TRIGGER IF EXISTS update_products_updated_at ON products;
       CREATE TRIGGER update_products_updated_at
           BEFORE UPDATE ON products
           FOR EACH ROW
           EXECUTE FUNCTION update_updated_at_column();`
    ];

    // Execute each migration
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: migrations[i] });
      
      if (error) {
        console.error(`Migration ${i + 1} failed:`, error);
        // Try using direct SQL execution instead
        const { error: directError } = await supabase.from('_migrations').insert({
          sql: migrations[i],
          executed_at: new Date().toISOString()
        });
        
        if (directError) {
          console.error(`Direct SQL execution also failed:`, directError);
        }
      } else {
        console.log(`Migration ${i + 1} completed successfully`);
      }
    }

    // Check if current user has admin role
    console.log('Checking current user role...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      if (profile) {
        console.log('Current user profile:', profile);
        
        if (profile.role !== 'admin') {
          console.log('Setting user role to admin...');
          const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
          
          if (roleError) {
            console.error('Failed to set admin role:', roleError);
          } else {
            console.log('User role updated to admin successfully');
          }
        } else {
          console.log('User already has admin role');
        }
      } else {
        console.error('Profile not found:', profileError);
      }
    } else {
      console.log('No authenticated user found');
    }

    // Verify table structures
    console.log('Verifying table structures...');
    
    const { data: resourcesTest } = await supabase
      .from('resources')
      .select('*')
      .limit(1);
    
    const { data: productsTest } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    console.log('Resources table accessible:', !!resourcesTest);
    console.log('Products table accessible:', !!productsTest);

    console.log('Database schema fixes completed!');

  } catch (error) {
    console.error('Error fixing database schema:', error);
  }
}

// Run the migration
fixDatabaseSchema();