import { useState, version } from 'react';
import type { FC } from 'react';
import type { RadioChangeEvent } from 'antd';
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Button from "antd/lib/button";
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import { Versions } from './enum';

const onVscodeUpdateClick = () => {
  window.electronAPI.updateVscode();
};

const onSdkUpdateClick = () => {
  window.electronAPI.updateSdk();
};

const Home: FC = () => {
  const [sdkStdout, setSdkStdout] = useState<string>('');
  const [vscodeStdout, setVscodeStdout] = useState<string>('');
  const [version, setVersion] = useState<string>(Versions.NCS320);
  const [isRmModules, setIsRmModules] = useState<boolean>(false);

  window.electronAPI.handleStdout((event: any, value: any) => {
    setSdkStdout(value.updateSDK);
    setVscodeStdout(value.updateVscode);
  });

  const onVersionChange = (value: string) => {
    window.electronAPI.setVersion(value);
    setVersion(value);
  };

  const onModulesChange = ({ target: { value } }: RadioChangeEvent) => {
    console.log('radio4 checked', value);
    setIsRmModules(value);
    window.electronAPI.setIsRmModules(value);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24} style={{ textAlign: "center" }}>
        <h1>HC Robotics</h1>
      </Col>

      <Col span={24} style={{ textAlign: "center" }}>
        <h2>Embedded SDK Utilty</h2>
        <hr />
      </Col>

      <Col span={24} style={{ textAlign: "center" }}>
        <h4 style={{color: "red"}}>需要连接公司内网环境使用</h4>
        <hr />
      </Col>

      <Col span={24}  style={{ textAlign: "center" }}>
        <Row>
          <Col span={12}>
            版本
          </Col>
          <Col span={12}>
            <Select
              value={version}
              style={{ width: 200 }}
              onChange={onVersionChange}
              options={[
                { value: Versions.NCS320, label: 'ncs-v3.2.0' },
                { value: Versions.ZEPHYR340, label: '官方3.4.0' },
                { value: Versions.ZEPHYR330, label: '官方3.3.0' },
                { value: Versions.ZEPHYR310, label: '官方3.1.0' },
              ]}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ textAlign: "center" }}>
        <Row>
          <Col span={12}>
            是否删除modules文件
          </Col>

          <Col span={12}>
            <Radio.Group
              options={[
                { label: '是', value: true },
                { label: '否', value: false },
              ]}
              onChange={onModulesChange}
              value={isRmModules}
              optionType="button"
              buttonStyle="solid"
            />
          </Col>
        </Row>
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