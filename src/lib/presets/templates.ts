import type { TemplateId } from '@/types';

export interface TemplateConfig {
  id: TemplateId;
  label: string;
  description: string;
  previewImage: string;
  available: boolean;
}

export const templates: Record<TemplateId, TemplateConfig> = {
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Clean, contemporary layout with bold typography and smooth animations',
    previewImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    available: true,
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Stripped-down elegance focused on content clarity',
    previewImage: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    available: false,
  },
  corporate: {
    id: 'corporate',
    label: 'Corporate',
    description: 'Professional and structured for business-oriented portfolios',
    previewImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    available: false,
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Expressive and visual-first for artists and creatives',
    previewImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    available: false,
  },
};

export const templateList = Object.values(templates);
