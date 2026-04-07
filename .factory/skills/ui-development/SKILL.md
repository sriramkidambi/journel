---
name: ui-development
description: Guidelines for developing React UI components with Radix and TipTap
---

# UI Development Skill

## Component Structure

```typescript
// src/renderer/pages/PageName/index.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';

export interface PageNameProps {
  // Define all props explicitly
  title: string;
  onAction: () => void;
}

export const PageName: React.FC<PageNameProps> = ({ title, onAction }) => {
  return (
    <div className="page-container">
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

## Styling Guidelines

### CSS Modules Pattern
- Use SCSS for component styles
- Co-locate styles with components: `ComponentName.module.scss`
- Use CSS modules for scoped styles

### Radix UI Usage
```typescript
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="dialog-overlay" />
    <Dialog.Content className="dialog-content">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Framer Motion for Animations
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

## TipTap Editor Integration

### Editor Setup
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Initial content</p>',
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    // Save to file
  },
});

return <EditorContent editor={editor} />;
```

### Custom Extensions
- Place custom extensions in `src/renderer/editor/extensions/`
- Follow TipTap extension pattern
- Export from index barrel

## Accessibility Requirements

- Use semantic HTML elements
- Include ARIA labels for interactive elements
- Support keyboard navigation
- Test with screen readers
- Use Radix UI for accessible primitives

## Responsive Design

Journal is a desktop app with fixed window size:
- Design for minimum 800x600 viewport
- Use relative units (rem, %)
- Test at different zoom levels
