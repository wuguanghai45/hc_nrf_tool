import { useState } from 'react';
import type { FC } from 'react';
import { Row, Col, Button } from 'antd';

const onVscodeUpdateClick = () => {
  window.electronAPI.updateVscode();
};

const onSdkUpdateClick = () => {
  window.electronAPI.updateSdk();
};

const Home: FC = () => {
  const [sdkStdout, setSdkStdout] = useState<string>('');
  const [vscodeStdout, setVscodeStdout] = useState<string>('');

  window.electronAPI.handleStdout((event: any, value: any) => {
    setSdkStdout(value.updateSDK);
    setVscodeStdout(value.updateVscode);
  })


  return (
    <Row gutter={[16, 16]}>
      <Col span={24} style={{ textAlign: "center" }}>
        <h1>HC Robotics</h1>
      </Col>

      <Col span={24} style={{ textAlign: "center" }}>
        <h2>Embedded SDK Utilty</h2>
      </Col>

      <Col span={12} style={{ textAlign: "center" }}>
        <Row>
          <Col span={24}>
            <Button onClick={onVscodeUpdateClick} size="large" type="primary">更新vscode插件</Button>
          </Col>
          <Col span={24}>
            <pre style={{textAlign: "left"}}>{vscodeStdout}</pre>
          </Col>
        </Row>
      </Col>

      <Col span={12} style={{ textAlign: "center" }}>
        <Row>
          <Col span={24}>
            <Button onClick={onSdkUpdateClick} size='large' type="primary">更新SDK组件</Button>
          </Col>
          <Col span={24}>
            <pre style={{textAlign: "left"}}>{sdkStdout}</pre>
          </Col>
        </Row>
      </Col>

    </Row>
  )
};

export default Home;