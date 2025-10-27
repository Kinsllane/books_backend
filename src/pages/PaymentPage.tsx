import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { topUpUserBalance } from '../data/appData';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { activeUser, setActiveUser } = useAuthStatus();

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState<number | null>(null); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (location.state && typeof location.state.amount === 'number') {
            setAmount(location.state.amount);
        } else {
            setErrorMessage('Сумма для пополнения не указана. Пожалуйста, попробуйте снова через профиль.');
            setTimeout(() => navigate('/my-profile'), 3000);
        }
    }, [location.state, navigate]);

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!activeUser) {
            setErrorMessage('Вы не авторизованы. Пожалуйста, войдите в систему.');
            navigate('/login');
            return;
        }

        if (amount === null || amount <= 0) {
            setErrorMessage('Некорректная сумма для пополнения.');
            return;
        }

        if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
            setErrorMessage('Пожалуйста, заполните все поля платежных реквизитов.');
            return;
        }

        const result = topUpUserBalance(activeUser.id, amount);

        if (result.success && result.user) {
            setActiveUser(result.user); 
            setSuccessMessage(`Баланс успешно пополнен на ${amount}₽! Вы будете перенаправлены в профиль.`);
            setTimeout(() => navigate('/my-profile'), 3000);
        } else {
            setErrorMessage(result.message || 'Произошла ошибка при пополнении баланса.');
        }
    };

    if (amount === null) {
        return <div className="page-message">Подготовка к оплате...</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Оплата пополнения баланса</h2>
            <p className="info-message">Сумма к оплате: <strong>{amount}₽</strong></p>

            <form onSubmit={handlePaymentSubmit} className="payment-form">
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <div className="form-group">
                    <label htmlFor="cardNumber">Номер карты:</label>
                    <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required
                        aria-label="Номер банковской карты"
                    />
                </div>

                <div className="form-group half-width-group">
                    <div className="half-width-item">
                        <label htmlFor="expiryDate">Срок действия:</label>
                        <input
                            type="text"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="ММ/ГГ"
                            required
                            aria-label="Срок действия карты"
                        />
                    </div>
                    <div className="half-width-item">
                        <label htmlFor="cvv">CVV:</label>
                        <input
                            type="text"
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="XXX"
                            required
                            aria-label="CVV код карты"
                        />
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={!!successMessage}>Оплатить {amount}₽</button>
            </form>
        </div>
    );
};

export default PaymentPage;
