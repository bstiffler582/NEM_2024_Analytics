// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.760.59/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    (function (Extensions) {
        Extensions.ReadSymbolAsync = (expression) => {
            return new Promise((resolve, reject) => {
                TcHmi.Symbol.readEx2(expression, function (data) {
                    if (data.error === TcHmi.Errors.NONE)
                        resolve(data.value);
                    else
                        return reject(data.error);
                });
            })
        }
    })(Extensions = TcHmi.Extensions || (TcHmi.Extensions = {}));
})(TcHmi);
