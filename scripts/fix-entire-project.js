const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Component mappings for all UI libraries
const UI_COMPONENT_MAPPINGS = {
  // Shadcn/UI components
  'Tabs': { from: '@heroui/react', to: '@/components/ui/tabs' },
  'TabsList': { from: null, to: '@/components/ui/tabs' },
  'TabsTrigger': { from: null, to: '@/components/ui/tabs' },
  'TabsContent': { from: null, to: '@/components/ui/tabs' },
  
  'Avatar': { from: '@heroui/react', to: '@/components/ui/avatar' },
  'AvatarImage': { from: null, to: '@/components/ui/avatar' },
  'AvatarFallback': { from: null, to: '@/components/ui/avatar' },
  
  'Dialog': { from: '@heroui/react', to: '@/components/ui/dialog' },
  'DialogContent': { from: null, to: '@/components/ui/dialog' },
  'DialogHeader': { from: null, to: '@/components/ui/dialog' },
  'DialogTitle': { from: null, to: '@/components/ui/dialog' },
  'DialogDescription': { from: null, to: '@/components/ui/dialog' },
  'DialogFooter': { from: null, to: '@/components/ui/dialog' },
  'DialogTrigger': { from: null, to: '@/components/ui/dialog' },
  
  'AlertDialog': { from: '@heroui/react', to: '@/components/ui/alert-dialog' },
  'AlertDialogContent': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogHeader': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogTitle': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogDescription': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogFooter': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogAction': { from: null, to: '@/components/ui/alert-dialog' },
  'AlertDialogCancel': { from: null, to: '@/components/ui/alert-dialog' },
  
  'CardContent': { from: null, to: '@/components/ui/card' },
  'CardDescription': { from: null, to: '@/components/ui/card' },
  'CardTitle': { from: null, to: '@/components/ui/card' },
  
  'Form': { from: '@heroui/react', to: '@/components/ui/form' },
  'FormControl': { from: null, to: '@/components/ui/form' },
  'FormField': { from: null, to: '@/components/ui/form' },
  'FormItem': { from: null, to: '@/components/ui/form' },
  'FormLabel': { from: null, to: '@/components/ui/form' },
  'FormMessage': { from: null, to: '@/components/ui/form' },
  'FormDescription': { from: null, to: '@/components/ui/form' },
  
  'Select': { from: '@heroui/react', to: '@/components/ui/select' },
  'SelectContent': { from: null, to: '@/components/ui/select' },
  'SelectItem': { from: '@heroui/react', to: '@/components/ui/select' },
  'SelectTrigger': { from: null, to: '@/components/ui/select' },
  'SelectValue': { from: null, to: '@/components/ui/select' },
  
  'Sheet': { from: '@heroui/react', to: '@/components/ui/sheet' },
  'SheetContent': { from: null, to: '@/components/ui/sheet' },
  'SheetHeader': { from: null, to: '@/components/ui/sheet' },
  'SheetTitle': { from: null, to: '@/components/ui/sheet' },
  'SheetDescription': { from: null, to: '@/components/ui/sheet' },
  'SheetFooter': { from: null, to: '@/components/ui/sheet' },
  'SheetTrigger': { from: null, to: '@/components/ui/sheet' },
  
  'DropdownMenu': { from: '@heroui/react', to: '@/components/ui/dropdown-menu' },
  'DropdownMenuContent': { from: null, to: '@/components/ui/dropdown-menu' },
  'DropdownMenuItem': { from: null, to: '@/components/ui/dropdown-menu' },
  'DropdownMenuTrigger': { from: null, to: '@/components/ui/dropdown-menu' },
  'DropdownMenuSeparator': { from: null, to: '@/components/ui/dropdown-menu' },
  'DropdownMenuLabel': { from: null, to: '@/components/ui/dropdown-menu' },
  
  'Popover': { from: '@heroui/react', to: '@/components/ui/popover' },
  'PopoverContent': { from: null, to: '@/components/ui/popover' },
  'PopoverTrigger': { from: null, to: '@/components/ui/popover' },
  
  'Command': { from: '@heroui/react', to: '@/components/ui/command' },
  'CommandInput': { from: null, to: '@/components/ui/command' },
  'CommandList': { from: null, to: '@/components/ui/command' },
  'CommandEmpty': { from: null, to: '@/components/ui/command' },
  'CommandGroup': { from: null, to: '@/components/ui/command' },
  'CommandItem': { from: null, to: '@/components/ui/command' },
  
  'Accordion': { from: '@heroui/react', to: '@/components/ui/accordion' },
  'AccordionContent': { from: null, to: '@/components/ui/accordion' },
  'AccordionItem': { from: null, to: '@/components/ui/accordion' },
  'AccordionTrigger': { from: null, to: '@/components/ui/accordion' },
  
  'Tooltip': { from: '@heroui/react', to: '@/components/ui/tooltip' },
  'TooltipContent': { from: null, to: '@/components/ui/tooltip' },
  'TooltipProvider': { from: null, to: '@/components/ui/tooltip' },
  'TooltipTrigger': { from: null, to: '@/components/ui/tooltip' },
  
  'ToastAction': { from: null, to: '@/components/ui/toast' },
};

