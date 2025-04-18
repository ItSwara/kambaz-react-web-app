import  { useState } from "react";
export default function Counter() {
    const [count, setCount] = useState(7);
    console.log(count);
    return (
        <div id="wd-counter-use-state">
            <h2>Counter: {count}</h2>
            <button type="button" className="btn btn-success"
                onClick={() => { setCount(count + 1); }}
                id="wd-counter-up-click">
                Up
            </button>
            &nbsp;
            <button type="button" className="btn btn-danger"
                onClick={() => { setCount(count - 1); }}
                id="wd-counter-down-click">
                Down
            </button>
            <hr />
        </div>
    );
}