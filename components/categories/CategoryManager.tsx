import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Category } from '../../entities/all';
import { Category as CategoryType } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Trash2, Pencil, Utensils, Car, Home, Tshirt, GraduationCap, Heart, ShoppingBag, Tag, Briefcase, Gift, PiggyBank, Heartbeat, Dog, Receipt, Landmark, FileText, Baby, Film, Plane, Lightbulb, ShoppingCart, Wrench, Laptop, Sparkles, TrendingUp, TrendingDown, Wallet, CreditCard, Users, Calendar, Settings, Target, Palette, ChevronRight, Search, AlertCircle, CheckCircle } from '../icons';

const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Utensils, Car, Home, Tshirt, GraduationCap, Heart, ShoppingBag, Tag,
  Briefcase, Gift, PiggyBank, Heartbeat, Dog, Receipt, Landmark, FileText,
  Baby, Film, Plane, Lightbulb, ShoppingCart, Wrench, Laptop, Sparkles,
  TrendingUp, TrendingDown, Wallet, CreditCard, Users, Calendar, Settings, Target, Palette, Pencil
};

const iconNames = Object.keys(ICONS);

const COLOR_SWATCHES = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#78716C',
];

type FormState = {
  mode: 'add' | 'edit';
  type: 'main' | 'sub';
  data: Partial<CategoryType>;
};

const renderIcon = (iconName: string, props: React.SVGProps<SVGSVGElement> = {}) => {
  const IconComponent = ICONS[iconName] || Tag;
  return <IconComponent {...props} />;
};

