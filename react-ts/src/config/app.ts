const app = {
    ENV: String(process.env.REACT_APP_ENV),
    TIMEZONE: String(process.env.REACT_APP_TIMEZONE),
    DEFAULT_LOCALE: String(process.env.REACT_APP_DEFAULT_LOCALE),
    API_BASE: String(process.env.REACT_APP_API_BASE),
    API_VERSION: String(process.env.REACT_APP_API_VERSION),
}

export default app
