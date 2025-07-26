const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapeamento de imports antigos para novos
const importMap = {
  // UI Components
  '@/components/ui/button': '@heroui/react',
  '@/components/ui/input': '@heroui/react',
  '@/components/ui/label': '@heroui/react',
  '@/components/ui/card': '@heroui/react',
  '@/components/ui/tabs': '@heroui/react',
  '@/components/ui/table': '@heroui/react',
  '@/components/ui/badge': '@heroui/react',
  '@/components/ui/avatar': '@heroui/react',
  '@/components/ui/separator': '@heroui/react',
  '@/components/ui/dialog': '@heroui/react',
  '@/components/ui/dropdown-menu': '@heroui/react',
  '@/components/ui/select': '@heroui/react',
  '@/components/ui/textarea': '@heroui/react',
  '@/components/ui/checkbox': '@heroui/react',
  '@/components/ui/radio-group': '@heroui/react',
  '@/components/ui/switch': '@heroui/react',
  '@/components/ui/slider': '@heroui/react',
  '@/components/ui/progress': '@heroui/react',
  '@/components/ui/tooltip': '@heroui/react',
  '@/components/ui/popover': '@heroui/react',
  '@/components/ui/sheet': '@heroui/react',
  '@/components/ui/alert': '@heroui/react',
  '@/components/ui/toast': '@heroui/react',
  '@/components/ui/toaster': '@heroui/react',
  
  // Component mappings
  '../../../components/ui/button': '@heroui/react',
  '../../../components/ui/card': '@heroui/react',
  '../../../components/ui/tabs': '@heroui/react',
  '../../../components/ui/avatar': '@heroui/react',
  '../../../components/ui/separator': '@heroui/react',
  '../../../components/ui/badge': '@heroui/react',
  
  // Supabase client
  '@/lib/supabase/client': '@/supabase/client',
  '@/utils/supabase/client': '@/supabase/client',
};

// Mapeamento de componentes
const componentMap = {
  // Buttons
  'Button': 'Button',
  
  // Cards
  'Card': 'Card',
  'CardContent': 'CardBody',
  'CardDescription': 'p',
  'CardFooter': 'CardFooter',
  'CardHeader': 'CardHeader',
  'CardTitle': 'h3',
  
  // Tabs
  'Tabs': 'Tabs',
  'TabsList': null, // Remove TabsList
  'TabsTrigger': 'Tab',
  'TabsContent': null, // Replace with conditional rendering
  
  // Form
  'Input': 'Input',
  'Label': 'label',
  'Textarea': 'Textarea',
  'Select': 'Select',
  'SelectContent': null,
  'SelectItem': 'SelectItem',
  'SelectTrigger': null,
  'SelectValue': null,
  
  // Avatar
  'Avatar': 'Avatar',
  'AvatarFallback': null,
  'AvatarImage': null,
  
  // Others
  'Badge': 'Chip',
  'Separator': 'Divider',
  'Dialog': 'Modal',
  'DialogContent': 'ModalContent',
  'DialogDescription': 'ModalBody',
  'DialogFooter': 'ModalFooter',
  'DialogHeader': 'ModalHeader',
  'DialogTitle': 'h3',
  'DialogTrigger': null,
  
  // Table
  'Table': 'Table',
  'TableBody': 'TableBody',
  'TableCell': 'TableCell',
  'TableHead': 'TableColumn',
  'TableHeader': 'TableHeader',
  'TableRow': 'TableRow',
};

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix imports
  for (const [oldImport, newImport] of Object.entries(importMap)) {
    const regex = new RegExp(`from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `from '${newImport}'`);
      modified = true;
    }
  }

  // Fix component names in imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@heroui\/react['"]/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports.split(',').map(imp => imp.trim());
    const newImports = [];
    
    for (const imp of importList) {
      const parts = imp.split(' as ');
      const originalName = parts[0].trim();
      const alias = parts[1]?.trim();
      
      if (componentMap[originalName] && componentMap[originalName] !== originalName) {
        newImports.push(componentMap[originalName]);
      } else if (componentMap[originalName] !== null) {
        newImports.push(originalName);
      }
    }
    
    return newImports.length > 0 
      ? `import { ${newImports.join(', ')} } from '@heroui/react'`
      : '';
  });

  // Fix component usage in JSX
  for (const [oldComp, newComp] of Object.entries(componentMap)) {
    if (newComp && oldComp !== newComp) {
      // Replace opening tags
      const openTagRegex = new RegExp(`<${oldComp}(\\s|>)`, 'g');
      content = content.replace(openTagRegex, `<${newComp}$1`);
      
      // Replace closing tags
      const closeTagRegex = new RegExp(`</${oldComp}>`, 'g');
      content = content.replace(closeTagRegex, `</${newComp}>`);
      
      modified = true;
    }
  }

  // Fix Tabs usage
  content = content.replace(/<TabsList[^>]*>[\s\S]*?<\/TabsList>/g, '');
  content = content.replace(/<TabsTrigger\s+value="([^"]+)"[^>]*>([\s\S]*?)<\/TabsTrigger>/g, 
    '<Tab key="$1" title={$2} />');
  content = content.replace(/<TabsContent\s+value="([^"]+)"[^>]*>/g, 
    '{activeTab === "$1" && (');
  content = content.replace(/<\/TabsContent>/g, ')}');

  // Fix Avatar usage
  content = content.replace(/<Avatar([^>]*)>\s*<AvatarImage\s+src="([^"]+)"[^/]*\/>\s*<AvatarFallback[^>]*>([\s\S]*?)<\/AvatarFallback>\s*<\/Avatar>/g,
    '<Avatar$1 src="$2" fallback={$3} />');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Find all TypeScript/JavaScript files
const files = glob.sync('app/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`Found ${files.length} files to process...`);

files.forEach(file => {
  try {
    fixImports(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Import fixing complete!');