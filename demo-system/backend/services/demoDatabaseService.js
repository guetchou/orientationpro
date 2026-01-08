const { Pool } = require('pg');
const config = require('../../config.js');

class DemoDatabaseService {
  constructor() {
    this.pool = new Pool(config.database.connection);
    this.demoSchema = config.demo.schema;
    this.prodSchema = config.database.prod_schema;
  }

  /**
   * Crée le schéma DEMO
   */
  async createDemoSchema() {
    const client = await this.pool.connect();
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.demoSchema}`);
      console.log(`✅ Schéma ${this.demoSchema} créé`);
    } catch (error) {
      console.error(`❌ Erreur création schéma: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clone la structure de la production vers DEMO
   */
  async cloneProductionStructure() {
    const client = await this.pool.connect();
    try {
      // Récupérer toutes les tables de la production
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${this.prodSchema}' 
        AND table_type = 'BASE TABLE'
      `;
      
      const { rows: tables } = await client.query(tablesQuery);
      
      for (const table of tables) {
        const tableName = table.table_name;
        
        // Récupérer la structure de la table
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = '${this.prodSchema}' 
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `;
        
        const { rows: columns } = await client.query(structureQuery);
        
        // Créer la table dans le schéma DEMO
        const createTableQuery = this.buildCreateTableQuery(tableName, columns);
        await client.query(createTableQuery);
        
        console.log(`✅ Table ${tableName} clonée vers ${this.demoSchema}`);
      }
    } catch (error) {
      console.error(`❌ Erreur clonage structure: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Génère des données de démonstration
   */
  async generateDemoData() {
    const client = await this.pool.connect();
    try {
      // Données utilisateurs de démonstration
      const demoUsers = [
        {
          email: 'demo.user@example.com',
          password: '$2b$10$demo.hash',
          role: 'user',
          name: 'Utilisateur Démo',
          created_at: new Date()
        },
        {
          email: 'demo.admin@example.com',
          password: '$2b$10$demo.hash',
          role: 'admin',
          name: 'Admin Démo',
          created_at: new Date()
        },
        {
          email: 'demo.conseiller@example.com',
          password: '$2b$10$demo.hash',
          role: 'conseiller',
          name: 'Conseiller Démo',
          created_at: new Date()
        }
      ];

      // Insérer les utilisateurs de démonstration
      for (const user of demoUsers) {
        await client.query(`
          INSERT INTO ${this.demoSchema}.users (email, password, role, name, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
        `, [user.email, user.password, user.role, user.name, user.created_at]);
      }

      // Générer des données de tests
      await this.generateDemoTestData(client);
      
      // Générer des données de blog
      await this.generateDemoBlogData(client);
      
      console.log(`✅ Données de démonstration générées`);
    } catch (error) {
      console.error(`❌ Erreur génération données: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Génère des données de tests de démonstration
   */
  async generateDemoTestData(client) {
    const testTypes = ['riasec', 'emotional', 'learning', 'multiple', 'career-transition'];
    
    for (const testType of testTypes) {
      for (let i = 1; i <= 5; i++) {
        await client.query(`
          INSERT INTO ${this.demoSchema}.test_results (
            user_id, test_type, score, answers, created_at
          ) VALUES (
            (SELECT id FROM ${this.demoSchema}.users WHERE email = 'demo.user@example.com'),
            $1, $2, $3, $4
          )
        `, [
          testType,
          Math.floor(Math.random() * 100),
          JSON.stringify({ demo: true, answers: Array(20).fill().map(() => Math.floor(Math.random() * 5)) }),
          new Date()
        ]);
      }
    }
  }

  /**
   * Génère des données de blog de démonstration
   */
  async generateDemoBlogData(client) {
    const demoPosts = [
      {
        title: 'Guide de l\'orientation professionnelle en 2024',
        content: 'Contenu de démonstration pour le blog...',
        slug: 'guide-orientation-2024',
        author_id: 1,
        status: 'published'
      },
      {
        title: 'Les métiers du numérique au Congo',
        content: 'Contenu de démonstration pour le blog...',
        slug: 'metiers-numerique-congo',
        author_id: 1,
        status: 'published'
      }
    ];

    for (const post of demoPosts) {
      await client.query(`
        INSERT INTO ${this.demoSchema}.blog_posts (
          title, content, slug, author_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [post.title, post.content, post.slug, post.author_id, post.status, new Date()]);
    }
  }

  /**
   * Construit la requête de création de table
   */
  buildCreateTableQuery(tableName, columns) {
    const columnDefinitions = columns.map(col => {
      let definition = `${col.column_name} ${col.data_type}`;
      
      if (col.is_nullable === 'NO') {
        definition += ' NOT NULL';
      }
      
      if (col.column_default) {
        definition += ` DEFAULT ${col.column_default}`;
      }
      
      return definition;
    }).join(', ');
    
    return `CREATE TABLE IF NOT EXISTS ${this.demoSchema}.${tableName} (${columnDefinitions})`;
  }

  /**
   * Reset complet du schéma DEMO
   */
  async resetDemoSchema() {
    const client = await this.pool.connect();
    try {
      await client.query(`DROP SCHEMA IF EXISTS ${this.demoSchema} CASCADE`);
      await client.query(`CREATE SCHEMA ${this.demoSchema}`);
      console.log(`✅ Schéma ${this.demoSchema} reset`);
    } catch (error) {
      console.error(`❌ Erreur reset schéma: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Sauvegarde du schéma DEMO
   */
  async backupDemoSchema() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${__dirname}/../../database/backups/demo_backup_${timestamp}.sql`;
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync(`pg_dump -h ${config.database.connection.host} -U ${config.database.connection.user} -d ${config.database.connection.database} -n ${this.demoSchema} > ${backupPath}`);
      console.log(`✅ Sauvegarde DEMO créée: ${backupPath}`);
    } catch (error) {
      console.error(`❌ Erreur sauvegarde: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DemoDatabaseService();
