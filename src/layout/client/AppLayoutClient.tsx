// import './assets/css/styles.css';
import { Outlet } from "react-router";


import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function App() {
    return (
        <>
            <Header />
            <Outlet />
            {/*<CallButtons />*/}
            <Footer />
        </>
    );
}

export default App;
