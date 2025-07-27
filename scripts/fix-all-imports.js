const fs = require('fs');
const path = require('path');

// Mapeamento de componentes para seus imports corretos
const componentMappings = {
  // Tabs components
  'TabsList': '@/components/ui/tabs',
  'TabsTrigger': '@/components/ui/tabs',
  'TabsContent': '@/components/ui/tabs',
  
  // Avatar components
  'AvatarImage': '@/components/ui/avatar',
  'AvatarFallback': '@/components/ui/avatar',
  
  // Card components
  'CardContent': '@/components/ui/card',
  
  // Dialog components
  'DialogContent': '@/components/ui/dialog',
  'DialogHeader': '@/components/ui/dialog',
  'DialogTitle': '@/components/ui/dialog',
  'DialogDescription': '@/components/ui/dialog',
  'DialogFooter': '@/components/ui/dialog',
  'DialogTrigger': '@/components/ui/dialog',
  
  // Alert Dialog components
  'AlertDialogContent': '@/components/ui/alert-dialog',
  'AlertDialogHeader': '@/components/ui/alert-dialog',
  'AlertDialogTitle': '@/components/ui/alert-dialog',
  'AlertDialogDescription': '@/components/ui/alert-dialog',
  'AlertDialogFooter': '@/components/ui/alert-dialog',
  'AlertDialogAction': '@/components/ui/alert-dialog',
  'AlertDialogCancel': '@/components/ui/alert-dialog',
  
  // Form components
  'FormControl': '@/components/ui/form',
  'FormField': '@/components/ui/form',
  'FormItem': '@/components/ui/form',
  'FormLabel': '@/components/ui/form',
  'FormMessage': '@/components/ui/form',
  'FormDescription': '@/components/ui/form',
  
  // Select components
  'SelectContent': '@/components/ui/select',
  'SelectItem': '@/components/ui/select',
  'SelectTrigger': '@/components/ui/select',
  'SelectValue': '@/components/ui/select',
  
  // Sheet components
  'SheetContent': '@/components/ui/sheet',
  'SheetHeader': '@/components/ui/sheet',
  'SheetTitle': '@/components/ui/sheet',
  'SheetDescription': '@/components/ui/sheet',
  'SheetFooter': '@/components/ui/sheet',
  'SheetTrigger': '@/components/ui/sheet',
  
  // Dropdown Menu components
  'DropdownMenuContent': '@/components/ui/dropdown-menu',
  'DropdownMenuItem': '@/components/ui/dropdown-menu',
  'DropdownMenuTrigger': '@/components/ui/dropdown-menu',
  'DropdownMenuSeparator': '@/components/ui/dropdown-menu',
  'DropdownMenuLabel': '@/components/ui/dropdown-menu',
  
  // Popover components
  'PopoverContent': '@/components/ui/popover',
  'PopoverTrigger': '@/components/ui/popover',
  
  // Command components
  'CommandInput': '@/components/ui/command',
  'CommandList': '@/components/ui/command',
  'CommandEmpty': '@/components/ui/command',
  'CommandGroup': '@/components/ui/command',
  'CommandItem': '@/components/ui/command',
  
  // Toast components
  'ToastAction': '@/components/ui/toast',
  
  // Accordion components
  'AccordionContent': '@/components/ui/accordion',
  'AccordionItem': '@/components/ui/accordion',
  'AccordionTrigger': '@/components/ui/accordion',
  
  // Tooltip components
  'TooltipContent': '@/components/ui/tooltip',
  'TooltipProvider': '@/components/ui/tooltip',
  'TooltipTrigger': '@/components/ui/tooltip',
};

// Componentes que devem ser removidos do Hero UI e importados de outro lugar
const componentsToMoveFromHeroUI = {
  'Avatar': '@/components/ui/avatar',
  'Tabs': '@/components/ui/tabs',
  'Tab': null, // Remove Tab as it's not used with new Tabs
  'Dialog': '@/components/ui/dialog',
  'AlertDialog': '@/components/ui/alert-dialog',
  'Form': '@/components/ui/form',
  'Select': '@/components/ui/select',
  'Sheet': '@/components/ui/sheet',
  'DropdownMenu': '@/components/ui/dropdown-menu',
  'Popover': '@/components/ui/popover',
  'Command': '@/components/ui/command',
  'Accordion': '@/components/ui/accordion',
  'Tooltip': '@/components/ui/tooltip',
};

function getAllTsxFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, and other build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          walk(fullPath);
        }
      } else if (item.endsWith('.tsx') && !item.includes('backup') && !item.includes('old')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const requiredImports = new Map(); // Map of import path to Set of components
  
  // Find all components used in the file
  for (const [component, importPath] of Object.entries(componentMappings)) {
    const regex = new RegExp(`<${component}[\\s>]`, 'g');
    if (regex.test(content)) {
      if (!requiredImports.has(importPath)) {
        requiredImports.set(importPath, new Set());
      }
      requiredImports.get(importPath).add(component);
    }
  }
  
  // Check for components that need to be moved from Hero UI
  const heroUIRegex = /import\s*{([^}]+)}\s*from\s*["']@heroui\/react["']/;
  const heroUIMatch = content.match(heroUIRegex);
  
  if (heroUIMatch) {
    const heroUIComponents = heroUIMatch[1].split(',').map(c => c.trim());
    const componentsToKeep = [];
    
    for (const component of heroUIComponents) {
      if (componentsToMoveFromHeroUI[component]) {
        const newImportPath = componentsToMoveFromHeroUI[component];
        if (newImportPath) {
          if (!requiredImports.has(newImportPath)) {
            requiredImports.set(newImportPath, new Set());
          }
          requiredImports.get(newImportPath).add(component);
        }
      } else {
        componentsToKeep.push(component);
      }
    }
    
    // Update Hero UI import
    if (componentsToKeep.length > 0) {
      const newHeroUIImport = `import { ${componentsToKeep.join(', ')} } from "@heroui/react"`;
      content = content.replace(heroUIRegex, newHeroUIImport);
    } else {
      // Remove Hero UI import entirely
      content = content.replace(heroUIRegex, '');
    }
    modified = true;
  }
  
  // Add required imports
  for (const [importPath, components] of requiredImports) {
    const componentList = Array.from(components).join(', ');
    const importRegex = new RegExp(`import\\s*{[^}]*}\\s*from\\s*["']${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
    
    if (!importRegex.test(content)) {
      // Find where to insert the import (after other imports)
      const lastImportMatch = content.match(/^import[^;]+;?\s*$/m);
      if (lastImportMatch) {
        const insertPos = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        const newImport = `\nimport { ${componentList} } from "${importPath}"`;
        content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
        modified = true;
      }
    } else {
      // Update existing import
      const existingImportMatch = content.match(importRegex);
      if (existingImportMatch) {
        const existingComponents = existingImportMatch[0].match(/{([^}]+)}/)[1].split(',').map(c => c.trim());
        const allComponents = new Set([...existingComponents, ...components]);
        const newImport = `import { ${Array.from(allComponents).join(', ')} } from "${importPath}"`;
        content = content.replace(importRegex, newImport);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('Starting import fix process...');

const appDir = path.join(__dirname, '..', 'app');
const componentsDir = path.join(__dirname, '..', 'components');

const files = [
  ...getAllTsxFiles(appDir),
  ...getAllTsxFiles(componentsDir)
];

let fixedCount = 0;

for (const file of files) {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
}

console.log(`\nFixed imports in ${fixedCount} files.`);
console.log('Import fix process completed!');