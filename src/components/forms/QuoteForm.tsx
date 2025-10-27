import React, { useState } from 'react';

interface QuoteFormProps {
    onSubmit: (text: string) => void;
    onCancel: () => void;
}


const QuoteForm: React.FC<QuoteFormProps> = ({ onSubmit, onCancel }) => {
    const [quoteText, setQuoteText] = useState(''); 

    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quoteText.trim()) { 
            onSubmit(quoteText.trim()); 
            setQuoteText(''); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-content-form">
            <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Введите цитату..."
                required
                rows={4} 
                aria-label="Текст цитаты"
            />
            <div className="form-actions">
                <button type="submit" className="submit-button">Отправить</button>
                <button type="button" onClick={onCancel} className="cancel-button">Отмена</button>
            </div>
        </form>
    );
};
export default QuoteForm;
