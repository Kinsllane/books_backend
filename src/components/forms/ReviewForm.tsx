import React, { useState } from 'react';

interface ReviewFormProps {
    onSubmit: (text: string) => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
    const [reviewText, setReviewText] = useState(''); 

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reviewText.trim()) {
            onSubmit(reviewText.trim()); 
            setReviewText(''); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-content-form">
            <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Напишите вашу рецензию..."
                required
                rows={4} 
                aria-label="Текст рецензии"
            />
            <div className="form-actions">
                <button type="submit" className="submit-button">Отправить</button>
                <button type="button" onClick={onCancel} className="cancel-button">Отмена</button>
            </div>
        </form>
    );
};

export default ReviewForm;
