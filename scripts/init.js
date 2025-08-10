#!/usr/bin/env node

/**
 * SACRED Project Initialization Script
 * Based on Product Design Document (PDR)
 * 
 * This script initializes the SACRED development environment
 * and sets up all necessary components for development.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SacredInitializer {
    constructor() {
        this.projectRoot = process.cwd();
        this.config = {
            projectName: 'SACRED',
            description: 'Sexual Intimacy Assessment for Christian Couples',
            version: '1.0.0',
            author: 'SACRED Team'
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async init() {
        this.log('🚀 Initializing SACRED Development Environment', 'info');
        
        try {
            await this.checkPrerequisites();
            await this.setupEnvironment();
            await this.validateProject();
            await this.setupDevelopmentTools();
            await this.generateDocumentation();
            
            this.log('✅ SACRED initialization completed successfully!', 'success');
            this.printNextSteps();
        } catch (error) {
            this.log(`❌ Initialization failed: ${error.message}`, 'error');
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        this.log('🔍 Checking prerequisites...', 'info');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const minNodeVersion = '18.0.0';
        if (!this.isVersionGreater(nodeVersion.slice(1), minNodeVersion)) {
            throw new Error(`Node.js ${minNodeVersion} or higher is required. Current: ${nodeVersion}`);
        }
        
        // Check if npm is available
        try {
            execSync('npm --version', { stdio: 'ignore' });
        } catch (error) {
            throw new Error('npm is not installed or not available in PATH');
        }
        
        this.log('✅ Prerequisites check passed', 'success');
    }

    async setupEnvironment() {
        this.log('🔧 Setting up development environment...', 'info');
        
        // Create necessary directories
        const directories = [
            'src/components/sacred',
            'src/utils/sacred',
            'src/hooks/sacred',
            'docs/api',
            'docs/components',
            'tests/unit',
            'tests/integration',
            '.github/workflows'
        ];
        
        directories.forEach(dir => {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                this.log(`📁 Created directory: ${dir}`, 'info');
            }
        });
        
        // Create environment files
        this.createEnvironmentFiles();
        
        this.log('✅ Environment setup completed', 'success');
    }

    createEnvironmentFiles() {
        // .env.example
        const envExample = `# SACRED Environment Configuration
# Copy this file to .env and fill in your values

# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_API_URL=https://api.base44.com

# Application Configuration
VITE_APP_NAME=SACRED
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Features
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# Security
VITE_ENABLE_HTTPS=false
VITE_SESSION_TIMEOUT=3600000
`;
        
        const envPath = path.join(this.projectRoot, '.env.example');
        if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, envExample);
            this.log('📄 Created .env.example', 'info');
        }
        
        // .env.local (if it doesn't exist)
        const envLocalPath = path.join(this.projectRoot, '.env.local');
        if (!fs.existsSync(envLocalPath)) {
            fs.writeFileSync(envLocalPath, envExample);
            this.log('📄 Created .env.local', 'info');
        }
    }

    async validateProject() {
        this.log('🔍 Validating project structure...', 'info');
        
        const requiredFiles = [
            'package.json',
            'vite.config.js',
            'tailwind.config.js',
            'src/main.jsx',
            'src/App.jsx'
        ];
        
        const missingFiles = requiredFiles.filter(file => {
            const filePath = path.join(this.projectRoot, file);
            return !fs.existsSync(filePath);
        });
        
        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
        
        // Validate package.json
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        const requiredDependencies = [
            '@base44/sdk',
            'react',
            'react-dom',
            'react-router-dom',
            'tailwindcss',
            'framer-motion',
            'lucide-react'
        ];
        
        const missingDeps = requiredDependencies.filter(dep => 
            !packageJson.dependencies || !packageJson.dependencies[dep]
        );
        
        if (missingDeps.length > 0) {
            this.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`, 'warning');
            this.log('Installing missing dependencies...', 'info');
            execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        }
        
        this.log('✅ Project validation completed', 'success');
    }

    async setupDevelopmentTools() {
        this.log('🛠️  Setting up development tools...', 'info');
        
        // Create VS Code settings
        this.createVSCodeSettings();
        
        // Create git hooks
        this.createGitHooks();
        
        // Create testing configuration
        this.createTestConfig();
        
        this.log('✅ Development tools setup completed', 'success');
    }

    createVSCodeSettings() {
        const vsCodeDir = path.join(this.projectRoot, '.vscode');
        if (!fs.existsSync(vsCodeDir)) {
            fs.mkdirSync(vsCodeDir);
        }
        
        const settings = {
            "editor.formatOnSave": true,
            "editor.codeActionsOnSave": {
                "source.fixAll.eslint": true
            },
            "files.associations": {
                "*.jsx": "javascriptreact"
            },
            "emmet.includeLanguages": {
                "javascript": "javascriptreact"
            },
            "tailwindCSS.includeLanguages": {
                "javascript": "javascript",
                "html": "HTML"
            },
            "tailwindCSS.experimental.classRegex": [
                ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
            ]
        };
        
        const settingsPath = path.join(vsCodeDir, 'settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        this.log('📄 Created VS Code settings', 'info');
        
        const extensions = {
            "recommendations": [
                "bradlc.vscode-tailwindcss",
                "esbenp.prettier-vscode",
                "dbaeumer.vscode-eslint",
                "ms-vscode.vscode-typescript-next",
                "formulahendry.auto-rename-tag",
                "christian-kohler.path-intellisense"
            ]
        };
        
        const extensionsPath = path.join(vsCodeDir, 'extensions.json');
        fs.writeFileSync(extensionsPath, JSON.stringify(extensions, null, 2));
        this.log('📄 Created VS Code extensions recommendations', 'info');
    }

    createGitHooks() {
        const preCommitHook = `#!/bin/sh
# SACRED Pre-commit Hook

echo "🔍 Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix the issues before committing."
  exit 1
fi

# Run type checking if available
if npm run typecheck >/dev/null 2>&1; then
  npm run typecheck
  if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix the issues before committing."
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed!"
exit 0
`;
        
        const hooksDir = path.join(this.projectRoot, '.git', 'hooks');
        if (fs.existsSync(hooksDir)) {
            const preCommitPath = path.join(hooksDir, 'pre-commit');
            fs.writeFileSync(preCommitPath, preCommitHook);
            fs.chmodSync(preCommitPath, '755');
            this.log('📄 Created git pre-commit hook', 'info');
        }
    }

    createTestConfig() {
        const testConfig = `// SACRED Testing Configuration
import { vi } from 'vitest'

// Mock Base44 SDK
vi.mock('@base44/sdk', () => ({
  createClient: vi.fn(() => ({
    // Mock client methods
  }))
}))

// Mock environment variables
Object.assign(process.env, {
  VITE_BASE44_APP_ID: 'test-app-id',
  VITE_APP_ENVIRONMENT: 'test'
})
`;
        
        const testConfigPath = path.join(this.projectRoot, 'src', 'test-setup.js');
        fs.writeFileSync(testConfigPath, testConfig);
        this.log('📄 Created test configuration', 'info');
    }

    async generateDocumentation() {
        this.log('📚 Generating documentation...', 'info');
        
        // Create API documentation
        this.createApiDocs();
        
        // Create component documentation
        this.createComponentDocs();
        
        // Create deployment documentation
        this.createDeploymentDocs();
        
        this.log('✅ Documentation generation completed', 'success');
    }

    createApiDocs() {
        const apiDocs = `# SACRED API Documentation

## Base44 SDK Integration

### Authentication
- Uses OAuth flow through Base44 SDK
- Requires \`requiresAuth: true\` in client configuration
- Handles automatic token refresh

### Entities

#### User
- Authentication and profile management
- Onboarding status tracking
- Payment verification

#### CoupleAssessment
- Assessment lifecycle management
- Partner coordination
- Status transitions

#### Question & Answer
- Assessment question management
- User response handling
- Section organization

## API Usage Examples

\`\`\`javascript
import { base44 } from '@/api/base44Client';
import { User, CoupleAssessment } from '@/api/entities';

// Get current user
const user = await User.me();

// Create assessment
const assessment = await CoupleAssessment.create({
  partner1_email: user.email,
  partner1_name: user.full_name
});
\`\`\`
`;
        
        const apiDocsPath = path.join(this.projectRoot, 'docs', 'api', 'README.md');
        fs.writeFileSync(apiDocsPath, apiDocs);
        this.log('📄 Created API documentation', 'info');
    }

    createComponentDocs() {
        const componentDocs = `# SACRED Component Library

## Design System

### Colors
- Primary: #2F4F3F (Deep Forest Green)
- Secondary: #C4756B (Warm Rose)
- Accent: #7A9B8A (Sage Green)
- Background: #F5F1EB to #EAE6E1 (Warm Cream Gradient)
- Text: #6B5B73 (Muted Purple-Gray)

### Typography
- Font Family: Cormorant Garamond
- Classes: font-sacred, font-sacred-bold, font-sacred-medium

### Components

#### Landing Components
- HeroSection: Main landing page hero
- HowItWorksSection: Process explanation
- TestimonialsSection: Social proof

#### Assessment Components
- ProgressBar: Visual progress tracking
- QuestionCard: Individual question display
- AuthWrapper: Authentication requirement wrapper

#### UI Components
All components use Radix UI primitives with custom styling:
- Button, Card, Dialog, Input, etc.
- Consistent with SACRED design system
`;
        
        const componentDocsPath = path.join(this.projectRoot, 'docs', 'components', 'README.md');
        fs.writeFileSync(componentDocsPath, componentDocs);
        this.log('📄 Created component documentation', 'info');
    }

    createDeploymentDocs() {
        const deploymentDocs = `# SACRED Deployment Guide

## Development Environment

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Environment Variables

Required environment variables:
- \`VITE_BASE44_APP_ID\`: Base44 application ID
- \`VITE_BASE44_API_URL\`: Base44 API endpoint

## Production Deployment

### Build Optimization
- Lazy loading implemented for landing page sections
- Image optimization with responsive sizes
- Component-level code splitting

### Security Considerations
- All sensitive data encrypted in transit
- OAuth authentication required
- No client-side secrets stored

### Performance
- Core Web Vitals optimization
- CDN-ready static assets
- Progressive loading strategies
`;
        
        const deploymentDocsPath = path.join(this.projectRoot, 'docs', 'DEPLOYMENT.md');
        fs.writeFileSync(deploymentDocsPath, deploymentDocs);
        this.log('📄 Created deployment documentation', 'info');
    }

    printNextSteps() {
        this.log('\n🎉 SACRED Initialization Complete!', 'success');
        console.log('\n📋 Next Steps:');
        console.log('1. Copy .env.example to .env and configure your Base44 credentials');
        console.log('2. Run "npm install" to ensure all dependencies are installed');
        console.log('3. Run "npm run dev" to start the development server');
        console.log('4. Review the generated documentation in the docs/ folder');
        console.log('5. Configure your Base44 app ID in the environment variables');
        
        console.log('\n📚 Documentation Generated:');
        console.log('- Product Design Document: PRODUCT_DESIGN_DOCUMENT.md');
        console.log('- API Documentation: docs/api/README.md');
        console.log('- Component Documentation: docs/components/README.md');
        console.log('- Deployment Guide: docs/DEPLOYMENT.md');
        
        console.log('\n🛠️  Development Tools Setup:');
        console.log('- VS Code settings and extensions recommendations');
        console.log('- Git pre-commit hooks for code quality');
        console.log('- Test configuration and mocks');
        
        console.log('\n🔒 Security Reminders:');
        console.log('- Never commit .env files with real credentials');
        console.log('- Keep Base44 app ID secure');
        console.log('- Review authentication flows before production');
        
        console.log('\n💡 Pro Tips:');
        console.log('- Use the VS Code extensions for better development experience');
        console.log('- Run linting before commits to maintain code quality');
        console.log('- Review the PDR document for architectural decisions');
    }

    isVersionGreater(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return true;
            if (v1Part < v2Part) return false;
        }
        
        return true; // Equal versions are considered "greater or equal"
    }
}

// CLI Interface
if (require.main === module) {
    const initializer = new SacredInitializer();
    initializer.init().catch(error => {
        console.error('Initialization failed:', error);
        process.exit(1);
    });
}

module.exports = SacredInitializer;