/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable jsx-a11y/media-has-caption */
import "./profile.css";

import React, { useEffect, useRef } from "react";
import type { MenuProps } from "antd";
import { connect, ConnectedProps } from "react-redux";
import {
  Row,
  Col,
  Layout,
  Card,
  Button,
  Descriptions,
  Badge,
  Avatar,
  Dropdown,
  Modal,
  Form,
  Input,
} from "antd";
import { PageHeader } from "@ant-design/pro-components";
import {
  EditOutlined,
  CameraOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import defaultProfilePic from "../../assets/default_profile_pic.png";
import {
  FAILURE_MESSAGE,
  PROFILE_PIC_UPDATED,
  SUCCESS_MESSAGE,
  VIDEO_NAME_CHANGED,
  VIDEO_NAME_REQUIRED,
  VIDEO_UPDATED,
} from "../../constants/messages";
import { useNavigate } from "react-router-dom";
import {
  changeVideoNameAction,
  convertVideoAction,
  getVideoAction,
  uploadProfilePicAction,
  uploadVideoAction,
} from "../../actions/profileActions";
import responseTypes from "../../constants/responseTypes";

const { Content } = Layout;
const { Meta } = Card;

interface UserData {
  name: string;
  email: string;
  number: string;
  accessToken: string;
}

interface ProfileData {
  profilePicData?: string;
  videoName?: string;
  videoId?: string;
  videoData?: string;
}

interface ProfileProps {
  profileData: ProfileData;
  userData: UserData;
}

type PropsFromRedux = ConnectedProps<typeof connector> & ProfileProps;

const Profile: React.FC<PropsFromRedux> = (props) => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [hasErrored, setHasErrored] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const picInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoData, setVideoData] = React.useState<string | null>(null);

  const {
    userData,
    profileData,
    uploadProfilePic,
    uploadVideo,
    changeVideoName,
    convertVideo,
    getVideo,
  } = props;

  useEffect(() => {
    const callback = (res: string, data: any) => {
      if (res === responseTypes.SUCCESS) {
        setVideoData(data.profileVideo);
      } else {
        console.log("Error getting video", data);
      }
    };
    getVideo({
      accessToken: userData.accessToken,
      videoId: profileData.videoId,
      callback,
    });
  }, [userData.accessToken, profileData.videoId, getVideo]);

  const menuItems = () => {
    const items: Array<{
      label: string;
      key: string;
      icon: React.JSX.Element;
    }> = [];
    if (videoData) {
      items.push({
        label: "Change Video",
        key: "1",
        icon: <UserOutlined />,
      });
      items.push({
        label: "Change Video Name",
        key: "2",
        icon: <UserOutlined />,
      });
      items.push({
        label: "Share Video with Community",
        key: "3",
        icon: <UserOutlined />,
      });
    }
    return items;
  };

  const handleUploadProfilePic = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const callback = (res: string, data: any) => {
      if (res === responseTypes.SUCCESS) {
        Modal.success({
          title: SUCCESS_MESSAGE,
          content: PROFILE_PIC_UPDATED,
        });
      } else {
        Modal.error({
          title: FAILURE_MESSAGE,
          content: data,
        });
      }
    };
    uploadProfilePic({
      callback,
      accessToken: userData.accessToken,
      file: event.target.files?.[0],
    });
  };

  const handleUploadVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const callback = (res: string, data: any) => {
      if (res === responseTypes.SUCCESS) {
        Modal.success({
          title: SUCCESS_MESSAGE,
          content: VIDEO_UPDATED,
        });
      } else {
        Modal.error({
          title: FAILURE_MESSAGE,
          content: data,
        });
      }
    };
    uploadVideo({
      accessToken: userData.accessToken,
      callback,
      file: event.target.files?.[0],
    });
  };

  const handleChangeVideoName = (values: any) => {
    const callback = (res: string, data: any) => {
      if (res === responseTypes.SUCCESS) {
        setIsVideoModalOpen(false);
        Modal.success({
          title: SUCCESS_MESSAGE,
          content: VIDEO_NAME_CHANGED,
        });
        setVideoData(data.profileVideo);
      } else {
        setHasErrored(true);
        setErrorMessage(data);
      }
    };
    changeVideoName({
      accessToken: userData.accessToken,
      callback,
      videoId: profileData.videoId,
      ...values,
    });
  };

  const shareVideoWithCommunity = (videoId: string) => {
    const callback = (res: any, data: any) => {
      Modal.error({
        title: FAILURE_MESSAGE,
        content: data,
      });
    };
    convertVideo({ accessToken: userData.accessToken, videoId, callback });
  };

  const takeVideoAction: MenuProps["onClick"] = (e) => {
    console.log("Video Action", e);
    if (e.key === "1" && videoInputRef.current) videoInputRef.current.click();
    if (e.key === "2") setIsVideoModalOpen(true);
    if (e.key === "3") shareVideoWithCommunity(profileData.videoId || "");
  };

  const handleUploadVideoAction = () => {
    videoInputRef.current?.click();
  };

  const MenuProps = {
    onClick: takeVideoAction,
    items: menuItems(),
  };

  const renderChangePicButton = () => (
    <Button
      type="primary"
      shape="round"
      icon={<CameraOutlined />}
      size="large"
      onClick={() => picInputRef.current?.click()}
    />
  );

  const renderProfileDescription = () => (
    <Row gutter={[60, 20]}>
      <Col flex="200px">
        <Badge offset={[0, 200]} count={renderChangePicButton()}>
          <input
            type="file"
            hidden
            ref={picInputRef}
            accept="image/*"
            onChange={handleUploadProfilePic}
          />
          <Avatar
            shape="square"
            size={{ xs: 200, sm: 229, md: 240, lg: 260, xl: 280, xxl: 300 }}
            src={profileData.profilePicData || defaultProfilePic}
          />
        </Badge>
      </Col>
      <Col flex="600px">
        <Descriptions column={1}>
          <Descriptions.Item label="Name">{userData.name}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {userData.email}
            <Button
              type="primary"
              shape="round"
              className="change-email-btn"
              icon={<EditOutlined />}
              onClick={() => navigate("/change-email")}
            >
              Change email
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Phone No.">
            {userData.number}
            <Button
              type="primary"
              shape="round"
              className="change-phone-number-btn"
              icon={<EditOutlined />}
              onClick={() => navigate("/change-phone-number")}
            >
              Change phone number
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );

  const renderVideo = () => (
    <Row gutter={[60, 20]}>
      <Col span={24}>
        <>
          <video controls className="profile-video" key={videoData || ""}>
            <source src={videoData || ""} type="video/mp4" />
          </video>
        </>
      </Col>
    </Row>
  );

  return (
    <Layout className="page-container">
      <PageHeader title="Your Profile" className="profile-header" />
      <Content>
        <Card>
          <Meta description={renderProfileDescription()} />
        </Card>
        <PageHeader
          className="profile-header"
          title="My Personal Video"
          subTitle="Max File Size: 10MB"
          extra={[
            videoData ? (
              <Dropdown.Button
                menu={MenuProps}
                key="drop-down"
                onClick={handleUploadVideoAction}
              >
                <VideoCameraOutlined />
              </Dropdown.Button>
            ) : (
              <Button
                type="primary"
                shape="round"
                icon={<VideoCameraOutlined />}
                size="large"
                onClick={() => videoInputRef.current?.click()}
              >
                Upload Video
              </Button>
            ),
          ]}
        />
        <input
          type="file"
          hidden
          ref={videoInputRef}
          accept="video/*"
          onChange={handleUploadVideo}
        />
        {videoData && (
          <Card>
            <Meta description={renderVideo()} />
          </Card>
        )}
      </Content>
      <Modal
        title="Enter new Video Name"
        visible={isVideoModalOpen}
        footer={null}
        onCancel={() => setIsVideoModalOpen(false)}
      >
        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={handleChangeVideoName}
        >
          <Form.Item
            name="videoName"
            initialValue={profileData.videoName}
            rules={[{ required: true, message: VIDEO_NAME_REQUIRED }]}
          >
            <Input placeholder="Car Video Name" />
          </Form.Item>
          <Form.Item>
            {hasErrored && <div className="error-message">{errorMessage}</div>}
            <Button type="primary" htmlType="submit" className="form-button">
              Change Video Name
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

const mapDispatchToProps = {
  uploadProfilePic: uploadProfilePicAction,
  uploadVideo: uploadVideoAction,
  changeVideoName: changeVideoNameAction,
  convertVideo: convertVideoAction,
  getVideo: getVideoAction,
};

const mapStateToProps = ({
  userReducer,
  profileReducer,
}: {
  userReducer: UserData;
  profileReducer: ProfileData;
}) => {
  return { userData: userReducer, profileData: profileReducer };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(Profile);
