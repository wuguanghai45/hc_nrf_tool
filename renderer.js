const update_vscode = document.getElementById('update_vscode')
update_vscode.addEventListener('click', () => {
    window.electronAPI.updateVscode()
});


const update_sdk = document.getElementById('update_sdk')
update_sdk.addEventListener('click', () => {
    window.electronAPI.updateSdk()
});

window.electronAPI.handleStdout((event, value) => {
    document.getElementById('update_sdk_stdout').innerText = value.updateSDK;
    document.getElementById('update_vscode_stdout').innerText = value.updateVscode;
})