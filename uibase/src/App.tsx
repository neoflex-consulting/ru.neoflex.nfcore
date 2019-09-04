import React, {Suspense} from 'react';
import './App.css';
import EcoreAppTrans from "./EcoreApp";

const App: React.FC = (props) => {
    return (
        <div className="App">
            <Suspense fallback={<div className="loader"/>}>
                <EcoreAppTrans {...props} appName="ReportsApp" />
            </Suspense>
        </div>
    );
};

export default App;