// Components that should stay in Hero UI
const HEROUI_COMPONENTS = [
  'Button', 'Chip', 'Card', 'CardBody', 'CardFooter', 'CardHeader',
  'Badge', 'Textarea', 'Input', 'Spinner', 'Progress', 'Checkbox',
  'Radio', 'Switch', 'Slider', 'Divider', 'Spacer', 'Link',
  'Image', 'User', 'Code', 'Kbd', 'Snippet', 'Skeleton',
  'Table', 'TableHeader', 'TableBody', 'TableColumn', 'TableRow', 'TableCell',
  'Pagination', 'PaginationItem', 'PaginationCursor',
  'Modal', 'ModalContent', 'ModalHeader', 'ModalBody', 'ModalFooter',
  'Navbar', 'NavbarBrand', 'NavbarContent', 'NavbarItem', 'NavbarMenuToggle', 'NavbarMenu', 'NavbarMenuItem',
  'Listbox', 'ListboxItem', 'ListboxSection',
  'CircularProgress', 'ScrollShadow', 'Autocomplete', 'AutocompleteItem'
];

class ProjectFixer {
  constructor() {
    this.fixedFiles = 0;
    this.errors = [];
    this.processedFiles = new Set();
  }

  getAllFiles(dir, extension = '.tsx') {
    const files = [];
    
    const walk = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          
          // Skip directories
          if (['node_modules', '.next', 'dist', 'build', '.git', 'new features'].includes(item)) {
            continue;
          }
          
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            walk(fullPath);
          } else if (item.endsWith(extension) && !item.includes('backup') && !item.includes('-old') && !item.includes('.d.ts')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${currentDir}:`, error.message);
      }
    };
    
    walk(dir);
    return files;
  }

  fixFile(filePath) {
    if (this.processedFiles.has(filePath)) {
      return false;
    }
    
    this.processedFiles.add(filePath);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Step 1: Remove all trailing imports (imports after the last closing brace)
      content = this.removeTrailingImports(content);
      
      // Step 2: Fix import statements
      content = this.fixImports(content, filePath);
      
      // Step 3: Remove duplicate imports
      content = this.removeDuplicateImports(content);
      
      // Step 4: Fix syntax errors
      content = this.fixSyntaxErrors(content);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        this.fixedFiles++;
        return true;
      }
      
      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  removeTrailingImports(content) {
    const lines = content.split('\n');
    let lastValidLine = lines.length - 1;
    
    // Find the last non-import line
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('import ') && !line.startsWith('//')) {
        if (line === '}' || line.match(/^}\s*;?\s*$/)) {
          lastValidLine = i;
          break;
        }
      }
    }
    
    // Check if there are imports after the last valid line
    let hasTrailingImports = false;
    for (let i = lastValidLine + 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        hasTrailingImports = true;
        break;
      }
    }
    
    if (hasTrailingImports) {
      lines.splice(lastValidLine + 1);
      return lines.join('\n');
    }
    
    return content;
  }

  fixImports(content, filePath) {
    const lines = content.split('\n');
    const importMap = new Map(); // Map of import path to components
    const usedComponents = new Set();
    
    // Find all components used in the file
    for (const [component, mapping] of Object.entries(UI_COMPONENT_MAPPINGS)) {
      const regex = new RegExp(`<${component}[\\s>]`, 'g');
      if (regex.test(content)) {
        usedComponents.add(component);
      }
    }
    
    // Process existing imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/^\s*import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/);
      
      if (importMatch) {
        const components = importMatch[1].split(',').map(c => c.trim());
        const importPath = importMatch[2];
        
        if (importPath === '@heroui/react') {
          const heroUIComponents = [];
          const componentsToMove = new Map();
          
          for (const component of components) {
            const mapping = UI_COMPONENT_MAPPINGS[component];
            if (mapping && mapping.from === '@heroui/react') {
              // This component should be moved
              if (!componentsToMove.has(mapping.to)) {
                componentsToMove.set(mapping.to, []);
              }
              componentsToMove.get(mapping.to).push(component);
            } else if (HEROUI_COMPONENTS.includes(component)) {
              // This component stays in Hero UI
              heroUIComponents.push(component);
            }
          }
          
          // Update or remove Hero UI import
          if (heroUIComponents.length > 0) {
            lines[i] = `import { ${heroUIComponents.join(', ')} } from "@heroui/react"`;
          } else {
            lines[i] = '// ' + lines[i]; // Comment out instead of removing
          }
          
          // Add new imports for moved components
          for (const [newPath, comps] of componentsToMove) {
            if (!importMap.has(newPath)) {
              importMap.set(newPath, new Set());
            }
            comps.forEach(c => importMap.get(newPath).add(c));
          }
        } else {
          // Keep track of other imports
          if (!importMap.has(importPath)) {
            importMap.set(importPath, new Set());
          }
          components.forEach(c => importMap.get(importPath).add(c));
        }
      }
    }
    
    // Add imports for used components that aren't imported yet
    for (const component of usedComponents) {
      const mapping = UI_COMPONENT_MAPPINGS[component];
      if (mapping && mapping.to) {
        if (!importMap.has(mapping.to)) {
          importMap.set(mapping.to, new Set());
        }
        importMap.get(mapping.to).add(component);
      }
    }
    
    // Build the final import section
    const importLines = [];
    let lastImportIndex = -1;
    
    // Find where imports end
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    // Add missing imports
    for (const [importPath, components] of importMap) {
      if (components.size > 0) {
        const importLine = `import { ${Array.from(components).join(', ')} } from "${importPath}"`;
        const existingImport = lines.findIndex(line => line.includes(`from "${importPath}"`));
        
        if (existingImport === -1) {
          // Add new import after last import
          if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importLine);
            lastImportIndex++;
          }
        }
      }
    }
    
    return lines.join('\n');
  }

  removeDuplicateImports(content) {
    const lines = content.split('\n');
    const importMap = new Map();
    const processedLines = [];
    
    for (const line of lines) {
      const importMatch = line.match(/^\s*import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/);
      
      if (importMatch) {
        const components = importMatch[1].split(',').map(c => c.trim());
        const importPath = importMatch[2];
        
        if (!importMap.has(importPath)) {
          importMap.set(importPath, new Set());
        }
        
        let hasNewComponents = false;
        for (const component of components) {
          if (!importMap.get(importPath).has(component)) {
            importMap.get(importPath).add(component);
            hasNewComponents = true;
          }
        }
        
        if (hasNewComponents) {
          const allComponents = Array.from(importMap.get(importPath));
          processedLines.push(`import { ${allComponents.join(', ')} } from "${importPath}"`);
        }
      } else {
        processedLines.push(line);
      }
    }
    
    return processedLines.join('\n');
  }

  fixSyntaxErrors(content) {
    // Remove multiple consecutive empty lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Fix trailing commas in imports
    content = content.replace(/,\s*}/g, ' }');
    
    // Fix double commas in imports
    content = content.replace(/,\s*,/g, ',');
    
    // Ensure file ends with newline
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    
    return content;
  }

  async run() {
    console.log('🚀 Starting comprehensive project fix...\n');
    
    const directories = [
      path.join(__dirname, '..'),
      path.join(__dirname, '..', 'app'),
      path.join(__dirname, '..', 'components'),
    ];
    
    for (const dir of directories) {
      console.log(`\n📁 Processing directory: ${dir}`);
      
      const tsxFiles = this.getAllFiles(dir, '.tsx');
      const tsFiles = this.getAllFiles(dir, '.ts');
      
      console.log(`Found ${tsxFiles.length} .tsx files and ${tsFiles.length} .ts files`);
      
      for (const file of [...tsxFiles, ...tsFiles]) {
        this.fixFile(file);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Fixed ${this.fixedFiles} files`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors in ${this.errors.length} files:`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }
    
    // Run TypeScript check
    console.log('\n🔍 Running TypeScript check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed!');
    } catch (error) {
      console.log('❌ TypeScript check failed. See errors above.');
    }
  }
}

// Run the fixer
const fixer = new ProjectFixer();
fixer.run().catch(console.error);