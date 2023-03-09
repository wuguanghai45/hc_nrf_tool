const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const os = require('os');
const fs = require("fs");
const log = require('electron-log');
const { exec } = require('child_process')

log.initialize({ preload: true });

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
    log.info("update-sdk");
    if(!states.isSDKupdateing) {
        states.isSDKupdateing = true;
        stdouts.updateSDK = "";
        mainWindow.webContents.send('stdout-change', stdouts); 
        updateSdk();
    }
  })

  ipcMain.on('update-vscode', () => {
    log.info("update-vscode");
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
        log.info("update SDK win32");
        updateWin32Sdk();
    }else if(platform == "darwin"){
        //mac
        log.info("update SDK darwin");
        updateMacSdk();
    }else if(platform == "linux"){
        //linux
        updateLinuxSdk("update SDK linux");
    }else{
        log.info("other");
    }
}

function updateWin32Sdk() {
    const PATH = 'C:\\ncs\\toolchains\\v2.3.0\\bin;C:\\ncs\\toolchains\\v2.3.0\\opt\\bin\\Scripts;C:\\ncs\\toolchains\\v2.3.0\\opt\\bin' // 设置对应SDK的west和python等路径
    const westYmlPath = path.join(__dirname, 'ncs_extend_file', 'west.yml');
    const sdkWestYmlPath = "C:\\ncs\\toolchains\\v2.3.0\\nrf\\west.yml";
    log.info("updateMacSdk");
    log.info("westYmlPath", westYmlPath);
    log.info("sdkWestYmlPath", sdkWestYmlPath);

    fs.copyFileSync(westYmlPath, sdkWestYmlPath); 
    log.info("copy west.yml success");

    log.info("run west update");

    //let westShell = exec("cd /opt/nordic/ncs/v2.3.0 && west update")
    let westShell = exec("cd /opt/nordic/ncs/v2.3.0 && west update", {
        env: {
            PATH,
        }
    }, (error, stdout, stderr) => {
        log.info("run west shell error", error);
        log.info("run west shell stderr", stderr);
    });

    westShell.stdout.on('data', function(data) {
        log.info("data", data);
        stdouts.updateSDK += data;
        mainWindow.webContents.send('stdout-change', stdouts);
    });

    westShell.stdout.on('end', function(data) {
        stdouts.updateSDK += "west update end";
        log.info("end", data);
        mainWindow.webContents.send('stdout-change', stdouts);
        states.isSDKupdateing = false;
    });
}

function updateMacSdk() {
    const westYmlPath = path.join(__dirname, 'ncs_extend_file', 'west.yml');
    const sdkWestYmlPath = "/opt/nordic/ncs/v2.3.0/nrf/west.yml";
    log.info("updateMacSdk");
    log.info("westYmlPath", westYmlPath);
    log.info("sdkWestYmlPath", sdkWestYmlPath);

    fs.copyFileSync(westYmlPath, sdkWestYmlPath); 
    log.info("copy west.yml success");

    log.info("run west update");

    //let westShell = exec("cd /opt/nordic/ncs/v2.3.0 && west update")
    let westShell = exec("cd /opt/nordic/ncs/v2.3.0 && west update", {
        env: {
            PATH: "/usr/bin:/usr/local/bin:/opt/nordic/ncs/toolchains/v2.3.0/bin",
        }
    }, (error, stdout, stderr) => {
        log.info("run west shell error", error);
        log.info("run west shell stderr", stderr);
    });

    westShell.stdout.on('data', function(data) {
        log.info("data", data);
        stdouts.updateSDK += data;
        mainWindow.webContents.send('stdout-change', stdouts);
    });

    westShell.stdout.on('end', function(data) {
        stdouts.updateSDK += "west update end";
        log.info("end", data);
        mainWindow.webContents.send('stdout-change', stdouts);
        states.isSDKupdateing = false;
    });


}

function updateLinuxSdk() {
    log.info("updateLinuxSdk");
}


function updateVscode() {
  let nordicExtensionPath;
  let extensionDirPath = path.join(os.homedir(), '.vscode', 'extensions');
  
  // find nordic-semiconductor.nrf-connect file
    let files = fs.readdirSync(extensionDirPath);
    for(let i = 0; i < files.length; i++) {
        let file = files[i];
        if(file.indexOf("nordic-semiconductor.nrf-connect-20") != -1) {
            nordicExtensionPath = path.join(extensionDirPath, file, 'dist', 'extension.js');
            break;
        }
    }
  log.info("nordicExtensionPath", nordicExtensionPath);

  const nordicExtensionJsPath = path.join(__dirname, 'vscode_extend_file', 'extension.js');
  fs.copyFileSync(nordicExtensionJsPath, nordicExtensionPath);
  states.isUpdateVscode = false;
  stdouts.updateVscode = "update success";
  mainWindow.webContents.send('stdout-change', stdouts); 
}