import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, CustomizationGroup, SelectedOption, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

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
    // Pre-select default required options if any
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

  // Calculate unit total with options
  const optionsExtra = selectedOptions.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = item.price + optionsExtra;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = () => {
    // Validate required groups
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
      <div className="w-full max-w-lg bg-white dark:bg-[#222222] border-t sm:border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-t-[24px] sm:rounded-[24px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header with Close */}
        <div className="p-4 border-b border-[#E7E4DD] dark:border-[#3A3A3A] flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-xs text-[#707070] dark:text-[#B7B7B7] font-medium block">
              {merchantName}
            </span>
            <h3 className="font-bold text-base sm:text-lg text-[#242424] dark:text-white truncate">
              {displayName}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-[#F1F0EB] dark:bg-[#303030] flex items-center justify-center text-[#242424] dark:text-white hover:bg-[#E7E4DD] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* Image & Description */}
          {item.image && (
            <div className="h-44 w-full rounded-2xl overflow-hidden bg-[#F1F0EB] dark:bg-[#303030]">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-bold text-lg text-[#242424] dark:text-white">
                {displayName}
              </h4>
              <span className="font-mono tabular-nums text-base font-bold text-[#FF8A00]">
                {formatCurrency(item.price, activeHub.currency)}
              </span>
            </div>
            {item.unitSize && (
              <span className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                Unit: {item.unitSize}
              </span>
            )}
            <p className="text-sm text-[#707070] dark:text-[#B7B7B7] mt-1.5 leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
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
              <div
                key={group.id}
                className="p-3.5 rounded-2xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#242424] dark:text-white">
                    {groupTitle}
                  </span>
                  <span className="text-[11px] font-semibold text-[#707070] dark:text-[#B7B7B7]">
                    {group.required ? 'Required (Lazima)' : 'Optional'}
                  </span>
                </div>

                <div className="space-y-1.5">
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs sm:text-sm transition-all min-h-[44px] ${
                          isSelected
                            ? 'bg-white dark:bg-[#222222] border-[#FF8A00] text-[#242424] dark:text-white font-semibold shadow-xs'
                            : 'bg-transparent border-[#E7E4DD] dark:border-[#3A3A3A] text-[#707070] dark:text-[#B7B7B7]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                                : 'border-[#909090]'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{optName}</span>
                        </div>

                        {opt.price > 0 && (
                          <span className="font-mono tabular-nums text-[#FF8A00]">
                            +{formatCurrency(opt.price, activeHub.currency)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7]">
              Special Instructions (Notes)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less salt, extra lime, packing separately..."
              className="w-full h-11 px-3 text-sm rounded-xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] text-[#242424] dark:text-white outline-none focus:border-[#FF8A00]"
            />
          </div>
        </div>

        {/* Bottom Sticky Action Bar: Quantity & Full-Width 52px Add Button */}
        <div className="p-4 border-t border-[#E7E4DD] dark:border-[#3A3A3A] bg-white dark:bg-[#222222] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7]">
              Quantity
            </span>
            <div className="flex items-center gap-3 bg-[#F1F0EB] dark:bg-[#303030] p-1 rounded-xl">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#222222] flex items-center justify-center text-[#242424] dark:text-white shadow-xs active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold font-mono tabular-nums text-sm text-[#242424] dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#222222] flex items-center justify-center text-[#242424] dark:text-white shadow-xs active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full h-[52px] rounded-xl bg-[#FF8A00] hover:bg-[#E87900] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-between px-5 shadow-md transition-all"
          >
            <span>{t.add_to_cart}</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(totalPrice, activeHub.currency)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
