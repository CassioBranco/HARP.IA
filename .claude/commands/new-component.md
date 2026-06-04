# /new-component [nome] [tipo?]

Cria um novo componente React para o Projeto HARPIA seguindo Design Atômico e convenções do projeto.

## Uso
```
/new-component HeroSection organism
/new-component PricingCard organism
/new-component BlogPostCard molecule   ← requer aprovação humana antes de promover
```

## O que este comando faz

1. **Verifica** se já existe componente equivalente no Storybook — não duplica
2. **Cria** o componente em `components/draft/{NomeDoComponente}.tsx`
3. **Cria** a story em `components/draft/{NomeDoComponente}.stories.tsx` com estados: default, loading, empty, error
4. **Tipagem estrita**: props com TypeScript, sem `any`, sem props opcionais desnecessárias
5. **Acessibilidade**: `role`, `aria-label`, navegação por teclado onde aplicável
6. **Server Component por padrão** — adiciona `'use client'` apenas se interatividade for necessária

## Restrições

- **Átomos e Moléculas**: criados em `draft/` — só promovidos com aprovação explícita do Cássio
- **Organismos, Templates, Pages**: podem ser promovidos após revisão do frontend-dev
- **Nunca** editar `components/atoms/` ou `components/molecules/` diretamente
- **Nunca** alterar `tailwind.config.ts` — usar CSS variables do nicho

## Estrutura gerada

```tsx
// components/draft/HeroSection.tsx
import type { HeroSectionProps } from './HeroSection.types'

export function HeroSection({ title, subtitle, ctaText, ctaHref }: HeroSectionProps) {
  // Server Component por padrão
  return (
    <section aria-label="hero" className="...">
      {/* implementação */}
    </section>
  )
}
```

```tsx
// components/draft/HeroSection.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { HeroSection } from './HeroSection'

const meta: Meta<typeof HeroSection> = { component: HeroSection }
export default meta

export const Default: StoryObj<typeof HeroSection> = { args: { ... } }
export const Loading: StoryObj<typeof HeroSection> = { ... }
```

## Checklist antes de retornar
- [ ] Componente em `components/draft/`
- [ ] Types em arquivo separado `.types.ts`
- [ ] Story com mínimo 3 estados
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros
- [ ] Acessibilidade verificada
