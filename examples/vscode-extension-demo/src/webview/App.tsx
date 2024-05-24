import './App.css';
import { useVscTheme, vscColorThemeOptions } from './hooks/use-vsc-theme';
function App() {
    // 主题
    const [theme, setTheme] = useVscTheme();
    const onColortThemeInput = (newTheme: string) => {
        setTimeout(() => setTheme(newTheme));
    };

    return (
        <>
            <div className="example-block">
                <h2>主题获取、监听和设置演示</h2>
                <label htmlFor="color-theme-select">
                    请选择 Vscode 的主题:{' '}
                </label>
                <select
                    id="color-theme-select"
                    value={theme}
                    onInput={(evt) =>
                        onColortThemeInput(evt.currentTarget.value)
                    }
                >
                    {vscColorThemeOptions.map(({ value, label }) => {
                        return <option value={value}>{label}</option>;
                    })}
                </select>
            </div>
        </>
    );
}

export default App;
