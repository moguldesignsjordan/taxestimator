import React from 'react';
import { QuestionType, TaxFormData } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Question {
  id: keyof TaxFormData;
  label: string;
  type: QuestionType;
  required: boolean;
  helper?: string | ((data: TaxFormData) => string);
  options?: { value: string; label: string }[];
}

interface QuestionCardProps {
  question: Question;
  formData: TaxFormData;
  onDataChange: (field: keyof TaxFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  validationError: string | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  formData,
  onDataChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  validationError,
}) => {
  const value = formData[question.id] ?? '';

  const isCurrency = [
    'w2_wages',
    'federal_withheld',
    'self_employment_net',
    'unemployment',
    'student_loan_interest',
    'childcare_expenses',
  ].includes(question.id);

  /* ============================================================
     INPUT ELEMENT
  ============================================================ */
  const renderInput = () => {
    switch (question.type) {
      case QuestionType.SELECT:
        return (
          <select
            id={question.id}
            value={value as string}
            onChange={(e) => onDataChange(question.id, e.target.value)}
            className="
              w-full bg-[#111827] text-[var(--text-color)]
              border border-[var(--border-color)] rounded-lg p-3 text-lg
              placeholder-[var(--text-color-light)] focus:ring-2
              focus:ring-[var(--primary-color)] transition
            "
          >
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <div className="relative">
            {isCurrency && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-light)] text-lg">
                $
              </span>
            )}

            <input
              type="number"
              id={question.id}
              value={value}
              onChange={(e) =>
                onDataChange(
                  question.id,
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              placeholder="0"
              className={`
                w-full bg-[#111827] text-[var(--text-color)]
                border border-[var(--border-color)] rounded-lg p-3 text-lg
                placeholder-[var(--text-color-light)]
                focus:ring-2 focus:ring-[var(--primary-color)] transition
                ${isCurrency ? 'pl-8' : ''}
              `}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center animate-fade-in-up">
      
      {/* Label */}
      <label
        htmlFor={question.id}
        className="block text-3xl font-semibold mb-3 text-[var(--text-color)]"
      >
        {question.label}
      </label>

      {/* Helper Text */}
      {question.helper && (
        <p className="text-[var(--text-color-light)] text-sm leading-relaxed mt-2 mb-6 max-w-xl mx-auto opacity-80">
          {typeof question.helper === "function"
            ? question.helper(formData)
            : question.helper}
        </p>
      )}

      {/* Input */}
      <div className="mb-6">{renderInput()}</div>

      {validationError && (
        <p className="text-red-400 mt-2">{validationError}</p>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center mt-10 w-full gap-4">
        <button
          onClick={onBack}
          disabled={isFirst}
          className="flex items-center justify-center gap-2 bg-[var(--secondary-color)]
          text-[var(--secondary-text-color)] px-6 py-3 rounded-lg hover:bg-[var(--secondary-color-hover)]
          transition disabled:opacity-40 disabled:cursor-not-allowed w-40"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          Back
        </button>

        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 bg-[var(--primary-color)]
          text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-color-hover)]
          transition w-40 font-semibold"
        >
          {isLast ? 'Review' : 'Next'}
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
