import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, CustomizationGroup, SelectedOption, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';
import { NeuInput } from './neumorphic/NeuInput';

interface ItemCustomizationSheetProps {
  item: MenuItem;
  merchantName: string;
  activeHub: ServiceHub;
  language: SupportedLanguage;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialInstructions?: string
  ) => void;
  onClose: () => void;
}

export const ItemCustomizationSheet: React.FC<ItemCustomizationSheetProps> = ({
  item,
  merchantName,
  activeHub,
  language,
  onAddToCart,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(() => {
    const initial: SelectedOption[] = [];
    if (item.customizationGroups) {
      item.customizationGroups.forEach((grp) => {
        if (grp.required && grp.options.length > 0) {
          const first = grp.options[0];
          initial.push({
            groupId: grp.id,
            groupName: grp.name,
            optionId: first.id,
            optionName: first.name,
            price: first.price,
          });
        }
      });
    }
    return initial;
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleToggleOption = (
    group: CustomizationGroup,
    opt: { id: string; name: string; price: number }
  ) => {
    setValidationError(null);
    if (group.required) {
      // Single select for required group
      setSelectedOptions((prev) => [
        ...prev.filter((o) => o.groupId !== group.id),
        {
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          price: opt.price,
        },
      ]);
    } else {
      // Multi-select or optional toggle
      setSelectedOptions((prev) => {
        const exists = prev.some((o) => o.optionId === opt.id);
        if (exists) {
          return prev.filter((o) => o.optionId !== opt.id);
        } else {
          return [
            ...prev,
            {
              groupId: group.id,
              groupName: group.name,
              optionId: opt.id,
              optionName: opt.name,
              price: opt.price,
            },
          ];
        }
      });
    }
  };

  const optionsExtra = selectedOptions.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = item.price + optionsExtra;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = () => {
    if (item.customizationGroups) {
      for (const group of item.customizationGroups) {
        if (group.required) {
          const hasSelected = selectedOptions.some((o) => o.groupId === group.id);
          if (!hasSelected) {
            setValidationError(`Please select an option for: ${group.name}`);
            return;
          }
        }
      }
    }
    onAddToCart(item, quantity, selectedOptions, specialInstructions);
  };

  const displayName =
    language === 'sw' && item.nameSw
      ? item.nameSw
      : language === 'fr' && item.nameFr
      ? item.nameFr
      : item.name;

  const displayDesc =
    language === 'sw' && item.descriptionSw
      ? item.descriptionSw
      : language === 'fr' && item.descriptionFr
      ? item.descriptionFr
      : item.description;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#EEF2F9] dark:bg-[#0D1117] border-t sm:border border-[#DCE4EF] dark:border-[#1F293D] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header with Close */}
        <div className="p-4 bg-[#F8FAFF] dark:bg-[#111722] border-b border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] font-medium block">
              {merchantName}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C] dark:text-[#F0F4F8] truncate">
              {displayName}
            </h3>
          </div>
          <NeuIconButton
            size="sm"
            variant="secondary"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
          </NeuIconButton>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* Image & Description */}
          {item.image && (
            <NeuCard elevation="flat" className="h-44 w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </NeuCard>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-extrabold text-lg text-[#1A202C] dark:text-[#F0F4F8]">
                {displayName}
              </h4>
              <span className="font-mono tabular-nums text-base font-extrabold text-[#FF5A1F]">
                {formatCurrency(item.price, activeHub.currency)}
              </span>
            </div>
            {item.unitSize && (
              <span className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                Unit: {item.unitSize}
              </span>
            )}
            <p className="text-sm text-[#5A6A80] dark:text-[#8B9BB4] mt-1.5 leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold">
              {validationError}
            </div>
          )}

          {/* Customization Groups */}
          {item.customizationGroups?.map((group) => {
            const groupTitle =
              language === 'sw' && group.nameSw
                ? group.nameSw
                : language === 'fr' && group.nameFr
                ? group.nameFr
                : group.name;

            return (
              <NeuCard
                key={group.id}
                elevation="flat"
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                    {groupTitle}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5A6A80] dark:text-[#8B9BB4]">
                    {group.required ? 'Required (Lazima)' : 'Optional'}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedOptions.some(
                      (o) => o.optionId === opt.id
                    );
                    const optName =
                      language === 'sw' && opt.nameSw
                        ? opt.nameSw
                        : language === 'fr' && opt.nameFr
                        ? opt.nameFr
                        : opt.name;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleOption(group, opt)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm transition-all min-h-[44px] cursor-pointer ${
                          isSelected
                            ? 'neu-pressed border border-[#FF5A1F] text-[#1A202C] dark:text-[#F0F4F8] font-bold'
                            : 'neu-button text-[#5A6A80] dark:text-[#8B9BB4]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#FF5A1F] text-white shadow-xs'
                                : 'neu-pressed border border-[#DCE4EF] dark:border-[#1F293D]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{optName}</span>
                        </div>

                        {opt.price > 0 && (
                          <span className="font-mono tabular-nums text-[#FF5A1F] font-bold">
                            +{formatCurrency(opt.price, activeHub.currency)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </NeuCard>
            );
          })}

          {/* Special Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
              Special Instructions (Notes)
            </label>
            <NeuInput
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less salt, extra lime, packing separately..."
            />
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-4 border-t border-[#DCE4EF] dark:border-[#1F293D] bg-[#F8FAFF] dark:bg-[#111722] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4]">
              Quantity
            </span>
            <div className="flex items-center gap-1.5 neu-pressed p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-7 text-center font-bold font-mono tabular-nums text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <NeuButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
          >
            <span className="flex items-center justify-between w-full">
              <span>{t.add_to_cart}</span>
              <span className="font-mono tabular-nums font-extrabold">
                {formatCurrency(totalPrice, activeHub.currency)}
              </span>
            </span>
          </NeuButton>
        </div>
      </div>
    </div>
  );
};
