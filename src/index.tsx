   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { BrowserRouter } from 'react-router-dom';
   import App from './App';
   import { UserAuthProvider } from './context/UserAuthContext';

   import './styles/main.css'; 

   const rootElement = document.getElementById('root');

   if (rootElement) {
       const root = ReactDOM.createRoot(rootElement);
       root.render(
           <React.StrictMode>
               <BrowserRouter>
                   <UserAuthProvider>
                       <App />
                   </UserAuthProvider>
               </BrowserRouter>
           </React.StrictMode>
       );
   } else {
       console.error("Root element with ID 'root' not found in the document.");
   }
   