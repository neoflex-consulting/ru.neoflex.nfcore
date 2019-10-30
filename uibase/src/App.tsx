import React, {Suspense} from 'react';
import './styles/App.css';
import EcoreAppTrans from "./EcoreApp";

const App: React.FC = (props) => {
    return (
        <div className="App">
            <Suspense fallback={<div className="loader"/>}>
                <EcoreAppTrans {...props} />
            </Suspense>
        </div>
    );
};

export default App;