interface CategoryFormProps {
    formState: FormState;
    mainCategories: CategoryType[];
    onFormStateChange: (newState: FormState) => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
    formState,
    mainCategories,
    onFormStateChange, 
    onSave, 
    onCancel,
}) => {
    const isMainCategoryForm = formState.type === 'main';
    const [isIconPickerExpanded, setIsIconPickerExpanded] = useState(false);
    const [isColorPickerExpanded, setIsColorPickerExpanded] = useState(false);
    
    // --- Autocomplete State ---
    const [autocompleteValue, setAutocompleteValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    // Sync autocomplete input with parentId from formState
    useEffect(() => {
        if (formState.data.parentId) {
            const parent = mainCategories.find(c => c.id === formState.data.parentId);
            if (parent) {
                setAutocompleteValue(parent.name);
            }
        } else {
            setAutocompleteValue('');
        }
    }, [formState.data.parentId, mainCategories]);

    // Filter categories for suggestions
    const filteredMainCategories = useMemo(() => {
        if (!autocompleteValue || mainCategories.find(c => c.name.toLowerCase() === autocompleteValue.toLowerCase())) {
            return [];
        }
        return mainCategories.filter(cat =>
            cat.name.toLowerCase().includes(autocompleteValue.toLowerCase())
        );
    }, [autocompleteValue, mainCategories]);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDataChange = (field: keyof CategoryType, value: any) => {
        onFormStateChange({
            ...formState,
            data: { ...formState.data, [field]: value },
        });
    };

    const handleParentCategoryChange = (parentId: string) => {
        const selectedParent = mainCategories.find(c => c.id === parentId);
        if (selectedParent) {
            onFormStateChange({
                ...formState,
                data: {
                    ...formState.data,
                    parentId: selectedParent.id,
                    type: selectedParent.type,
                    icon: formState.data.icon || selectedParent.icon,
                    color: formState.data.color || selectedParent.color,
                },
            });
        }
    };
    
    // --- Autocomplete Handlers ---
    const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAutocompleteValue(value);
        setShowSuggestions(true);
        
        const matchingCategory = mainCategories.find(c => c.name.toLowerCase() === value.toLowerCase());
        if (!matchingCategory && formState.data.parentId) {
             onFormStateChange({
                ...formState,
                data: {
                    ...formState.data,
                    parentId: undefined,
                    icon: formState.data.icon,
                    color: formState.data.color,
                },
            });
        }
    };

    const handleSuggestionClick = (category: CategoryType) => {
        setAutocompleteValue(category.name);
        setShowSuggestions(false);
        handleParentCategoryChange(category.id);
    };

    const getTitle = () => {
        if (formState.mode === 'edit') {
            return isMainCategoryForm ? 'Editar Categoria' : 'Editar Subcategoria';
        }
        return isMainCategoryForm ? 'Nova Categoria' : 'Nova Subcategoria';
    };

    const title = getTitle();

    return (
      <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700 transition-all duration-300 mt-4 mb-6`}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={onSave} className="space-y-4">
            
          {formState.type === 'sub' && (
            <div ref={autocompleteRef}>
              <label htmlFor="parent-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria Principal *</label>
              <div className="relative">
                <Input
                  id="parent-category"
                  value={autocompleteValue}
                  onChange={handleAutocompleteChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Digite para buscar a categoria principal..."
                  required
                  autoComplete="off"
                  disabled={formState.mode === 'edit' || (formState.mode === 'add' && !!formState.data.parentId)}
                />
                {formState.mode !== 'edit' && showSuggestions && filteredMainCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredMainCategories.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleSuggestionClick(cat)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da {isMainCategoryForm ? 'Categoria' : 'Subcategoria'}</label>
            <Input
              id="category-name"
              value={formState.data.name || ''}
              onChange={(e) => handleDataChange('name', e.target.value)}
              placeholder={isMainCategoryForm ? 'Ex: Alimentação' : 'Ex: Restaurantes'}
              required
              disabled={formState.type === 'sub' && !formState.data.parentId}
            />
          </div>

          <div className={`space-y-4 ${formState.type === 'sub' && !formState.data.parentId ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Escolha uma cor</label>
                <div className={`flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ease-in-out ${isColorPickerExpanded ? 'max-h-96' : 'max-h-9 md:max-h-96'}`}>
                    {COLOR_SWATCHES.map(color => {
                        const isSelected = formState.data.color === color;
                        return (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleDataChange('color', color)}
                                className={`w-8 h-8 rounded-full border flex-shrink-0 transition-transform ${
                                    isSelected
                                    ? `border-gray-800 dark:border-gray-200 scale-110`
                                    : `border-transparent`
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select ${color}`}
                            />
                        );
                    })}
                </div>
                 {COLOR_SWATCHES.length > 7 && (
                    <div className="flex justify-center mt-3 md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsColorPickerExpanded(!isColorPickerExpanded)}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                        >
                            {isColorPickerExpanded ? 'Ver menos' : 'Ver mais'}
                        </button>
                    </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Escolha um ícone</label>
                 <div className={`flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ease-in-out ${isIconPickerExpanded ? 'max-h-96' : 'max-h-11 md:max-h-96'}`}>
                    {iconNames.map(iconName => {
                        const isSelected = formState.data.icon === iconName;
                        return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => handleDataChange('icon', iconName) }
                              className={`flex items-center justify-center p-2 rounded-md border transition-colors flex-shrink-0 w-10 h-10 ${
                                  isSelected 
                                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                                    : `bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600`
                                }`}
                              aria-label={`Select icon ${iconName}`}
                            >
                                {renderIcon(iconName, { 
                                    className: `w-5 h-5 ${!isSelected ? 'text-gray-700 dark:text-gray-300' : ''}`,
                                    style: {
                                        color: isSelected ? (formState.data.color || '#9ca3af') : undefined
                                    }
                                })}
                            </button>
                        );
                    })}
                </div>
                 {iconNames.length > 7 && (
                    <div className="flex justify-center mt-3 md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsIconPickerExpanded(!isIconPickerExpanded)}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                        >
                            {isIconPickerExpanded ? 'Ver menos' : 'Ver mais'}
                        </button>
                    </div>
                )}
              </div>
            </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {formState.mode === 'add' ? 'Adicionar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    );
};

export const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<FormState | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    
    const topFormRef = useRef<HTMLDivElement>(null);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [parentToScrollTo, setParentToScrollTo] = useState<string | null>(null);

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error',
        title: '',
        text: ''
    });

    const [deleteConfirmationState, setDeleteConfirmationState] = useState<{
        isOpen: boolean;
        categoryToDelete: CategoryType | null;
    }>({ isOpen: false, categoryToDelete: null });


    useEffect(() => {
        loadCategories();
    }, []);
    
    const toggleExpand = useCallback((id: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        if (parentToScrollTo) {
            const element = categoryRefs.current[parentToScrollTo];
            if (element) {
                if (!expandedCategories.has(parentToScrollTo)) {
                    toggleExpand(parentToScrollTo);
                }
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
            setParentToScrollTo(null);
        }
    }, [parentToScrollTo, expandedCategories, toggleExpand]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await Category.list();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
        setLoading(false);
    };

    const { mainCategories, subCategoriesByParent } = useMemo(() => {
        const main: CategoryType[] = [];
        const sub: { [key: string]: CategoryType[] } = {};

        categories.forEach(cat => {
            if (cat.parentId) {
                if (!sub[cat.parentId]) {
                    sub[cat.parentId] = [];
                }
                sub[cat.parentId].push(cat);
            } else {
                main.push(cat);
            }
        });
        return { mainCategories: main, subCategoriesByParent: sub };
    }, [categories]);
    
    const filteredAndSortedMainCategories = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerCaseSearchTerm) {
            return mainCategories.sort((a, b) => a.name.localeCompare(b.name));
        }

        const filtered = mainCategories.filter(mainCat => {
            if (mainCat.name.toLowerCase().includes(lowerCaseSearchTerm)) {
                return true;
            }
            const subCats = subCategoriesByParent[mainCat.id] || [];
            return subCats.some(subCat =>
                subCat.name.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [searchTerm, mainCategories, subCategoriesByParent]);


    const handleFormCancel = () => {
        setFormState(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState) return;
    
        if ((formState.type === 'main' || formState.data.parentId) && (!formState.data.icon || !formState.data.color)) {
            setModalState({ isOpen: true, type: 'error', title: 'Atenção', text: 'Por favor, selecione um ícone e uma cor.' });
            return;
        }
    
        if (formState.type === 'sub' && !formState.data.parentId) {
            setModalState({ isOpen: true, type: 'error', title: 'Atenção', text: 'Por favor, selecione uma categoria principal.' });
            return;
        }
    
        const newNameTrimmed = formState.data.name?.trim();
        if (!newNameTrimmed) {
            setModalState({ isOpen: true, type: 'error', title: 'Nome Inválido', text: 'O nome da categoria não pode estar em branco.' });
            return;
        }
    
        const normalize = (str: string) => str.trim().toLowerCase();
        const newNameNormalized = normalize(newNameTrimmed);
    
        const checkDuplicate = (existingName: string): boolean => {
            const existingNormalized = normalize(existingName);
    
            // Exact match
            if (newNameNormalized === existingNormalized) return true;
    
            // Simple plural/singular check (e.g., "carro" vs "carros")
            if (newNameNormalized.endsWith('s') && newNameNormalized.slice(0, -1) === existingNormalized) return true;
            if (existingNormalized.endsWith('s') && existingNormalized.slice(0, -1) === newNameNormalized) return true;
            
            return false;
        };
    
        const isGloballyDuplicate = categories.some(
            (cat) => cat.id !== formState.data.id && checkDuplicate(cat.name)
        );

        if (isGloballyDuplicate) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Nome Duplicado',
                text: `Uma categoria ou subcategoria com nome similar a "${newNameTrimmed}" já existe. Por favor, escolha outro nome.`,
            });
            return;
        }
    
        try {
            const dataToSave = { ...formState.data, name: newNameTrimmed };
    
            if (formState.mode === 'add') {
                await Category.create(dataToSave);
                setModalState({ isOpen: true, type: 'success', title: 'Sucesso!', text: 'Categoria adicionada com sucesso.' });
            } else if (dataToSave.id) {
                await Category.update(dataToSave.id, dataToSave);
                setModalState({ isOpen: true, type: 'success', title: 'Sucesso!', text: 'Categoria atualizada com sucesso.' });
            }
            handleFormCancel();
            await loadCategories();
        } catch (error) {
            console.error("Failed to save category:", error);
            setModalState({ isOpen: true, type: 'error', title: 'Erro', text: 'Não foi possível salvar a categoria.' });
        }
    };
    
    const handleDelete = (category: CategoryType) => {
        setDeleteConfirmationState({ isOpen: true, categoryToDelete: category });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmationState.categoryToDelete) return;
        try {
            await Category.delete(deleteConfirmationState.categoryToDelete.id);
            setModalState({ isOpen: true, type: 'success', title: 'Excluído!', text: 'A categoria foi excluída com sucesso.' });
            await loadCategories();
        } catch (error) {
            console.error("Failed to delete category:", error);
            setModalState({ isOpen: true, type: 'error', title: 'Erro', text: 'Não foi possível excluir a categoria.' });
        } finally {
            setDeleteConfirmationState({ isOpen: false, categoryToDelete: null });
        }
    };

    const handleAddMainCategory = () => {
        setFormState({
            mode: 'add',
            type: 'main',
            data: { name: '', type: 'despesa', color: '#6366F1', icon: 'Tag' },
        });
        setTimeout(() => topFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    };

    const handleAddNewSubCategory = () => {
        setFormState({
            mode: 'add',
            type: 'sub',
            data: { name: '', type: 'despesa' },
        });
         setTimeout(() => topFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    };
    
    const handleFormStateChange = (newState: FormState) => {
        if (formState?.type === 'sub' && !formState.data.parentId && newState.type === 'sub' && newState.data.parentId) {
            setParentToScrollTo(newState.data.parentId);
        }
        setFormState(newState);
    };

    const handleAddSubCategoryFromParent = (parent: CategoryType) => {
        setFormState({
            mode: 'add',
            type: 'sub',
            data: {
                name: '',
                parentId: parent.id,
                type: parent.type,
                icon: parent.icon,
                color: parent.color,
            }
        });
    };

    const handleEdit = (category: CategoryType, type: 'main' | 'sub') => {
        setFormState({ mode: 'edit', type, data: { ...category } });
    };

    const getDeleteMessage = () => {
        if (!deleteConfirmationState.categoryToDelete) return '';
        const category = deleteConfirmationState.categoryToDelete;
        const isMainCategory = !category.parentId;
        const subCats = subCategoriesByParent[category.id] || [];

        if (isMainCategory && subCats.length > 0) {
            return `Tem certeza que deseja remover a categoria "${category.name}"? Todas as ${subCats.length} subcategorias associadas também serão removidas. Esta ação não pode ser desfeita.`;
        }
        return `Tem certeza que deseja remover a categoria "${category.name}"? Esta ação não pode ser desfeita.`;
    };
    
    if (loading) {
        return <p>Carregando categorias...</p>;
    }

    return (
        <div className="space-y-6">
            {!formState && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleAddMainCategory} className="flex-1 bg-blue-50 text-blue-700 border-2 border-dashed border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/40">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                    </Button>
                    <Button onClick={handleAddNewSubCategory} className="flex-1 bg-purple-50 text-purple-700 border-2 border-dashed border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/40">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Subcategoria
                    </Button>
                </div>
            )}

            <div ref={topFormRef}>
                {formState && !formState.data.parentId && (
                    <CategoryForm 
                        formState={formState}
                        mainCategories={mainCategories}
                        onFormStateChange={handleFormStateChange}
                        onSave={handleSave}
                        onCancel={handleFormCancel}
                    />
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl text-gray-900 dark:text-gray-50 border-b dark:border-gray-700 pb-2">
                    <span className="font-normal">Categorias</span> <span className="font-bold">atuais</span>
                </h3>
                
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por categoria ou subcategoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                </div>
                
                {filteredAndSortedMainCategories.length === 0 && !loading && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p>{searchTerm ? 'Nenhuma categoria encontrada para sua busca.' : 'Nenhuma categoria principal cadastrada.'}</p>
                    </div>
                )}

                {filteredAndSortedMainCategories.map(cat => {
                    const isManuallyExpanded = expandedCategories.has(cat.id);
                    const allSubCats = subCategoriesByParent[cat.id] || [];

                    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
                    const isSearching = lowerCaseSearchTerm.length > 0;
                    
                    let subCatsToRender = allSubCats;
                    let isEffectivelyExpanded = isManuallyExpanded;

                    if (isSearching) {
                        const mainCategoryMatches = cat.name.toLowerCase().includes(lowerCaseSearchTerm);
                        const matchingSubCats = allSubCats.filter(sub => 
                            sub.name.toLowerCase().includes(lowerCaseSearchTerm)
                        );

                        if (!mainCategoryMatches && matchingSubCats.length > 0) {
                            // Case: Search matches sub-category only. Force expand and show only matching subs.
                            subCatsToRender = matchingSubCats;
                            isEffectivelyExpanded = true;
                        } else if (mainCategoryMatches) {
                            // Case: Search matches main category. Show all subs, but respect manual expansion.
                            subCatsToRender = allSubCats;
                            isEffectivelyExpanded = isManuallyExpanded;
                        } else {
                            // This case shouldn't be reached due to the main filter, but good for safety.
                            subCatsToRender = [];
                        }
                    }
                    
                    return (
                    <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el }} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 w-full">
                                {(subCategoriesByParent[cat.id]?.length || 0) > 0 ? (
                                    <button 
                                      onClick={() => toggleExpand(cat.id)} 
                                      className="p-2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                      aria-expanded={isEffectivelyExpanded}
                                      aria-label={`Expandir ${cat.name}`}
                                    >
                                        <ChevronRight className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isEffectivelyExpanded ? 'rotate-90' : ''}`} />
                                    </button>
                                ) : (
                                    <div className="w-8 h-8"></div> // Spacer for alignment
                                )}
                                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color }}>
                                    {renderIcon(cat.icon, { className: "w-5 h-5 text-white" })}
                                </div>
                                <span className="font-semibold">{cat.name}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full justify-end">
                                <Button 
                                    onClick={() => handleAddSubCategoryFromParent(cat)} 
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/60 dark:text-blue-400 px-3 py-1.5 text-xs font-medium rounded-md"
                                >
                                    <Plus className="w-3 h-3 mr-1.5" />
                                    Subcategoria
                                </Button>
                                <Button 
                                    onClick={() => handleEdit(cat, 'main')} 
                                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/60 dark:text-yellow-400 px-3 py-1.5 text-xs font-medium rounded-md"
                                >
                                    <Pencil className="w-3 h-3 mr-1.5" />
                                    Editar
                                </Button>
                                <Button 
                                    onClick={() => handleDelete(cat)} 
                                    className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-3 py-1.5 text-xs font-medium rounded-md"
                                >
                                    <Trash2 className="w-3 h-3 mr-1.5" />
                                    Excluir
                                </Button>
                            </div>
                        </div>

                        {formState && formState.data.parentId === cat.id && (
                           <CategoryForm 
                                formState={formState}
                                mainCategories={mainCategories}
                                onFormStateChange={setFormState}
                                onSave={handleSave}
                                onCancel={handleFormCancel}
                            />
                        )}

                        {isEffectivelyExpanded && subCatsToRender.length > 0 && (
                            <div className="relative pl-8 sm:pl-20 mt-3 space-y-2">
                                <div 
                                    className="absolute left-4 sm:left-14 -top-3 h-3 w-[2px] bg-gray-300 dark:bg-gray-600"
                                    aria-hidden="true"
                                />
                                {subCatsToRender.map((subCat, index, array) => {
                                    const isLast = index === array.length - 1;
                                    return (
                                        <div key={subCat.id} className="relative">
                                            {/* Connector lines */}
                                            <div 
                                                className={`absolute -left-4 sm:-left-6 top-0 w-[2px] bg-gray-300 dark:bg-gray-600 ${isLast ? 'h-[21px]' : 'h-full'}`}
                                                aria-hidden="true"
                                            ></div>
                                            <div 
                                                className="absolute -left-4 sm:-left-6 top-[21px] h-[2px] w-4 sm:w-6 bg-gray-300 dark:bg-gray-600"
                                                aria-hidden="true"
                                            ></div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color }}>
                                                        {renderIcon(cat.icon, { className: "w-4 h-4 text-white" })}
                                                    </div>
                                                    <span className="text-sm">{subCat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                                    <Button 
                                                        onClick={() => handleEdit(subCat, 'sub')} 
                                                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/60 dark:text-yellow-400 px-3 py-1.5 text-xs font-medium rounded-md"
                                                    >
                                                        <Pencil className="w-3 h-3 mr-1.5" />
                                                        Editar
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(subCat)} 
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-3 py-1.5 text-xs font-medium rounded-md"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1.5" />
                                                        Excluir
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )})}
            </div>
            
            {/* Generic Notification Modal */}
            {modalState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95 text-center">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${modalState.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {modalState.type === 'success' ? (<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />) : (<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />)}
                    </div>
                    <div className="mt-3"><h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{modalState.title}</h3><div className="mt-2"><p className="text-sm text-gray-600 dark:text-gray-300">{modalState.text}</p></div></div>
                    <div className="mt-6 sm:mt-8"><Button type="button" onClick={() => setModalState({ ...modalState, isOpen: false })} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">Fechar</Button></div>
                </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95 text-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="mt-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                            Excluir Categoria
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {getDeleteMessage()}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-center gap-3">
                    <Button type="button" onClick={() => setDeleteConfirmationState({ isOpen: false, categoryToDelete: null })} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                        Cancelar
                    </Button>
                    <Button type="button" onClick={confirmDelete} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sim, Excluir
                    </Button>
                    </div>
                </div>
                </div>
            )}

        </div>
    );
};