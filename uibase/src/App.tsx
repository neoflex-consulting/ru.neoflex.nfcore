import React, {Suspense} from 'react';
import './styles/App.css';
import EcoreApp from "./EcoreApp";

const App: React.FC = (props) => {
    return (
        <div>
            <Suspense fallback={<div className="loader"/>}>
                <EcoreApp {...props} />
            </Suspense>
        </div>
    );
};

export default App;
