const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const shell = require('shelljs'); // 需要安装
const os = require('os');
const fs = require("fs");


let states = {
    isSDKupdateing: false,
    isUpdateVscode: false,
}

const stdouts = {
    updateSDK: "",
    updateVscode: "",
}

let mainWindow;

function createWindow () {
   mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  ipcMain.on('update-sdk', () => {
    console.log("update-sdk");
    if(!states.isSDKupdateing) {
        states.isSDKupdateing = true;
        stdouts.updateSDK = "";
        mainWindow.webContents.send('stdout-change', stdouts); 
        updateSdk();
    }
  })

  ipcMain.on('update-vscode', () => {
    console.log("update-vscode");
    if(!states.isUpdateVscode) {
        states.isUpdateVscode = true;
        updateVscode();
    }
  })


  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


function updateSdk() {
    //判断系统
    const platform = os.platform();

    if(platform == "win32"){
        //windows
        console.log("update SDK win32");
        updateWin32Sdk();
    }else if(platform == "darwin"){
        //mac
        console.log("update SDK darwin");
        updateMacSdk();
    }else if(platform == "linux"){
        //linux
        updateLinuxSdk("update SDK linux");
    }else{
        console.log("other");
    }
}

function updateWin32Sdk() {
    //shell.env["PATH"] = 'C:\\ncs\\toolchains\\v2.3.0\\bin;C:\\ncs\\toolchains\\v2.3.0\\opt\\bin\\Scripts;C:\\ncs\\toolchains\\v2.3.0\\opt\\bin' // 设置对应SDK的west和python等路径
    shell.config.execPath = shell.which('node').toString();
    shell.cd("c:\\ncs\\v2.3.0"); // 进入Zephyr workspace
    shell.exec("west update");
}

function updateMacSdk() {
    const westYmlPath = path.join(__dirname, 'ncs_extend_file', 'west.yml');
    const sdkWestYmlPath = "/opt/nordic/ncs/v2.3.0/nrf/west.yml";

    fs.copyFileSync(westYmlPath, sdkWestYmlPath); 

    shell.config.execPath = shell.which('node').toString();
    shell.config.verbose = true;
    shell.cd("/opt/nordic/ncs/v2.3.0");
    let westShell = shell.exec("west update", {async:true})

    westShell.stdout.on('data', function(data) {
        // console.log("data", data)
        stdouts.updateSDK += data;
        mainWindow.webContents.send('stdout-change', stdouts);
    });

    westShell.stdout.on('end', function() {
        stdouts.updateSDK += "west update end";
        // console.log("end")
        mainWindow.webContents.send('stdout-change', stdouts);
        states.isSDKupdateing = false;
    });


}

function updateLinuxSdk() {
    console.log("updateLinuxSdk");
}


function updateVscode() {
  let extensionPath;
  switch(os.type()) {
    case 'Windows_NT':
        extensionPath = path.join(os.homedir(), '.vscode', 'extensions', 'nordic-semiconductor.nrf-connect-2023.2.56-darwin-arm64', 'dist', 'extension.js');
        break;
    case 'Darwin':
        extensionPath = path.join(os.homedir(), '.vscode', 'extensions', 'nordic-semiconductor.nrf-connect-2023.2.56-darwin-arm64', 'dist', 'extension.js');
        break;
    case 'Linux':
        extensionPath = path.join(os.homedir(), '.vscode', 'extensions', 'nordic-semiconductor.nrf-connect-2023.2.56-darwin-arm64', 'dist', 'extension.js');
        break;
    default:
        console.log('Unknown OS type');
  }

  const nordicExtensionJsPath = path.join(__dirname, 'vscode_extend_file', 'extension.js');
  fs.copyFileSync(nordicExtensionJsPath, extensionPath);
  states.isUpdateVscode = false;
  stdouts.updateVscode = "update success";
  mainWindow.webContents.send('stdout-change', stdouts); 
}