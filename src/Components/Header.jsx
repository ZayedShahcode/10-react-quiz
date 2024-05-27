import ReactLogo from './react.svg';
export function Header() {
    return (
        <header className="app-header">
            <img src={ReactLogo} alt="React logo" />
            <h1>The React Quiz</h1>
        </header>

    )
}