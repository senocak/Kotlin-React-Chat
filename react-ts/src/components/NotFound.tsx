import React from 'react'
import App from "./App";

function NotFound(): React.JSX.Element {
    return <>
        <App/>
        <section>
            <h2> 404: Page not found</h2>
            <p> 😕 Whoops! I've misplaced that URL or it's pointing to something that doesn't exist. If you think this is an error,</p>
        </section>
    </>
}
export default NotFound